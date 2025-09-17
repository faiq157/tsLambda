const pg = require("../utils/lib/pg");
const { isEqual } = require('lodash');
const helpers = require('../utils/helpers/functions');


const compareWithOldInformation = (assetConf, configUpdate) => {
  const newConf = {
    snap_addr: helpers.getSnapAddr(configUpdate.getSnapAddr_asU8()),
    config_label: configUpdate.getConfigLabel(),
    config_timestamp: configUpdate.getConfigTimestamp().toString(),
    model_device: configUpdate.getModelDevice(),
    location_lat: configUpdate.getLocationLat(),
    location_lng: configUpdate.getLocationLng(),
    location_text: configUpdate.getLocationText(),
    hardware_rev: configUpdate.getHardwareRev(),
    firmware_rev: configUpdate.getFirmwareRev(),
    site_name: configUpdate.getSiteName(),
    panel_horizontal_cal_angle: configUpdate.getPanelHorizontalCalAngle(),
    panel_min_cal_angle: configUpdate.getPanelMinCalAngle(),
    panel_max_cal_angle: configUpdate.getPanelMaxCalAngle(),
    config_flags: configUpdate.getConfigFlags(),
    segments_0_panel_array_width: configUpdate.getSegments0PanelArrayWidth(),
    segments_0_spacing_to_east: configUpdate.getSegments0SpacingToEast(),
    segments_0_spacing_to_west: configUpdate.getSegments0SpacingToWest(),
    segments_0_delta_height_east: configUpdate.getSegments0DeltaHeightEast(),
    segments_0_delta_height_west: configUpdate.getSegments0DeltaHeightWest(),
    segments_1_panel_array_width: configUpdate.getSegments1PanelArrayWidth(),
    segments_1_spacing_to_east: configUpdate.getSegments1SpacingToEast(),
    segments_1_spacing_to_west: configUpdate.getSegments1SpacingToWest(),
    segments_1_delta_height_east: configUpdate.getSegments1DeltaHeightEast(),
    segments_1_delta_height_west: configUpdate.getSegments1DeltaHeightWest(),
    preset_angles_0_preset_angle: configUpdate.getPresetAngles0PresetAngle(),
    preset_angles_0_nearest_enabled: configUpdate.getPresetAngles0NearestEnabled(),
    preset_angles_1_preset_angle: configUpdate.getPresetAngles1PresetAngle(),
    preset_angles_1_nearest_enabled: configUpdate.getPresetAngles1NearestEnabled(),
    preset_angles_2_preset_angle: configUpdate.getPresetAngles2PresetAngle(),
    preset_angles_2_nearest_enabled: configUpdate.getPresetAngles2NearestEnabled(),
    preset_angles_3_preset_angle: configUpdate.getPresetAngles3PresetAngle(),
    preset_angles_3_nearest_enabled: configUpdate.getPresetAngles3NearestEnabled(),
    preset_angles_4_preset_angle: configUpdate.getPresetAngles4PresetAngle(),
    preset_angles_4_nearest_enabled: configUpdate.getPresetAngles4NearestEnabled(),
    preset_angles_5_preset_angle: configUpdate.getPresetAngles5PresetAngle(),
    preset_angles_5_nearest_enabled: configUpdate.getPresetAngles5NearestEnabled(),
    preset_angles_6_preset_angle: configUpdate.getPresetAngles6PresetAngle(),
    preset_angles_6_nearest_enabled: configUpdate.getPresetAngles6NearestEnabled(),
    preset_angles_7_preset_angle: configUpdate.getPresetAngles7PresetAngle(),
    preset_angles_7_nearest_enabled: configUpdate.getPresetAngles7NearestEnabled(),
    preset_angles_8_preset_angle: configUpdate.getPresetAngles8PresetAngle(),
    preset_angles_8_nearest_enabled: configUpdate.getPresetAngles8NearestEnabled(),
    preset_angles_9_preset_angle: configUpdate.getPresetAngles9PresetAngle(),
    preset_angles_9_nearest_enabled: configUpdate.getPresetAngles9NearestEnabled(),
    preset_angles_10_preset_angle: configUpdate.getPresetAngles10PresetAngle(),
    preset_angles_10_nearest_enabled: configUpdate.getPresetAngles10NearestEnabled(),
    preset_angles_11_preset_angle: configUpdate.getPresetAngles11PresetAngle(),
    preset_angles_11_nearest_enabled: configUpdate.getPresetAngles11NearestEnabled(),
    preset_angles_12_preset_angle: configUpdate.getPresetAngles12PresetAngle(),
    preset_angles_12_nearest_enabled: configUpdate.getPresetAngles12NearestEnabled(),
    preset_angles_13_preset_angle: configUpdate.getPresetAngles13PresetAngle(),
    preset_angles_13_nearest_enabled: configUpdate.getPresetAngles13NearestEnabled(),
    preset_angles_14_preset_angle: configUpdate.getPresetAngles14PresetAngle(),
    preset_angles_14_nearest_enabled: configUpdate.getPresetAngles14NearestEnabled(),
    preset_angles_15_preset_angle: configUpdate.getPresetAngles15PresetAngle(),
    preset_angles_15_nearest_enabled: configUpdate.getPresetAngles15NearestEnabled(),
    swoc_required_duration: configUpdate.getSwocRequiredDuration(),
    swoc_threshold: configUpdate.getSwocThreshold(),
    encoded_hard_limit_register: configUpdate.getEncodedHardLimitRegister(),
    encoded_soft_limit_register: configUpdate.getEncodedSoftLimitRegister(),
    snow_sensor_height: configUpdate.getSnowSensorHeight(),
    wind_dir_offset: configUpdate.getWindDirOffset(),
    tracking_min_angle: configUpdate.getTrackingMinAngle(),
    tracking_max_angle: configUpdate.getTrackingMaxAngle(),
    dynamic_min_angle: configUpdate.getDynamicMinAngle(),
    dynamic_max_angle: configUpdate.getDynamicMaxAngle(),
    simulation_flags: configUpdate.getSimulationFlags(),
    heater_k: configUpdate.getHeaterK(),
    preheating_battery_threshold: configUpdate.getPreheatingBatteryThreshold(),
    preheating_temperature_threshold: configUpdate.getPreheatingTemperatureThreshold(),
    snow_shedding_deadband_angle: configUpdate.getSnowSheddingDeadbandAngle(),
    snow_shedding_duration: configUpdate.getSnowSheddingDuration(),
    autoshed_temperature_threshold: configUpdate.getAutoshedTemperatureThreshold(),
    autoshed_minutes_threshold: configUpdate.getAutoshedMinutesThreshold(),
    autoshed_battery_threshold: configUpdate.getAutoshedBatteryThreshold(),
    lbas_entry_threshold: configUpdate.getLbasEntryThreshold(),
    lbas_exit_threshold: configUpdate.getLbasExitThreshold(),
    median_filter_length: configUpdate.getMedianFilterLength()
  }
  // console.log(`old:`, assetConf);
  // console.log(`new:`, newConf);
  console.log(`is_EQUAL: `, isEqual(assetConf, newConf));
  return isEqual(assetConf, newConf)

}
const getAssetConf = async (configUpdate) => {
  const assetConfRes = await pg.getAssetConf(helpers.getSnapAddr(configUpdate.getSnapAddr_asU8()));
  // console.log("ASSETCONFRES: ", assetConfRes)
  return assetConfRes.rows[0];
}

