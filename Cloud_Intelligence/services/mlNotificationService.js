const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const aws_integration = require("../aws_integration");
const utils = require("../utils");
const { getS3EmailAssetsUrl, isLinkedRow } = require("../utils/libs/functions");
const { notificationService } = require("./common/notificationService");
const { getActiveAlertByAssetId, removeCloudAlert, addCloudAlert } = require("../models/cloudAlert.model");
const { addFullCloudEventLog } = require("../models/cloudEventLog.model");
const { CloudAlertsHelperModel } = require("../models/cloudAlertsHelper.model");
const { getAssetAndSiteLayoutByAssetId } = require("../models/asset.model");
const { deviceTypeNames } = require("../utils/constants");

class MLNotificationService {
  async handler(client, pgWrite, payload) {
    this.client = client;
    this.pgWrite = pgWrite;
    this.payload = payload;
    try {
      // await pgWrite.connect();
      return await this.processMLEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error MLNotificationService handler..!!",
        err
      );
    }
  }

  async processMLEvent() {
    const eventMeta = await this.getEventMeta();
    if (eventMeta) {
      if (eventMeta.repeater_only === true && this.payload.ml_type === 'current_angle') {
        console.log("No ML notifications for repeaters")
      } else {
        //Due Date Conversion
        // await this.convertDueDateByTimeZone(eventMeta);
        // await this.convertEventTimeByZone(eventMeta);
        const linkedRowDetails = await getAssetAndSiteLayoutByAssetId(this.client, this.payload.asset_id);
        const assetName = this.getAssetName(eventMeta);
        const { snap_addr } = eventMeta;

        const cloudAlert = await this.getActiveCloudAlert();
        if (this.isMLFaliureDetected()) {
          // let eventTitle = this.getTitle(assetName, snap_addr, true);
          // eventMeta.eventTitle = eventTitle;

          let title = this.getEventTitles(this.payload.ml_type, true);
          title = title.replace("<snap_addr>", snap_addr);
          eventMeta.title = title;
          eventMeta.eventTitle = title;
          if (!cloudAlert) {
            return this.generateAnomalyAlert(
              title,
              assetName,
              snap_addr,
              eventMeta,
              linkedRowDetails
            );
          } else if (cloudAlert &&
            moment(this.payload.timestamp).isAfter(cloudAlert.created)
          ) {
            return this.updateActiveCloudAlert(
              title,
              assetName,
              snap_addr,
              eventMeta,
              cloudAlert.id
            );
          }
        } else if (this.isMLFaliureCleared() && cloudAlert) {
          // let eventTitle = this.getTitle(assetName, snap_addr, false);
          // eventMeta.eventTitle = eventTitle;
          let title = this.getEventTitles(this.payload.ml_type, false);
          title = title.replace("<snap_addr>", snap_addr);
          eventMeta.title = title;
          eventMeta.eventTitle = title;
          return this.clearAnomalyAlert(
            title,
            assetName,
            snap_addr,
            cloudAlert.id,
            eventMeta,
            linkedRowDetails
          );
        }
        return true;
      }

    } else {
      return "Asset Not Found";
    }
  }
  async convertDueDateByTimeZone(info) {
    let time_zone = "America/New_York";
    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);

    let timestamp = moment
      .tz(this.payload.next_due_date, time_zone)
      .format("hh:mmA on MMM DD, YYYY");
    this.payload.next_due_date = timestamp;
  }
  async convertEventTimeByZone(info) {
    let time_zone = "America/New_York";
    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);

    let timestamp = moment
      .tz(this.payload.timestamp, time_zone)
      .format("hh:mmA on MMM DD, YYYY");
    this.payload.timestamp = timestamp;
  }
  async generateAnomalyAlert(eventTitle, assetName, snap_addr, eventMeta, linkedRowDetails) {
    const {
      linkRowType,
      linkRowRef,
      device_type,
    } = linkedRowDetails
    await this.addCloudAlert(eventTitle, assetName, eventMeta, linkedRowDetails);
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
    linkedRowDetails
  ) {
    const {
      linkRowType,
      linkRowRef,
      row_id,
      row_name,
      shorthand_name,
      asset_name,
      device_type,
    } = linkedRowDetails;
    const isLinked = isLinkedRow(linkRowType, linkRowRef, device_type);
    await this.clearAlert(alertId);
    if (isLinked) {

      const {dueDate, currentTime} = this.getCurrentAndDueDates(eventMeta)

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

      if (this.payload.ml_type === "poc") {
        await CloudAlertsHelperModel.addMLIssueClearedPocAlert(
          this.pgWrite,
          leaderInfo,
          childInfo,
          true,
          currentTime,
          dueDate,
          notificationsOptions
        );
      } else if (this.payload.ml_type === "current_angle") {
        await CloudAlertsHelperModel.addMLIssueClearedCurrentAngleAlert(
          this.pgWrite,
          leaderInfo,
          childInfo,
          true,
          currentTime,
          dueDate,
          notificationsOptions
        );
      }
    } else {
      await this.addEventLog(
        eventTitle,
        assetName,
        snap_addr,
        false,
        eventMeta
      );
      await this.sendNotification(eventMeta);
    }
    return true;
  }

  async clearAlert(alertId) {
    try {
      console.log("Delete Cloud Alert: ", alertId);
      await cloudAlertService.clearAlertDetail(this.pgWrite, alertId);
      return removeCloudAlert(this.pgWrite, alertId);
    } catch (err) {
      throw new Error("Error In get clearAlert.. ", err);
    }
  }

  async addCloudAlert(eventTitle, assetName, info, linkedRowDetails) {
    try {
      const {
        linkRowType,
        linkRowRef,
        row_id,
        row_name,
        shorthand_name,
        asset_name,
        snap_addr,
        device_type,
      } = linkedRowDetails

      if (isLinkedRow(linkRowType, linkRowRef, device_type)) {

        const leaderInfo = {
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
          assetId : this.payload.asset_id,
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

        const {currentTime} = this.getCurrentAndDueDates(info)

        if (this.payload.ml_type === "poc") {
          await CloudAlertsHelperModel.addMLIssuePocAlert(
            this.pgWrite,
            leaderInfo,
            childInfo,
            true,
            currentTime,
            notificationsOptions
          );
        } else if (this.payload.ml_type === "current_angle") {
          await CloudAlertsHelperModel.addMLIssueCurrentAngleAlert(
            this.pgWrite,
            leaderInfo,
            childInfo,
            true,
            currentTime,
            notificationsOptions
          );
        }
      } else {
        return await addCloudAlert(
          this.pgWrite,
          this.payload.asset_id,
          this.getEventNames(this.payload.ml_type, true),
          this.payload.timestamp,
          eventTitle,
          this.getIcons(this.payload.ml_type, true),
          this.getMessage(this.payload.ml_type, assetName, snap_addr, info),
          this.payload.device_type === "Network Controller" ? 1 : 2,
          30
        );
      }
    } catch (err) {
      throw new Error("Error In get addCloudAlert.. ", err);
    }
  }

  async updateActiveCloudAlert(
    eventTitle,
    assetName,
    snap_addr,
    info,
    alert_id
  ) {
    try {
      console.log(db.updateActiveAlert, [
        this.getMessage(this.payload.ml_type, assetName, snap_addr, info),
        this.payload.timestamp,
        alert_id,
      ]);
      return await this.pgWrite.query(db.updateActiveAlert, [
        this.getMessage(this.payload.ml_type, assetName, snap_addr, info),
        this.payload.timestamp,
        alert_id,
      ]);
    } catch (err) {
      throw new Error("Error In updateCloudAlert.. ", err);
    }
  }

  async addEventLog(eventTitle, assetName, snap_addr, isActive, info) {
    try {
      let addRes = await addFullCloudEventLog(
        this.pgWrite,
        this.payload.asset_id,
        30,
        this.payload.timestamp,
        this.getEventNames(this.payload.ml_type, isActive),
        this.getMessage(this.payload.ml_type, assetName, snap_addr, info),
        eventTitle,
        this.getIcons(this.payload.ml_type, isActive),
        30

      );
      console.log("EventLogRes", addRes);
      return addRes;
    } catch (err) {
      throw new Error("Error In get addEventLog.. ", err);
    }
  }

  async getEventMeta() {
    try {

      let assetsInfoByAddr = await this.client.query(db.metaInfoByAssetId, [
        this.payload.asset_id,
      ]);

      if (assetsInfoByAddr.rows[0].device_type === "Network Controller") {
        assetsInfoByAddr = await this.client.query(db.metaInfoByNCAssetId, [
          this.payload.asset_id,
        ]);
        // console.log("RES: ", assetsInfoByAddr.rows);
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
      info.multipleSites = await notificationService.checkProjectSites(this.client, info.project_id);
      this.payload.device_type = info.device_type;
      return info;
    } catch (err) {
      throw new Error("Error In get getEventMeta.. ", err);
    }
  }

  async getActiveCloudAlert() {
    try {
      console.log(this.payload.ml_type);
      console.log(this.getEventNames(this.payload.ml_type, true));
      return getActiveAlertByAssetId(
        this.client,
        this.payload.asset_id,
        this.getEventNames(this.payload.ml_type, true));
    } catch (err) {
      throw new Error("Error In get ActiveCloudAlert.. ", err);
    }
  }
  getMessage(event_name, assetName, snap_addr, info) {
    let time_zone = "America/New_York";
    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);

    let due_date = moment
      .tz(this.payload.next_due_date, time_zone)
      .format("hh:mmA on MMM DD, YYYY");

    let timestamp = moment
      .tz(this.payload.timestamp, time_zone)
      .format("hh:mmA on MMM DD, YYYY");
    let event_message = this.getEventMessages(event_name, this.payload.success);
    console.log(event_message);
    event_message = event_message.replace("<due_date>", due_date);
    event_message = event_message.replace("<current_time>", timestamp);
    if (assetName === undefined) {
      event_message = event_message.replace("<assetName>", "");
    } else {
      event_message = event_message.replace("<assetName>", assetName);
    }
    event_message = event_message.replace("<snap_addr>", snap_addr);
    return event_message;
  }

  getAssetName(eventMeta) {
    return eventMeta.name !== null
      ? eventMeta.name
      : eventMeta.device_type !== null
        ? eventMeta.detection_type
        : "Asset";
  }

  getTitle(assetName, snap_addr, active) {
    return active
      ? assetName +
      (" (" + snap_addr + "): ") +
      this.getEventTitles(this.payload.ml_type, true)
      : assetName +
      (" (" + snap_addr + "): ") +
      this.getEventTitles(this.payload.ml_type, false);
  }

  isMLFaliureDetected() {
    return this.payload.success === false;
  }

  isMLFaliureCleared() {
    return this.payload.success === true;
  }
  getIcons(type, active) {
    const ICONS = {
      poc: {
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
      poc: {
        active: "ML_ISSUE-POC",
        inactive: "ML_ISSUE-CLEARED_POC",
      },
      current_angle: {
        active: "ML_ISSUE-CURRENT_ANGLE",
        inactive: "ML_ISSUE_CLEARED-CURRENT_ANGLE",
      },
    };
    return active ? EVENT_NAMES[type].active : EVENT_NAMES[type].inactive;
  }
  getEventTitles(type, active) {
    const EVENT_TITLE = {
      poc: {
        active:
          "TerraTrak CloudSense: Machine Learning Issue Detected - Battery Charge Analysis Failed (<snap_addr>)",
        inactive:
          "TerraTrak CloudSense: Machine Learning Issued Cleared - Battery Charge Analysis (<snap_addr>)",
      },
      current_angle: {
        active:
          "TerraTrak CloudSense: Machine Learning Issue Detected - Current Angle Analysis Failed (<snap_addr>)",
        inactive:
          "TerraTrak CloudSense: Machine Learning Issued Cleared - Current Angle Analysis (<snap_addr>)",
      },
    };
    return active ? EVENT_TITLE[type].active : EVENT_TITLE[type].inactive;
  }
  getEventMessages(type, active) {
    const EVENT_MSG = {
      poc: {
        inactive:
          "TerraTrak`s Machine Learning Platform was unable to complete the Battery Charge Analysis for <assetName> (<snap_addr>) at <current_time>. The system will re-run the analysis at <due_date>.",
        active:
          "The Battery Charge Analysis for <assetName> (<snap_addr>) has completed processing at <current_time>",
      },
      current_angle: {
        inactive:
          "TerraTrak`s Machine Learning Platform was unable to complete the Current Angle Analysis for <assetName> (<snap_addr>) at <current_time>. The system will re-run the analysis at <due_date>.",
        active:
          "The Current Angle Analysis for <assetName> (<snap_addr>) has completed processing at <current_time>",
      },
    };
    return active ? EVENT_MSG[type].active : EVENT_MSG[type].inactive;
  }

  async sendNotification(info) {
    console.log("Info", info);

    let time_zone = "America/New_York";
    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);

    let timestamp = moment
      .tz(this.payload.timestamp, time_zone)
      .format("hh:mmA on MMM DD, YYYY");
    info.timestamp = timestamp;
    info.device_type = info.device_type !== null ? info.device_type : "Asset";

    let notificationType = "ml_row_tracking";
    if (this.payload.ml_type === "current_angle")
      notificationType = "ml_row_tracking";
    if (this.payload.ml_type === "poc")
      notificationType = "ml_battery_analysis";

    var userAccounts = await notificationSettingService.getAccounts(
      this.client,
      info.site_id,
      notificationType,
      true
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
      info.status_text = info.eventTitle;
      let body_text = await this.getMessage(
        this.payload.ml_type,
        asset_name,
        info.snap_addr,
        info
      );
      info.body_text = body_text;
      let msgsubject = (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name + " | " + info.device_type + " - " + status_text;
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
      // params.emailAddrs = payload.emailAddrs;
      params.msgbody = bodyHtml;
      //console.log(params);
      //await aws_integration.sendEmail(params);
      payload.emailAddrs.forEach(async (data) => {
        params.emailAddrs = [data];
        await aws_integration.sendEmail(params);
      });
      return true;
    } catch (e) {
      console.log("Error in sendEmailNotification... " + e);
    }
  }

  getCurrentAndDueDates(eventMeta){
    let time_zone = "America/New_York";
    if (eventMeta.location_lat !== "" && eventMeta.location_lng !== "")
      time_zone = tzlookup(eventMeta.location_lat, eventMeta.location_lng);

      const dueDate = moment
      .tz(this.payload.next_due_date, time_zone)
      .format("hh:mmA on MMM DD, YYYY");

      const currentTime = moment
      .tz( this.payload.timestamp, time_zone)
      .format("hh:mmA on MMM DD, YYYY");

      return {
        dueDate,
        currentTime
      }
  }
}

exports.mlNotificationService = new MLNotificationService();
