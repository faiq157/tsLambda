const { getKeysAndValues } = require("../../utils/helpers/functions");

const { exeQuery, updateQueryHelper } = require("../../utils/lib/pg");

module.exports.setAccuWeatherProjectFlag = (siteId, isEnable) => {
  return exeQuery(
    `UPDATE terrasmart.project 
    SET enable_weather_forecast = $2::Boolean
    WHERE id = (SELECT project_id from terrasmart.site WHERE site.id = $1::UUID)`,
    [siteId, isEnable]
  );
}

module.exports.getNetworkControllerByAssetId = (id) => {
  return exeQuery(
    'SELECT * FROM  terrasmart.network_controller WHERE asset_id = $1::UUID',
    [id]
  );
}

module.exports.removeAssetConf = (snapAddr) => {
  return exeQuery(
    'delete FROM terrasmart.asset_conf WHERE snap_addr = $1::VARCHAR',
    [snapAddr]
  );
}

module.exports.removeAssetHistoryBySnapAddr = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.asset_history WHERE snap_addr = $1::CHAR(6)',
    [snapAddr]
  );
}

module.exports.getAllAssetHistoryBySnapAddr = (snapAddr) => {
  return exeQuery(
    `SELECT snap_addr, CAST(EXTRACT(epoch FROM timestamp) AS BIGINT) AS timestamp, data 
    FROM terrasmart.asset_history WHERE snap_addr = $1::CHAR(6)`,
    [snapAddr]
  );
}

module.exports.removetrackingCommandHist = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.tracking_command_hist WHERE network_controller_id = $1::uuid',
    [snapAddr]
  );
}

module.exports.getTrackingModeHistory = (networkControllerId) => {
  return exeQuery(
    'SELECT * FROM  terrasmart.tracking_command_hist ' +
    'WHERE network_controller_id = $1::UUID ORDER BY changed_at DESC LIMIT 1',
    [networkControllerId]
  );
}

module.exports.getPanelHistory = (snapAddr) => {
  const query = `
    SELECT * FROM terrasmart.asset_history
    WHERE 
      snap_addr = $1 AND
      data -> 'panel.voltage' IS NOT NULL 
  `;
  return exeQuery(query, [snapAddr]);
};

module.exports.getChargerHistory = (snapAddr) => {
  const query = `
    SELECT * FROM terrasmart.asset_history
    WHERE 
      snap_addr = $1 AND
      data -> 'charger.voltage' IS NOT NULL 
  `;
  return exeQuery(query, [snapAddr]);
};

module.exports.getMotorHistory = (snapAddr) => {
  return exeQuery(`
    SELECT * FROM terrasmart.asset_history WHERE data -> 'motor.peak_current' IS NOT NULL AND snap_addr = $1
  `, [snapAddr]);
};


module.exports.getAssetHistory = (snapAddr) => {
  return exeQuery(
    `SELECT * FROM  terrasmart.asset_history
      WHERE snap_addr = $1
      ORDER BY timestamp`,
    [snapAddr]
  );
}

module.exports.getAssetHistoryBySnapAddr = (snapAddr) => {
  return exeQuery(
    'SELECT snap_addr, EXTRACT(epoch FROM timestamp) AS timestamp, data ' +
    'FROM  terrasmart.asset_history WHERE snap_addr = $1',
    [snapAddr]
  );
}

module.exports.getAssetBySnapAddress = (snapAddr) => {
  return exeQuery(
    'SELECT * FROM  terrasmart.asset ' +
    'WHERE snap_addr = $1',
    [snapAddr]
  );
}

exports.resetNCLastActivityTimeBySec = (id, interval) => {
  return exeQuery(
    'UPDATE terrasmart.network_controller ' +
    "SET last_updated = CURRENT_TIMESTAMP - INTERVAL '1 second' * $1 " +
    'WHERE id = $2::UUID',
    [interval, id]
  );
}

