const pg = require('../utils/lib/pg');
const {acquireChargerLock} = require("../utils/lib/distributedLock");

const getChargerByAssetId = async (assetId) => {
  const { rows } = await pg.getChargerByAssetId(assetId);

  if(rows.length > 0) {
    const [ charger ] = rows;
    return charger;
  }

  console.warn('charger by asset id not found', JSON.stringify({ assetId }));

  return null;
}

const addCharger = async (assetId, snapAddr) => {
  if(!assetId) {
    throw (new Error('asset id is required for creating new charger'));
  }
  console.warn("adding new charger", JSON.stringify({ assetId, snapAddr }));

  const { rows, rowCount } = await pg.addCharger(assetId, snapAddr);

  console.log('charger creation result', JSON.stringify({ rows, rowCount }));

  return rows[0];
}

const addChargerInfo = async (assetId, voltage, current) => {
  const {rows} = await pg.addChargerInfo(assetId, voltage, current);
  return rows?.length > 0 ? rows[0] : null;
};

const getOrCreateCharger = async (assetId, snapAddr) => {
  const charger = await getChargerByAssetId(assetId);
  if(charger) {
    return charger;
  }

  await addCharger(assetId, snapAddr);
  return getChargerByAssetId(assetId);
}

const updateChargerInfo = async (upd, chargerId, snapAddr) => {
  return updateChargerGeneric(upd, chargerId, snapAddr);
};

const updateChargerGeneric = async (params, chargerId, snapAddr, fn) => {
  const defaultFn = async () => {
    const {rows} = await pg.updateChargerGeneric(params, chargerId);
    return rows?.length > 0 ? rows[0] : null;
  };

  return acquireChargerLock(snapAddr, fn || defaultFn);
};

module.exports = {
  getChargerByAssetId,
  getOrCreateCharger,
  updateChargerInfo,
  addChargerInfo
};
