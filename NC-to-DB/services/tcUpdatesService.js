const { NCTCMismatchException } = require('../utils/customExceptions');
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { getIdsHelper } = require("../utils/helpers/getIdsHelper");
const { getSnapAddr } = require("../utils/helpers/functions")
const db = require("../db");
const util = require("../util");
const { exeQuery } = require("../utils/lib/pg");
const { acquireLock } = require("../utils/lib/distributedLock");
const {
  assetStatus,
  trackingStatus,
  assetStatusValue,
  assetStatusValTextMapping,
  cloudAlertEventNames,
  assetStatusBits,
} = require("../utils/constants");
const { addFasttrakReport, addFasttrakHist, updateFasttrakEndTime } = require('../models/fasttrak.model');
const {
  updateAssetStatus,
  getAssetLayoutBySnapAddr,
  getAssetBySnapAddr,
  updateAssetGeneric,
} = require("../models/asset.model");
const { checkCloudAlertExist, addMobileFasttrakAlert, removeCloudAlert, removeCloudAlertDetail } = require('../models/cloudAlert.model');
const { createMobileFasttrakCloudEventLog } = require('../models/cloudEventLog.model');
const { sendMobileQCNotifications } = require('./notificationService');
class TcUpdatesService {
  /**
   *
   * @param {network controller id} net_ctrl_id
   * @param {network controller snapAddr} ncSnapAddr
   * @param {tcUpdate Object} pbUpdate
   * @returns true/false
   */
  async handler(net_ctrl_id, ncSnapAddr, pbUpdate) {
    try {
      console.log("In TcUpdatesService Handler");

      this.tcUpdate = pbUpdate;
      this.ncSnapAddr = ncSnapAddr;
      this.tcSnapAddr = pbUpdate.getTcSnapAddr_asU8();
      this.snapAddrStr = getSnapAddr(this.tcSnapAddr);

      // if the asset is repeater // ignore this update
      const assetDetail = await getAssetBySnapAddr(this.snapAddrStr);

      //get & check asset info in db
      const ids = await getIdsHelper.getIds(
        this.tcUpdate.getTcSnapAddr_asU8(),
        ncSnapAddr,
        net_ctrl_id
      );
      //console.log("getIds_res : ", ids);

      let asset_id = ids.assetId;

      // Check if the current asset status is unknown and the new status is offline
      const isCurrentStatusUnknownAndNewStatusOffline = 
          (assetDetail?.reporting === assetStatusValTextMapping[3] && 
           this.tcUpdate.getAssetStatus() === assetStatusValue.OFFLINE);

      if (isCurrentStatusUnknownAndNewStatusOffline) {
        console.log("UNKNOWN - OFFLINE scenario, Current asset status is unknown and the new status is offline", assetDetail);
      }

      //process update query to update assetReportingStatus
      let assetInfo = await this.assetStatusUpdate(asset_id, isCurrentStatusUnknownAndNewStatusOffline);
      console.log("ASSET INFO: ", assetInfo, {isCurrentStatusUnknownAndNewStatusOffline});

      if (assetDetail?.repeater_only) {
        console.info("In TcUpdatesService Ignoring repeater update,", this.snapAddrStr);
        return null
      }

      if (!assetInfo) {
        //handle out of order entry
        console.log("Out of order entry");
        assetInfo = await getAssetBySnapAddr(this.snapAddrStr);
        await this.sendConnInfoToES(asset_id, this.tcSnapAddr);

      } else {

        //process asset update
        let parent_nc_id = assetInfo.parent_network_controller_id;
        //add assetHistory
        await this.sendConnInfoToES(asset_id, this.tcSnapAddr);
        //process Fasttrak report
        await this.updateFasttrakReport(net_ctrl_id, assetInfo);
        //update row status bit & trigger cloud intelligence for local error notifications
        if (this.tcUpdate.getAssetStatus() !== 3) {
          await this.updateRowStatusBit(asset_id);
          //handle fasttrak report scenario
        } else {
          console.log(
            "No local error should be processed when status is UNKNOWN"
          );
        }

        //check & process if asset is connected to another NC at cloud
        if (parent_nc_id !== null && parent_nc_id !== net_ctrl_id) {
          console.log("WrongAssetReporting scenario")
          await this.handleWrongAssetReporintg(parent_nc_id, net_ctrl_id, asset_id);
        } else if (parent_nc_id === null) {
          if (Buffer.compare(this.tcSnapAddr, ncSnapAddr) == 0) {
            console.log("NC Non Associated AssetReporting scenario");
          } else {
            console.log("Non Associated AssetReporting scenario");
            await this.handleWrongAssetReporintg(null, net_ctrl_id, asset_id);
          }
        }
      }
      if (this.tcUpdate.getAssetStatus() != assetStatusValue.UNKNOWN) {
      //Sync mobile qc alerts, logs and notifications
      const isMobileQCConnected = checkMobileQCFlag(this.tcUpdate.getStatusBits())
      console.log('isMobileQCConnected payload',
      JSON.stringify({isMobileQCConnected,statusbit: this.tcUpdate.getStatusBits()}))
      // await this.handleMobileQcStatusChange(isMobileQCConnected, assetInfo);
      }

      // Update the row_lock status from status bits
      // Incorrectly updating row_locked status in asset table
      // the formula for bit conversion is wrong.
      // await this.updateRowLockedStatusFromBits(asset_id);

      return true;
    } catch (err) {
      console.error("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in TcUpdatesService handler..!!"
      );
    }
  }