exports.updateNetworkController = (id, args) => {
  const { valuesToSet, values } = updateQueryHelper(args);
  return exeQuery(
    `UPDATE terrasmart.network_controller SET ${valuesToSet} ` +
    `WHERE id = $${values.length + 1}::UUID `,
    [...values, id]
  );
}

exports.insertFasttrak = (snap_addr, tracking_status) => {
  return exeQuery(`
    INSERT INTO terrasmart.fasttrak (snap_addr, tracking_status)
    VALUES ($1, $2)
    ON CONFLICT (snap_addr) DO NOTHING
  `, [snap_addr, tracking_status]);
};

exports.updateAssetConf = (configUpdate) => {
  const query = `INSERT INTO terrasmart.asset_conf 
(snap_addr,config_label,config_timestamp,timestamp,model_device,location_lat,location_lng,location_text,
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
VALUES ($1::VARCHAR,$2::text,$3::text,$4::timestamp,$5::INT,$6::FLOAT,$7::FLOAT,$8::text,
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
 
 ON CONFLICT (snap_addr) DO UPDATE 
  SET config_label = excluded.config_label,
  config_timestamp = excluded.config_timestamp,
  timestamp = excluded.timestamp,
  model_device = excluded.model_device,
  location_lat = excluded.location_lat,
  location_lng = excluded.location_lng,
  location_text = excluded.location_text,
  hardware_rev = excluded.hardware_rev,
  firmware_rev = excluded.firmware_rev,
  site_name = excluded.site_name,
  panel_horizontal_cal_angle = excluded.panel_horizontal_cal_angle,
  panel_min_cal_angle = excluded.panel_min_cal_angle,
  panel_max_cal_angle = excluded.panel_max_cal_angle,
  config_flags = excluded.config_flags,
  segments_0_panel_array_width = excluded.segments_0_panel_array_width,
  segments_0_spacing_to_east = excluded.segments_0_spacing_to_east,
  segments_0_spacing_to_west = excluded.segments_0_spacing_to_west,
  segments_0_delta_height_east = excluded.segments_0_delta_height_east,
  segments_0_delta_height_west = excluded.segments_0_delta_height_west,
  segments_1_panel_array_width = excluded.segments_1_panel_array_width,
  segments_1_spacing_to_east = excluded.segments_1_spacing_to_east,
  segments_1_spacing_to_west = excluded.segments_1_spacing_to_west,
  segments_1_delta_height_east = excluded.segments_1_delta_height_east,
  segments_1_delta_height_west = excluded.segments_1_delta_height_west,
  preset_angles_0_preset_angle = excluded.preset_angles_0_preset_angle,
  preset_angles_0_nearest_enabled = excluded.preset_angles_0_nearest_enabled,
  preset_angles_1_preset_angle = excluded.preset_angles_1_preset_angle,
  preset_angles_1_nearest_enabled = excluded.preset_angles_1_nearest_enabled,
  preset_angles_2_preset_angle = excluded.preset_angles_2_preset_angle,
  preset_angles_2_nearest_enabled = excluded.preset_angles_2_nearest_enabled,
  preset_angles_3_preset_angle = excluded.preset_angles_3_preset_angle,
  preset_angles_3_nearest_enabled = excluded.preset_angles_3_nearest_enabled,
  preset_angles_4_preset_angle = excluded.preset_angles_4_preset_angle,
  preset_angles_4_nearest_enabled = excluded.preset_angles_4_nearest_enabled,
  preset_angles_5_preset_angle = excluded.preset_angles_5_preset_angle,
  preset_angles_5_nearest_enabled = excluded.preset_angles_5_nearest_enabled,
  preset_angles_6_preset_angle = excluded.preset_angles_6_preset_angle,
  preset_angles_6_nearest_enabled = excluded.preset_angles_6_nearest_enabled,
  preset_angles_7_preset_angle = excluded.preset_angles_7_preset_angle,
  preset_angles_7_nearest_enabled = excluded.preset_angles_7_nearest_enabled,
  preset_angles_8_preset_angle = excluded.preset_angles_8_preset_angle,
  preset_angles_8_nearest_enabled = excluded.preset_angles_8_nearest_enabled,
  preset_angles_9_preset_angle = excluded.preset_angles_9_preset_angle,
  preset_angles_9_nearest_enabled = excluded.preset_angles_9_nearest_enabled,
  preset_angles_10_preset_angle = excluded.preset_angles_10_preset_angle,
  preset_angles_10_nearest_enabled = excluded.preset_angles_10_nearest_enabled,
  preset_angles_11_preset_angle = excluded.preset_angles_11_preset_angle,
  preset_angles_11_nearest_enabled = excluded.preset_angles_11_nearest_enabled,
  preset_angles_12_preset_angle = excluded.preset_angles_12_preset_angle,
  preset_angles_12_nearest_enabled = excluded.preset_angles_12_nearest_enabled,
  preset_angles_13_preset_angle = excluded.preset_angles_13_preset_angle,
  preset_angles_13_nearest_enabled = excluded.preset_angles_13_nearest_enabled,
  preset_angles_14_preset_angle = excluded.preset_angles_14_preset_angle,
  preset_angles_14_nearest_enabled = excluded.preset_angles_14_nearest_enabled,
  preset_angles_15_preset_angle = excluded.preset_angles_15_preset_angle,
  preset_angles_15_nearest_enabled = excluded.preset_angles_15_nearest_enabled,
  swoc_required_duration = excluded.swoc_required_duration,
  swoc_threshold = excluded.swoc_threshold,
  encoded_hard_limit_register = excluded.encoded_hard_limit_register,
  encoded_soft_limit_register = excluded.encoded_soft_limit_register,
  snow_sensor_height = excluded.snow_sensor_height,
  wind_dir_offset = excluded.wind_dir_offset`;
  console.log(query, [
    Buffer.from(configUpdate.snapAddr, "base64").toString("hex"),
    configUpdate.configLabel,
    configUpdate.configTimestamp,
    new Date(),
    configUpdate.modelDevice,  // Row Box
    configUpdate.locationLat,
    configUpdate.locationLng,
    configUpdate.locationText,
    configUpdate.hardwareRev,
    configUpdate.firmwareRev,
    configUpdate.siteName,
    configUpdate.panelHorizontalCalAngle,
    configUpdate.panelMinCalAngle,
    configUpdate.panelMaxCalAngle,
    configUpdate.configFlags,
    configUpdate.segments0PanelArrayWidth,
    configUpdate.segments0SpacingToEast,
    configUpdate.segments0SpacingToWest,
    configUpdate.segments0DeltaHeightEast,
    configUpdate.segments0DeltaHeightWest,
    configUpdate.segments1PanelArrayWidth,
    configUpdate.segments1SpacingToEast,
    configUpdate.segments1SpacingToWest,
    configUpdate.segments1DeltaHeightEast,
    configUpdate.segments1DeltaHeightWest,
    configUpdate.presetAngles0PresetAngle,
    configUpdate.presetAngles0NearestEnabled,
    configUpdate.presetAngles1PresetAngle,
    configUpdate.presetAngles1NearestEnabled,
    configUpdate.presetAngles2PresetAngle,
    configUpdate.presetAngles2NearestEnabled,
    configUpdate.presetAngles3PresetAngle,
    configUpdate.presetAngles3NearestEnabled,
    configUpdate.presetAngles4PresetAngle,
    configUpdate.presetAngles4NearestEnabled,
    configUpdate.presetAngles5PresetAngle,
    configUpdate.presetAngles5NearestEnabled,
    configUpdate.presetAngles6PresetAngle,
    configUpdate.presetAngles6NearestEnabled,
    configUpdate.presetAngles7PresetAngle,
    configUpdate.presetAngles7NearestEnabled,
    configUpdate.presetAngles8PresetAngle,
    configUpdate.presetAngles8NearestEnabled,
    configUpdate.presetAngles9PresetAngle,
    configUpdate.presetAngles9NearestEnabled,
    configUpdate.presetAngles10PresetAngle,
    configUpdate.presetAngles10NearestEnabled,
    configUpdate.presetAngles11PresetAngle,
    configUpdate.presetAngles11NearestEnabled,
    configUpdate.presetAngles12PresetAngle,
    configUpdate.presetAngles12NearestEnabled,
    configUpdate.presetAngles13PresetAngle,
    configUpdate.presetAngles13NearestEnabled,
    configUpdate.presetAngles14PresetAngle,
    configUpdate.presetAngles14NearestEnabled,
    configUpdate.presetAngles15PresetAngle,
    configUpdate.presetAngles15NearestEnabled,
    configUpdate.swocRequiredDuration,
    configUpdate.swocThreshold,
    configUpdate.encodedHardLimitRegister,
    configUpdate.encodedSoftLimitRegister,
    configUpdate.snow_sensor_height,
    configUpdate.wind_dir_offset]);
  return exeQuery(query, [
    Buffer.from(configUpdate.snapAddr, "base64").toString("hex"),
    configUpdate.configLabel,
    configUpdate.configTimestamp,
    new Date(),
    configUpdate.modelDevice,  // Row Box
    configUpdate.locationLat,
    configUpdate.locationLng,
    configUpdate.locationText,
    configUpdate.hardwareRev,
    configUpdate.firmwareRev,
    configUpdate.siteName,
    configUpdate.panelHorizontalCalAngle,
    configUpdate.panelMinCalAngle,
    configUpdate.panelMaxCalAngle,
    configUpdate.configFlags,
    configUpdate.segments0PanelArrayWidth,
    configUpdate.segments0SpacingToEast,
    configUpdate.segments0SpacingToWest,
    configUpdate.segments0DeltaHeightEast,
    configUpdate.segments0DeltaHeightWest,
    configUpdate.segments1PanelArrayWidth,
    configUpdate.segments1SpacingToEast,
    configUpdate.segments1SpacingToWest,
    configUpdate.segments1DeltaHeightEast,
    configUpdate.segments1DeltaHeightWest,
    configUpdate.presetAngles0PresetAngle,
    configUpdate.presetAngles0NearestEnabled,
    configUpdate.presetAngles1PresetAngle,
    configUpdate.presetAngles1NearestEnabled,
    configUpdate.presetAngles2PresetAngle,
    configUpdate.presetAngles2NearestEnabled,
    configUpdate.presetAngles3PresetAngle,
    configUpdate.presetAngles3NearestEnabled,
    configUpdate.presetAngles4PresetAngle,
    configUpdate.presetAngles4NearestEnabled,
    configUpdate.presetAngles5PresetAngle,
    configUpdate.presetAngles5NearestEnabled,
    configUpdate.presetAngles6PresetAngle,
    configUpdate.presetAngles6NearestEnabled,
    configUpdate.presetAngles7PresetAngle,
    configUpdate.presetAngles7NearestEnabled,
    configUpdate.presetAngles8PresetAngle,
    configUpdate.presetAngles8NearestEnabled,
    configUpdate.presetAngles9PresetAngle,
    configUpdate.presetAngles9NearestEnabled,
    configUpdate.presetAngles10PresetAngle,
    configUpdate.presetAngles10NearestEnabled,
    configUpdate.presetAngles11PresetAngle,
    configUpdate.presetAngles11NearestEnabled,
    configUpdate.presetAngles12PresetAngle,
    configUpdate.presetAngles12NearestEnabled,
    configUpdate.presetAngles13PresetAngle,
    configUpdate.presetAngles13NearestEnabled,
    configUpdate.presetAngles14PresetAngle,
    configUpdate.presetAngles14NearestEnabled,
    configUpdate.presetAngles15PresetAngle,
    configUpdate.presetAngles15NearestEnabled,
    configUpdate.swocRequiredDuration,
    configUpdate.swocThreshold,
    configUpdate.encodedHardLimitRegister,
    configUpdate.encodedSoftLimitRegister,
    configUpdate.snow_sensor_height,
    configUpdate.wind_dir_offset])
}

