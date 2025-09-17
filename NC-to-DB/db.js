exports.netCtrlQuery = `
SELECT network_controller.id, network_controller.asset_id,
 network_controller.name, network_controller.last_updated,network_controller.fw_version,
 network_controller.commanded_state, asset.site_id
FROM terrasmart.network_controller 
INNER JOIN terrasmart.asset on asset.id = network_controller.asset_id
WHERE aws_iot_principal_id = $1::char(64) 
LIMIT 1; 
`;

exports.currentSiteModeQuery = `
SELECT commanded_state,commanded_state_detail FROM terrasmart.network_controller
WHERE id = $1::UUID`;

exports.trackingCommandHistQuery = `
  INSERT INTO terrasmart.tracking_command_hist(network_controller_id, changed_at, commanded_state)
  VALUES ($1::uuid, $2::timestamp, $3::int)
`;

exports.trackingCommandHistDetailQuery = `
  INSERT INTO terrasmart.tracking_command_hist(network_controller_id, changed_at, commanded_state,commanded_state_detail)
  VALUES ($1::uuid, $2::timestamp, $3::int,$4::int)
`;

exports.updateTrackingCommandHistDetailQuery = ` 
UPDATE terrasmart.network_controller SET commanded_state = $1 :: INT, commanded_state_detail = $2 :: INT, commanded_state_changed_at = $4 :: TIMESTAMP
WHERE network_controller.id = $3 :: UUID AND (commanded_state_changed_at IS NULL OR commanded_state_changed_at <= $4 :: TIMESTAMP)`;

exports.updateIrradianceUpdateQuery = ` 
UPDATE terrasmart.network_controller SET site_ghi = $1 :: FLOAT, site_poa = $2 :: FLOAT
WHERE network_controller.id = $3 :: UUID`;

exports.addIrradianceHist = `
INSERT INTO terrasmart.irradiance_hist (network_controller_id,timestamp,site_ghi,site_poa)
VALUES ($1::UUID, $2::TIMESTAMP, $3::FLOAT, $4::FLOAT)`;

exports.radioQuery = `
  SELECT id, asset_id
  FROM terrasmart.radio
  WHERE radio.snap_addr = $1::bytea
  LIMIT 1;
`;

exports.rowCtrlQuery = `
select * from "terrasmart"."asset_entites_ids"
WHERE snap_addr = $1::bytea
LIMIT 1`;
/*
exports.rowCtrlQuery = `
SELECT asset.id AS asset_id, battery.id AS battery_id, rack.id AS rack_id, panel.id as panel_id, motor.id AS motor_id, charger.id as charger_id, radio.id as radio_id
FROM terrasmart.radio
  INNER JOIN terrasmart.asset ON terrasmart.radio.asset_id = terrasmart.asset.id
  INNER JOIN terrasmart.panel ON terrasmart.asset.id = terrasmart.panel.asset_id
  INNER JOIN terrasmart.charger ON terrasmart.asset.id = terrasmart.charger.asset_id
  INNER JOIN terrasmart.charger_battery ON terrasmart.charger.id = terrasmart.charger_battery.charger_id
  INNER JOIN terrasmart.battery ON terrasmart.charger_battery.battery_id = terrasmart.battery.id
  INNER JOIN terrasmart.row_controller ON terrasmart.asset.id = terrasmart.row_controller.asset_id
  INNER JOIN terrasmart.rack ON terrasmart.row_controller.id = terrasmart.rack.row_controller_id
  INNER JOIN terrasmart.motor ON terrasmart.row_controller.id = terrasmart.motor.row_controller_id
WHERE snap_addr = $1::bytea
LIMIT 1;
`;*/
exports.ncCtrlQuery = `
SELECT asset.id AS asset_id, battery.id AS battery_id, panel.id as panel_id, charger.id as charger_id, radio.id as radio_id
FROM terrasmart.radio
  INNER JOIN terrasmart.asset ON terrasmart.radio.asset_id = terrasmart.asset.id
  INNER JOIN terrasmart.panel ON terrasmart.asset.id = terrasmart.panel.asset_id
  INNER JOIN terrasmart.charger ON terrasmart.asset.id = terrasmart.charger.asset_id
  INNER JOIN terrasmart.charger_battery ON terrasmart.charger.id = terrasmart.charger_battery.charger_id
  INNER JOIN terrasmart.battery ON terrasmart.charger_battery.battery_id = terrasmart.battery.id
WHERE radio.snap_addr = $1::bytea
LIMIT 1;
`;

exports.angularErrorHourInsert = `
INSERT INTO terrasmart.angular_error_hour (rack_id, avg_hour, hour, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::int, $4::date, $5::timestamp)
`;
exports.angularErrorDayInsert = `
INSERT INTO terrasmart.angular_error_day (rack_id, avg_day, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::date, $4::timestamp)
`;
exports.batteryPowerHourInsert = `
INSERT INTO terrasmart.battery_power_hour (battery_id, total_hour, hour, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::int, $4::date, $5::timestamp)
`;
exports.batteryPowerDayInsert = `
INSERT INTO terrasmart.battery_power_day (battery_id, total_day, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::date, $4::timestamp)
`;
exports.chargerPowerHourInsert = `
INSERT INTO terrasmart.charger_power_hour (charger_id, total_hour, hour, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::int, $4::date, $5::timestamp)
`;
exports.chargerPowerDayInsert = `
INSERT INTO terrasmart.charger_power_day (charger_id, total_day, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::date, $4::timestamp)
`;
exports.motorPowerHourInsert = `
INSERT INTO terrasmart.motor_power_hour (motor_id, total_hour, hour, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::int, $4::date, $5::timestamp)
`;
exports.motorPowerDayInsert = `
INSERT INTO terrasmart.motor_power_day (motor_id, total_day, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::date, $4::timestamp)
`;
exports.panelPowerHourInsert = `
INSERT INTO terrasmart.panel_power_hour (panel_id, total_hour, hour, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::int, $4::date, $5::timestamp)
`;
exports.panelPowerDayInsert = `
INSERT INTO terrasmart.panel_power_day (panel_id, total_day, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::date, $4::timestamp)
`;
exports.panelExternalInputPowerHourInsert = `
INSERT INTO terrasmart.panel_external_input_power_hour (panel_id, total_hour, hour, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::int, $4::date, $5::timestamp)
`;
exports.panelExternalInputPowerDayInsert = `
INSERT INTO terrasmart.panel_external_input_power_day (panel_id, total_day, day, collected_at)
VALUES ($1::uuid, $2::double precision, $3::date, $4::timestamp)
`;

