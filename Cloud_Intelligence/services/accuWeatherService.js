const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
const Handlebars = require("handlebars");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const aws_integration = require("../aws_integration");
const utils = require("../utils");
const { getS3EmailAssetsUrl, formatUserFriendlyTime } = require("../utils/libs/functions");
const { notificationService } = require("./common/notificationService");
const _ = require("lodash");
const iotPub = require("../mqtt");
const { weatherStowService } = require("../services/weatherStowService");
const { WeatherForecastStowModel } = require("../models/weatherForecastStow.model");
const { StowTypes, StowStates, deviceTypeNames } = require("../utils/constants");

class AccuWeatherService {
  async handler(client, pgWrite, payload) {
    this.client = client;
    this.pgWrite = pgWrite;
    this.payload = Object.assign({}, payload);  // Copy object
    try {
      this.prepare_event();
      switch (payload.channel) {
        case "local_weather_nc_stow_update":
        case "local_weather_nc_reboot":
        case "local_weather_nc_online":
          await this.processNCEvent();
          break;
        default:
          await this.processForecastEvent();
          if (this.payload.next) {
            this.payload = this.payload.next;
            return await this.processForecastEvent();
          }
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error AccuWeatherService handler...!!",
        err
      );
    }
  }

  async processNCEvent() {
    let site_stow_info = await this.client.query(db.site_stow_nc_id, [
      this.payload.network_controller_id
    ]);
    if (!site_stow_info || site_stow_info.rows.length === 0) {
      console.log("ACW: Failed to get site stow info");
      site_stow_info = { rows: [{}] };
      return;
    }
    site_stow_info = site_stow_info.rows;
    console.log("ACW: site stow info:", site_stow_info);
    if (site_stow_info.stow_type !== null)
      await this.handle_nc_event(site_stow_info);
  }


  async handle_nc_event(info) {
    let send_stow_cmd = false;
    let oldAlarmInfo = this.filter_older_cmds(info);
    switch (this.payload.channel) {
      case "local_weather_nc_stow_update":
        send_stow_cmd = this.payload.need_accu_weather_update === true;
        if (send_stow_cmd === false) {
          // Pick NC matching stow from info
          const filtered_NC = this.filterNCStowType(info);
          info = filtered_NC.length ? filtered_NC[0] : [];
          await this.handle_nc_stow_response(info);
        } else {
          // TODO:: The requested stow type must be presnet in stow info, if not add inactive stow info
        }
        break;
      case "local_weather_nc_reboot":
      case "local_weather_nc_online":
        // Check for any stow pending
        info = this.filter_pendings_cmds(info);
        send_stow_cmd = info.length > 0;
        break;
    }
    let returnResult = null;
    if (send_stow_cmd) {
      // Loop over all pending stows
      await info.reduce(async (acc, stow) => {
        const result = await acc || [];
        console.log("ACW: send stow command pending/request.");
        // await this.sendWeatherStowReqNC(stow, null, null, false);
        returnResult = [...result, true];
      }, []);

    }
    if (oldAlarmInfo.length !== 0) {
      for (const stow of oldAlarmInfo) {
        console.log("ACW: handle older alarms not cleared alerts");
        await this.handleOlderAlarmsPendingAlerts(stow);
      }      
    }
    return returnResult;
  }
  async handleOlderAlarmsPendingAlerts(info) {
    //todo add endtime older than 24 hours check if required
    //check active cloud alter with stow type
    if (info.stow_type !== null && info.stow_type !== StowTypes.HAIL_STOW) {
      const cloudAlert = await this.pgWrite.query(db.cloudAlertsForNC,
        [this.payload.network_controller_id, this.getPendingAlertsEventNames(info.stow_type)]);
      // delete cloud alert after logging
      if (cloudAlert.rows.length !== 0) {
        const deleteAlert = await this.pgWrite.query(db.removeCloudAlert, [cloudAlert.rows[0].id]); 
        console.log(`handleOlderAlarmsPendingAlerts/deleteAlert: `, deleteAlert);
      }
    }
  }

  is_stow_cmd_pending(info) {
    return (info.active && !!(info.state & 0x01))
  }

  is_stow_cmd_failed_to_clear(info) {
    return (!info.active)
  }

  filter_older_cmds(info) {
    return info.filter(stow => this.is_stow_cmd_failed_to_clear(stow));
  }

  filter_pendings_cmds(info) {
    return info.filter(stow => this.is_stow_cmd_pending(stow));
  }

  is_nc_online(info) {
    return info.connected;
  }

  is_stow(info) {
    return info.active === true && info.state < 11
  }

  is_nc_offline_alert(alert) {
    return (alert && alert.rows.length && alert.rows[0].title.indexOf("Stow Failed: NC is offline") >= 0) ? true : false;
  }

  get_weather_stow_updates_stow_type(stow_info) {
    const stowInfoStowType = {
      'Weather_Forecast-Wind_Gust': 6,
      'Weather_Forecast-Avg_Wind': 7,
      'Weather_Forecast-Deep_Snow': 8,
      'Weather_Forecast_Alert-xyz': 9
    };
    let wsu_stow_type;
    if (this.is_alert_stow(stow_info.stow_type)) {
      wsu_stow_type = 9;
    } else {
      wsu_stow_type = stowInfoStowType[stow_info.stow_type];
    }
    if (stow_info.state > 10) {
      wsu_stow_type += 20;
    }
    console.log(`get_weather_stow_updates_stow_type: stow_type:${stow_info.stow_type} state:${stow_info.state} -> ${wsu_stow_type}`);
    return wsu_stow_type;
  }

  async addEventLogDebugMsg(msg, stowInfo = null) {
    if (process.env.NODE_ENV == "test" /*|| process.env.NODE_ENV == "production"*/) {
      return;
    }
    await this.getEventMeta();
    this.payload.debug_info = msg;
    const org_alert_type = this.alert_type;
    if (stowInfo) this.alert_type += `:${stowInfo.stow_type}`;
    const org_stow_type = this.payload.stow_type;
    this.payload.stow_type = "ACW_DEBUG";
    let eventTitle = this.getTitle(true);
    await this.addDebugEventLog(eventTitle, true, { location_lat: "" });
    //await this.addEventLog(eventTitle, true, {location_lat: ""});
    this.payload.debug_info = null;
    this.payload.stow_type = org_stow_type;
    this.alert_type = org_alert_type;
  }

  async handle_nc_stow_response(info) {
    if (!this.is_response_ok(info)) {
      console.log("ACW: Invalid response:", this.payload, "DB info:", info);
      // TODO:: Do we need any action to resync the NC
      return
    }
    if (this.payload.error_code) {
      // error_code 1) Invalid end time, 2) Invalid start time, 3) end time passed, 4) start time greater then 5 min then now
      await this.addEventLogDebugMsg({ msg: "NC stow response error.", site_id: info.site_id, payload: { ...this.payload } }, info);
      //return;
    }

    if (this.is_stow_cmd_pending(info) ||
      (this.is_stow(info) != info.active)) {  // active === true and state >= 11. active === true and state == 11 is fulfilled by above condition
      console.log(`${this.is_stow_cmd_pending(info) ? '' : 'WARNING: Case occurs this.is_stow(info) != info.active. active: ${info.active} state: ${info.state}'}`);
      console.log("ACW: site stow update [state, active, id]", info.site_id, [this.is_stow_cmd_pending(info) ? info.state + 1 : info.state,
      this.is_stow(info),
      info.id
      ]);
      let res = await this.pgWrite.query(db.site_stow_update, [
        this.is_stow_cmd_pending(info) ? info.state + 1 : info.state,
        this.is_stow(info),
        info.id
      ]);
      if (!res || res.rowCount != 1) {
        console.log("ACW: Failed site stow update", res);
      }
      //await this.send_weather_stow_update(info, null);
    }
  }