exports.removeAssetConfig = (snapAddr) => {
  return exeQuery(`DELETE FROM terrasmart.asset_conf WHERE snap_addr = $1::VARCHAR`, [snapAddr]);
}

// delete asset, rack, charger, battery, network controller
exports.removeChargerBatteryLink = (chargerId, batteryId) => {
  return exeQuery(
    'DELETE FROM terrasmart.charger_battery ' +
    'WHERE charger_id = $1::UUID AND battery_id = $2::UUID ',
    [chargerId, batteryId]
  );
}

exports.removeBattery = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.battery ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr]
  );
}

exports.removeRack = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.rack ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr]
  );
}

exports.removeMotor = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.motor ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr]
  );
}

exports.removeRowController = (assetId) => {
  return exeQuery(
    'DELETE FROM terrasmart.row_controller ' +
    'WHERE asset_id = $1::uuid',
    [assetId]
  );
}

exports.removeCharger = (assetId) => {
  return exeQuery(
    'DELETE FROM terrasmart.charger ' +
    'WHERE asset_id = $1::uuid',
    [assetId]
  );
}

exports.removePanel = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.panel ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr]
  );
}

exports.removeRadioInfo = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.radio ' +
    "WHERE snap_addr = decode($1::char(6), 'hex');",
    [snapAddr]
  );
}

