const pg = require('../utils/lib/pg');
const {acquirePanelLock} = require("../utils/lib/distributedLock");

const getPanelBySnapAddr = async (snapAddr) => {
  const { rows } = await pg.getPanelBySnapAddr(snapAddr);

  if(rows.length > 0) {
    const [ panel ] = rows;
    return panel;
  }

  console.warn('panel by snap addr not found', JSON.stringify({ snapAddr }));

  return null;
}

const addPanel = async (snapAddr, assetId) => {
  if(!snapAddr || !assetId) {
    throw (new Error('snap address and asset id are required for creating new panel'));
  }
  console.warn("adding new panel", JSON.stringify({ snapAddr, assetId }));

  const { rows, rowCount } = await pg.addPanel(snapAddr, assetId);

  console.log('panel creation result', JSON.stringify({ rows, rowCount }));

  return rows[0];
}

const getOrCreatePanel = async (snapAddr, assetId) => {
  const panel = await getPanelBySnapAddr(snapAddr);
  if(panel) {
    return panel;
  }

  await addPanel(snapAddr, assetId);
  return getPanelBySnapAddr(snapAddr);
}

const updatePanelVoltageAndCurrent = async (snapAddr, params) => {
  return updatePanelGeneric(snapAddr, async () => {
    const {rows} = await pg.panelVoltageCurrentUpdate(params);
    return rows?.length > 0 ? rows[0] : null;
  })
};

const updatePanelVoltageAndCurrentNew = async (snapAddr, params) => {
  return updatePanelGeneric(snapAddr, async () => {
    const {rows} = await pg.panelVoltageCurrentUpdateNew(params);
    return rows?.length > 0 ? rows[0] : null;
  })
};


const updatePanelGeneric = async (snap_addr, fn) => {
  return acquirePanelLock(snap_addr, fn);
};

module.exports = {
  getPanelBySnapAddr,
  getOrCreatePanel,
  updatePanelVoltageAndCurrent,
  updatePanelVoltageAndCurrentNew
};