exports.rowCtrlHistInsert = `
INSERT INTO terrasmart.row_controller_hist (row_controller_id, timestamp, status_bits)
VALUES ((SELECT row_controller.id
         FROM terrasmart.row_controller
           INNER JOIN terrasmart.asset ON row_controller.asset_id = asset.id
         WHERE asset.id = $1 :: uuid),
        $2 :: TIMESTAMP,
        $3 :: INT)
`;
exports.updateRowCtrl = `
UPDATE terrasmart.row_controller
    SET status_bits = $3 :: INT, last_updated = $2 :: TIMESTAMP
WHERE id = (SELECT row_controller.id
         FROM terrasmart.row_controller
           INNER JOIN terrasmart.asset ON row_controller.asset_id = asset.id
         WHERE asset.id = $1 :: uuid) AND last_updated <= $2 :: TIMESTAMP
`;

exports.ncLastReportedHistoryUpdate = `
INSERT INTO terrasmart.network_controller_connection_hist (last_updated, network_controller_id)
    VALUES ($1::TIMESTAMP, $2 :: uuid)
`;

exports.rackPresetHistInsert = `
INSERT INTO terrasmart.rack_preset_hist (rack_id, timestamp, panel_index, panel_commanded_state  )
VALUES ((SELECT rack.id
    FROM terrasmart.rack
    WHERE rack.snap_addr = $1),
        $2 :: TIMESTAMP,
        $3 :: INT,
        $4 :: INT
)
`;

exports.rackByAssetId = `
SELECT rack.id FROM terrasmart.rack 
INNER JOIN terrasmart.row_controller ON rack.row_controller_id = row_controller.id
WHERE row_controller.asset_id = $1::UUID
`;

exports.eventLogInsert = `
INSERT INTO terrasmart.event_log (name, message, levelno, created, type, network_controller_id)
    VALUES ($1::VARCHAR(128), $2::TEXT, $3::INT, $4::TIMESTAMP, $5::INT, $6::UUID)
`;

exports.eventLogUpdate = `
UPDATE terrasmart.event_log
    SET cleared = $1::TIMESTAMP
WHERE created = $2::TIMESTAMP AND
  network_controller_id = $3::UUID
`;

exports.alertHistInsert = `
INSERT INTO terrasmart.alert_hist ("when", network_controller_id, type, active, message)
    VALUES ($1::TIMESTAMP, $2::UUID, $3::SMALLINT, $4::BOOL, $5::VARCHAR(256))
`;

exports.alertInsert = `
INSERT INTO terrasmart.alert ("when", network_controller_id, type, message)
    VALUES ($1::TIMESTAMP, $2::UUID, $3::SMALLINT, $4::VARCHAR(256))
`;

exports.alertDelete = `
DELETE FROM terrasmart.alert
WHERE network_controller_id = $1::UUID
`;

exports.ncUpdate = `
UPDATE terrasmart.network_controller
    SET last_updated = $1::TIMESTAMP
WHERE id = $2::UUID
AND last_updated < CURRENT_TIMESTAMP - INTERVAL '10 second'
`;

exports.getBatteryIdByAsset = `
SELECT battery_id
         FROM terrasmart.charger_battery
           INNER JOIN terrasmart.charger ON charger_battery.charger_id = charger.id
           WHERE
           charger.asset_id = $1::UUID`;

exports.gpsIdQueryWhereSnapAddrMatch = `
SELECT
  gps.id as gps_id,
  gps.lat,
  gps.lng,
  gps.alt
FROM terrasmart.gps
  INNER JOIN terrasmart.network_controller ON gps.network_controller_id = network_controller.id
  INNER JOIN terrasmart.asset ON network_controller.asset_id = asset.id
  INNER JOIN terrasmart.radio ON radio.asset_id = asset.id
WHERE radio.snap_addr = $1::bytea
LIMIT 1
`;

exports.gpsInsert = `
  INSERT INTO terrasmart.gps (
      network_controller_id, lat, lng, alt, sats, quality, fix_timestamp, responding, alt_units, is_clock_questionable, timestamp
  )
  VALUES (
      (SELECT network_controller.id AS network_controller_id
       FROM terrasmart.network_controller
          INNER JOIN terrasmart.asset ON network_controller.asset_id = asset.id
          INNER JOIN terrasmart.radio ON radio.asset_id = asset.id
       WHERE radio.snap_addr = $1::bytea),
      $2::FLOAT, $3::FLOAT, $4::FLOAT, $5::SMALLINT, $6::SMALLINT, $7::TIMESTAMP, $8::BOOLEAN, $9::VARCHAR(128), $10::BOOLEAN, $11::TIMESTAMP
  )
  ON CONFLICT (network_controller_id)
  DO UPDATE SET
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      alt = EXCLUDED.alt,
      sats = EXCLUDED.sats,
      quality = EXCLUDED.quality,
      fix_timestamp = EXCLUDED.fix_timestamp,
      responding = EXCLUDED.responding,
      alt_units = EXCLUDED.alt_units,
      is_clock_questionable = EXCLUDED.is_clock_questionable,
      timestamp = EXCLUDED.timestamp
  RETURNING id AS gps_id;

`;

exports.gpsHistInsert = `
INSERT INTO terrasmart.gps_hist (network_controller_id, lat, lng, alt, sats, quality, fix_timestamp, responding, alt_units, is_clock_questionable, timestamp, gps_id)
VALUES ((SELECT network_controller.id as network_controller_id
         FROM terrasmart.network_controller
            INNER JOIN terrasmart.asset ON network_controller.asset_id = asset.id
            INNER JOIN terrasmart.radio ON radio.asset_id = asset.id
         WHERE
            radio.snap_addr = $1::bytea),
        $2 :: FLOAT, $3 :: FLOAT, $4 :: FLOAT, $5 :: SMALLINT, $6 :: SMALLINT, $7 :: TIMESTAMP, $8 :: BOOLEAN, $9 :: VARCHAR(128), $10 :: BOOLEAN, $11 :: TIMESTAMP, $12 :: UUID)
RETURNING id as gps_hist_id
`;

