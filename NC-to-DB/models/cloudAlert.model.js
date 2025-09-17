const pg = require("../utils/lib/pg");
const moment = require('moment');
const { cloudAlertEventNames, rowTrackingAnomalyTypes, timelineEventsAndCloudAlertIcons, cloudAlertEventTitles, cloudAlertMessages } = require("../utils/constants");
const { getIsLinkedRow } = require("./asset.model");

const addRowNotMovingAnomalyAlert = async (asset) => {
  const {isLinkedRow, linkRowType, linkRowRef} = await getIsLinkedRow(asset.id)
  await createRowTrackingAnomalyAlert(asset, rowTrackingAnomalyTypes.ROW_NOT_MOVING, isLinkedRow, linkRowType, linkRowRef);
};

const addRowNotFollowingAnomalyAlert = async (asset) => {
  const {isLinkedRow, linkRowType, linkRowRef} = await getIsLinkedRow(asset.id)
  await createRowTrackingAnomalyAlert(asset, rowTrackingAnomalyTypes.ROW_NOT_FOLLOWING, isLinkedRow, linkRowType, linkRowRef);
};

const createRowTrackingAnomalyAlert = async (
  asset,
  eventType,
  isLinkedRow = false,
  linkRowType,
  linkRowRef = null
) => {
  const timestamp = moment().utc().format();
  let icon, title, message, name;

  const getLeaderName = () =>
    isLinkedRow ? getRowName(asset, isLinkedRow, true) : "";
  const getFollowerName = () =>
    isLinkedRow ? getRowName({ row_no: linkRowRef }, isLinkedRow) : "";

  const generateAlertInfo = (eventTitle, messageFunction) => {
    icon = timelineEventsAndCloudAlertIcons.CLOUD_INTELLIGENCE_ALERT;
    name = cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY;

    if (isLinkedRow) {
      title = `${eventTitle}`;
      message = messageFunction(getLeaderName(), getFollowerName());
    } else {
      title = `${eventTitle}`;
      message = messageFunction(asset?.row_no, asset?.snap_addr);
    }
  };

  if (eventType === rowTrackingAnomalyTypes.ROW_NOT_FOLLOWING) {
    generateAlertInfo(
      cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE,
      isLinkedRow
        ? cloudAlertMessages.linkedRowNotFollowingMessage
        : cloudAlertMessages.rowNotFollowingMessage
    );
  } else if (eventType === rowTrackingAnomalyTypes.ROW_NOT_MOVING) {
    generateAlertInfo(
      cloudAlertEventTitles.ROW_NOT_MOVING_TITLE,
      isLinkedRow
        ? cloudAlertMessages.linkedRowNotMovingMessage
        : cloudAlertMessages.rowNotMovingMessage
    );
  }

  const args = {
    assetId: asset.id,
    eventName: name,
    timestamp,
    title,
    message,
    icon,
    params:{
      leaderName: getLeaderName(),
      followerName: getFollowerName(),
      linkRowType, 
      linkRowRef, 
      asset_type: asset.asset_type,
      name: asset.name,
      row_no: asset.row_no,
      snap_addr: asset.snap_addr
    }
  };
  return createCloudAlert(args);
};

const getCloudAlertDetail = async (assetId, eventName) => {
  const {rows} = await pg.getCloudAlertDetail(assetId, eventName);
  console.log("GET CLOUD ALERT DETAIL: ", rows);
  return rows?.length > 0 ? rows[0] : null;
};

const removeCloudAlert = async (assetId, eventName) => {
  const {rowCount} = await pg.deleteCloudAlert(assetId, eventName);
  if (rowCount > 0) {
    return true;
  }
  return false;
};

const removeCloudAlertById = async (cloudAlertId) => {
  const {rowCount} = await pg.deleteCloudAlertById(cloudAlertId);
  if (rowCount > 0) {
    return true;
  }
  return false;
};

const removeCloudAlertDetail = async (assetId, eventName) => {
  const data = await pg.deleteCloudAlertDetail(assetId, eventName);
  if (data?.rowCount > 0) {
    return data.rows[0];
  }
  console.log("removeCloudAlertDetail: ", assetId, eventName, data);
  return null;
};

const checkCloudAlertExist = async (assetId, eventNameArray) => {
  const {rows} = await pg.checkCloudAlertExist(assetId, eventNameArray);
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
};

const getCloudAlertByEventNameAndTitleLike = async (assetId, eventName, title) => {
  const res = await pg.getCloudAlertByEventNameAndTitleLike(assetId, eventName, title);

  if (res?.rows?.length >= 0) {
    return res.rows[0];
  }
  return null
}

const getCloudAlertById = async (cloudAlertId) => {
  const {rows} = await pg.getCloudAlertById(cloudAlertId);
  if (rows.length > 0) {
    return rows[0];
  } 
  return null;
};

const getCloudAlertDetailExcludingEventName = async (cloudAlertId, excludedEventName) => {
  const {rows} = await pg.getCloudAlertDetailExcludingEventName(cloudAlertId, excludedEventName);
  return rows;
};

const createCloudAlert = async (args) => {
  const { rows } = await pg.addCloudAlert(args);
  if (rows?.length > 0) {
    return rows[0];
  }
  console.warn('cloud alert not added for', JSON.stringify({ assetId: args.assetId }));
  return null;
};

const getRowName = (row, isLinked = false, isLeader = false) => {
  return `Row ${row.row_no}${createRowPart(row, isLinked, isLeader)}`;
}
const addMobileFasttrakAlert = async (args)=> {
  const { command, asset, source} = args
  const { layout } = asset;

  const alert = {
    assetId: asset.id,
    eventName: cloudAlertEventNames.MOBILE_FASTTRAK,
    title:`(${layout.name? layout.name+' | ':''}${layout.shorthand_name? layout.shorthand_name+' | ':''}${asset.snap_addr}): Mobile Fasttrak (${command})`,
    message: `Mobile Fasttrak (${command}) command executed on Row Box ${asset.snap_addr}`,
    icon: 'mobile_qc',
    params: {source, command},
    timestamp: moment().utc().format()
  }
  return createCloudAlert(alert);
}


const createRowPart = (info, isLinked, isLeader ) =>{
  const parts = [];
  if (isLinked && isLeader) parts.push('LEADER');
  if (isLinked && !isLeader) parts.push('FOLLOWER');
  if (info?.row_name) parts.push(info.row_name);
  if (info?.shorthand_name) parts.push(info.shorthand_name);
  if (info?.snap_addr) parts.push(info.snap_addr);
  return parts.length > 0 ? ` (${parts.join(" | ")})` : "";
}

const getCloudAlertByCloudAlertID = async (alertId) => {
  let res = await pg.getCloudAlertByCloudAlertID(alertId);
  if (res?.rows?.length > 0) {
    return res.rows[0];
  }
  return null
}

const getCloudAlertDetailByCloudAlertID = async (alertId) => {
  const res = await pg.getCloudAlertDetailByCloudAlertID(alertId);
  return res?.rows?.length > 0 ? res?.rows : [];
}

module.exports = {
  checkCloudAlertExist,
  getCloudAlertById,
  getCloudAlertByEventNameAndTitleLike,
  removeCloudAlertById,
  getCloudAlertByCloudAlertID,
  getCloudAlertDetailByCloudAlertID,
  getCloudAlertDetailExcludingEventName,
  createCloudAlert,
  removeCloudAlert,
  removeCloudAlertDetail,
  addRowNotMovingAnomalyAlert,
  addRowNotFollowingAnomalyAlert,
  addMobileFasttrakAlert,
  getCloudAlertDetail
};
