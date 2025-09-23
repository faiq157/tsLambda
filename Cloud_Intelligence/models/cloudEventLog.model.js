const pg = require("../pg");

const getTimelineEventByEventNameAndTime = async (assetId, eventName, timestamp) => {
  const { rows } = await pg.getCloudEventByNameAndTime(assetId, eventName, timestamp);
  if (rows.length > 0) {
    return rows[0];
  }

  console.warn('No cloud event log found for :', JSON.stringify({ assetId, eventName, timestamp }));
  return null;
}
const addCloudEventLogWithUserInfo = async (assetId, eventName, timestamp, title, icon, userName, email, levelNo = 20) => {
  const { rows } = await pg.addCloudEventLogWithUserInfo(assetId, eventName, timestamp, title, icon, userName, email, levelNo);
  if (rows.length > 0) {
    return rows[0];
  }

  console.warn('cloud event log not added for asset:', JSON.stringify({ assetId }));
  return null;
}

const addCloudEventLog = async (assetId, eventName, timestamp, title, icon, params = null, levelNo) => {

  const { rowCount } = await pg.addCloudEventLog(assetId, eventName, timestamp, title, icon, params, levelNo);
  if (rowCount > 0) {
    return rowCount;
  }

  console.warn('cloud event log not added for asset:', JSON.stringify({ assetId }));
  return null;
}


const addCloudEventLogDetail = async (assetId, eventName, timestamp, title, icon,
  type, levelno, logId, params) => {

  const { rowCount } = await pg.addCloudEventLogDetail(assetId, eventName, timestamp, title, icon,
    type, levelno, logId, params);
  if (rowCount > 0) {
    return rowCount;
  }

  console.warn('cloud event log detail not added for asset:', JSON.stringify({ assetId }));
  return null;
}

const addFullCloudEventLog = async (
  assetId,
  levelno,
  timestamp,
  eventName,
  eventMessage,
  eventTitle,
  eventIcon,
  eventType,
  userName,
  userEmail,
  params) => {

  const { rowCount } = await pg.addFullCloudEventLog(
    assetId,
    levelno,
    timestamp,
    eventName,
    eventMessage,
    eventTitle,
    eventIcon,
    eventType,
    userName,
    userEmail,
    params);

  if (rowCount === 0) {
    console.warn("Cloud event log values are not added/updated");
  }

  return rowCount;
}

module.exports = {
  addCloudEventLogWithUserInfo,
  addCloudEventLog,
  addFullCloudEventLog,
  getTimelineEventByEventNameAndTime,
  addCloudEventLogDetail
};
