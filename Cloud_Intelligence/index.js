const { Client, types } = require("pg");
const { pgConfig, pgMasterConfig } = require("./pg");
const utils = require("./utils");
const helper = require("./Helper");
const battery_hist = require("./modules/battery_hist");
const nCConhist = require("./modules/network_controller_con_hist");
const assetStatusBits = require("./modules/asset_status_bits");
const ncRebootEvent = require("./modules/network_controller_reboot");
const { weatherStowService } = require("./services/weatherStowService");
const ncSleepEvent = require("./modules/network_controller_sleep_event");
const { weatherAlarmService } = require("./services/weatherAlarmService");
const { ncCommandedStateService } = require("./services/ncCommandedStateService");
const { weatherHistService } = require("./services/weatherHistService");
const { assetConnectionHistService } = require("./services/assetConnectionStatusService");
const { assetHelperService } = require("./services/common/assetHelperService");
const { anomalyDetectionService } = require("./services/anomalyDetectionService");
const { assetWrongReportingService } = require("./services/assetWrongReportingService");
const { accuWeatherService } = require("./services/accuWeatherService");
const { mlNotificationService } = require("./services/mlNotificationService");
const { commandStatusService } = require("./services/commandStatusService");
const { assetPresetService } = require("./services/assetPresetService");
const { weatherReportingService } = require("./services/weatherReportingService");
const { vegetationAlertService } = require("./services/vegetationAlertService");
const { remoteQCReportService } = require("./services/qcReportUpdateService");
const { increaseWeatherReportingService } = require("./services/IncreaseWeatherReportingService");
const { snowSheddingReportService } = require("./services/snowSheddingReportService");
const { snowSheddingService } = require("./services/snowSheddingService");

// Make sure when converting Postgres timestamp it is UTC
const TIMESTAMP_OID = 1114;
const parseFn = val =>
  val === null ? null : new Date(Date.parse(`${val}+0000`));

types.setTypeParser(TIMESTAMP_OID, parseFn);

const checkActiveAsset = async (client, payload) => {
  const asset_id = payload.asset_id || null;
  if (asset_id === null) {
    return true;
  }
  return assetHelperService.checkIsActive(client, asset_id);
};

const processElasticSearchData = async (payload) => {
  // const client = new Client(pgConfig);
  // const pgWrite = new Client(pgMasterConfig);

  try {
    // await client.connect();
    // await pgWrite.connect();

    switch (payload.channel) {
      case "battery_hist":
        console.log("Battery History:", payload);
        // if (await checkActiveAsset(client, payload)) {
          await battery_hist.handleBatteryHist(payload);
        // }
        break;
      case "command_status_update":
        console.log("Command Status Update:", payload);
        if (await checkActiveAsset(client, payload)) {
          await commandStatusService.handler(client, pgWrite, payload);
        }
        break;
      case "tracking_command_hist":
        console.log("Tracking Command Hist:", payload);
        await ncCommandedStateService.handler(client, pgWrite, payload);
        if (payload.commanded_state === 5) {
          //send night time stow event to anomaly detection queue
          await ncCommandedStateService.handleAnomalyDetectionNightTimeStowEvent(client, payload);
        }
        break;
      case "weather_reporting_hist":
        console.log("Weather Reporting Hist:", payload);
        if (await checkActiveAsset(client, payload)) {
          await weatherReportingService.handler(client, pgWrite, payload);
        }
        break;
      case "weather_hist":
        console.log("Weather Station:", payload);
        if (await checkActiveAsset(client, payload)) {
          await weatherHistService.handler(client, pgWrite, payload);
          await weatherAlarmService.handler(client, pgWrite, payload);
        }
        break;
      case "network_controller_connection_hist":
        await nCConhist.handleNCHist(client, payload);
        break;
      case "asset_connection_hist":
        //Send raw data to ES
        //Update the timestamp to last reported to match database fix
        if (await checkActiveAsset(client, payload)) {
          const fw_res = await helper.getFirmwareVersion(client, payload);
          //additional check added if request is from NC then do not process
          if (fw_res.nc_asset_id !== null && fw_res.nc_asset_id === payload.asset_id) {
            console.log("Discarding NC update in assetConnectionStatus");
          } else {
            await assetConnectionHistService.handler(client, pgWrite, payload);
          }
        }
        break;
      case "asset_status_bits_update":
        if (await checkActiveAsset(client, payload)) {
          await assetStatusBits.handleAssetStatusBits(client, pgWrite, payload);
        }
        break;
      case "network_controller_sleep_event":
        //add event log
        await ncSleepEvent.handleUpdate(pgWrite, payload);
        break;
      case "weather_stow_updates":
        if (await checkActiveAsset(client, payload)) {
          await weatherStowService.handler(payload);
        }
        break;
      case "network_controller_reboot_event":
        await ncRebootEvent.handleNCRebootUpdate(client, pgWrite, payload);
        console.log("END network_controller_reboot_event");
        break;
      case "local_weather_hourly_alarms":
      case "local_weather_alerts_alarms":
      case "local_weather_stow_alarms":
      case "local_weather_nc_online":
      //case "local_weather_nc_reboot":   // locally processed
      case "local_weather_nc_stow_update":
        await accuWeatherService.handler(client, pgWrite, payload);
        break;
      case "anomaly_detection":
        if (await checkActiveAsset(client, payload)) {
          await anomalyDetectionService.handler(client, pgWrite, payload);
        }
        break;
      case "asset_wrong_reporting":
        if (await checkActiveAsset(client, payload)) {
          await assetWrongReportingService.handler(client, pgWrite, payload);
        }
        break;
      case "vegetation_update":
        await vegetationAlertService.handler(payload);
        break;
      case "machine_learning":
        if (await checkActiveAsset(client, payload)) {
          await mlNotificationService.handler(client, pgWrite, payload);
        }
        break;
      case "asset_preset_update":
        console.log("Processing asset_preset_update with payload..!", payload);
        if (await checkActiveAsset(client, payload)) {
          await assetPresetService.handler(client, pgWrite, payload);
        }
        break;
      case "qc_update":
        await remoteQCReportService.handler(client, pgWrite, payload);
        break;
      case "snow_shedding_report":
        await snowSheddingReportService.handler(payload);
        break;
      case "snow_shedding":
        await snowSheddingService.handler(payload);
        break;
      case "increase_weather_reporting_update":
        await increaseWeatherReportingService.handler(client, pgWrite, payload);
        break;
      default:
        console.log(payload.channel, "No case handled for the channel");
    }
    return true;
  } catch (e) {
    console.log("Error: " + e.message);
  } finally {
    // await client.end();
    // await pgWrite.end();
    console.log("Connections closed.");
  }
};

exports.handler = async function (event, context) {
  console.log("Event: ", event);
  if (event.Records.length > 1) console.log("MSGLENGTH ", event.Records.length);
  const message = event.Records[0];

  try {
    console.log("Message received from SNS:", message.Sns.Message);
    const jsonData = JSON.parse(message.Sns.Message);
    if (jsonData.type === "elastic_search-1") {
      await processElasticSearchData(jsonData);
    } else if (jsonData.type === "email" || jsonData.type === "email1") {
      console.error("ERROR: Code here is removed. If this error occurs, it shows that this else-if is still in use. Can trace removed code via this commit.");
    }
    return true;
  } catch (e) {
    console.log("Handler Error: " + e.message);
  }
};