  async send_weather_stow_update(stow_info, eventMeta, message_type = null) {
    if (!("prj_data" in this.payload)) {
      this.payload.prj_data = {};
      this.payload.prj_data.id = stow_info.site_id;
    }
    if (!eventMeta) {
      eventMeta = await this.getEventMeta();
    }
    const params = {
      channel: "weather_stow_updates",
      stow_type: this.get_weather_stow_updates_stow_type(stow_info), // For handle_nc_stow_response, is_response_ok validates site_stow_info
      stow_value: 0,
      stow_threshold: 0,
      asset_id: this.payload.asset_id,
      asset_name: eventMeta ? eventMeta.assetName : "",
      device_type_id: stow_info.device_type_id,
      timestamp: moment().utc().format(),  // stow_info.timestamp
      message_type: 'NORMAL'
    };
    if (message_type) {
      params.message_type = message_type;
      params.stow_type %= 20;   // To handle 'NC_OFFLINE_EXIT'
    }
    console.log("send_weather_stow_update:", params);
    await weatherStowService.handler(
      this.client,
      this.pgWrite,
      params
    );
  }

  is_response_ok(info) {
    return moment(this.payload.stow_start_time).isSame(info.start_time) &&
      moment(this.payload.stow_end_time).isSame(info.end_time) &&
      this.payload.accu_stow === this.is_stow(info) &&
      this.payload.nc_stow_type === this.getStowTypeForNC(info);
  }

  filterStowTypeForAlarm(stow_info) {
    let filtered;
    if (this.payload.stow_type == 'Weather_Stow_AccuWeather-Alert') {
      filtered = stow_info.filter(stow => this.is_alert_stow(stow.stow_type));
    } else {
      filtered = stow_info.filter(stow => stow.stow_type == this.payload.alarm.stow_type);
    }
    if (filtered.length == 0) {
      console.log(`No stow info for alarm ${this.payload.alarm.stow_type}. stow_info:`, stow_info.map(stow => stow.stow_type));
    }
    return filtered;
  }

  filterNCStowType(stow_info) {
    // For accumulated case there must be only one entry per site.
    //return stow_info.length === 1 ? stow_info : null;
    return stow_info.filter(stow => this.getStowTypeForNC(stow) == this.payload.nc_stow_type);
  }

  get_stow_type_for_weather_stow_from_weather_forecast(forecast_type) {
    return `Weather_Stow_AccuWeather${forecast_type.slice("Weather_Forecast".length)}`;
  }

  prepare_event() {
    this.alert_type = "";
    this.alert_type_str = "";
    switch (this.payload.channel) {
      case "local_weather_hourly_alarms":
      case "local_weather_alerts_alarms":
        if (this.payload.stow_type.includes("Weather_Forecast-")) {
          this.alert_type = this.payload.stow_type.slice("Weather_Forecast-".length);
        } else {
          this.alert_type = this.payload.stow_type.slice("Weather_Forecast_Alert-".length);
          this.payload.stow_type = "Weather_Forecast_Alert-xyz";
        }
        this.alert_type_str = _.startCase(this.alert_type.toLowerCase());
        break;
      case "local_weather_stow_alarms":
        this.payload.prj_data = this.payload.alarm.prj_data;
        if ("site_data" in this.payload.alarm) this.payload.site_data = this.payload.alarm.site_data;
        this.payload.stow_type = this.payload.alarm.stow_type;
        if (this.is_alert_stow(this.payload.stow_type)) {
          //this.alert_type_str = this.payload.stow_type.toLowerCase().replace(/_|-/g, " ").replace(/(^\w|\s\w)/g, m => m.toUpperCase());
          this.alert_type = this.payload.stow_type.slice("Weather_Forecast_Alert-".length);
          this.payload.stow_type = `Weather_Stow_AccuWeather-Alert`;
          console.log("local_weather_stow_alarms IF", this.alert_type);
        } else {
          this.alert_type = this.payload.stow_type.slice("Weather_Forecast-".length);
          this.payload.stow_type = this.get_stow_type_for_weather_stow_from_weather_forecast(this.payload.stow_type);
          console.log("local_weather_stow_alarms ELSE ", this.alert_type, this.payload.stow_stype);
        }
        break;
      // For following cases (this.payload.stow_type = "WEATHER_STOW") where required, stow_type is picked from current stow_info
      case "local_weather_nc_stow_update":
        this.payload.nc_stow_type = this.payload.stow_type;
        this.alert_type = (this.payload.need_accu_weather_update ? "NC Request:" : "NC Update:") + this.payload.nc_stow_type;
        this.payload.stow_type = "WEATHER_STOW";
        break;
      case "local_weather_nc_reboot":
        this.alert_type = "NC Reboot";
        this.payload.stow_type = "WEATHER_STOW";
        break;
      case "local_weather_nc_online":
        this.alert_type = "NC Online";
        this.payload.stow_type = "WEATHER_STOW";
        break;
    }
    console.log(`prepare_event:`, this.alert_type, this.alert_type_str, this.payload.stow_type);
  }

  is_alert_stow(stow_type) {
    return (stow_type ? (stow_type.indexOf("Alert") >= 0 ?
      (stow_type.indexOf("Winter_Weather_Advisory") >= 0 ? false : true)
      : false)
      : false);
  }

  getStowTypeForNC(stow_info) {
    if (!stow_info || !stow_info.stow_type) {
      // No stow info in DB and NC requests get_site_stow
      if ('nc_stow_type' in this.payload)
        return this.payload.nc_stow_type;
    }
    if (stow_info && stow_info.stow_type && this.is_alert_stow(stow_info.stow_type)) {
      return 'alert_api';
    }
    return stow_info.stow_type ? stow_info.stow_type.slice("Weather_Forecast-".length).toLowerCase() : "wind_gust";
  }

  async processForecastEvent() {
    if (this.payload.stow_type == null) {
      return "Invalid event type";
    }
    let prj_sites = ("site_data" in this.payload) ? [this.payload.site_data] : await this.get_project_sites();
    await prj_sites.reduce(async (acc, site) => {
      const results = await acc;
      this.payload.site_data = { id: site.id };
      const eventMeta = await this.getEventMeta();
      if (eventMeta) {
        const cloudAlert = await this.getActiveCloudAlert();
        console.log(`WeatherEvent: ${this.isWeatherEvent()} cleared: ${this.isWeatherEventCleared()} cloudAlert ${cloudAlert.rows.length}`);

        const activeHailStow = await WeatherForecastStowModel.getActiveWeatherForecastStowBySiteId(this.client, eventMeta.site_id, StowTypes.HAIL_STOW, true)
        
        // If hail stow already in progress, and new stow is not Weather_Forecast-Avg_Wind, then ignore this event.
        const isThisWindStow = this.payload?.alarm?.stow_type === StowTypes.AVG_WIND || this.payload?.alarm?.stow_type === StowTypes.WIND_GUST
        if (!isThisWindStow && activeHailStow) {
          console.log(`ACW: Hail stow already in progress, and upcoming StowType is other then avg wind, so not processing ${this.payload?.alarm?.stow_type}`, "Params:", JSON.stringify({eventMeta, cloudAlert, activeHailStow}));
          return
        } else if (isThisWindStow && activeHailStow) {
          // if site is already in hail stow and upcoming site mode is avg wind then mark hail stow inactive 
          await WeatherForecastStowModel.updateWeatherForecastStow(this.pgWrite, eventMeta.site_id, StowTypes.HAIL_STOW, { active: false, state: StowStates.ENDED })
        }

        if (!moment(this.payload?.start?.when).isSame(this.payload?.end?.when) || this.isWeatherEventCleared()) {
          if (this.payload.channel === "local_weather_stow_alarms") {
            await this.handleWeatherAutoStow(eventMeta, cloudAlert);
            return true;
          }

          if (this.isWeatherEvent()) {
            let eventTitle = this.getTitle(true);
            eventMeta.eventTitle = eventTitle;
            eventMeta.title = eventTitle;
            if (cloudAlert.rows.length === 0) {
              await this.generateWeatherEventAlert(
                eventTitle,
                eventMeta
              );
            } else {
              await this.updateWeatherEventAlert(
                eventMeta,
                cloudAlert.rows[0]
              );
            }
          } else if (this.isWeatherEventCleared() && cloudAlert.rows.length > 0) {
            await this.clearWeatherEventAlert(
              cloudAlert.rows,
              eventMeta
            );
          } else {
            console.log(`WeatherEvent: ${this.isWeatherEvent()} cleared: ${this.isWeatherEventCleared()} cloudAlert ${cloudAlert.rows.length}`);
          }
          return [...results, true];
        } else {
          console.log(`WeatherEvent: Same timestamps`);
        }

      } else {
        return [...results, "Asset Not Found"];
      }
    }, [])
  }

