const pg = require('../utils/lib/pg');
const db = require('../db');
const {snappyHex} = require("../util");
const {acquireRadioLock} = require("../utils/lib/distributedLock");

const getRadioBySnapAddr = async (snapAddr) => {
  const { rows } = await pg.getRadioBySnapAddr(snapAddr);

  if(rows.length > 0) {
    const [ radio ] = rows;
    return radio;
  }

  console.warn('radio by snap addr not found', JSON.stringify({ snapAddr }));

  return null;
}

const addRadio = async (snapAddr, assetId) => {
  if(!snapAddr || !assetId) {
    throw (new Error('snap address and asset id are required for creating new radio info'));
  }
  console.warn("adding new radio info", JSON.stringify({ snapAddr, assetId }));

  const { rows, rowCount } = await pg.addRadio(snapAddr, assetId);

  console.log('radio info creation result', JSON.stringify({ rows, rowCount }));

  return rows[0];
}

const getOrCreateRadio = async (snapAddr, assetId) => {
  const radio = await getRadioBySnapAddr(snapAddr);
  if(radio) {
    return radio;
  }

  await addRadio(snapAddr, assetId);
  return getRadioBySnapAddr(snapAddr);
}

const updateRadioInfo = async (assetId, upd, radioId, snapAddr) => {
  const params = [
    upd.getRadioLinkQuality() || null,  // setting null if empty string received, otherwise type error occurs
    upd.getRadioMeshDepth() || null,    // setting null if empty string received, otherwise type error occurs
    upd.getRadioScriptVersion(),
    snappyHex(upd.getRadioScriptCrc()),
    upd.getRadioFirmware(),
    upd.getRadioPollsSent(),
    upd.getRadioPollResponses(),
    formatMacAddr(upd.getRadioMacAddr()),
    upd.getIsARepeater(),
    radioId,
    upd.getWhen().toDate()
  ];

  return updateRadioGeneric(assetId, radioId, snapAddr, null, async () => {
    const {rows} = await pg.updateRadioInfo(params);
    return rows?.length > 0 ? rows[0] : null;
  });
}

const formatMacAddr = (macStr) => {
  if (macStr) {
    return macStr
    .toUpperCase()
    .match(/.{1,2}/g)
    .join(":");
  } else {
    return "unknown";
  }
};

const updateBridgeRadioInfo = async (radioId, assetId, script_version, firmware_version, snapAddr) => {
  const obj = { script_version, firmware_version };
  return updateRadioGeneric(assetId, radioId, snapAddr, obj);
};

const updateRadioData = async (assetId, radioId, last_updated, polls_sent, polls_recv, link_quality, mesh_depth, snapAddr) => {
  const obj = { last_updated, polls_sent, polls_recv, link_quality, mesh_depth };
  return updateRadioGeneric(assetId, radioId, snapAddr, obj);
};

const addRadioConfig = async (params) => {
  const {rows} = await pg.exeQuery(db.addRadioConfigInfoQuery, params);
  if (rows?.length > 0) {
    return rows[0];
  }
  return null;
};

const updateRadioGeneric = async (assetId, radioId, snapAddr, params, fn) => {
  const func = async () => {
    const {rows} = await pg.updateRadioGeneric(params, radioId);
    return rows?.length > 0 ? rows[0] : null;
  };
  return acquireRadioLock(snapAddr, fn || func);
};

module.exports = {
  getRadioBySnapAddr,
  getOrCreateRadio,
  updateRadioInfo,
  addRadioConfig,
  updateRadioData,
  updateBridgeRadioInfo
};