exports.removeAsset = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.asset ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr]
  );
}

exports.removeNetworkControllerByAssetId = (assetId) => {
  return exeQuery(
    'DELETE FROM terrasmart.network_controller ' +
    'WHERE asset_id = $1::UUID',
    [assetId]
  );
}

exports.updateAsset = (id, args) => {
  const { valuesToSet, values } = updateQueryHelper(args);
  return exeQuery(
    `UPDATE terrasmart.asset SET ${valuesToSet} ` +
    `WHERE id = $${values.length + 1}::UUID `,
    [...values, id]
  );
}

exports.updateBatteryBySnapAddr = (snapAddr, args) => {
  const { valuesToSet, values } = updateQueryHelper(args);
  return exeQuery(
    `UPDATE terrasmart.battery SET ${valuesToSet} ` +
    `WHERE snap_addr = $${values.length + 1} `,
    [...values, snapAddr]
  );
}

exports.getAssetLinkedEntitiesIds = (isNC, snapAddr) => {
  let queryPart1 = '';
  let queryPart2 = '';
  if (!isNC) {
    queryPart1 = `
      r.id AS rack_id,
      m.id AS motor_id,
    `;
    queryPart2 = `
      INNER JOIN terrasmart.rack r ON r.snap_addr = a.snap_addr
      INNER JOIN terrasmart.motor m ON m.snap_addr = a.snap_addr
    `;
  }
  const query = `
    SELECT 
      a.id AS asset_id,
      c.id AS charger_id,
      b.id AS battery_id,
      p.id AS panel_id,
      ${queryPart1}
      ra.id AS radio_id
    FROM terrasmart.asset a 
      INNER JOIN terrasmart.charger c ON c.asset_id = a.id
      INNER JOIN terrasmart.battery b ON b.snap_addr = a.snap_addr
      INNER JOIN terrasmart.panel p ON p.snap_addr = a.snap_addr
      INNER JOIN terrasmart.radio ra ON ra.asset_id = a.id
      ${queryPart2}
    WHERE a.snap_addr = $1`;
  return exeQuery(query, [snapAddr]);
}

