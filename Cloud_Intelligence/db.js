exports.projectUsers = `
SELECT 
    users.last_login,
    users.email_addr,
    users.sms_num,
    r.level,
    up.*,
    upn.notification_settings,
    upn.notification_schedules AS notification_schedules,
    project.sms_notify AS site_sms,
    project.email_notify AS site_email,
    project.is_in_construction,
    users.super,
    users.timezone AS user_timezone,
    users.notification_status_email AS user_notification_status_email,
    users.notification_status_sms AS user_notification_status_sms
FROM terrasmart.users
    INNER JOIN terrasmart.projects_users up ON up.user_id = users.user_id
    INNER JOIN terrasmart.roles r ON r.id = up.role_id
    INNER JOIN terrasmart.user_project_notifications upn ON upn.user_id = up.user_id AND upn.project_id = up.project_id
    INNER JOIN terrasmart.project ON project.id = up.project_id
WHERE 
    up.project_id = $1::UUID 
    AND users.last_login IS NOT NULL;
`;
exports.projectSuperUsers = `
SELECT 
    users.last_login,
    users.email_addr,
    users.sms_num,
    r.level,
    pu.*,
    upn.notification_settings,
    upn.notification_schedules AS notification_schedules,
    project.sms_notify AS site_sms,
    project.email_notify AS site_email,
    project.is_in_construction,
    users.super,
    users.timezone AS user_timezone,
    users.notification_status_email AS user_notification_status_email,
    users.notification_status_sms AS user_notification_status_sms
FROM terrasmart.users
    INNER JOIN terrasmart.projects_users pu ON pu.user_id = users.user_id
    INNER JOIN terrasmart.roles r ON r.id = pu.role_id
    INNER JOIN terrasmart.user_project_notifications upn ON upn.user_id = pu.user_id AND upn.project_id = pu.project_id
    INNER JOIN terrasmart.project ON project.id = pu.project_id
WHERE 
    pu.project_id = $1::UUID 
    AND users.last_login IS NOT NULL 
    AND r.level IN (1, 2);
`;

exports.siteLayoutInfo = `
  SELECT 
    site_layout.name,
    site_layout.i,
    site_layout.shorthand_name 
  FROM 
    terrasmart.site_layout
  WHERE 
    site_layout.asset_id = $1::UUID;
`;

exports.siteInfoById = `
SELECT * FROM terrasmart.site WHERE id = $1::UUID;
`;
exports.assetinfo = `
SELECT 
asset.id as "asset_id",
device_type.device_type as device_type,
asset.name as name,
asset.parent_network_controller_id as network_controller_id,
asset.repeater_only,
asset.snap_addr as snap_addr,
site_layout.i as row_id,
site_layout.name as row_name,
site_layout.shorthand_name as shorthand_name
FROM terrasmart.asset
  inner join terrasmart.radio on radio.asset_id = asset.id
  inner join terrasmart.device_type on asset.device_type_id = terrasmart.device_type.id 
  left join terrasmart.site_layout on asset.id = site_layout.asset_id
  WHERE asset.id = $1 :: UUID
`;
exports.assetinfoForWSReporting = `
SELECT
asset.id as "asset_id",
device_type.device_type as device_type,
asset.name as name,
asset.parent_network_controller_id as network_controller_id,
radio.snap_addr as snap_addr,
site_layout.i as row_id,
site_layout.name as row_name,
site_layout.shorthand_name as shorthand_name,
network_controller.asset_id as network_controller_asset_id
FROM terrasmart.asset
  left join terrasmart.radio on radio.asset_id = asset.id
  left join terrasmart.device_type on asset.device_type_id = terrasmart.device_type.id
  left join terrasmart.site_layout on asset.id = site_layout.asset_id
  left join terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
WHERE asset.id = $1 :: UUID
`;
exports.assetinfoForWSReportingBySnapAddr = `
SELECT
asset.id as "asset_id",
device_type.device_type as device_type,
asset.name as name,
asset.parent_network_controller_id as network_controller_id,
radio.snap_addr as snap_addr,
site_layout.i as row_id,
site_layout.name as row_name,
site_layout.shorthand_name as shorthand_name,
network_controller.asset_id as network_controller_asset_id
FROM terrasmart.asset
  inner join terrasmart.radio on radio.asset_id = asset.id
  inner join terrasmart.device_type on asset.device_type_id = terrasmart.device_type.id
  left join terrasmart.site_layout on asset.id = site_layout.asset_id
  inner join terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
WHERE asset.snap_addr = $1 :: VARCHAR
`;
exports.siteInfoWS = `SELECT
  asset.site_id,
  project.is_notify,
  site_conf.name AS site_name,
  project.name AS project_name,
  project.address as project_location,
  project.location_lat,
  project.location_lng
FROM terrasmart.asset
         INNER JOIN terrasmart.site on site.id = asset.site_id
         INNER JOIN terrasmart.project ON site.project_id = project.id
         INNER JOIN terrasmart.site_conf on site_conf.site_id = asset.site_id
WHERE asset.id = (SELECT network_controller.asset_id
            FROM terrasmart.asset
                     INNER JOIN terrasmart.network_controller
                                on asset.parent_network_controller_id = network_controller.id
            WHERE asset.id = $1 :: uuid)`;