// Try to find a weather record that indirectly goes with the specified snap_address
exports.weatherQuery = `
SELECT weather.id as weather_id
FROM terrasmart.weather
  INNER JOIN terrasmart.asset ON weather.asset_id = asset.id
  INNER JOIN terrasmart.radio ON radio.asset_id = asset.id
WHERE radio.snap_addr = $1::bytea
LIMIT 1
`;

// This is used to make a weather record on-the-fly
exports.weatherInsert = `
INSERT INTO terrasmart.weather (asset_id)
VALUES ((SELECT asset.id as asset_id
         FROM terrasmart.asset
           INNER JOIN terrasmart.radio ON asset.id = radio.asset_id
         WHERE radio.snap_addr = decode($1::varchar, 'hex')::bytea)
) returning *
`;
exports.weatherUpdate = `
UPDATE terrasmart.weather SET last_updated = $2::TIMESTAMP, wind_speed = $3::FLOAT, wind_direction = $4 ::FLOAT, average_wind_speed = $5 :: FLOAT,
  peak_wind_speed = $6::FLOAT, temperature = $7::FLOAT, snow_depth = $8::FLOAT, increase_avg_wind_reporting = $9::INT, increase_wind_gust_reporting = $10::INT,
  data_type = $11::VARCHAR, nc_reported_at = $12::TIMESTAMP
  WHERE id = $1::UUID and last_updated <= $2::TIMESTAMP
`;

// this is used to add another weather report
exports.weatherHistInsert = `
INSERT INTO terrasmart.weather_hist (weather_id, timestamp, wind_speed, wind_direction, average_wind_speed, peak_wind_speed, temperature, snow_depth,increase_avg_wind_reporting,increase_wind_gust_reporting,data_type,nc_reported_at)
VALUES ($1::UUID, $2::TIMESTAMP, $3::DOUBLE PRECISION, $4::DOUBLE PRECISION, $5::DOUBLE PRECISION, $6::DOUBLE PRECISION, $7::DOUBLE PRECISION, $8::DOUBLE PRECISION, $9::INT, $10::INT, $11::VARCHAR, $12::TIMESTAMP)
`;
exports.weatherReportingHistInsert = `
INSERT INTO terrasmart.network_controller_weather_hist (network_controller_id, timestamp, increase_avg_wind_reporting,increase_wind_gust_reporting,increase_avg_snow_reporting, increase_panel_snow_reporting, asset_snap_addr)
VALUES ($1::UUID, $2::TIMESTAMP, $3::INT, $4::INT, $5::INT, $6::INT, $7::BYTEA)
`;

exports.weatherStowUpdateInsert = `
INSERT INTO terrasmart.weather_hist (weather_id, timestamp, stow_type, stow_value, stow_threshold,stow_lower_threshold)
VALUES ($1::UUID, $2::TIMESTAMP, $3::INT, $4::DOUBLE PRECISION, $5::DOUBLE PRECISION,$6::DOUBLE PRECISION);
`;
exports.addRowConfigQuery = `
INSERT INTO terrasmart.row_controller_conf 
(row_controller_id, config_label,config_timestamp,timestamp,model_device,location_lat,location_lng,location_text,
  hardware_rev,firmware_rev,site_name,panel_horizontal_cal_angle,panel_min_cal_angle,panel_max_cal_angle,config_flags,
  segments_0_panel_array_width,segments_0_spacing_to_east,segments_0_spacing_to_west,segments_0_delta_height_east,
  segments_0_delta_height_west,segments_1_panel_array_width,segments_1_spacing_to_east,segments_1_spacing_to_west,segments_1_delta_height_east,segments_1_delta_height_west,
  preset_angles_0_preset_angle,preset_angles_0_nearest_enabled,preset_angles_1_preset_angle,preset_angles_1_nearest_enabled,
  preset_angles_2_preset_angle,preset_angles_2_nearest_enabled,preset_angles_3_preset_angle,preset_angles_3_nearest_enabled,
  preset_angles_4_preset_angle,preset_angles_4_nearest_enabled,preset_angles_5_preset_angle,preset_angles_5_nearest_enabled,
  preset_angles_6_preset_angle,preset_angles_6_nearest_enabled,preset_angles_7_preset_angle,preset_angles_7_nearest_enabled,
  preset_angles_8_preset_angle,preset_angles_8_nearest_enabled,preset_angles_9_preset_angle,preset_angles_9_nearest_enabled,
  preset_angles_10_preset_angle,preset_angles_10_nearest_enabled,preset_angles_11_preset_angle,preset_angles_11_nearest_enabled,
  preset_angles_12_preset_angle,preset_angles_12_nearest_enabled,preset_angles_13_preset_angle,preset_angles_13_nearest_enabled,
  preset_angles_14_preset_angle,preset_angles_14_nearest_enabled,preset_angles_15_preset_angle,preset_angles_15_nearest_enabled)
VALUES ($1::uuid,$2::text,$3::text,$4::timestamp,$5::INT,$6::FLOAT,$7::FLOAT,$8::text,
   $9::INT,$10::INT,$11::VARCHAR,$12::INT,$13::INT,$14::INT,$15::INT,
   $16::INT,$17::INT,$18::INT,$19::INT, 
   $20::INT,$21::INT,$22::INT,$23::INT,$24::INT,$25::INT,
   $26::INT,$27::BOOLEAN,$28::INT,$29::BOOLEAN,
   $30::INT,$31::BOOLEAN,$32::INT,$33::BOOLEAN,
   $34::INT,$35::BOOLEAN,$36::INT,$37::BOOLEAN,
   $38::INT,$39::BOOLEAN,$40::INT,$41::BOOLEAN,
   $42::INT,$43::BOOLEAN,$44::INT,$45::BOOLEAN,
   $46::INT,$47::BOOLEAN,$48::INT,$49::BOOLEAN,
   $50::INT,$51::BOOLEAN,$52::INT,$53::BOOLEAN,
   $54::INT,$55::BOOLEAN,$56::INT,$57::BOOLEAN)
`;