exports.deleteAssetLinkedEntitiesByIds = (asset) => {
  const query = `
    DELETE FROM terrasmart.radio WHERE asset_id = '${asset.asset_id}';
    DELETE FROM terrasmart.panel WHERE snap_addr = '${asset.snap_addr}';
    DELETE FROM terrasmart.motor WHERE snap_addr = '${asset.snap_addr}';
    DELETE FROM terrasmart.rack WHERE snap_addr = '${asset.snap_addr}';
    DELETE FROM terrasmart.row_controller WHERE asset_id = '${asset.asset_id}';
    DELETE FROM terrasmart.charger_battery WHERE battery_id = (SELECT id FROM terrasmart.battery WHERE snap_addr = '${asset.snap_addr}');
    DELETE FROM terrasmart.battery WHERE snap_addr = '${asset.snap_addr}';
    DELETE FROM terrasmart.charger WHERE snap_addr = '${asset.snap_addr}';
    DELETE FROM terrasmart.asset WHERE id = '${asset.asset_id}';
  `;
  return exeQuery(query, []);
}

exports.getBatteryHistBySnapAddr = (snapAddr) => {
  const query = `
    SELECT * FROM terrasmart.asset_history
    WHERE 
      snap_addr = $1 AND
      data -> 'battery.voltage' IS NOT NULL 
  `;
  return exeQuery(query, [snapAddr]);
}

