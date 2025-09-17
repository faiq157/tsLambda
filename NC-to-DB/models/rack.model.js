const pg = require('../utils/lib/pg');
const {acquireRackLock} = require("../utils/lib/distributedLock");

const getRackBySnapAddr = async (snapAddr) => {
  const { rows } = await pg.getRackBySnapAddr(snapAddr);

  if(rows.length > 0) {
    const [ rack ] = rows;
    return rack;
  }

  console.warn('rack by snap addr not found', JSON.stringify({ snapAddr }));

  return null;
};

const addRack = async (snapAddr, rowControllerId) => {
  if(!snapAddr || !rowControllerId) {
    throw (new Error('snap address and row controller id are required for creating new rack'));
  }
  console.warn("adding new rack", JSON.stringify({ snapAddr, rowControllerId }));

  const { rows, rowCount } = await pg.addRack(snapAddr, rowControllerId);

  console.log('rack creation result', JSON.stringify({ rows, rowCount }));

  return rows[0];
};

const getRackByAssetId = async (asset_id) => {
  const {rows} = await pg.getRackByAssetId(asset_id);
  if (rows?.length > 0) {
    return rows[0];
  }
  console.warn('rack by asset id not found', JSON.stringify({ asset_id }));

  return null;
};

const updateRack = async(upd, snapAddr) => {
  const params = [
    upd.getCurrentAngle(),
    upd.getRequestedAngle(),
    upd.getCommandedState(),
    upd.getTrackingStatus(),
    upd.getCommandedStateDetail(),
    upd.getMotorCurrent(),
    upd.getWhen().toDate(),
    upd.getPanelIndex(),
    upd.getPanelCommandState(),
    snapAddr
  ];
  const {rows} = await updateRackGeneric(snapAddr, () => pg.updateRackInfo(params));
  if (rows?.length > 0) {
    return rows[0];
  }
  return null;
};

const updateRackAngularErr = async (angErrHour, rackId, errLastUpdate, snapAddr) => {
  const params = [angErrHour, rackId, errLastUpdate];
  const {rows} = await updateRackGeneric(snapAddr, () => pg.updateRackAngularErr(params));
  if (rows?.length > 0) {
    return rows[0];
  }
  return null;
};

const getOrCreateRack = async (snapAddr, rowControllerId) => {
  const rowController = await getRackBySnapAddr(snapAddr);
  if(rowController) {
    return rowController;
  }

  await addRack(snapAddr, rowControllerId);
  return getRackBySnapAddr(snapAddr);
};

const updateRackGeneric = async (snap_addr, fn) => {
  return acquireRackLock(snap_addr, fn);
};


module.exports = {
  getRackBySnapAddr,
  getOrCreateRack,
  updateRack,
  getRackByAssetId,
  updateRackAngularErr
};
