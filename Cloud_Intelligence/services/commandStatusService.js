const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
const { exeQuery } = require("../pg");
var Handlebars = require("handlebars");
const utils = require("../utils");
const { getS3EmailAssetsUrl, isLinkedRow } = require("../utils/libs/functions");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const { notificationService } = require("./common/notificationService");
const { CloudAlertsHelperModel } = require("../models/cloudAlertsHelper.model");
const { getAssetAndSiteLayoutByAssetId } = require("../models/asset.model");
const { getDeviceTypeNameFromAssetType } = require("../utils/constants");
class CommandStatusService {
  async handler(payload) {
    this.payload = payload;
    try {
      const res = await this.processEvent();
      return res;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error AssetPresetService handler..!!",
        err
      );
    }
  }

  async processEvent() {
    try {
      console.log("Processing Asset Connection Event");

      //get asset info

      //check if alert exists?
      const lastStatus = await this.getLastStatus();
      const lastState = lastStatus.status;
      let commandInfo = await this.getCommandInfo();

      if (lastState === "MANUAL CONTROL" && commandInfo !== null) {
        console.log("MANUAL CONTROL CASE ", commandInfo);
        if (commandInfo.rc_cmd_state === 3) {
          //todo update site layout

          const siteLayoutRes = await exeQuery(
            `UPDATE terrasmart.site_layout
           set last_action_completed = true, timestamp = $1::TIMESTAMP
           Where asset_id = $2::UUID`,
            [this.payload.timestamp, this.payload.assetId], { writer: true }
          );
          console.log("siteLayoutRes: ", siteLayoutRes);

          const checkUMCAlert = await this.getActiveAlert(
            "ASSET-UNDER_MANUAL_CONTROL"
          );
          if (checkUMCAlert.length > 0) {
            //clear alert
            await this.clearAlert(checkUMCAlert[0].id);
          }

          const assetInfo = await this.getAssetInfo(this.payload.assetId);
         
          const {
            linkRowType,
            linkRowRef,
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            device_type,
          } = await getAssetAndSiteLayoutByAssetId(this.payload.asset_id)
          let title = await this.getTitle(assetInfo, "MANUAL CONTROL");
          let icon = await this.getIcon(assetInfo, "MANUAL CONTROL");

          if (commandInfo.status === "Virtual EStop") {
            title = title + " Virtual Emergency Stop Engaged";
            icon = "virtual_estop";
          } else {
            title = title + ` Manual Row Control Start (${commandInfo.status})`;
          }

          if (isLinkedRow(linkRowType, linkRowRef, device_type)) {

            const leaderInfo = {
              row_id,
              row_name,
              shorthand_name,
              asset_name,
              snap_addr,
              assetId: this.payload.assetId
            };

            const childInfo = {
              row_id: linkRowRef,
            };

            const notificationsOptions = {
              isNotify: assetInfo?.is_notify,
              locationLat: assetInfo?.location_lat ,
              locationLng: assetInfo?.location_lng,
              created: this.payload.timestamp,
              deviceType: assetInfo?.device_type,
              siteId: assetInfo?.site_id,
              siteName: assetInfo?.site_name,
              multipleSites: assetInfo?.multipleSites,
              projectName: assetInfo?.project_name,
              projectLocation: assetInfo?.project_location,
            };
            await CloudAlertsHelperModel.addManualControlAlert(
              this.pgWrite,
              leaderInfo,
              childInfo,
              commandInfo.status,
              true,
              {
                userName: commandInfo.user_name,
                email: commandInfo.email,
              },
              notificationsOptions
            );
          } else {
            //add alert
            await this.addCloudAlert(
              title,
              icon,
              "ASSET-UNDER_MANUAL_CONTROL",
              {
                user_name: commandInfo.user_name,
                email: commandInfo.email,
              }
            );
            //add event log
            await this.addEventLog(title, icon, "ASSET-UNDER_MANUAL_CONTROL", {
              user_name: commandInfo.user_name,
              email: commandInfo.email,
            });
            //send notification
            assetInfo.connected_state = "MANUAL CONTROL";
            assetInfo.last_disconnected = this.payload.timestamp;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify)
              await this.processAssetsConnectionNotifications(
                assetInfo,
                false,
                commandInfo
              );
          }
          
        } else if (
          commandInfo.rc_cmd_state === 5 &&
          this.checkSameCmds(commandInfo)
        ) {
          //todo update site layout
          const siteLayoutRes = await exeQuery(
            `UPDATE terrasmart.site_layout
         set last_action_completed = true, timestamp = $1::TIMESTAMP
         Where asset_id = $2::UUID`,
            [this.payload.timestamp, this.payload.assetId], { writer: true }
          );
          console.log("siteLayoutRes: ", siteLayoutRes);

          console.log("MANUAL CONTROL CASE ", commandInfo);
          if (commandInfo !== null) {
            const checkUMCAlert = await this.getActiveAlert(
              "ASSET-UNDER_MANUAL_CONTROL"
            );
            if (checkUMCAlert.length > 0) {
              //clear alert
              await this.clearAlert(checkUMCAlert[0].id);
            }

            const assetInfo = await this.getAssetInfo();
            const {
              linkRowType,
              linkRowRef,
              row_id,
              row_name,
              shorthand_name,
              asset_name,
              snap_addr,
              device_type,
            } = await getAssetAndSiteLayoutByAssetId(this.payload.asset_id)

            let title = await this.getTitle(assetInfo, "MANUAL CONTROL");
            let icon = await this.getIcon(assetInfo, "MANUAL CONTROL");

            if (commandInfo.status === "Virtual EStop") {
              title = title + " Virtual Emergency Stop Engaged";
              icon = "virtual_estop";
            } else {
              title =
                title + ` Manual Row Control Start (${commandInfo.status})`;
            }

            //add alert
            if (isLinkedRow(linkRowType, linkRowRef, device_type)) {

              const leaderInfo = {
                row_id,
                row_name,
                shorthand_name,
                asset_name,
                snap_addr,
                assetId: this.payload.assetId
              };

              const childInfo = {
                row_id: linkRowRef,
              };

              const notificationsOptions = {
                isNotify: assetInfo?.is_notify,
                locationLat: assetInfo?.location_lat ,
                locationLng: assetInfo?.location_lng,
                created: this.payload.timestamp,
                deviceType: assetInfo?.device_type,
                siteId: assetInfo?.site_id,
                siteName: assetInfo?.site_name,
                multipleSites: assetInfo?.multipleSites,
                projectName: assetInfo?.project_name,
                projectLocation: assetInfo?.project_location,
              };

              await CloudAlertsHelperModel.addManualControlAlert(
                this.pgWrite,
                leaderInfo,
                childInfo,
                commandInfo.status,
                true,
                {
                  userName: commandInfo.user_name,
                  email: commandInfo.email,
                },
                notificationsOptions
              );
            } else {
              await this.addCloudAlert(
                title,
                icon,
                "ASSET-UNDER_MANUAL_CONTROL",
                {
                  user_name: commandInfo.user_name,
                  email: commandInfo.email,
                }
              );
              //add event log
              await this.addEventLog(
                title,
                icon,
                "ASSET-UNDER_MANUAL_CONTROL",
                {
                  user_name: commandInfo.user_name,
                  email: commandInfo.email,
                }
              );
              //send notification
              assetInfo.connected_state = "MANUAL CONTROL";
              assetInfo.last_disconnected = this.payload.timestamp;
              assetInfo.icon_name = icon + "_48x48.png";
              if (assetInfo.is_notify)
                await this.processAssetsConnectionNotifications(
                  assetInfo,
                  false,
                  commandInfo
                );
            }
          }
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error processEvent..!!", err);
    }
  }

  checkSameCmds(commandInfo) {
    let status = false;
    if (
      commandInfo.rc_cmd_state === commandInfo.rc_previous_state &&
      commandInfo.rc_param === commandInfo.rc_previous_param
    ) {
      status = true;
    }
    return status;
  }

  async getCommandInfo() {
    console.log(
      "getCommandInfo ",
      `
    Select * from terrasmart.site_layout
    Where site_layout.asset_id = $1::UUID
    AND last_action_completed = false
    AND (individual_rc_cmd_state != 0
    OR individual_rc_param != 0)`,
      [this.payload.assetId]
    );
    let res = await exeQuery(
      `
    Select * from terrasmart.site_layout
    Where site_layout.asset_id = $1::UUID
    AND last_action_completed = false
    AND (individual_rc_cmd_state != 0
    OR individual_rc_param != 0)`,
      [this.payload.assetId]
    );
    // console.log("RESULT: ", res);

    let res1 = await exeQuery(
      `
    Select * from terrasmart.site_layout
    Where site_layout.asset_id = $1::UUID`,
      [this.payload.assetId]
    );
    // console.log("RESULT1: ", res1);
    if (res.rows.length > 0) {
      let rc_cmd_state = res.rows[0].individual_rc_cmd_state;
      let rc_param = res.rows[0].individual_rc_param;
      let rc_previous_state = res.rows[0].individual_rc_previous_state;
      let rc_previous_param = res.rows[0].individual_rc_previous_param;
      let user_name = res.rows[0].username;
      let email = res.rows[0].email;
      let status = this.getUnderManualCommandStatus(rc_cmd_state, rc_param);
      let lastStatus = this.getUnderManualCommandStatus(
        rc_previous_state,
        rc_previous_param
      );
      return {
        rc_cmd_state: rc_cmd_state,
        rc_param: rc_param,
        rc_previous_state: rc_previous_state,
        rc_previous_param: rc_previous_param,
        status: status,
        user_name: user_name,
        email: email,
        lastStatus: lastStatus,
      };
    } else {
      return null;
    }
  }

  getUnderManualCommandStatus(rc_cmd_state, rc_param) {
    console.log("getUnderManualCommandStatus ", rc_cmd_state, rc_param);
    let status = "";
    if (rc_cmd_state === 5) {
      if (rc_param === 0) status = "Preset: Stow";
      if (rc_param === 1) status = "Preset: Flat";
      if (rc_param === 6) status = "Preset: Min";
      if (rc_param === 7) status = "Preset: Max";
    } else if (rc_cmd_state === 3) {
      status = `${rc_param}&deg;`;
    } else if (rc_cmd_state === 1) {
      status = "Virtual EStop";
    }
    return status;
  }
  async checkNewEvent() {
    try {
      const conhist = await exeQuery(db.checkLastAssetHistUpdate, [
        this.payload.assetId,
        this.payload.timestamp,
      ]);
      console.log(db.checkLastAssetHistUpdate, [
        this.payload.assetId,
        this.payload.timestamp,
      ]);
      // console.log("AssetHist ", conhist);
      let is_new = true;
      if (conhist.rows.length > 0) {
        is_new = false;
      }
      console.log("IS NEW: ", is_new);
      return is_new;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error checkNewEvent..!!", err);
    }
  }
  async getAssetInfo() {
    try {
      const assetInfo = await exeQuery(db.siteInfoByAssetId, [ this.payload.assetId ]);
      let info = {};
      await assetInfo.rows.forEach(async (data) => {
        info.is_notify = data.is_notify;
        info.site_id = data.site_id;
        info.site_name = data.site_name;
        info.device_type = getDeviceTypeNameFromAssetType(data.asset_type);
        info.location_lat = data.location_lat;
        info.location_lng = data.location_lng;
        info.asset_name = data.asset_name;
        info.snap_addr = data.snap_addr;
        info.project_name = data.project_name;
        info.project_id = data.project_id;
        info.project_location = data.project_location;
      });
      info.multipleSites = await notificationService.checkProjectSites(info.project_id);
      info.timestamp = this.payload.timestamp;
      //Notification accounts
      let notification_type = "rc_under_manual_control";

      console.log("Notif Type ", notification_type);
      console.log("INFO ", info);
      var userAccounts = await notificationSettingService.getAccounts(
        info.site_id,
        notification_type
      );
      info.emailAddrs = userAccounts.emails;
      info.phoneNumbers = userAccounts.phone_nums;
      var siteLayoutInfo = await exeQuery(
        `
      SELECT site_layout.name, site_layout.i,site_layout.shorthand_name FROM terrasmart.site_layout
      WHERE site_layout.asset_id = $1::UUID
      `,
        [this.payload.asset_id]
      );
      console.log(
        `
      SELECT site_layout.name, site_layout.i,site_layout.shorthand_name FROM terrasmart.site_layout
      WHERE site_layout.asset_id = $1::UUID
      `,
        [this.payload.asset_id]
      );
      console.log(siteLayoutInfo);
      info.shorthand_name = null;
      info.row_id = "";
      info.row_name = null;
      if (siteLayoutInfo.rows.length !== 0) {
        info.row_id = siteLayoutInfo.rows[0].i;
        info.row_name = siteLayoutInfo.rows[0].name;
        info.shorthand_name = siteLayoutInfo.rows[0].shorthand_name;
      }
      console.log(info);
      return info;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getAssetInfo..!!", err);
    }
  }
  async getLastStatus() {
    try {
      const conhist = await exeQuery(db.checkLastStatusCurrent, [
        this.payload.assetId
      ]);
      console.log(db.checkLastStatusCurrent, [
        this.payload.assetId
      ]);
      console.log("ConHist ", conhist);
      let sendNotification = false;
      let res = { check: false, status: null };
      await conhist.rows.forEach(async (data) => {
        console.log("DATA: ", data);
        if (data.connected_state !== "MANUAL CONTROL") {
          sendNotification = true;
          res = {
            check: sendNotification,
            status: data.connected_state,
          };
        } else {
          res = {
            check: sendNotification,
            status: data.connected_state,
          };
          console.log("Not Matched");
        }
      });
      console.log("IS CHANGE LASTSTATE: ", sendNotification);
      return res;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getLastConStatus..!!",
        err
      );
    }
  }

  async getActiveAlert(event_name) {
    try {
      console.log(
        `SELECT * FROM terrasmart.cloud_alert
      WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true`,
        [this.payload.assetId, event_name]
      );
      const res = await exeQuery(
        `SELECT * FROM terrasmart.cloud_alert
             WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true`,
        [this.payload.assetId, event_name]
      );
      console.log("ACTIVEALERT: ", res.rows);
      return res.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getActiveAlert..!!", err);
    }
  }

  async addCloudAlert(title, icon, event_name, userInfo) {
    try {
      if (userInfo !== null && userInfo !== undefined) {
        return await exeQuery(
          db.addCloudAlertWithUserInfoByReturnId,
          [
            event_name,
            null,
            new Date(this.payload.timestamp),
            this.payload.assetId,
            2,
            true,
            title,
            icon,
            userInfo.user_name,
            userInfo.email,
            null,
            20
          ], { writer: true }
        );
      } else {
        //ADD Alert
        const addCloudAlertQuery = `
            INSERT INTO terrasmart.cloud_alert(event_name,created,asset_id,type,active,title,icon)
            VALUES ($1 :: VARCHAR, $2 :: TIMESTAMP,$3 :: UUID, $4 :: INT, $5 :: Boolean,$6::VARCHAR,$7::VARCHAR)
            `;
        return await exeQuery(addCloudAlertQuery, [
          event_name,
          new Date(this.payload.timestamp),
          this.payload.assetId,
          2,
          true,
          title,
          icon,
        ], { writer: true });
      }
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addCloudAlert..!!", err);
    }
  }

  async addEventLog(title, icon, eventName, userInfo) {
    try {
      console.log("ADDEVENTLOG ", title, icon, eventName, userInfo);
      if (userInfo !== null && userInfo !== undefined) {
        return await exeQuery(
          db.addCloudEventLogWithUserInfoByReturnId,
          [
            eventName,
            null,
            20,
            new Date(this.payload.timestamp),
            this.payload.assetId,
            1,
            title,
            icon,
            userInfo.user_name,
            userInfo.email,
            null
          ], { writer: true }
        );
      } else {
        const cloudEventLogQuery = `
        INSERT INTO terrasmart.cloud_event_log (name,levelno,created,asset_id,type,title,icon)
        VALUES ($1 :: VARCHAR, $2 :: INT, $3 :: TIMESTAMP,$4 :: UUID, $5::INT,$6::VARCHAR,$7::VARCHAR)
        `;
        //ADD Log
        return await exeQuery(cloudEventLogQuery, [
          eventName,
          20,
          new Date(this.payload.timestamp),
          this.payload.assetId,
          2, //Individual Asset Events,
          title,
          icon,
        ], { writer: true });
      }
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addEventLog..!!", err);
    }
  }

  async clearAlert(alertId) {
    try {
      console.log("Delete Cloud Alert: ", alertId);
      await cloudAlertService.clearAlertDetail(alertId);
      return await exeQuery(db.removeCloudAlert, [alertId], { writer: true });
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error clearAlert..!!", err);
    }
  }

  async clearFCSAlert(alertId) {
    // console.log("Delete Cloud Alert: ", alertId);
    await exeQuery(db.removeCloudAlert, [alertId], { writer: true });
    // await this.pgWrite.query(db.updateCLoudAlertQuery, [
    //   this.payload.timestamp,
    //   alertId,
    // ]);
  }
  async getTitle(info, status) {
    let assetName = "";
    if (info.device_type === "Row Controller") {
      assetName =
        "Row Box " +
        info.row_id +
        " (" +
        (info.row_name !== null ? info.row_name + " | " : "") +
        (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
        info.snap_addr +
        "):";
    } else {
      assetName =
        info.asset_name !== undefined && info.asset_name !== null
          ? info.asset_name + " (" + info.snap_addr + "):"
          : info.device_type + " (" + info.snap_addr + "):";
    }

    if (status === "OFFLINE") {
      assetName + assetName + " Offline";
    } else if (status === "ONLINE") {
      assetName + assetName + " Online";
    } else if (status === "FCS") {
      assetName + assetName + " FCS";
    } else if (status === "UNKNOWN") {
      assetName + assetName + " Unknown";
    }
    return assetName;
  }

  async getIcon(info, status) {
    let icon = null;
    if (status == "OFFLINE") {
      if (info.device_type === "Row Controller") {
        icon = "mode_tracking_offline";
      } else {
        icon = "weather_offline";
      }
    } else if (status == "ONLINE") {
      if (info.device_type === "Row Controller") {
        icon = "mode_tracking";
      } else {
        icon = "weather_online";
      }
    } else if (status == "FCS") {
      if (info.device_type === "Row Controller") {
        icon = "fcs_control";
      } else {
        icon = "fcs_control";
      }
    } else if (status == "UNKNOWN") {
      if (info.device_type === "Row Controller") {
        icon = "unknown";
      } else {
        icon = "unknown";
      }
    } else if (status == "MANUAL CONTROL") {
      if (info.device_type === "Row Controller") {
        icon = "setting_gray";
      } else {
        icon = "setting_gray";
      }
    }
    return icon;
  }
  getAssetName(info) {
    let assetName = info.asset_name;
    if (info.device_type === "Row Controller") {
      assetName =
        "Row Box " +
        info.row_id +
        " (" +
        (info.row_name !== null ? info.row_name + " | " : "") +
        (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
        info.snap_addr +
        ")";
    } else {
      assetName =
        info.asset_name !== null
          ? info.asset_name
          : info.device_type !== null
            ? info.device_type
            : "Asset";
    }
    return assetName;
  }
  async processAssetsConnectionNotifications(
    info,
    isManualControlStop,
    commandInfo
  ) {
    console.log(
      "Process Connection Notification1: ",
      info,
      " ",
      isManualControlStop,
      commandInfo
    );
    try {
      if (info) {
        let params = {};

        let time_zone = "America/New_York";
        if (info.location_lat !== "" && info.location_lng !== "")
          time_zone = tzlookup(info.location_lat, info.location_lng);

        let connected_state = "MANUAL CONTROL";
        let connection_time = this.payload.timestamp;

        if (commandInfo !== null) {
          if (commandInfo.status === "Virtual EStop") {
            connected_state = "Virtual Emergency Stop Engaged";
          } else {
            connected_state = "Manual Row Control Start";
          }
        } else {
          connected_state = "Manual Row Control Start";
        }

        let timestamp = moment
          .tz(connection_time, time_zone)
          .format("hh:mmA on MM/DD/YYYY ");

        let asset_name = this.getAssetName(info);
        let status_text = info.device_type + " | " + connected_state;

        console.log(status_text, " ", isManualControlStop);

        let body_text = "";

        if (commandInfo !== null) {
          if (commandInfo.status === "Virtual EStop") {
            body_text = `${asset_name}: Virtual Emergency Stop Engaged at ${timestamp} by ${commandInfo.user_name} (${commandInfo.email})`;
          } else {
            body_text = `${asset_name}: Manual Row Control Start (${commandInfo.status}) at ${timestamp} by ${commandInfo.user_name} (${commandInfo.email})`;
          }
        } else {
          body_text = `${asset_name} reported that it is under manual control at ${timestamp}.`;
        }

        console.log(body_text, " ", isManualControlStop);
        console.log("Sending SMS....");

        await this.sendSMSNotification(
          info,
          true,
          timestamp,
          connected_state,
          isManualControlStop,
          commandInfo
        );
        console.log("Sending Email....");
        if (info.emailAddrs.length > 0) {
          console.log("EMAILADRS: ", info.emailAddrs);
          var emailData = {
            is_multiSites: info.multipleSites,
            site_name: info.site_name,
            status_text: status_text,
            asset_name: asset_name,
            body_text: body_text,
            timestamp: timestamp,
            project_name: info.project_name,
            project_location: info.project_location,
            s3_asset_url: getS3EmailAssetsUrl(),
            icon_url: getS3EmailAssetsUrl() + info.icon_name,
            url: process.env.CLOUDUI_URL + ("/home/projects/" + info.site_id + "/overview"),
            current_time: new Date(),
          };

          var templateHtml = Handlebars.compile(
            utils.emailTempAssetStatus.toString()
          );

          var bodyHtml = templateHtml(emailData);
          // params.emailAddrs = info.emailAddrs;
          params.msgSubject =
            (info.multipleSites ? info.project_name + " | " : "") +
            (info.site_name !== null ? info.site_name : "Site") +
            " | " +
            (info.device_type !== null ? info.device_type : "Asset") +
            (" " + connected_state);

          if (commandInfo !== null && commandInfo.status === "Virtual EStop") {
            params.msgSubject =
              (info.multipleSites ? info.project_name + " | " : "") +
              (info.site_name !== null ? info.site_name : "Site") +
              " | " +
              (info.device_type !== null ? info.device_type : "Asset") +
              (" " + " Virtual Emergency Stop Engaged");
          } else {
            params.msgSubject =
              (info.multipleSites ? info.project_name + " | " : "") +
              (info.site_name !== null ? info.site_name : "Site") +
              " | " +
              (info.device_type !== null ? info.device_type : "Asset") +
              (" " + " Manual Row Control Start");
          }

          params.msgbody = bodyHtml;

          info.emailAddrs.forEach(async (data) => {
            params.emailAddrs = [data];
            await aws_integration.sendEmail(params);
          });
        }
      } else {
        console.log("NO Notif");
      }
    } catch (e) {
      console.error("ASSET CONNECTION HIST ERROR:", e);
    } finally {
      console.log("releasing client");
    }
  }

  async sendSMSNotification(
    info,
    status,
    timestamp,
    connected_state,
    isManualControlStop,
    commandInfo
  ) {
    console.log("ISMANUALCONTROLSTOP ", isManualControlStop);
    console.log("PHONENUMS: ", info.phoneNumbers);
    let asset_name = this.getAssetName(info);
    let params = {};
    let connection_msg = connected_state === "";
    if (connected_state === "Virtual Emergency Stop Engaged") {
      connection_msg = ` Virtual Emergency Stop Engaged by ${commandInfo.user_name} (${commandInfo.email}) at `;
      params.msgText =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name +
        (" | " + asset_name + " Virtual Emergency Stop Engaged") +
        ("\n" + info.site_name + "'s ") +
        (asset_name + connection_msg + timestamp);
    } else if (connected_state === "Manual Row Control Start") {
      if (commandInfo.status.indexOf("&deg;") !== -1) {
        connection_msg = ` Manual Row Control Start (${commandInfo.status.replace(
          "&deg;",
          "°"
        )}) by ${commandInfo.user_name} (${commandInfo.email}) at `;
      } else {
        connection_msg = ` Manual Row Control Start (${commandInfo.status}) by ${commandInfo.user_name} (${commandInfo.email}) at `;
      }
      params.msgText =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name +
        (" | " + asset_name + " Manual Row Control Start") +
        ("\n" + info.site_name + "'s ") +
        (asset_name + connection_msg + timestamp);
    } else {
      params.msgText =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name +
        (" | " + asset_name + " " + connected_state) +
        ("\n" + info.site_name + "'s ") +
        asset_name +
        (status === true
          ? connection_msg
          : " went " + connected_state + " at ") +
        timestamp;
    }

    console.log("SMSPARAMS ", params);
    info.phoneNumbers.forEach(async (data) => {
      if (data !== null) {
        let asset_name =
          info.asset_name !== null ? info.asset_name : info.device_type;
        let params = {};
        params.phoneNumber = data;
        let connection_msg = "";
        if (connected_state === "Virtual Emergency Stop Engaged") {
          connection_msg = ` Virtual Emergency Stop Engaged by ${commandInfo.user_name} (${commandInfo.email}) at `;
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + asset_name + " Virtual Emergency Stop Engaged") +
            ("\n" + info.site_name + "'s ") +
            (asset_name + connection_msg + timestamp);
        } else if (connected_state === "Manual Row Control Start") {
          if (commandInfo.status.indexOf("&deg;") !== -1) {
            connection_msg = ` Manual Row Control Start (${commandInfo.status.replace(
              "&deg;",
              "°"
            )}) by ${commandInfo.user_name} (${commandInfo.email}) at `;
          } else {
            connection_msg = ` Manual Row Control Start (${commandInfo.status}) by ${commandInfo.user_name} (${commandInfo.email}) at `;
          }
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + asset_name + " Manual Row Control Start") +
            ("\n" + info.site_name + "'s ") +
            (asset_name + connection_msg + timestamp);
        } else {
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + asset_name + " " + connected_state) +
            ("\n" + info.site_name + "'s ") +
            asset_name +
            (status === true
              ? connection_msg
              : " went " + connected_state + " at ") +
            timestamp;
        }

        console.log("SMSPARAMS ", params);
        await aws_integration.sendSMS(params);
      }
    });
    return true;
  }
}


exports.commandStatusService = new CommandStatusService();
