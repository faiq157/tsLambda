const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const db = require("../db");
const util = require("../util");
const { getIdsHelper } = require("../utils/helpers/getIdsHelper");
const { exeQuery } = require("../utils/lib/pg");
const motorRuntime = require("../models/motor.runtime.model");
const helpers = require('../utils/helpers/functions');
const { AccumulatorModes } = require("../utils/constants");
const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const {updateRadioData} = require("../models/radio.info.model");

class TcDayUpdatesService {
  async handler(
    terrasmart_cloud_pb,
    netCtrlId,
    ncSnapAddr,
    pbUpdate
  ) {
    console.log(" tcDayUpdates Handler ..");
    // console.log("Update: ", pbUpdate);
    // this.terrasmart_cloud_pb = terrasmart_cloud_pb;
    this.tcDayUpdate = pbUpdate;
    this.snapAddr = this.tcDayUpdate.getTcSnapAddr_asU8();
    this.snapAddrStr = helpers.getSnapAddr(this.snapAddr);

    try {

      const assetDetail = await getAssetBySnapAddr(this.snapAddrStr);

      const commonUpdate_res = await this.commonUpdate(
        this.tcDayUpdate,
        ncSnapAddr,
        netCtrlId
      );
      console.log("CommonUpdates response :", commonUpdate_res);
      this.assetId = commonUpdate_res.assetId;

      for (let accumUpdate of this.tcDayUpdate.getUpdatesList()) {
        switch (accumUpdate.getType()) {
          case AccumulatorModes.ANGULAR_ERROR:
            if (assetDetail?.repeater_only) {
              continue
            }
            if (commonUpdate_res.rackId) {
              let insertAngularErr_res = await this.insertAngularErr(
                accumUpdate,
                commonUpdate_res.rackId
              );
              console.log("query response :", insertAngularErr_res.rowCount);
            } else {
              console.log(
                "In angularError case, no insertion because of no rackId"
              );
            }
            break;

          case AccumulatorModes.BATT:
            if (commonUpdate_res.batteryId) {
              let insertBattPow_res = await this.insertBattPow(
                accumUpdate,
                commonUpdate_res.batteryId
              );
              console.log("query response :", insertBattPow_res.rowCount);
              await this.sendBattPowToElasticSearch(
                accumUpdate,
                commonUpdate_res.batteryId
              );
            } else {
              console.log(
                "In battPower case, no insertion because of no battId"
              );
            }
            break;

          case AccumulatorModes.CHARGER:
            if (commonUpdate_res.chargerId) {
              let insertChargerPow_res = await this.insertChargerPow(
                accumUpdate,
                commonUpdate_res.chargerId
              );
              console.log("query response :", insertChargerPow_res.rowCount);
            } else {
              console.log(
                "In chargerPower case, no insertion because of no chargerId"
              );
            }
            break;

          case AccumulatorModes.MOTOR:
            if (assetDetail?.repeater_only) {
              continue
            }
            if (commonUpdate_res.motorId) {
              let insertMotorPow_res = await this.insertMotorPow(
                accumUpdate,
                commonUpdate_res.motorId
              );
              console.log("query response :", insertMotorPow_res.rowCount);
              await this.sendMotorPowToElasticSearch(
                accumUpdate,
                commonUpdate_res.motorId
              );
            } else {
              console.log(
                "In motorPower case, no insertion because of no motorId"
              );
            }
            break;

          case AccumulatorModes.PANEL:
            if (assetDetail?.repeater_only) {
              continue
            }
            if (commonUpdate_res.panelId) {
              let insertPanelPower_res = await this.insertPanelPower(
                accumUpdate,
                commonUpdate_res.panelId
              );
              console.log("query response :", insertPanelPower_res.rowCount);
              await this.sendPanelPowToElasticSearch(
                accumUpdate,
                commonUpdate_res.panelId
              );
            } else {
              console.log(
                "In panelPower case, no insertion becasuse of no panelId"
              );
            }
            break;
          case AccumulatorModes.EXTERNAL_INPUT_2:
            /** Panel External Input */
            if (commonUpdate_res.panelId) {
              let insertPanelExtPower_res = await this.insertPanelExternalInputPower(
                accumUpdate,
                commonUpdate_res.panelId
              );
              console.log("query response :", insertPanelExtPower_res.rowCount);
              await this.sendPanelExternalInputPowToElasticSearch(
                accumUpdate,
                commonUpdate_res.panelId
              );
            } else {
              console.log(
                "In panelExtPower case, no insertion becasuse of no panelId"
              );
            }
            break;

            case AccumulatorModes.MOTOR_RUNTIME:
              if (assetDetail?.repeater_only) {
                continue
              }
              if (commonUpdate_res.motorId) {
                let insertMotorRuntime_res = await this.insertMotorRuntime(
                  accumUpdate,
                  commonUpdate_res.motorId
                );
                console.log("query response :", insertMotorRuntime_res.rowCount);
                await notificationHelper.sendMotorRuntimeDayToElasticSearch(
                  accumUpdate,
                  commonUpdate_res.motorId,
                  this.assetId,
                  this.tcDayUpdate,
                  this.snapAddrStr
                 )
              } else {
                console.log(
                  "In motorRuntime case, no insertion because of no motorId"
                );
              }
              break;

          default:
            console.log("no matching case block, in default block");
        }
      }
      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in tcDayUpdatesService handler..!!"
      );
    }
  }

  async commonUpdate(tcUpdate, ncSnapAddr, net_ctrl_id) {
    console.log("In commonUpdate()");

    const assetInfo = await getAssetBySnapAddr(this.snapAddrStr);
    if (!assetInfo) {
      console.warn(`TCDayUpdateService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
      return;
    }

    const ids = await getIdsHelper.getIds(
      tcUpdate.getTcSnapAddr_asU8(),
      ncSnapAddr,
      net_ctrl_id
    );
    const radioUpdate = await updateRadioData(
      assetInfo.id,
      ids.radioId,
      tcUpdate.getWhen().toDate(),
      tcUpdate.getPollsSent(),
      tcUpdate.getPollsReceived(),
      tcUpdate.getLinkQuality(),
      tcUpdate.getMeshDepth(),
      this.snapAddrStr
    );
    console.log("Update Radio Resp: ", radioUpdate);

    let info = {
      timestamp: tcUpdate.getWhen().toDate(),
      radio_id: ids.radioId,
      polls_sent: tcUpdate.getPollsSent(),
      polls_recv: tcUpdate.getPollsReceived(),
      link_quality: util.linkQualitydBmToPercent(tcUpdate.getLinkQuality()),
      mesh_depth: tcUpdate.getMeshDepth(),
      asset_id: ids.assetId,
      channel: "radio_hist",
      type: "elastic_search-1",
    };
    console.log("_RADIO_INFO ", info);
    if (process.env.NODE_ENV !== "test") {
      await notificationHelper.sendNotification(info);
    } else {
      console.log("  !!! Not sending the data to ES bcz of test env !!!");
    }

    await updateAssetLastActivity(
      this.tcDayUpdate.getWhen().toDate(),
      assetInfo.id,
      assetInfo.last_cloud_update
    );

    return ids;
  }

  async insertAngularErr(accumUpdate, rackId) {
    console.log("insertAngularErr()");
    return await exeQuery(db.angularErrorDayInsert, [
      rackId,
      accumUpdate.getValue(),
      this.tcDayUpdate.getWhen().toDate(),
      this.tcDayUpdate.getWhen().toDate(),
    ])
    .catch((err) => {
        console.log("Error in insertAngularError query :", db.angularErrorDayInsert, [
          rackId,
          accumUpdate.getValue(),
          this.tcDayUpdate.getWhen().toDate(),
          this.tcDayUpdate.getWhen().toDate(),
        ]);
        console.error("Error in insertAngularError", err);
        throw err;
      });
  }

  async insertBattPow(accumUpdate, batteryId) {
    console.log("insertBattPow()");
    return await exeQuery(db.batteryPowerDayInsert, [
      batteryId,
      accumUpdate.getValue(),
      this.tcDayUpdate.getWhen().toDate(),
      this.tcDayUpdate.getWhen().toDate(),
    ])
    .catch((err) => {
        console.log("ERROR/Error in insertBattPow query :", db.batteryPowerDayInsert, [
          batteryId,
          accumUpdate.getValue(),
          this.tcDayUpdate.getWhen().toDate(),
          this.tcDayUpdate.getWhen().toDate(),
        ]);
        console.error("Error in insertBattPow()");
        throw err;
      });
  }

  async sendBattPowToElasticSearch(accumUpdate, batteryId) {
    try {
      let battPowDayInfo = {};
      battPowDayInfo.battery_id = batteryId;
      battPowDayInfo.total_day = accumUpdate.getValue();
      battPowDayInfo.day = this.tcDayUpdate.getWhen().toDate();
      battPowDayInfo.timestamp = this.tcDayUpdate.getWhen().toDate();
      battPowDayInfo.asset_id = this.assetId;
      battPowDayInfo.type = "elastic_search-1";
      battPowDayInfo.channel = "asset_battery_power_day";

      console.log(
        "payload(battPow) to be sent to ElasticSearch : ",
        battPowDayInfo
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(battPowDayInfo);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.error("Error in sendBattInfoToElasticSearch() .. ");
      throw err;
    }
  }

  async insertChargerPow(accumUpdate, chargerId) {
    console.log("insertChargerPow()");
    return await exeQuery(db.chargerPowerDayInsert, [
      chargerId,
      accumUpdate.getValue(),
      this.tcDayUpdate.getWhen().toDate(),
      this.tcDayUpdate.getWhen().toDate(),
    ])
    .catch((err) => {
        console.log("ERROR/Error in insertChargerPow query :", db.chargerPowerDayInsert, [
          chargerId,
          accumUpdate?.getValue(),
          this?.tcDayUpdate?.getWhen()?.toDate(),
          this?.tcDayUpdate?.getWhen()?.toDate(),
        ]);
        console.error("Error in insertChargerPow()");
        throw err;
      });
  }

  async insertMotorPow(accumUpdate, motorId) {
    console.log("insertMotorPow()");
    return await exeQuery(db.motorPowerDayInsert, [
      motorId,
      accumUpdate.getValue(),
      this.tcDayUpdate.getWhen().toDate(),
      this.tcDayUpdate.getWhen().toDate(),
    ])
    .catch((err) => {
        console.log("Error in insertMotorPow query :", db.motorPowerDayInsert, [
          motorId,
          accumUpdate?.getValue(),
          this?.tcDayUpdate?.getWhen()?.toDate(),
          this?.tcDayUpdate?.getWhen()?.toDate(),
        ]);
        console.error("Error in insertMotorPow()");
        throw err;
      });
  }

  async insertMotorRuntime(accumUpdate, motorId) {
    return motorRuntime.addMotorRuntimeDay(
      motorId,
      accumUpdate.getValue(),
      this.tcDayUpdate.getWhen().toDate(),
      this.tcDayUpdate.getWhen().toDate()
    )
  }

  async sendMotorPowToElasticSearch(accumUpdate, motorId) {
    try {
      let motorPowDayInfo = {};
      motorPowDayInfo.motor_id = motorId;
      motorPowDayInfo.total_day = accumUpdate.getValue();
      motorPowDayInfo.day = this.tcDayUpdate.getWhen().toDate();
      motorPowDayInfo.timestamp = this.tcDayUpdate.getWhen().toDate();
      motorPowDayInfo.asset_id = this.assetId;
      motorPowDayInfo.type = "elastic_search-1";
      motorPowDayInfo.channel = "asset_motor_power_day";

      console.log(
        "payload(motorPow) to be sent to ElasticSearch : ",
        motorPowDayInfo
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(motorPowDayInfo);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.error("Error in sendMotorPowToElasticSearch() .. ");
      throw err;
    }
  }

  async insertPanelExternalInputPower(accumUpdate, panelId) {
    console.log("insertPanelExtPower()");
    return await exeQuery(db.panelExternalInputPowerDayInsert, [
      panelId,
      accumUpdate.getValue(),
      this.tcDayUpdate.getWhen().toDate(),
      this.tcDayUpdate.getWhen().toDate(),
    ])
    .catch((err) => {
        console.error("Error in insertPanelExtPower()", err);
        console.log("Error in insertPanelExtPower query :", db.panelExternalInputPowerDayInsert, [
          panelId,
          accumUpdate?.getValue(),
          this?.tcDayUpdate?.getWhen()?.toDate(),
          this?.tcDayUpdate?.getWhen()?.toDate(),
        ]);
        throw err;
      });
  }
  async sendPanelExternalInputPowToElasticSearch(accumUpdate, panelId) {
    try {
      let panelPowDayInfo = {};
      panelPowDayInfo.panel_id = panelId;
      panelPowDayInfo.total_day = accumUpdate.getValue();
      panelPowDayInfo.day = this.tcDayUpdate.getWhen().toDate();
      panelPowDayInfo.timestamp = this.tcDayUpdate.getWhen().toDate();
      panelPowDayInfo.asset_id = this.assetId;
      panelPowDayInfo.type = "elastic_search-1";
      panelPowDayInfo.channel = "asset_panel_external_input_power_day";

      console.log(
        "payload(panelExtPow) to be sent to ElasticSearch : ",
        panelPowDayInfo
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(panelPowDayInfo);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.error("Error in sendPanelExtPowToElasticSearch() .. ");
      throw err;
    }
  }
  async insertPanelPower(accumUpdate, panelId) {
    console.log("insertPanelPower()");
    return await exeQuery(db.panelPowerDayInsert, [
      panelId,
      accumUpdate.getValue(),
      this.tcDayUpdate.getWhen().toDate(),
      this.tcDayUpdate.getWhen().toDate(),
    ])
    .catch((err) => {
        console.error("Error in insertPanelPower()", err);
        console.log("Error in insertPanelPower query :", db.panelPowerDayInsert, [
          panelId,
          accumUpdate.getValue(),
          this.tcDayUpdate.getWhen().toDate(),
          this.tcDayUpdate.getWhen().toDate(),
        ]);
        throw err;
      });
  }

  async sendPanelPowToElasticSearch(accumUpdate, panelId) {
    try {
      let panelPowDayInfo = {};
      panelPowDayInfo.panel_id = panelId;
      panelPowDayInfo.total_day = accumUpdate.getValue();
      panelPowDayInfo.day = this.tcDayUpdate.getWhen().toDate();
      panelPowDayInfo.timestamp = this.tcDayUpdate.getWhen().toDate();
      panelPowDayInfo.asset_id = this.assetId;
      panelPowDayInfo.type = "elastic_search-1";
      panelPowDayInfo.channel = "asset_panel_power_day";

      console.log(
        "payload(panelPow) to be sent to ElasticSearch : ",
        panelPowDayInfo
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(panelPowDayInfo);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.error("Error in sendPanelPowToElasticSearch() .. ");
      throw err;
    }
  }
}

exports.tcDayUpdatesService = new TcDayUpdatesService();
