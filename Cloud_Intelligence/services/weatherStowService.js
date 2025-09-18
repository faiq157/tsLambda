const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const utils = require("../utils");
const { getS3EmailAssetsUrl, formatUserFriendlyTime } = require("../utils/libs/functions");
const { notificationSettingService } = require("./notificationSettingService");
const { notificationService } = require("./common/notificationService");
const { acquireLock } = require("../utils/libs/execSync");
const { exeQuery } = require("../pg");
class WeatherStowService {
  async handler(payload) {
    //console.log("WeatherStowService handler!!!");
    this.payload = payload;
    try {
      return await this.processEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error WeatherStowService handler..!!",
        err
      );
    }
  }
  async processEvent() {
    try {
      const assetInfo = await this.getAssetInfo();
      if (this.isAccuweather()) {
        if (await this.getAccuWeatherStowInfo() === false) {
          return;
        }
      }
      if (this.payload.stow_type > 20) {
        let activeAlert;
        if (this.isAccuweather()) {
          activeAlert = await this.getActiveAlert(this.payload.stow_type);
        } else {
          //check alert by nc child asset id or nc asset_id
          activeAlert = await this.getActiveAlertByNCId(this.payload.stow_type, assetInfo[0].network_controller_id);
        }
        if (activeAlert.length > 0) {
          //clear alert & add stop stow in timeline
          const res = await this.clearCloudAlert(activeAlert[0].id);
          if (res.rowCount === 0) {
            // Due to multiple simultaneous executions other task has already deleted the alert.
            // This will protect duplicate timeline events.
            return true;
          }
          //add timelinelog
          await this.addCloudEventLog(this.payload.stow_type, []);

          if (this.is_notify) {
            const notificationSettings = await this.getNotificationSettings(this.payload.stow_type);
            //processStowStartNotification
            console.log('Processing Notification...');
            return this.processNotification(notificationSettings);
          } else {
            console.log("Site Notifications disabled");
            return true;
          }
        } else {
          console.log('No active alert to be clear...');
          return true;
        }
      } else {
        //check if value & threshold is 0 and stow_type is less then 5
        if (this.payload.stow_threshold === 0 && this.payload.stow_value === 0 && this.payload.stow_type < 5) {
          console.log('Default value update ignore.');
        } else {

          /***Locking required here */

          await acquireLock(
            "locks:wxstowupdate:" + this.payload.asset_id,
            3000,
            // Things to do while being in locked state
            async () => {
              //check alert by asset id
              const activeAlert = await this.getActiveAlert(this.payload.stow_type);
              if (activeAlert.length === 0) {

                const assetIdsWithActiveAlerts = await this.getAssetsIdWithActiveAlerts();
                //add cloud alert & timeline event
                await this.addCloudAlert(this.payload.stow_type, assetIdsWithActiveAlerts);
                //add timeline event
                await this.addCloudEventLog(this.payload.stow_type, assetIdsWithActiveAlerts);

                if (this.is_notify) {
                  const notificationSettings = await this.getNotificationSettings(this.payload.stow_type);
                  //processStowStartNotification
                  console.log('Processing Notification...');
                  return this.processNotification(notificationSettings);
                } else {
                  console.log("Site Notifications disabled");
                  return true;
                }
              } else {
                console.log('Already have active alert...!');
                if (this.isAccuweather()) {
                  // update alert message for accuweather
                  console.log("updateCloudAlert", activeAlert[0].event_name);
                  await this.updateCloudAlert(this.payload.stow_type, activeAlert[0]);
                  // If active alert is not NC_OFFLINE and event is  NC_OFFLINE then add timeline event
                  if (!this.is_nc_offline_alert(activeAlert) && this.payload.message_type == "NC_OFFLINE_EXIT") {
                    //add timeline event
                    await this.addCloudEventLog(this.payload.stow_type, []);
                  }
                }

                return true;
              }
            }
          );

        }

      }
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error processEvent handler..!!",
        err
      );
    }

  }

  async getAssetInfo() {
    console.log('getAssetInfo');
    try {
      const deviceType = await this.getDeviceType();
      this.device_type = deviceType;
      console.log(this.getAssetAndSiteInfoQuery(), [this.payload.asset_id]);
      const assetInfoRes = await exeQuery(this.getAssetAndSiteInfoQuery(), [this.payload.asset_id]);
      if (assetInfoRes.rows.length > 0) {
        let data = assetInfoRes.rows[0];
        this.weather_forecast_stow_after_time = data.weather_forecast_stow_after_time;
        this.network_controller_id = data.network_controller_id;
        this.network_controller_name = data.network_controller_name;
        this.network_controller_asset_id = data.network_controller_asset_id;
        if (this.isAccuweather())
          this.is_notify = data.is_notify && data.enable_weather_forecast_notification;
        else
          this.is_notify = data.is_notify;
        this.site_id = data.site_id;
        this.site_name = data.site_name;
        this.location_lat = data.location_lat;
        this.location_lng = data.location_lng;
        this.project_name = data.project_name;
        this.project_id = data.project_id;
        this.project_location = data.project_location;
        this.snap_addr = data.snap_addr;
        this.asset_name = await this.getAssetName();
        console.log(`ASSETINFO: [nc_id: ${this.network_controller_id}] [nc_name: ${this.network_controller_name}] [nc_asset_id: ${this.network_controller_asset_id}] [is_notify: ${this.is_notify}] [snap_addr: ${this.snap_addr}] [asset_name: ${this.asset_name}]`);
      }
      this.multipleSites = await notificationService.checkProjectSites(this.client, this.project_id);
      return assetInfoRes.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getAssetInfo..!!",
        err
      );
    }
  }

  async getAssetName() {
    console.log(`getAssetName`);
    try {
      let assetName = this.payload.asset_name !== null ?
        this.payload.asset_name : (this.device_type !== null ? this.device_type : "ASSET");

      if (this.device_type === "Row Controller") {
        //get SiteLayOutInfo

        this.shorthand_name = null;
        this.row_id = "";
        this.row_name = null;

        const siteLayoutInfo = await this.getSiteLayoutInfo();
        if (siteLayoutInfo.length !== 0) {
          this.shorthand_name = siteLayoutInfo[0].shorthand_name;
          this.row_id = siteLayoutInfo[0].i;
          this.row_name = siteLayoutInfo[0].name;
        }
        //Row Name Format "Row Box <row_id> (<row_name> | <shorthand_name> | <snap_addr>)"
        assetName = "Row Box " + this.row_id + " (" + (this.row_name !== null ? this.row_name + " | " : "") +
          (this.shorthand_name !== null ? this.shorthand_name + " | " : "") + this.snap_addr + ")";
      }
      console.log(assetName);
      return assetName;
    } catch (err) {
      throw new Error(
        "Operation not completed error getAssetName..!!",
        err
      );
    }
  }

  async getSiteLayoutInfo() {
    console.log('getSiteLayoutInfo');
    try {
      //get site_layout info
      let siteLayoutInfoRes = await exeQuery(
        db.siteLayoutInfoByAssetId,
        [this.payload.asset_id]
      );
      console.log(siteLayoutInfoRes.rows);
      return siteLayoutInfoRes.rows;
    } catch (err) {
      throw new Error(
        "Operation not completed error getSiteLayoutInfo..!!",
        err
      );
    }
  }

  getAssetAndSiteInfoQuery() {
    console.log('getAssetAndSiteInfoQuery');
    if (this.device_type === "Network Controller") {
      return db.siteInfoByNCAssetId;
    } else {
      return db.siteInfoByAssetId;
    }
  }

  async getDeviceType() {
    console.log('getDeviceType')
    try {
      let deviceType = null;
      const getDeviceTypeInfoRes = await exeQuery(db.deviceTypeInfoQuery, [this.payload.device_type_id])
      if (getDeviceTypeInfoRes.rows.length > 0) {
        deviceType = getDeviceTypeInfoRes.rows[0].device_type;
      }
      console.log(deviceType);
      return deviceType;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getDeviceType..!!",
        err
      );
    }
  }
  async clearCloudAlert(alertId) {
    console.log("Delete Cloud Alert: ", alertId);
    // remove entries from cloud alert detail table then proceed
    const detailRemoveRes = await exeQuery(db.removeCloudAlertDetail, [alertId], { writer: true });
    console.log("DetailRemoveRes ", detailRemoveRes);
    return await exeQuery(db.removeCloudAlert, [alertId], { writer: true });
  }

  async addCloudAlert(type, assetIdsWithActiveAlerts) {
    // console.log(`addCloudAlert ${type} ${assetIdsWithActiveAlerts}`);
    try {
      console.log(db.addCloudAlertParamsByReturnId, [
        this.getEventName(type),
        this.getEventMessage(type),
        new Date(this.payload.timestamp),
        this.payload.asset_id,
        2,
        true,
        this.getEventTitle(type),
        this.getEventIcon(type),
        this.getCloudAlertParams()
      ]);
      let addcloudAlertResult = await exeQuery(db.addCloudAlertParamsByReturnId, [
        this.getEventName(type),
        this.getEventMessage(type),
        new Date(this.payload.timestamp),
        this.payload.asset_id,
        2,
        true,
        this.getEventTitle(type),
        this.getEventIcon(type),
        this.getCloudAlertParams()
      ], { writer: true });
      console.log('addcloudAlertResult ', addcloudAlertResult);
      const cloudAlertId = addcloudAlertResult.rows[0].id;
      return await this.addCloudAlertDetails(cloudAlertId, assetIdsWithActiveAlerts);
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error addCloudAlert..!!",
        err
      );
    }
  }

  async updateCloudAlert(type, activeAlert) {
    console.log(`updateCloudAlert ${type}. activeAlert`, activeAlert);
    try {
      let updatecloudAlertResult = await exeQuery(db.updateActiveAlertParams, [
        this.getEventMessage(type),
        activeAlert.created, //new Date(this.payload.timestamp),
        this.getEventTitle(type),
        this.getEventIcon(type),
        this.getCloudAlertParams(),
        activeAlert.id
      ], { writer: true });
      console.log('updatecloudAlertResult ', updatecloudAlertResult);
      return;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error updateCloudAlert..!!",
        err
      );
    }
  }

  async addCloudAlertDetails(cloudAlertId, assetsWithActiveAlerts) {
    console.log(`addCloudAlertDetails ${cloudAlertId} ${assetsWithActiveAlerts.rows}`)
    try {
      if (assetsWithActiveAlerts.length > 0) {
        let cloudAlertQuery =
          "INSERT INTO terrasmart.cloud_alert_detail (event_name, title, message, created, type, active, cloud_alert_id, asset_id, params, levelno) VALUES";
        let counter = 1;
        assetsWithActiveAlerts.forEach(async (data) => {
          let msg = data.message !== null ? "'" + data.message + "'" : null;
          const levelNo = ['ASSET-MOTOR-CURRENT-HW-FAULT', 'ASSET-MOTOR-CURRENT_SW_FAULT', 'ASSET-MOTOR-FAULT-TIMEOUT'].includes(data.event_name) ? 30 : 20;
          if (counter < assetsWithActiveAlerts.length) {
            cloudAlertQuery += `('${data.event_name}', '${data.title}', ${msg}, $1 :: TIMESTAMP, 2, true, '${cloudAlertId}', '${data.asset_id}', '${data.params}'::JSON, '${levelNo}'),`;
          } else {
            cloudAlertQuery += `('${data.event_name}', '${data.title}', ${msg}, $1 :: TIMESTAMP, 2, true, '${cloudAlertId}', '${data.asset_id}', '${data.params}'::JSON, '${levelNo}') `;
          }
          counter++
        });
        console.log(cloudAlertQuery);
        const addAlertDetailRes = await exeQuery(cloudAlertQuery, [this.payload.timestamp], { writer: true })
        console.log(`addAlertDetailRes `, addAlertDetailRes);
      } else {
        console.log('No assets found with active alerts')
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error addCloudAlertDetails..!!",
        err
      );
    }
  }

  async addCloudEventLog(type, assetsWithActiveAlerts) {
    console.log(`addCloudEventLog(${type},${assetsWithActiveAlerts.rows})`);
    try {
      let addcloudEventLogResult = await exeQuery(db.addCloudEventLogByReturnId, [
        this.getEventName(type),
        this.getEventMessage(type),
        20,
        new Date(this.payload.timestamp),
        this.payload.asset_id,
        2,
        this.getEventTitle(type),
        this.getEventIcon(type),
      ], { writer: true });
      console.log(`addcloudEventLogResult ${addcloudEventLogResult}`);
      const cloudEventLogId = addcloudEventLogResult.rows[0].id;
      if (this.payload.stow_type <= 20) {
        return await this.addCloudEventLogDetails(cloudEventLogId, assetsWithActiveAlerts);
      } else {
        return true;
      }
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error addCloudEventLog..!!",
        err
      );
    }
  }

  async addCloudEventLogDetails(cloudEventLogId, assetsWithActiveAlerts) {
    console.log(`addCloudEventLogDetails(${cloudEventLogId},${assetsWithActiveAlerts})`);
    try {
      if (assetsWithActiveAlerts.length > 0) {
        let query =
          "INSERT INTO terrasmart.cloud_event_log_detail (name, title, message, levelno, created, type, cloud_event_log_id, asset_id, params) VALUES";
        let counter = 1;
        assetsWithActiveAlerts.forEach(async (data) => {
          let msg = data.message !== null ? "'" + data.message + "'" : null;
          let dt = moment(data.created).format('YYYY-MM-DD HH:mm:ss');
          const levelNo = ['ASSET-MOTOR-CURRENT-HW-FAULT', 'ASSET-MOTOR-CURRENT_SW_FAULT', 'ASSET-MOTOR-FAULT-TIMEOUT'].includes(data.event_name) ? 30 : 20;
          if (counter < assetsWithActiveAlerts.length) {
            query += `('${data.event_name}', '${data.title}', ${msg}, ${levelNo}, '${dt}', 2, '${cloudEventLogId}', '${data.asset_id}', '${data.params}'::JSON),`;
          } else {
            query += `('${data.event_name}', '${data.title}', ${msg}, ${levelNo}, '${dt}', 2, '${cloudEventLogId}', '${data.asset_id}', '${data.params}'::JSON)`;
          }
          counter++
        });
        // console.log(query);
        const addEventDetailRes = await exeQuery(query, [], { writer: true })
        console.log(`addEventDetailRes ${addEventDetailRes}`);
      } else {
        console.log('No assets found with active alerts')
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error addCloudEventLogDetails..!!",
        err
      );
    }
  }

  async getActiveAlert(type) {
    try {
      console.log("getActiveAlert ", type);
      const alertRes = await exeQuery(db.getLastCloudAlertQuery,
        [this.getAlertCheckEventName(type), this.payload.asset_id]);
      // console.log(`alertRes `, alertRes)
      return alertRes.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getActiveAlert...!", err
      );
    }
  }
  async getActiveAlertByNCId(type, network_controller_id) {
    try {
      console.log("getActiveAlertByNCId ", type, network_controller_id);
      if (type === 25) { //defined type 25 for this query as this will only be received from NC
        const alertRes = await exeQuery(db.getcloudAlertQueryForNC,
          [this.getAlertCheckEventName(type), network_controller_id]);
        // console.log('alertRes ', alertRes);
        return alertRes.rows;
      } else {
        const alertRes = await exeQuery(db.getcloudAlertQueryByNCId,
          [this.getAlertCheckEventName(type), network_controller_id]);
        // console.log('alertRes ', alertRes);
        return alertRes.rows;
      }

    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getActiveAlertByNCId...!", err
      );
    }
  }
  async getAssetsIdWithActiveAlerts() {
    console.log('getAssetsIdWithActiveAlerts ')
    try {
      // console.log('QUERY: ', db.getAssetIdsWithActiveAlertsQuery, [this.network_controller_asset_id]);
      const assetsWithActiveAlertsRes = await exeQuery(db.getAssetIdsWithActiveAlertsQuery, [this.network_controller_asset_id]);
      // console.log(`assetsWithActiveAlertsRes `, assetsWithActiveAlertsRes.rows);
      return assetsWithActiveAlertsRes.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getAssetsIdWithActiveAlerts...!", err
      );
    }
  }

  getEventMessage(type, msg_type = null) {
    console.log(`getEventMessage ${type}`);
    let message = null;
    switch (type) {
      case 1:
        message = `A wind gust of ${utils.roundNumber(this.payload.stow_value)} mph was recorded by ${this.asset_name}. The current threshold is ${utils.roundNumber(this.payload.stow_threshold)} mph.`;
        break;
      case 2:
        message = `An average wind speed of ${utils.roundNumber(this.payload.stow_value)} mph was recorded by ${this.asset_name}. The current threshold is ${utils.roundNumber(this.payload.stow_threshold)} mph.`;
        break;
      case 3:
        message = `A snow depth of ${utils.roundNumber(this.payload.stow_value)} inches was recorded by ${this.asset_name}. The current threshold is ${utils.roundNumber(this.payload.stow_threshold)} inches.`;
        break;
      case 4:
        message = `A panel snow depth of ${utils.roundNumber(this.payload.stow_value)} inches was recorded by ${this.asset_name}. The current threshold is ${utils.roundNumber(this.payload.stow_threshold)} inches.`;
        break;
      case 5:
        message = "The system is configured to require weather station connectivity.  The number of connected weather stations is less than the configured threshold, so the site has entered a weather stow mode.  It will remain in weather stow until the number of connected weather stations exceeds the configuration threshold";
        break;
      case 10:
        message = `The ${this.asset_name} Weather station reported an ambient temperature of ${utils.roundNumber(this.payload.stow_value)}&deg F which is below the operational threshold of the TerraTrak System. The system will be in weather stow until ALL on-site weather stations are reporting temperatures above ${utils.roundNumber(this.payload.stow_lower_threshold)}&deg F`
        break;
      case 11:
        message = `The site is in snow shedding`
        break;
      case 6:
      case 7:
      case 8:
      case 9:
        {
          if (msg_type == null) {
            msg_type = this.payload.message_type;
          }
          const accuWeatherMessage = {
            '6': {
              'NORMAL': `The site is in AccuWeather Weather Stow due to predicted winds from AccuWeather Forecast. The site forecast is calling for wind gust of ${utils.roundNumber(this.site_stow_info.alarm_value, 1)} mph from ${this.getLocalTime(this.site_stow_info.alarm_start_time)} through ${this.getLocalTime(this.site_stow_info.alarm_end_time)}. The forecasted wind gust of ${utils.roundNumber(this.site_stow_info.alarm_value, 1)} mph are greater than the site threshold of ${utils.roundNumber(this.site_stow_info.alarm_threshold, 0)} mph. The site will resume tracking ${utils.roundNumber(this.weather_forecast_stow_after_time, 0)} minutes after the forecasted duration as long as local weather stations are reporting values below thresholds.`,
              'NC_OFFLINE': "The site failed to enter AccuWeather Weather Stow for High Wind Gust because the Network Controller is Offline.",
              'NC_OFFLINE_EXIT': "The site failed to exit AccuWeather Weather Stow for High Wind Gust because the Network Controller is Offline."
            },
            '7': {
              'NORMAL': `The site is in AccuWeather Weather Stow due to predicted winds from AccuWeather Forecast. The site forecast is calling for average wind speeds of ${utils.roundNumber(this.site_stow_info.alarm_value, 1)} mph from ${this.getLocalTime(this.site_stow_info.alarm_start_time)} through ${this.getLocalTime(this.site_stow_info.alarm_end_time)}. The forecasted average wind speeds of ${utils.roundNumber(this.site_stow_info.alarm_value, 1)} mph are greater than the site threshold of ${utils.roundNumber(this.site_stow_info.alarm_threshold, 0)} mph. The site will resume tracking ${utils.roundNumber(this.weather_forecast_stow_after_time, 0)} minutes after the forecasted duration as long as local weather stations are reporting values below thresholds.`,
              'NC_OFFLINE': "The site failed to enter AccuWeather Weather Stow for High Average Wind Speed because the Network Controller is Offline.",
              'NC_OFFLINE_EXIT': "The site failed to exit AccuWeather Weather Stow for High Average Wind Speed because the Network Controller is Offline."
            },
            '8': {
              'NORMAL': `The site is in AccuWeather Weather Stow due to predicted snow from AccuWeather Forecast. The site forecast is calling for snow depths of ${utils.roundNumber(this.site_stow_info.alarm_value, 1)} inches from ${this.getLocalTime(this.site_stow_info.alarm_start_time)} through ${this.getLocalTime(this.site_stow_info.alarm_end_time)}. The forecasted snow depths of ${utils.roundNumber(this.site_stow_info.alarm_value, 1)} inches are greater than the site threshold of ${utils.roundNumber(this.site_stow_info.alarm_threshold, 0)} inches. The site will resume tracking ${utils.roundNumber(this.weather_forecast_stow_after_time, 0)} minutes after the forecasted duration as long as local weather stations are reporting values below thresholds.`,
              'NC_OFFLINE': "The site failed to enter AccuWeather Weather Stow for Deep Snow because the Network Controller is Offline.",
              'NC_OFFLINE_EXIT': "The site failed to exit AccuWeather Weather Stow for Deep Snow because the Network Controller is Offline."
            },
            '9': {
              'NORMAL': `The site is in AccuWeather Weather Stow due to ${this.alert_type_str} AccuWeather Alert. The details of the AccuWeather Alert are provided below. The site will resume tracking ${utils.roundNumber(this.weather_forecast_stow_after_time, 0)} minutes after the forecasted duration as long as local weather stations are reporting values below thresholds.<br /><span style="color: rgb(0, 0, 0);" class="accu-alert">AccuWeather Alert:</span><br />${this.text_message}`,
              'NC_OFFLINE': `The site failed to enter AccuWeather Weather Stow for ${this.alert_type_str} because the Network Controller is Offline.`,
              'NC_OFFLINE_EXIT': `The site failed to exit AccuWeather Weather Stow for ${this.alert_type_str} because the Network Controller is Offline.`
            }
          };
          console.log(`message_type ${this.payload.message_type}`);
          message = accuWeatherMessage[`${type}`][msg_type];
          break;
        }
      case 21:
      case 22:
      case 23:
      case 24:
      case 25:
      case 26:
      case 27:
      case 28:
      case 29:
      case 30:
      case 31:
        message = 'The project has resumed normal operations.';

    }
    console.log(message);
    return message;
  }
  getNotificationMessage(type, msg_type = null) {
    if (type === 10) {
      return `The ${this.asset_name} Weather station reported an ambient temperature of ${utils.roundNumber(this.payload.stow_value)}° F which is below the operational threshold of the TerraTrak System. The system will be in weather stow until ALL on-site weather stations are reporting temperatures above ${utils.roundNumber(this.payload.stow_lower_threshold)}° F`
    } else {
      return this.getEventMessage(type, msg_type);
    }
  }
  getEventTitle(type, msg_type = null) {
    console.log(`getEventTitle(${type})`);
    let title = null;
    switch (type) {
      case 1:
        title = `Weather Stow: High Wind Gust detected by ${this.asset_name}`;
        break;
      case 2:
        title = `Weather Stow: High Average Wind Speed detected by ${this.asset_name}`;
        break;
      case 3:
        title = `Weather Stow: Deep snow detected by ${this.asset_name}`;
        break;
      case 4:
        title = `Weather Stow: Deep Panel Snow is detected by ${this.asset_name}`;
        break;
      case 5:
        title = "Weather Stow due to Weather Station Connectivity";
        break;
      case 10:
        title = `Weather Stow: Too Cold To Operate`;
        break;
      case 11:
        title = `Weather Stow: Snow Shedding`;
        break;
      case 6:
      case 7:
      case 8:
      case 9:
        {
          if (msg_type == null) {
            msg_type = this.payload.message_type;
          }
          const accuWeatherEventTitle = {
            '6': {
              'NORMAL': "AccuWeather Weather Stow: High Wind Gust",
              'NC_OFFLINE': `AccuWeather Weather Stow Failed: NC is offline`,
              'NC_OFFLINE_EXIT': `AccuWeather Weather Stow Exit Failed: NC is offline`
            },
            '7': {
              'NORMAL': "AccuWeather Weather Stow: High Average Wind Speed",
              'NC_OFFLINE': `AccuWeather Weather Stow Failed: NC is offline`,
              'NC_OFFLINE_EXIT': `AccuWeather Weather Stow Exit Failed: NC is offline`
            },
            '8': {
              'NORMAL': "AccuWeather Weather Stow: Deep Snow",
              'NC_OFFLINE': `AccuWeather Weather Stow Failed: NC is offline`,
              'NC_OFFLINE_EXIT': `AccuWeather Weather Stow Exit Failed: NC is offline`
            },
            '9': {
              'NORMAL': `AccuWeather Weather Stow: ${this.alert_type_str}`,
              'NC_OFFLINE': `AccuWeather Weather Stow Failed: NC is offline`,
              'NC_OFFLINE_EXIT': `AccuWeather Weather Stow Exit Failed: NC is offline`
            }
          };
          title = accuWeatherEventTitle[`${type}`][msg_type];
          break;
        }
      case 21:
        title = `Stop Weather Stow: High Wind Gust`;
        break;
      case 22:
        title = `Stop Weather Stow: High Average Wind Speed`;
        break;
      case 23:
        title = `Stop Weather Stow: Deep Snow`;
        break;
      case 24:
        title = `Stop Weather Stow: Deep Panel Snow`;
        break;
      case 25:
        title = `Stop Weather Stow: Weather Station Connectivity`;
        break;
      case 26:
        title = `Stop AccuWeather Weather Stow: High Wind Gust`;
        break;
      case 27:
        title = `Stop AccuWeather Weather Stow: High Average Wind Speed`;
        break;
      case 28:
        title = `Stop AccuWeather Weather Stow: Deep Snow`;
        break;
      case 29:
        title = `Stop AccuWeather Weather Stow: ${this.alert_type_str}`;
        break;
      case 30:
        title = `Stop Weather Stow: Too Cold To Operate`;
        break;
      case 31:
        title = `Stop Weather Stow: Snow Shedding`;
        break;
    }
    console.log(title);
    return title;
  }

  getEventIcon(type) {
    console.log(`getEventIcon(${type})`);
    let icon = null;
    switch (type) {
      case 1:
      case 2:
        icon = 'mode_wind';
        break;
      case 3:
      case 4:
        icon = 'mode_snow';
        break;
      case 5:
        icon = 'weather_none';
        break;
      case 6:
      case 7:
        icon = 'weather_accu_alert';
        break;
      case 8:
        icon = 'weather_accu_alert';
        break;
      case 9:
        icon = 'weather_accu_alert';
        break;
      case 10:
        icon = 'temperature';
        break;
      case 11:
        icon = 'mode_snow';
        break;
      case 21:
      case 22:
      case 23:
      case 24:
      case 25:
      case 26:
      case 27:
      case 28:
      case 29:
      case 30:
      case 31:
        icon = 'row_stop';
        break;
    }
    console.log(icon);
    return icon;
  }

  getAlertCheckEventName(type) {
    console.log(`getAlertCheckEventName(${type})`);
    let name = null;
    switch (type) {
      case 1:
      case 21:
        name = 'Weather_Stow_Wind_Gust';
        break;
      case 2:
      case 22:
        name = 'Weather_Stow_Avg_Wind';
        break;
      case 3:
      case 23:
        name = 'Weather_Stow_Deep_Snow';
        break;
      case 4:
      case 24:
        name = 'Weather_Stow_Deep_Panel_Snow';
        break;
      case 5:
      case 25:
        name = 'Weather_Stow_No_Weather_Station';
        break;
      case 6:
      case 26:
        name = 'Weather_Stow_AccuWeather-Wind_Gust';
        break;
      case 7:
      case 27:
        name = 'Weather_Stow_AccuWeather-Avg_Wind';
        break;
      case 8:
      case 28:
        name = 'Weather_Stow_AccuWeather-Deep_Snow';
        break;
      case 9:
      case 29:
        name = 'Weather_Stow_AccuWeather-Alert';
        break;
      case 10:
      case 30:
        name = 'Weather_Stow_To_Cold_To_Move';
        break;
      case 11:
      case 31:
        name = 'Weather_Stow_Snow_Shedding';
        break;
    }
    console.log(name);
    return name;
  }
  getEventName(type) {
    console.log(`getEventName(${type})`);
    let name = null;
    switch (type) {
      case 1:
        name = 'Weather_Stow_Wind_Gust';
        break;
      case 2:
        name = 'Weather_Stow_Avg_Wind';
        break;
      case 3:
        name = 'Weather_Stow_Deep_Snow';
        break;
      case 4:
        name = 'Weather_Stow_Deep_Panel_Snow';
        break;
      case 5:
        name = 'Weather_Stow_No_Weather_Station';
        break;
      case 6:
        name = 'Weather_Stow_AccuWeather-Wind_Gust';
        break;
      case 7:
        name = 'Weather_Stow_AccuWeather-Avg_Wind';
        break;
      case 8:
        name = 'Weather_Stow_AccuWeather-Deep_Snow';
        break;
      case 9:
        name = 'Weather_Stow_AccuWeather-Alert';
        break;
      case 10:
        name = 'Weather_Stow_To_Cold_To_Move';
        break;
      case 11:
        name = 'Weather_Stow_Snow_Shedding';
        break;
      case 21:
        name = 'Stop_Weather_Stow_Wind_Gust';
        break;
      case 22:
        name = 'Stop_Weather_Stow_Avg_Wind';
        break;
      case 23:
        name = 'Stop_Weather_Stow_Deep_Snow';
        break;
      case 24:
        name = 'Stop_Weather_Stow_Deep_Panel_Snow';
        break;
      case 25:
        name = 'Stop_Weather_Stow_No_Weather_Station';
        break;
      case 26:
        name = 'Stop_Weather_Stow_AccuWeather-Wind_Gust';
        break;
      case 27:
        name = 'Stop_Weather_Stow_AccuWeather-Avg_Wind';
        break;
      case 28:
        name = 'Stop_Weather_Stow_AccuWeather-Deep_Snow';
        break;
      case 29:
        name = 'Stop_Weather_Stow_AccuWeather-Alert';
        break;
      case 30:
        name = 'Stop_Weather_Stow_To_Cold_To_Move';
        break;
      case 31:
        name = 'Stop_Weather_Stow_Snow_Shedding';
        break;
    }
    console.log(name);
    return name;
  }

  getEventNotificationType(type) {
    console.log(`getEventNotificationType(${type})`);
    let notificationType = null;
    switch (type) {
      case 1:
      case 21:
        notificationType = 'ws_stow_wind_gust';
        break;
      case 2:
      case 22:
        notificationType = 'ws_stow_wind_speed';
        break;
      case 3:
      case 23:
        notificationType = 'ws_stow_snow_depth';
        break;
      case 4:
      case 24:
        notificationType = 'ws_stow_panel_snow_depth';
        break;
      case 5:
      case 25:
        notificationType = 'ws_stow_no_ws';
        break;
      case 10:
      case 30:
        notificationType = 'ws_stow_to_cold_to_move';
        break;
      case 11:
      case 31:
        notificationType = 'ws_stow_snow_shedding';
        break;
      case 6:
      case 7:
      case 8:
      case 9:
      case 26:
      case 27:
      case 28:
      case 29:
        notificationType = 'accuweather_stow';
        break;
    }
    console.log(notificationType);
    return notificationType;
  }

  getEventNotificationText(type) {
    console.log(`getEventNotificationText(${type})`);
    let text = null;
    switch (type) {
      case 1:
        text = 'Weather Stow: High Wind Gust';
        break;
      case 2:
        text = 'Weather Stow: High Average Wind';
        break;
      case 3:
        text = 'Weather Stow: Deep Snow';
        break;
      case 4:
        text = 'Weather Stow: Deep Panel Snow';
        break;
      case 5:
        text = 'Weather Stow: Weather Station Connectivity';
        break;
      case 6:
        text = 'AccuWeather Weather Stow: High Wind Gust';
        break;
      case 7:
        text = 'AccuWeather Weather Stow: High Average Wind Speed';
        break;
      case 8:
        text = 'AccuWeather Weather Stow: Deep Snow';
        break;
      case 9:
        text = `AccuWeather Weather Stow: ${this.alert_type_str}`;
        break;
      case 10:
        text = 'Weather Stow: Too Cold To Operate';
        break;
      case 11:
        text = 'Weather Stow: Snow Shedding';
        break;
      case 21:
        text = 'Stop Weather Stow: High Wind Gust';
        break;
      case 22:
        text = 'Stop Weather Stow: High Average Wind';
        break;
      case 23:
        text = 'Stop Weather Stow: Deep Snow';
        break;
      case 24:
        text = 'Stop Weather Stow: Deep Panel Snow';
        break;
      case 25:
        text = 'Stop Weather Stow: Weather Station Connectivity';
        break;
      case 26:
        text = 'Stop AccuWeather Weather Stow: High Wind Gust';
        break;
      case 27:
        text = 'Stop AccuWeather Weather Stow: High Average Wind Speed';
        break;
      case 28:
        text = 'Stop AccuWeather Weather Stow: Deep Snow';
        break;
      case 29:
        text = `Stop AccuWeather Weather Stow: ${this.alert_type_str}`;
        break;
      case 30:
        text = 'Stop Weather Stow: Too Cold To Operate';
        break;
      case 31:
        text = 'Stop Weather Stow: Snow Shedding';
        break;

    }
    console.log(text);
    text = (this.device_type !== null ? this.device_type : "Asset") + " | " + text;
    return text;
  }
  getCloudAlertParams() {
    if (this.isAccuweather()) {
      const params = {
        stow_start_time: this.site_stow_info.start_time,
        stow_end_time: this.site_stow_info.end_time,
        start_time: this.site_stow_info.alarm_start_time,
        end_time: this.site_stow_info.alarm_end_time,
        event_title: this.getParamEventTitle(),
        event_message: this.getParamEventMessage()
      };
      params.hide_at_project_level = this.site_stow_info.hide_at_project_level;
      if (this.site_stow_info.alarm_text) {
        params.text = this.site_stow_info.alarm_text;
      }
      if (this.site_stow_info.alarm_value) {
        params.value = this.site_stow_info.alarm_value;
        params.threshold = this.site_stow_info.alarm_threshold;
      }
      return params;
    }
    return null;
  }
  getParamEventTitle() {
    console.log(`getParamEventTitle(${this.payload.stow_type})`);
    return this.getEventTitle(this.payload.stow_type, "NORMAL");
  }
  getParamEventMessage() {
    console.log(`getParamEventMessage(${this.payload.stow_type})`);
    return this.getEventMessage(this.payload.stow_type, "NORMAL");
  }
  async getNotificationSettings(type) {
    console.log(`getNotificationSettings(${type})`)
    try {
      var userAccounts = await notificationSettingService.getAccounts(
        this.client,
        this.site_id,
        this.getEventNotificationType(type)
      );
      console.log(`----`, userAccounts);
      return userAccounts;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getNotificationSettings...!", err
      );
    }
  }
  async processNotification(notificationSettings) {
    try {
      if (notificationSettings.phone_nums) {
        //sendSmsNotifications
        await this.sendSmsNotifications(notificationSettings)
      }
      if (notificationSettings.emails) {
        //sendEmailNotifications
        await this.sendEmailNotifications(notificationSettings)
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error processNotification...!", err
      );
    }
  }

  getEventTime() {
    let time_zone = "America/New_York";
    if (this.location_lat !== "" && this.location_lng !== "")
      time_zone = tzlookup(this.location_lat, this.location_lng);

    return formatUserFriendlyTime(this.payload.timestamp, time_zone);
  }

  getLocalTime(timestamp) {
    let time_zone = "America/New_York";
    if (this.location_lat !== "" && this.location_lng !== "")
      time_zone = tzlookup(this.location_lat, this.location_lng);

    let timestamp_tz = moment
      .tz(timestamp, time_zone)
      .format("MM/DD/YYYY hh:mmA ");
    //console.log("TIME: ", timestamp_tz);
    return timestamp_tz;
  }

  async sendSmsNotifications(notificationSettings) {
    try {
      console.log("Sending SMS to ", notificationSettings.phone_nums);
      notificationSettings.phone_nums.forEach(async (data) => {
        let params = {};
        params.phoneNumber = data;
        params.msgText = (this.multipleSites ? this.project_name + " | " : "") + `${this.site_name}\n${this.getEventNotificationText(this.payload.stow_type)}\n${this.getEventTime()}: ${this.getNotificationMessage(this.payload.stow_type)}`;
        console.log(params);
        await aws_integration.sendSMS(params);
      });
      return true;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error sendSmsNotifications...!", err
      );
    }
  }

  async sendEmailNotifications(notificationSettings) {
    try {
      console.log("EMAILADDRS ", notificationSettings.emails);
      var emailData = {
        is_multiSites: this.multipleSites,
        site_name: this.site_name,
        status_text: this.getEventNotificationText(this.payload.stow_type),
        body_text: this.getNotificationMessage(this.payload.stow_type),
        asset_name: this.asset_name,
        timestamp: this.getEventTime(),
        project_name: this.project_name,
        project_location: this.project_location,
        s3_asset_url: getS3EmailAssetsUrl(),
        icon_url: `${getS3EmailAssetsUrl()}${this.getEventIcon(this.payload.stow_type)}_48x48.png`,
        url: process.env.CLOUDUI_URL + ("/home/projects/" + this.site_id + "/overview"),
        current_time: new Date(),
      };

      console.log(emailData);
      var templateHtml = Handlebars.compile(
        utils.emailTempWeatherNotifications.toString()
      );
      var bodyHtml = templateHtml(emailData);
      let params = {};
      params.msgbody = bodyHtml;
      params.msgSubject = this.getEventEmailSubject();

      notificationSettings.emails.forEach(async (data) => {
        params.emailAddrs = [data];
        await aws_integration.sendEmail(params);
      });
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error sendEmailNotifications...!", err
      );
    }
  }

  getEventEmailSubject() {
    console.log(`getEventEmailSubject`);
    let subject =
      (this.multipleSites ? this.project_name + " | " : "") +
      `${this.site_name} | ${this.getEventNotificationText(this.payload.stow_type)}`;
    console.log(subject);
    return subject;
  }

  isAccuweather() {
    const stow_type = this.payload.stow_type % 20;
    return stow_type >= 6 && stow_type <= 9;
  }

  is_nc_offline_alert(alert) {
    return (alert && alert.length && alert[0].title.indexOf("NC is offline") >= 0) ? true : false;
  }

  async getAccuWeatherStowInfo() {
    let site_stow_info = await exeQuery(this.getStowInfoQueryForStowType(this.payload.stow_type), [this.payload.asset_id]);
    if (site_stow_info == null || site_stow_info.rows.length == 0) {
      console.log("Failed to get accuWeather stow_info", site_stow_info);
      return false;
    }

    // TODO:: confirm payload matches site_stow_info

    this.site_stow_info = site_stow_info.rows[0];
    console.log("site_stow_info", this.site_stow_info);
    if (this.site_stow_info.stow_type.startsWith('Weather_Forecast_Alert')) {
      this.alert_type_str = this.site_stow_info.stow_type.slice("Weather_Forecast_Alert-".length).replace(/_/g, " ");
      this.text_message = "";
      if (this.site_stow_info.alarm_text) {
        this.text_message = this.trimAlertText(this.site_stow_info.alarm_text);
        if (this.site_stow_info.alarm_start_time) {
          this.text_message = this.text_message.replace("<start_time>", this.getLocalTime(this.site_stow_info.alarm_start_time));
        }
        if (this.site_stow_info.alarm_end_time) {
          this.text_message = this.text_message.replace("<end_time>", this.getLocalTime(this.site_stow_info.alarm_end_time));
        }
      }
    }
    if (!('message_type' in this.payload)) {
      this.payload.message_type = 'NORMAL';
    }
    return true;
  }

  trimAlertText(text) {
    let trimed_text = text.replace(/(&&|\*)/g, '');
    trimed_text = trimed_text.replace(/(\n\n)/g, '<br />');
    trimed_text = trimed_text.replace(/(\n)/g, ' ');
    if (trimed_text.endsWith('<br />')) {
      trimed_text = trimed_text.concat('When: From <start_time> through <end_time>.');
    } else {
      trimed_text = trimed_text.concat('<br />When: From <start_time> through <end_time>.');
    }
    return trimed_text;
  }

  getStowInfoQueryForStowType(stow_type) {
    const stowTypeToStowInfo = {
      '6': ['Weather_Forecast-Wind_Gust', '='],
      '26': ['Weather_Forecast-Wind_Gust', '='],
      '7': ['Weather_Forecast-Avg_Wind', '='],
      '27': ['Weather_Forecast-Avg_Wind', '='],
      '8': ['Weather_Forecast-Deep_Snow', '='],
      '28': ['Weather_Forecast-Deep_Snow', '='],
      '9': ['Weather_Forecast_Alert%', 'LIKE'],
      '29': ['Weather_Forecast_Alert%', 'LIKE']
    };
    return db.site_stow_nc_asset_id(stowTypeToStowInfo[`${stow_type}`][1], stowTypeToStowInfo[`${stow_type}`][0]);
  }
}
exports.weatherStowService = new WeatherStowService();
