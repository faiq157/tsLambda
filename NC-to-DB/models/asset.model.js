const pg = require("../utils/lib/pg");
const { getDeviceTypeIdFromAssetType, LAST_ACTIVITY_UPDATE_INTERVAL, assetTypes } = require("../utils/constants");
const { getOrCreateRadio } = require("../models/radio.info.model");
const { getOrCreatePanel } = require("../models/panel.model");
const { getOrCreateCharger } = require("../models/charger.model");
const { getOrCreateBattery } = require("../models/battery.model");
const { getOrCreateMotor } = require("../models/motor.model");
const { getOrCreateRack } = require("../models/rack.model");
const { getOrCreateRowController } = require("../models/row.controller.model");
const { acquireAssetLock, acquireAssetLastUpdateLock } = require("../utils/lib/distributedLock");
const _ = require('lodash');
const { isLinkedRow } = require("../utils/helpers/functions");

const getAssetBySnapAddr = async (snapAddr) => {
  const { rows } = await pg.getAssetBySnapAddr(snapAddr);
  if (rows.length > 0) {
    return rows[0];
  }

  console.warn('asset by snap addr not found', JSON.stringify({ snapAddr }));

  return null;
}

const getAssetById = async (assetId) => {
  const { rows } = await pg.getAssetInfoById(assetId);
  if (rows.length > 0) {
      return rows[0];
  }

  console.warn('asset by id not found', JSON.stringify({ assetId }));

  return null;
}

const generateAssetIdFromSnapAddr = (snapAddr) => {
  return `00000000-0000-0000-0000-000000${snapAddr}`;
}

const getAssetLinkedResourcesIds = async (isNC, snapAddr) => {
  const { rows } = await pg.getAssetLinkedResourcesIds(isNC, snapAddr);
  if (rows.length > 0) {
    return rows[0];
  }

  console.warn('AssetLinkedResourcesIds by snap addr not found', JSON.stringify({ isNC, snapAddr }));
  return null;
}
const getRowId = async (snapAddr) => {
  const row = await getRowInfoBySnapAddr(snapAddr)
  if (row) {
    return row.row_id;
  } else {
    return null;
  }
}
const getRowInfoBySnapAddr = async (snapAddr) => {
  const { rows } = await pg.getRowInfoBySnapAddr(snapAddr);
  if (rows.length > 0) {
    return rows[0];
  }
  console.warn('Row Info by snap addr not found', JSON.stringify({ snapAddr }));
  return null;
}

const getAssetAndSiteLayoutByAssetId = async (assetId) => {
  const { rows } = await pg.getAssetAndSiteLayoutByAssetId(assetId);
  if (rows.length > 0) {
      return rows[0];
  }

  console.warn('asset by id not found', JSON.stringify({ assetId }));

  return {};
}

const addAsset = async (snapAddr, networkControllerId = null, assetType = null) => {
  if (!snapAddr) {
    throw (new Error('snap address is required for creating new asset'));
  }

  const assetId = generateAssetIdFromSnapAddr(snapAddr);

  const deviceTypeId = assetType != null ? getDeviceTypeIdFromAssetType(assetType) : null;

  console.warn("adding new asset", JSON.stringify({ assetId, snapAddr, networkControllerId, assetType, deviceTypeId }));

  await pg.addAsset(assetId, snapAddr, networkControllerId, deviceTypeId, assetType);
  const assetRes = await getAssetBySnapAddr(snapAddr);

  await linkSiteIdToTheAssetByNCId(snapAddr, assetRes.site_id, assetRes.parent_network_controller_id, assetRes.asset_type);

  await getOrCreateRadio(snapAddr, assetId);

  await getOrCreatePanel(snapAddr, assetId);

  const charger = await getOrCreateCharger(assetId, snapAddr);

  const battery = await getOrCreateBattery(snapAddr);

  await pg.linkChargerAndBattery(charger.id, battery.id);
  const { rowCount, rows } = await pg.getChargerAndBatteryLinkInfo(charger.id, battery.id);
  console.log('charger battery link result', JSON.stringify({ rowCount, rows }));

  const rowController = await getOrCreateRowController(snapAddr, assetId);

  if (rowController && (assetType === null || assetType !== assetTypes.ASSET_TYPE_NC)) {
    await getOrCreateRack(snapAddr, rowController.id);
    await getOrCreateMotor(snapAddr, rowController.id);
  }

  // adding asset_conf
  await createAssetConf(snapAddr);

  console.log('asset creation result', JSON.stringify({ asset: assetRes }));

  return assetRes;
};