exports.addlatestRowConfigQuery = `
INSERT INTO terrasmart.row_controller_conf 
(row_controller_id, config_label,config_timestamp,timestamp,model_device,location_lat,location_lng,location_text,
  hardware_rev,firmware_rev,site_name,panel_horizontal_cal_angle,panel_min_cal_angle,panel_max_cal_angle,config_flags,
  segments_0_panel_array_width,segments_0_spacing_to_east,segments_0_spacing_to_west,segments_0_delta_height_east,
  segments_0_delta_height_west,segments_1_panel_array_width,segments_1_spacing_to_east,segments_1_spacing_to_west,segments_1_delta_height_east,segments_1_delta_height_west,
  preset_angles_0_preset_angle,preset_angles_0_nearest_enabled,preset_angles_1_preset_angle,preset_angles_1_nearest_enabled,
  preset_angles_2_preset_angle,preset_angles_2_nearest_enabled,preset_angles_3_preset_angle,preset_angles_3_nearest_enabled,
  preset_angles_4_preset_angle,preset_angles_4_nearest_enabled,preset_angles_5_preset_angle,preset_angles_5_nearest_enabled,
  preset_angles_6_preset_angle,preset_angles_6_nearest_enabled,preset_angles_7_preset_angle,preset_angles_7_nearest_enabled,
  preset_angles_8_preset_angle,preset_angles_8_nearest_enabled,preset_angles_9_preset_angle,preset_angles_9_nearest_enabled,
  preset_angles_10_preset_angle,preset_angles_10_nearest_enabled,preset_angles_11_preset_angle,preset_angles_11_nearest_enabled,
  preset_angles_12_preset_angle,preset_angles_12_nearest_enabled,preset_angles_13_preset_angle,preset_angles_13_nearest_enabled,
  preset_angles_14_preset_angle,preset_angles_14_nearest_enabled,preset_angles_15_preset_angle,preset_angles_15_nearest_enabled,
  swoc_required_duration, swoc_threshold, encoded_hard_limit_register, encoded_soft_limit_register,snow_sensor_height,wind_dir_offset)
VALUES ($1::uuid,$2::text,$3::text,$4::timestamp,$5::INT,$6::FLOAT,$7::FLOAT,$8::text,
   $9::INT,$10::INT,$11::VARCHAR,$12::INT,$13::INT,$14::INT,$15::INT,
   $16::INT,$17::INT,$18::INT,$19::INT, 
   $20::INT,$21::INT,$22::INT,$23::INT,$24::INT,$25::INT,
   $26::INT,$27::BOOLEAN,$28::INT,$29::BOOLEAN,
   $30::INT,$31::BOOLEAN,$32::INT,$33::BOOLEAN,
   $34::INT,$35::BOOLEAN,$36::INT,$37::BOOLEAN,
   $38::INT,$39::BOOLEAN,$40::INT,$41::BOOLEAN,
   $42::INT,$43::BOOLEAN,$44::INT,$45::BOOLEAN,
   $46::INT,$47::BOOLEAN,$48::INT,$49::BOOLEAN,
   $50::INT,$51::BOOLEAN,$52::INT,$53::BOOLEAN,
   $54::INT,$55::BOOLEAN,$56::INT,$57::BOOLEAN,
   $58::FLOAT,$59::FLOAT,$60::INT,$61::INT, $62::FLOAT, $63:: FLOAT)
`;
//This is used to update assets configUpdates
exports.configUpdateQuery = `
UPDATE terrasmart.asset
SET device_type_id = (
		SELECT device_type.id 
		FROM terrasmart.device_type
		WHERE reported_type = $1::INT
  ),
  location_lat = $2::FLOAT,
  location_lng = $3::FLOAT,
  location_text = $4::VARCHAR(256),
  hardware_rev_id = (
		SELECT hardware_rev.id 
		FROM terrasmart.hardware_rev
		WHERE terrasmart.hardware_rev.reported_rev = $5::INT
  ),
  firmware_rev_id = (
    SELECT firmware_rev.id 
		FROM terrasmart.firmware_rev
		WHERE terrasmart.firmware_rev.reported_ver = $6::INT
  ),
  has_weather_sensor = $7::Boolean,
  model_id = (
		SELECT model.id 
		FROM terrasmart.model
		WHERE terrasmart.model.reported_model = $8::INT
  )
WHERE asset.id = (
		SELECT radio.asset_id
		FROM terrasmart.radio
		WHERE radio.snap_addr = $9::bytea
)
`;

exports.device_type_query = `
SELECT device_type.id 
FROM terrasmart.device_type
WHERE device_type = $1::VARCHAR(256)`;

exports.device_type_insert_query = `
INSERT INTO terrasmart.device_type (device_type)
VALUES ($1::VARCHAR(128))`;

exports.model_result_query = `
SELECT model.id 
FROM terrasmart.model
WHERE terrasmart.model.model = $1::VARCHAR(128)`;

exports.model_insert_query = `
 INSERT INTO terrasmart.model (model)
 VALUES ($1::VARCHAR(128))`;

exports.hardware_rev_result_query = `
 SELECT hardware_rev.id 
 FROM terrasmart.hardware_rev
 WHERE terrasmart.hardware_rev.reported_rev = $1::INT`;

exports.firmware_rev_insert = `
 WITH
 firmware_rev_insert AS (
     INSERT INTO terrasmart.firmware_rev (display_ver, released, reported_ver) 
     VALUES ($1 :: VARCHAR, $2:: TIMESTAMP, $3 :: INT)
     RETURNING id AS id
   )
 SELECT id FROM firmware_rev_insert
 `;

exports.asset_firmware_rev_query = `
 SELECT * FROM terrasmart.asset
  INNER JOIN terrasmart.radio on radio.asset_id = asset."id" 
 WHERE asset.firmware_rev_id = $1 :: uuid
 AND radio.snap_addr = $2 :: bytea`;

exports.hardware_rev_insert = `
 WITH
 hardware_rev_insert AS (
     INSERT INTO terrasmart.hardware_rev (display_rev, released, reported_rev) 
     VALUES ($1 :: VARCHAR, $2:: TIMESTAMP, $3 :: INT)
     RETURNING id AS id
   )
 SELECT id FROM hardware_rev_insert
 `;

exports.asset_hardware_rev_query = `
SELECT * FROM terrasmart.asset
  INNER JOIN terrasmart.radio on radio.asset_id = asset."id" 
WHERE asset.hardware_rev_id = $1 :: uuid
AND radio.snap_addr = $2 :: bytea`;

exports.firmware_rev_result_query = `
SELECT firmware_rev.id 
FROM terrasmart.firmware_rev
WHERE terrasmart.firmware_rev.reported_ver = $1::INT`;