  /**
   *
   * @param {assetInfo obj} assetInfo
   */
  async updateFasttrakReport(nc_id, assetInfo) {
    console.log("Processing updateFasttrakReport ", assetInfo);
    let siteMode = null;
    const siteModeInfoRes = await exeQuery(db.currentSiteModeQuery, [nc_id]);
    if (siteModeInfoRes.rows.length !== 0) {
      siteMode = siteModeInfoRes.rows[0].commanded_state;
    }

    if ((process.env.NODE_ENV !== 'production' &&
      this.tcUpdate.getAssetStatus() === assetStatusValue.FASTTRAK_BLUE && assetInfo.last_reporting_status !== assetStatus.FASTTRAK) ||
      (this.tcUpdate.getAssetStatus() === assetStatusValue.FASTTRAK_RED && assetInfo.last_reporting_status !== assetStatus.QC_FASTTRAK) ||
      (this.tcUpdate.getAssetStatus() === assetStatusValue.REMOTE_QC && assetInfo.last_reporting_status !== assetStatus.REMOTE_QC && assetInfo.last_reporting_status !== assetStatus.UNKNOWN)) {
      //process add/update query to update fasttrack report
      console.log("FASTTRAK: ", this.tcSnapAddr);
      await acquireLock(
        "locks:fasttrakreport:" + getSnapAddr(this.tcSnapAddr),
        3000,
        // Things to do while being in locked state
        async () => {
          //get project in construction status
          let projectConstructionStatus = await this.getAssetProjectConstructionStatus();

          if (siteMode !== null && siteMode === 8) {
            if (this.validateRightmost8Bits(assetInfo))
              await addFasttrakReport(getSnapAddr(this.tcSnapAddr), this.getTrackingStatus(),
                this.tcUpdate.getLastReported().toDate(), projectConstructionStatus);
          } else {
            await addFasttrakReport(getSnapAddr(this.tcSnapAddr), this.getTrackingStatus(),
              this.tcUpdate.getLastReported().toDate(), projectConstructionStatus);
          }

        });

    } else if (siteMode !== null && siteMode === 8 &&
      this.validateFasttrakStatusBit() && this.validateFasttrakStopStatus(assetInfo.last_reporting_status)) {
      await this.processFasttrakStop(assetInfo.last_reporting_status);

    } else if (siteMode !== null && siteMode !== 8 &&
      this.validateFasttrakStopStatus(assetInfo.last_reporting_status)) {
      await this.processFasttrakStop(assetInfo.last_reporting_status);
    }
  }

  validateFasttrakStatusBit() {
    return (this.tcUpdate.getStatusBits() !== 0 && this.tcUpdate.getStatusBits() !== 8)
  }

