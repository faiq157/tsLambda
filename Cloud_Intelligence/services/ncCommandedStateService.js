const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const utils = require("../utils");
const { getS3EmailAssetsUrl, formatUserFriendlyTime } = require("../utils/libs/functions");
const functions = require("../utils/libs/groupedEventsHelperFunctions");
const { notificationSettingService } = require("./notificationSettingService");
const { notificationService } = require("./common/notificationService");
const queueHelper = require("../QueueHelper");
const { getCloudAlertSiteModeHist, getCloudAlertSiteModeHistWithOptMode,
  updateCloudAlertSiteModeHist } = require("../models/cloudAlertSiteModeHist.model");
const { getCloudSiteModeHist, getCloudSiteModeHistWithOptMode,
  updateCloudSiteModeHist } = require("../models/cloudSiteModeHist.model");
const { getActiveAlertsForAllAssets, getActiveAlertByAssetId } = require("../models/cloudAlert.model");
const { trackingModes, commandSource, StowTypes, manualModeDetail, cloudAlertMessages, AlertAndEventTitles, siteModes } = require("../utils/constants");
const { WeatherForecastStowModel } = require("../models/weatherForecastStow.model")
const { getProjectDetailsBySiteId } = require('../models/project.model')

class NCCommandedStateService {
  async handler(client, pgWrite, payload) {
    this.client = client;
    this.pgWrite = pgWrite;
    this.payload = payload;
    try {
      console.log("NCCommandedStateService");
      return await this.processEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error NCCommandedStateService handler..!!",
        err
      );
    }
  }
  async handleAnomalyDetectionNightTimeStowEvent(client, payload) {
    const getLastNCCommandedState = await client.query(
      db.checkLastNCTrackingCommand,
      [payload.network_controller_id]
    );
    if (getLastNCCommandedState.rows[0].commanded_state !== 5) {
      await queueHelper.queueDetectedAnomaly(client, payload); // tracking_command_hist
    }
    return true;
  };
  logInfo(obj) {
    console.log(obj);
  }

  async processEvent() {
    //get NcInfo
    let info = await this.getUpdateMeta();

    //get last site mode
    const lastStateInfo = await this.lastStateInfo();

    if (lastStateInfo.is_changed) {
      //   const assetsWithLocalErrors = await this.getAssetsLocalErrors();
      const activeAlert = await this.getActiveAlert();

      if (activeAlert.length !== 0) {
        //flag it inactive
        await this.clearAlert(activeAlert[0].id);
        //check if old commaded state was ESTOP, if so then Add cloud event logs for Disengaged event
        if (
          this.payload.commanded_state !== 1 &&
          lastStateInfo.commanded_state === 1
        ) {
          await this.handleEstopDisengagedEvent(info);
        }
      }
      const assetsWithActiveAlerts = await getActiveAlertsForAllAssets(this.client, this.payload.asset_id);
      console.log("assetsWithActiveAlerts:  ", assetsWithActiveAlerts);

      let cloudEventLogId = null;
      if (this.payload.commanded_state !== 2) {
        const addCloudEventLogRes = await this.handleAndAddEventLog(info);
        if (addCloudEventLogRes.rows.length > 0)
          cloudEventLogId = addCloudEventLogRes.rows[0].id;


        const cloudAlertId = await this.handleModeAlert(
          this.payload.commanded_state,
          this.payload.commanded_state_detail,
          assetsWithActiveAlerts,
          info);

        await this.addDetails(
          cloudAlertId,
          cloudEventLogId,
          assetsWithActiveAlerts
        );
      }
      return true;
    }
  }

  async getUpdateMeta() {
    let info = {};
    try {
      const network_controller_info = await this.client.query(db.ncInfo, [
        this.payload.network_controller_id,
      ]);

      if (network_controller_info.rows.length !== 0) {
        let data = network_controller_info.rows[0];
        info.is_notify = data.is_notify;
        info.site_id = data.site_id;
        info.site_name = data.site_name;
        info.device_type = "Network Controller";
        info.location_lat = data.location_lat;
        info.location_lng = data.location_lng;
        info.asset_name = data.network_controller_name;
        info.project_name = data.project_name;
        info.project_id = data.project_id;
        info.project_location = data.project_location;
        info.site_ghi = data.site_ghi;
        info.site_poa = data.site_poa;
        info.enter_diffuse_mode_duration = data.enter_diffuse_mode_duration;
        info.exit_diffuse_mode_duration = data.exit_diffuse_mode_duration;
      }
      console.log(info);
      info.multipleSites = await notificationService.checkProjectSites(this.client, info.project_id);
      console.log("Meta ", info);
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getUpdateMeta..!!", err);
    }

    return info;
  }

  async lastStateInfo() {
    try {
      console.log(db.checkLastNCTrackingCommand, [
        this.payload.network_controller_id,
      ]);
      const lastSiteMode = await this.client.query(
        db.checkLastNCTrackingCommand,
        [this.payload.network_controller_id]
      );
      //if the state is changed
      let stateChanged = false;
      let lastCommandedState = null;

      console.log("LASTSITEMODE: ", lastSiteMode.rows);
      if (lastSiteMode.rows.length !== 0) {
        if (
          lastSiteMode.rows[0].commanded_state !== this.payload.commanded_state ||
          ( lastSiteMode.rows[0].commanded_state === this.payload.commanded_state &&
            lastSiteMode.rows[0]?.commanded_state_detail !== this.payload?.commanded_state_detail )
        ) {
          stateChanged = true;
          lastCommandedState = lastSiteMode.rows[0].commanded_state;
        }
      }

      console.log("CURRENT STATE: ", this.payload.commanded_state);
      console.log("LAST STATE ", lastCommandedState);

      return { is_changed: stateChanged, commanded_state: lastCommandedState };
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error lastStateInfo..!!", err);
    }
  }

  async getAssetsLocalErrors() {
    try {
      //check if clid asset have any active status_bits
      const assetsWithLastStatusBits = await this.client.query(
        db.assetsWithLocalErrors,
        [this.payload.network_controller_id]
      );
      console.log("assetsWithLastStatusBits ", assetsWithLastStatusBits.rows);
      return assetsWithLastStatusBits.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getAssetsLocalErrors..!!",
        err
      );
    }
  }

  async getActiveAlert() {
    try {
      const checkAlert = await this.client.query(db.checkCloudAlert, [
        this.payload.asset_id,
        "NC-COMMANDED-STATE",
      ]);
      console.log("checkAlert", checkAlert.rows);
      return checkAlert.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getActiveAlert..!!", err);
    }
  }

  async clearAlert(alertId) {
    try {
      console.log("Delete Cloud Alert: ", alertId);
      //todo: remove entries from cloud alert detail table then proceed
      const detailRemoveRes = await this.pgWrite.query(
        `
      Delete from terrasmart.cloud_alert_detail
      WHERE cloud_alert_detail.cloud_alert_id = $1::UUID`,
        [alertId]
      );
      console.log("DetailRemoveRes ", detailRemoveRes);
      return await this.pgWrite.query(db.removeCloudAlert, [alertId]);
      // return await this.pgWrite.query(db.updateCLoudAlertQuery, [
      //   this.payload.timestamp,
      //   alertId,
      // ]);
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error clearAlert..!!", err);
    }
  }

  async handleEstopDisengagedEvent(info) {
    try {
      //And send email/SMS notification
      await this.sendEStopDiengagedNotification(info);
      //disengaged event log
      await this.addEventLog(
        "Network Controller Emergency Stop Button Disengaged",
        "The emergency stop button has been disengaged on the Network Controller. All rows will begin tracking soon.",
        "mode_stop_dis"
      );
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addEventLog..!!", err);
    }
  }

  async handleAndAddEventLog(info) {
    try {
      console.log("handleAndAddEventLog...");
      let title = this.getTitle(this.payload.commanded_state, this.payload.commanded_state_detail);
      let message = this.getMessage(info, this.payload.commanded_state, this.payload.commanded_state_detail);
      let icon = this.payload.commanded_state === 6
        ? this.ncPresetStateIcon(this.payload.commanded_state_detail)
        : this.ncStateIcons(this.payload.commanded_state);


      const newAlertParams = await this.overrideHailAlert(info, {title, message, icon, commandedState: this.payload.commanded_state, commandedStateDetail: this.payload.commanded_state_detail});
      title = newAlertParams.title
      message = newAlertParams.message
      icon = newAlertParams.icon

      return await this.addEventLog(title, message, icon);
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error handleAndAddEventLog..!!",
        err
      );
    }
  }

  async isCommandedStateEstopEngageOrDisengage(){
    const lastStateInfo = await this.lastStateInfo();

    return this?.payload?.commanded_state === trackingModes.ESTOP_ENGAGE ||
      ( this.payload.commanded_state !== trackingModes.ESTOP_ENGAGE &&
      lastStateInfo.commanded_state === trackingModes.ESTOP_ENGAGE )
  }

  async addEventLog(title, message, icon) {

    let levelNo =  this.payload.commanded_state === 8 ? 30 : 20
    try {

      let userInfo = {}

      if (this.payload.user_name && this.payload.user_email) {
        userInfo.user_name = this.payload.user_name
        userInfo.user_email = this.payload.user_email
      }
      else{
        userInfo = await this.getSiteModeByUser() || {}
      }

      let sourcePayload = null
      if (this.payload.source) {

        userInfo["source"] = this.payload.source
        sourcePayload = JSON.stringify({ source:
          await this.isCommandedStateEstopEngageOrDisengage() ? commandSource.SLUI: this.payload.source})
      }

      sourcePayload = this.addIsAdminAlertToPayloadIfRemoteQC(sourcePayload);

      console.log("CLOUD LOG USER INFO: ", userInfo);
      if (userInfo && this.payload.commanded_state !== 7) {
        return await this.pgWrite.query(
          db.addCloudEventLogWithUserInfoByReturnId,
          [
            "NC-COMMANDED-STATE",
            message,
            levelNo,
            this.payload.timestamp,
            this.payload.asset_id,
            1,
            title,
            icon,
            userInfo.user_name,
            userInfo.user_email,
            sourcePayload? sourcePayload: `{}`
          ]
        );
      } else {
        return await this.pgWrite.query(db.addCloudEventLogByReturnId, [
          "NC-COMMANDED-STATE",
          message,
          levelNo,
          this.payload.timestamp,
          this.payload.asset_id,
          1,
          title,
          icon,
        ]);
      }
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addEventLog..!!", err);
    }
  }
  async getSiteModeByUser() {
    let siteModeInfo = null;
    let commanded_state = this.getCommandedState();
    if (commanded_state === 4) {

      siteModeInfo = await getCloudSiteModeHist(this.client, this.payload.network_controller_id);

    } else if (commanded_state === 6 || commanded_state === 8 || commanded_state === 9) {
      let commanded_state_detail = this.payload.commanded_state_detail;
      if (commanded_state === 8) commanded_state_detail = 10;
      if (commanded_state === 9) commanded_state_detail = 11;

      siteModeInfo = await getCloudSiteModeHistWithOptMode(this.client, this.payload.network_controller_id,
        commanded_state_detail);
    }

    let userInfo = null;
    if (siteModeInfo !== null) {
      let id = null;
      siteModeInfo.rows.forEach(async (data) => {
        id = data.id;
        userInfo = {
          user_id: data.user_id,
          user_name: data.user_name,
          user_email: data.user_email,
        };
      });
      if (id) await updateCloudSiteModeHist(this.pgWrite, id);

    }

    return userInfo;
  }

  getCommandedState() {
    let state = null;
    switch (this.payload.commanded_state) {
      case 3:
      case 4:
      case 5:
      case 7:
        state = 4;
        break;
      case 6:
        state = 6;
        break;
      case 8:
        state = 8;
        break;
      case 9:
        state = 9;
    }
    return state;
  }

  getDiffuseEventMessage(info) {
    let enter_duration = parseFloat(info.enter_diffuse_mode_duration);
    let exit_duration = parseFloat(info.exit_diffuse_mode_duration);
    let ghiVal = Math.round(info.site_ghi * 10) / 10;
    let poaVal = Math.round(info.site_poa * 10) / 10;
    console.log(enter_duration);
    console.log(exit_duration);

    enter_duration = enter_duration / 60.0;
    exit_duration = exit_duration / 60.0;

    let enter_duration_text = `${enter_duration} minute`;
    if (enter_duration > 1) enter_duration_text = `${enter_duration} minutes`;

    let exit_duration_text = `${exit_duration} minute`;
    if (exit_duration > 1) exit_duration_text = `${exit_duration} minutes`;

    return `This site is configured for Diffuse Light Tracking. When GHI > POA for ${enter_duration_text},
    the site will enter Diffuse Light Tracking Mode and remain there until POA > GHI for ${exit_duration_text}.
     The values that triggered this mode change are GHI: ${ghiVal} w/m2 POA: ${poaVal} w/m2`;
  }

  async overrideHailAlert(info, params){

    console.log("overrideHailAlert this.isHailAlert:", this.isHailAlert);

    const hailAlert = await WeatherForecastStowModel.getActiveWeatherForecastStowBySiteId(this.pgWrite, info.site_id, StowTypes.HAIL_STOW, true)

    console.log("overrideHailAlert hailAlert:", hailAlert);

    if (!hailAlert) {
      // setting isHailAlert so that next time we dont have to query db for hailAlert
      return params
    }

    // check if hail stow, then update title and message
    const currentDateTime = new Date()
    const isCurrentTimeBetweenHailStowStartAndEndTime = (new Date(hailAlert?.start_time) <= currentDateTime) && (currentDateTime <= new Date(hailAlert?.end_time))

    console.log("overrideHailAlert currentDateTime:", currentDateTime);

    console.log("overrideHailAlert hailAlert?.start_time:", new Date(hailAlert?.start_time));

    console.log("overrideHailAlert hailAlert?.end_time:", new Date(hailAlert?.end_time));


    console.log("overrideHailAlert isCurrentTimeBetweenHailStowStartAndEndTime:", isCurrentTimeBetweenHailStowStartAndEndTime);

    const {  commandedState, commandedStateDetail } = params

    console.log("overrideHailAlert commandedState, commandedStateDetail:", commandedState, commandedStateDetail);

    if ( !isCurrentTimeBetweenHailStowStartAndEndTime && (
        trackingModes.MANUAL_STOW !== commandedState ||
        ![manualModeDetail.HAIL_STOW_MIN_ANGLE, manualModeDetail.HAIL_STOW_MAX_ANGLE].includes(commandedStateDetail))
      ) {

      console.log("overrideHailAlert not processing / [trackingModes.MANUAL_STOW].includes(commandedState):", [trackingModes.MANUAL_STOW].includes(commandedState));

      console.log("overrideHailAlert not processing / [manualModeDetail.MINIMUM_ANGLE, manualModeDetail.MAXIMUM_ANGLE].includes(commandedStateDetail):", [manualModeDetail.HAIL_STOW_MIN_ANGLE, manualModeDetail.HAIL_STOW_MAX_ANGLE].includes(commandedStateDetail));

      return params
    }

    let siteMode = null

    // tracking with back tracking
    if (commandedState === trackingModes.MANUAL_STOW && commandedStateDetail === manualModeDetail.HAIL_STOW_MIN_ANGLE) {
      siteMode = siteModes.MIN_ANGLE_EAST
    } else if (commandedState === trackingModes.MANUAL_STOW && commandedStateDetail === manualModeDetail.HAIL_STOW_MAX_ANGLE) {
      siteMode = siteModes.MAX_ANGLE_WEST
    } else {
      return params
    }

    if (siteMode != hailAlert?.params?.site_mode ) {
      console.log("ERROR: invalid angle reported by NC", JSON.stringify({commandedState, commandedStateDetail, siteMode, hailAlertParams: hailAlert?.params }));
    }

    if (!this.projectDetails) {
      this.projectDetails = await getProjectDetailsBySiteId(this.pgWrite, info.site_id)
    }

    // convert time to local timezone (get timezone from the project timezone)
    const formattedStartTime = formatUserFriendlyTime(hailAlert.start_time, this.projectDetails?.timezone || "America/New_York")
    const formattedEndTime =  formatUserFriendlyTime(hailAlert.end_time, this.projectDetails?.timezone || "America/New_York")
    const alertIssuedTime = hailAlert.timestamp
      ? formatUserFriendlyTime(hailAlert.timestamp, this.projectDetails?.timezone || "America/New_York")
      : undefined;
    const bufferMinutes = this.projectDetails?.hail_stow_buffer_minutes || 60;

    return cloudAlertMessages.hailStormEvent(siteMode, formattedStartTime, formattedEndTime, alertIssuedTime, bufferMinutes) // returns { icon, title, message  }
  }

  async handleModeAlert(commandedState, commandedStateDetail, assetsWithActiveAlerts, info) {
    try {
      let cloudAlertId, addCloudAlertRes = null;
      let title = this.getTitle(commandedState, commandedStateDetail);
      let message = this.getMessage(info, commandedState, commandedStateDetail);
      let icon = this.getIcon(commandedState, commandedStateDetail);

      const newAlertParams = await this.overrideHailAlert(info, {title, message, icon, commandedState, commandedStateDetail});
      title = newAlertParams.title
      message = newAlertParams.message
      icon = newAlertParams.icon

      if ((commandedState === trackingModes.TRACKING ||
        commandedState === trackingModes.TRAKING_WITH_BACKTRACKING ||
        commandedState === trackingModes.NIGHTLY_STOW)
        && assetsWithActiveAlerts.rows.length !== 0) {
        addCloudAlertRes = await this.addCloudAlert(
          title,
          message,
          icon,
          info,
          assetsWithActiveAlerts
        );

      } else if (commandedState !== trackingModes.TRACKING &&
        commandedState !== trackingModes.TRAKING_WITH_BACKTRACKING &&
        commandedState !== trackingModes.NIGHTLY_STOW) {
        addCloudAlertRes = await this.addCloudAlert(
          title,
          message,
          icon,
          info,
          assetsWithActiveAlerts
        );

      }


      if (addCloudAlertRes) cloudAlertId = addCloudAlertRes.rows[0].id;
      console.log("cloudAlertId ", cloudAlertId)

      return cloudAlertId;
    } catch (err) {
      console.error(err);
      throw new Error(`Operation not completed error`, err);
    }
  }


  async addCloudAlert(title, message, icon, info, assetsWithActiveAlerts) {
    // this is where we update the alert for hail
    let levelNo =  this.payload.commanded_state === 8 ? 30 : 20
    
    try {
      console.log("addCloudAlert ", title, message, icon, info, assetsWithActiveAlerts.rows);

      let userInfo = {}

      if (this.payload.user_name && this.payload.user_email) {
        userInfo.user_name = this.payload.user_name
        userInfo.user_email = this.payload.user_email
      }
      else{
        userInfo = await this.getAlertSiteModeByUser() || {}
      }


      let sourcePayload = null
      if (this.payload.source) {

        userInfo["source"] = this.payload.source

        sourcePayload = JSON.stringify({ source: await this.isCommandedStateEstopEngageOrDisengage() ? commandSource.SLUI: this.payload.source})
      }

      // Add isAdminAlert to sourcePayload if commanded_state is 8 i.e Remote QC
      sourcePayload = this.addIsAdminAlertToPayloadIfRemoteQC(sourcePayload);


      console.log("CLOUD ALERT USER INFO: ", userInfo);
      // console.log("AssetsWithActive Alerts", assetsWithActiveAlerts.rows);

      const existingCloudAlert = await getActiveAlertByAssetId(this.client, this.payload.asset_id, "NC-COMMANDED-STATE");

      if (existingCloudAlert) {
        console.log("Existing Alert Found for NC-COMMANDED-STATE", existingCloudAlert);
        return {rows: [{id: existingCloudAlert.id}]};
      }

      if (userInfo && this.payload.commanded_state !== 7) {
        console.log(db.addCloudAlertWithUserInfoByReturnId, [
          "NC-COMMANDED-STATE",
          message,
          new Date(this.payload.timestamp),
          this.payload.asset_id,
          1,
          true,
          title,
          icon,
          userInfo.user_name,
          userInfo.user_email,
          sourcePayload? sourcePayload: `{}`,
          levelNo
        ]);
        const addAlertRes = await this.pgWrite.query(
          db.addCloudAlertWithUserInfoByReturnId,
          [
            "NC-COMMANDED-STATE",
            message,
            new Date(this.payload.timestamp),
            this.payload.asset_id,
            1,
            true,
            title,
            icon,
            userInfo.user_name,
            userInfo.user_email,
            sourcePayload? sourcePayload: `{}`,
            levelNo
          ]
        );
        //process notification
        await this.sendNotification(info, userInfo, assetsWithActiveAlerts);
        return addAlertRes;
      } else {
        const addAlertRes = await this.pgWrite.query(
          db.addCloudAlertByReturnId,
          [
            "NC-COMMANDED-STATE",
            message,
            new Date(this.payload.timestamp),
            this.payload.asset_id,
            1,
            true,
            title,
            icon,
            levelNo
          ]
        );
        await this.sendNotification(info, null, assetsWithActiveAlerts);
        return addAlertRes;
      }
    } catch (err) {
      console.trace(err);
      throw new Error("Operation not completed error addCloudAlert..!!", err);
    }
  }
  async getAlertSiteModeByUser() {

    let siteModeInfo = null;
    let commanded_state = this.getCommandedState();
    if (commanded_state === 4) {

      siteModeInfo = await getCloudAlertSiteModeHist(this.client, this.payload.network_controller_id);

    } else if (commanded_state === 6 || commanded_state === 8 || commanded_state === 9) {
      let commanded_state_detail = this.payload.commanded_state_detail;
      if (commanded_state === 8) commanded_state_detail = 10;
      if (commanded_state === 9) commanded_state_detail = 11;

      siteModeInfo = await getCloudAlertSiteModeHistWithOptMode(
        this.client, this.payload.network_controller_id,
        commanded_state_detail
      );
    }

    let userInfo = null;
    if (siteModeInfo !== null) {
      let id = null;
      siteModeInfo.rows.forEach(async (data) => {
        id = data.id;
        userInfo = {
          user_id: data.user_id,
          user_name: data.user_name,
          user_email: data.user_email,
        };
      });
      if (id) await updateCloudAlertSiteModeHist(this.pgWrite, id);
    }

    return userInfo;
  }

  async addDetails(cloudAlertId, cloudEventLogId, assetsWithActiveAlerts) {
    try {
      if (cloudAlertId !== null) {
        let query =
          "INSERT INTO terrasmart.cloud_event_log_detail (name, title, message, created, type, cloud_event_log_id, asset_id, params, levelno) VALUES";
        let cloudAlertQuery =
          "INSERT INTO terrasmart.cloud_alert_detail (event_name, title, message, created, type, active, cloud_alert_id, asset_id, params, levelno) VALUES";

        let isAnyStatusBits = false;
        assetsWithActiveAlerts.rows.forEach(async (data) => {
          isAnyStatusBits = true;
          const levelNo = ['ASSET-MOTOR-CURRENT-HW-FAULT', 'ASSET-MOTOR-CURRENT_SW_FAULT', 'ASSET-MOTOR-FAULT-TIMEOUT'].includes(data?.event_name) ? 30 : 20;
          let msg = data.message !== null ? "'" + data.message + "'" : null;
          let dt = moment(data.created).format('YYYY-MM-DD HH:mm:ss');
          let params = data.params !== null ? "'" + data.params + "'" : null;
          query += `('${data.event_name}','${data.title}', ${msg}, '${dt}', 2, '${cloudEventLogId}', '${data.asset_id}', ` + params + `::JSON, ${levelNo}),`;

          if (cloudAlertId)
            cloudAlertQuery += `('${data.event_name}', '${data.title}', ${msg}, '${dt}', 2, true, '${cloudAlertId}', '${data.asset_id}', ` + params + `::JSON, ${levelNo}),`;
        });

        if (isAnyStatusBits) {
          query = query.slice(0, -1);
          // console.log(`LOGQUERY:  ${query} `);

          let inf = await this.pgWrite.query(query);
          console.log(`LOGQUERYRES:  ${inf} `);

          if (cloudAlertId) {
            cloudAlertQuery = cloudAlertQuery.slice(0, -1);
            // console.log(`ALERTQUERY: ${cloudAlertQuery} `);

            let inf1 = await this.pgWrite.query(cloudAlertQuery);
            console.log(`ALERTQUERYRES:  ${inf1} `);
          }
        }
      } else {
        console.log("No cloud alert Id found");
      }
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addDetails..!!", err);
    }
  }
  async sendEStopDiengagedNotification(info) {
    let status_text = "Emergency Stop Disengaged";
    info.status_text = status_text;
    let time_zone = "America/New_York";

    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);

    let timestamp = moment
      .tz(this.payload.timestamp, time_zone)
      .format("hh:mmA on MMM DD, YYYY ");
    info.timestamp = timestamp;
    info.device_type = info.device_type !== null ? info.device_type : "Asset";
    info.asset_name =
      info.asset_name !== null ? info.asset_name : info.device_type;

    var userAccounts = await notificationSettingService.getAccounts(
      this.client,
      info.site_id,
      "nc_estop"
    );
    info.emailAddrs = userAccounts.emails;
    info.phoneNumbers = userAccounts.phone_nums;
    if (info.phoneNumbers.length > 0) {
      let smsText = info.site_name + " | " + status_text + " at " + timestamp;
      info.smsText = smsText;
      await this.sendSMSNotification(info);
    }
    if (info.emailAddrs.length > 0) {
      let msgsubject = info.site_name + " | " + status_text;
      let body_text = `Reported by ${info.asset_name} at ${info.timestamp}.`;
      info.body_text = body_text;
      info.msgSubject = msgsubject;
      await this.sendEmailNotification(info);
    }
  }

  async sendNotification(info, userInfo, assetsWithActiveAlerts = []) {

    if (!info.location_lat || !info.location_lng) {
      console.log("ERROR: Invalid project location in NCCommandedStateService.sendNotification info: ", JSON.stringify(info));
      return
    }

    try {
      // console.log("ActiveAlerts--: ", assetsWithActiveAlerts);
      let status_text =
        this.payload.commanded_state === 1
          ? "Emergency Stop Button Engaged"
          : this.payload.commanded_state === 6
            ? "Mode Change - Manual Preset: " +
            this.ncPresetState(this.payload.commanded_state_detail)
            : "Mode Change - " +
            this.ncCommandedState(this.payload.commanded_state);
      let mode_text =
        this.payload.commanded_state === 1
          ? "Emergency Stop"
          : this.payload.commanded_state === 6
            ? "Manual Preset: " +
            this.ncPresetState(this.payload.commanded_state_detail)
            : this.ncCommandedState(this.payload.commanded_state);

      if(this.payload.commanded_state === trackingModes.MANUAL_STOW
        && [manualModeDetail.HAIL_STOW_MAX_ANGLE, manualModeDetail.HAIL_STOW_MIN_ANGLE].includes(this.payload.commanded_state_detail)){

        status_text  = this.payload.commanded_state_detail === manualModeDetail.HAIL_STOW_MAX_ANGLE ?
                          AlertAndEventTitles.HAIL_STOW_MAX_ANGLE_WEST: AlertAndEventTitles.HAIL_STOW_MIN_ANGLE_EAST
        mode_text = status_text
      }

      info.status_text = status_text;
      console.log(info.location_lat, info.location_lng);
      let time_zone = "America/New_York";
      if (info.location_lat !== "" && info.location_lng !== "")
        time_zone = tzlookup(info.location_lat, info.location_lng);

      let timestamp = formatUserFriendlyTime(this.payload.timestamp, time_zone);
      info.timestamp = timestamp;
      info.device_type = info.device_type !== null ? info.device_type : "Asset";
      info.asset_name =
        info.asset_name !== null ? info.asset_name : info.device_type;
      console.log("USERINFO: ", userInfo);
      // console.log("ActiveAlerts: ", assetsWithActiveAlerts.rows);
      //Notification accounts
      let notificationType = "site_mode_changed_by_user";
      if (this.payload.commanded_state === 1) {
        notificationType = "nc_estop";
      } else {
        if (userInfo || this.payload.commanded_state === 6) {
          notificationType = "site_mode_changed_by_user";
        } else if (assetsWithActiveAlerts.rows.length > 0) {
          notificationType = "site_mode_with_active_alerts";
        }
      }

      var userAccounts = await notificationSettingService.getAccounts(
        this.client,
        info.site_id,
        notificationType
      );
      info.emailAddrs = userAccounts.emails;
      info.phoneNumbers = userAccounts.phone_nums;
      if (info.phoneNumbers.length > 0) {
        let smsText = (info.multipleSites ? info.project_name + " | " : "") +
          info.site_name + " | " + status_text + " at " + timestamp;
        if (this.payload.commanded_state === 1) {
          smsText = info.site_name +
            " | " +
            "Network Controller - Emergency Stop Button Engaged" +
            " at " +
            timestamp;
        } else if (this.payload.commanded_state === 7) {
          smsText = info.site_name + " | Mode Change - Diffuse Light Tracking at " + timestamp + ". ";
          smsText += this.getDiffuseEventMessage(info);
        } else {
          if (
            (notificationType =
              "site_mode_with_active_alerts" &&
              assetsWithActiveAlerts.rows.length !== 0)
          ) {
            status_text = mode_text;
            if (userInfo) {
              smsText = info.site_name +
                (" | Mode Change w/ Asset Error - " +
                  mode_text +
                  " at " +
                  timestamp) +
                (" by " + userInfo.user_name + "(" + userInfo.user_email + ")");
            } else {
              smsText = info.site_name +
                " | Mode Change w/ Asset Error - " +
                mode_text +
                " at " +
                timestamp;
            }
          } else {
            if (userInfo) {
              smsText = info.site_name +
                (" | " + status_text + " at " + timestamp) +
                (" by " + userInfo.user_name + "(" + userInfo.user_email + ")");
            } else {
              smsText = info.site_name + " | " + status_text + " at " + timestamp;
            }
          }
        }
        info.smsText = smsText;
        console.log("HAIL Debgging sendSMSNotification", JSON.stringify({...info}));
        await this.sendSMSNotification(info);
      }
      if (info.emailAddrs.length > 0) {
        let msgsubject =
          info.site_name + " | " + this.payload.commanded_state === 1
            ? "Network Controller | Emergency Stop Button Engaged"
            : info.site_name + " | " + status_text;
        if (userInfo)
          info.asset_name = await this.isCommandedStateEstopEngageOrDisengage() ? info.asset_name :  userInfo.user_name + " (" + userInfo.user_email + ")";
        let detail_text = ``;
        let body_text = `Reported by ${info.asset_name} at ${info.timestamp}.`;
        if (this.payload.commanded_state !== 1)
          body_text = `Site Mode was changed to ${mode_text}` + ' by ' + info.asset_name + '.';
        if (this.payload.commanded_state === 7)
          body_text = this.getDiffuseEventMessage(info);
        if (
          (notificationType =
            "site_mode_with_active_alerts" &&
            assetsWithActiveAlerts.rows.length !== 0)
        ) {
          info.status_text = "Mode Change w/ Asset Error";
          body_text += " The following assets were in an error state when the mode change occurred.<br/>";
          detail_text += await functions.getGroupedEvents(this.client, assetsWithActiveAlerts, this.payload.network_controller_id);
        }
        console.log("--body_text: ", body_text);
        // console.log("--detail_text: ", detail_text);
        console.log("--project_location: ", info.project_location);

        info.body_text = body_text;
        info.msgSubject = msgsubject;
        info.detail = detail_text;

        console.log("HAIL Debgging sendEmailNotification", JSON.stringify({...info}));
        await this.sendEmailNotification(info);
      }
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error sendNotification..!!", err);
    }
  }




  async sendSMSNotification(info) {
    try {
      console.log("PHONENUMS: ", info.phoneNumbers);
      info.phoneNumbers.forEach(async (data) => {
        let params = {};
        params.phoneNumber = data;
        params.msgText = (info.multipleSites ? info.project_name + " | " : "") + info.smsText;
        console.log(params);
        await aws_integration.sendSMS(params);
      });
      return true;
    } catch (e) {
      console.error("Error in sendSMSNotification... " + e);
    }
  }
  async sendEmailNotification(payload) {
    // console.log("email notification ", payload);
    try {
      let params = {};
      console.log("EMAILADRS: ", payload.emailAddrs);
      var emailData = {
        is_multiSites: payload.multipleSites,
        site_name: payload.site_name,
        status_text: payload.status_text,
        body_text: payload.body_text,
        asset_name: payload.asset_name,
        timestamp: payload.timestamp,
        detail: payload.detail,
        project_name: payload.project_name,
        project_location: payload.project_location,
        s3_asset_url: getS3EmailAssetsUrl(),
        icon_url: getS3EmailAssetsUrl() + payload.icon_name,
        url:
          process.env.CLOUDUI_URL +
          ("/home/projects/" + payload.site_id + "/overview"),
        current_time: new Date(),
      };
      console.log(emailData);
      var templateHtml = Handlebars.compile(utils.emailTempSiteMode.toString());
      console.log("we got templates");
      var bodyHtml = templateHtml(emailData);
      params.msgSubject = (payload.multipleSites ? payload.project_name + " | " : "") + payload.msgSubject;
      params.msgbody = bodyHtml;
      // console.log(bodyHtml);
      payload.emailAddrs.forEach(async (data) => {
        params.emailAddrs = [data];
        await aws_integration.sendEmail(params);
      });

      return true;
    } catch (e) {
      console.error("Error in sendEmailNotification... " + e);
    }
  }

  getIcon(state, detail) {
    if (state === 6) {
      return this.ncPresetStateIcon(detail);
    } else {
      return this.ncStateIcons(state);
    }
  }

  ncStateIcons(state) {
    const NC_commanded_icon = {
      0: null,
      1: "mode_stop",
      2: "mode_wind",
      3: "mode_tracking",
      4: "mode_tracking",
      5: "mode_sleep",
      6: "mode_maintenance_1",
      7: "flat_angle",
      8: "remote_qc",
      9: "flat_angle",
      10: "mode_snow_blue"
    };
    return NC_commanded_icon[state];
  }

  ncPresetState(state) {
    const Preset_state = {
      0: "Stow",
      1: "Flat",
      2: "Clean",
      3: "Mowing",
      4: "Construction (Flat) w/ Snow Shedding",
      5: "NC Offline Auto Stow",
      6: "Minimum Angle",
      7: "Maximum Angle",
      8: "Stow Night",
      9: "Diffuse Mode",
      10: "Remote QC",
      11: "Flat Maintenance",
      12: "Snow Shedding",
      13: "Low Battery Auto Stow",
      14: "Wind Stow",
      15: "Snow Stow"
    };
    return Preset_state[state];
  }

  ncPresetStateIcon(state) {
    const Preset_state_icon = {
      0: "stow",
      1: "mode_maintenance_1",
      2: "mode_washing",
      3: "mode_mowing",
      4: "mode_maintenance",
      5: "cloud_offline_2",
      6: "min_angle",
      7: "max_angle",
      8: "mode_sleep",
      9: "flat_angle",
      10: "remote_qc",
      11: "flat_angle",
      12: "mode_snow_blue",
      13: "mode_maintenance_1",
      14: "mode_maintenance_1",
      15: "mode_snow_blue"
    };
    return Preset_state_icon[state];
  }

  ncCommandedState(state) {
    const Commanded_State = {
      // # The tracker controller is in an unknown tracking state
      0: "UNKNOWN",
      //# The tracker controller is in the emergency stop state
      1: "Emergency Stop Button Engaged",
      //# The tracker controller has stowed due to weather
      2: "Weather Stow",
      //# The tracker controller is in the tracking state
      3: "Tracking",
      //# The tracker controller is in the tracking with backtracking state
      4: "Tracking w/ Backtracking",
      //# The tracker controller has stowed for sunset
      5: "Night Time Stow",
      //# The tracker controller is in a preset angle
      6: "Manual Preset",
      // #defuse mode
      7: "Diffuse Light Tracking",
      //# Remote QC
      8: "Remote QC",
      //# Flat Maintenance
      9: "Construction (Flat) w/ Weather Monitoring",
      //# Snow Shedding
      10: "Snow Shedding"
    };
    return Commanded_State[state];
  }


  getMessage(info, state, detail = null) {
    let message = null;
    switch (state) {
      case 1:
        message = "The emergency stop button has been engaged on the Network Controller. All rows have stopped tracking.";
        break;
      case 7:
        message = this.getDiffuseEventMessage(info);
        break;
      case 10:
        if (detail === 1) {
          message = "Snow shedding was previously delayed due to other system conditions. Now that those conditions have cleared, snow shedding is being performed automatically."
        }
        break;
    }
    return message;
  }


  getTitle(state, detail = null) {
    let message = "Mode Change - " + this.ncCommandedState(state);
    switch (state) {
      case 1:
        message = "Network Controller Emergency Stop Button Engaged";
        break;
      case 6:
        message = "Mode Change - Manual Preset: " + this.ncPresetState(detail)
        break;
      case 10:
        if (detail === 1) {
          message = "Mode Change - Delayed Snow Shed";
        }
        break;
    }
    return message;
  }

  addIsAdminAlertToPayloadIfRemoteQC(sourcePayload) {
    if (this.payload.commanded_state === 8 && sourcePayload) {
      let srcObj = {};
      try {
        srcObj = JSON.parse(sourcePayload);
      } catch (e) {
        srcObj = {};
      }
      srcObj.isAdminAlert = true;
      return JSON.stringify(srcObj);
    }
    return sourcePayload;
  }

}
exports.ncCommandedStateService = new NCCommandedStateService();