exports.assetQuery = `
SELECT asset.id as asset_id
FROM terrasmart.asset
  INNER JOIN terrasmart.radio ON asset.id = radio.asset_id
WHERE radio.snap_addr = $1::bytea AND asset.site_id IS NOT NULL 
`;
exports.assetInfoBySnapAddrQuery = `
SELECT asset.* FROM terrasmart.asset WHERE asset.snap_addr = $1::VARCHAR`;

exports.assetInfoQuery = `
SELECT 
  asset.*,
  site_layout.site_id,
  site_layout.individual_rc_status
FROM terrasmart.asset
  INNER JOIN terrasmart.radio ON asset.id = radio.asset_id
  LEFT JOIN terrasmart.site_layout ON asset.id = site_layout.asset_id
WHERE radio.snap_addr = $1::bytea
`;

exports.getAssetInfo = `
SELECT 
  asset.*,
  site_layout.site_id,
  site_layout.individual_rc_status,
  site_layout.individual_rc_cmd_state,
  site_layout.error_code,
  network_controller.aws_iot_principal_id AS principal_id

FROM terrasmart.asset
  INNER JOIN terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
  INNER JOIN terrasmart.radio ON asset.id = radio.asset_id
  LEFT JOIN terrasmart.site_layout ON asset.id = site_layout.asset_id
WHERE radio.snap_addr = $1::bytea
`;

exports.rowControllerInfo = `
SELECT row_controller.*
FROM terrasmart.row_controller
  INNER JOIN terrasmart.radio ON row_controller.asset_id = radio.asset_id
WHERE radio.snap_addr = $1::bytea
`;

exports.assetInfoByMotorId = `
SELECT asset.*
FROM terrasmart.asset
  INNER JOIN terrasmart.radio ON asset.id = radio.asset_id
WHERE radio.snap_addr = $1::bytea
`;

exports.panelInfo = `
SELECT panel.id FROM terrasmart.panel
WHERE panel.snap_addr = $1::VARCHAR
`;

exports.networkControllerById = `
SELECT asset_id, name
FROM terrasmart.network_controller
WHERE network_controller.id = $1 :: UUID
`;

exports.cellByNCId = `
 SELECT cell.* 
 FROM terrasmart.cell
 WHERE cell.network_controller_id = $1 :: uuid
 `;

exports.CellUptimeInsert = `
 INSERT INTO terrasmart.cell (network_controller_id,rssi_dbm,uptime,timestamp)
 VALUES ($1 :: UUID, $2 :: INT, $3 :: INTERVAL, $4 :: TIMESTAMP)
 `;

exports.UpdateCellTimeInfo = `
 UPDATE terrasmart.cell SET rssi_dbm = $1 :: INT, uptime = $2 :: INTERVAL, timestamp = $3 :: TIMESTAMP
 WHERE cell.network_controller_id = $4
 `;

exports.CellUptimeHist = `
 INSERT INTO terrasmart.cell_hist (rssi_dbm,uptime,timestamp,cell_id)
 VALUES ($1 :: INT, $2 :: INTERVAL, $3 :: TIMESTAMP,(SELECT cell.id FROM terrasmart.cell WHERE network_controller_id = $4 :: uuid))
 `;

exports.CellInfoInsert = `
INSERT INTO terrasmart.cell (network_controller_id,timestamp,imei,roaming,mdn,lan_ip,wan_ip,link_status,tx_data,rx_data,tower)
VALUES ($1::uuid, $2::timestamp,$3::varchar,$4::boolean,$5::varchar,$6::varchar,$7::varchar,$8::varchar,$9::int,$10::int,$11::varchar)
`;

exports.UpdateCellInfo = `
UPDATE terrasmart.cell SET timestamp = $2::timestamp, imei = $3::varchar, roaming = $4 :: boolean,mdn = $5 :: varchar,lan_ip = $6 :: varchar,wan_ip = $7 :: varchar,link_status = $8 :: varchar,tx_data = $9 :: int,rx_data = $10 :: int,tower = $11 :: varchar
WHERE cell.network_controller_id = $1
`;

exports.CellHistInsert = `
INSERT INTO terrasmart.cell_hist (timestamp,imei,roaming,mdn,lan_ip,wan_ip,link_status,tx_data,rx_data,tower,cell_id)
VALUES ($2::timestamp,$3::varchar,$4::boolean,$5::varchar,$6::varchar,$7::varchar,$8::varchar,$9::int,$10::int,$11::varchar,(SELECT cell.id FROM terrasmart.cell WHERE network_controller_id = $1 :: uuid))
`;

exports.radioInfo = `
SELECT * 
FROM terrasmart.radio 
WHERE radio.snap_addr = $1::bytea`;

exports.bridgeInfoUpdate = `UPDATE terrasmart.network_controller 
SET bridge_script_ver = $1::VARCHAR
WHERE network_controller.id = $2::UUID`;

exports.bridgeInfoInsert = `
INSERT INTO terrasmart.network_controller_connection_hist (bridge_script_ver,last_updated,network_controller_id)
VALUES ($1::VARCHAR,$2::TIMESTAMP,$3::UUID)`;

exports.updateIRCProgressStatus = `
UPDATE terrasmart.site_layout SET
  individual_rc_status=$1::INT,
  timestamp=$2,
  error_code=$3
WHERE asset_id=$4:: UUID
`;

exports.insertIRCLog = `
INSERT INTO terrasmart.irc_logs ( 
  id, error_code, command, status, timestamp, fw_timestamp, event, asset_id
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8
)`;

exports.getAssetNC = `SELECT
network_controller.asset_id AS nc_asset_id,
network_controller.aws_iot_principal_id AS principal_id,
asset.name AS name
FROM terrasmart.asset
INNER JOIN
terrasmart.network_controller
  ON asset.parent_network_controller_id = network_controller.id
WHERE asset.id = $1 :: uuid`;

exports.setLastActionCompletedToTrue = `
UPDATE terrasmart.site_layout SET

  last_action_completed=true

WHERE site_layout.asset_id = $1 :: uuid
`;

// Return the ROWS
exports.getActiveCommands = `
SELECT
  radio.snap_addr as asset_id,
  individual_rc_cmd_state AS cmd_state,
  individual_rc_previous_state AS last_state,
  individual_rc_previous_param AS last_preset,
  individual_rc_param AS param,
  individual_rc_status AS status,
  username,
  email
  
FROM
  terrasmart.site_layout
INNER JOIN terrasmart.radio ON site_layout.asset_id=radio.asset_id
WHERE
  site_id=$1 :: UUID AND
  individual_rc_status < 4 AND
  individual_rc_cmd_state != 0
`;

