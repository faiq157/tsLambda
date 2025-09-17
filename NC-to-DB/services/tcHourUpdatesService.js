const {updateRadioData} = require("../models/radio.info.model");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const db = require("../db");
const { getIdsHelper } = require("../utils/helpers/getIdsHelper");
const util = require("../util");
const { exeQuery } = require("../utils/lib/pg");
const motorRuntime = require("../models/motor.runtime.model");
const helpers = require('../utils/helpers/functions');
const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const {updateRackAngularErr} = require("../models/rack.model");
const { AccumulatorModes } = require("../utils/constants");
class TcHourUpdatesService {
  async handler(
    terrasmart_cloud_pb,
    netCtrlId,
    ncSnapAddr,
    pbUpdate
  ) {
    console.log("tcHourUpdatesService Handler ..");
    // console.log("pbUpdate : ", pbUpdate);
    this.terrasmart_cloud_pb = terrasmart_cloud_pb;
    this.tcHourUpdate = pbUpdate;
    this.snapAddr = this.tcHourUpdate.getTcUpdate().getTcSnapAddr_asU8();
    this.snapAddrStr = helpers.getSnapAddr(this.snapAddr);
    try {

      const assetDetail = await getAssetBySnapAddr(this.snapAddrStr);
      const commonUpdate_res = await this.commonUpdate(
        this.tcHourUpdate.getTcUpdate(),
        ncSnapAddr,
        netCtrlId
      );
      console.log("CommonUpdate response :", commonUpdate_res);
      this.assetId = commonUpdate_res.assetId;

      for (let accumUpdate of this.tcHourUpdate
        .getTcUpdate()
        .getUpdatesList()) {
        switch (accumUpdate.getType()) {
          case AccumulatorModes.ANGULAR_ERROR:
            if (assetDetail?.repeater_only) {
              return null
            }
            if (commonUpdate_res.rackId) {
              let insertAngularErr_res = await this.insertAngularErr(
                accumUpdate,
                commonUpdate_res.rackId
              );
              console.log("query response :", insertAngularErr_res.rowCount);
              const updateRackAngularErrRes = await updateRackAngularErr(
                accumUpdate.getValue(),
                commonUpdate_res.rackId,
                this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
                this.snapAddrStr
              );
              console.log("Update Rack Angular Err Resp:", updateRackAngularErrRes);
              await this.sendAngErrToElasticSearch(
                accumUpdate,
                commonUpdate_res.rackId
              );
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
              return null
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
              return null
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
              return null
            }
            if (commonUpdate_res.motorId) {
              let insertMotorRuntime_res = await this.insertMotorRuntime(
                accumUpdate,
                commonUpdate_res.motorId
              );
              console.log("query response :", insertMotorRuntime_res.rowCount);
              await notificationHelper.sendMotorRuntimeHourToElasticSearch(
                accumUpdate,
                commonUpdate_res.motorId,
                this.assetId,
                this.tcHourUpdate,
                this.snapAddrStr
              );
            } else {
              console.log(
                "In motorPower case, no insertion because of no motorId"
              );
            }
            break;
        }
      }
      return true;
    } catch (err) {
     console.error("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in tcHourUpdatesService handler..!!"
      );
    }
  }