  /*
   const site_stow = 1;  // Stow start pending
   const site_stow = 2;  // Stow start Ack
   const site_stow = 3;  // Stow update pending
   const site_stow = 4;  // Stow update Ack
   const site_stow = 11;  // Stow end pending, active should be true
   const site_stow = 12;  // Stow end Ack, active will be set to false
 */
  async handleWeatherAutoStow(eventMeta, cloudAlert) {
    let result;
    const org_payload_ts = this.payload.timestamp;
    result = await this.client.query(db.site_stow_site_id, [eventMeta.site_id]);
    if (!result.rowCount) {
      console.log("ACW: Failed to get site_stow_site_id", result);
    } else {
      // console.log("ACW: site_stow_site_id res.", result.rows);
      result.rows = this.filterStowTypeForAlarm(result.rows);
      result.rowCount = result.rows.length;
    }
    if (!moment(this.payload?.alarm?.start?.when).isSame(this.payload?.alarm?.end?.when) || this.isWeatherEventCleared()) {
      let state = this.getStowNextState(result, cloudAlert);

      if (state !== 0) {
        // If updating active stow then alarm timestamp must not be in past
        if (state != 1 && result.rowCount && moment(this.payload.alarm.timestamp).isBefore(result.rows[0].alarm_timestamp)) {
          console.log(`Ignoring stow event with alarm.timestamp ${this.payload.alarm.timestamp} in past then active stow alarm timestamp ${moment(result.rows[0].alarm_timestamp).utc().format()}`);
          return;
        }
        this.validateStowAlarmParams(result);
        if (result?.rows.length) {

          const old_hide_at_project_level = result.rows[0].active ? result.rows[0].hide_at_project_level : true;
          const hide_at_project_level = this.payload.alarm.hide_at_project_level && old_hide_at_project_level;

          console.log("ACW: site_stow_update params", [
            eventMeta.asset_id, 
            result.rows[0].id, 
            this.payload.timestamp,
            state !== 12, 
            state, 
            this.payload.alarm.stow_type, 
            this.payload.start.when, 
            this.payload.end.when, 
            this.payload.alarm.start.when,
            this.payload.alarm.end.when, 
            this.payload.alarm.start.value, 
            this.payload.alarm.start.threshold, 
            this.payload.alarm.text,
            this.payload.alarm.timestamp, hide_at_project_level || false
          ]);

          result = await this.pgWrite.query(db.site_stow_updateFull(state), [eventMeta.asset_id, result.rows[0].id, this.payload.timestamp,
              (state === 12) ? false : true, state, this.payload.alarm.stow_type, this.payload.start.when, this.payload.end.when, this.payload.alarm.start.when,
              this.payload.alarm.end.when, this.payload.alarm.start.value, this.payload.alarm.start.threshold, this.payload.alarm.text,
              this.payload.alarm.timestamp, hide_at_project_level || false
          ]);

      } else {

          console.log("ACW: site_stow_insert", db.site_stow_insert, [
            eventMeta.asset_id, 
            eventMeta.site_id, 
            this.payload.timestamp,
            true, 
            state, 
            this.payload.alarm.stow_type, 
            this.payload.start.when, 
            this.payload.end.when, 
            this.payload.alarm.start.when,
            this.payload.alarm.end.when, 
            this.payload.alarm.start.value, 
            this.payload.alarm.start.threshold, 
            this.payload.alarm.text,
            this.payload.alarm.timestamp, 
            this.payload.alarm.hide_at_project_level
          ]);

          result = await this.pgWrite.query(db.site_stow_insert, [eventMeta.asset_id, eventMeta.site_id, this.payload.timestamp,
              true, state, this.payload.alarm.stow_type, this.payload.start.when, this.payload.end.when, this.payload.alarm.start.when,
              this.payload.alarm.end.when, this.payload.alarm.start.value, this.payload.alarm.start.threshold, this.payload.alarm.text,
              this.payload.alarm.timestamp, this.payload.alarm.hide_at_project_level
          ]);

      }
        if (!result || result.rowCount != 1) {
          console.log("ACW: upsert failed", result);
        } else {
          console.log("ACW: site_stow_upsert res", result.rows[0]);
        }
      }
      if (!result || !result.rowCount || !("enable_weather_forecast_stow" in result.rows[0])) {
        console.log("ACW: Failed to process site stow info", result);
        return;
      }
      result.rows[0].start_time = moment(result.rows[0].start_time).utc().format();
      result.rows[0].end_time = moment(result.rows[0].end_time).utc().format();
      console.log("ACW: updated site_stow_site_id res.", result.rows[0]);
      this.payload.timestamp = org_payload_ts;  // Restore payload timestamp for event log messages

      if (await this.getSleepModeCheck(eventMeta) === false && this.isWeatherEventCleared() === false) {
        console.log("ACW: SLEEPMODE");
        return;
      }
      if (state === 0) {
        if (!this.is_stow_cmd_pending(result.rows[0]))
          return;
        console.log("ACW: Resend pending stow req");
      }
      await this.sendWeatherStowReqNC(result.rows[0], cloudAlert, eventMeta, true);
    } else {
      console.log(`WeatherEvent: In handleWeatherAutoStow Same timestamps`)
    }
  }

  async checkTimeRange(sleep_mode_time, wakeup_time, eventStartTime, eventEndTime) {
    console.log("checkTimeRange:", sleep_mode_time, wakeup_time, eventStartTime, eventEndTime);
    eventStartTime = new Date(eventStartTime);
    eventEndTime = new Date(eventEndTime);
    // console.log("checkTimeRange1:", sleep_mode_time, wakeup_time, eventStartTime, eventEndTime);
    // console.log("sleep mode time ", typeof sleep_mode_time);
    // console.log("wakeup time ", typeof wakeup_time);
    // console.log("start time ", typeof eventStartTime);
    // console.log("end time ", typeof eventEndTime);
    let start_time_in_range = false;
    let end_time_in_range = false;

    if (eventStartTime.getTime() > sleep_mode_time.getTime() && eventStartTime.getTime() < wakeup_time.getTime())
      start_time_in_range = true;

    if (eventEndTime.getTime() > sleep_mode_time.getTime() && eventEndTime.getTime() < wakeup_time.getTime())
      end_time_in_range = true;
    console.log("SLEEPMODE: ", start_time_in_range, end_time_in_range);
    if (start_time_in_range && end_time_in_range) {
      return false;
    } else {
      return true;
    }
  }

  async getSleepModeCheck(eventMeta) {
    if (eventMeta.enable_nightly_shutdown === true) {
      let check = await this.checkTimeRange(eventMeta.last_sleep_mode_update, eventMeta.wakeup_time, this.payload.alarm.start.when, this.payload.alarm.end.when);
      return check;
    } else {
      return true;
    }

  }