  validateRightmost8Bits({last_status_bits: decimalValue}) {
    // Adding Null and Undefined check, and not using !decimalValue check to allow 0
    if (decimalValue == null || decimalValue == undefined) {
      console.info("Asset last_status_bit doesn't exist");
      return false;
    }
    // Step 1: Convert the decimal value to binary
    const binaryString = decimalValue.toString(2);

    // Step 2: Extract the rightmost 8 bits
    const rightmost8Bits = binaryString.slice(-8);

    // Step 3: Convert the extracted 8 bits back to a decimal value
    const decimalValueFromBits = parseInt(rightmost8Bits, 2);

    // Step 4: Check if the decimal value matches 0x00 and 0x8
    // 0x00 represents No Fault
    // 0x8  represents Charger Fault
    const isValid = decimalValueFromBits === 0x00 || decimalValueFromBits === 0x8;
    console.log("IS Valid StatusBit: ", {decimalValue, binaryString, rightmost8Bits, decimalValueFromBits});
    return isValid;
  }

  validateFasttrakStopStatus(last_reporting_status) {
    return (this.tcUpdate.getAssetStatus() === assetStatusValue.ONLINE &&
      (last_reporting_status === assetStatus.FASTTRAK ||
        last_reporting_status === assetStatus.QC_FASTTRAK ||
        last_reporting_status === assetStatus.REMOTE_QC))
  }

  validateFasttrakStart(last_reporting_status) {
    return (process.env.NODE_ENV !== 'production' &&
      this.tcUpdate.getAssetStatus() === assetStatusValue.FASTTRAK_BLUE && last_reporting_status !== assetStatus.FASTTRAK) ||
      (this.tcUpdate.getAssetStatus() === assetStatusValue.FASTTRAK_RED && last_reporting_status !== assetStatus.QC_FASTTRAK) ||
      (this.tcUpdate.getAssetStatus() === assetStatusValue.REMOTE_QC && last_reporting_status !== assetStatus.REMOTE_QC)
  }

  async processFasttrakStop(last_reporting_status) {
    console.log('Processing end time ', 'snap ', getSnapAddr(this.tcSnapAddr), ' ', last_reporting_status);
    //update endtime for QC Fasttrak
    await acquireLock("locks:fasttrakreport:" + getSnapAddr(this.tcSnapAddr), 3000,
      // Things to do while being in locked state
      async () => {
        await updateFasttrakEndTime(getSnapAddr(this.tcSnapAddr), this.tcUpdate.getLastReported().toDate());
      });
    //history for remote QC handle in qaqc report update

    if (last_reporting_status !== assetStatus.REMOTE_QC) {
      //add history
      if ((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') &&
        last_reporting_status !== assetStatus.FASTTRAK && last_reporting_status !== assetStatus.REMOTE_QC) {
        await addFasttrakHist(getSnapAddr(this.tcSnapAddr));
      } else if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging' && last_reporting_status !== assetStatus.REMOTE_QC) {
        await addFasttrakHist(getSnapAddr(this.tcSnapAddr));
      }
    }
  }

  async getAssetProjectConstructionStatus() {
    try {
      let projectConstructionStatus = false;
      const projectRes = await exeQuery(db.getProjectConstructionStatus, [getSnapAddr(this.tcSnapAddr)]);
      if (projectRes.rows.length !== 0) {
        projectConstructionStatus = projectRes.rows[0].is_in_construction
      }
      return projectConstructionStatus;
    } catch (error) {
      console.Error("Error in getAssetProjectConstructionStatus: ", error);
    }
  }

  /**
   *
   * @param {asset id} asset_id
   */
  async handleFastTrakDisconnected(asset_id) {
    if (this.tcUpdate.getAssetStatus() === 1) {
      console.log("Processing handleFastTrakDisconnected ", asset_id);
      //process update query to update assetReportingStatus
      await acquireLock(
        "locks:assetfasttrakupdate:" + util.getSnapAddress(this.tcSnapAddr),
        3000,
        // Things to do while being in locked state
        async () => {
          await exeQuery(db.updateFasttrakCurrentState, [asset_id]);
        });
    }
  }

