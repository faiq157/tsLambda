const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const { notificationSettingService } = require("../services/notificationSettingService");
const utils = require("../utils");
const { getS3EmailAssetsUrl } = require("../utils/libs/functions");
const { notificationService } = require("../services/common/notificationService");
const { getDeviceTypeNameFromAssetType } = require("../utils/constants");

exports.handleWeatherStowUpdates = async function (client, pgWrite, payload) {
  console.log("Weather Stow Updates ", payload);
  // await pgWrite.connect();
  let assetsInfoByAddr = null;
  if (payload.stow_type === 5) {
    assetsInfoByAddr = await client.query(db.siteInfoByNCAssetId, [ payload.asset_id ]);
  } else {
    assetsInfoByAddr = await client.query(db.siteInfoByAssetId, [ payload.asset_id ]);
  }

  let weatherJson = {};
  if (assetsInfoByAddr.rows.length > 0) {
    let data = assetsInfoByAddr.rows[0];
    weatherJson.device_type = getDeviceTypeNameFromAssetType(data.asset_type);
    weatherJson.network_controller_id = data.network_controller_id;
    weatherJson.network_controller_name = data.network_controller_name;
    weatherJson.network_controller_asset_id = data.network_controller_asset_id;
    weatherJson.is_notify = data.is_notify;
    let assetName =
      payload.asset_name !== null
        ? payload.asset_name
        : this.device_type !== null
          ? this.device_type
          : "ASSET";
    if (weatherJson.device_type === "Row Controller") {
      //get site_layout info
      var siteLayoutInfo = await client.query(
        `
      SELECT site_layout.name,site_layout.i,site_layout.shorthand_name FROM terrasmart.site_layout
      WHERE site_layout.asset_id = $1::UUID
      `,
        [payload.asset_id]
      );
      weatherJson.shorthand_name = null;
      weatherJson.row_id = "";
      weatherJson.row_name = null;
      weatherJson.snap_addr = data.snap_addr;
      if (siteLayoutInfo.rows.length !== 0) {
        weatherJson.shorthand_name = siteLayoutInfo.rows[0].shorthand_name;
        weatherJson.row_id = siteLayoutInfo.rows[0].i;
        weatherJson.row_name = siteLayoutInfo.rows[0].name;
      }
      assetName =
        "Row Box " +
        weatherJson.row_id +
        " (" +
        (weatherJson.row_name !== null ? weatherJson.row_name + " | " : "") +
        (weatherJson.shorthand_name !== null
          ? weatherJson.shorthand_name + " | "
          : "") +
          weatherJson.snap_addr +
        ")";
      payload.asset_name = assetName;
      weatherJson.asset_name = assetName;
    }
  }
  // await assetsInfoByAddr.rows.forEach(async (data) => {

  // });
  console.log(weatherJson);

  //check if clid asset have any active status_bits
  const assetsWithLastStatusBits = await client.query(
    `SELECT asset.id,asset.status_bits,device_type.device_type,asset.name as asset_name FROM terrasmart.asset
  LEFT JOIN terrasmart.device_type on device_type.id = asset.device_type_id
  WHERE parent_network_controller_id = $1::UUID AND status_bits IS NOT NULL AND status_bits != 0`, //AND status_bits != 0;
    [weatherJson.network_controller_id]
  );

  const assetsWithActiveAlerts = await client.query(
    `
        SELECT cloud_alert.*
        FROM terrasmart.cloud_alert
        WHERE 
        cloud_alert.active = true AND (cloud_alert.asset_id in (
                SELECT asset.id as asset_id FROM terrasmart.asset
                INNER JOIN terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
                WHERE network_controller.asset_id = $1 :: UUID 
                )
            OR cloud_alert.asset_id = $1 :: UUID)
            AND event_name != 'NC-COMMANDED-STATE' 
                AND cloud_alert.event_name != 'Weather_Stow_AccuWeather-Wind_Gust'
                AND cloud_alert.event_name != 'Weather_Stow_AccuWeather-Avg_Wind'
                AND cloud_alert.event_name != 'Weather_Stow_AccuWeather-Deep_Snow'
                AND cloud_alert.event_name != 'Weather_Stow_AccuWeather-Alert'
                AND cloud_alert.event_name != 'Weather_Stow_Deep_Snow'
                AND cloud_alert.event_name != 'Weather_Stow_Avg_Wind' 
                AND cloud_alert.event_name != 'Weather_Stow_Wind_Gust' 
                AND cloud_alert.event_name != 'Weather_Stow_Deep_Panel_Snow'
                AND cloud_alert.event_name != 'Weather_Stow_To_Cold_To_Move'
                AND cloud_alert.event_name != 'Weather_Stow_No_Weather_Station'
                AND cloud_alert.event_name != 'Increased_Weather_Reporting_Avg_Wind'
                AND cloud_alert.event_name != 'Increased_Weather_Reporting_Wind_Gust'
                AND cloud_alert.event_name != 'Increased_Weather_Reporting_Deep_Snow'
                AND cloud_alert.event_name != 'Increased_Weather_Reporting_Deep_Panel_Snow'
                AND cloud_alert.event_name != 'ML_ISSUE-POC'
                AND cloud_alert.event_name != 'ML_ISSUE-CURRENT_ANGLE'
                AND cloud_alert.event_name != 'NC-BATTERY_WARNING'
                AND cloud_alert.event_name != 'ASSET-BATTERY_WARNING'
                AND cloud_alert.event_name NOT ILIKE 'Weather_Forecast%'
                AND cloud_alert.event_name != 'VEGETATION-ALERT'
                AND cloud_alert.event_name != 'SNOW_SHEDDING_DELAY'
            ORDER BY cloud_alert.created DESC;
        `,
    [weatherJson.network_controller_asset_id]
  );
  //Get last nc_commanded_state
  const lastTrackingCommandHist = await client.query(
    `
      SELECT tracking_command_hist.*
      FROM terrasmart.tracking_command_hist
      WHERE tracking_command_hist.network_controller_id = $1 :: UUID
      ORDER BY tracking_command_hist.changed_at DESC limit 1
    `,
    [weatherJson.network_controller_id]
  );
  console.log(lastTrackingCommandHist.rows);
  let ncCloudAlertResult = null;
  let ncCloudEventLogResult = null;
  if (lastTrackingCommandHist.rows[0].commanded_state === 2) {
  }
  //check cloud event log
  ncCloudEventLogResult = await client.query(
    `SELECT * FROM terrasmart.cloud_event_log
        WHERE asset_id = $1 :: UUID AND name = $2 :: VARCHAR
        ORDER BY created DESC limit 1`,
    [weatherJson.network_controller_asset_id, "NC-COMMANDED-STATE"]
  );
  //check cloud alert
  ncCloudAlertResult = await client.query(
    `SELECT * FROM terrasmart.cloud_alert
        WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true
        ORDER BY created DESC limit 1`,
    [weatherJson.network_controller_asset_id, "NC-COMMANDED-STATE"]
  );

  const cloudEventLogQuery = `
  WITH cloud_event_log_insert AS (
    INSERT INTO terrasmart.cloud_event_log (name,message,levelno,created,asset_id,type,title,icon)
    VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: INT, $4 :: TIMESTAMP,$5 :: UUID, $6::INT,$7::VARCHAR,$8::VARCHAR)
    RETURNING id AS id
    )
    SELECT id FROM cloud_event_log_insert `;
  const addCloudAlertQuery = `
  WITH cloud_alert_insert AS (
    INSERT INTO terrasmart.cloud_alert(event_name,message,created,asset_id,type,active,title,icon)
    VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: TIMESTAMP,$4 :: UUID, $5 :: INT, $6 :: Boolean,$7::VARCHAR,$8::VARCHAR)
      RETURNING id AS id
  )
  SELECT id FROM cloud_alert_insert`;
  let checkAlert = null;
  let percentage = 0;
  switch (payload.stow_type) {
    case 1:
      //HIGH_WIND_GUST
      //check if nc commanded state is in stow_weather state
      let message =
        "A wind gust of " +
        (utils.roundNumber(payload.stow_value, 2) + "mph was recorded by ") +
        (payload.asset_name + ". The current threshold is ") +
        (utils.roundNumber(payload.stow_threshold) + "mph.");
      let avgcloudAlertId = null;
      let avgcloudEventLogId = null;
      if (ncCloudEventLogResult.rows.length > 0) {
        if (
          ncCloudEventLogResult.rows[0].title.toString().startsWith("Weather")
        ) {
          //Update existing one
          //This scenario never happens never tested
          const updateExistingEventLog = `
            UPDATE terrasmart.cloud_event_log SET title = $1::VARCHAR, message = $2::TEXT, created = $3::TIMESTAMP 
            WHERE id = $4::UUID`;
          await pgWrite.query(updateExistingEventLog, [
            "Weather Stow: High Wind Gust detected by " + payload.asset_name,
            message,
            new Date(payload.timestamp),
            payload.asset_id,
          ]);
        } else {
          //Add cloud event log
          let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
            "Weather_Stow_Wind_Gust",
            message,
            20,
            new Date(payload.timestamp),
            payload.asset_id,
            2,
            "Weather Stow: High Wind Gust detected by " + payload.asset_name,
            "mode_wind",
          ]);
          avgcloudEventLogId = addcloudEventLogResult.rows[0].id;
        }
      } else {
        //Add cloud event log
        let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
          "Weather_Stow_Wind_Gust",
          message,
          20,
          new Date(payload.timestamp),
          payload.asset_id,
          2,
          "Weather Stow: High Wind Gust detected by " + payload.asset_name,
          "mode_wind",
        ]);
        avgcloudEventLogId = addcloudEventLogResult.rows[0].id;
      }

      checkAlert = await client.query(
        `SELECT * FROM terrasmart.cloud_alert
                  WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true
                  ORDER BY created DESC limit 1`,
        [payload.asset_id, "Weather_Stow_Wind_Gust"]
      );
      //Add cloud alert if already not set
      percentage = (payload.stow_value / payload.stow_threshold) * 100;

      if (percentage >= 75) {
        //check if alert is already in place or not
        if (checkAlert.rows.length === 0) {
          let addcloudAlertResult = await pgWrite.query(addCloudAlertQuery, [
            "Weather_Stow_Wind_Gust",
            message,
            new Date(payload.timestamp),
            payload.asset_id,
            2,
            true,
            "Weather Stow: High Wind Gust detected by " + payload.asset_name,
            "mode_wind",
          ]);
          avgcloudAlertId = addcloudAlertResult.rows[0].id;
          var userAccounts = await notificationSettingService.getAccounts(
            client,
            assetsInfoByAddr.rows[0].site_id,
            "ws_stow_wind_gust"
          );
          weatherJson.emailAddrs = userAccounts.emails;
          weatherJson.phoneNumbers = userAccounts.phone_nums;
          let json = {};
          //send Email
          json.timestamp = payload.timestamp;
          json.site_id = assetsInfoByAddr.rows[0].site_id;
          json.site_name = assetsInfoByAddr.rows[0].site_name;
          json.device_type = getDeviceTypeNameFromAssetType(assetsInfoByAddr.rows[0].asset_type);
          json.location_lat = assetsInfoByAddr.rows[0].location_lat;
          json.location_lng = assetsInfoByAddr.rows[0].location_lng;
          json.asset_name = weatherJson.asset_name;
          json.project_name = assetsInfoByAddr.rows[0].project_name;
          json.project_id = assetsInfoByAddr.rows[0].project_id;
          json.project_location = assetsInfoByAddr.rows[0].project_location;
          json.status_text = "Weather Stow: High Wind Gust";
          json.message = message;
          json.icon_name = "mode_wind_48x48.png";
          json.phoneNumbers = weatherJson.phoneNumbers;
          json.emailAddrs = weatherJson.emailAddrs;

          const checkProjectSites = await notificationService.checkProjectSites(client, json.project_id);
          json.multipleSites = checkProjectSites;

          if (weatherJson.is_notify === true)
            await processWeatherStationNotifications(json);
        } else {
          //We can update text with new values
        }
      } else {
        //diable alert
        if (checkAlert.rows.length > 0) {
          //flag it inactive
          console.log("Delete Cloud Alert: ", checkAlert.rows[0].id);
          const detailRemoveRes = await this.pgWrite.query(
            `
          Delete from terrasmart.cloud_alert_detail
          WHERE cloud_alert_detail.cloud_alert_id = $1::UUID`,
            [checkAlert.rows[0].id]
          );
          console.log("DetailRemoveRes ", detailRemoveRes);
          await pgWrite.query(db.removeCloudAlert, [checkAlert.rows[0].id]);
          // await pgWrite.query(db.updateCLoudAlertQuery, [
          //   new Date(),
          //   checkAlert.rows[0].id,
          // ]);
        }
      }
      console.log("Alert id:", avgcloudAlertId);
      console.log("Event Id:", avgcloudEventLogId);
      if (avgcloudAlertId !== null && avgcloudEventLogId !== null) {
        //add alert/event log detail

        await addCloudAlertAndEventLogDetail(
          pgWrite,
          payload,
          avgcloudAlertId,
          avgcloudEventLogId,
          assetsWithActiveAlerts
        );
      }
      break;
    case 2:
      //HIGH_AVG_WIND
      //check if nc commanded state is in stow_weather state
      let messageAvgWind =
        "An average wind speed of " +
        (utils.roundNumber(payload.stow_value, 2) + "mph was recorded by ") +
        (payload.asset_name + ". The current threshold is ") +
        (utils.roundNumber(payload.stow_threshold) + "mph.");
      let gustcloudAlertId = null;
      let gustcloudEventLogId = null;
      if (ncCloudEventLogResult.rows.length > 0) {
        if (
          ncCloudEventLogResult.rows[0].title.toString().startsWith("Weather")
        ) {
          //Update existing one

          const updateExistingEventLog = `
            UPDATE terrasmart.cloud_event_log SET title = $1::VARCHAR, message = $2::TEXT, created = $3::TIMESTAMP 
            WHERE id = $4::UUID`;
          await pgWrite.query(updateExistingEventLog, [
            "Weather Stow: High Average Wind Speed detected by " +
            payload.asset_name,
            messageAvgWind,
            new Date(payload.timestamp),
            payload.asset_id,
          ]);
        } else {
          //Add cloud event log
          let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
            "Weather_Stow_Avg_Wind",
            messageAvgWind,
            20,
            new Date(payload.timestamp),
            payload.asset_id,
            2,
            "Weather Stow: High Average Wind Speed detected by " +
            payload.asset_name,
            "mode_wind",
          ]);
          gustcloudEventLogId = addcloudEventLogResult.rows[0].id;
        }
      } else {
        //Add cloud event log
        let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
          "Weather_Stow_Avg_Wind",
          messageAvgWind,
          20,
          new Date(payload.timestamp),
          payload.asset_id,
          2,
          "Weather Stow: High Average Wind Speed detected by " +
          payload.asset_name,
          "mode_wind",
        ]);
        gustcloudEventLogId = addcloudEventLogResult.rows[0].id;
      }

      checkAlert = await client.query(
        `SELECT * FROM terrasmart.cloud_alert
                  WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true
                  ORDER BY created DESC limit 1`,
        [payload.asset_id, "Weather_Stow_Avg_Wind"]
      );

      //Add cloud alert if already not set
      percentage = (payload.stow_value / payload.stow_threshold) * 100;

      if (percentage >= 75) {
        //check if alert is already in place or not
        if (checkAlert.rows.length === 0) {
          let addcloudAlertResult = await pgWrite.query(addCloudAlertQuery, [
            "Weather_Stow_Avg_Wind",
            messageAvgWind,
            new Date(payload.timestamp),
            payload.asset_id,
            2,
            true,
            "Weather Stow: High Average Wind Speed detected by " +
            payload.asset_name,
            "mode_wind",
          ]);
          gustcloudAlertId = addcloudAlertResult.rows[0].id;
          var userAccounts = await notificationSettingService.getAccounts(
            client,
            assetsInfoByAddr.rows[0].site_id,
            "ws_stow_wind_speed"
          );
          weatherJson.emailAddrs = userAccounts.emails;
          weatherJson.phoneNumbers = userAccounts.phone_nums;
          let json = {};
          //send Email
          json.timestamp = payload.timestamp;
          json.site_id = assetsInfoByAddr.rows[0].site_id;
          json.site_name = assetsInfoByAddr.rows[0].site_name;
          json.device_type = getDeviceTypeNameFromAssetType(assetsInfoByAddr.rows[0].asset_type);
          json.location_lat = assetsInfoByAddr.rows[0].location_lat;
          json.location_lng = assetsInfoByAddr.rows[0].location_lng;
          json.asset_name = assetsInfoByAddr.rows[0].asset_name;
          json.project_name = assetsInfoByAddr.rows[0].project_name;
          json.project_id = assetsInfoByAddr.rows[0].project_id;
          json.project_location = assetsInfoByAddr.rows[0].project_location;
          json.status_text = "Weather Stow: High Average Wind";
          json.message = messageAvgWind;
          json.icon_name = "mode_wind_48x48.png";
          json.phoneNumbers = weatherJson.phoneNumbers;
          json.emailAddrs = weatherJson.emailAddrs;

          if (weatherJson.is_notify === true)
            await processWeatherStationNotifications(json);
        } else {
          //We can update text with new values
        }
      } else {
        //diable alert
        if (checkAlert.rows.length > 0) {
          //flag it inactive
          console.log("Delete Cloud Alert: ", checkAlert.rows[0].id);
          const detailRemoveRes = await this.pgWrite.query(
            `
          Delete from terrasmart.cloud_alert_detail
          WHERE cloud_alert_detail.cloud_alert_id = $1::UUID`,
            [checkAlert.rows[0].id]
          );
          console.log("DetailRemoveRes ", detailRemoveRes);
          await pgWrite.query(db.removeCloudAlert, [checkAlert.rows[0].id]);
          // await pgWrite.query(db.updateCLoudAlertQuery, [
          //   new Date(payload.timestamp),
          //   checkAlert.rows[0].id,
          // ]);
        }
      }
      console.log("Alert id:", gustcloudAlertId);
      console.log("Event Id:", gustcloudEventLogId);
      if (gustcloudAlertId !== null && gustcloudEventLogId !== null) {
        //add alert/event log detail

        await addCloudAlertAndEventLogDetail(
          pgWrite,
          payload,
          gustcloudAlertId,
          gustcloudEventLogId,
          assetsWithActiveAlerts
        );
      }
      break;
    case 3:
      //DEEP_SNOW
      //check if nc commanded state is in stow_weather state
      let messageDeepSnow =
        "A snow depth of " +
        (utils.roundNumber(payload.stow_value, 2) +
          " inches was recorded by ") +
        (payload.asset_name + ". The current threshold is ") +
        (utils.roundNumber(payload.stow_threshold) + " inches.");
      let snowcloudAlertId = null;
      let snowcloudEventLogId = null;
      if (ncCloudEventLogResult.rows.length > 0) {
        if (
          ncCloudEventLogResult.rows[0].title.toString().startsWith("Weather")
        ) {
          //Update existing one

          const updateExistingEventLog = `
            UPDATE terrasmart.cloud_event_log SET title = $1::VARCHAR, message = $2::TEXT, created = $3::TIMESTAMP 
            WHERE id = $4::UUID`;
          await pgWrite.query(updateExistingEventLog, [
            "Weather Stow: Deep snow detected by " + payload.asset_name,
            messageDeepSnow,
            new Date(payload.timestamp),
            payload.asset_id,
          ]);
        } else {
          //Add cloud event log
          let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
            "Weather_Stow_Deep_Snow",
            messageDeepSnow,
            20,
            new Date(payload.timestamp),
            payload.asset_id,
            2,
            "Weather Stow: Deep snow detected by " + payload.asset_name,
            "mode_snow",
          ]);
          snowcloudEventLogId = addcloudEventLogResult.rows[0].id;
        }
      } else {
        //Add cloud event log
        let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
          "Weather_Stow_Deep_Snow",
          messageDeepSnow,
          20,
          new Date(payload.timestamp),
          payload.asset_id,
          2,
          "Weather Stow: Deep snow detected by " + payload.asset_name,
          "mode_snow",
        ]);
        snowcloudEventLogId = addcloudEventLogResult.rows[0].id;
      }

      //alert
      checkAlert = await client.query(
        `SELECT * FROM terrasmart.cloud_alert
                  WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true
                  ORDER BY created DESC limit 1`,
        [payload.asset_id, "Weather_Stow_Deep_Snow"]
      );

      //Add cloud alert if already not set
      // percentage = (payload.stow_value / payload.stow_threshold) * 100;
      console.log("Active: ", checkAlert.rows);
      // if (percentage >= 75) {
      //check if alert is already in place or not
      if (checkAlert.rows.length === 0) {
        let addcloudAlertResult = await pgWrite.query(addCloudAlertQuery, [
          "Weather_Stow_Deep_Snow",
          messageDeepSnow,
          new Date(payload.timestamp),
          payload.asset_id,
          2,
          true,
          "Weather Stow: Deep snow detected by " + payload.asset_name,
          "mode_snow",
        ]);
        snowcloudAlertId = addcloudAlertResult.rows[0].id;
        var userAccounts = await notificationSettingService.getAccounts(
          client,
          assetsInfoByAddr.rows[0].site_id,
          "ws_stow_snow_depth"
        );
        weatherJson.emailAddrs = userAccounts.emails;
        weatherJson.phoneNumbers = userAccounts.phone_nums;
        let json = {};
        //send Email
        json.timestamp = payload.timestamp;
        json.site_id = assetsInfoByAddr.rows[0].site_id;
        json.site_name = assetsInfoByAddr.rows[0].site_name;
        json.device_type = getDeviceTypeNameFromAssetType(assetsInfoByAddr.rows[0].asset_type);
        json.location_lat = assetsInfoByAddr.rows[0].location_lat;
        json.location_lng = assetsInfoByAddr.rows[0].location_lng;
        json.asset_name = assetsInfoByAddr.rows[0].asset_name;
        json.project_name = assetsInfoByAddr.rows[0].project_name;
        json.project_id = assetsInfoByAddr.rows[0].project_id;
        json.project_location = assetsInfoByAddr.rows[0].project_location;
        json.status_text = "Weather Stow: Deep Snow";
        json.message = messageDeepSnow;
        json.icon_name = "mode_snow_48x48.png";
        json.phoneNumbers = weatherJson.phoneNumbers;
        json.emailAddrs = weatherJson.emailAddrs;
        if (weatherJson.is_notify === true)
          await processWeatherStationNotifications(json);
      } else {
        //We can update text with new values
      }
      // } else {
      //   //diable alert
      //   if (checkAlert.rows.length > 0) {
      //     //flag it inactive
      //     await client.query(db.updateCLoudAlertQuery, [
      //       new Date(payload.timestamp),
      //       checkAlert.rows[0].id
      //     ]);
      //   }
      // }
      console.log("Alert id:", snowcloudAlertId);
      console.log("Event Id:", snowcloudEventLogId);
      if (snowcloudAlertId !== null && snowcloudEventLogId !== null) {
        //add alert/event log detail

        await addCloudAlertAndEventLogDetail(
          pgWrite,
          payload,
          snowcloudAlertId,
          snowcloudEventLogId,
          assetsWithActiveAlerts
        );
      }
      break;
    case 4:
      //DEEP_PANEL_SNOW
      //check if nc commanded state is in stow_weather state
      let messageDeepPanelSnow =
        "A panel snow depth of " +
        (utils.roundNumber(payload.stow_value, 2) +
          " inches was recorded by ") +
        (payload.asset_name + ".  The current threshold is ") +
        (utils.roundNumber(payload.stow_threshold) + " inches.");
      let panelcloudAlertId = null;
      let panelcloudEventLogId = null;
      if (ncCloudEventLogResult.rows.length > 0) {
        if (
          ncCloudEventLogResult.rows[0].title.toString().startsWith("Weather")
        ) {
          //Update existing one

          const updateExistingEventLog = `
            UPDATE terrasmart.cloud_event_log SET title = $1::VARCHAR, message = $2::TEXT, created = $3::TIMESTAMP 
            WHERE id = $4::UUID`;
          await pgWrite.query(updateExistingEventLog, [
            "Weather Stow: Deep Panel Snow is detected by " +
            payload.asset_name,
            messageDeepPanelSnow,
            new Date(payload.timestamp),
            payload.asset_id,
          ]);
        } else {
          //Add cloud event log
          let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
            "Weather_Stow_Deep_Panel_Snow",
            messageDeepPanelSnow,
            20,
            new Date(payload.timestamp),
            payload.asset_id,
            2,
            "Weather Stow: Deep Panel Snow is detected by " +
            payload.asset_name,
            "mode_snow",
          ]);
          panelcloudEventLogId = addcloudEventLogResult.rows[0].id;
        }
      } else {
        //Add cloud event log
        let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
          "Weather_Stow_Deep_Panel_Snow",
          messageDeepPanelSnow,
          20,
          new Date(payload.timestamp),
          payload.asset_id,
          2,
          "Weather Stow: Deep Panel Snow is detected by " + payload.asset_name,
          "mode_snow",
        ]);
        panelcloudEventLogId = addcloudEventLogResult.rows[0].id;
      }

      //alert
      checkAlert = await client.query(
        `SELECT * FROM terrasmart.cloud_alert
                  WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true
                  ORDER BY created DESC limit 1`,
        [payload.asset_id, "Weather_Stow_Deep_Panel_Snow"]
      );

      //Add cloud alert if already not set
      percentage = (payload.stow_value / payload.stow_threshold) * 100;

      if (percentage >= 75) {
        //check if alert is already in place or not
        if (checkAlert.rows.length === 0) {
          let addcloudAlertResult = await pgWrite.query(addCloudAlertQuery, [
            "Weather_Stow_Deep_Panel_Snow",
            messageDeepPanelSnow,
            new Date(payload.timestamp),
            payload.asset_id,
            2,
            true,
            "Weather Stow: Deep Panel Snow is detected by " +
            payload.asset_name,
            "mode_snow",
          ]);
          panelcloudAlertId = addcloudAlertResult.rows[0].id;
          var userAccounts = await notificationSettingService.getAccounts(
            client,
            assetsInfoByAddr.rows[0].site_id,
            "ws_stow_panel_snow_depth"
          );
          weatherJson.emailAddrs = userAccounts.emails;
          weatherJson.phoneNumbers = userAccounts.phone_nums;
          let json = {};
          //send Email
          json.timestamp = payload.timestamp;
          json.site_id = assetsInfoByAddr.rows[0].site_id;
          json.site_name = assetsInfoByAddr.rows[0].site_name;
          json.device_type = getDeviceTypeNameFromAssetType(assetsInfoByAddr.rows[0].asset_type);
          json.location_lat = assetsInfoByAddr.rows[0].location_lat;
          json.location_lng = assetsInfoByAddr.rows[0].location_lng;
          json.asset_name = assetsInfoByAddr.rows[0].asset_name;
          json.project_name = assetsInfoByAddr.rows[0].project_name;
          json.project_id = assetsInfoByAddr.rows[0].project_id;
          json.project_location = assetsInfoByAddr.rows[0].project_location;
          json.status_text = "Weather Stow Due To Deep Panel Snow";
          json.message = messageDeepPanelSnow;
          json.icon_name = "mode_snow_48x48.png";
          json.phoneNumbers = weatherJson.phoneNumbers;
          json.emailAddrs = weatherJson.emailAddrs;
          if (weatherJson.is_notify === true)
            await processWeatherStationNotifications(json);
        } else {
          //We can update text with new values
        }
      } else {
        //diable alert
        if (checkAlert.rows.length > 0) {
          //flag it inactive
          console.log("Delete Cloud Alert: ", checkAlert.rows[0].id);
          const detailRemoveRes = await this.pgWrite.query(
            `
          Delete from terrasmart.cloud_alert_detail
          WHERE cloud_alert_detail.cloud_alert_id = $1::UUID`,
            [checkAlert.rows[0].id]
          );
          console.log("DetailRemoveRes ", detailRemoveRes);
          await pgWrite.query(db.removeCloudAlert, [checkAlert.rows[0].id]);
          // await client.query(db.updateCLoudAlertQuery, [
          //   new Date(payload.timestamp),
          //   checkAlert.rows[0].id,
          // ]);
        }
      }
      console.log("Alert id:", panelcloudAlertId);
      console.log("Event Id:", panelcloudEventLogId);
      if (panelcloudAlertId !== null && panelcloudEventLogId !== null) {
        //add alert/event log detail

        await addCloudAlertAndEventLogDetail(
          pgWrite,
          payload,
          panelcloudAlertId,
          panelcloudEventLogId,
          assetsWithActiveAlerts
        );
      }
      break;
    case 5:
      //No Weather Station Stow
      //check if nc commanded state is in stow_weather state
      let messageNoWeatherStation =
        "The system is configured to require weather station connectivity.  The number of connected weather stations is less than the configured threshold, so the site has entered a weather stow mode.  It will remain in weather stow until the number of connected weather stations exceeds the configuration threshold";
      let wscloudAlertId = null;
      let wscloudEventLogId = null;
      if (ncCloudEventLogResult.rows.length > 0) {
        if (
          ncCloudEventLogResult.rows[0].title.toString().startsWith("Weather")
        ) {
          //Update existing one

          const updateExistingEventLog = `
            UPDATE terrasmart.cloud_event_log SET title = $1::VARCHAR, message = $2::TEXT, created = $3::TIMESTAMP 
            WHERE id = $4::UUID`;
          await pgWrite.query(updateExistingEventLog, [
            "Weather Stow due to Weather Station Connectivity",
            messageNoWeatherStation,
            new Date(payload.timestamp),
            payload.asset_id,
          ]);
        } else {
          //Add cloud event log
          let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
            "Weather_Stow_No_Weather_Station",
            messageNoWeatherStation,
            20,
            new Date(payload.timestamp),
            payload.asset_id,
            2,
            "Weather Stow due to Weather Station Connectivity",
            "weather_none",
          ]);
          wscloudEventLogId = addcloudEventLogResult.rows[0].id;
        }
      } else {
        //Add cloud event log
        let addcloudEventLogResult = await pgWrite.query(cloudEventLogQuery, [
          "Weather_Stow_No_Weather_Station",
          messageNoWeatherStation,
          20,
          new Date(payload.timestamp),
          payload.asset_id,
          2,
          "Weather Stow due to Weather Station Connectivity",
          "weather_none",
        ]);
        wscloudEventLogId = addcloudEventLogResult.rows[0].id;
      }

      //alert
      checkAlert = await client.query(
        `SELECT * FROM terrasmart.cloud_alert
                  WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true
                  ORDER BY created DESC limit 1`,
        [payload.asset_id, "Weather_Stow_No_Weather_Station"]
      );

      //check if alert is already in place or not
      if (checkAlert.rows.length === 0) {
        let addcloudAlertResult = await pgWrite.query(addCloudAlertQuery, [
          "Weather_Stow_No_Weather_Station",
          messageNoWeatherStation,
          new Date(payload.timestamp),
          payload.asset_id,
          2,
          true,
          "Weather Stow due to Weather Station Connectivity",
          "weather_none",
        ]);
        wscloudAlertId = addcloudAlertResult.rows[0].id;
        var userAccounts = await notificationSettingService.getAccounts(
          client,
          assetsInfoByAddr.rows[0].site_id,
          "ws_stow_no_ws"
        );
        weatherJson.emailAddrs = userAccounts.emails;
        weatherJson.phoneNumbers = userAccounts.phone_nums;
        let json = {};
        //send Email
        json.timestamp = payload.timestamp;
        json.site_id = assetsInfoByAddr.rows[0].site_id;
        json.site_name = assetsInfoByAddr.rows[0].site_name;
        json.device_type = getDeviceTypeNameFromAssetType(assetsInfoByAddr.rows[0].asset_type);
        json.location_lat = assetsInfoByAddr.rows[0].location_lat;
        json.location_lng = assetsInfoByAddr.rows[0].location_lng;
        json.asset_name = assetsInfoByAddr.rows[0].asset_name;
        json.project_name = assetsInfoByAddr.rows[0].project_name;
        json.project_id = assetsInfoByAddr.rows[0].project_id;
        json.project_location = assetsInfoByAddr.rows[0].project_location;
        json.status_text = "Weather Stow due to Weather Station Connectivity";
        json.message = messageNoWeatherStation;
        json.icon_name = "weather_none_48x48.png";
        json.phoneNumbers = weatherJson.phoneNumbers;
        json.emailAddrs = weatherJson.emailAddrs;
        if (weatherJson.is_notify === true)
          await processWeatherStationNotifications(json);
      } else {
        //We can update text with new values
      }

      console.log("Alert id:", wscloudAlertId);
      console.log("Event Id:", wscloudEventLogId);
      if (wscloudAlertId !== null && wscloudEventLogId !== null) {
        //add alert/event log detail

        await addCloudAlertAndEventLogDetail(
          pgWrite,
          payload,
          wscloudAlertId,
          wscloudEventLogId,
          assetsWithActiveAlerts
        );
      }
      break;
    default:
      console.log("Stow type not matched");
  }
};