exports.deleteAssetHistoryBySnapAddr = (snapAddr) => {
  return exeQuery('DELETE FROM terrasmart.asset_history WHERE snap_addr = $1', [snapAddr]);
}

exports.delRowControllerConfigHistory = (assetId) => {
  return exeQuery(
    'DELETE FROM terrasmart.row_controller_conf ' +
    'USING terrasmart.row_controller ' +
    'WHERE row_controller.id = row_controller_conf.row_controller_id AND row_controller.asset_id = $1::UUID',
    [assetId]
  );
}

exports.getRowControllerConfigHistory = (assetId) => {
  return exeQuery(
    'SELECT rcf.* FROM terrasmart.row_controller rc ' +
    'INNER JOIN terrasmart.row_controller_conf rcf ON rc.id = rcf.row_controller_id ' +
    'WHERE rc.asset_id = $1::UUID',
    [assetId]
  );
}

exports.getRowControllerConfig = (asset_id) => {
  return exeQuery(
    `select * from terrasmart.row_controller_conf where row_controller_id = (
      select id from terrasmart.row_controller where asset_id = $1::UUID
    )`,
    [asset_id]
  );
}

exports.getAssetConfig = (snapAddr) => {
  return exeQuery(`
  SELECT * FROM terrasmart.asset_conf where snap_addr = $1::VARCHAR
  `, [snapAddr]);
}

exports.delRowControllerConfig = (assetId) => {
  return exeQuery(
    'DELETE FROM terrasmart.row_controller ' +
    'WHERE asset_id = $1::UUID ',
    [assetId]
  );
}

module.exports.getMotorRuntimeHour = (motorId) => {
  return exeQuery(
    'SELECT * FROM terrasmart.motor_runtime_hour ' +
    'WHERE motor_id = $1::uuid ' +
    'ORDER BY collected_at ' +
    'LIMIT 1',
    [motorId]
  );
};

module.exports.delMotorRuntimeHour = (motorId) => {
  return exeQuery(
    'DELETE FROM terrasmart.motor_runtime_hour ' +
    'WHERE motor_id = $1::uuid ',
    [motorId]
  );
};

module.exports.getMotorRuntimeDay = (motorId) => {
  return exeQuery(
    'SELECT * FROM terrasmart.motor_runtime_day ' +
    'WHERE motor_id = $1::uuid ' +
    'ORDER BY collected_at ' +
    'LIMIT 1',
    [motorId]
  );
};

module.exports.delMotorRuntimeDay = (motorId) => {
  return exeQuery(
    'DELETE FROM terrasmart.motor_runtime_day ' +
    'WHERE motor_id = $1::uuid ',
    [motorId]
  );
};

module.exports.getRadio = (snapAddrB64) => {
  return exeQuery(
    'SELECT * FROM terrasmart.radio ' +
    'WHERE snap_addr = $1 ',
    ['\\x' + snapAddrB64]
  );
};

exports.updateRadio = (radioId, args) => {
  const { valuesToSet, values } = updateQueryHelper(args);
  return exeQuery(
    `UPDATE terrasmart.radio SET ${valuesToSet} ` +
    `WHERE id = $${values.length + 1}`,
    [...values, radioId]
  );
};