const createAssetConf = async (snapAddr) => {
  const res = await pg.createAssetConf(snapAddr);
  if (res && res.rows.length > 0) {
    return res.rows[0];
  }
  return null
}

const insertAssetLastUpdate = async (snapAddr, timestamp) => {
  const fn = async () => {
    const {rowCount} = await pg.insertLastAssetUpdate(snapAddr, timestamp);
    return rowCount > 0;
  };
  return acquireAssetLastUpdateLock(snapAddr, fn);
}

const getAssetInfoByNCId = async (ncId) => {
  const { rows } = await pg.getAssetInfoByNCId(ncId);
  return rows.length > 0 ? rows[0] : null
}

const setSiteIdOfAssetBySnap = async (assetSnapAddr, ncSiteId) => {
  const { rows } = await pg.setSiteIdOfAssetBySnap(assetSnapAddr, ncSiteId);
  return rows?.length > 0 ? rows[0] : null;
}

const linkSiteIdToTheAssetByNCId = async (assetSnapAddr, assetSiteId, ncId, asset_type) => {
  if (asset_type === assetTypes.ASSET_TYPE_NC) {
    return null;
  }

  const res = await getAssetInfoByNCId(ncId);
  const ncSiteId = res?.site_id || null;
  
  if(!res || !res.site_id) {
    console.log('Found an asset whose NC is either not present or is unassigned to a site', JSON.stringify({ assetSnapAddr, assetSiteId, ncSiteId }));
    return null;
  }
  
  // ASSET IS ALREADY LINKED TO THE SAME SITE AS NC 
  // OR BOTH (ASSET & NC) ARE NOT LINKED TO ANY SITE i.e. null === null
  if (assetSiteId === ncSiteId) {
    console.log('Asset is already linked to the same site as NC', JSON.stringify({ assetSnapAddr, assetSiteId, ncSiteId }));
    return null;
  }

  console.log('Asset is not linked to the same site as NC', JSON.stringify({ assetSnapAddr, assetSiteId, ncSiteId }));

  // NC_SITE_ID CAN BE EITHER NULL OR NOT NULL 
  // SYNC THE ASSET_SITE_ID WITH THE NC_SITE_ID
  const res2 = await setSiteIdOfAssetBySnap(assetSnapAddr, ncSiteId);
  console.log('New Site ID attached to asset ', JSON.stringify({ assetSnapAddr, assetSiteId, ncSiteId, res2 }));
}

const getOrCreateAsset = async (snapAddr, networkControllerId = null, assetType = null) => {
  const asset = await getAssetBySnapAddr(snapAddr);

  if (asset) {
    // SYNC SITE_ID OF ASSET WITH NC
    await linkSiteIdToTheAssetByNCId(snapAddr, asset.site_id, asset.parent_network_controller_id, asset.asset_type);
    return asset;
  }

  // LINK NC_SITE_ID TO THE ASSET INSIDE THE FUNCTION
  await addAsset(snapAddr, networkControllerId, assetType);

  return getAssetBySnapAddr(snapAddr);
}

const updateAssetFirmwareVersions = async (
  assetId,
  assetType,
  stmRev,
  radioRev,
  scriptRev,
  batteryRev,
  ncMac,
  batteryFlashRev,
  configVersion
) => {
  if (!assetId) {
    throw new Error("asset id is required for updating asset");
  }

  const params = _.pickBy({
    stm_rev: stmRev,
    radio_rev: radioRev,
    script_rev: scriptRev,
    battery_rev: batteryRev,
    nc_mac: ncMac,
    battery_flash_rev: batteryFlashRev,
    config_version: configVersion
  }, _.identity)
  params.asset_type = assetType;

  return updateAssetGeneric(params, assetId);
};