  async commonUpdate(tcUpdate, ncSnapAddr, net_ctrl_id) {
    console.log("commonUpdate()");

    console.log(
      "getIds,args: ",
      tcUpdate.getTcSnapAddr_asU8(),
      ncSnapAddr,
      net_ctrl_id
    );
    const ids = await getIdsHelper.getIds(
      tcUpdate.getTcSnapAddr_asU8(),
      ncSnapAddr,
      net_ctrl_id
    );

    const assetInfo = await getAssetBySnapAddr(this.snapAddrStr);
    if (!assetInfo) {
      console.warn(`TCHourUpdateService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
      return;
    }

    //console.log("getIds_res : ", ids);
    //console.log("Timestamp: ", tcUpdate.getWhen().toDate());
    try {
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
      console.log("Update Radio Resp:", radioUpdate);
    } catch (er) {
      console.error("Radio Hist insertion Issue");
    }

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
      this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
      assetInfo.id,
      assetInfo.last_cloud_update
    );

    return ids;
  }

  async insertAngularErr(accumUpdate, rackId) {
    console.log("insertAngularErr()");
    console.log("query :", db.angularErrorHourInsert, [
      rackId,
      accumUpdate.getValue(),
      this.tcHourUpdate.getHour(),
      this.tcHourUpdate.getDay().toDate(),
      this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
    ]);
    return await exeQuery(db.angularErrorHourInsert, [
        rackId,
        accumUpdate.getValue(),
        this.tcHourUpdate.getHour(),
        this.tcHourUpdate.getDay().toDate(),
        this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
      ])
      .catch((err) => {
        console.error("Error in insertAngularError");
        throw err;
      });
  }

  async insertBattPow(accumUpdate, batteryId) {
    console.log("insertBattPow()");
    console.log("query :", db.batteryPowerHourInsert, [
      batteryId,
      accumUpdate.getValue(),
      this.tcHourUpdate.getHour(),
      this.tcHourUpdate.getDay().toDate(),
      this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
    ]);
    return await exeQuery(db.batteryPowerHourInsert, [
        batteryId,
        accumUpdate.getValue(),
        this.tcHourUpdate.getHour(),
        this.tcHourUpdate.getDay().toDate(),
        this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
      ])
      .catch((err) => {
        console.error("Error in insertBattPow()");
        throw err;
      });
  }
  async sendAngErrToElasticSearch(accumUpdate, rackId) {
    try {
      let ang_err_hr_info = {};
      ang_err_hr_info.rack_id = rackId;
      ang_err_hr_info.value = accumUpdate.getValue();
      ang_err_hr_info.hour = this.tcHourUpdate.getHour();
      ang_err_hr_info.day = this.tcHourUpdate.getDay().toDate();
      ang_err_hr_info.timestamp = this.tcHourUpdate
        .getTcUpdate()
        .getWhen()
        .toDate();
      ang_err_hr_info.asset_id = this.assetId;
      ang_err_hr_info.channel = "angular_error_power_hour";
      ang_err_hr_info.type = "elastic_search-1";

      console.log(
        "payload(AngErr) to be sent to ElasticSearch : ",
        ang_err_hr_info
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(ang_err_hr_info);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.error("Error in sendAngErrToElasticSearch() .. ");
      throw err;
    }
  }
  async sendBattPowToElasticSearch(accumUpdate, batteryId) {
    try {
      let battPowHourInfo = {};
      battPowHourInfo.battery_id = batteryId;
      battPowHourInfo.total_hour = accumUpdate.getValue();
      battPowHourInfo.hour = this.tcHourUpdate.getHour();
      battPowHourInfo.day = this.tcHourUpdate.getDay().toDate();
      battPowHourInfo.timestamp = this.tcHourUpdate
        .getTcUpdate()
        .getWhen()
        .toDate();
      battPowHourInfo.asset_id = this.assetId;
      battPowHourInfo.type = "elastic_search-1";
      battPowHourInfo.channel = "asset_battery_power_hour";

      console.log(
        "payload(battPow) to be sent to ElasticSearch : ",
        battPowHourInfo
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(battPowHourInfo);
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
    console.log("query :", db.chargerPowerHourInsert, [
      chargerId,
      accumUpdate.getValue(),
      this.tcHourUpdate.getHour(),
      this.tcHourUpdate.getDay().toDate(),
      this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
    ]);
    return await exeQuery(db.chargerPowerHourInsert, [
        chargerId,
        accumUpdate.getValue(),
        this.tcHourUpdate.getHour(),
        this.tcHourUpdate.getDay().toDate(),
        this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
      ])
      .catch((err) => {
        console.error("Error in insertChargerPow()");
        throw err;
      });
  }

  async insertMotorPow(accumUpdate, motorId) {
    console.log("insertMotorPow()");
    console.log("query :", db.motorPowerHourInsert, [
      motorId,
      accumUpdate.getValue(),
      this.tcHourUpdate.getHour(),
      this.tcHourUpdate.getDay().toDate(),
      this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
    ]);
    return await exeQuery(db.motorPowerHourInsert, [
        motorId,
        accumUpdate.getValue(),
        this.tcHourUpdate.getHour(),
        this.tcHourUpdate.getDay().toDate(),
        this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
      ])
      .catch((err) => {
        console.error("Error in insertMotorPow()");
        throw err;
      });
  }

  async insertMotorRuntime(accumUpdate, motorId) {
    return motorRuntime.addMotorRuntimeHour(
      motorId,
      accumUpdate.getValue(),
      this.tcHourUpdate.getHour(),
      this.tcHourUpdate.getDay().toDate(),
      this.tcHourUpdate.getTcUpdate().getWhen().toDate()
      )
  }

  async sendMotorPowToElasticSearch(accumUpdate, motorId) {
    try {
      let motorPowHourInfo = {};
      motorPowHourInfo.motor_id = motorId;
      motorPowHourInfo.total_hour = accumUpdate.getValue();
      motorPowHourInfo.hour = this.tcHourUpdate.getHour();
      motorPowHourInfo.day = this.tcHourUpdate.getDay().toDate();
      motorPowHourInfo.timestamp = this.tcHourUpdate
        .getTcUpdate()
        .getWhen()
        .toDate();
      motorPowHourInfo.asset_id = this.assetId;
      motorPowHourInfo.type = "elastic_search-1";
      motorPowHourInfo.channel = "asset_motor_power_hour";

      console.log(
        "payload(motorPow) to be sent to ElasticSearch : ",
        motorPowHourInfo
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(motorPowHourInfo);
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
    console.log("query :", db.panelExternalInputPowerHourInsert, [
      panelId,
      accumUpdate.getValue(),
      this.tcHourUpdate.getHour(),
      this.tcHourUpdate.getDay().toDate(),
      this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
    ]);
    return await exeQuery(db.panelExternalInputPowerHourInsert, [
        panelId,
        accumUpdate.getValue(),
        this.tcHourUpdate.getHour(),
        this.tcHourUpdate.getDay().toDate(),
        this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
      ])
      .catch((err) => {
        console.error("Error in insertPanelExtPower()");
        throw err;
      });
  }
  async sendPanelExternalInputPowToElasticSearch(accumUpdate, panelId) {
    try {
      let panelPowHourInfo = {};
      panelPowHourInfo.panel_id = panelId;
      panelPowHourInfo.total_hour = accumUpdate.getValue();
      panelPowHourInfo.hour = this.tcHourUpdate.getHour();
      panelPowHourInfo.day = this.tcHourUpdate.getDay().toDate();
      panelPowHourInfo.timestamp = this.tcHourUpdate
        .getTcUpdate()
        .getWhen()
        .toDate();
      panelPowHourInfo.asset_id = this.assetId;
      panelPowHourInfo.type = "elastic_search-1";
      panelPowHourInfo.channel = "asset_panel_external_input_power_hour";

      console.log(
        "payload(panelExternalInputPow) to be sent to ElasticSearch : ",
        panelPowHourInfo
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(panelPowHourInfo);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.error("Error in sendPanelExternalPowToElasticSearch() .. ");
      throw err;
    }
  }
  async insertPanelPower(accumUpdate, panelId) {
    console.log("insertPanelPower()");
    console.log("query :", db.panelPowerHourInsert, [
      panelId,
      accumUpdate.getValue(),
      this.tcHourUpdate.getHour(),
      this.tcHourUpdate.getDay().toDate(),
      this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
    ]);
    return await exeQuery(db.panelPowerHourInsert, [
        panelId,
        accumUpdate.getValue(),
        this.tcHourUpdate.getHour(),
        this.tcHourUpdate.getDay().toDate(),
        this.tcHourUpdate.getTcUpdate().getWhen().toDate(),
      ])
      .catch((err) => {
        console.error("Error in insertPanelPower()");
        throw err;
      });
  }

  async sendPanelPowToElasticSearch(accumUpdate, panelId) {
    try {
      let panelPowHourInfo = {};
      panelPowHourInfo.panel_id = panelId;
      panelPowHourInfo.total_hour = accumUpdate.getValue();
      panelPowHourInfo.hour = this.tcHourUpdate.getHour();
      panelPowHourInfo.day = this.tcHourUpdate.getDay().toDate();
      panelPowHourInfo.timestamp = this.tcHourUpdate
        .getTcUpdate()
        .getWhen()
        .toDate();
      panelPowHourInfo.asset_id = this.assetId;
      panelPowHourInfo.type = "elastic_search-1";
      panelPowHourInfo.channel = "asset_panel_power_hour";

      console.log(
        "payload(panelPow) to be sent to ElasticSearch : ",
        panelPowHourInfo
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(panelPowHourInfo);
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

exports.tcHourUpdatesService = new TcHourUpdatesService();
