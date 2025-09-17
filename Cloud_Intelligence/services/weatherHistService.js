const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const utils = require("../utils");
const {getS3EmailAssetsUrl} = require("../utils/libs/functions");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const { notificationService } = require("./common/notificationService");
const { getDeviceTypeNameFromAssetType } = require("../utils/constants");

class WeatherHistService {
  async handler(client, pgWrite, payload) {
    this.client = client;
    this.pgWrite = pgWrite;
    this.payload = payload;
    try {
      await this.processEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error WeatherHistService handler..!!!",
        err
      );
    }
  }
  async processEvent() {
    let info = await this.updateMeta();
     //Get last weather Update to check if change in current values or not
    const lastWeatherUpdate = await this.getLastWeatherHist();
    console.log(lastWeatherUpdate);

    //Flagging Weather Station Increased reporting - when a weather station is reporting values that are at 75% of the thresholds, we should notify user via UI and send Notifications.

    //1. Get site_conf threshold values
    //console.log(db.siteInfoByAssetId);
    let siteConf = await this.getSiteThresholdConf();
    siteConf = siteConf[0];
    if (siteConf.length === 0) {
      console.log("No siteConf found");
      return false;
    } else {
      info = this.mapSiteInfo(info, siteConf);
      info.multipleSites = await notificationService.checkProjectSites(this.client,info.project_id);
      console.log(info);
      console.log(siteConf);
      const wind_speed_threshold = siteConf.wind_speed_threshold;
      const gust_threshold = siteConf.gust_threshold;
      const snow_depth_threshold = siteConf.snow_depth_threshold;
      const panel_snow_depth_threshold = siteConf.panel_snow_depth_threshold;
      let wind_reporting_close_percentage =
        siteConf.wind_reporting_close_percentage;
      let snow_reporting_close_percentage =
        siteConf.snow_reporting_close_percentage;

      if (wind_reporting_close_percentage === null)
        wind_reporting_close_percentage = 75;

      if (snow_reporting_close_percentage === null)
        snow_reporting_close_percentage = 75;

      if (wind_speed_threshold) {
        /* if (this.payload.increase_avg_wind_reporting !== 3) {
          await this.processIncreaseWeatherEvent(
            info,
            wind_speed_threshold,
            "WIND_SPEED",
            lastWeatherUpdate,
            wind_reporting_close_percentage
          );
        } else {*/
        await this.updateCloudAlertOnValueChange(
          info,
          wind_speed_threshold,
          "WIND_SPEED",
          lastWeatherUpdate,
          wind_reporting_close_percentage
        );
        //}
      }

      if (gust_threshold) {
        /*if (this.payload.increase_wind_gust_reporting !== 3) {
          await this.processIncreaseWeatherEvent(
            info,
            gust_threshold,
            "WIND_GUST",
            lastWeatherUpdate,
            wind_reporting_close_percentage
          );
        } else {*/
        await this.updateCloudAlertOnValueChange(
          info,
          gust_threshold,
          "WIND_GUST",
          lastWeatherUpdate,
          wind_reporting_close_percentage
        );
        // }
      }

      if (snow_depth_threshold && info.device_type === "Weather Station")
        await this.updateCloudAlertOnValueChange(
          info,
          snow_depth_threshold,
          "SNOW_DEPTH",
          lastWeatherUpdate,
          wind_reporting_close_percentage
        );
      // await this.processIncreaseWeatherEvent(
      //   info,
      //   snow_depth_threshold,
      //   "SNOW_DEPTH",
      //   lastWeatherUpdate,
      //   snow_reporting_close_percentage
      // );

      if (panel_snow_depth_threshold && info.device_type !== "Weather Station")
        await this.updateCloudAlertOnValueChange(
          info,
          panel_snow_depth_threshold,
          "PANEL_SNOW_DEPTH",
          lastWeatherUpdate,
          wind_reporting_close_percentage
        );
      // await this.processIncreaseWeatherEvent(
      //   info,
      //   panel_snow_depth_threshold,
      //   "PANEL_SNOW_DEPTH",
      //   lastWeatherUpdate,
      //   snow_reporting_close_percentage
      // );
    }
    return true;
  }

  async updateMeta() {
    var json = {};
    const assetsInfo = await this.client.query(db.assetinfo, [
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
    });
    json.name = this.getAssetName(json);
    json.timestamp = new Date(this.payload.timestamp);
    json.wind_speed = this.payload.wind_speed;
    json.wind_direction = this.payload.wind_direction;
    json.snow_depth = this.payload.snow_depth;
    json.temperature = this.payload.temperature;
    json.peak_wind_speed = this.payload.peak_wind_speed;
    json.average_wind_speed = this.payload.average_wind_speed;
    return json;
  }

  getAssetName(info) {
    let assetName =
      info.name !== null
        ? info.name
        : info.device_type !== null
        ? info.device_type
        : "ASSET";
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
    info.device_type = getDeviceTypeNameFromAssetType(siteInfo.asset_type);
    info.location_lat = siteInfo.location_lat;
    info.location_lng = siteInfo.location_lng;
    info.asset_name = siteInfo.asset_name;
    info.project_name = siteInfo.project_name;
    info.project_id = siteInfo.project_id;
    info.project_location = siteInfo.project_location;
    info.is_notify = siteInfo.is_notify;

    return info;
  }

  async getLastWeatherHist() {
    try {
      const lastWeatherUpdate = await this.client.query(db.lastWeatherHist, [
        this.payload.asset_id,
        this.payload.timestamp,
      ]);
      return lastWeatherUpdate.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getLastWeatherHist..!!",
        err
      );
    }
  }

  async getSiteThresholdConf() {
    try {
      const siteConfResult = await this.client.query(db.siteInfoByAssetId, [this.payload.asset_id ]);
      return siteConfResult.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getSiteThresholdConf..!!",
        err
      );
    }
  }
  async updateCloudAlertOnValueChange(
    info,
    threshold,
    type,
    lastWeatherUpdate,
    configPercentage
  ) {
    console.log("processing update alert process for ", type);
    try {
      let event_name = this.getEventName(type);
      const activeAlert = await this.getActiveAlert(event_name);
      console.log("Active Alert", activeAlert);
      if (lastWeatherUpdate.length > 0) {
        if (this.compareWeatherValues(type, lastWeatherUpdate)) {
          //if already have active alert just update the values & do not log it
          if (activeAlert.length > 0) {
            //update alert values
            let percentage = this.getPercentage(type, threshold);
            if (percentage >= configPercentage) {
              await this.updateActiveAlert(
                activeAlert[0].id,
                info,
                threshold,
                event_name,
                configPercentage
              );
            }
          }
        } else {
          console.log("No value change");
        }
      } else {
        console.log("No last update found in database");
      }
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error updateCloudAlertOnValueChange..!!",
        err
      );
    }
  }

  async processIncreaseWeatherEvent(
    info,
    threshold,
    type,
    lastWeatherUpdate,
    configPercentage
  ) {
    console.log("processing event for ", type);
    try {
      //get percentage
      let isActive = false;
      if (
        type === "WIND_SPEED" &&
        this.payload.increase_avg_wind_reporting === 1
      ) {
        isActive = true;
      }
      if (
        type === "WIND_GUST" &&
        this.payload.increase_wind_gust_reporting === 1
      ) {
        isActive = true;
      }
      if (type === "SNOW_DEPTH") {
        console.log("SNOW_DEPTH ");
        let percentage = this.getPercentage(type, threshold);
        if (percentage >= configPercentage) {
          isActive = true;
        }
      }
      if (type === "PANEL_SNOW_DEPTH") {
        console.log("Deep panel ");
        let percentage = this.getPercentage(type, threshold);
        if (percentage >= configPercentage) {
          isActive = true;
        }
      }

      let event_name = this.getEventName(type);
      var userAccounts = await notificationSettingService.getAccounts(
        this.client,
        info.site_id,
        "ws_inc_repo_" + type.toString().toLowerCase()
      );
      if (userAccounts) {
        info.emailAddrs = userAccounts.emails;
        info.phoneNumbers = userAccounts.phone_nums;
      }
      const activeAlert = await this.getActiveAlert(event_name);
      console.log("Active Alert", activeAlert);
      //check if value is greather then and equal to 75% of thresold
      // if (percentage >= configPercentage) {
      if (isActive === true) {
        if (lastWeatherUpdate.length > 0) {
          if (this.compareWeatherValues(type, lastWeatherUpdate)) {
            //if no active alert add alert & log it
            //if already have active alert just update the values & do not log it
            if (activeAlert.length > 0) {
              //update alert values
              let percentage = this.getPercentage(type, threshold);
              if (percentage >= configPercentage) {
                await this.updateActiveAlert(
                  activeAlert[0].id,
                  info,
                  threshold,
                  event_name,
                  configPercentage
                );
              }
            } else {
              //add alert & add logs
              await this.addAlert(
                event_name,
                info,
                threshold,
                configPercentage
              );
              await this.addEventLog(
                event_name,
                info,
                threshold,
                configPercentage
              );
              if (info.is_notify) {
                this.processNotification(
                  event_name,
                  info,
                  threshold,
                  configPercentage
                );
              }
            }
          } else {
            if (activeAlert.length === 0) {
              //add alert & add logs
              await this.addAlert(
                event_name,
                info,
                threshold,
                configPercentage
              );
              await this.addEventLog(
                event_name,
                info,
                threshold,
                configPercentage
              );
              if (info.is_notify) {
                this.processNotification(
                  event_name,
                  info,
                  threshold,
                  configPercentage
                );
              }
            }
          }
        } else {
          //if no active alert add alert & log it
          await this.addAlert(event_name, info, threshold, configPercentage);
          await this.addEventLog(event_name, info, threshold, configPercentage);
          if (info.is_notify) {
            this.processNotification(
              event_name,
              info,
              threshold,
              configPercentage
            );
          }
        }
      } else {
        //if have active alert then clear alert & fire stop event
        if (activeAlert.length > 0) {
          await this.clearAlert(activeAlert[0].id);
          event_name = this.getEventName(type, false);

          await this.addEventLog(event_name, info, threshold, configPercentage);
          if (info.is_notify) {
            this.processNotification(
              event_name,
              info,
              threshold,
              configPercentage
            );
          }
        }
      }
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error processIncreaseWeatherEvent..!!",
        err
      );
    }
  }

  async getActiveAlert(event_name) {
    try {
      const checkAlert = await this.client.query(
        db.checkCloudAlertByLinkedAsset,
        [this.payload.asset_id, event_name]
      );
      return checkAlert.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getActiveAlert..!!", err);
    }
  }
  async addAlert(event_name, info, threshold, percentage) {
    try {
      const res = await this.pgWrite.query(db.addFullCloudAlertQuery, [
        event_name,
        new Date(this.payload.timestamp),
        this.payload.asset_id,
        2,
        true,
        this.getEventTitle(event_name, info),
        this.getEventICon(event_name),
        this.getEventMessage(event_name, info, threshold, percentage),
      ]);
      console.log("ADD ALERT: ", res);
      return res;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addAlert..!!", err);
    }
  }

  async updateActiveAlert(alertId, info, threshold, event_name, percentage) {
    try {
      const updateAlert = await this.pgWrite.query(db.updateActiveAlert, [
        this.getEventMessage(event_name, info, threshold, percentage),
        this.payload.timestamp,
        alertId,
      ]);
      console.log("updateActiveAlert: ", updateAlert);
      return updateAlert;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error updateActiveAlert..!!",
        err
      );
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

  async addEventLog(event_name, info, threshold, percentage) {
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
          this.getEventTitle(event_name, info),
          this.getEventICon(event_name),
          this.getEventMessage(event_name, info, threshold, percentage),
        ]
      );
      console.log("Add event for " + event_name + " :", addEventRes);
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addEventLog..!!", err);
    }
  }
  compareWeatherValues(type, lastWeatherUpdate) {
    let result = false;
    switch (type) {
      case "WIND_SPEED":
        result =
          lastWeatherUpdate[0].average_wind_speed !==
          this.payload.average_wind_speed
            ? true
            : false;
        break;
      case "WIND_GUST":
        result =
          lastWeatherUpdate[0].peak_wind_speed !== this.payload.peak_wind_speed
            ? true
            : false;
        break;
      case "SNOW_DEPTH":
      case "PANEL_SNOW_DEPTH":
        result =
          lastWeatherUpdate[0].snow_depth !== this.payload.snow_depth
            ? true
            : false;
        break;
    }
    return result;
  }
  getPercentage(type, threshold) {
    let percentage = 0;
    switch (type) {
      case "WIND_SPEED":
        percentage = (this.payload.average_wind_speed / threshold) * 100;
        break;
      case "WIND_GUST":
        percentage = (this.payload.peak_wind_speed / threshold) * 100;
        break;
      case "SNOW_DEPTH":
        percentage = (this.payload.snow_depth / threshold) * 100;
        break;
      case "PANEL_SNOW_DEPTH":
        percentage = (this.payload.snow_depth / threshold) * 100;
        break;
    }
    return percentage;
  }

  getEventName(type, is_start = true) {
    let event_name = null;
    switch (type) {
      case "WIND_SPEED":
        event_name = is_start
          ? "Increased_Weather_Reporting_Avg_Wind"
          : "Stop_Increased_Weather_Reporting_Avg_Wind";
        break;
      case "WIND_GUST":
        event_name = is_start
          ? "Increased_Weather_Reporting_Wind_Gust"
          : "Stop_Increased_Weather_Reporting_Wind_Gust";
        break;
      case "SNOW_DEPTH":
        event_name = is_start
          ? "Increased_Weather_Reporting_Deep_Snow"
          : "Stop_Increased_Weather_Reporting_Deep_Snow";
        break;
      case "PANEL_SNOW_DEPTH":
        event_name = is_start
          ? "Increased_Weather_Reporting_Deep_Panel_Snow"
          : "Stop_Increased_Weather_Reporting_Deep_Panel_Snow";
        break;
    }
    return event_name;
  }
  getEventICon(event_name) {
    let icon = null;
    switch (event_name) {
      case "Increased_Weather_Reporting_Avg_Wind":
      case "Increased_Weather_Reporting_Wind_Gust":
      case "Increased_Weather_Reporting_Deep_Snow":
      case "Increased_Weather_Reporting_Deep_Panel_Snow":
        icon = "weather_increase_start";
        break;
      case "Stop_Increased_Weather_Reporting_Avg_Wind":
      case "Stop_Increased_Weather_Reporting_Wind_Gust":
      case "Stop_Increased_Weather_Reporting_Deep_Snow":
      case "Stop_Increased_Weather_Reporting_Deep_Panel_Snow":
        icon = "weather_increase_stop";
        break;
    }

    return icon;
  }
  getEventSubject(event_name, info) {
    let title = null;
    switch (event_name) {
      case "Increased_Weather_Reporting_Avg_Wind":
        title = "Increased Weather Reporting: High Average Wind";
        break;
      case "Increased_Weather_Reporting_Wind_Gust":
        title = "Increased Weather Reporting: High Wind Gust";
        break;
      case "Increased_Weather_Reporting_Deep_Snow":
        title = "Increased Weather Reporting: Deep Snow";
        break;
      case "Increased_Weather_Reporting_Deep_Panel_Snow":
        title = "Increased Weather Reporting: Deep Panel Snow";
        break;
      case "Stop_Increased_Weather_Reporting_Avg_Wind":
      case "Stop_Increased_Weather_Reporting_Wind_Gust":
      case "Stop_Increased_Weather_Reporting_Deep_Snow":
      case "Stop_Increased_Weather_Reporting_Deep_Panel_Snow":
        title = "Stop Increased Weather Reporting on " + info.name;
        break;
    }

    return title;
  }

  getEventTitle(event_name, info) {
    let title = null;
    switch (event_name) {
      case "Increased_Weather_Reporting_Avg_Wind":
      case "Increased_Weather_Reporting_Wind_Gust":
      case "Increased_Weather_Reporting_Deep_Snow":
      case "Increased_Weather_Reporting_Deep_Panel_Snow":
        title = "Increased Weather Reporting on " + info.name;
        break;
      case "Stop_Increased_Weather_Reporting_Avg_Wind":
      case "Stop_Increased_Weather_Reporting_Wind_Gust":
      case "Stop_Increased_Weather_Reporting_Deep_Snow":
      case "Stop_Increased_Weather_Reporting_Deep_Panel_Snow":
        title = "Stop Increased Weather Reporting on " + info.name;
        break;
    }

    return title;
  }

  getEventMessage(event_name, info, threshold, percentage) {
    let msg = null;
    switch (event_name) {
      case "Increased_Weather_Reporting_Avg_Wind":
        msg =
          "An average wind speed of " +
          (utils.roundNumber(this.payload.average_wind_speed) +
            "mph was recorded by ") +
          (info.name +
            ".  Since this value is greater than " +
            percentage +
            "% of the ") +
          (utils.roundNumber(threshold) +
            "mph threshold, the system has started increased weather reporting.");
        break;
      case "Stop_Increased_Weather_Reporting_Avg_Wind":
        msg =
          "An average wind speed of " +
          (utils.roundNumber(this.payload.average_wind_speed) +
            "mph was reported by ") +
          (info.name +
            ".  Since this value is less than " +
            percentage +
            "% of the ") +
          (utils.roundNumber(threshold) +
            "mph threshold, the system has returned to normal weather reporting.");
        break;

      case "Increased_Weather_Reporting_Wind_Gust":
        msg =
          "A wind gust of " +
          utils.roundNumber(this.payload.peak_wind_speed) +
          ("mph was recorded by " + info.name) +
          (". Since this value is greater than " +
            percentage +
            "% of the " +
            utils.roundNumber(threshold) +
            "mph threshold the system has started increased weather reporting.");
        break;
      case "Stop_Increased_Weather_Reporting_Wind_Gust":
        msg =
          "A wind gust of " +
          (utils.roundNumber(this.payload.peak_wind_speed) +
            "mph was reported by ") +
          (info.name +
            ". Since this value is less than " +
            percentage +
            "% of the ") +
          (utils.roundNumber(threshold) +
            "mph threshold, the system has returned to normal weather reporting");
        break;
      case "Increased_Weather_Reporting_Deep_Snow":
        msg =
          "A snow depth of " +
          (utils.roundNumber(this.payload.snow_depth) +
            " inches was recorded by ") +
          (info.name +
            ". Since this value is greater than " +
            percentage +
            "% of the ") +
          (utils.roundNumber(threshold) +
            " inches threshold, the system has started increased weather reporting.");
        break;
      case "Increased_Weather_Reporting_Deep_Panel_Snow":
        msg =
          "A deep panel snow of " +
          (utils.roundNumber(this.payload.snow_depth) +
            " inches was recorded by ") +
          (info.name +
            ". Since this value is greater than " +
            percentage +
            "% of the ") +
          (utils.roundNumber(threshold) +
            " inches threshold, the system has started increased weather reporting.");
        break;
      case "Stop_Increased_Weather_Reporting_Deep_Snow":
        msg =
          "A snow Depth of " +
          (utils.roundNumber(this.payload.snow_depth) +
            " inches was reported by ") +
          (info.name +
            ". Since this value is less than " +
            percentage +
            "% of the ") +
          (utils.roundNumber(threshold) +
            " inches threshold, the system has returned to normal weather reporting.");
        break;
      case "Stop_Increased_Weather_Reporting_Deep_Panel_Snow":
        msg =
          "A deep panel snow of " +
          (utils.roundNumber(this.payload.snow_depth) +
            " inches was reported by ") +
          (info.name +
            ". Since this value is less than " +
            percentage +
            "% of the ") +
          (utils.roundNumber(threshold) +
            " inches threshold, the system has returned to normal weather reporting.");
        break;
    }

    return msg;
  }
  async processNotification(event_name, info, threshold, percentage) {
    info.status_text = this.getEventSubject(event_name, info);
    info.message = this.getEventMessage(
      event_name,
      info,
      threshold,
      percentage
    );
    info.icon_name = this.getEventICon(event_name) + "_48x48.png";
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
        (info.multipleSites? info.project_name + " | " : "") +
          info.site_name +
          ("\n" + info.status_text) +
          ("\n" + timestamp + ": ") +
          info.message;
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
          info.asset_name !== null && info.asset_name !== undefined
            ? info.asset_name
            : "Asset";
        console.log(asset_name);
        console.log("EMAILIDS", info.emailAddrs);
        if (info.emailAddrs.length > 0) {
          // await fs.readFile(
          //   "./email-Temp-Weather-Notifications.html",
          //   async function(err, emailHtmlTemplate) {
          //     if (err) {
          //       console.log("Unable to load HTML Template");
          //       throw err;
          //     }
          var emailData = {
            is_multiSites: info.multipleSites,
            site_name: info.site_name,
            status_text: (info.device_type !== null ? info.device_type : "Asset") + " | " +info.status_text,
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
          (info.multipleSites? info.project_name + " | " : "") +
            info.site_name +
            " | " +
            (info.device_type !== null ? info.device_type : "Asset") +
            (" | " + info.status_text);
          //console.log(params);
          info.emailAddrs.forEach(async (data) => {
            params.emailAddrs = [data];
            await aws_integration.sendEmail(params);
          });

          //   }
          // );
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

exports.weatherHistService = new WeatherHistService();
