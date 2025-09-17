const pg = require('../utils/lib/pg');

const getRowController = async (assetId) => {
  const { rows } = await pg.getRowController(assetId);

  if (rows.length > 0) {
    const [rowController] = rows;
    return rowController;
  }

  console.warn('row controller by asset id not found', JSON.stringify({ assetId }));

  return null;
}




const addRowController = async (snapAddr, assetId) => {
  if (!snapAddr || !assetId) {
    throw (new Error('snap address and asset id are required for creating new row controller'));
  }
  console.warn("adding new row controller", JSON.stringify({ snapAddr, assetId }));

  const { rows, rowCount } = await pg.addRowController(assetId, snapAddr);

  console.log('row controller creation result', JSON.stringify({ rows, rowCount }));

  return rows[0];
}

const getOrCreateRowController = async (snapAddr, assetId) => {
  const rowController = await getRowController(assetId);
  if (rowController) {
    return rowController;
  }

  await addRowController(snapAddr, assetId);
  return getRowController(assetId);
}
const addRowControllerConf = async (rowControllerId, configUpdate) => {
  const { rowCount, rows } = await pg.addRowControllerConf(
    rowControllerId,
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
    configUpdate.getWxDataRecordFrequency()
  );
  rowCount &&
    rows &&
    console.log(`Row controller configuration have been added `, rowCount, rows);
}

module.exports = {
  getRowController,
  getOrCreateRowController,
  addRowControllerConf
}