exports.hasLastCommandCompleted = `SELECT timestamp FROM terrasmart.irc_logs WHERE asset_id=$1 and timestamp > (
  SELECT  timestamp FROM terrasmart.irc_logs WHERE 
    asset_id=$1 AND event='IRC_COMMAND_ISSUED' 
      ORDER BY timestamp DESC
    LIMIT 1
) AND status=2 and command=$2; `;

exports.updateConfigVersionsQuery = `
INSERT INTO terrasmart.configured_versions (
  network_controller_id, timestamp, nc_version, nc_script_version, nc_radio_version, nc_stm32_version,
  nc_gas_guage_version, asset_script_version, asset_radio_version, asset_stm32_version, asset_gas_guage_version
  ) 
  VALUES ($1::UUID, $2::TIMESTAMP, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::VARCHAR, $7::VARCHAR,
  $8::VARCHAR, $9::VARCHAR, $10::VARCHAR, $11::VARCHAR
  )
  ON CONFLICT (network_controller_id) DO UPDATE 
    SET timestamp = excluded.timestamp, 
        nc_version = excluded.nc_version,
        nc_script_version = excluded.nc_script_version,
        nc_radio_version = excluded.nc_radio_version,
        nc_stm32_version = excluded.nc_stm32_version,
        nc_gas_guage_version = excluded.nc_gas_guage_version,
        asset_script_version = excluded.asset_script_version,
        asset_radio_version = excluded.asset_radio_version,
        asset_stm32_version = excluded.asset_stm32_version,
        asset_gas_guage_version = excluded.asset_gas_guage_version
        WHERE configured_versions.timestamp < excluded.timestamp;`;

exports.addConfigVersionsHistQuery = `
INSERT INTO terrasmart.configured_versions_hist (
  network_controller_id, timestamp, nc_version, nc_script_version, nc_radio_version, nc_stm32_version,
  nc_gas_guage_version, asset_script_version, asset_radio_version, asset_stm32_version, asset_gas_guage_version
  ) 
  VALUES ($1::UUID, $2::TIMESTAMP, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::VARCHAR, $7::VARCHAR,
  $8::VARCHAR, $9::VARCHAR, $10::VARCHAR, $11::VARCHAR
  )
`;

exports.addRadioConfigInfoQuery = `WITH radio_config_insert AS (INSERT INTO terrasmart.radio_conf (radio_id,channel,nid,timestamp)
VALUES ($1::UUID,$2::INTEGER,$3::VARCHAR,$4::TIMESTAMP) RETURNING id AS id) SELECT id FROM radio_config_insert`;

exports.addChargerInfoQuery = `WITH charger_insert AS
        (INSERT INTO terrasmart.charger
        (asset_id,voltage,current)
        VALUES ($1 ::UUID, $2 :: FLOAT, $3 :: FLOAT)
        RETURNING id)`;

exports.getChargerByAssetId = `SELECT * FROM terrasmart.charger WHERE asset_id = $1 :: UUID`;

exports.fasttrakInfoByAssetIdAndTrackingStatusQuery = `
SELECT * FROM terrasmart.asset_fasttrak_info
WHERE asset_id = $1::UUID AND tracking_status = $2`;

exports.updateFastTrackPlus60StopQuery = `
UPDATE terrasmart.asset_fasttrak_info set plus_60_stop = $1::TIMESTAMP, current_state = NULL
WHERE id = $2::UUID AND tracking_status = $3`;

exports.updateFastTrakPlus60StartStopQuery = `
UPDATE terrasmart.asset_fasttrak_info set plus_60_start = $1::TIMESTAMP, plus_60_stop = NULL, current_state = 'p60'
WHERE id = $2::UUID  AND tracking_status = $3`;

exports.updateFastTrakPlus60StartStopTimeQuery = `
UPDATE terrasmart.asset_fasttrak_info set plus_60_start = $1::TIMESTAMP, plus_60_stop = $2::TIMESTAMP, current_state = NULL
WHERE id = $3::UUID  AND tracking_status = $4`;

exports.updateFastTrackMin60StopQuery = `
UPDATE terrasmart.asset_fasttrak_info set min_60_stop = $1::TIMESTAMP, current_state = NULL
WHERE id = $2::UUID  AND tracking_status = $3`;

exports.updateFastTrakMin60StartStopQuery = `
UPDATE terrasmart.asset_fasttrak_info set min_60_start = $1::TIMESTAMP, min_60_stop = NULL, current_state = 'm60'
WHERE id = $2::UUID  AND tracking_status = $3`;

exports.updateFastTrakMin60StartStopTimeQuery = `
UPDATE terrasmart.asset_fasttrak_info set min_60_start = $1::TIMESTAMP, min_60_stop = $2::TIMESTAMP, current_state = NULL
WHERE id = $3::UUID  AND tracking_status = $4`;

exports.addFastTrackPlus60StartQuery = `
WITH asset_fasttrak_info_insert AS (
  INSERT INTO terrasmart.asset_fasttrak_info (asset_id,last_updated,plus_60_start, tracking_status,current_state,snap_addr)
  VALUES ($1::UUID,$2::TIMESTAMP,$3::TIMESTAMP, $4,'p60',$5::VARCHAR)
Returning asset_fasttrak_info.id as id,asset_fasttrak_info.tracking_status as tracking_status
) 
INSERT INTO terrasmart.fasttrak_detail (asset_fasttrak_info_id,tracking_status)
SELECT id,tracking_status from asset_fasttrak_info_insert
`;
exports.resetFastTrakDetail = (anlgeType) => {
  return `UPDATE terrasmart.fasttrak_detail SET
  ${anlgeType}_peak_motor_inrush_current = 0,
  ${anlgeType}_peak_motor_current = 0,
  ${anlgeType}_average_motor_current = 0
   WHERE asset_fasttrak_info_id = $1::UUID`;
}
exports.addFastTrackMin60StartQuery = `
WITH asset_fasttrak_info_insert AS (
  INSERT INTO terrasmart.asset_fasttrak_info 
	(asset_id,last_updated,min_60_start, tracking_status,current_state,snap_addr)
  VALUES ($1::UUID,$2::TIMESTAMP,$3::TIMESTAMP, $4, 'm60',$5::VARCHAR)
Returning asset_fasttrak_info.id as id,asset_fasttrak_info.tracking_status as tracking_status
) INSERT INTO terrasmart.fasttrak_detail (asset_fasttrak_info_id,tracking_status)
SELECT id,tracking_status from asset_fasttrak_info_insert`;