exports.assetByBatteryId = `
SELECT 
a.id as "asset_id",
device_type.device_type as device_type
FROM terrasmart.charger_battery
  inner join terrasmart.charger as c ON terrasmart.charger_battery.charger_id = c.id 
  inner join terrasmart.asset as a on c.asset_id = a.id  
  inner join terrasmart.device_type on a.device_type_id = terrasmart.device_type.id 
WHERE charger_battery.battery_id = $1 :: UUID
`;
exports.assetByRackId = `
SELECT 
a.id as "asset_id",
device_type.device_type as device_type
FROM terrasmart.rack
 inner join terrasmart.row_controller on terrasmart.rack.row_controller_id = terrasmart.row_controller.id 
 inner join terrasmart.asset as a on terrasmart.row_controller.asset_id = a.id 
 inner join terrasmart.device_type on a.device_type_id = terrasmart.device_type.id 
WHERE rack.id = $1 :: UUID
`;

exports.getWeatherByAssetId = `
SELECT * FROM terrasmart.weather
WHERE weather.asset_id = $1 :: UUID
`;

exports.assetByWeatherId = `
SELECT 
a.id as "asset_id",
device_type.device_type as device_type
FROM terrasmart.weather
 inner join terrasmart.asset as a on terrasmart.weather.asset_id = a.id 
 inner join terrasmart.device_type on a.device_type_id = terrasmart.device_type.id  
WHERE weather.id = $1 :: UUID
`;

exports.metaInfoByAssetId = `
SELECT 
site_conf.site_id as "site_id",
site_conf.name as site_name,
project.location_lat,
project.location_lng,
project.is_notify,
project.name as project_name,
project.id as project_id,
project.address as project_location,
ch_asset.id as "asset_id",
ch_asset.repeater_only,
ch_asset.device_type_id,
ch_asset.name as name,
ch_asset.parent_network_controller_id as network_controller_id,
ch_asset.snap_addr
FROM terrasmart.asset as ch_asset
  LEFT JOIN terrasmart.network_controller on network_controller.id = ch_asset.parent_network_controller_id
  LEFT JOIN terrasmart.site_conf on ch_asset.site_id = site_conf.site_id
  LEFT JOIN terrasmart.site on site.id = site_conf.site_id
  LEFT JOIN terrasmart.project on project.id = site.project_id
WHERE ch_asset.id = $1 :: UUID
`;
exports.metaInfoByNCAssetId = `
SELECT
asset.site_id as "site_id",
site_conf.name as site_name,
asset.id as "asset_id",
asset.repeater_only,
asset.device_type_id,
network_controller.name as name,
asset.snap_addr,
project.address as project_location,
project.name as project_name,
project.id as project_id,
project.location_lat,
project.location_lng,
project.is_notify
FROM terrasmart.asset
  LEFT JOIN terrasmart.network_controller on network_controller.asset_id = asset.id
  LEFT JOIN terrasmart.site_conf on site_conf.site_id = asset.site_id
  LEFT JOIN terrasmart.site on site.id = site_conf.site_id
  LEFT JOIN terrasmart.project on project.id = site.project_id
WHERE asset.id = $1 :: UUID
`;

exports.metaInfoBySiteId = `
SELECT
asset.asset_type,
site_conf.site_id as "site_id",
site_conf.name as site_name,
site_conf.enable_nightly_shutdown,
asset.id as "asset_id",
asset.device_type_id,
network_controller.name as name,
asset.snap_addr,
project.address as project_location,
project.name as project_name,
project.id as project_id,
project.location_lat,
project.location_lng,
project.is_notify,
network_controller.commanded_state,
network_controller.last_sleep_mode_update,
network_controller.last_sleep_mode_update + CAST(network_controller.wake_up_time as FLOAT8) * INTERVAL '1 second' as wakeup_time
FROM terrasmart.site_conf
  INNER JOIN terrasmart.asset on asset.site_id = site_conf.site_id
  LEFT JOIN terrasmart.network_controller on network_controller.asset_id = asset.id
  LEFT JOIN terrasmart.site on site.id = site_conf.site_id
  LEFT JOIN terrasmart.project on project.id = site.project_id
WHERE site_conf.site_id = $1 :: UUID
`;

exports.metaInfoByNCId = `
SELECT
site_conf.site_id as "site_id",
site_conf.name as site_name,
site_conf.enable_nightly_shutdown,
project.location_lat,
project.location_lng,
project.is_notify,
project.name as project_name,
project.id as project_id,
project.address as project_location,
asset.id as "asset_id",
asset.device_type_id,
network_controller.name as name,
asset.snap_addr,
network_controller.commanded_state,
network_controller.last_sleep_mode_update,
network_controller.last_sleep_mode_update + CAST(network_controller.wake_up_time as FLOAT8) * INTERVAL '1 second' as wakeup_time
FROM terrasmart.site_conf
  INNER JOIN terrasmart.asset on asset.site_id = site_conf.site_id
  LEFT JOIN terrasmart.network_controller on network_controller.asset_id = asset.id
  LEFT JOIN terrasmart.site on site.id = site_conf.site_id
  LEFT JOIN terrasmart.project on project.id = site.project_id
WHERE network_controller.id = $1 :: UUID
`;

exports.siteInfoByAssetId = `
  SELECT
  site_conf.site_id as "site_id",
  site_conf.name as site_name,
  site_conf.wind_speed_threshold,
  site_conf.gust_threshold,
  site_conf.snow_depth_threshold,
  site_conf.panel_snow_depth_threshold,
  site_conf.wind_reporting_close_percentage,
  site_conf.snow_reporting_close_percentage,
  project.weather_forecast_stow_after_time,
  project.enable_weather_forecast_notification,
  ch_asset.name as asset_name,
  ch_asset.repeater_only,
  ch_asset.snap_addr as snap_addr,
  ch_asset.status_bits as asset_status_bits,
  ch_asset.last_reporting_status,
  ch_asset.asset_type,
  project.address as project_location,
  project.location_lat,
  project.location_lng,
  project.is_notify,
  network_controller.id as network_controller_id,
  network_controller.name as network_controller_name,
  network_controller.asset_id as network_controller_asset_id,
network_controller.fw_version as fw_version,
project.name as project_name,
project.id as project_id
  FROM terrasmart.asset as ch_asset
  LEFT JOIN terrasmart.network_controller on network_controller.id = ch_asset.parent_network_controller_id
  LEFT JOIN terrasmart.site_conf on site_conf.site_id = ch_asset.site_id
  LEFT JOIN terrasmart.site on site.id=ch_asset.site_id
  LEFT JOIN terrasmart.project on project.id=site.project_id
  WHERE ch_asset.id = $1 :: UUID;
`;