  retainStowAlarmValues(oldAlarm) {
    this.payload.timestamp = moment(oldAlarm.timestamp).utc().format();
    this.payload.start.when = moment(oldAlarm.start_time).utc().format();
    this.payload.alarm.start.when = moment(oldAlarm.alarm_start_time).utc().format();
    //this.payload.alarm.start.value = oldAlarm.alarm_value;
    //this.payload.alarm.start.threshold = oldAlarm.alarm_threshold;
    //this.payload.alarm.timestamp = oldAlarm.alarm_timestamp;
  }

  getStowNextState(stowResult, cloudAlert) {
    let state = 0; // means resend stow req if pending.
    if (this.isWeatherEvent()) {
      if (!stowResult.rowCount || !this.is_stow(stowResult.rows[0])) {
        state = 1;    // Fresh stow event
      } else {
        if (this.is_stow_event_changed(stowResult.rows[0])) {
          // If event changed.
          if (!this.is_stow_cmd_pending(stowResult.rows[0])) {
            // If last state was acknowledge, then update state else keep previous pending state
            state = 3;
          } else {
            state = stowResult.rows[0].state;   // To keep state = 1 for NC_OFFLINE case.
          }
          this.retainStowAlarmValues(stowResult.rows[0]);
        }
      }
    } else {
      if (stowResult.rowCount && this.is_stow(stowResult.rows[0])) {
        if (this.is_nc_offline_alert(cloudAlert) && stowResult.rows[0].state === 1) {
          // Stow not communicated to NC and NC_OFFLINE alert is active
          state = 12;
        } else {
          state = 11;
        }
        this.retainStowAlarmValues(stowResult.rows[0]);
      }
    }
    console.log("ACW: handleWeatherAutoStow state", state);
    return state;
  }

  validateStowAlarmParams(stowResult) {
    if (!this.payload.alarm.start) {
      this.payload.alarm.start = {};
      if (stowResult.rowCount && stowResult.rows[0].active) {
        this.payload.alarm.start.when = stowResult.rows[0].alarm_start_time;
        this.payload.alarm.start.value = stowResult.rows[0].alarm_value;
        this.payload.alarm.start.threshold = stowResult.rows[0].alarm_start_threshold;
      } else {
        this.payload.alarm.start.when = null;
        this.payload.alarm.start.value = null;
        this.payload.alarm.start.threshold = null;
      }
    } else if (this.payload.alarm.start.value == undefined) {
      if (stowResult.rowCount && stowResult.rows[0].active) {
        this.payload.alarm.start.value = stowResult.rows[0].alarm_value;
        this.payload.alarm.start.threshold = stowResult.rows[0].alarm_threshold;
      } else {
        this.payload.alarm.start.value = 0;
        this.payload.alarm.start.threshold = 0;
      }
    }
    if (!this.payload.alarm.end) {
      this.payload.alarm.end = {};
      if (stowResult.rowCount && stowResult.rows[0].active) {
        this.payload.alarm.end = stowResult.rows[0].alarm_end_time;
      } else {
        this.payload.alarm.end.when = null;
      }
    }
    if (this.payload.alarm.text == undefined) {
      if (stowResult.rowCount && stowResult.rows[0].active) {
        this.payload.alarm.text = stowResult.rows[0].alarm_text;
      } else {
        this.payload.alarm.text = null;
      }
    }
    if (!moment(this.payload.alarm.start.when).isValid()) {
      this.payload.alarm.start.when = this.payload.start.when;
    }
    if (!moment(this.payload.alarm.end.when).isValid()) {
      this.payload.alarm.end.when = this.payload.end.when;
    }
  }

  is_stow_event_changed(site_stow_info) {
    const new_hide_at_project_level = site_stow_info.hide_at_project_level && this.payload.alarm.hide_at_project_level;
    if (!moment(this.payload.end.when).isSame(site_stow_info.end_time) || !moment(this.payload.alarm.end.when).isSame(site_stow_info.alarm_end_time) ||
      this.payload.alarm.stow_type.localeCompare(site_stow_info.stow_type) != 0 ||
      (this.payload.alarm.start.value && this.payload.alarm.start.value != site_stow_info.alarm_value) ||
      (this.payload.alarm.start.threshold && this.payload.alarm.start.threshold != site_stow_info.alarm_threshold) ||
      (this.payload.alarm.text !== site_stow_info.alarm_text) ||
      (new_hide_at_project_level != site_stow_info.hide_at_project_level)) {
      return true;
    }
    return false;
  }

  async sendWeatherStowReqNC(stow_info, cloudAlert, eventMeta, sendWeatherStowUpdate) {
    let message_type = null;
    this.payload.stow_info = stow_info;
    const auto_stow_disabled = (!stow_info.enable_weather_forecast ||
      (!stow_info.enable_weather_forecast_stow && !this.is_alert_stow(stow_info.stow_type)) ||
      (!stow_info.enable_weather_alert_stow && this.is_alert_stow(stow_info.stow_type)));
    // If NC online then send weather stow command to NC and NC-Offline Alert will be removed on NC response.
    // If NC offline then either show NC-Offline Alert or post weather_stow_update (to update/remove Alert) if required
    if (this.is_nc_online(stow_info)) {
      const iot_params = {
        stow: this.is_stow(stow_info),
        stow_type: this.getStowTypeForNC(stow_info),
        start_time: stow_info.start_time ? moment(stow_info.start_time).utc().format() : moment().subtract(1, "hour").utc().format(),
        end_time: stow_info.end_time ? moment(stow_info.end_time).utc().format() : moment().subtract(1, "hour").utc().format()
      };
      let action_time;
      if (iot_params.stow)
        action_time = iot_params.start_time;
      else
        action_time = iot_params.end_time;
      if (moment(action_time).diff(moment(), "minute") > 1)
        console.log(`WARNING: ${moment().utc().format()} diff action_time > 1 min.`);

      console.log(`ACW: iotPub[${stow_info.aws_iot_principal_id}]:`, iot_params);
      const result = await iotPub.updateWeatherForecastStow(stow_info.aws_iot_principal_id, iot_params);
      console.log("ACW: iotPub res.", result);
      // Added for testing
      await this.addEventLogDebugMsg({ msg: "iotPub.", iot_id: stow_info.aws_iot_principal_id, ...iot_params, ...result }, stow_info);
    } else {
      console.log("ACW: NC not connected");
      // If no Alert then show NC-offline Alert
      // For NC_OFFLINE message case allow sendWeatherStowUpdate, stow params may be needed to be updated.
      if (cloudAlert && ((stow_info.state === 1) || (stow_info.state > 10 && !this.is_nc_offline_alert(cloudAlert)))
      ) {
        message_type = stow_info.state <= 10 ? 'NC_OFFLINE' : 'NC_OFFLINE_EXIT';
      }
      if ((message_type != null) ||
        (sendWeatherStowUpdate &&
          // Update if stow and no NC_OFFLINE alert or if stow clear and NC_OFFLINE alert is active
          // (stow && !NC_OFFLINE) || (!stow && NC_OFFLINE)
          ((this.is_stow(stow_info) != this.is_nc_offline_alert(cloudAlert)) || auto_stow_disabled))) {
        // For alert message to be updated when NC is offline.
        //todo:
        //check current site mode is weather stow or not if message type is 'NC_OFFLINE_EXIT'
        const isWeatherStowSiteMode = this.checkWeatherStowSiteMode(stow_info);
        console.log("isWeatherStowSiteMode: ", isWeatherStowSiteMode);
        if (message_type === 'NC_OFFLINE_EXIT' && !isWeatherStowSiteMode) {
          console.log('NO Stow exit if NC is offline & NC site mode is not weather stow');
        } else {
          await this.send_weather_stow_update(stow_info, eventMeta, message_type);
        }

      } else {
        // Added for testing
        await this.addEventLogDebugMsg({ msg: "iotPub.", iot_id: stow_info.aws_iot_principal_id, status: "NC_OFFLINE" }, stow_info);
      }
    }
  }