const updateAssetConf = async (configUpdate) => {
  const { rowCount, rows } = await pg.updateAssetConf(
    helpers.getSnapAddr(configUpdate.getSnapAddr_asU8()),
    configUpdate.getConfigLabel(),
    configUpdate.getConfigTimestamp(),
    configUpdate.getWhen().toDate(),
    configUpdate.getModelDevice(),
    configUpdate.getLocationLat(),
    configUpdate.getLocationLng(),
    configUpdate.getLocationText(),
    configUpdate.getHardwareRev(),
    configUpdate.getFirmwareRev(),
    configUpdate.getSiteName(),
    configUpdate.getPanelHorizontalCalAngle(),
    configUpdate.getPanelMinCalAngle(),
    configUpdate.getPanelMaxCalAngle(),
    configUpdate.getConfigFlags(),
    configUpdate.getSegments0PanelArrayWidth(),
    configUpdate.getSegments0SpacingToEast(),
    configUpdate.getSegments0SpacingToWest(),
    configUpdate.getSegments0DeltaHeightEast(),
    configUpdate.getSegments0DeltaHeightWest(),
    configUpdate.getSegments1PanelArrayWidth(),
    configUpdate.getSegments1SpacingToEast(),
    configUpdate.getSegments1SpacingToWest(),
    configUpdate.getSegments1DeltaHeightEast(),
    configUpdate.getSegments1DeltaHeightWest(),
    configUpdate.getPresetAngles0PresetAngle(),
    configUpdate.getPresetAngles0NearestEnabled(),
    configUpdate.getPresetAngles1PresetAngle(),
    configUpdate.getPresetAngles1NearestEnabled(),
    configUpdate.getPresetAngles2PresetAngle(),
    configUpdate.getPresetAngles2NearestEnabled(),
    configUpdate.getPresetAngles3PresetAngle(),
    configUpdate.getPresetAngles3NearestEnabled(),
    configUpdate.getPresetAngles4PresetAngle(),
    configUpdate.getPresetAngles4NearestEnabled(),
    configUpdate.getPresetAngles5PresetAngle(),
    configUpdate.getPresetAngles5NearestEnabled(),
    configUpdate.getPresetAngles6PresetAngle(),
    configUpdate.getPresetAngles6NearestEnabled(),
    configUpdate.getPresetAngles7PresetAngle(),
    configUpdate.getPresetAngles7NearestEnabled(),
    configUpdate.getPresetAngles8PresetAngle(),
    configUpdate.getPresetAngles8NearestEnabled(),
    configUpdate.getPresetAngles9PresetAngle(),
    configUpdate.getPresetAngles9NearestEnabled(),
    configUpdate.getPresetAngles10PresetAngle(),
    configUpdate.getPresetAngles10NearestEnabled(),
    configUpdate.getPresetAngles11PresetAngle(),
    configUpdate.getPresetAngles11NearestEnabled(),
    configUpdate.getPresetAngles12PresetAngle(),
    configUpdate.getPresetAngles12NearestEnabled(),
    configUpdate.getPresetAngles13PresetAngle(),
    configUpdate.getPresetAngles13NearestEnabled(),
    configUpdate.getPresetAngles14PresetAngle(),
    configUpdate.getPresetAngles14NearestEnabled(),
    configUpdate.getPresetAngles15PresetAngle(),
    configUpdate.getPresetAngles15NearestEnabled(),
    configUpdate.getSwocRequiredDuration(),
    configUpdate.getSwocThreshold(),
    configUpdate.getEncodedHardLimitRegister(),
    configUpdate.getEncodedSoftLimitRegister(),
    configUpdate.getSnowSensorHeight(),
    configUpdate.getWindDirOffset(),
    configUpdate.getTrackingMinAngle(),
    configUpdate.getTrackingMaxAngle(),
    configUpdate.getDynamicMinAngle(),
    configUpdate.getDynamicMaxAngle(),
    configUpdate.getSimulationFlags(),
    configUpdate.getHeaterK(),
    configUpdate.getPreheatingBatteryThreshold(),
    configUpdate.getPreheatingTemperatureThreshold(),
    configUpdate.getSnowSheddingDeadbandAngle(),
    configUpdate.getSnowSheddingDuration(),
    configUpdate.getAutoshedTemperatureThreshold(),
    configUpdate.getAutoshedMinutesThreshold(),
    configUpdate.getAutoshedBatteryThreshold(),
    configUpdate.getLbasEntryThreshold(),
    configUpdate.getLbasExitThreshold(),
    configUpdate.getMedianFilterLength(),
    configUpdate.getWxDataRecordFrequency(),
    configUpdate.getSnowSensorType(),
    configUpdate.getAvgWindSpeedCorrectionFactor(),
    configUpdate.getPeakWindSpeedCorrectionFactor()
  );
  rowCount &&
    rows &&
    console.log(`Asset Configuration have been updated`);
}