exports.getRadioHist = (snapAddr) => {
  const query = `
    SELECT * FROM terrasmart.asset_history
    WHERE 
      snap_addr = $1 AND
      (
        data -> 'radio.polls_sent' IS NOT NULL OR 
        data -> 'radio.firmware_rev' IS NOT NULL
      ) 
  `;
  return exeQuery(query, [snapAddr]);
};

exports.getWeatherBySnapAddr = async (snapAddr) => {
  const query = `
  SELECT weather.*, asset.snap_addr 
  FROM terrasmart.weather
  INNER JOIN terrasmart.asset ON weather.asset_id = asset.id
  WHERE asset.snap_addr = $1
  LIMIT 1
  `;
  return exeQuery(query, [snapAddr]);
}

exports.getLastWeatherHistory = async (snapAddr, timestamp) => {
  const query = `
  SELECT weather_hist.*, asset.snap_addr
  FROM terrasmart.weather_hist
  INNER JOIN terrasmart.weather on weather.id = weather_hist.weather_id
  INNER JOIN terrasmart.asset ON weather.asset_id = asset.id
  WHERE asset.snap_addr = $1 AND weather_hist."timestamp" = $2::TIMESTAMP
  ORDER BY weather_hist."timestamp" DESC LIMIT 1
    `;
  return exeQuery(query, [snapAddr, timestamp]);
}

module.exports.getWeatherIrradiance = (projectId) => {
  return exeQuery(
    'SELECT * FROM terrasmart.weather_irradiance ' +
    'WHERE project_id = $1::uuid ' +
    'ORDER BY timestamp ',
    [projectId]
  );
};

exports.updateWeatherIrradiance = (projectId, args) => {
  const { valuesToSet, values } = updateQueryHelper(args);
  return exeQuery(
    `UPDATE terrasmart.weather_irradiance SET ${valuesToSet} ` +
    `WHERE project_id = $${values.length + 1}::UUID `,
    [...values, projectId]
  );
};

module.exports.delWeatherIrradiance = (projectId) => {
  return exeQuery(
    'DELETE FROM terrasmart.weather_irradiance ' +
    'WHERE project_id = $1::uuid ',
    [projectId]
  );
};

module.exports.getIrradianceHist = (projectId) => {
  return exeQuery(
    'SELECT * FROM terrasmart.irradiance_hist ' +
    'WHERE project_id = $1::uuid ' +
    'ORDER BY timestamp ',
    [projectId]
  );
};

module.exports.delIrradianceHist = (projectId) => {
  return exeQuery(
    'DELETE FROM terrasmart.irradiance_hist ' +
    'WHERE project_id = $1::uuid ',
    [projectId]
  );
};

module.exports.getFasttrak = async (snapAddr) => {
  return await exeQuery(
    'SELECT * FROM terrasmart.fasttrak ' +
    'WHERE snap_addr = $1::char(6) ',
    [snapAddr]
  );
};

exports.updateFasttrak = (snapAddr, args) => {
  const { valuesToSet, values } = updateQueryHelper(args);
  return exeQuery(
    `UPDATE terrasmart.fasttrak SET ${valuesToSet} ` +
    `WHERE snap_addr = $${values.length + 1}::char(6) `,
    [...values, snapAddr]
  );
};

module.exports.delFasttrak = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.fasttrak ' +
    'WHERE snap_addr = $1::char(6) ',
    [snapAddr]
  );
};
module.exports.delFasttrakHist = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.fasttrak_hist ' +
    'WHERE snap_addr = $1::char(6) ',
    [snapAddr]
  );
};
module.exports.getRack = (snapAddr) => {
  return exeQuery(
    'SELECT * FROM terrasmart.rack ' +
    'WHERE snap_addr = $1::char(6) ',
    [snapAddr]
  );
};