const updateAssetLastActivity = async (
  whenTimestamp,
  assetId,
  lastCloudUpdate
) => {
  if (!process.env.ENABLE_ASSET_LAST_UPDATE) {
    return;
  }

  if (!assetId) {
    throw new Error("asset id is required for updating last cloud reported");
  }

  const dbTimestamp = lastCloudUpdate ? lastCloudUpdate.getTime() : null;
  const assetTimestamp = whenTimestamp ? whenTimestamp.getTime() : null;
  const timeDifference = dbTimestamp
    ? Math.round((assetTimestamp - dbTimestamp) / 1000)
    : null;

  if (timeDifference && timeDifference < 60) {
    console.log(
      `asset(${assetId}) last cloud update ignored, db(${dbTimestamp}) > serverTimestamp(${assetTimestamp}) timeDifference is (${timeDifference})`
    );
  } else {
    return updateAssetGeneric(null, assetId, async () => {
      const {rows} = await pg.updateAssetLastActivity(assetId, LAST_ACTIVITY_UPDATE_INTERVAL, whenTimestamp);
      return rows?.length > 0 ? rows[0] : null;
    });
  }
};

const updateHardwareAndFirmwareRaw = async (args, reportedModel, assetId) => {
  return updateAssetGeneric(null, assetId, async () => {
    const {rows} = await pg.updateHardwareAndFirmwareRaw(args, reportedModel, assetId);
    return rows?.length > 0 ? rows[0] : null;
  });
}

const updateFasttrakUnableDisableBySnapAddress = async (params, snapAddr) => {
  const assetInfoRes = await getOrCreateAsset(
    snapAddr
  );
  return updateAssetGeneric(params, assetInfoRes.id);
};

const updateAssetStatus = async (ignoreConnected, params, assetId, isCurrentStatusUnknownAndNewStatusOffline) => {
  return updateAssetGeneric(null, assetId, async () => {
    const {rows} = await pg.assetStatusUpdate(ignoreConnected, params, isCurrentStatusUnknownAndNewStatusOffline);
    return rows?.length > 0 ? rows[0] : null;
  });
};


const updateAssetTemp = async (assetTemp, uptime, timestamp, assetId) => {
  const params = {
    asset_temp: assetTemp,
    uptime,
    // last_asset_update: timestamp,
    last_cloud_update: timestamp
  };
  return updateAssetGeneric(params, assetId);
};

const updateAssetGeneric = async (params, assetId, fn) => {
  const defaultFn = async () => {
    const {rowCount} = await pg.updateAssetGeneric(params, assetId);
    return rowCount > 0 ? true : false;
  };

  return acquireAssetLock(assetId, fn || defaultFn);
};

const getIsLinkedRow = async (assetId) => {
  if (!assetId) {
    return false;
  }

  const { linkRowType, linkRowRef, device_type } =
    await getAssetAndSiteLayoutByAssetId(assetId);

  return { 
    isLinkedRow:isLinkedRow(linkRowType, linkRowRef, device_type),
    linkRowType,
    linkRowRef, 
    device_type
  }
};
const getAssetLayoutBySnapAddr = async (snapAddr)=> {
  const res = await pg.getAssetLayoutBySnapAddr(snapAddr);
  if (res && res.rows && res.rows.length > 0) {
    return res.rows[0];
  }
  return null;
}

module.exports = {
  addAsset,
  updateAssetGeneric,
  getAssetBySnapAddr,
  getOrCreateAsset,
  updateAssetFirmwareVersions,
  generateAssetIdFromSnapAddr,
  updateAssetLastActivity,
  getAssetLinkedResourcesIds,
  updateHardwareAndFirmwareRaw,
  updateFasttrakUnableDisableBySnapAddress,
  updateAssetTemp,
  updateAssetStatus,
  getAssetById,
  getRowId,
  getAssetAndSiteLayoutByAssetId,
  insertAssetLastUpdate,
  getIsLinkedRow,
  getAssetLayoutBySnapAddr
};