  /**
   *
   * @param {nc id in db} parent_nc_id
   * @param {reported nc id} net_ctrl_id
   * @param {asset id} asset_id
   */
  async handleWrongAssetReporintg(parent_nc_id, net_ctrl_id, asset_id) {
    //parent_nc_id = null also handle in same scenario
    let info = {
      asset_id: asset_id,
      timestamp: this.tcUpdate.getWhen().toDate(),
      reporting_NC: net_ctrl_id,
      registered_NC: parent_nc_id,
      snap_addr: util.getSnapAddress(this.tcSnapAddr),
      channel: "asset_wrong_reporting",
      type: "elastic_search-1",
    };
    if (process.env.NODE_ENV !== "test") {
      await notificationHelper.sendNotification(info);
    } else {
      console.log("  !!! Not sending the data to ES bcz of test env !!!");
    }
  }

  /**
   * This function will update status bit in row controller tables
   * @param {assetId} asset_id
   */
  async updateRowStatusBit(asset_id) {
    await this.compareNCTCSnapAddr(
      this.tcSnapAddr,
      this.ncSnapAddr
    ).catch(async (err) => {
      if (err.name == "NCTCMismatchException") {
        await this.insertRowCtrlHistory(asset_id);

        await this.updateRowCtrl(asset_id);

        await this.sendToElasticSearch(
          this.getStatusInfo(
            "asset_status_bits_update",
            asset_id,
            this.tcSnapAddr
          )
        );
      } else {
        console.error("Error in compareNCTCSnapAddr..", err);
        throw new Error("Error in compareNCTCSnapAddr..");
      }
    });
  }

  /**
   * This function will update the row_locked status in asset table
   * from the status bits in the TC update. The row_locked status is
   * determined by the 24th bit in the status bits (0x80000 in HEX)
   */
  async updateRowLockedStatusFromBits(assetId) {
    const is_row_locked = (this.tcUpdate.getStatusBits() & assetStatusBits.ROW_LOCK) === assetStatusBits.ROW_LOCK;
    return await updateAssetGeneric({ is_row_locked }, assetId);
  }

  /**
   *
   * @param {asset SnapAddr} tcSnapAddr
   * @param {networkController SnapAddr} ncSnapAddr
   * @returns true/false
   */
  async compareNCTCSnapAddr(tcSnapAddr, ncSnapAddr) {
    if (Buffer.compare(tcSnapAddr, ncSnapAddr) == 0) {
      return true;
    } else {
      throw new NCTCMismatchException("NC TC snapAddr don't match");
    }
  }

  /**
   * inserts information in row controller history table
   * @param {assetId} id
   * @returns
   */
  async insertRowCtrlHistory(id) {
    try {
      console.log("In insertRowCtrlHistory()", id);
      console.log("query: ", db.rowCtrlHistInsert, [
        id,
        this.tcUpdate.getWhen().toDate(),
        this.getProperStatusBit(this.tcUpdate.getStatusBits()),
      ]);
      return await exeQuery(db.rowCtrlHistInsert, [
        id,
        this.tcUpdate.getWhen().toDate(),
        this.getProperStatusBit(this.tcUpdate.getStatusBits()),
      ])
        .catch((err) => {
          console.log("Error in insertRowCtrlHistory() query ..", err);
          throw err;
        });
    } catch (err) {
      console.log("Error in insertRowCtrlHistory() .. ", err);
      throw err;
    }
  }

  /**
   * update status bit information in row controller table
   * @param {assetId} id
   * @returns query results
   */
  async updateRowCtrl(id) {
    try {
      console.log("In updateRowCtrl()", id);
      console.log("query: ", db.updateRowCtrl, [
        id,
        this.tcUpdate.getWhen().toDate(),
        this.getProperStatusBit(this.tcUpdate.getStatusBits()),
      ]);
      return await exeQuery(db.updateRowCtrl, [
        id,
        this.tcUpdate.getWhen().toDate(),
        this.getProperStatusBit(this.tcUpdate.getStatusBits()),
      ])
        .catch((err) => {
          console.log("Error in updateRowCtrl() query ..", err);
          throw err;
        });
    } catch (err) {
      console.log("Error in updateRowCtrl() .. ", err);
      throw err;
    }
  }