  checkWeatherStowSiteMode(stow_info) {
    console.log('STOWINFO: ', stow_info);
    return stow_info.commanded_state === 2 ? true : false;
  }

  async generateWeatherEventAlert(eventTitle, eventMeta) {
    await this.addCloudAlert(eventTitle, true, eventMeta);
    await this.addEventLog(eventTitle, true, eventMeta);
    if (this.payload.prj_data.enable_weather_forecast_notification)
      await this.sendNotification(eventMeta);
    return true;
  }

  async updateWeatherEventAlert(eventMeta, activeAlert) {
    // Update existing alert & do not log it
    return await this.updateCloudAlert(eventMeta, true, activeAlert);
  }

  pickAlertTypeStrFromActiveEventName(active_alert_event_name) {
    let org_alert_type_str = null;
    if (this.payload.stow_type === "Weather_Forecast_Alert-xyz" && this.alert_type === "Clear_All") {
      org_alert_type_str = this.alert_type_str;
      this.alert_type_str = active_alert_event_name.slice("Weather_Forecast_Alert-".length);
      this.alert_type_str = this.alert_type_str.replace(/_/g, " ");
      console.log(`Replacing ${org_alert_type_str} with ${this.alert_type_str}`)
    }
    return org_alert_type_str;
  }

  async clearWeatherEventAlert(
    activeAlerts,
    eventMeta
  ) {
    for (const activeAlert of activeAlerts) {
      console.log("ActiveAlert: ", activeAlert.message);
      const replaced = this.pickAlertTypeStrFromActiveEventName(activeAlert.event_name);
      let eventTitle = this.getTitle(false);
      let active_alert_end_time = null;
      let active_alert_start_time = null;
      eventMeta.eventTitle = eventTitle;
      eventMeta.title = eventTitle;
      if (activeAlert && activeAlert.params) {
        const json_params = activeAlert.params;
        active_alert_end_time = (json_params && json_params.end_time != undefined) ? json_params.end_time : null;
        active_alert_start_time = (json_params && json_params.start_time != undefined) ? json_params.start_time : null;
      }
      if (this.payload.end && active_alert_end_time) {
        if (moment(this.payload.end.when).isBefore(active_alert_end_time)) {
          if (active_alert_start_time && moment(this.payload.end.when).isBefore(active_alert_start_time)) {
            console.log(`Ignore alarm clear, end time ${this.payload.end.when} is before activeAlert start time ${active_alert_start_time}`);
            continue;
          }
          console.log(`WARN: Alarm clear end time ${this.payload.end.when} is before activeAlert end time ${active_alert_end_time}`);
        }
      }
      await this.clearAlert(activeAlert.id);
      // Filter out Current Alert clear Timeline event, if non overlapping new Alert is present.
      console.log("CLEAR_CLOUD_ALERT: ", this.payload.next);
      if (this.payload.next === null) {
        await this.addEventLog(eventTitle, false, eventMeta);
      } else if (this.payload.next.clear === true) {
        console.log("next have clear true");
        if (this.payload.end.when === this.payload.next.end.when) {
          console.log("same end timestamp");
          await this.addEventLog(eventTitle, false, eventMeta);
        } else {
          console.log("Different end timestamp");
        }
      } else {
        console.log("payload next condition not pass")
      }
      if (this.payload.prj_data.enable_weather_forecast_notification)
        await this.sendNotification(eventMeta);

      if (replaced)
        this.alert_type_str = replaced;
    }
    return true;
  }

  async clearAlert(alertId) {
    try {
      console.log("Delete Cloud Alert: ", alertId);
      await cloudAlertService.clearAlertDetail(this.pgWrite, alertId, false);
      return await this.pgWrite.query(db.removeCloudAlert, [alertId]);
    } catch (err) {
      console.error("Error In clearAlert.. ", err);
      throw new Error("Error In clearAlert.. ", err);
    }
  }

  async addCloudAlert(eventTitle, isActive, info) {
    try {
      const params_str = this.getCloudAlertParams(null, info);
      console.log(
        "eventName",
        this.getEventNames(this.payload.stow_type, isActive)
      );
      console.log(db.addCloudAlertParamsQuery, [
        this.getEventNames(this.payload.stow_type, isActive),
        this.payload.timestamp,
        this.payload.asset_id,
        this.payload.device_type === "Network Controller" ? 1 : 2,
        true,
        eventTitle,
        this.getIcons(isActive),
        this.getMessage(
          this.payload.stow_type,
          isActive,
          info
        ),
        params_str
      ]);
      return await this.pgWrite.query(db.addCloudAlertParamsQuery, [
        this.getEventNames(this.payload.stow_type, isActive),
        this.payload.timestamp,
        this.payload.asset_id,
        this.payload.device_type === "Network Controller" ? 1 : 2,
        true,
        eventTitle,
        this.getIcons(isActive),
        this.getMessage(
          this.payload.stow_type,
          isActive,
          info
        ),
        params_str
      ]);
    } catch (err) {
      console.error("ERR:", err);
      throw new Error("Error In addCloudAlert.. ", err);
    }
  }

  retainForecastAlarmValues(oldAlarm) {
    if (oldAlarm) {
      this.payload.start.when = oldAlarm.start_time;
      //if (this.payload.stow_type == "Weather_Forecast-Deep_Snow" && this.payload.start.value_total >= 0) {
      //  this.payload.start.value_total = oldAlarm.value;
      //} else {
      //  this.payload.start.value = oldAlarm.value;
      //}
      //if (this.payload.prj_data) {
      //  this.payload.prj_data.weather_forecast_notification_threshold = oldAlarm.notification_threshold;
      //}
    }
  }

  async updateCloudAlert(info, isActive, activeAlert) {
    try {
      let json_params = {};
      let start_time;
      let end_time;
      console.log("ActiveAlert: ", activeAlert.message);
      if (activeAlert && activeAlert.params) {
        json_params = activeAlert.params;
        start_time = json_params.start_time;
        end_time = json_params.end_time;
      }

      //const { start_time, end_time, percent} = this.extractStartEndTime(
      //  activeAlert.message,
      //  info
      //);
      this.payload.timestamp = activeAlert.created; // don't update timestamp
      if (start_time && end_time) {
        console.log(`ActiveAlert start ${start_time} end ${end_time}`);
        console.log(
          `newAlert start ${this.payload.start.when} end ${this.payload.end.when}`
        );
        // Don't update start_time if it is in past.
        if (moment(start_time).isBefore(moment())) {
          this.retainForecastAlarmValues(json_params);
        }
      }
      const new_params = this.getCloudAlertParams(json_params, info);
      if (activeAlert.message.localeCompare(this.getMessage(this.payload.stow_type, isActive, info)) == 0 &&
        JSON.stringify(activeAlert.params).localeCompare(new_params) == 0) {
        console.log(`Not updating no change in message and params`);
        return false;
      }
      await this.pgWrite.query(db.updateActiveAlertParams, [
        this.getMessage(
          this.payload.stow_type,
          isActive,
          info
        ),
        this.payload.timestamp,
        this.getTitle(isActive),
        this.getIcons(isActive),
        new_params,
        activeAlert.id
      ]);
      return true;
    } catch (err) {
      console.error("Err", err);
      throw new Error("Error In updateCloudAlert.. ", err);
    }
  }

  getHideAtProjectLevel(old_params) {
    // Forecast	  Alert		hide_at_project_level		last_hide_at_project_level		Updated_hide_at__project_level
    //    1			   0			  0							            x	(not present)	              0
    //    1			   0			  0							            0								              0
    //    1			   0			  0							            1								              0
    //
    //    1			   1			  1							            x								              1
    //    1			   1			  1							            1								              1
    //    1			   1			  1							            0								              0
    let hide_at_project_level = true;
    if (old_params) {
      hide_at_project_level = old_params["hide_at_project_level"] != undefined ? old_params.hide_at_project_level : true;
    }

    return this.payload.hide_at_project_level && hide_at_project_level;
  }

