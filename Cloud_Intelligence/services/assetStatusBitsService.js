//! THIS FILE IS DEPRECATED AND NOT USED
const db = require("../db");
const { getDeviceTypeNameFromAssetType } = require("../utils/constants");
const { exeQuery } = require("../pg");

class AssetStatusBitsService {
  async handler(payload) {
    this.payload = payload;
    try {
      // await this.pgWrite.connect();
      return await this.processEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error AssetStatusBitsService handler..!!",
        err
      );
    }
  }

  async processEvent() {
    try {
      const updateMeta = await this.getUpdateMeta();
      const assetInfo = await this.mapInfo(updateMeta);
      //assetInfo.multipleSites = await notificationService.checkProjectSites(this.client,assetInfo.project_id);
      let assetName = this.getAssetName(assetInfo);
      assetInfo.asset_name = assetName;
      console.log("ASSETINFO: ", assetInfo);

      await updateNCCommandedStateAlert(payload, updateMeta);

      await handleNoCommunicationWithNC(payload, assetInfo);

      await handleLowBatteryAutoStow(payload, assetInfo);

      await handleChargerFault(payload, assetInfo);

      await handleLowTemperatureRestrictedMovement(
        payload,
        assetInfo
      );

      await handleMotorCurrentSoftwareFault(
        payload,
        assetInfo
      );


      await handleMotorFaultTimeout(payload, assetInfo);

      await handleMotorCurrentHardwareFault(
        payload,
        assetInfo
      );

      if (assetInfo.is_status_bits_notify) {
        await handleEmergencyStop(payload, assetInfo);
      } else {
        console.log("SITE Notification Disabled");
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error processEvent..!!", err);
    }
  }
  async getUpdateMeta() {
    try {
      console.log("getUpdateMeta ", this.payload.asset_id);
      let result = await exeQuery(db.siteInfoByAssetId, [ this.payload.asset_id ]);
      console.log("Res: ", result.rows);
      return result.rows[0];
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getUpdateMeta..!!", err);
    }
  }

  mapInfo(data) {
    let assetInfo = {};
    console.log("ASSET_BITS_INFO: ", data);
    assetInfo.is_status_bits_notify = data.is_notify;
    assetInfo.site_id = data.site_id;
    assetInfo.site_name = data.site_name;
    assetInfo.device_type = getDeviceTypeNameFromAssetType(data.asset_type);
    assetInfo.location_lat = data.location_lat;
    assetInfo.location_lng = data.location_lng;
    assetInfo.asset_name = data.asset_name;
    assetInfo.project_name = data.project_name;
    assetInfo.project_id = data.project_id;
    assetInfo.project_location = data.project_location;
    assetInfo.status_bits = data.asset_status_bits;

    return assetInfo;
  }

  getAssetName(assetInfo) {
    let name =
      assetInfo.asset_name !== null
        ? assetInfo.asset_name
        : assetInfo.device_type;
    return name;
  }

  getStatusBit(status) {
    let arr = [];
    [1, 2, 4, 8, 16, 32, 64, 128].forEach(item => {
      if ((item & status) === item) {
        arr = [...arr, item];
      }
    });
    return arr;
  }
  async handleBits(payload, assetInfo) {
    console.log("handleLowBatteryAutoStow");
    const statusBitsList = this.getStatusBit(payload.status_bits);
    let promises = [];
    statusBitsList.forEach(async item => {
      promises.push(this.processLocalError(payload, assetInfo, item));
    });

    Promise.all(promises)
      .then(data => {
        console.log("ALERT: ", data);
      })
      .catch(excep => {
        console.log("ALERT: ", excep);
      });
    //check already alert generated
    const checkAlert = await this.getActiveAlert(payload, assetInfo, bit);

    try {
      if (containsLowBatteryStow(statusBitsList)) {
        //check already alert generated
        //if not add new alert else ignore
        if (checkAlert.rows.length === 0) {
          //add new alert
          await addAlert(payload, assetInfo, bit);
          //add event log
          await addEventLog(payload, assetInfo, bit);
        }
      } else {
        //if created flag inactive it
        if (checkAlert.rows.length > 0) {
          //flag it inactive
          await clearAlert(payload, checkAlert.rows[0].id);
        }
      }
    } catch (exception) {
      console.log("Exception in LowBatteryStow ", exception);
    }
  }

  async getActiveAlert(payload, assetInfo, bit) {
    return await exeQuery(checkAlertQuery, [
      payload.asset_id,
      assetInfo.device_type === "Network Controller"
        ? "NC-" + this.getEventName(bit)
        : "ASSET-" + this.getEventName(bit)
    ]);
  }
  async processLocalError(payload, assetInfo, bit) {
    //check alert
    const checkAlert = await this.getActiveAlert(payload, assetInfo, bit);
    if (checkAlert) {
    }
  }

  getEventName(bit) {
    const EVENT_NAMES = {
      1: "NO-CONNECTION_WITH_NC",
      2: "MOTOR-CURRENT-HW-FAULT",
      4: "MOTOR-FAULT-TIMEOUT",
      8: "CHARGER_FAULT",
      16: "MOTOR-CURRENT_SW_FAULT",
      32: "LOW-BATTERY_STOW",
      64: "LOW-TEMP_RESTRICTED_MOVEMENT",
      128: "ESTOP-Engaged",
      821: "ESTOP-Disengaged"
    };

    return EVENT_NAMES[bit];
  }

  getEventMsg(bit) {
    const EVENT_MSG = {
      1: "Cannot communicate with Network Controller",
      2: "Motor Current Fault Detected (HW)",
      4: "Motor Fault Detected (Timeout)",
      8: "Charger Fault",
      16: "Motor Current Fault Detected (SW)",
      32: "Low Battery Auto Stow",
      64: "Low Temperature Restricted Movement",
      128: "Emergency Stop Button Engaged",
      821: "Emergency Stop button Disengaged"
    };
    return EVENT_MSG[bit];
  }

  getEventIon(bit) {
    const EVENT_ICONS = {
      1: "mode_tracking_fault",
      2: "mode_tracking_fault",
      4: "mode_maintenance",
      8: "battery_damage",
      16: "mode_tracking_fault",
      32: "battery_low",
      64: "mode_tracking_fault",
      128: "mode_tracking_engaged",
      821: "mode_tracking"
    };
    return EVENT_ICONS[bit];
  }
}

exports.assetStatusBitsService = new AssetStatusBitsService();
