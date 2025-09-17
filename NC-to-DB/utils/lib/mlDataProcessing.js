const remoteCache = require("../../utils/cache/remoteCache");
const {sendRowAnomalyNotifications} = require("../../services/notificationService");
const {checkCloudAlertExist, addRowNotFollowingAnomalyAlert, addRowNotMovingAnomalyAlert, removeCloudAlert, removeCloudAlertDetail, removeCloudAlertById, getCloudAlertDetail, getCloudAlertById, getCloudAlertDetailExcludingEventName} = require("../../models/cloudAlert.model");
const {addRowMovingAgainEventLog, addRowNotFollowingAnomalyEventLog, addRowNotMovingAnomalyEventLog} = require("../../models/cloudEventLog.model");
const {getEpochTime} = require("../../utils/helpers/functions");
const {reverse, clone} = require("lodash");
const {trackingModes, trackingStatus, cloudAlertEventNames, cloudAlertEventTitles, rowTrackingAnomalyTypes: anomalyTypes, NotificationTypes, LOCAL_ERRORS} = require("../../utils/constants");


const NOT_IN_TRACKING = 'NOT_IN_TRACKING', INSUFFICIENT_RECORDS = undefined;
const trackingModesArr = [trackingModes.TRACKING, trackingModes.TRAKING_WITH_BACKTRACKING, trackingModes.DIFUSE_TRACKING];
const trackingStatusArr = [trackingStatus.TRACKING_ONLY, trackingStatus.TRACKING_WITH_DIFFUSE, trackingStatus.TRACKING_WITH_BACKTRACKING];

const evaluateRowNotMovingAnomaly = (data, angleThreshold) => {
  // Setting initial state
  const [firstEvent] = data.splice(0, 1);
  let lastAngle = firstEvent['data']['rack.current_angle'];

  // This flag tells if angle was changed (during the whole period)
  // If the angle has changed, it indicates that the anomaly of the row not moving did not occur
  let angleChanged = false;

  for (const d of data) {
    if (Math.abs(d['data']['rack.current_angle'] - lastAngle) > parseFloat(angleThreshold)) {
      angleChanged = true;
      break;
    }
  }
  return {angleChanged};
};

const evaluateRowNotFollowingAnomaly = (data, angleThreshold, clearAngleThreshold) => {
  // If the angle and requested angle difference is less the anomaly_row_tracking_angle_threshold,
  // it indicates the Row Not Following Target Angle anomaly did not occur
  let normalTracking = false;

  for (const d of data) {
    const {data: rackData} = d;
    const cAngle = rackData['rack.current_angle'];
    const rAngle = rackData['rack.requested_angle'];
    if (Math.abs(parseInt(rAngle) - parseInt(cAngle)) <= angleThreshold) {
      normalTracking = true;
      break;
    }
  }

  let currentAngleChanged = false;
  if (clearAngleThreshold) {
    const [firstEvent] = data.splice(0, 1);
    let lastAngle = firstEvent.data['rack.current_angle'];
    for (const d of data) {
      if (Math.abs(d.data['rack.current_angle'] - lastAngle) > parseFloat(clearAngleThreshold)) {
        currentAngleChanged = true;
        break;
      }
    }
  }
  return clearAngleThreshold ? {normalTracking: normalTracking && currentAngleChanged} : {normalTracking};
};

const shouldClearAlert = (rowNotMoving, rowNotFollowing, alertExist) => {
  return alertExist && (
    (!rowNotMoving && alertExist.title == cloudAlertEventTitles.ROW_NOT_MOVING_TITLE) ||
    (!rowNotFollowing && alertExist.title == cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE) ||
    (!rowNotFollowing && !rowNotMoving)
  );
};

/*
 * If Row tracking alert is a child of Tracking W/Backtracking alert, and there
 * is no other child alert, then remove Tracking W/B-Tracking Alert as well
 */