  getCloudAlertParams(old_params, info) {
    const params = {
      start_time: this.payload.start.when,
      end_time: this.payload.end.when,
      event_title: this.getParamEventTitle(),
      event_message: this.getParamEventMessage(info)
    };
    params.hide_at_project_level = this.getHideAtProjectLevel(old_params);
    if (this.payload.prj_data) {
      params.notification_threshold = utils.roundNumber(this.payload.prj_data.weather_forecast_notification_threshold, 0);
    }
    if (this.payload.text) {
      params.text = this.payload.text;
    }
    //if (this.payload.stow_type.startsWith("Weather_Stow_AccuWeather")) {
    //  params.alarm_start_time = this.payload.stow_info.alarm_start_time;
    //  params.alarm_end_time = this.payload.stow_info.alarm_end_time;
    //  params.text = this.payload.stow_info.alarm_text;
    //}
    if (this.payload.start.value) {
      params.value = this.payload.start.value;
      params.threshold = this.payload.start.threshold;
    }
    return params;
  }

  getParamEventTitle() {
    return this.getEventTitles(this.payload.stow_type, true);
  }

  getParamEventMessage(info) {
    return this.getMessage(this.payload.stow_type, true, info);
  }

  async addEventLog(eventTitle, isActive, info) {
    try {
      console.log("addEventLog, ", eventTitle, isActive, info);
      console.log(db.addFullCloudEventLogQuery, [
        this.getEventNames(this.payload.stow_type, isActive),
        20,
        this.payload.timestamp,
        this.payload.asset_id,
        this.payload.device_type === "Network Controller" ? 1 : 2,
        eventTitle,
        this.getIcons(this.payload.stow_type, isActive),
        this.getMessage(
          this.payload.stow_type,
          isActive,
          info
        )
      ]);
      const res = await this.pgWrite.query(db.addFullCloudEventLogQuery, [
        this.getEventNames(this.payload.stow_type, isActive),
        20,
        this.payload.timestamp,
        this.payload.asset_id,
        this.payload.device_type === "Network Controller" ? 1 : 2,
        eventTitle,
        this.getIcons(this.payload.stow_type, isActive),
        this.getMessage(
          this.payload.stow_type,
          isActive,
          info
        )
      ]);
      console.log("res ", res);
      return res;
    } catch (err) {
      throw new Error("Error In addEventLog.. ", err);
    }
  }

  async addDebugEventLog(eventTitle, isActive, info) {
    try {
      //we will remove db insersion commented code after testing
      // const query = `INSERT INTO terrasmart.acw_event_log (name,created,asset_id,title,message)
      // VALUES ($1 :: VARCHAR, $2 :: TIMESTAMP, $3 :: UUID, $4::VARCHAR, $5::TEXT)
      // `;
      // const msg = `Debug Info. ${JSON.stringify(this.payload.debug_info)}`;
      console.log(`ACWLogs: `, {
        eventName: this.getEventNames(this.payload.stow_type, isActive),
        timestamp: this.payload.timestamp,
        asset_id: this.payload.asset_id,
        eventTitle: eventTitle,
        payload: this.payload.debug_info
      });
      /*return await this.pgWrite.query(query, [
        this.getEventNames(this.payload.stow_type, isActive),
        this.payload.timestamp,
        this.payload.asset_id,
        eventTitle,
        msg
      ]);*/
      return true;
    } catch (err) {
      console.error("Error In addDebugEventLog.. ", err)
    }
  }

  async get_project_sites() {
    try {
      let sites = [];
      const res = await this.client.query(db.projectSites, [
        this.payload.prj_data.id
      ]);
      if (res && res.rows.length) {
        sites = res.rows;
      }
      return sites;
    } catch (err) {
      throw new Error("Error In get_project_sites.. ", err);
    }
  }

  async getEventMeta() {
    try {
      let assetsInfoByAddr;
      if ("site_data" in this.payload) {
        assetsInfoByAddr = await this.client.query(db.metaInfoBySiteId, [
          this.payload.site_data.id
        ]);
        
        // Logging the initial state of assetsInfoByAddr
        console.log("Initial assetsInfoByAddr: ", {
          metaInfoBySiteId: db?.metaInfoBySiteId,
          siteId: this?.payload?.site_data?.id,
          assetsInfoByAddr,
          stringify_assetsInfoByAddr_rows: JSON.stringify(assetsInfoByAddr?.rows)
        });

        // Filtering the rows where asset_type is 1
        if (assetsInfoByAddr?.rows) {
          assetsInfoByAddr.rows = assetsInfoByAddr.rows.filter(asset => asset.asset_type === 1); // get only nc from the assets
        }

        // Logging the state of assetsInfoByAddr after filtering
        console.log("After Nc filter assetsInfoByAddr: ", {
          siteId: this?.payload?.site_data?.id,
          assetsInfoByAddr,
          stringify_assetsInfoByAddr_rows: JSON.stringify(assetsInfoByAddr?.rows)
        });

      } else {
        // console.log("-----------------------------------", db.metaInfoByNCId, [
        //   this.payload.network_controller_id
        // ]);
        assetsInfoByAddr = await this.client.query(db.metaInfoByNCId, [
          this.payload.network_controller_id
        ]);
      }
      // console.log("RES: ", assetsInfoByAddr.rows);
      let info = null;
      if (assetsInfoByAddr.rows.length > 0) {
        const data = assetsInfoByAddr.rows[0];
        // console.log("_INFO: ", data);
        info = {};
        info.is_notify = data.is_notify;
        info.site_id = data.site_id;
        info.enable_nightly_shutdown = data.enable_nightly_shutdown;
        info.asset_id = data.asset_id;
        info.site_name = data.site_name;
        info.device_type = deviceTypeNames[data.device_type_id];
        info.location_lat = data.location_lat;
        info.location_lng = data.location_lng;
        info.name = data.name;
        info.project_name = data.project_name;
        info.project_id = data.project_id;
        info.project_location = data.project_location;
        //info.network_controller_id = data.network_controller_id;
        info.snap_addr = data.snap_addr;
        info.assetName = this.getAssetName(data);
        if ("prj_data" in this.payload) {
          info.location_lat = this.payload.prj_data.location_lat;
          info.location_lng = this.payload.prj_data.location_lng;
        } else {
          info.location_lat = data.location_lat;
          info.location_lng = data.location_lng;
        }
        info.multipleSites = await notificationService.checkProjectSites(this.client, info.project_id);
        this.payload.device_type = info.device_type;
        this.payload.asset_id = info.asset_id;
        info.commanded_state = data.commanded_state;
        info.last_sleep_mode_update = data.last_sleep_mode_update;
        info.wakeup_time = data.wakeup_time;

      }

      return info;
    } catch (err) {
      throw new Error("Error In get getEventMeta.. ", err);
    }
  }

  async getActiveCloudAlert() {
    try {
      console.log(`getActiveCloudAlert: stow_type: ${this.payload.stow_type} alert_type: ${this.alert_type}`);
      if (this.payload.stow_type === "Weather_Forecast_Alert-xyz" && this.alert_type === "Clear_All") {
        console.log("Weather_Forecast_Alert-xyz", db.checkMatchingCloudAlert("Weather_Forecast_Alert-"));
        return await this.client.query(db.checkMatchingCloudAlert("Weather_Forecast_Alert-"), [
          this.payload.asset_id
        ]);
      } else {
        console.log(`getActiveCloudAlert: eventName: ${this.getEventNames(this.payload.stow_type, true)}`);
        return await this.client.query(db.checkCloudAlert, [
          this.payload.asset_id,
          this.getEventNames(this.payload.stow_type, true)
        ]);
      }
    } catch (err) {
      console.error("getActiveCloudAlert Error:", err);
      throw new Error("Error In get ActiveCloudAlert.. ", err);
    }
  }

