const pg = require('../utils/lib/pg');

const updateFasttrakReportOnDoneState = async (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr) => {
  const { rows, rowCount } = await pg.updateFasttrakReportOnDoneState(timestamp, stage, maxPeakMotorInrushCurrent,
    maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits, label, userName, userEmail, charged, minTemperature,
    maxWindGust, maxAverageWind, pv1, pv2, snapAddr);

  if (rowCount === 0) {
    console.warn("Qc report values are not updated in done state");
  }

  return rows;
}


const updateFasttrakReportOnMaxState = async (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr) => {
  const { rows, rowCount } = await pg.updateFasttrakReportOnMaxState(timestamp, stage, maxPeakMotorInrushCurrent,
    maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits, label, userName, userEmail, charged, minTemperature,
    maxWindGust, maxAverageWind, pv1, pv2, snapAddr);

  if (rowCount === 0) {
    console.warn("Qc report values are not updated in max state");
  }

  return rows;
}

const updateFasttrakReportOnFlat = async (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr) => {
  const { rows, rowCount } = await pg.updateFasttrakReportOnFLat(timestamp, stage, maxPeakMotorInrushCurrent,
    maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits, label, userName, userEmail, charged, minTemperature,
    maxWindGust, maxAverageWind, pv1, pv2, snapAddr);

  if (rowCount === 0) {
    console.warn("Qc report values are not updated");
  }

  return rows;
}
const updateFasttrakReport = async (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr) => {
  const { rows, rowCount } = await pg.updateFasttrakReport(timestamp, stage, maxPeakMotorInrushCurrent,
    maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits, label, userName, userEmail, charged, minTemperature,
    maxWindGust, maxAverageWind, pv1, pv2, snapAddr);

  if (rowCount === 0) {
    console.warn("Qc report values are not updated");
  }

  return rows;
}

const updateFasttrakReportOnStopStateModeQC = async (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr) => {
  const { rows, rowCount } = await pg.updateFasttrakReportOnStopStateModeQC(timestamp, stage, maxPeakMotorInrushCurrent,
    maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits, label, userName, userEmail, charged, minTemperature,
    maxWindGust, maxAverageWind, pv1, pv2, snapAddr);

  if (rowCount === 0) {
    console.warn("Qc report values are not updated");
  }

  return rows;
}
const updateFasttrakReportOnStopState = async (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr) => {
  const { rows, rowCount } = await pg.updateFasttrakReportOnStopState(timestamp, stage, maxPeakMotorInrushCurrent,
    maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits, label, userName, userEmail, charged, minTemperature,
    maxWindGust, maxAverageWind, pv1, pv2, snapAddr);

  if (rowCount === 0) {
    console.warn("Qc report values are not updated");
  }

  return rows;
}

const addFasttrakReport = async (
  snapAddr,
  trackingStatus,
  timestamp,
  projectConstructionStatus) => {
  const { rowCount } = await pg.addFasttrakReport(snapAddr, trackingStatus, timestamp, projectConstructionStatus);

  if (rowCount === 0) {
    console.warn("Qc report values are not added/updated");
  }

  return rowCount;
}

const resetFasttrakReportOnFlat = async (
  snapAddr,
  trackingStatus,
  timestamp,
  projectConstructionStatus) => {
  const { rowCount } = await pg.resetFasttrakReportOnFlat(snapAddr, trackingStatus, timestamp, projectConstructionStatus);

  if (rowCount === 0) {
    console.warn("Qc report values are not added/updated");
  }

  return rowCount;
}


const addFasttrakHist = async (
  snapAddr) => {
  const { rowCount } = await pg.addFasttrakHist(snapAddr);

  if (rowCount === 0) {
    console.warn("Qc report history values are not added");
  }

  return rowCount;
}

const getFasttrakByAssetSnapAddr = async (snapAddr) => {

  const res = await pg.getFasttrakByAssetSnapAddr(snapAddr);
  if (res?.rows && res.rows?.length > 0) {
    return res.rows[0];
  }

  return null
}

const updateFasttrakEndTime = async (
  snapAddr,
  timestamp) => {
  const { rowCount } = await pg.updateFasttrakEndTime(snapAddr, timestamp);

  if (rowCount === 0) {
    console.warn("Qc report end time not updated");
  }

  return rowCount;
}

const updateFasttrakCompletedStatus = async (angle, status, timestamp, snapAddr) => {
  const { rowCount } = await pg.updateFasttrakCompletedStatus(angle, status, timestamp, snapAddr);

  if (rowCount === 0) {
    console.warn(`Qc report completed $status status not updated`);
  }

  return rowCount;
}


const updateFasttrakMotorCurrent = async (
  motorCurrentType,
  motorCurrent,
  snapAddr) => {
  const { rowCount } = await pg.updateFasttrakCurrentReport(motorCurrentType, motorCurrent, snapAddr);

  if (rowCount === 0) {
    console.warn("Qc Fasttrak motor current values are not updated");
  }

  return rowCount;
}

module.exports = {
  updateFasttrakReportOnDoneState,
  updateFasttrakReportOnMaxState,
  updateFasttrakReport,
  addFasttrakReport,
  addFasttrakHist,
  updateFasttrakEndTime,
  updateFasttrakCompletedStatus,
  updateFasttrakMotorCurrent,
  getFasttrakByAssetSnapAddr,
  updateFasttrakReportOnStopState,
  updateFasttrakReportOnStopStateModeQC,
  updateFasttrakReportOnFlat,
  resetFasttrakReportOnFlat
}
