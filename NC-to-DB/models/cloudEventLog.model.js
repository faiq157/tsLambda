const pg = require('../utils/lib/pg');
const moment = require('moment');
const { rowTrackingAnomalyTypes, cloudAlertEventNames, cloudAlertEventTitles, NotificationTypes, cloudAlertMessages, timelineEventsAndCloudAlertIcons } = require("../utils/constants");
const { getIsLinkedRow } = require('./asset.model');

const addRowNotMovingAnomalyEventLog = async (asset) => {
  const {isLinkedRow, linkRowType, linkRowRef } = await getIsLinkedRow(asset.id)
  await createRowTrackingAnomalyEventLog(asset, rowTrackingAnomalyTypes.ROW_NOT_MOVING, false, isLinkedRow, linkRowType, linkRowRef);
};

const addRowNotFollowingAnomalyEventLog = async (asset) => {
  const {isLinkedRow, linkRowType, linkRowRef } = await getIsLinkedRow(asset.id)
  await createRowTrackingAnomalyEventLog(asset, rowTrackingAnomalyTypes.ROW_NOT_FOLLOWING, false, isLinkedRow, linkRowType,linkRowRef);
};

const addRowMovingAgainEventLog = async (asset, eventType) => {
  const {isLinkedRow, linkRowType, linkRowRef } = await getIsLinkedRow(asset.id)
  await createRowTrackingAnomalyEventLog(asset, eventType, true, isLinkedRow, linkRowType, linkRowRef);
};


const createRowTrackingAnomalyEventLog = async (asset, eventType, cleared, isLinkedRow = false, linkRowType, linkRowRef) => {
  const timestamp = moment().utc().format();
  let icon, name, title, message;

  const leaderName = isLinkedRow ? getRowName(asset, isLinkedRow, true) : "";
  const followerName = isLinkedRow ? getRowName({ row_no: linkRowRef }, isLinkedRow) : "";

  if (cleared) {
    icon = timelineEventsAndCloudAlertIcons.CLOUD_INTELLIGENCE_ALERT_CLEARED;
    name = cloudAlertEventNames.ROW_TRACKING_NORMALLY;

    if (isLinkedRow) {
      title = `${
        eventType == NotificationTypes.ANOMALY_ROW_NOT_MOVING
          ? cloudAlertEventTitles.ROW_MOVING_AGAIN
          : cloudAlertEventTitles.ROW_TRACKING_AGAIN
      }`;
      message = cloudAlertMessages.linkedRowMovingAgainMessage(leaderName, followerName);
    } else {
      title =
        eventType == NotificationTypes.ANOMALY_ROW_NOT_MOVING
          ? cloudAlertEventTitles.ROW_MOVING_AGAIN
          : cloudAlertEventTitles.ROW_TRACKING_AGAIN;
      message = cloudAlertMessages.rowMovingAgainMessage(asset?.row_no, asset?.snap_addr);
    }
  } else if (eventType == rowTrackingAnomalyTypes.ROW_NOT_FOLLOWING) {
    icon = timelineEventsAndCloudAlertIcons.CLOUD_INTELLIGENCE_ALERT;
    name = cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY;

    if (isLinkedRow) {
      title = `${cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE}`;
      message = cloudAlertMessages.linkedRowNotFollowingMessage(leaderName, followerName);
    } else {
      title = cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE;
      message = cloudAlertMessages.rowNotFollowingMessage(asset?.row_no, asset?.snap_addr);
    }
  } else if (eventType == rowTrackingAnomalyTypes.ROW_NOT_MOVING) {
    icon = timelineEventsAndCloudAlertIcons.CLOUD_INTELLIGENCE_ALERT;
    name = cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY;

    if (isLinkedRow) {
      title = `${cloudAlertEventTitles.ROW_NOT_MOVING_TITLE}`;
      message = cloudAlertMessages.linkedRowNotMovingMessage(leaderName, followerName);
    } else {
      title = cloudAlertEventTitles.ROW_NOT_MOVING_TITLE;
      message = cloudAlertMessages.rowNotMovingMessage(asset?.row_no, asset?.snap_addr);
    }
  }

  const args = {
    assetId: asset.id,
    name,
    timestamp,
    title,
    message,
    icon,
    params:{
      leaderName,
      followerName,
      linkRowType, 
      linkRowRef, 
      asset_type: asset.asset_type,
      name: asset.name,
      row_no: asset.row_no,
      snap_addr: asset.snap_addr
    }
  };
  return createCloudEventLog(args);
};

const createCloudEventLog = async (args) => {
  const { rows } = await pg.addCloudEventLog(args);
  if (rows?.length > 0) {
    return rows[0];
  }
  console.warn('cloud event not added for', JSON.stringify({ assetId: args.assetId }));
  return null;
};

const getRowName = (row, isLinked = false, isLeader = false) => {
  return `Row no ${row.row_no}${createRowPart(row, isLinked, isLeader)}`;
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

const createMobileFasttrakCloudEventLog = (args)=> {
  const {source, command, asset} = args
  const { layout } = asset

  // Adding mobile Fasttrak cloud event logs
  const eventObj = {
    assetId: asset.id,
    name: cloudAlertEventNames.MOBILE_FASTTRAK,
    timestamp: moment().utc().format(),
    title: `(${layout && layout.name ? layout.name + ' | ' : ''}${layout && layout.shorthand_name ? layout.shorthand_name + ' | ' : ''}${asset.snap_addr}): Mobile Fasttrak (${command})`,
    icon: 'mobile_qc',
    params: { source, command },
  };
  return createCloudEventLog(eventObj)
}

module.exports = {
  createCloudEventLog,
  createRowTrackingAnomalyEventLog,
  addRowMovingAgainEventLog,
  addRowNotFollowingAnomalyEventLog,
  addRowNotMovingAnomalyEventLog,
  createMobileFasttrakCloudEventLog
};