  getMessage(event_name, is_active, info) {
    let event_message = this.getEventMessages(event_name, is_active);
    let time_zone = "America/New_York";
    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);
    if (this.payload.start && this.payload.start.value >= 0) {
      const value = (event_name == "Weather_Forecast-Deep_Snow" && this.payload.start.value_total >= 0) ? this.payload.start.value_total : this.payload.start.value;
      event_message = event_message.replace(
        /<value>/g,
        `${utils.roundNumber(value, 1)}`
      );
    }
    if (this.isPercentageAlarm()) {
      event_message = event_message.replace(
        "<percent>",
        `${this.payload.prj_data ? utils.roundNumber(this.payload.prj_data.weather_forecast_notification_threshold, 0) : '--'}% of `
      );
    } else {
      event_message = event_message.replace(
        "<percent>",
        ''
      );
    }
    if (this.payload.prj_data && this.payload.prj_data.weather_forecast_stow_after_time >= 0) {
      event_message = event_message.replace("<resume_time>", utils.roundNumber(this.payload.prj_data.weather_forecast_stow_after_time, 0));
    }
    if (this.payload.text && event_message.indexOf("<Heading>") != -1) {
      const trimed_text = this.trimAlertText(this.payload.text);
      event_message = event_message.slice(0, event_message.indexOf("<Heading>"));
      event_message = event_message.concat(trimed_text);
    }
    if (this.payload.start) {
      let timestamp = formatUserFriendlyTime(this.payload.start.when, time_zone)
      console.log(`Start timestamp[${time_zone}] ${timestamp}`);
      event_message = event_message.replace("<start_time>", timestamp);
    }
    if (this.payload.end) {
      let timestamp = formatUserFriendlyTime(this.payload.end.when, time_zone)
      console.log(`End timestamp[${time_zone}] ${timestamp}`);
      event_message = event_message.replace("<end_time>", timestamp);
    }
    if (this.payload.stow_type == "ACW_DEBUG") {
      event_message = event_message.replace("<DEBUG_INFO>", JSON.stringify(this.payload.debug_info));
    }
    console.log("event_message:", event_message);

    return event_message;
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

  getSnapAddr(eventMeta) {
    return eventMeta.snap_addr ? eventMeta.snap_addr.reduce(
      (str, c) => str + c.toString(16).padStart(2, "0"),
      ""
    ) : "";
  }

  getAssetName(eventMeta) {
    return eventMeta.name !== null
      ? eventMeta.name
      : eventMeta.device_type !== null
        ? eventMeta.device_type
        : "Asset";
  }

  getTitle(active) {
    return this.getEventTitles(this.payload.stow_type, active);
  }

  isWeatherEvent() {
    return "clear" in this.payload ? this.payload.clear == false : true;
  }

  isWeatherEventCleared() {
    return "clear" in this.payload ? this.payload.clear == true : false;
  }

  isPercentageAlarm() {
    return this.payload.start && this.payload.start.value <= this.payload.start.threshold;
  }

  getIcons(active) {
    const ICONS = {
      'Weather_Forecast-Wind_Gust': {
        active: "mode_wind",
        inactive: "row_stop"
      },
      'Weather_Forecast-Avg_Wind': {
        active: "mode_wind",
        inactive: "row_stop"
      },
      'Weather_Forecast-Deep_Snow': {
        active: "mode_snow",
        inactive: "row_stop"
      },
      'Weather_Forecast_Alert-xyz': {
        active: `${this.payload.alert_type && this.payload.alert_type.search(/snow|ice/i) !== -1 ? "mode_snow" : "mode_wind"}`,
        inactive: "row_stop"
      },
      ACW_DEBUG: {
        active: "cloud_intelligence",
        inactive: "cloud_intelligence"
      }
    };
    return active ? ICONS[this.payload.stow_type].active : ICONS[this.payload.stow_type].inactive;
  }
  getEventNames(type, active) {
    const EVENT_NAMES = {
      'Weather_Forecast-Wind_Gust': {
        active: "Weather_Forecast-Wind_Gust",
        inactive: "Weather_Forecast-Cleared_Wind_Gust"
      },
      'Weather_Forecast-Avg_Wind': {
        active: "Weather_Forecast-Avg_Wind",
        inactive: "Weather_Forecast-Cleared_Avg_Wind"
      },
      'Weather_Forecast-Deep_Snow': {
        active: "Weather_Forecast-Deep_Snow",
        inactive: "Weather_Forecast-Cleared_Deep_Snow"
      },
      'Weather_Forecast_Alert-xyz': {
        active: `Weather_Forecast_Alert-${this.alert_type}`,
        inactive: `Weather_Forecast_Alert-Cleared_${this.alert_type}`
      },
      'Weather_Stow_AccuWeather-Avg_Wind': {
        active: `Weather_Stow_AccuWeather-Avg_Wind`,
        inactive: `Weather_Stow_AccuWeather-Avg_Wind`
      },
      'Weather_Stow_AccuWeather-Wind_Gust': {
        active: `Weather_Stow_AccuWeather-Wind_Gust`,
        inactive: `Weather_Stow_AccuWeather-Avg_Wind`
      },
      'Weather_Forecast_Alert-Severe_Thunderstorm_Warning':{
        active: `Weather_Forecast_Alert-Severe_Thunderstorm_Warning`,
        inactive: `Weather_Forecast_Alert-Cleared_Severe_Thunderstorm_Warning`
      },
      'Weather_Stow_AccuWeather-Deep_Snow': {
        active: `Weather_Stow_AccuWeather-Deep_Snow`,
        inactive: `Weather_Stow_AccuWeather-Deep_Snow`
      },
      'Weather_Stow_AccuWeather-Alert': {
        active: `Weather_Stow_AccuWeather-Alert`,
        inactive: `Weather_Stow_AccuWeather-Alert`
      },
      ACW_DEBUG: {
        active: `ACW_DEBUG`,
        inactive: `ACW_DEBUG`
      }
    };
    return active ? EVENT_NAMES[type].active : EVENT_NAMES[type].inactive;
  }

  getPendingAlertsEventNames(type) {
    const EVENT_NAMES = {
      'Weather_Forecast-Wind_Gust': {
        active: "Weather_Stow_AccuWeather-Wind_Gust"
      },
      'Weather_Forecast-Avg_Wind': {
        active: "Weather_Stow_AccuWeather-Avg_Wind"
      },
      'Weather_Forecast-Deep_Snow': {
        active: "Weather_Stow_AccuWeather-Deep_Snow"
      },
      'Weather_Forecast_Alert-xyz': {
        active: `Weather_Stow_AccuWeather-Alert`
      }
    };
    if (EVENT_NAMES[type] === undefined && type.includes("Weather_Forecast_Alert-")) {
      // let alertType = type.replace("Weather_Forecast_Alert-", "");
      return `Weather_Stow_AccuWeather-Alert`;
    } else {
      return EVENT_NAMES[type].active;
    }

  }
  getEventTitles(type, active) {
    const EVENT_TITLE = {
      'Weather_Forecast-Wind_Gust': {
        active: "Forecasted Weather Warning: High Wind Gust",
        inactive: "Forecasted Weather Warning Cleared: High Wind Gust"
      },
      'Weather_Forecast-Avg_Wind': {
        active: "Forecasted Weather Warning: High Average Wind Speed",
        inactive: "Forecasted Weather Warning Cleared: High Average Wind Speed"
      },
      'Weather_Forecast-Deep_Snow': {
        active: "Forecasted Weather Warning: Deep Snow",
        inactive: "Forecasted Weather Warning Cleared: Deep Snow"
      },
      'Weather_Forecast_Alert-xyz': {
        active: `Forecasted Weather Warning: ${this.alert_type_str}`,
        inactive: `Forecasted Weather Warning Cleared: ${this.alert_type_str}`
      },
      //WEATHER_STOW: {
      //  active: `AccuWeather Weather Stow: ${this.alert_type}`,
      //  inactive: `AccuWeather Weather Stow Cleared`
      //},
      //'Weather_Stow_AccuWeather-Avg_Wind': {
      //  active: `AccuWeather Weather Stow Failed: NC is offline`,
      //  inactive: `AccuWeather Weather Stow Exit Failed: NC is offline`
      //},
      //'Weather_Stow_AccuWeather-Wind_Gust': {
      //  active: `AccuWeather Weather Stow Failed: NC is offline`,
      //  inactive: `AccuWeather Weather Stow Exit Failed: NC is offline`
      //},
      //'Weather_Stow_AccuWeather-Deep_Snow': {
      //  active: `AccuWeather Weather Stow Failed: NC is offline`,
      //  inactive: `AccuWeather Weather Stow Exit Failed: NC is offline`
      //},
      ACW_DEBUG: {
        active: `AccuWeather Debug: ${this.alert_type}`,
        inactive: `AccuWeather Debug`
      }
    };
    return active ? EVENT_TITLE[type].active : EVENT_TITLE[type].inactive;
  }