exports.siteInfoByAssetSnapAddr = `
SELECT
site_conf.site_id as "site_id",
site_conf.name as site_name,
site_conf.wind_speed_threshold,
site_conf.gust_threshold,
site_conf.snow_depth_threshold,
site_conf.panel_snow_depth_threshold,
site_conf.wind_reporting_close_percentage,
site_conf.snow_reporting_close_percentage, 
ch_asset.name as asset_name,
ch_asset.snap_addr as snap_addr,
ch_asset.status_bits as asset_status_bits,
ch_asset.id as asset_id,
ch_asset.device_type_id,
project.id as project_id,
project.name as project_name,
project.address as project_location,
project.location_lat,
project.location_lng,
project.is_notify,
network_controller.id as network_controller_id,
network_controller.name as network_controller_name,
network_controller.asset_id as network_controller_asset_id,
network_controller.fw_version as fw_version
FROM terrasmart.asset as ch_asset
LEFT JOIN terrasmart.network_controller on network_controller.id = ch_asset.parent_network_controller_id
LEFT JOIN terrasmart.site_conf on site_conf.site_id = ch_asset.site_id
LEFT JOIN terrasmart.site on site.id = ch_asset.site_id
LEFT JOIN terrasmart.project on project.id = site.project_id
WHERE ch_asset.snap_addr = $1 :: VARCHAR;
`;


exports.siteInfoByNCId = `
SELECT
site_conf.site_id as "site_id",
site_conf.name as site_name,
site_conf.wind_speed_threshold,
site_conf.gust_threshold,
site_conf.snow_depth_threshold,
site_conf.panel_snow_depth_threshold,
site_conf.wind_reporting_close_percentage,
site_conf.snow_reporting_close_percentage,
asset.status_bits as asset_status_bits,
asset.device_type_id,
network_controller.id as network_controller_id,
network_controller.name as name,
network_controller.name as asset_name,
network_controller.asset_id as network_controller_asset_id,
project.id as project_id,
project.name as project_name,
project.address as project_location,
project.location_lat,
project.location_lng,
project.is_notify
FROM terrasmart.asset
LEFT JOIN terrasmart.network_controller on network_controller.asset_id = asset.id
LEFT JOIN terrasmart.site_conf on site_conf.site_id = asset.site_id
LEFT JOIN terrasmart.site on site.id=site_conf.site_id
LEFT JOIN terrasmart.project on project.id=site.project_id
WHERE network_controller.id = $1 :: UUID;
`;

exports.vegetationAlertSiteInfoByNCId = `
SELECT
site_conf.site_id as "site_id",
site_conf.name as site_name,
site_conf.wind_speed_threshold,
site_conf.gust_threshold,
site_conf.snow_depth_threshold,
site_conf.panel_snow_depth_threshold,
site_conf.wind_reporting_close_percentage,
site_conf.snow_reporting_close_percentage,
asset.status_bits as asset_status_bits,
asset.device_type_id,
network_controller.id as network_controller_id,
network_controller.name as name,
network_controller.name as asset_name,
network_controller.asset_id as asset_id,
project.id as project_id,
project.name as project_name,
project.address as project_location,
project.location_lat,
project.location_lng,
project.is_notify
FROM terrasmart.asset
LEFT JOIN terrasmart.network_controller on network_controller.asset_id = asset.id
LEFT JOIN terrasmart.site_conf on site_conf.site_id = asset.site_id
LEFT JOIN terrasmart.site on site.id=site_conf.site_id
LEFT JOIN terrasmart.project on project.id=site.project_id
WHERE network_controller.id = $1 :: UUID;
`;
exports.ncInfoByAssetId = `
SELECT
network_controller.id as network_controller_id,
network_controller.name as network_controller_name,
network_controller.asset_id as network_controller_asset_id,
network_controller.fw_version as fw_version
FROM terrasmart.asset as ch_asset
LEFT JOIN terrasmart.network_controller on network_controller.id = ch_asset.parent_network_controller_id
LEFT JOIN terrasmart.asset on asset.id = network_controller.asset_id
WHERE ch_asset.id = $1 :: UUID;
`;
exports.ncInfoByNCAssetId = `
SELECT
network_controller.id as network_controller_id,
network_controller.name as network_controller_name,
network_controller.asset_id as network_controller_asset_id,
network_controller.fw_version as fw_version
FROM terrasmart.network_controller
WHERE network_controller.asset_id = $1 :: UUID;
`;
exports.deviceTypeInfoQuery = `
SELECT * FROM terrasmart.device_type
WHERE device_type.id = $1 :: UUID
`;
exports.deviceTypeInfoQueryBySnapAddr = `
SELECT * FROM terrasmart.device_type
WHERE device_type.id = (
  SELECT asset.device_type_id FROM terrasmart.asset WHERE asset.snap_addr = $1 :: VARCHAR
)`;
exports.siteLayoutInfoByAssetId = `
SELECT site_layout.name,site_layout.i,site_layout.shorthand_name FROM terrasmart.site_layout
WHERE site_layout.asset_id = $1::UUID
`;
exports.getAssetIdsWithActiveAlertsQuery = `
            SELECT 
              cloud_alert.id,
              cloud_alert.asset_id,
              cloud_alert.created,
              cloud_alert.type,
              cloud_alert.event_name,
              cloud_alert.message,
              cloud_alert.active,
              cloud_alert.last_updated,
              cloud_alert.title,
              cloud_alert.icon,
              cloud_alert.user_name,
              cloud_alert.user_email,
              cloud_alert.linked_asset_id,
              cloud_alert.params::TEXT
            FROM terrasmart.cloud_alert
            WHERE
            cloud_alert.active = true AND (cloud_alert.asset_id in (
                    SELECT asset.id as asset_id FROM terrasmart.asset
                    INNER JOIN terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
                    WHERE network_controller.asset_id = $1 :: UUID AND asset.active = true
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
`;
exports.siteInfoByNCAssetId = `
SELECT
site_conf.site_id as "site_id",
site_conf.name as site_name,
site_conf.wind_speed_threshold,
site_conf.gust_threshold,
site_conf.snow_depth_threshold,
site_conf.panel_snow_depth_threshold,
project.weather_forecast_stow_after_time,
project.enable_weather_forecast_notification,
asset.status_bits as asset_status_bits,
asset.asset_type,
project.id as project_id,
project.name as project_name,
project.address as project_location,
project.location_lat,
project.location_lng,
project.is_notify,
network_controller.id as network_controller_id,
network_controller.name as name,
network_controller.name as asset_name,
network_controller.name as network_controller_name,
network_controller.asset_id as network_controller_asset_id,
network_controller.fw_version as fw_version,
asset.snap_addr as snap_addr
FROM terrasmart.asset
LEFT JOIN terrasmart.network_controller on network_controller.asset_id = asset.id
LEFT JOIN terrasmart.site_conf on site_conf.site_id = asset.site_id
LEFT JOIN terrasmart.site on site.id = site_conf.site_id
LEFT JOIN terrasmart.project on project.id = site.project_id
WHERE asset.id = $1 :: UUID;
`;

