const pg = require('../utils/lib/pg');
const {acquireMotorLock} = require('../utils/lib/distributedLock');

const getMotorBySnapAddr = async (snapAddr) => {
  const { rows } = await pg.getMotorBySnapAddr(snapAddr);

  if(rows.length > 0) {
    const [ motor ] = rows;
    return motor;
  }

  console.warn('motor by snap addr not found', JSON.stringify({ snapAddr }));

  return null;
};

const addMotor = async (snapAddr, rowControllerId) => {
  if(!snapAddr || !rowControllerId) {
    throw (new Error('snap address and asset id are required for creating new motor'));
  }
  console.warn("adding new motor", JSON.stringify({ snapAddr, rowControllerId }));

  const { rows, rowCount } = await pg.addMotor(snapAddr, rowControllerId);

  console.log('motor creation result', JSON.stringify({ rows, rowCount }));

  return rows[0];
};

const getOrCreateMotor = async (snapAddr, rowControllerId) => {
  const motor = await getMotorBySnapAddr(snapAddr);
  if(motor) {
    return motor;
  }

  await addMotor(snapAddr, rowControllerId);
  return getMotorBySnapAddr(snapAddr);
};

const updateMotorInfo = async (upd, snapAddr) => {
  const params = {
    peak_motor_inrush_current: upd.getPeakMotorInrushCurrent(),
    peak_motor_current: upd.getPeakMotorCurrent(),
    average_motor_current: upd.getAverageMotorCurrent(),
    ending_motor_current: upd.getEndingMotorCurrent()
  };

  return updateMotorGeneric(params, snapAddr);
};

const updateMotorGeneric = async (params, snapAddr, fn) => {
  const defaultFn = async () => {
    const {rows} = await pg.updateMotorGeneric(params, snapAddr);
    return rows?.length > 0 ? rows[0] : null;
  };

  return acquireMotorLock(snapAddr, fn || defaultFn);
};


module.exports = {
  getMotorBySnapAddr,
  getOrCreateMotor,
  updateMotorInfo
};
