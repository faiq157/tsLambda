const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const utils = require("../utils");
const { acquireLock } = require("../utils/libs/execSync");
const { getS3EmailAssetsUrl } = require("../utils/libs/functions");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const { WindAlarm } = require("./windAlarm");
const { notificationService } = require("./common/notificationService");
const {getProjectDetailsBySiteId} = require("../models/project.model");

class WeatherAlarmService {
  async handler(client, pgWrite, payload) {
    this.client = client;
    this.pgWrite = pgWrite;
    this.payload = payload;
    try {
      return await this.processEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error WeatherAlarmService handler..!!!!",
        err
      );
    }
  }
  async processEvent() {
    const pauseWXFrozenAlerts = true;
    if (pauseWXFrozenAlerts) {
      console.log('wx frozen alerts paused, assetID: ', this?.payload?.asset_id);
      return;
    }
    let info = await this.updateMeta();

    if (info.device_type === 'Weather Station' && info.repeater_only === false) {
      //identify time period to get weather information for comparison
      let windAlarm = new WindAlarm(this.client, this.payload.asset_id);
      let isActiveAlarm = await windAlarm.sendNotifications();
      if (isActiveAlarm) {
        const {site_id} = this.payload;
        const project = await getProjectDetailsBySiteId(this.client, site_id);
        const {is_in_construction} = project;
        isActiveAlarm = !is_in_construction;
      }
      await this.processWeatherAlarm(info, isActiveAlarm);
      return true;
    } else {
      console.log('No wind alarm processing for row boxes & repeaters');
    }

  }

  async updateMeta() {
    var json = {};
    const assetsInfo = await this.client.query(db.assetinfo, [
      this.payload.asset_id,
    ]);
    const siteInfo = await this.client.query(db.siteInfoWS, [
      this.payload.asset_id,
    ]);

    await assetsInfo.rows.forEach(async (data) => {
      json.asset_id = data.asset_id;
      json.device_type = data.device_type;
      json.name = data.name;
      json.snap_addr = data.snap_addr;
      json.row_id = data.row_id;
      json.row_name = data.row_name;
      json.shorthand_name = data.shorthand_name;
      json.repeater_only = data.repeater_only;
    });

    json.name = this.getAssetName(json);
    json.timestamp = new Date(this.payload.timestamp);
    json.wind_speed = this.payload.wind_speed;
    json.wind_direction = this.payload.wind_direction;
    json.snow_depth = this.payload.snow_depth;
    json.temperature = this.payload.temperature;
    json.peak_wind_speed = this.payload.peak_wind_speed;
    json.average_wind_speed = this.payload.average_wind_speed;
    if (siteInfo.rows.length) {
      json.site_id = siteInfo.rows[0].site_id;
      json.is_notify = siteInfo.rows[0].is_notify;
      json.site_name = siteInfo.rows[0].site_name;
      json.project_name = siteInfo.rows[0].project_name;
      json.project_id = siteInfo.rows[0].project_id;
      json.project_location = siteInfo.rows[0].project_location;
      json.location_lat = siteInfo.rows[0].location_lat;
      json.location_lng = siteInfo.rows[0].location_lng;
    }
    json.multipleSites = await notificationService.checkProjectSites(this.client, json.project_id);
    console.log(json);
    return json;
  }

  getAssetName(info) {
    let assetName =
      (info.name !== null
        ? info.name
        : info.device_type !== null
          ? info.device_type
          : "ASSET") +
      ("(" + info.snap_addr + ")");
    if (info.device_type === "Row Controller") {
      assetName =
        "Row Box " +
        (info.row_id !== null ? info.row_id : "") +
        " (" +
        (info.row_name !== null ? info.row_name + " | " : "") +
        (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
        info.snap_addr +
        ")";
    }
    return assetName;
  }

  mapSiteInfo(info, siteInfo) {
    info.site_id = siteInfo.site_id;
    info.site_name = siteInfo.site_name;
    info.device_type = siteInfo.device_type;
    info.location_lat = siteInfo.location_lat;
    info.location_lng = siteInfo.location_lng;
    info.asset_name = siteInfo.asset_name;
    info.project_name = siteInfo.project_name;
    info.project_id = siteInfo.project_id;
    info.project_location = siteInfo.project_location;
    info.is_notify = siteInfo.is_notify;

    return info;
  }

  async processWeatherAlarm(info, isActiveAlarm) {
    console.log("processing weather Alarm ", isActiveAlarm);
    try {
      let event_name = "Ws_Frozen";
      var userAccounts = await notificationSettingService.getAccounts(
        this.client,
        info.site_id,
        "ws_frozen"
      );
      if (userAccounts) {
        info.emailAddrs = userAccounts.emails;
        info.phoneNumbers = userAccounts.phone_nums;
      }
      await acquireLock(
        "locks:wxalarm:" + this.payload.asset_id,
        3000,
        // Things to do while being in locked state
        async () => {
          const activeAlert = await this.getActiveAlert(event_name);
          console.log("Active Alert", activeAlert);

          if (isActiveAlarm === true) {
            if (activeAlert.length === 0) {
              //add alert & add logs
              await this.addAlert(event_name, info, isActiveAlarm);
              await this.addEventLog(event_name, info, isActiveAlarm);
              if (info.is_notify) {
                this.processNotification(info, isActiveAlarm);
              }
            } else {
              console.log("Alert already exists");
            }
          } else {
            //if have active alert then clear alert & fire stop event
            if (activeAlert.length > 0) {
              await this.clearAlert(activeAlert[0].id);
              event_name = "Ws_Frozen_Stop";
              await this.addEventLog(event_name, info, isActiveAlarm);
              if (info.is_notify) {
                this.processNotification(info, isActiveAlarm);
              }
            }
          }
        });

    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error processWeatherAlarm..!!",
        err
      );
    }
  }

  async getActiveAlert(event_name) {
    try {
      const checkAlert = await this.client.query(db.checkCloudAlert, [
        this.payload.asset_id,
        event_name,
      ]);
      return checkAlert.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getActiveAlert..!!", err);
    }
  }

  async addAlert(event_name, info, isActiveAlarm) {
    try {
      const res = await this.pgWrite.query(db.addFullCloudAlertQuery, [
        event_name,
        new Date(this.payload.timestamp),
        this.payload.asset_id,
        2,
        true,
        this.getEventTitle(info, isActiveAlarm),
        this.getEventICon(isActiveAlarm),
        this.getEventMessage(info, isActiveAlarm),
      ]);
      console.log("ADD ALERT: ", res);
      return res;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addAlert..!!", err);
    }
  }

  async clearAlert(alertId) {
    try {
      console.log("Delete Cloud Alert: ", alertId);
      await cloudAlertService.clearAlertDetail(this.pgWrite, alertId);
      return await this.pgWrite.query(db.removeCloudAlert, [alertId]);
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error clearAlert..!!", err);
    }
  }
  async addEventLog(event_name, info, isActiveAlarm) {
    try {
      //name,levelno,created,asset_id,type,title,icon,message
      const addEventRes = await this.pgWrite.query(
        db.addFullCloudEventLogQuery,
        [
          event_name,
          20,
          new Date(this.payload.timestamp),
          this.payload.asset_id,
          2,
          this.getEventTitle(info, isActiveAlarm),
          this.getEventICon(isActiveAlarm),
          this.getEventMessage(info, isActiveAlarm),
        ]
      );
      console.log("Add event for " + event_name + " :", addEventRes);
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addEventLog..!!", err);
    }
  }
  getEventSubject(info, isActive) {
    let title = null;
    if (isActive) {
      title = (info.device_type !== null ? info.device_type : "Asset") + " | " + "Wind Sensor Reporting Issue";
    } else {
      title = (info.device_type !== null ? info.device_type : "Asset") + " | " + "Wind Sensor Reporting Issue Cleared: " + info.name;
    }

    return title;
  }
  getEventTitle(info, isActive) {
    let title = null;
    if (isActive) {
      title = "Wind Sensor Reporting Issue: " + info.name;
    } else {
      title = "Wind Sensor Reporting Issue Cleared: " + info.name;
    }

    return title;
  }
  getEventMessage(info, isActive) {
    if (isActive) {
      return " TerraTrak Cloud Sense has identified an issue with the wind sensor attached to this weather station. The values reported by the wind sensor have not changed in the past 8 hours. Please consider stowing the project site until the issue with the wind sensor is resolved.";
    } else {
      return " Changing wind values are being reported again on this weather station. This TerraTrak Cloud Sense alert has been cleared.";
    }
  }

  getEmailMessage(info, isActive) {
    if (isActive) {
      return ` TerraTrak Cloud Sense has identified an issue with the wind sensor attached to this weather station (${this.getAssetName(info)}). The values reported by the wind sensor have not changed in the past 8 hours. Please consider stowing the project site until the issue with the wind sensor is resolved.`;
    } else {
      return ` Changing wind values are being reported again on this weather station (${this.getAssetName(info)}). This TerraTrak Cloud Sense alert has been cleared.`;
    }
  }
  getEventICon(isActive) {
    if (isActive) {
      return "cloud_intelligence";
    } else {
      return "cloud_intelligence_grey";
    }
  }
  async processNotification(info, isActiveAlarm) {
    info.status_text = this.getEventSubject(info, isActiveAlarm);
    info.message = this.getEmailMessage(info, isActiveAlarm);
    info.icon_name = this.getEventICon(isActiveAlarm) + "_48x48.png";
    if (info.phoneNumbers.length > 0) await this.sendSmsNotification(info);
    if (info.emailAddrs.length > 0) await this.sendNotification(info);
    return true;
  }
  async sendSmsNotification(info) {
    try {
      console.log("Process Weather Station SMS Notification: ", info);

      let time_zone = "America/New_York";
      if (info.location_lat !== "" && info.location_lng !== "")
        time_zone = tzlookup(info.location_lat, info.location_lng);

      let timestamp = moment
        .tz(info.timestamp, time_zone)
        .format("MM/DD/YYYY hh:mmA ");
      console.log("TIME: ", timestamp);
      let asset_name =
        info.asset_name !== null && info.asset_name !== undefined
          ? info.asset_name
          : "Asset";
      console.log(asset_name);
      console.log("PHONENUMS: ", info.phoneNumbers);
      await info.phoneNumbers.forEach(async (data) => {
        let params = {};
        params.phoneNumber = data;
        params.msgText =
          (info.multipleSites ? info.project_name + " | " : "") +
          info.site_name +
          ("\n" + info.status_text) +
          ("\n" + timestamp + (info.message === null ? "" : ": ")) +
          (info.message === null ? "" : info.message);
        console.log(">>>>", info);
        console.log(params);
        await aws_integration.sendSMS(params);
      });
    } catch (e) {
      console.error("SMS Application ERROR:", e);
    }
    return true;
  }
  async sendNotification(info) {
    console.log("Process Weather Station Notification: ", info);
    try {
      if (info) {
        let params = {};

        let time_zone = "America/New_York";
        if (info.location_lat !== "" && info.location_lng !== "")
          time_zone = tzlookup(info.location_lat, info.location_lng);

        let timestamp = moment
          .tz(info.timestamp, time_zone)
          .format("MM/DD/YYYY hh:mmA ");

        console.log("TIME: ", timestamp);
        let asset_name =
          info.name !== null && info.name !== undefined ? info.name : "Asset";
        console.log(asset_name);
        console.log("EMAILIDS", info.emailAddrs);
        if (info.emailAddrs.length > 0) {
          var emailData = {
            is_multiSites: info.multipleSites,
            site_name: info.site_name,
            status_text: info.status_text,
            body_text: info.message,
            asset_name: asset_name,
            timestamp: timestamp,
            project_name: info.project_name,
            project_location: info.project_location,
            s3_asset_url: getS3EmailAssetsUrl(),
            icon_url: getS3EmailAssetsUrl() + info.icon_name,
            url: process.env.CLOUDUI_URL + ("/home/projects/" + info.site_id + "/overview"),
            current_time: new Date(),
          };
          console.log(emailData);
          var templateHtml = Handlebars.compile(
            utils.emailTempWeatherNotifications.toString()
          );
          var bodyHtml = templateHtml(emailData);
          console.log("EMAILIDS: ", info.emailAddrs);
          // params.emailAddrs = info.emailAddrs;
          params.msgbody = bodyHtml;
          params.msgSubject =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            " | " + info.status_text;
          //console.log(params);
          info.emailAddrs.forEach(async (data) => {
            params.emailAddrs = [data];
            await aws_integration.sendEmail(params);
          });
        }
      } else {
        console.log("NO Notif");
      }
    } catch (e) {
      console.error("WS Application ERROR:", e);
    }
    return true;
  }
}

exports.weatherAlarmService = new WeatherAlarmService();