exports.siteInfo = `
SELECT
site_conf.name as site_name,
project.name as project_name,
project.location_lat,
project.location_lng,
project.address as project_location
FROM terrasmart.site_conf
LEFT JOIN terrasmart.site on site.id = site_conf.site_id
LEFT JOIN terrasmart.project on project.id = site.project_id
WHERE site_conf.site_id = $1 :: UUID;
`;
exports.ncInfo = `
SELECT 
       site_conf.site_id as "site_id",site_conf."name" as site_name, 
       site_conf.enter_diffuse_mode_duration,site_conf.exit_diffuse_mode_duration,
       project.location_lat, project.location_lng,project.is_notify as "is_notify",
       network_controller.name as network_controller_name,project.address as project_location,
       network_controller.connected,network_controller.last_connected,
       network_controller.last_disconnected, project.name as project_name, project.id as project_id,
       wi.ghi as site_ghi, 
       wi.poa as site_poa
FROM terrasmart.network_controller
INNER JOIN terrasmart.asset on asset.id = network_controller.asset_id
INNER JOIN terrasmart.site_conf on site_conf.site_id = asset.site_id
LEFT JOIN terrasmart.site on site.id = site_conf.site_id
LEFT JOIN terrasmart.project on project.id = site.project_id
LEFT JOIN terrasmart.weather_irradiance wi ON wi.project_id = site.project_id
WHERE network_controller.id = $1::uuid
`;


exports.checkLastStatusCurrent = `
SELECT last_reporting_status as connected_state
FROM terrasmart.asset
WHERE id = $1 :: UUID;
`;

exports.checkCurrentStatus = `
SELECT reporting as connected_state
FROM terrasmart.asset
WHERE id = $1 :: UUID;
`;

exports.checkLastAssetHistUpdate = `
SELECT * FROM terrasmart.asset
WHERE id = $1 :: UUID
AND last_asset_update > $2 :: TIMESTAMP
`;

exports.rcHistQuery = `
SELECT row_controller_hist.status_bits,row_controller_hist."timestamp" 
FROM "terrasmart"."row_controller_hist"
  INNER JOIN terrasmart.row_controller on row_controller.id = row_controller_hist.row_controller_id
WHERE row_controller.asset_id = $1 :: uuid
    AND row_controller_hist."timestamp" < $2 :: TIMESTAMP
ORDER BY row_controller_hist."timestamp" DESC
LIMIT 1`;

exports.addCloudEventLogQuery = `
INSERT INTO terrasmart.cloud_event_log (name,levelno,created,asset_id,type,title,icon)
VALUES ($1 :: VARCHAR, $2 :: INT, $3 :: TIMESTAMP,$4 :: UUID, $5::INT,$6::VARCHAR,$7::VARCHAR)
`;
exports.addFullCloudEventLogQuery = `
INSERT INTO terrasmart.cloud_event_log (name,levelno,created,asset_id,type,title,icon,message)
VALUES ($1 :: VARCHAR, $2 :: INT, $3 :: TIMESTAMP,$4 :: UUID, $5::INT,$6::VARCHAR,$7::VARCHAR,$8::TEXT)
`;

