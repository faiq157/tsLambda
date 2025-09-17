const pg = require('../utils/lib/pg');
const {acquireBatteryLock} = require("../utils/lib/distributedLock");


const updateBatteryInfo = async (battery_id, upd, snapAddr) => {
  if (upd.getVoltage() === 0 && upd.getCurrent() === 0 && upd.getCharged() === 0 && upd.getHealth() === 0 &&
    upd.getBattTemp() === 0 && upd.getHeaterTemp() === 0 && upd.getMiscStatusBits() === 0
  ) {
    console.warn("Not updating battery info. All values are 0.");
    return;
  }

  const params = {
    voltage: upd.getVoltage(),
    current: upd.getCurrent(),
    poc: upd.getCharged(),
    poh: upd.getHealth(),
    battery_temperature: upd.getBattTemp(),
    heater_temperature: upd.getHeaterTemp(),
    misc_status_bits: upd.getMiscStatusBits(),
    battery_id,
    timestamp: upd.getWhen().toDate(),
    wakeup_poc: upd.newWakeupPoc,
    wakeup_poc_at: upd.newWakeupPocAt
  };

  return updateBatteryGeneric(params, snapAddr, async () => {
    const {rows} = await pg.updateBatteryInfo(params);
    return rows?.length > 0 ? rows[0] : null;
  });
};

const getBatteryByAssetId = async (assetId) => {
  const {rows} = await pg.getBatteryByAssetId(assetId);
  if (rows?.length > 0) {
    return rows[0];
  }
  return null;
};

const getBatteryBySnapAddr = async (snapAddr) => {
  const { rows } = await pg.getBatteryBySnapAddr(snapAddr);

  if(rows.length > 0) {
    const [ battery ] = rows;
    return battery;
  }

  console.warn('battery by snap addr not found', JSON.stringify({ snapAddr }));

  return null;
}

const addBattery = async (snapAddr) => {
  if(!snapAddr) {
    throw (new Error('snap address is required for creating new battery'));
  }
  console.warn("adding new battery", JSON.stringify({ snapAddr }));

  const { rowCount, rows } = await pg.addBattery(snapAddr);

  console.log('battery creation result', JSON.stringify({ rows, rowCount }));

  return rows[0];
}

const getOrCreateBattery = async (snapAddr) => {
  const battery = await getBatteryBySnapAddr(snapAddr);
  if(battery) {
    return battery;
  }

  await addBattery(snapAddr);
  return getBatteryBySnapAddr(snapAddr);
}

const updateBatteryGeneric = async (params, snapAddr, fn) => {
  const defaultFn = async () => {
    const {rows} = await pg.updateBatteryGeneric(params, snapAddr);
    return rows?.length > 0 ? rows[0] : null;
  };

  return acquireBatteryLock(snapAddr, fn || defaultFn);
};


module.exports = {
  getBatteryBySnapAddr,
  getOrCreateBattery,
  updateBatteryInfo,
  getBatteryByAssetId
};