exports.getSiteConfByAssetIdQuery = `
SELECT site_conf.id, site_conf.site_id 
FROM terrasmart.site_conf 
INNER JOIN terrasmart.asset on asset.site_id = site_conf.site_id 
WHERE asset.id = $1 :: UUID`;

exports.updateSiteConfQuery = `
UPDATE terrasmart.site_conf SET contact = $1 :: VARCHAR, organization = $2 :: VARCHAR,
location_lat = $3::FLOAT, location_lng = $4 :: FLOAT, gps_alt = $5 :: FLOAT, enable_nightly_shutdown = $6 :: BOOLEAN,
power_off = $7 :: INT, power_on = $8 :: INT, enable_low_power_shutdown = $9 :: BOOLEAN,
cell_modem_warning_voltage =  $10 :: FLOAT, cell_modem_cutoff_voltage = $11 :: FLOAT, cell_modem_cuton_voltage  = $12 :: FLOAT,
gateway_warning_voltage = $13 :: FLOAT, gateway_cutoff_voltage  = $14 :: FLOAT, wind_speed_threshold = $15 :: FLOAT,
gust_threshold = $16 :: FLOAT, snow_depth_threshold = $17 :: FLOAT, panel_snow_depth_threshold = $18 :: FLOAT,
enable_wind_speed_stow = $19 :: BOOLEAN, enable_wind_gust_stow = $20 :: BOOLEAN, enable_snow_depth_stow = $21 :: BOOLEAN,
enable_panel_snow_depth_stow = $22 :: BOOLEAN, minimum_stations_required = $23 :: INT, wind_speed_duration_required = $24 :: FLOAT,
resume_tracking_after_wind_timeout = $25 :: FLOAT, resume_tracking_after_snow_timeout = $26 :: FLOAT,
resume_tracking_after_panel_snow_timeout = $27 :: FLOAT, enable_snow_depth_averaging  = $28 :: BOOLEAN,
enable_panel_snow_depth_averaging = $29 :: BOOLEAN, wind_reporting_close_percentage = $30 :: INT,
wind_reporting_close_interval = $31 :: INT, wind_reporting_over_interval = $32 :: INT,
snow_reporting_close_percentage  = $33 :: INT, snow_reporting_close_interval = $34 :: INT, snow_reporting_over_interval = $35 :: INT,
enter_diffuse_mode_duration = $36 :: FLOAT,exit_diffuse_mode_duration = $37 :: FLOAT, enable_diffuse_mode = $38 :: BOOLEAN,
enable_too_cold_to_move_stow = $39::BOOLEAN, too_cold_to_move_stow_temp_threshold = $40::FLOAT,
too_cold_to_move_stow_temp_low_threshold = $41::FLOAT, resume_tracking_after_too_cold_to_move_timeout = $42::FLOAT, enable_specfile_from_slui = $43::BOOLEAN,
site_type = $44::VARCHAR, enable_snow_shedding = $45::BOOLEAN, snow_shedding_threshold = $46::FLOAT, snow_shedding_duration = $47::FLOAT, median_filter_length = $48::INT, stow_logic = $49
WHERE site_conf.id = $50 :: UUID
`;

exports.updateLastSleepModeQuery = `UPDATE terrasmart.network_controller SET last_sleep_mode_update = $1 :: TIMESTAMP, wake_up_time = $2 :: VARCHAR WHERE id = $3 :: UUID`;

exports.addSleepModeHistQuery = `INSERT INTO terrasmart.network_controller_connection_hist (last_sleep_mode_update,wake_up_time,last_updated,network_controller_id) VALUES ($1 :: TIMESTAMP,$2 :: VARCHAR,$3 :: TIMESTAMP, $4 :: UUID)`;

exports.updateSolarInfoQuery = `UPDATE terrasmart.network_controller SET last_sleep_mode_update = $1 :: TIMESTAMP, wake_up_time = $2 :: VARCHAR, sunrise = $3 :: TIMESTAMP, sunset = $4 :: TIMESTAMP
WHERE id = $5 :: UUID`;

exports.addSolarInfoHistQuery = `
INSERT INTO terrasmart.network_controller_connection_hist (last_sleep_mode_update,wake_up_time,sunrise,sunset,last_updated,network_controller_id)
VALUES ($1 :: TIMESTAMP,$2 :: VARCHAR,$3 ::TIMESTAMP, $4:: TIMESTAMP,$5 :: TIMESTAMP, $6 :: UUID)
`;

exports.updateStartupInfoQuery = `UPDATE terrasmart.network_controller SET fw_version = $1 :: VARCHAR, nccb_uptime = $2 :: INTERVAL, linux_uptime = $3 :: INTERVAL, application_uptime = $4 :: INTERVAL, last_updated = $5 :: TIMESTAMP WHERE id = $6 :: UUID`;

exports.addStartupInfoHistQuery = `INSERT INTO terrasmart.network_controller_connection_hist (fw_version, nccb_uptime, linux_uptime, application_uptime, last_updated, network_controller_id) VALUES ($1 :: VARCHAR,$2 :: INTERVAL,$3 :: INTERVAL, $4 :: INTERVAL, $5 :: TIMESTAMP, $6 :: UUID)`;

exports.updateWeatherConfigUpdateQuery = `
UPDATE terrasmart.site_conf SET wind_speed_threshold = $1 :: FLOAT, gust_threshold = $2 :: FLOAT,
snow_depth_threshold = $3 :: FLOAT, panel_snow_depth_threshold = $4 :: FLOAT WHERE site_conf.id = $5 :: UUID
`;

exports.addWeatherStowInfoQuery = `
INSERT INTO terrasmart.network_controller_weather_hist (network_controller_id,timestamp,stow_type,stow_value,stow_threshold)
VALUES ($1 :: UUID, $2 :: TIMESTAMP, $3::INT, $4 :: FLOAT,$5::FLOAT)`;