exports.addCloudAlertQuery = `
INSERT INTO terrasmart.cloud_alert(event_name,created,asset_id,type,active,title,icon)
VALUES ($1 :: VARCHAR, $2 :: TIMESTAMP,$3 :: UUID, $4 :: INT, $5 :: Boolean,$6::VARCHAR,$7::VARCHAR)
`;
exports.addFullCloudAlertQuery = `
INSERT INTO terrasmart.cloud_alert(event_name,created,asset_id,type,active,title,icon,message)
VALUES ($1 :: VARCHAR, $2 :: TIMESTAMP,$3 :: UUID, $4 :: INT, $5 :: Boolean,$6::VARCHAR,$7::VARCHAR,$8::Text)
`;
exports.addCloudAlertLinkedAssetQuery = `
INSERT INTO terrasmart.cloud_alert(event_name,created,asset_id,type,active,title,icon,message,linked_asset_id)
VALUES ($1 :: VARCHAR, $2 :: TIMESTAMP,$3 :: UUID, $4 :: INT, $5 :: Boolean,$6::VARCHAR,$7::VARCHAR,$8::Text,$9::UUID)
`;
exports.addCloudAlertParamsQuery = `
INSERT INTO terrasmart.cloud_alert(event_name,created,asset_id,type,active,title,icon,message, params)
VALUES ($1 :: VARCHAR, $2 :: TIMESTAMP,$3 :: UUID, $4 :: INT, $5 :: Boolean,$6::VARCHAR,$7::VARCHAR,$8::Text,$9::JSON)
`;
exports.getcloudAlertQueryForNC = `
SELECT *
FROM terrasmart.cloud_alert
WHERE event_name = $1 :: VARCHAR AND asset_id = (
  SELECT asset_id FROM terrasmart.network_controller
  WHERE id = $2 :: UUID
)
AND cloud_alert.active = true
ORDER BY created desc limit 1`;

exports.cloudAlertsForNC = `SELECT cloud_alert.* FROM terrasmart.cloud_alert
INNER JOIN terrasmart.network_controller on network_controller.asset_id = cloud_alert.asset_id
WHERE network_controller.id = $1::UUID AND event_name = $2::VARCHAR`;

exports.getcloudAlertQueryByNCId = `

SELECT *
FROM terrasmart.cloud_alert
WHERE event_name = $1 :: VARCHAR AND asset_id IN (
  SELECT asset.id FROM terrasmart.asset
  WHERE parent_network_controller_id = $2 :: UUID
  UNION
  SELECT asset_id FROM terrasmart.network_controller
  WHERE id = $2::UUID
)
AND cloud_alert.active = true`;


exports.cloudAlertQueryByNCId = `
SELECT cloud_alert.*,asset.snap_addr as snap_addr
FROM terrasmart.cloud_alert
INNER JOIN terrasmart.asset on asset.id = cloud_alert.asset_id
WHERE event_name = $1 :: VARCHAR AND asset_id IN (
  SELECT asset.id FROM terrasmart.asset
  WHERE parent_network_controller_id = $2 :: UUID
)
AND created < $3::TIMESTAMP
ORDER BY created desc limit 1`;

exports.getLastCloudAlertQuery = `
SELECT * 
FROM terrasmart.cloud_alert
WHERE event_name = $1 :: VARCHAR AND asset_id = $2 :: UUID
AND cloud_alert.active = true
ORDER BY created desc limit 1`;

exports.updateCLoudAlertQuery = `
UPDATE terrasmart.cloud_alert 
SET active = false, last_updated = $1 :: TIMESTAMP
WHERE id = $2 :: UUID`;

exports.removeCloudAlert = `
DELETE FROM terrasmart.cloud_alert WHERE id = $1 :: UUID
`;
exports.removeCloudAlertDetail = `
Delete from terrasmart.cloud_alert_detail
WHERE cloud_alert_detail.cloud_alert_id = $1::UUID`;

exports.checkLastNCTrackingCommand = `
SELECT *
FROM terrasmart.tracking_command_hist
WHERE tracking_command_hist.network_controller_id = $1 :: UUID
ORDER BY tracking_command_hist.changed_at DESC limit 1 offset 1
`;

exports.checkTodayLastNCTrackingCommand = `
SELECT *
FROM terrasmart.tracking_command_hist
WHERE tracking_command_hist.network_controller_id = $1 :: UUID
AND tracking_command_hist.changed_at >= $2 :: TIMESTAMP
ORDER BY tracking_command_hist.changed_at DESC limit 1 offset 1
`;

exports.checkActiveWeatherAlertQuery = `
SELECT cloud_alert.* FROM terrasmart.cloud_alert 
  INNER JOIN terrasmart.asset on asset.id = cloud_alert.asset_id
  WHERE asset.parent_network_controller_id = $1 :: UUID
  AND (  cloud_alert.event_name ILIKE 'Weather_Stow_%' )
  AND cloud_alert.active = true`;

exports.checkActiveWeatherStowAlertQuery = `
SELECT 
    *
   FROM terrasmart.cloud_alert
	 WHERE cloud_alert.asset_id IN (SELECT * 
FROM (
			SELECT asset.id as asset_id 
		FROM terrasmart.asset
				LEFT JOIN terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
				LEFT JOIN terrasmart.asset as main_asset on main_asset.id = network_controller.asset_id
		WHERE main_asset.site_id = $1:: UUID
		UNION
		SELECT asset.id as asset_id
		FROM terrasmart.asset
				LEFT JOIN terrasmart.network_controller on network_controller.asset_id = asset.id
				LEFT JOIN terrasmart.asset as main_asset on main_asset.id = network_controller.asset_id
		WHERE main_asset.site_id =  $1::UUID
		) asset_table
)
AND (  cloud_alert.event_name ILIKE 'Weather_Stow_%' )
AND cloud_alert.active = true;
`;
exports.checkCloudAlert = `
  SELECT * FROM terrasmart.cloud_alert
  WHERE asset_id = $1::UUID
  AND event_name = $2::VARCHAR
  AND active = true
  `;