const deleteCloudAlertDetail = async (alertDetail, assetId) => {
  console.log("Delete Cloud Alert Detail: ", alertDetail, assetId);
  if (!alertDetail) return;
  await removeCloudAlertDetail(assetId, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
  console.log("Cloud Alert Detail Removed");
  const parentAlert = await getCloudAlertById(alertDetail.cloud_alert_id);
  console.log("Parent Alert Exist: ", alertDetail.cloud_alert_id, parentAlert);
  if (parentAlert?.event_name === cloudAlertEventNames.NC_COMMANDED_STATE && parentAlert?.title === cloudAlertEventTitles.TRACKING_WITH_BACKTRACKING) {
    console.log("Parent Alert is a Tracking w/Backtracking Alert", )
    const childAlert = await getCloudAlertDetailExcludingEventName(alertDetail.cloud_alert_id, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
    console.log("CHILD ALERT COUNTS: ", alertDetail.cloud_alert_id, childAlert);
    if (childAlert.length == 0) {
      const resp = await removeCloudAlertById(alertDetail.cloud_alert_id);
      console.log("Parent Cloud Alert Removed: ", resp);
    }
  }
};

const checkAddAndRemoveAlerts = async (asset, alertExist, notMovingDuration, notFollowingDuration, rowNotMoving, rowNotFollowing) => {
  let notificationType = null, alertCleared = false, snapAddr = asset.snap_addr, rowNo = asset.row_no, createdAlert, createdEvent;
  const alertDetailExist = await getCloudAlertDetail(asset.id, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
  let duration = null;
  // Remove Alert
  if (shouldClearAlert(rowNotMoving, rowNotFollowing, alertExist)) {
    console.log("checkAddAndRemoveAlerts :", alertExist, rowNotMoving, rowNotFollowing, alertDetailExist, asset);
    alertCleared = true;
    notificationType = (alertExist.title === cloudAlertEventTitles.ROW_NOT_MOVING_TITLE ? NotificationTypes.ANOMALY_ROW_NOT_MOVING : NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING);
    await deleteCloudAlertDetail(alertDetailExist, asset.id);
    await removeCloudAlert(asset.id, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
    createdEvent = await addRowMovingAgainEventLog(asset, notificationType);

  } else if (!alertExist && alertDetailExist && !rowNotMoving && !rowNotFollowing) {
    /*
     * If an alert was removed at the time, when it was not added as a child
     * alert (due to which it didn't remove from cloud_alert_detail)
     */
    await deleteCloudAlertDetail(alertDetailExist, asset.id);
  } else if (!alertExist && (rowNotFollowing || rowNotMoving)) {
    // If LOCAL_ERROR against this asset already exist, then do not add ROW TRACKING ALERT
    const localErrorExist = await checkCloudAlertExist(asset.id, LOCAL_ERRORS);
    if (localErrorExist) {
      return;
    }    // Add an Alert
    if (rowNotMoving && rowNotMoving != NOT_IN_TRACKING) {
      notificationType = NotificationTypes.ANOMALY_ROW_NOT_MOVING;
      createdEvent = await addRowNotMovingAnomalyEventLog(asset);
      createdAlert = await addRowNotMovingAnomalyAlert(asset);
      duration = notMovingDuration;
    } else if (rowNotFollowing && rowNotFollowing != NOT_IN_TRACKING) {
      notificationType = NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING;
      createdEvent = await addRowNotFollowingAnomalyEventLog(asset)
      createdAlert = await addRowNotFollowingAnomalyAlert(asset)
      duration = notFollowingDuration;
    }
  }
  console.log("ALERT DOESN'T EXIST AND ANOMALY OCCURRED => ADD ALERT & TIMELINE EVENT", createdAlert, createdEvent);
  notificationType && await sendRowAnomalyNotifications(notificationType, snapAddr, rowNo, duration, alertCleared);
};

const getRowTrackingAnomalies = async (data, angleThreshold, duration, anomalyType, alertAlreadyExist, clearAngleThreshold) => {
  if (alertAlreadyExist) {
    if (anomalyType === anomalyTypes.ROW_NOT_FOLLOWING) {
      const {normalTracking} = evaluateRowNotFollowingAnomaly([...data], angleThreshold, clearAngleThreshold);
      return !normalTracking;
    } else if (anomalyType === anomalyTypes.ROW_NOT_MOVING) {
      const {angleChanged} = evaluateRowNotMovingAnomaly([...data], angleThreshold);
      return !angleChanged;
    }
  }
  if (anomalyType === anomalyTypes.ROW_NOT_FOLLOWING) {
    const {normalTracking} = evaluateRowNotFollowingAnomaly([...data], angleThreshold);
    const validateRowNotFollowing = (!normalTracking && validateRowAnomaly(data, duration));
    return validateRowNotFollowing;
  } else if (anomalyType === anomalyTypes.ROW_NOT_MOVING) {
    const {angleChanged} = evaluateRowNotMovingAnomaly([...data], angleThreshold);
    const validateRowNotMoving = (!angleChanged && validateRowAnomaly(data, duration));
    return validateRowNotMoving;
  }
};

const validateRowAnomaly = (data, duration) => {
  const firstEvent = data[0];
  const lastEvent = data[data.length -1];
  const startTime = new Date(firstEvent.timestamp).getTime();
  const endTime = new Date(lastEvent.timestamp).getTime();
  const diffInSec = Math.abs(endTime - startTime) / 1000; // diff should always be a positive value, to compare it with duration
  const diffInMin = diffInSec / 60;
  return diffInMin >= duration;
};

const processDataForTrackingAnomaly = async (rackEvent, angleThreshold, duration, anomalyType, alertAlreadyExist, clearAngleThreshold) => {
  const {startTime, endTime} = getEpochTime(rackEvent.timestamp, duration);

  const resp = await remoteCache.getStreamMulti([
    /*
     * Here we'll fetch only one previous record or a record at the exact start time
     * So that, if we do not have a record at the exact start time at least it will return us a record before that
     * to know the previous state
     */
    (client) => remoteCache.getRackHistReverseOrder(rackEvent.snap_addr, startTime, '-', {COUNT: 1}, client),
    /*
     * Here we fetch data for 1 m/s less than the required time
     * e.g. if duration should be 5 mins, then we'll first fetch records for 1 millisecond less than that
     */
    (client) => remoteCache.getRackHist(rackEvent.snap_addr, (parseInt(startTime) + 1).toString(), endTime, null, client)
  ]);
  let rackData = [...resp.dbFormat[0] || [], ...resp.dbFormat[1] || []];

  if (alertAlreadyExist) {
    rackData = removeRackAngleEventsPriorToNonTrackingModeEvent(rackData);
  } else {
    console.log("Rack Data: ", rackData);
    const notInTracking = rackData.find(d => !trackingModesArr.includes(d?.data?.['tracking.mode']) || !trackingStatusArr.includes(d?.data?.['asset.tracking_status']));
    console.log("RACK ANGLE DATA: ", notInTracking, startTime, endTime);
    // If row is not in tracking mode or the rack history has 0 or 1 records then do not process data
    if (notInTracking) {
      return NOT_IN_TRACKING;
    }
  }
  if (rackData?.length <= 1) {
    return INSUFFICIENT_RECORDS;
  }

  // If row is in tracking throughout the time
  return getRowTrackingAnomalies(rackData, angleThreshold, duration, anomalyType, alertAlreadyExist, clearAngleThreshold);
};

const filterCondition = (item) => !trackingModesArr.includes(item?.data?.['tracking.mode']) || !trackingStatusArr.includes(item?.data?.['asset.tracking_status']);
/*
 * Here we'll filter out all the records prior to the event where site was in
 * Non Tracking Mode (This is only executed if alert already exists)
 */
const removeRackAngleEventsPriorToNonTrackingModeEvent = (rackData) => {
  const newRackData = [];
  // currently rackData is in Ascending order w.r.t timestamp
  // and this for loop will be executed in reverse order
  // and newRackData will be in Descending order
  // that's why, we'll reverse the array to make it ascending again
  for (let i = rackData.length - 1; i >= 0 ; i--) {
    if (filterCondition(rackData[i])) {
      break;
    }
    newRackData.push(rackData[i]);
  }
  console.log("NEW RACK DATA: ", newRackData);
  return reverse(clone(newRackData));
};

const checkAnomalyConfigAndProcessData = async (project, asset, rackHist) => {
  let notMovingAnomaly = null, notFollowingAnomaly = null, durationNotMoving = null, durationNotFollowing = null;
  const alertExist = await checkCloudAlertExist(asset.id, [cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY]);
  const anomalyType = getAnomalyType(alertExist);
  console.log("ALERT EXIST: ", alertExist, anomalyType);
  if (project?.anomaly_row_not_moving) {
    const {anomaly_row_not_moving_angle_threshold: angleThreshold} = project;
    durationNotMoving = project.anomaly_row_not_moving_duration;
    notMovingAnomaly = await processDataForTrackingAnomaly(rackHist, angleThreshold, durationNotMoving, anomalyTypes.ROW_NOT_MOVING, anomalyType === anomalyTypes.ROW_NOT_MOVING);
  }
  if (project?.anomaly_row_not_following) {
    // Clear angle threshold is used to detect, if rackAngle is changing
    const {anomaly_row_not_following_angle_threshold: angleThreshold, anomaly_row_not_following_clear_angle_threshold: clearAngleThreshold} = project;
    durationNotFollowing = project.anomaly_row_not_following_duration;
    notFollowingAnomaly = await processDataForTrackingAnomaly(rackHist, angleThreshold, durationNotFollowing, anomalyTypes.ROW_NOT_FOLLOWING, anomalyType === anomalyTypes.ROW_NOT_FOLLOWING, clearAngleThreshold);
  }
  console.log({"not_moving_anomaly": notMovingAnomaly, "not_following_anomaly": notFollowingAnomaly, asset, project, rackHist});
  if (stopProcessingData(notMovingAnomaly, notFollowingAnomaly)) {
    return;
  }
  await checkAddAndRemoveAlerts(asset, alertExist, durationNotMoving, durationNotFollowing, notMovingAnomaly, notFollowingAnomaly);
};

const stopProcessingData = (notMovingAnomaly, notFollowingAnomaly) => {
  if (notMovingAnomaly == NOT_IN_TRACKING && notFollowingAnomaly == NOT_IN_TRACKING) {
    return true;
  } else if (notMovingAnomaly == NOT_IN_TRACKING && notFollowingAnomaly == INSUFFICIENT_RECORDS) {
    return true;
  } else if (notMovingAnomaly == INSUFFICIENT_RECORDS && notFollowingAnomaly == NOT_IN_TRACKING) {
    return true;
  } else if (notMovingAnomaly == INSUFFICIENT_RECORDS && notFollowingAnomaly == INSUFFICIENT_RECORDS) {
    return true;
  } else {
    return false;
  }
};

const getAnomalyType = (alertExist) => {
  let alertType = false;
  if (!alertExist) {
    return alertType;
  }
  switch (alertExist.title) {
    case cloudAlertEventTitles.ROW_NOT_MOVING_TITLE:
      alertType = anomalyTypes.ROW_NOT_MOVING;
      break;
    case cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE:
      alertType = anomalyTypes.ROW_NOT_FOLLOWING;
      break;
    default:
      alertType = false;
  }
  return alertType;
};

module.exports = {
  checkAnomalyConfigAndProcessData
};