const insertFirmwareRev = async (displayVer, configUpdate) => {
  const { rowCount, rows } = await pg.insertFirmwareRev(
    displayVer,
    configUpdate.getWhen().toDate(),
    parseInt(configUpdate.getFirmwareRev(), 10)
  );
  rowCount &&
    rows &&
    console.log(`Firmware rev have been added`);
}
const getFirmwareRev = async (configUpdate) => {
  const result = await pg.getFirmwareRev(
    parseInt(configUpdate.getFirmwareRev(), 10)
  );
  return result;
}

const getAssetHardwareRev = async (hardwareRevId, configUpdate) => {
  const result = await pg.getAssetHardwareRev(
    hardwareRevId,
    configUpdate.getSnapAddr_asU8()
  );
  return result;
}
const insertHardwareRev = async (displayRev, configUpdate) => {
  const { rowCount, rows } = await pg.InsertHardwareRev(
    displayRev,
    configUpdate.getWhen().toDate(),
    parseInt(configUpdate.getHardwareRev(), 10)
  );
  rowCount &&
    rows &&
    console.log(`Hardware rev have been added`);
}

const getHardwareRev = async (configUpdate) => {
  const result = await pg.getHardwareRev(
    parseInt(configUpdate.getHardwareRev(), 10)
  );
  return result;
}
module.exports = {
  getAssetConf,
  compareWithOldInformation,
  updateAssetConf,
  insertFirmwareRev,
  getFirmwareRev,
  getAssetHardwareRev,
  insertHardwareRev,
  getHardwareRev
};