exports.checkCloudAlertForAllAssetsBYNCAssetIDNoType = `
  SELECT * FROM terrasmart.cloud_alert
  WHERE asset_id in (
    SELECT asset.id FROM terrasmart.asset 
    WHERE asset.parent_network_controller_id = $1::UUID
    AND event_name like '%Increased_Weather_Reporting%'
    )
  AND active = true
  `;
exports.checkCloudAlertForAllAssetsBYNCAssetID = `
  SELECT * FROM terrasmart.cloud_alert
  WHERE asset_id in (
    SELECT asset.id FROM terrasmart.asset 
    WHERE asset.parent_network_controller_id = $1::UUID
    )
  AND event_name = $2::VARCHAR
  AND active = true
  `;
exports.checkCloudAlertByLinkedAsset = `
  SELECT * FROM terrasmart.cloud_alert
  WHERE linked_asset_id = $1::UUID
  AND event_name = $2::VARCHAR
  AND active = true
  `;
exports.checkMatchingCloudAlert = (event) => {
  return `
    SELECT * FROM terrasmart.cloud_alert
    WHERE asset_id = $1::UUID
    AND event_name ilike '${event}%'
    AND active = true
  `;
};
exports.lastWeatherHist = `
SELECT weather_hist.* 
FROM terrasmart.weather_hist
  INNER JOIN terrasmart.weather on weather.id = weather_hist.weather_id
WHERE weather.asset_id = $1 :: UUID AND weather_hist."timestamp" < $2 :: TIMESTAMP
AND weather_hist.wind_speed IS NOT NULL
ORDER BY weather_hist.timestamp DESC limit 1
  `;

exports.updateActiveAlert = `
  UPDATE terrasmart.cloud_alert set message = $1 :: VARCHAR, created = $2::TIMESTAMP
  WHERE id = $3::UUID 
  `;
exports.updateActiveAlertFull = `
  UPDATE terrasmart.cloud_alert set message = $1 :: VARCHAR, created = $2::TIMESTAMP, title = $3:: VARCHAR, icon = $4::VARCHAR
  WHERE id = $5::UUID
  `;
exports.updateActiveAlertParams = `
  UPDATE terrasmart.cloud_alert set message = $1 :: VARCHAR, created = $2::TIMESTAMP, title = $3:: VARCHAR, icon = $4::VARCHAR, params = $5::JSON
  WHERE id = $6::UUID
`;

exports.assetsWithLocalErrors = `
SELECT asset.id,asset.status_bits,device_type.device_type,asset.name as asset_name FROM terrasmart.asset
LEFT JOIN terrasmart.device_type on device_type.id = asset.device_type_id
WHERE parent_network_controller_id = $1::UUID AND status_bits IS NOT NULL AND status_bits != 0
`;

exports.addCloudEventLogByReturnId = `
WITH cloud_event_log_insert AS (
  INSERT INTO terrasmart.cloud_event_log (name,message,levelno,created,asset_id,type,title,icon)
  VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: INT, $4 :: TIMESTAMP,$5 :: UUID, $6::INT,$7::VARCHAR,$8::VARCHAR)
  RETURNING id AS id
)
SELECT id FROM cloud_event_log_insert
`;
exports.addCloudEventLogWithUserInfoByReturnId = `
WITH cloud_event_log_insert AS (
  INSERT INTO terrasmart.cloud_event_log (name,message,levelno,created,asset_id,type,title,icon,user_name,user_email, params)
  VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: INT, $4 :: TIMESTAMP,$5 :: UUID, $6::INT,$7::VARCHAR,$8::VARCHAR,$9::VARCHAR,$10::VARCHAR, $11::JSON)
  RETURNING id AS id
)
SELECT id FROM cloud_event_log_insert
`;
exports.addCloudAlertByReturnId = `
WITH cloud_alert_insert AS (
      INSERT INTO terrasmart.cloud_alert(event_name,message,created,asset_id,type,active,title,icon, levelno)
      VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: TIMESTAMP,$4 :: UUID, $5 :: INT, $6 :: Boolean,$7 :: VARCHAR,$8::VARCHAR, $9 :: INT)
      RETURNING id AS id
    )
  SELECT id FROM cloud_alert_insert
`;
exports.addCloudAlertParamsByReturnId = `
WITH cloud_alert_insert AS (
      INSERT INTO terrasmart.cloud_alert(event_name,message,created,asset_id,type,active,title,icon,params)
      VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: TIMESTAMP,$4 :: UUID, $5 :: INT, $6 :: Boolean,$7 :: VARCHAR,$8::VARCHAR, $9::JSON)
      RETURNING id AS id
    )
  SELECT id FROM cloud_alert_insert
`;
exports.addCloudAlertWithUserInfoByReturnId = `
WITH cloud_alert_insert AS (
      INSERT INTO terrasmart.cloud_alert(event_name,message,created,asset_id,type,active,title,icon,user_name,user_email, params, levelno)
      VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: TIMESTAMP,$4 :: UUID, $5 :: INT, $6 :: Boolean,$7 :: VARCHAR,$8::VARCHAR,$9::VARCHAR,$10::VARCHAR, $11::JSON, $12::INT)
      RETURNING id AS id
    )
  SELECT id FROM cloud_alert_insert
`;