exports.update_fasttrak_detail_query = (current_state, type) => {
  return `UPDATE terrasmart.fasttrak_detail 
  SET ${current_state}_${type} = $1::FLOAT
  FROM terrasmart.rack
  WHERE asset_fasttrak_info_id = $2::UUID 
  AND ${current_state}_${type} < $3::FLOAT
  AND rack.current_angle < 58.0
  AND rack.current_angle > -58.0
  AND fasttrak_detail.tracking_status = $4::INT
  AND rack.snap_addr = $5::VARCHAR`;
}

exports.activeAssetFasttrakInfo =
  `SELECT *
FROM terrasmart.asset_fasttrak_info
WHERE asset_fasttrak_info.asset_id = $1::UUID 
AND asset_fasttrak_info.current_state IS NOT NULL    
`;

exports.updateFasttrakCurrentState =
  `UPDATE terrasmart.asset_fasttrak_info SET current_state = NULL
WHERE asset_id = $1::UUID AND current_state IS NOT NULL`;

exports.addFasttrakDetail =
  `INSERT INTO terrasmart.fasttrak_detail (asset_fasttrak_info_id,tracking_status)
VALUES ($1::UUID, $2::INT);
`;

exports.updateEStopEngageAt = ` 
UPDATE terrasmart.network_controller SET last_estop_engage_at = $2 :: TIMESTAMP 
WHERE network_controller.id = $1 :: UUID AND (last_estop_engage_at IS NULL OR $2 > last_estop_engage_at :: TIMESTAMP)`;

exports.updateEStopDisengageAt = ` 
UPDATE terrasmart.network_controller SET last_estop_disengage_at = $2 :: TIMESTAMP
WHERE network_controller.id = $1 :: UUID AND (last_estop_disengage_at IS NULL OR $2 > last_estop_disengage_at :: TIMESTAMP)`;

exports.updateFasttrakReport = `
UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP,
current_state = $2::VARCHAR, max_peak_motor_inrush_current = $3::FLOAT, max_peak_motor_current = $4::FLOAT,
max_average_motor_current = $5::FLOAT, plus60_complete = true, status_bits = $6::INTEGER, label = $7::VARCHAR,
user_name = $8::VARCHAR, user_email = $9::VARCHAR, minus60_complete = true
WHERE snap_addr = $10::VARCHAR AND last_updated < $1::TIMESTAMP`;

exports.updateFasttrakState = `
UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP, current_state = $2::VARCHAR,
max_peak_motor_inrush_current = $3::FLOAT, max_peak_motor_current = $4::FLOAT,
max_average_motor_current = $5::FLOAT,status_bits = $6::INTEGER, 
label = CASE WHEN label IS NULL THEN $7::VARCHAR ELSE label END,
user_name = $8::VARCHAR, user_email = $9::VARCHAR
WHERE snap_addr = $10::VARCHAR AND last_updated < $1::TIMESTAMP AND end_time IS NULL`;

exports.updateFasttrakStateAndQcStartTime = `
UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP, start_time_qc = $1::TIMESTAMP,
current_state = $2::VARCHAR, max_peak_motor_inrush_current = $3::FLOAT, max_peak_motor_current = $4::FLOAT,
max_average_motor_current = $5::FLOAT,status_bits = $6::INTEGER, label = $7::VARCHAR,
user_name = $8::VARCHAR, user_email = $9::VARCHAR
WHERE snap_addr = $10::VARCHAR AND last_updated < $1::TIMESTAMP`;

exports.addFasttrakReport = `
INSERT INTO terrasmart.fasttrak (snap_addr,tracking_status,last_updated,start_time,end_time,is_in_construction)
VALUES ($1::VARCHAR, $2::INT, $3::TIMESTAMP, $4::TIMESTAMP,NULL,$5::BOOLEAN)
ON CONFLICT(snap_addr) DO UPDATE
SET tracking_status = excluded.tracking_status,
    last_updated = excluded.last_updated,
    start_time = excluded.start_time,
    end_time = NULL,
    max_peak_motor_inrush_current = 0,
    max_peak_motor_current = 0,
    max_average_motor_current = 0,
    plus60_complete = NULL,
    minus60_complete = NULL,
    current_state = NULL,
    start_time_qc = NULL,
    is_in_construction = excluded.is_in_construction,
    status_bits = NULL,
    label = NULL,
    user_name = NULL,
    user_email = NULL
    `;

exports.getProjectConstructionStatus = `SELECT project.is_in_construction FROM terrasmart.project
LEFT JOIN terrasmart.site ON site.project_id = project.id
LEFT JOIN terrasmart.asset ON asset.site_id = site.id
LEFT JOIN terrasmart.network_controller ON network_controller.asset_id = asset.id
LEFT JOIN terrasmart.asset child_asset ON child_asset.parent_network_controller_id = network_controller.id
WHERE child_asset.snap_addr = $1::VARCHAR`;

exports.updateFasttrakReportEndTime = `
UPDATE terrasmart.fasttrak set end_time = $2::TIMESTAMP
WHERE snap_addr = $1::VARCHAR`;

exports.updateFasttrakCompletedStatus = (anlgeType, status) => {
  return status === false ?
    `UPDATE terrasmart.fasttrak 
  SET ${anlgeType === 60 ? 'plus60' : 'minus60'}_complete = ${status},
   last_updated = $1::TIMESTAMP,
   start_time_qc = (
     CASE 
      WHEN start_time_qc IS NULL THEN $1::TIMESTAMP
      ELSE start_time_qc
     END
      )
  WHERE snap_addr = $2::VARCHAR AND last_updated < $1::TIMESTAMP`:
    `UPDATE terrasmart.fasttrak 
  SET ${anlgeType === 60 ? 'plus60' : 'minus60'}_complete = ${status},
   last_updated = $1::TIMESTAMP 
  WHERE snap_addr = $2::VARCHAR AND ${anlgeType === 60 ? 'plus60' : 'minus60'}_complete = false AND last_updated < $1::TIMESTAMP`;
}
exports.addFasttrakHist = `
INSERT INTO terrasmart.fasttrak_hist (
SELECT * FROM terrasmart.fasttrak where fasttrak.snap_addr = $1::VARCHAR)`;
exports.updateFasttrakCurrentReport = (currentType) => {
  return `
  UPDATE terrasmart.fasttrak SET max_${currentType} = $1:: FLOAT 
  WHERE max_${currentType} < $1:: FLOAT
    AND snap_addr= $2:: VARCHAR
    AND (plus60_complete IS NOT NULL OR minus60_complete IS NOT NULL)
    AND end_time IS NULL`;
}
