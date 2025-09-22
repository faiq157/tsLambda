const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
const { exeQuery } = require("../pg");
var Handlebars = require("handlebars");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const aws_integration = require("../aws_integration");
const utils = require("../utils");
const {getS3EmailAssetsUrl, isLinkedRow} = require("../utils/libs/functions");
const { notificationService } = require("./common/notificationService");
const { CloudAlertsHelperModel } = require("../models/cloudAlertsHelper.model");
const { getAssetAndSiteLayoutByAssetId } = require("../models/asset.model");
const { deviceTypeNames } = require("../utils/constants");

class AnomalyDetectionService {
  async handler(payload) {
    this.payload = payload;
    try {
      // await pgWrite.connect();
      return await this.processAnomalyEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error AnomalyDetectionService handler..!!",
        err
      );
    }
  }

  async processAnomalyEvent() {
    const eventMeta = await this.getEventMeta();
    if (eventMeta) {
      if (eventMeta.repeater_only === true && this.payload.detection_type === 'current_angle') {
        console.log('No Anomaly detection for repeaters only');
      } else {
        const linkRowDetails = await getAssetAndSiteLayoutByAssetId(
          this.payload.asset_id
        );
        const assetName = this.getAssetName(eventMeta);
        const { snap_addr } = eventMeta;

        const cloudAlert = await this.getActiveCloudAlert();
        if (this.isAnomalyDetected() && cloudAlert.rows.length === 0) {
          let eventTitle = this.getTitle(eventMeta, assetName, snap_addr, true);
          eventMeta.eventTitle = eventTitle;
          eventMeta.title = eventTitle;
          return this.generateAnomalyAlert(
            eventTitle,
            assetName,
            snap_addr,
            eventMeta,
            linkRowDetails
          );
        } else if (this.isAnomalyCleared() && cloudAlert.rows.length > 0) {
          let eventTitle = this.getTitle(eventMeta, assetName, snap_addr, false);
          eventMeta.eventTitle = eventTitle;
          eventMeta.title = eventTitle;
          return this.clearAnomalyAlert(
            eventTitle,
            assetName,
            snap_addr,
            cloudAlert.rows[0].id,
            eventMeta,
            linkRowDetails
          );
        } else {
          return true;
        }
      }
    } else {
      return "Asset Not Found";
    }

  }

  async generateAnomalyAlert(eventTitle, assetName, snap_addr, eventMeta, linkRowDetails) {
     const {
       linkRowType,
       linkRowRef,
       device_type,
     } = linkRowDetails

    await this.addCloudAlert(eventTitle, assetName, eventMeta, linkRowDetails);
    if (!isLinkedRow(linkRowType, linkRowRef, device_type)) {
    await this.addEventLog(eventTitle, assetName, snap_addr, true, eventMeta);
    await this.sendNotification(eventMeta);
  }
  return true;
  }

  async clearAnomalyAlert(
    eventTitle,
    assetName,
    snap_addr,
    alertId,
    eventMeta,
    linkRowDetails
  ) {
    const { linkRowType, linkRowRef, device_type } = linkRowDetails;

    const isLinked = isLinkedRow(linkRowType, linkRowRef, device_type);

    await this.clearAlert(alertId);

    if (!isLinked) {
      await this.addEventLog(
        eventTitle,
        assetName,
        snap_addr,
        false,
        eventMeta
      );
      await this.sendNotification(eventMeta);
    } else {
      const {
        linkRowRef,
        row_id,
        row_name,
        shorthand_name,
        asset_name
      } = linkRowDetails;

        const leaderInfo = {
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
          assetId: this.payload.asset_id,
        };

        const childInfo = {
          row_id: linkRowRef,
        };

        const notificationsOptions = {
          isNotify: eventMeta?.is_notify,
          locationLat: eventMeta?.location_lat,
          locationLng: eventMeta?.location_lng,
          created: this.payload.timestamp,
          deviceType: eventMeta?.device_type,
          siteId: eventMeta?.site_id,
          siteName: eventMeta?.site_name,
          multipleSites: eventMeta?.multipleSites,
          projectName: eventMeta?.project_name,
          projectLocation: eventMeta?.project_location,
        };

        if (this.payload.detection_type === "poc_wakeup") {
          await CloudAlertsHelperModel.addAnomalyPocWakeupClearAlert(
            this.pgWrite,
            leaderInfo,
            childInfo,
            true,
            this.payload.timestamp,
            this.payload.result.current_value,
            this.payload.result.threshold,
            notificationsOptions
          );
        } else if (this.payload.detection_type === "poc_nighttime_stow") {
          await CloudAlertsHelperModel.addAnomalyPocNighttimeStowClearAlert(
            this.pgWrite,
            leaderInfo,
            childInfo,
            true,
            this.payload.timestamp,
            this.payload.result.current_value,
            this.payload.result.threshold,
            notificationsOptions
          );
        } else if (this.payload.detection_type === "current_angle") {
          await CloudAlertsHelperModel.addAnomalyCurrentAngleClearAlert(
            this.pgWrite,
            leaderInfo,
            childInfo,
            true,
            this.payload.timestamp,
            notificationsOptions
          );
        }

      return true;
    }
  }

  async clearAlert(alertId) {
    try {
      console.log("Delete Cloud Alert: ", alertId);
      await cloudAlertService.clearAlertDetail(alertId);
      return await exeQuery(db.removeCloudAlert, [alertId], { writer: true });
    } catch (err) {
      throw new Error("Error In get clearAlert.. ", err);
    }
  }

  async addCloudAlert(eventTitle, assetName, info, linkRowDetails) {
    try {
      const {
        linkRowType,
        linkRowRef,
        row_id,
        row_name,
        shorthand_name,
        asset_name,
        device_type,
        snap_addr,
      } = linkRowDetails;

      console.log(
        "eventName",
        this.getEventNames(this.payload.detection_type, true)
      );
      console.log(
        "getMessage",
        this.getMessage(
          this.payload.detection_type,
          assetName,
          snap_addr,
          true,
          info
        )
      );
      console.log(db.addFullCloudAlertQuery, [
        this.getEventNames(this.payload.detection_type, true),
        this.payload.timestamp,
        this.payload.asset_id,
        this.payload.device_type === "Network Controller" ? 1 : 2,
        true,
        eventTitle,
        this.getIcons(this.payload.detection_type, true),
        this.getMessage(
          this.payload.detection_type,
          assetName,
          snap_addr,
          true,
          info
        ),
      ]);


         if (isLinkedRow(linkRowType, linkRowRef,  device_type)) {

        const leaderInfo = {
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
          assetId: this.payload.asset_id
        };

        const childInfo = {
          row_id: linkRowRef,
        };

        const notificationsOptions = {
          isNotify: info?.is_notify,
          locationLat: info?.location_lat ,
          locationLng: info?.location_lng,
          created: this.payload.timestamp,
          deviceType: info?.device_type,
          siteId: info?.site_id,
          siteName: info?.site_name,
          multipleSites: info?.multipleSites,
          projectName: info?.project_name,
          projectLocation: info?.project_location,
        };

        if (this.payload.detection_type === "poc_wakeup") {
          await CloudAlertsHelperModel.addAnomalyPocWakeupAlert(
            this.pgWrite,
            leaderInfo,
            childInfo,
            true,
            this.payload.timestamp,
            this.payload.result.current_value,
            this.payload.result.threshold,
            notificationsOptions
          );
        } else if (this.payload.detection_type === "poc_nighttime_stow") {
          await CloudAlertsHelperModel.addAnomalyPocNighttimeStowAlert(
            this.pgWrite,
            leaderInfo,
            childInfo,
            true,
            this.payload.timestamp,
            this.payload.result.current_value,
            this.payload.result.threshold,
            notificationsOptions
          );
        }
        else if (this.payload.detection_type === "current_angle") {
          await CloudAlertsHelperModel.addAnomalyCurrentAngleAlert(
            this.pgWrite,
            leaderInfo,
            childInfo,
            true,
            this.payload.timestamp,
            notificationsOptions
          );
        }

      } else {
      return await exeQuery(db.addFullCloudAlertQuery, [
        this.getEventNames(this.payload.detection_type, true),
        this.payload.timestamp,
        this.payload.asset_id,
        this.payload.device_type === "Network Controller" ? 1 : 2,
        true,
        eventTitle,
        this.getIcons(this.payload.detection_type, true),
        this.getMessage(
          this.payload.detection_type,
          assetName,
          snap_addr,
          true,
          info
        ),
      ], { writer: true });}
    } catch (err) {
      throw new Error("Error In get addCloudAlert.. ", err);
    }
  }

  async addEventLog(eventTitle, assetName, snap_addr, isActive, info) {
    try {
      return await exeQuery(db.addFullCloudEventLogQuery, [
        this.getEventNames(this.payload.detection_type, isActive),
        20,
        this.payload.timestamp,
        this.payload.asset_id,
        this.payload.device_type === "Network Controller" ? 1 : 2,
        eventTitle,
        this.getIcons(this.payload.detection_type, isActive),
        this.getMessage(
          this.payload.detection_type,
          assetName,
          snap_addr,
          isActive,
          info
        ),
      ], { writer: true });
    } catch (err) {
      throw new Error("Error In get addEventLog.. ", err);
    }
  }

  async getEventMeta() {
    try {

      let assetsInfoByAddr = await exeQuery(db.metaInfoByAssetId, [
        this.payload.asset_id,
      ]);

      if (assetsInfoByAddr.rows[0].device_type === "Network Controller") {
        assetsInfoByAddr = await exeQuery(db.metaInfoByNCAssetId, [
          this.payload.asset_id,
        ]);
      }

      var info = {};

      await assetsInfoByAddr.rows.forEach(async (data) => {
        // console.log("_INFO: ", data);
        info.is_notify = data.is_notify;
        info.site_id = data.site_id;
        info.site_name = data.site_name;
        info.device_type = deviceTypeNames[data.device_type_id];
        info.location_lat = data.location_lat;
        info.location_lng = data.location_lng;
        info.name = data.name;
        info.project_name = data.project_name;
        info.project_id = data.project_id;
        info.project_location = data.project_location;
        info.network_controller_id = data.network_controller_id;
        info.snap_addr = data.snap_addr;
        info.repeater_only = data.repeater_only;
      });
      info.multipleSites = await notificationService.checkProjectSites(info.project_id);
      if (info.device_type === "Row Controller") {
        var siteLayoutInfo = await exeQuery(
          `
        SELECT site_layout.name,site_layout.i,site_layout.shorthand_name FROM terrasmart.site_layout
        WHERE site_layout.asset_id = $1::UUID
        `,
          [this.payload.asset_id]
        );
        info.shorthand_name = null;
        info.row_id = "";
        info.row_name = null;
        if (siteLayoutInfo.rows.length !== 0) {
          info.shorthand_name = siteLayoutInfo.rows[0].shorthand_name;
          info.row_id = siteLayoutInfo.rows[0].i;
          info.row_name = siteLayoutInfo.rows[0].name;
        }
      }

      this.payload.device_type = info.device_type;
      return info;
    } catch (err) {
      throw new Error("Error In get getEventMeta.. ", err);
    }
  }

  async getActiveCloudAlert() {
    try {
      console.log(this.payload.detection_type);
      console.log(this.getEventNames(this.payload.detection_type, true));
      return await exeQuery(db.checkCloudAlert, [
        this.payload.asset_id,
        this.getEventNames(this.payload.detection_type, true),
      ]);
    } catch (err) {
      throw new Error("Error In get ActiveCloudAlert.. ", err);
    }
  }
  getMessage(event_name, assetName, snap_addr, is_active, info) {
    let event_message = this.getEventMessages(event_name, is_active);
    console.log("event_message", event_message);
    let time_zone = "America/New_York";
    console.log("heree1 ", info);
    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);
    console.log("here ....");
    let timestamp = moment
      .tz(this.payload.timestamp, time_zone)
      .format("hh:mmA on MMM DD, YYYY");
    console.log("timestamp ", timestamp);
    event_message = event_message.replace("<current_timestamp>", timestamp);
    if (info.device_type === "Row Controller") {
      let detailId = snap_addr;
      if (info.shorthand_name !== null)
        detailId = `${info.shorthand_name} | ${detailId}`;
      if (info.row_name !== null) detailId = `${info.row_name} | ${detailId}`;
      event_message = event_message.replace(
        "<assetName>",
        `Row Box ${info.row_id}`
      );
      event_message = event_message.replace("<snap_addr>", detailId);
    } else {
      event_message = event_message.replace("<assetName>", assetName);
      event_message = event_message.replace("<snap_addr>", snap_addr);
    }

    if (this.payload.result.current_value >= 0) {
      event_message = event_message.replace(
        "<level>",
        this.payload.result.current_value
      );
    }
    if (this.payload.result.threshold >= 0) {
      event_message = event_message.replace(
        "<threshold>",
        this.payload.result.threshold
      );
    }

    return event_message;
  }

  getAssetName(eventMeta) {
    return eventMeta.name !== null
      ? eventMeta.name
      : eventMeta.device_type !== null
        ? eventMeta.detection_type
        : "Asset";
  }

  getTitle(info, assetName, snap_addr, active) {
    let title = this.getEventTitles(this.payload.detection_type, active);
    if (info.device_type === "Row Controller") {
      let detailId = snap_addr;
      if (info.shorthand_name !== null)
        detailId = `${info.shorthand_name} | ${detailId}`;
      if (info.row_name !== null) detailId = `${info.row_name} | ${detailId}`;
      title = title.replace("<assetName>", `Row Box ${info.row_id}`);
      title = title.replace("<snap_addr>", detailId);
    } else {
      title = title.replace("<assetName>", assetName);
      title = title.replace("<snap_addr>", snap_addr);
    }

    return title;
  }

  isAnomalyDetected() {
    return (
      (this.payload.last_anomaly_state === "Passed" ||
        this.payload.last_anomaly_state === null) &&
      this.payload.result.current_anomaly_state === "Failed"
    );
  }

  isAnomalyCleared() {
    return (
      (this.payload.last_anomaly_state === "Failed" ||
        this.payload.last_anomaly_state === null) &&
      this.payload.result.current_anomaly_state === "Passed"
    );
  }
  getIcons(type, active) {
    const ICONS = {
      poc_wakeup: {
        active: "cloud_intelligence",
        inactive: "cloud_intelligence_grey",
      },
      poc_nighttime_stow: {
        active: "cloud_intelligence",
        inactive: "cloud_intelligence_grey",
      },
      current_angle: {
        active: "cloud_intelligence",
        inactive: "cloud_intelligence_grey",
      },
    };
    return active ? ICONS[type].active : ICONS[type].inactive;
  }
  getEventNames(type, active) {
    const EVENT_NAMES = {
      poc_wakeup: {
        active: "ANOMALY-POC_WAKEUP",
        inactive: "ANOMALY-CLEARED_POC_WAKEUP",
      },
      poc_nighttime_stow: {
        active: "ANOMALY-POC_NIGHTTIME_STOW",
        inactive: "ANOMALY-CLEARED_POC_NIGHTTIME_STOW",
      },
      current_angle: {
        active: "ANOMALY-CURRENT_ANGLE",
        inactive: "ANOMALY_CLEARED-CURRENT_ANGLE",
      },
    };
    return active ? EVENT_NAMES[type].active : EVENT_NAMES[type].inactive;
  }
  getEventTitles(type, active) {
    const EVENT_TITLE = {
      poc_wakeup: {
        active: "Low Battery Anomaly Detected: <assetName> (<snap_addr>)",
        inactive: "Low Battery Anomaly Cleared: <assetName> (<snap_addr>)",
      },
      poc_nighttime_stow: {
        active: "Low Battery Anomaly Detected: <assetName> (<snap_addr>)",
        inactive: "Low Battery Anomaly Cleared: <assetName> (<snap_addr>)",
      },
      current_angle: {
        active: "Current Angle Anomaly Detected: <assetName> (<snap_addr>)",
        inactive: "Current Angle Anomaly Cleared: <assetName> (<snap_addr>)",
      },
    };
    return active ? EVENT_TITLE[type].active : EVENT_TITLE[type].inactive;
  }
  getEventMessages(type, active) {
    const EVENT_MSG = {
      poc_wakeup: {
        active:
          "The morning analysis of battery charge on <assetName> (<snap_addr>) triggered an anomaly at <current_timestamp>.  The most recent battery charge reported <level>% which below its historical threshold of <threshold>%",
        inactive:
          "The morning analysis of battery charge on <assetName> (<snap_addr>) cleared the previous anomaly at <current_timestamp>.  The most recent battery charge reported <level>% which is above its historical threshold of <threshold>%",
      },
      poc_nighttime_stow: {
        active:
          "The evening analysis of battery charge on <assetName> (<snap_addr>) triggered an anomaly at <current_timestamp>.  The most recent battery charge reported <level>% which below its historical threshold of <threshold>%",
        inactive:
          "The evening analysis of battery charge on <assetName> (<snap_addr>) cleared the previous anomaly at <current_timestamp>.  The most recent battery charge reported <level>% which is above its historical threshold of <threshold>%",
      },
      current_angle: {
        active:
          "The TerraTrak Machine Learning system has identified an issue with <assetName> (<snap_addr>) at <current_timestamp>.  The row is not tracking on its projected path.",
        inactive:
          "The Current Angle Anomaly for <assetName> (<snap_addr>) has cleared at <current_timestamp>.  The row is tracking on its projected path.",
      },
    };
    return active ? EVENT_MSG[type].active : EVENT_MSG[type].inactive;
  }

  async sendNotification(info) {
    console.log("====", info);
    let time_zone = "America/New_York";
    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);

    let timestamp = moment
      .tz(this.payload.timestamp, time_zone)
      .format("hh:mmA on MM/DD/YYYY ");
    info.timestamp = timestamp;
    info.device_type = info.device_type !== null ? info.device_type : "Asset";

    let notificationType = "anomaly_row_tracking";
    if (this.payload.detection_type === "current_angle")
      notificationType = "anomaly_row_tracking";
    if (this.payload.detection_type === "poc_nighttime_stow")
      notificationType = "anomaly_pm_battery_analysis";
    if (this.payload.detection_type === "poc_wakeup")
      notificationType = "anomaly_am_battery_analysis";

    var userAccounts = await notificationSettingService.getAccounts(
      info.site_id,
      notificationType
    );
    info.emailAddrs = userAccounts.emails;
    info.phoneNumbers = userAccounts.phone_nums;

    let asset_name = this.getAssetName(info);
    info.asset_name = asset_name;

    if (info.phoneNumbers.length > 0) {
      let smsText =
        info.site_name + " | " + info.eventTitle + " at " + timestamp;
      info.smsText = smsText;
      await this.sendSMSNotification(info);
    }
    if (info.emailAddrs.length > 0) {
      let status_text = info.title;
      info.status_text = info.device_type + " | " + status_text;
      let body_text = this.getMessage(
        this.payload.detection_type,
        asset_name,
        info.snap_addr,
        this.isAnomalyDetected(),
        info
      );

      info.body_text = body_text;
      let msgsubject =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name + " | " + info.device_type + " | " + status_text;
      info.msgSubject = msgsubject;
      await this.sendEmailNotification(info);
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
      console.log("Error in sendSMSNotification... " + e);
    }
  }
  async sendEmailNotification(payload) {
    try {
      let params = {};
      console.log("EMAILADRS: ", payload.emailAddrs);
      var emailData = {
        site_name: payload.site_name,
        status_text: payload.status_text,
        body_text: payload.body_text,
        asset_name: payload.asset_name,
        timestamp: payload.timestamp,
        project_name: payload.project_name,
        project_location: payload.project_location,
        s3_asset_url: getS3EmailAssetsUrl(),
        icon_url: getS3EmailAssetsUrl() + payload.icon_name,
        url: process.env.CLOUDUI_URL + ("/home/projects/" + payload.site_id + "/overview"),
        current_time: new Date(),
      };
      console.log(emailData);
      var templateHtml = Handlebars.compile(utils.emailTempSiteMode.toString());
      var bodyHtml = templateHtml(emailData);
      params.msgSubject = payload.msgSubject;
      params.msgbody = bodyHtml;
      // console.log(params);
      payload.emailAddrs.forEach(async (data) => {
        params.emailAddrs = [data];
        await aws_integration.sendEmail(params);
      });

      return true;
    } catch (e) {
      console.log("Error in sendEmailNotification... " + e);
    }
  }
}

exports.anomalyDetectionService = new AnomalyDetectionService();