exports.getIndividualRCActiveAction = `
SELECT
site_layout.last_action_completed,
site_layout.timestamp,
  users.display_name,
  users.email_addr
FROM terrasmart.site_layout

INNER JOIN terrasmart.users
  ON site_layout.user_id = users.user_id
WHERE
  site_layout.asset_id = $1
AND
  site_layout.last_action_completed = false
`;

exports.insertIndividualRCCloudAlerts = `
INSERT INTO terrasmart.cloud_event_log (
  message,
  levelno,
  created,
  type,
  asset_id,
  name,
  user_name,
  user_email
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8
)
`;

exports.updateIndividualRCCompletionStatus = `
UPDATE terrasmart.site_layout 
SET
 last_action_completed = true,
 timestamp = $1
WHERE
 asset_id = $2 :: UUID 
AND
last_action_completed = false
`;

exports.getAssetDetails = `SELECT
    network_controller.asset_id AS nc_asset_id,
    network_controller.aws_iot_principal_id AS principal_id,
    radio.snap_addr,
    site_layout.id AS row_id,
    asset.name AS name,
    site_layout.individual_rc_cmd_state AS commanded_state

  FROM terrasmart.asset
  INNER JOIN
    terrasmart.network_controller
      ON asset.parent_network_controller_id = network_controller.id
  INNER JOIN
    terrasmart.radio
      ON asset.id = radio.asset_id
  INNER JOIN
    terrasmart.site_layout
      ON asset.id = site_layout.asset_id
  WHERE asset.id = $1 :: uuid`;

exports.getCurrentStatus = `SELECT reporting FROM terrasmart.asset WHERE id = $1 `;

exports.getAssetCommand = `SELECT 
  last_action_completed,
  individual_rc_cmd_state,
  individual_rc_param
FROM terrasmart.site_layout 
WHERE asset_id = $1 
  AND last_action_completed = false`;

exports.getWindData = `
  SELECT 
    wh.average_wind_speed as avg,
    wh.wind_speed as speed,
    wh.peak_wind_speed as gust,
    wh.wind_direction as direction,
    wh.timestamp
  FROM terrasmart.weather_hist AS wh INNER JOIN terrasmart.weather as w on wh.weather_id = w.id
  WHERE asset_id =  $1 :: uuid AND timestamp > $2 :: timestamp
  ORDER BY wh.timestamp DESC
`;

exports.getNCSleepStart = `
SELECT created
from terrasmart.cloud_event_log
WHERE asset_id = $1 :: uuid
  AND name = 'NC-SLEEP'
  AND created > $2 :: timestamp
ORDER BY created DESC
LIMIT 1;`;

exports.getNCSleepEnd = `
SELECT created
from terrasmart.cloud_event_log
WHERE asset_id = $1 :: uuid
  AND name IN ('NC-WAKE', 'NC-APPLICATION-REBOOT')
  AND created > $2 :: timestamp
ORDER BY created DESC
LIMIT 1;`;

exports.getNightlyStowEvents = `
SELECT ch.commanded_state, ch.changed_at
FROM terrasmart.tracking_command_hist AS ch
         INNER JOIN terrasmart.network_controller AS nc on ch.network_controller_id = nc.id
WHERE asset_id = $1 :: uuid
  AND changed_at <= $2 :: timestamp
  AND ch.commanded_state = $3 :: integer
  AND changed_at >= $4 :: timestamp
ORDER BY changed_at DESC
LIMIT 1
`;

exports.getWakeUpEvents = `
SELECT ch.commanded_state, ch.changed_at
FROM terrasmart.tracking_command_hist AS ch
         INNER JOIN terrasmart.network_controller AS nc on ch.network_controller_id = nc.id
WHERE asset_id = $1 :: uuid
  AND changed_at >= $2 :: timestamp
  AND ch.commanded_state = $3 :: integer
  AND changed_at <= $4 :: timestamp
ORDER BY changed_at DESC
LIMIT 1
`;

exports.getNC = `SELECT nc.asset_id               AS nc_id,
dt.device_type,
nc.last_sleep_mode_update AS sleep,
nc.wake_up_time           AS wake_up,
w.has_wind_sensor

FROM terrasmart.asset AS a
  INNER JOIN terrasmart.network_controller AS nc ON a.parent_network_controller_id = nc.id
  INNER JOIN terrasmart.device_type AS dt ON a.device_type_id = dt.id
  INNER JOIN terrasmart.weather AS w ON a.id = w.asset_id
WHERE a.id = $1 :: uuid`;

exports.isInWeatherStow = `
SELECT changed_at, commanded_state, commanded_state_detail
from terrasmart.tracking_command_hist
WHERE network_controller_id = (SELECT parent_network_controller_id
                               FROM terrasmart.asset
                               WHERE asset.id = $1 :: uuid)
ORDER BY changed_at DESC
LIMIT 1;`;

exports.ncInfoById = `
SELECT * FROM terrasmart.network_controller
WHERE network_controller.id = $1::UUID
`;

exports.assetInfoByNcIdQuery = `SELECT
asset.id as asset_id, asset.name as asset_name, device_type.device_type, encode(radio.snap_addr,'hex') as snap_addr,
site_layout.i as row_id, site_layout.shorthand_name,site_layout.name as row_name
FROM terrasmart.asset
LEFT JOIN terrasmart.device_type on device_type.id = asset.device_type_id
LEFT JOIN terrasmart.site_layout on site_layout.asset_id = asset.id
INNER JOIN terrasmart.radio on radio.asset_id = asset.id
WHERE asset.parent_network_controller_id = $1:: UUID
`;