  getEventMessages(type, active) {
    const timer_msg = ` The system has started the countdown timer to exit AccuWeather Auto Stow. The site will return to tracking in ${this.payload.prj_data.weather_forecast_stow_after_time} minutes as long as the local weather station reports are below the site thresholds.`;
    const EVENT_MSG = {
      'Weather_Forecast-Wind_Gust': {
        active:
          "The AccuWeather forecast is calling for wind gusts which exceed <percent>the wind thresholds for this site from <start_time> through <end_time>. Forecast is predicting wind gusts exceeding <value> mph.",
        inactive:
          `The AccuWeather Alert for High Wind Gust has cleared.${this.payload.prj_data.enable_weather_alert_stow ? timer_msg : ''}`
      },
      'Weather_Forecast-Avg_Wind': {
        active:
          "The AccuWeather forecast is calling for average wind which exceed <percent>the wind thresholds for this site from <start_time> through <end_time>. Forecast is predicting average wind exceeding <value> mph.",
        inactive:
          `The AccuWeather Alert for High Average Wind speed has cleared.${this.payload.prj_data.enable_weather_alert_stow ? timer_msg : ''}`
      },
      'Weather_Forecast-Deep_Snow': {
        active:
          "The AccuWeather forecast is calling for snow depth which exceed <percent>the snow depth thresholds for this site from <start_time> through <end_time>. Forecast is predicting snow depth exceeding <value> inches.",
        inactive:
          `The AccuWeather Alert for Deep Snow has cleared.${this.payload.prj_data.enable_weather_alert_stow ? timer_msg : ''}`
      },
      'Weather_Forecast_Alert-xyz': {
        active: `AccuWeather has issued a ${this.alert_type_str} for your site. The details of the AccuWeather alert are provided below.<br /><span style="color: rgb(0, 0, 0);" class="accu-alert">AccuWeather Alert:</span><br /><Heading>.`,
        inactive: `The AccuWeather Alert for ${this.alert_type_str} has cleared.${this.payload.prj_data.enable_weather_alert_stow ? timer_msg : ''}`
      },
      //WEATHER_STOW: {
      //  // not used here moved to weatherStowService
      //  active: `The site is in AccuWeather Weather Stow due to predicted <category> from AccuWeather Forecast. The site forecast is calling for <type> of <value> from <start_time> through <end_time>. The forecasted <type> of <value> are greater than the site threshold of <threshold>. The site will resume tracking <resume_time> minutes after the forecasted duration as long as local weather stations are reporting values below thresholds.`,
      //  inactive: "AccuWeather Weather Stow is cleared, now system will resume normal State"
      //},
      //'Weather_Stow_AccuWeather-Avg_Wind': {
      //  active: "The site failed to enter AccuWeather Weather Stow for High Average Wind Speed because the Network Controller is Offline.",
      //  inactive: "The site failed to exit AccuWeather Weather Stow for High Average Wind Speed because the Network Controller is Offline."
      //},
      //'Weather_Stow_AccuWeather-Wind_Gust': {
      //  active: "The site failed to enter AccuWeather Weather Stow for High Wind Gust because the Network Controller is Offline.",
      //  inactive: "The site failed to exit AccuWeather Weather Stow for High Wind Gust because the Network Controller is Offline."
      //},
      //'Weather_Stow_AccuWeather-Deep_Snow': {
      //  active: "The site failed to enter AccuWeather Weather Stow for Deep Snow because the Network Controller is Offline.",
      //  inactive: "The site failed to exit AccuWeather Weather Stow for Deep Snow because the Network Controller is Offline."
      //},
      ACW_DEBUG: {
        active: "Debug Info. <DEBUG_INFO>",
        inactive: "Debug Info"
      }
    };
    return active ? EVENT_MSG[type].active : EVENT_MSG[type].inactive;
  }

  async sendNotification(info) {
    info.icon_name = this.getIcons(this.isWeatherEvent()) + "_48x48.png";
    let time_zone = "America/New_York";
    if (info.location_lat !== "" && info.location_lng !== "")
      time_zone = tzlookup(info.location_lat, info.location_lng);

    let timestamp = formatUserFriendlyTime(this.payload.start ? this.payload.start.when : this.payload.timestamp, time_zone)
    info.timestamp = timestamp;
    info.device_type = info.device_type !== null ? info.device_type : "Asset";

    let notificationType = "accuweather_forecast";
    if (this.payload.stow_type.startsWith("Weather_Stow_AccuWeather"))
      notificationType = "accuweather_stow";

    const userAccounts = await notificationSettingService.getAccounts(
      this.client,
      info.site_id,
      notificationType
    );
    info.emailAddrs = userAccounts.emails;
    info.phoneNumbers = userAccounts.phone_nums;

    info.asset_name = this.getAssetName(info);

    if (info.phoneNumbers.length > 0) {
      info.smsText =
        info.site_name + " | " + info.eventTitle + " at " + timestamp;
      await this.sendSMSNotification(info);
    }
    if (info.emailAddrs.length > 0) {
      let status_text = info.title;
      info.status_text = info.device_type + " | " + status_text;
      info.body_text = this.getMessage(
        this.payload.stow_type,
        this.isWeatherEvent(),
        info
      );

      info.msgSubject =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name + " | " + "TerraTrak CloudSense(TM)" + " | " + status_text;
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
      console.error("Error in sendSMSNotification... " + e);
    }
  }
  async sendEmailNotification(info) {
    try {
      let params = {};
      console.log("EMAILADRS: ", info.emailAddrs);
      const emailData = {
        site_name: info.site_name,
        status_text: info.status_text,
        body_text: info.body_text,
        asset_name: info.asset_name,
        timestamp: info.timestamp,
        project_name: info.project_name,
        project_location: info.project_location,
        s3_asset_url: getS3EmailAssetsUrl(),
        icon_url: getS3EmailAssetsUrl() + info.icon_name,
        url: process.env.CLOUDUI_URL + ("/home/projects/" + info.site_id + "/overview"),
        current_time: new Date()
      };
      console.log(emailData);
      const templateHtml = Handlebars.compile(
        utils.emailTempSiteMode.toString()
      );
      const bodyHtml = templateHtml(emailData);
      params.msgSubject = info.msgSubject;
      params.msgbody = bodyHtml;
      // console.log(params);
      info.emailAddrs.forEach(async (data) => {
        params.emailAddrs = [data];
        await aws_integration.sendEmail(params);
      });

      return true;
    } catch (e) {
      console.error("Error in sendEmailNotification... " + e);
    }
  }
}

exports.accuWeatherService = new AccuWeatherService();