const processWeatherStationNotifications = async function (payload, callback) {
  console.log("Process Weather Station Notification: ", payload);
  try {
    if (payload) {
      let params = {};

      let time_zone = "America/New_York";
      if (payload.location_lat !== "" && payload.location_lng !== "")
        time_zone = tzlookup(payload.location_lat, payload.location_lng);

      let timestamp = moment
        .tz(payload.timestamp, time_zone)
        .format("MM/DD/YYYY hh:mmA ");
      console.log("TIME: ", timestamp);
      let asset_name =
        payload.asset_name !== null ? payload.asset_name : "Asset";
      console.log(asset_name);
      console.log("PHONENUMS ", payload.phoneNumbers);
      payload.phoneNumbers.forEach(async (data) => {
        params = {};
        params.phoneNumber = data;
        params.msgText =
          (payload.multipleSites ? payload.project_name + " | " : "") +
          payload.site_name +
          ("\n" + payload.status_text) +
          ("\n" + timestamp + ": ") +
          payload.message;
        console.log(params);
        aws_integration.sendSMS(params);
      });
      if (payload.emailAddrs.length > 0) {

        console.log("EMAILADDRS ", payload.emailAddrs);
        var emailData = {
          is_multiSites: payload.multipleSites,
          site_name: payload.site_name,
          status_text: (payload.device_type !== null ? payload.device_type : "Asset") + " | " + payload.status_text,
          msg: payload.message,
          asset_name: asset_name,
          timestamp: timestamp,
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
        var templateHtml = Handlebars.compile(
          utils.emailTempWeatherNotifications.toString()
        );
        var bodyHtml = templateHtml(emailData);
        // params.emailAddrs = payload.emailAddrs;
        params.msgbody = bodyHtml;
        params.msgSubject =
          (payload.multipleSites ? payload.project_name + " | " : "") +
          payload.site_name +
          " | " +
          (payload.device_type !== null ? payload.device_type : "Asset ") +
          (" - " + payload.status_text);
        // console.log(params);
        payload.emailAddrs.forEach(async (data) => {
          params.emailAddrs = [data];
          await aws_integration.sendEmail(params);
        });
        //   }
        // );
      }
    } else {
      console.log("NO Notif");
    }

    return callback(result.rows, null);
  } catch (e) {
    //console.error("Application ERROR:", e);
  } finally {
    console.log("releasing client");
  }
};

async function addCloudAlertAndEventLogDetail(
  pgWrite,
  payload,
  cloudAlertId,
  cloudEventLogId,
  assetsWithActiveAlerts
) {
  let query =
    "INSERT INTO terrasmart.cloud_event_log_detail (name, title, message, levelno, created, type, cloud_event_log_id, asset_id) VALUES";
  let cloudAlertQuery =
    "INSERT INTO terrasmart.cloud_alert_detail (event_name, title, message, levelno, created, type, active, cloud_alert_id, asset_id) VALUES";

  let isAnyStatusBits = false;
  assetsWithActiveAlerts.rows.forEach(async (data) => {
    isAnyStatusBits = true;

    const levelNo = ['ASSET-MOTOR-CURRENT-HW-FAULT', 'ASSET-MOTOR-CURRENT_SW_FAULT', 'ASSET-MOTOR-FAULT-TIMEOUT'].includes(data.event_name) ? 30 : 20;
    const msg = data.message ? `'${data.message}'` : null;

    query += `('${data.event_name}', '${data.title}', ${msg}, ${levelNo}, $1 :: TIMESTAMP, 2, '${cloudEventLogId}', '${data.asset_id}'), `;

    if (cloudAlertId) {
      cloudAlertQuery += `('${data.event_name}', '${data.title}', ${msg}, ${levelNo}, $1 :: TIMESTAMP, 2, true, '${cloudAlertId}', '${data.asset_id}' ), `;
    }
  });

  if (isAnyStatusBits) {
    query = query.slice(0, -2);
    // console.log(`LOGQUERY:  ${query}`);

    let inf = await pgWrite.query(query, [payload.timestamp]);
    console.log(`LOGQUERYRES:  ${inf}`);

    if (cloudAlertId) {
      cloudAlertQuery = cloudAlertQuery.slice(0, -2);
      // console.log(`ALERTQUERY: ${cloudAlertQuery}`);

      let inf1 = await pgWrite.query(cloudAlertQuery, [payload.timestamp]);
      console.log(`ALERTQUERYRES:  ${inf1}`);
    }
  }
}

const EVENT_NAME = {
  1: "NO-CONNECTION_WITH_NC",
  2: "MOTOR-CURRENT-HW-FAULT",
  4: "MOTOR-FAULT-TIMEOUT",
  8: "CHARGER_FAULT",
  16: "MOTOR-CURRENT_SW_FAULT",
  32: "LOW-BATTERY_STOW",
  64: "LOW_TEMP_RESTRICTED_MOVEMENT",
  128: "ESTOP-Engaged",
};

const EVENT_MSG = {
  1: "Cannot communicate with Network Controller",
  2: "Motor Current Fault Detected (HW)",
  4: "Motor Fault Detected (Timeout)",
  8: "Charger Fault",
  16: "Motor Current Fault Detected (SW)",
  32: "Low Battery Auto Stow",
  64: "Low Temperature Restricted Movement",
  128: "Emergency Stop Button Engaged",
};

const statusBits = (status) => {
  let arr = [];
  [1, 2, 4, 8, 16, 32, 64, 128].forEach((item) => {
    if ((item & status) === item) {
      arr = [...arr, item]; //[...arr, BITS_STATUS[item & status]];
    }
  });
  return arr;
};