exports.site_stow_insert = `
  WITH insert_weather_stow AS (
    INSERT INTO terrasmart.weather_forecast_stow (site_id, timestamp, active, state, stow_type, start_time, end_time, alarm_start_time,
    alarm_end_time, alarm_value, alarm_threshold, alarm_text, alarm_timestamp, hide_at_project_level)
    VALUES ($2 :: UUID, $3 :: timestamp, $4 :: BOOL, $5 :: INT4, $6 :: VARCHAR, $7 :: TIMESTAMP, $8 :: TIMESTAMP,
    $9 :: TIMESTAMP, $10 :: TIMESTAMP, $11 :: FLOAT, $12 :: FLOAT, $13 :: VARCHAR, $14 :: TIMESTAMP, $15 :: BOOL)
    RETURNING *
  ),
  nc_connected AS (
    SELECT nc.asset_id, asset.device_type_id, nc.connected, nc.commanded_state,nc.commanded_state_detail, nc.aws_iot_principal_id, project.enable_weather_forecast,
    project.enable_weather_forecast_stow, project.enable_weather_alert_stow FROM terrasmart.network_controller nc
    INNER JOIN terrasmart.asset on asset.id=nc.asset_id
    INNER JOIN terrasmart.site on site.id=asset.site_id
    INNER JOIN terrasmart.project on project.id=site.project_id
    WHERE nc.asset_id = $1 :: UUID
  )
  SELECT * FROM insert_weather_stow, nc_connected
`;

exports.site_stow_updateFull = (state) => {
  const reset_override = state === 1 ? ', weather_forecast_override_end_time = null' : '';
  return `
  WITH update_weather_stow AS (
    UPDATE terrasmart.weather_forecast_stow SET timestamp = $3 :: timestamp, active = $4 :: BOOL, state = $5 :: INT4,
    stow_type = $6 :: VARCHAR, start_time = $7 :: TIMESTAMP, end_time = $8 :: TIMESTAMP, alarm_start_time = $9 :: TIMESTAMP,
    alarm_end_time = $10 :: TIMESTAMP, alarm_value = $11 :: FLOAT, alarm_threshold = $12 :: FLOAT, alarm_text = $13 :: VARCHAR,
      alarm_timestamp = $14 :: TIMESTAMP, hide_at_project_level = $15 :: BOOL ${reset_override}
    WHERE id = $2 :: UUID
    RETURNING *
  ),
  nc_connected AS (
    SELECT nc.asset_id, asset.device_type_id, nc.connected, nc.commanded_state,nc.commanded_state_detail, nc.aws_iot_principal_id, project.enable_weather_forecast,
    project.enable_weather_forecast_stow, project.enable_weather_alert_stow FROM terrasmart.network_controller nc
    INNER JOIN terrasmart.asset on asset.id=nc.asset_id
    INNER JOIN terrasmart.site on site.id=asset.site_id
    INNER JOIN terrasmart.project on project.id=site.project_id
    WHERE nc.asset_id = $1 :: UUID
  )
  SELECT * FROM update_weather_stow, nc_connected
  `
};

// Used by nc events accuWeatherService
exports.site_stow_nc_id = `
  SELECT wfs.*, asset.device_type_id, nc.connected,nc.commanded_state,nc.commanded_state_detail, nc.aws_iot_principal_id, project.enable_weather_forecast,
  project.enable_weather_forecast_stow, project.enable_weather_alert_stow FROM terrasmart.network_controller nc
  INNER JOIN terrasmart.asset on asset.id=nc.asset_id
  INNER JOIN terrasmart.site on site.id=asset.site_id
  INNER JOIN terrasmart.project on project.id=site.project_id
  LEFT JOIN terrasmart.weather_forecast_stow wfs on wfs.site_id=asset.site_id
  WHERE nc.id = $1 :: UUID
`;

// used by weather_stow_updates
exports.site_stow_nc_asset_id = (operator, stow_type) => {
  return `SELECT wfs.*, asset.device_type_id, nc.connected,nc.commanded_state,nc.commanded_state_detail, nc.aws_iot_principal_id FROM terrasmart.network_controller nc
    INNER JOIN terrasmart.asset on asset.id=nc.asset_id
    LEFT JOIN terrasmart.weather_forecast_stow wfs on wfs.site_id=asset.site_id
    WHERE nc.asset_id = $1 :: UUID AND wfs.stow_type ${operator} '${stow_type}'
  `;
};

// Used by weather_stow events accuWeatherService
exports.site_stow_site_id = `
  SELECT wfs.*, asset.device_type_id, nc.connected,nc.commanded_state,nc.commanded_state_detail, nc.aws_iot_principal_id, project.enable_weather_forecast,
  project.enable_weather_forecast_stow, project.enable_weather_alert_stow FROM terrasmart.network_controller nc
  INNER JOIN terrasmart.asset on asset.id=nc.asset_id
  INNER JOIN terrasmart.site on site.id=asset.site_id
  INNER JOIN terrasmart.project on project.id=site.project_id
  LEFT JOIN terrasmart.weather_forecast_stow wfs on wfs.site_id=asset.site_id
  WHERE asset.site_id = $1 :: UUID
`;

exports.site_stow_update = `
  UPDATE terrasmart.weather_forecast_stow
  SET state = $1 :: INT4, active = $2 :: BOOL
  WHERE id = $3 :: UUID
`;

exports.projectSites = `
  SELECT
    site.id
  FROM terrasmart.site
    INNER JOIN terrasmart.project on project.id = site.project_id
  WHERE site.active = true AND project.id = $1 :: UUID
`;
exports.getProjectSitesQuery = `
SELECT * FROM terrasmart.site WHERE site.project_id = $1::UUID`;

exports.checkActiveAssetQuery = `
SELECT active FROM terrasmart.asset WHERE active = true AND id = $1::UUID
`