  /**
   *
   * @param {communication channel name} channel
   * @param {assetId} asset_id
   * @param {asset snapAddr} snapAddr
   * @returns parsedResult
   */
  getStatusInfo(channel, asset_id, snapAddr) {
    console.log("In getStatusInfo()");
    let statusbit = this.getProperStatusBit(this.tcUpdate.getStatusBits());
    try {
      return {
        channel: channel,
        status_bits: statusbit,
        timestamp: this.tcUpdate.getWhen().toDate(),
        asset_id: asset_id,
        snap_addr: util.getSnapAddress(snapAddr),
      };
    } catch (err) {
      console.log("Error in getStatusInfo .. ", err, "");
      throw err;
    }
  }

  /**
   *
   * @returns get Asset reporting status
   */
  getAssetStatus() {
    return assetStatusValTextMapping[this.tcUpdate.getAssetStatus()] || assetStatusValTextMapping.NO_STATUS_MATCH
  }

  getTrackingStatus() {
    try {
      let status = null;
      switch (this.tcUpdate.getAssetStatus()) {
        case 5:
          status = trackingStatus.FASTTRAK;
          break;
        case 7:
          status = trackingStatus.QC_FASTTRAK;
          break;
        case 8:
          status = trackingStatus.REMOTE_QC;
          break;
        default:
          console.log(`Error in In this.getTrackingStatus() ..`);

      }
      return status;
    } catch (err) {
      console.log("Error in getTrackingStatus() ..", err);
      throw err;
    }
  }

  /**
   *
   * @returns updatedAssetRowInformation
   */
  assetStatusUpdate(assetId, isCurrentStatusUnknownAndNewStatusOffline) {
    const ignoreConnected = this.tcUpdate.getAssetStatus() == assetStatusValue.UNKNOWN;
    const params = [
      this.getProperStatusBit(this.tcUpdate.getStatusBits()),
      this.getAssetStatus(),
      this.tcUpdate.getLastReported().toDate(),
      this.tcUpdate.getWhen().toDate(),
      util.getSnapAddress(this.tcSnapAddr)
    ];
    if (this.tcUpdate.getAssetStatus() != assetStatusValue.UNKNOWN) {
      params.push(this.tcUpdate.getAssetStatus() != assetStatusValue.OFFLINE);
    }
    return updateAssetStatus(ignoreConnected, params, assetId, isCurrentStatusUnknownAndNewStatusOffline);
  }

  /**
   * add asset reporting information history
   * @param {assetId} asset_id
   * @param {assetSnapAddr} snapAddr
   * @param {lastReportingState} lastState
   * @returns true
   */
  async sendConnInfoToES(asset_id, snapAddr) {
    console.log("In sendConnInfoToES()");
    try {
      const connInfo = this.getConnectionInfo("asset_connection_hist", asset_id, snapAddr)
      console.log("getConnectionInfo for Elastic Search channel 'asset_connection_hist'", connInfo);
      await this.sendToElasticSearch(connInfo);

      return true;
    } catch (err) {
      console.error("Error in sendConnInfoToES..!!", err);
      throw err;
    }
  }
  /**
   *
   * @param {communication channel name} channel
   * @param {asset id} asset_id
   * @param {asset snapAddr} snapAddr
   * @returns parsedInformation
   */
  getConnectionInfo(channel, asset_id, snapAddr) {
    console.log("In getConnectionInfo()");
    try {
      return {
        channel: channel,
        connected_state: this.getAssetStatus(),
        timestamp: this.tcUpdate.getWhen().toDate(),
        last_asset_updated: this.tcUpdate.getLastReported().toDate(),
        asset_id: asset_id,
        snap_addr: util.getSnapAddress(snapAddr),
      };
    } catch (err) {
      console.error("Error in getConnectionInfo .. ", err);
      throw err;
    }
  }

  /**
   *
   * @param {asset information} params
   * @returns
   */
  async sendToElasticSearch(params) {
    params.type = "elastic_search-1";
    console.log("packet to be sent to elasticSearch..", params);
    try {
      await notificationHelper.sendNotification(params);

      return true;
    } catch (err) {
      console.error("Error in SendToElasticSearch..!!", err);
      return err;
    }
  }