exports.updateProjectById = (projectId, args) => {
  const { valuesToSet, values } = updateQueryHelper(args);
  return exeQuery(
    `UPDATE terrasmart.project SET ${valuesToSet} ` +
    `WHERE id = $${values.length + 1}`,
    [...values, projectId]
  );
};

exports.updateRack = (snapAddr, args) => {
  const { valuesToSet, values } = updateQueryHelper(args);
  return exeQuery(
    `UPDATE terrasmart.rack SET ${valuesToSet} ` +
    `WHERE snap_addr = $${values.length + 1}::char(6) `,
    [...values, snapAddr]
  );
};

module.exports.getRackHist = (snapAddr) => {
  return exeQuery(
    `SELECT * FROM terrasmart.asset_history
    WHERE snap_addr = $1::char(6) AND data -> 'rack.current_angle' IS NOT NULL`,
    [snapAddr]
  );
};

module.exports.getAssetLastUpdate = (snapAddr) => {
  return exeQuery(`Select * from terrasmart.asset_last_update where snap_addr = $1`, [snapAddr]);
};

module.exports.deleteAssetLastUpdateBySnapAddr = (snapAddr) => {
  return exeQuery(`DELETE FROM terrasmart.asset_last_update where snap_addr = $1`, [snapAddr]);
};

module.exports.getCloudEventLog = (assetId, eventName) => {
  return exeQuery(`SELECT * FROM terrasmart.cloud_event_log WHERE asset_id = $1 AND name = $2`, [assetId, eventName]);
};

module.exports.getCloudAlert = (assetId, eventName) => {
  return exeQuery(`SELECT * FROM terrasmart.cloud_alert WHERE asset_id = $1 AND event_name = $2`, [assetId, eventName]);
};

module.exports.getCloudAlertDetail = (assetId, eventName) => {
  return exeQuery(`SELECT * FROM terrasmart.cloud_alert_detail WHERE asset_id = $1 AND event_name = $2`, [assetId, eventName]);
};

module.exports.delCloudAlert = (assetId) => {
  return exeQuery(`DELETE FROM terrasmart.cloud_alert WHERE asset_id = $1`, [assetId]);
};

module.exports.delCloudAlertDetail = (assetId) => {
  return exeQuery(`DELETE FROM terrasmart.cloud_alert_detail WHERE asset_id = $1`, [assetId]);
};

module.exports.delCloudEventLog = (assetId) => {
  return exeQuery(`DELETE FROM terrasmart.cloud_event_log WHERE asset_id = $1`, [assetId]);
};

module.exports.deleteFasttrak = (snapAddr) => {
  return exeQuery(
    'DELETE FROM terrasmart.fasttrak ' +
    'WHERE snap_addr = $1::char(6) ',
    [snapAddr]
  );
};

module.exports.getSnowShedding = (snapAddr) => {
  return exeQuery(
    'SELECT * FROM terrasmart.snow_shedding ' +
    'WHERE snap_addr = $1::char(6) ',
    [snapAddr]
  );
};

module.exports.getSnowSheddingReport = (snapAddr) => {
  return exeQuery(
    'SELECT * FROM terrasmart.snow_shedding_report ' +
    'WHERE snap_addr = $1::char(6) ',
    [snapAddr]
  );
}

module.exports.genericInsertion = (tableName, data) => {
  const { query, values } = getKeysAndValues(data, "insert");
  const q = `INSERT INTO terrasmart.${tableName} ${query} RETURNING *`;
  return exeQuery(q, values);
};

module.exports.insertRackHist = (data) => {
  const { query, values } = getKeysAndValues(data, "insert");
  const q = `
    INSERT INTO terrasmart.asset_history ${query}
    ON CONFLICT (snap_addr, timestamp) DO UPDATE 
      SET data = terrasmart.asset_history.data::jsonb || EXCLUDED.data::jsonb
  `;
  return exeQuery(q, values);
};

module.exports.insertCloudAlert = (data) => {
  return this.genericInsertion("cloud_alert", data);
};

module.exports.insertCloudAlertDetail = (data) => {
  return this.genericInsertion("cloud_alert_detail", data);
};