  /**
   *
   * @param {bit information} status
   * @returns
   */
  statusBits(status) {
    let arr = [];
    let BITS_STATUS = {
      1: "Cannot communicate with Network Controller",
      // (This can trigger "auto-stow" for example)
      2: "Motor Current Fault Detected (HW)",
      // This is the hardware limit
      4: "Motor Fault Timeout",
      8: "Charger Fault",
      16: "Motor Current Fault Detected (SW)",
      // This is the software limit (contrast with bit 0x02)
      32: "Low Battery Auto Stow",
      // An auto-stow command coincides with this bit getting set.
      // The bit remains set until the battery has recharged past the hysteresis threshold.
      64: "Low Temperature Restricted Movement",
      // Unlike bit 0x20, this fault does not trigger an auto-stow
      // ("don't try to move": "don't try to move"!)
      128: "Emergency Stop engaged (NCCB)",
    };
    [1, 2, 4, 8, 16, 32, 64, 128].forEach((item) => {
      if ((item & status) === item) {
        arr = [...arr, BITS_STATUS[item & status]];
      }
    });
    return arr;
  }

  containsESTOPAndCurrentHarwareFault(stautsBits) {
    const statusBitsList = this.statusBits(stautsBits);
    let estop_status = false;
    statusBitsList.forEach((item) => {
      if (item === "Emergency Stop engaged (NCCB)") {
        estop_status = true;
      }
    });
    let hwcurrent_status = false;
    statusBitsList.forEach((item) => {
      if (item === "Motor Current Fault Detected (HW)") {
        hwcurrent_status = true;
      }
    });
    if (estop_status && hwcurrent_status) {
      return true;
    } else {
      return false;
    }
  }

  getProperStatusBit(status_bits) {
    let bits = status_bits;
    const status = this.containsESTOPAndCurrentHarwareFault(status_bits);
    if (status === true) {
      bits = status_bits - 2;
    }
    return bits;
  }

  /**
   * Handles changes in Mobile QC status bit.
   * @param {boolean} isMobileQcConnected - Indicates whether Mobile QC is connected (1) or disconnected (0).
   */

  async handleMobileQcStatusChange(isMobileQcConnected, asset) {
    try {
      console.log("Handling Mobile QC Status Change");
      const alertExist = await checkCloudAlertExist(asset.id, [
        cloudAlertEventNames.MOBILE_FASTTRAK,
      ]);

      if (isMobileQcConnected) {
        asset.layout= await getAssetLayoutBySnapAddr(asset.snap_addr)
        if(!alertExist){
        await this.addMobileQcAlert(asset);
        await this.addMobileQcTimeline(asset);
        await this.sendMobileQcNotification(asset);
        }
      } else {
        if(alertExist){
        await this.removeMobileQcAlert(asset);
        await this.addMobileQcTimeline(asset);
        await this.sendMobileQcNotification(asset);
        }
      }

      console.log("Mobile QC Status Change handled successfully");
    } catch (err) {
      console.error("Error handling Mobile QC Status Change:", err);
    }
  }

  async addMobileQcAlert(asset) {
      const args = {
        asset,
        command: "CONNECT",
        source: "NC"
      };
      await addMobileFasttrakAlert(args);
  }

  async removeMobileQcAlert(asset) {
    await removeCloudAlertDetail(asset.id, cloudAlertEventNames.MOBILE_FASTTRAK) //clearing child alert
    await removeCloudAlert(asset.id, cloudAlertEventNames.MOBILE_FASTTRAK);
  }

  async addMobileQcTimeline(asset) {
    const args = {
      asset,
      command: "CONNECT",
      source: "NC"
    };
    //Adding cloud event log
    await createMobileFasttrakCloudEventLog(args);
  }

  async sendMobileQcNotification(asset) {
    const { snap_addr} = asset;
    // Sending mobile qc notifications
     return sendMobileQCNotifications(snap_addr, `Mobile Fasttrak CONNECT` );
  }

}

const checkMobileQCFlag = (status) => {
  // Check if the 1048576 bit is set in the status variable
  if ((status & 1048576) === 1048576) {
    return true
  } else {
    return false;
  }
};


exports.tcUpdatesService = new TcUpdatesService();
