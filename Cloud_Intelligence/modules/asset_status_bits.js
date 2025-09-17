const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
const { getAssetInfoById } = require("../pg");
var Handlebars = require("handlebars");
const utils = require("../utils");
const { getS3EmailAssetsUrl, isLinkedRow } = require("../utils/libs/functions");
const { cloudAlertService } = require("../services/cloudAlertService");
const { notificationSettingService } = require("../services/notificationSettingService");
const { notificationService } = require("../services/common/notificationService");
const { CloudAlertsHelperModel } = require("../models/cloudAlertsHelper.model");
const { getAssetAndSiteLayoutByAssetId } = require("../models/asset.model");
const { getDeviceTypeNameFromAssetType } = require("../utils/constants");

const EVENT_NAMES = {
  1: "NO-CONNECTION_WITH_NC",
  2: "MOTOR-CURRENT-HW-FAULT",
  4: "MOTOR-FAULT-TIMEOUT",
  8: "CHARGER_FAULT",
  16: "MOTOR-CURRENT_SW_FAULT",
  32: "LOW-BATTERY_STOW",
  64: "LOW-TEMP_RESTRICTED_MOVEMENT",
  128: "ESTOP-Engaged",
  821: "ESTOP-Disengaged"
};
const EVENT_MSG = {
  1: "Cannot communicate with Network Controller",
  2: "Motor Current Fault Detected (HW)",
  4: "Motor Fault Detected (Timeout)",
  8: "Charger Fault",
  16: "Motor Current Fault Detected (SW)",
  32: "Low Battery Auto Stow",
  64: "Low Temperature Restricted Movement",
  128: "Local Emergency Stop Button Engaged",
  821: "Local Emergency Stop button Disengaged"
};
const EVENT_ICONS = {
  1: "mode_tracking_fault",
  2: "mode_tracking_fault",
  4: "mode_maintenance",
  8: "battery_damage",
  16: "mode_tracking_fault",
  32: "battery_low",
  64: "mode_tracking_fault",
  128: "mode_tracking_engaged",
  821: "mode_tracking"
};
const BITS_STATUS = {
  1: "Cannot communicate with Network Controller",
  // (This can trigger "auto-stow" for example)
  2: "Motor Current Fault Detected (HW)",
  // This is the hardware limit
  4: "Motor Fault Detected (Timeout)",
  8: "Charger Fault",
  16: "Motor Current Fault Detected (SW)",
  // This is the software limit (contrast with bit 0x02)
  32: "Low Battery Auto Stow",
  // An auto-stow command coincides with this bit getting set.
  // The bit remains set until the battery has recharged past the hysteresis threshold.
  64: "Low Temperature Restricted Movement",
  // Unlike bit 0x20, this fault does not trigger an auto-stow
  // ("don't try to move": "don't try to move"!)
  128: "Emergency Stop engaged (NCCB)"
};
const getStatusBit = (status) => {
  let arr = [];
  [1, 2, 4, 8, 16, 32, 64, 128].forEach((item) => {
    if ((item & status) === item) {
      arr = [...arr, item];
    }
  });
  return arr;
};
const statusBits = (status) => {
  let arr = [];
  [1, 2, 4, 8, 16, 32, 64, 128].forEach((item) => {
    if ((item & status) === item) {
      arr = [...arr, BITS_STATUS[item & status]];
    }
  });
  return arr;
};


const containsEmergencyStopStatus = (statusList) => {
  let status = false;
  statusList.forEach((item) => {
    if (item === "Emergency Stop engaged (NCCB)") {
      status = true;
    }
  });
  return status;
};

const containsChargerFault = (statusList) => {
  let status = false;
  statusList.forEach((item) => {
    if (item === "Charger Fault") {
      status = true;
    }
  });
  return false;
};

const containsLowTemperatureRestrictedMovement = (statusList) => {
  let status = false;
  statusList.forEach((item) => {
    if (item === "Low Temperature Restricted Movement") {
      status = true;
    }
  });
  //depricated bit alerts
  return false;
};

const containsLowBatteryStow = (statusList) => {
  let status = false;
  statusList.forEach((item) => {
    if (item === "Low Battery Auto Stow") {
      status = true;
    }
  });
  return status;
};

const containsMotorCurrentSoftwareFault = (statusList) => {
  let status = false;
  statusList.forEach((item) => {
    if (item === "Motor Current Fault Detected (SW)") {
      status = true;
    }
  });
  return status;
};

const containsMotorFaultTimeout = (statusList) => {
  let status = false;
  statusList.forEach((item) => {
    if (item === "Motor Fault Detected (Timeout)") {
      status = true;
    }
  });
  return status;
};

const containsMotorCurrentHardwareFault = (statusList) => {
  let status = false;
  statusList.forEach((item) => {
    if (item === "Motor Current Fault Detected (HW)") {
      status = true;
    }
  });
  return status;
};

const containsNoCommunicationWithNC = (statusList) => {
  let status = false;
  statusList.forEach((item) => {
    if (item === "Cannot communicate with Network Controller") {
      status = true;
    }
  });
  return status;
};

const addCloudAlertQuery = `
INSERT INTO terrasmart.cloud_alert(event_name,created,asset_id,type,active,title,icon, levelno)
VALUES ($1 :: VARCHAR, $2 :: TIMESTAMP,$3 :: UUID, $4 :: INT, $5 :: Boolean,$6::VARCHAR,$7::VARCHAR, $8::INT)
`;

const cloudEventLogQuery = `
INSERT INTO terrasmart.cloud_event_log (name,levelno,created,asset_id,type,title,icon)
VALUES ($1 :: VARCHAR, $2 :: INT, $3 :: TIMESTAMP,$4 :: UUID, $5::INT ,$6::VARCHAR,$7 :: VARCHAR)
`;
const checkAlertQuery = `
SELECT * FROM terrasmart.cloud_alert
WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true
ORDER BY created DESC limit 1`;

const addAlert = async (pgWrite, payload, assetInfo, bit, levelNo = 20) => {
  let res = null;
  try {
    console.log("Event ===>", EVENT_NAMES[bit]);
    res = await pgWrite.query(addCloudAlertQuery, [
      assetInfo.device_type === "Network Controller"
        ? "NC-" + EVENT_NAMES[bit]
        : "ASSET-" + EVENT_NAMES[bit],
      new Date(payload.timestamp),
      payload.asset_id,
      assetInfo.device_type === "Network Controller" ? 1 : 2,
      true,
      EVENT_MSG[bit],//await getTitle(assetInfo, EVENT_MSG[bit], payload),
      EVENT_ICONS[bit],
      levelNo
    ]);
  } catch (exception) {
    console.log(EVENT_NAMES[bit] + " Alert Exception: ", exception);
  } finally {
    // pgWrite.end();
  }

  return res;
};

const addEventLog = async (pgWrite, payload, assetInfo, bit, levelNo = 20) => {
  let res = null;
  try {
    await pgWrite.query(cloudEventLogQuery, [
      assetInfo.device_type === "Network Controller"
        ? "NC-" + EVENT_NAMES[bit]
        : "ASSET-" + EVENT_NAMES[bit],
      levelNo,
      new Date(payload.timestamp),
      payload.asset_id,
      assetInfo.device_type === "Network Controller" ? 1 : 2,
      await EVENT_MSG[bit],//getTitle(assetInfo, EVENT_MSG[bit], payload),
      EVENT_ICONS[bit],
    ]);
  } catch (exception) {
    console.log(EVENT_NAMES[bit] + " Log Exception: ", exception);
  } finally {
    // pgWrite.end();
  }
  return res;
};

const clearAlert = async (pgWrite, payload, alertId) => {
  let res = null;
  try {
    res = await pgWrite.query(db.updateCLoudAlertQuery, [
      new Date(payload.timestamp),
      alertId,
    ]);
    console.log("Delete Cloud Alert: ", alertId);
    await cloudAlertService.clearAlertDetail(pgWrite, alertId);

    res = await pgWrite.query(db.removeCloudAlert, [alertId]);
    //clear Alert Details
  } catch (exception) {
    console.log("Clear Alert (" + alertId + ") Exception: ", exception);
  } finally {
    // pgWrite.end();
  }
  return res;
};

const getActiveAlert = async (client, payload, assetInfo, bit) => {
  return await client.query(checkAlertQuery, [
    payload.asset_id,
    assetInfo.device_type === "Network Controller"
      ? "NC-" + EVENT_NAMES[bit]
      : "ASSET-" + EVENT_NAMES[bit],
  ]);
};


const handleNoCommunicationWithNC = async (
  client,
  pgWrite,
  payload,
  assetInfo,
  linkedRowDetails
) => {
  console.log("handleNoCommunicationWithNC");
  const statusBitsList = statusBits(payload.status_bits);
  let bit = 1;
  //check already alert generated
  const checkAlert = await getActiveAlert(client, payload, assetInfo, bit);
  try {
    if (containsNoCommunicationWithNC(statusBitsList)) {
      //if not add new alert else ignore
      if (checkAlert.rows.length === 0) {
        const {
          linkRowType,
          linkRowRef,
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
        } = linkedRowDetails;

        if (isLinkedRow(linkRowType, linkRowRef,  assetInfo.device_type)) {

          const notificationsOptions = {
            isNotify: assetInfo?.is_status_bits_notify || false,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            assetId: payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          await CloudAlertsHelperModel.addNoConnectionWithNCAlert(
            pgWrite,
            leaderInfo,
            childInfo,
            true,
            notificationsOptions
          );
        } else {
          //add new alert
          await addAlert(pgWrite, payload, assetInfo, bit);
          //add event log
          await addEventLog(pgWrite, payload, assetInfo, bit);
          assetInfo.status_text = EVENT_MSG[bit];
          assetInfo.timestamp = payload.timestamp;
          if (assetInfo.is_status_bits_notify)
            processAssetStatusNotifications(assetInfo);
        }

      }
    } else {
      //if created flag inactive it
      if (checkAlert.rows.length > 0) {
        //flag it inactive
        await clearAlert(pgWrite, payload, checkAlert.rows[0].id);
      }
    }
  } catch (exception) {
    console.log("Exception in NoCommunicationWithNC ", exception);
  }
};

const handleMotorCurrentHardwareFault = async (
  client,
  pgWrite,
  payload,
  assetInfo,
  linkedRowDetails
) => {
  console.log("handleMotorCurrentHardwareFault");
  const statusBitsList = statusBits(payload.status_bits);
  let bit = 2;
  //check already alert generated
  const checkAlert = await getActiveAlert(client, payload, assetInfo, bit);
  try {
    if (containsMotorCurrentHardwareFault(statusBitsList)) {
      //if not add new alert else ignore
      if (checkAlert.rows.length === 0) {
        const {
          linkRowType,
          linkRowRef,
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
        } = linkedRowDetails;
        if (isLinkedRow(linkRowType, linkRowRef,  assetInfo.device_type)){

          const notificationsOptions = {
            isNotify: assetInfo?.is_status_bits_notify || false,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            assetId: payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          await CloudAlertsHelperModel.addMotorCurrentHardwareFaultAlert(
            pgWrite,
            leaderInfo,
            childInfo,
            true,
            notificationsOptions
          );
        } else {
          //add new alert
          await addAlert(pgWrite, payload, assetInfo, bit, 30);
          //add event log
          await addEventLog(pgWrite, payload, assetInfo, bit, 30);
          assetInfo.status_text = EVENT_MSG[bit];
          assetInfo.timestamp = payload.timestamp;
          if (assetInfo.is_status_bits_notify)
            processAssetStatusNotifications(assetInfo);
        }
      }
    } else {
      //if created flag inactive it
      if (checkAlert.rows.length > 0) {
        //flag it inactive
        await clearAlert(pgWrite, payload, checkAlert.rows[0].id);
      }
    }
  } catch (exception) {
    console.log("Exception in MotorCurrentHardwareFault ", exception);
  }
};

const handleMotorFaultTimeout = async (client, pgWrite, payload, assetInfo, linkedRowDetails) => {
  console.log("handleMotorFaultTimeout");
  const statusBitsList = statusBits(payload.status_bits);
  let bit = 4;
  //check already alert generated
  const checkAlert = await getActiveAlert(client, payload, assetInfo, bit);
  try {
    if (containsMotorFaultTimeout(statusBitsList)) {
      //if not add new alert else ignore
      if (checkAlert.rows.length === 0) {
        const {
          linkRowType,
          linkRowRef,
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
        } = linkedRowDetails;
        if (isLinkedRow(linkRowType, linkRowRef,  assetInfo.device_type)) {

          const notificationsOptions = {
            isNotify: assetInfo?.is_status_bits_notify || false,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            assetId: payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          await CloudAlertsHelperModel.addMotorFaultTimeoutAlert(
            pgWrite,
            leaderInfo,
            childInfo,
            true,
            notificationsOptions
          );
        } else {
        //add new alert
        await addAlert(pgWrite, payload, assetInfo, bit, 30);
        //add event log
        await addEventLog(pgWrite, payload, assetInfo, bit, 30);
        assetInfo.status_text = EVENT_MSG[bit];
        assetInfo.timestamp = payload.timestamp;
        if (assetInfo.is_status_bits_notify)
          processAssetStatusNotifications(assetInfo);
        }
      }
    } else {
      //if created flag inactive it
      if (checkAlert.rows.length > 0) {
        //flag it inactive
        await clearAlert(pgWrite, payload, checkAlert.rows[0].id);
      }
    }
  } catch (exception) {
    console.log("Exception in MotorFaultTimeout ", exception);
  }
};

const handleMotorCurrentSoftwareFault = async (
  client,
  pgWrite,
  payload,
  assetInfo,
  linkedRowDetails
) => {
  console.log("handleMotorCurrentSoftwareFault");
  const statusBitsList = statusBits(payload.status_bits);
  let bit = 16;
  //check already alert generated
  const checkAlert = await getActiveAlert(client, payload, assetInfo, bit);
  try {
    if (containsMotorCurrentSoftwareFault(statusBitsList)) {
      //check already alert generated
      //if not add new alert else ignore
      if (checkAlert.rows.length === 0) {
        const {
          linkRowType,
          linkRowRef,
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
        } = linkedRowDetails;
        if (isLinkedRow(linkRowType, linkRowRef,  assetInfo.device_type)) {

          const notificationsOptions = {
            isNotify: assetInfo?.is_status_bits_notify || false,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            assetId: payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          await CloudAlertsHelperModel.addMotorCurrentSoftwareFaultAlert(
            pgWrite,
            leaderInfo,
            childInfo,
            true,
            notificationsOptions
          );
        } else {
          //add new alert
          await addAlert(pgWrite, payload, assetInfo, bit, 30);
          //add event log
          await addEventLog(pgWrite, payload, assetInfo, bit, 30);
          assetInfo.status_text = EVENT_MSG[bit];
          assetInfo.timestamp = payload.timestamp;
          if (assetInfo.is_status_bits_notify)
            processAssetStatusNotifications(assetInfo);
        }
      }
    } else {
      //if created flag inactive it
      if (checkAlert.rows.length > 0) {
        //flag it inactive
        await clearAlert(pgWrite, payload, checkAlert.rows[0].id);
      }
    }
  } catch (exception) {
    console.log("Exception in MotorCurrentSoftwareFault ", exception);
  }
};
const handleLowTemperatureRestrictedMovement = async (
  client,
  pgWrite,
  payload,
  assetInfo,
  linkedRowDetails
) => {
  console.log("handleLowTemperatureRestrictedMovement");
  const statusBitsList = statusBits(payload.status_bits);
  let bit = 64;
  //check already alert generated
  const checkAlert = await getActiveAlert(client, payload, assetInfo, bit);
  try {
    if (containsLowTemperatureRestrictedMovement(statusBitsList)) {
      //check already alert generated
      //if not add new alert else ignore
      if (checkAlert.rows.length === 0) {
        const {
          linkRowType,
          linkRowRef,
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
        } = linkedRowDetails;
        if (isLinkedRow(linkRowType, linkRowRef,  assetInfo.device_type)) {

          const notificationsOptions = {
            isNotify: assetInfo?.is_status_bits_notify || false,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            assetId: payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          await CloudAlertsHelperModel.addLowTempRestrictedMovementAlert(
            pgWrite,
            leaderInfo,
            childInfo,
            true,
            notificationsOptions
          );
        } else {
          //add new alert
          await addAlert(pgWrite, payload, assetInfo, bit);
          //add event log
          await addEventLog(pgWrite, payload, assetInfo, bit);
          assetInfo.status_text = EVENT_MSG[bit];
          assetInfo.timestamp = payload.timestamp;
          if (assetInfo.is_status_bits_notify)
            processAssetStatusNotifications(assetInfo);
        }
      }
    } else {
      //if created flag inactive it
      if (checkAlert.rows.length > 0) {
        //flag it inactive
        await clearAlert(pgWrite, payload, checkAlert.rows[0].id);
      }
    }
  } catch (exception) {
    console.log("Exception in LowBatteryStow ", exception);
  }
};

const handleChargerFault = async (client, pgWrite, payload, assetInfo, linkedRowDetails) => {
  console.log("handleChargerFault");
  const statusBitsList = statusBits(payload.status_bits);
  let bit = 8;
  //check already alert generated
  const checkAlert = await getActiveAlert(client, payload, assetInfo, bit);
  try {
    if (containsChargerFault(statusBitsList)) {
      //check already alert generated
      //if not add new alert else ignore
      if (checkAlert.rows.length === 0) {
        const {
          linkRowType,
          linkRowRef,
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
        } = linkedRowDetails;
        if (isLinkedRow(linkRowType, linkRowRef,  assetInfo.device_type)) {

          const notificationsOptions = {
            isNotify: assetInfo?.is_status_bits_notify || false,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            assetId: payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          await CloudAlertsHelperModel.addChargerFaultAlert(
            pgWrite,
            leaderInfo,
            childInfo,
            true,
            notificationsOptions
          );
        } else {
          //add new alert
          await addAlert(pgWrite, payload, assetInfo, bit);
          //add event log
          await addEventLog(pgWrite, payload, assetInfo, bit);
          assetInfo.status_text = EVENT_MSG[bit];
          assetInfo.timestamp = payload.timestamp;
          if (assetInfo.is_status_bits_notify)
            processAssetStatusNotifications(assetInfo);
        }
      }
    } else {
      //if created flag inactive it
      if (checkAlert.rows.length > 0) {
        //flag it inactive
        await clearAlert(pgWrite, payload, checkAlert.rows[0].id);
      }
    }
  } catch (exception) {
    console.log("Exception in ChargerFault ", exception);
  }
};

const handleLowBatteryAutoStow = async (
  client,
  pgWrite,
  payload,
  assetInfo,
  linkedRowDetails
) => {
  console.log("handleLowBatteryAutoStow");
  const statusBitsList = statusBits(payload.status_bits);
  let bit = 32;
  //check already alert generated
  const checkAlert = await getActiveAlert(client, payload, assetInfo, bit);
  try {
    if (containsLowBatteryStow(statusBitsList)) {
      //check already alert generated
      //if not add new alert else ignore
      if (checkAlert.rows.length === 0) {
        const {
          linkRowType,
          linkRowRef,
          row_id,
          row_name,
          shorthand_name,
          asset_name,
          snap_addr,
        } = linkedRowDetails;
        if (isLinkedRow(linkRowType, linkRowRef,  assetInfo.device_type)) {

          const notificationsOptions = {
            isNotify: assetInfo?.is_status_bits_notify || false,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            assetId: payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          await CloudAlertsHelperModel.addLowBatteryStowAlert(
            pgWrite,
            leaderInfo,
            childInfo,
            true,
            notificationsOptions
          );
        } else {
          //add new alert
          await addAlert(pgWrite, payload, assetInfo, bit);
          //add event log
          await addEventLog(pgWrite, payload, assetInfo, bit);
          assetInfo.status_text = EVENT_MSG[bit];
          assetInfo.timestamp = payload.timestamp;
          if (assetInfo.is_status_bits_notify)
            processAssetStatusNotifications(assetInfo);
        }
      }
    } else {
      //if created flag inactive it
      if (checkAlert.rows.length > 0) {
        //flag it inactive
        await clearAlert(pgWrite, payload, checkAlert.rows[0].id);
      }
    }
  } catch (exception) {
    console.log("Exception in LowBatteryStow ", exception);
  }
};

const handleEmergencyStop = async (client, pgWrite, payload, assetInfo, linkedRowDetails) => {
  console.log("handleEmergencyStop");
  const statusBitsList = statusBits(payload.status_bits);
  const eStopButtonEngaged = containsEmergencyStopStatus(statusBitsList);
  const assetRes = await getAssetInfoById(client, payload.asset_id);
  let notificationtype = "rc_";
  if (assetInfo.device_type === "Row Controller") notificationtype = "rc_";
  if (assetInfo.device_type === "Weather Station") return // notificationtype = "ws_";
  if (assetInfo.device_type === "Network Controller") notificationtype = "nc_";
  notificationtype = notificationtype + "estop";
  var userAccounts = await notificationSettingService.getAccounts(
    client,
    assetInfo.site_id,
    notificationtype
  );
  assetInfo.emailAddrs = userAccounts.emails;
  assetInfo.phoneNumbers = userAccounts.phone_nums;
  if (eStopButtonEngaged) {
    let oldStatusBit = null;
    if (assetRes.rows.length !== 0) {
      oldStatusBit = assetRes.rows[0].last_status_bits;
    }
    // if (oldStatusBit != null) {
    /* const oldStatusBitsList = statusBits(oldStatusBit);
      let oldEStopButtonEngaged = containsEmergencyStopStatus(
        oldStatusBitsList
      );

      let addAlertFlag = false;
      if (!oldEStopButtonEngaged) {
        await statusBitsList.forEach(async (data) => {
          if (data === "Emergency Stop engaged (NCCB)") {
            console.log("Emergency Stop engaged");
            addAlertFlag = true;
          }
        });
        console.log("ADDALERT ", addAlertFlag);*/
    // if (addAlertFlag) {
    //Add the cloud alerts as active
    //check if already no active alert exists
    const {
      linkRowType,
      linkRowRef,
      row_id,
      row_name,
      shorthand_name,
      asset_name,
      snap_addr,
    } = linkedRowDetails;
    if (isLinkedRow(linkRowType, linkRowRef,  assetInfo.device_type)) {

      const notificationsOptions = {
        isNotify: assetInfo?.is_status_bits_notify || false,
        locationLat: assetInfo?.location_lat ,
        locationLng: assetInfo?.location_lng,
        created: payload.timestamp,
        deviceType: assetInfo?.device_type,
        siteId: assetInfo?.site_id,
        siteName: assetInfo?.site_name,
        multipleSites: assetInfo?.multipleSites,
        projectName: assetInfo?.project_name,
        projectLocation: assetInfo?.project_location,
      };

      const leaderInfo = {
        row_id,
        row_name,
        shorthand_name,
        asset_name,
        snap_addr,
        assetId: payload.asset_id
      }

      const childInfo = {
        row_id: linkRowRef
      }

      await CloudAlertsHelperModel.addEstopEngageAlert(
        pgWrite,
        leaderInfo,
        childInfo,
        true,
        notificationsOptions
      );
    } else {
      const estop_cloud_alert = await client.query(db.getLastCloudAlertQuery, [
        assetInfo.device_type === "Network Controller"
          ? "NC-ESTOP-Engaged"
          : "ASSET-ESTOP-Engaged",
        payload.asset_id,
      ]);
      console.log("Estop Active Cloud Alert ", estop_cloud_alert.rows);
      if (estop_cloud_alert.rows.length === 0) {
        const addEstopAlert = await addAlert(pgWrite, payload, assetInfo, 128);

        console.log("insertAssetEstopCloudAlert", addEstopAlert);
        // Add cloud Event Logs
        const addEstopEventLog = await addEventLog(
          pgWrite,
          payload,
          assetInfo,
          128
        );

        console.log("insertAssetEstopCloudEventLog", addEstopEventLog);
        console.log("Local Emergency Stop engaged");
        assetInfo.status_text = "Local Emergency Stop Engaged";
        assetInfo.timestamp = payload.timestamp;
        assetInfo.icon_name = "mode_tracking_engaged_48x48.png";
        if (assetInfo.is_status_bits_notify)
          processAssetStatusNotifications(assetInfo);
      } else {
        console.log("Cloud Alert already exist");
      }
    }
    //   }
    // }
    // }
  } else {
    //handle the logic of dis engage
    let oldStatusBit = null;
    if (assetRes.rows.length !== 0) {
      oldStatusBit = assetRes.rows[0].last_status_bits;
    }
    if (oldStatusBit != null) {
      const oldStatusBitsList = statusBits(oldStatusBit);
      let eStopButtonEngaged = containsEmergencyStopStatus(oldStatusBitsList);
      //eStopButtonEngaged = true;
      console.log(oldStatusBitsList);
      console.log(eStopButtonEngaged);
      if (eStopButtonEngaged) {
        // Inactive the engaged button event
        //get the last row from the db to be marked as inactive

        const nc_estop_cloud_alert = await client.query(
          db.getLastCloudAlertQuery,
          [
            assetInfo.device_type === "Network Controller"
              ? "NC-ESTOP-Engaged"
              : "ASSET-ESTOP-Engaged",
            payload.asset_id,
          ]
        );
        console.log("nc_estop_cloud_alert.rows ", nc_estop_cloud_alert.rows);
        if (nc_estop_cloud_alert.rows.length > 0) {
          //Update the row in db and mark status from active to deactive
          console.log(db.updateCLoudAlertQuery, [
            new Date(payload.timestamp),
            nc_estop_cloud_alert.rows[0].id,
          ]);
          const update_estop_alert = await clearAlert(
            pgWrite,
            payload,
            nc_estop_cloud_alert.rows[0].id
          );

          console.log("Update_estop_alert ", update_estop_alert);
          const {
            linkRowType,
            linkRowRef,
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr,
            device_type
          } = linkedRowDetails;
          if (isLinkedRow(linkRowType, linkRowRef, device_type)) {

            const notificationsOptions = {
              isNotify: assetInfo?.is_status_bits_notify || false,
              locationLat: assetInfo?.location_lat ,
              locationLng: assetInfo?.location_lng,
              created: payload.timestamp,
              deviceType: assetInfo?.device_type,
              siteId: assetInfo?.site_id,
              siteName: assetInfo?.site_name,
              multipleSites: assetInfo?.multipleSites,
              projectName: assetInfo?.project_name,
              projectLocation: assetInfo?.project_location,
            };

            const leaderInfo = {
              row_id,
              row_name,
              shorthand_name,
              asset_name,
              snap_addr,
              assetId: payload.asset_id
            }

            const childInfo = {
              row_id: linkRowRef
            }

            await CloudAlertsHelperModel.addEstopDisengageAlert(
              pgWrite,
              leaderInfo,
              childInfo,
              true,
              notificationsOptions
            );
          } else {
          // Add cloud Event Logs
          const addEstopEventLog = await addEventLog(
            pgWrite,
            payload,
            assetInfo,
            821
          );

          console.log("insertAssetEstopCloudEventLog", addEstopEventLog);
          console.log("Old Emergency Stop engaged");
          assetInfo.status_text = "Local Emergency Stop Disengaged";
          assetInfo.timestamp = payload.timestamp;
          assetInfo.icon_name = "mode_tracking_48x48.png";
          if (assetInfo.is_status_bits_notify)
            processAssetStatusNotifications(assetInfo);
          }
        }
      }else{
           //Remove the cloud alerts for estop if exsists and adding cloud event log
            const estop_cloud_alert = await client.query(db.getLastCloudAlertQuery, [
                 "ASSET-ESTOP-Engaged",
              payload.asset_id,
            ]);

            if (estop_cloud_alert.rows.length > 0) {
                console.log('Clearing asset disangage alerts')
                const clear_estop_alert = await clearAlert(
                  pgWrite,
                  payload,
                  estop_cloud_alert.rows[0].id
                );
                console.log('clear_estop_alert', clear_estop_alert)
                const {
                  linkRowType,
                  linkRowRef,
                  row_id,
                  row_name,
                  shorthand_name,
                  asset_name,
                  snap_addr,
                  device_type
                } = linkedRowDetails;

                if (isLinkedRow(linkRowType, linkRowRef, device_type)) {

                  const notificationsOptions = {
                    isNotify: assetInfo?.is_status_bits_notify || false,
                    locationLat: assetInfo?.location_lat ,
                    locationLng: assetInfo?.location_lng,
                    created: payload.timestamp,
                    deviceType: assetInfo?.device_type,
                    siteId: assetInfo?.site_id,
                    siteName: assetInfo?.site_name,
                    multipleSites: assetInfo?.multipleSites,
                    projectName: assetInfo?.project_name,
                    projectLocation: assetInfo?.project_location,
                  };

                  const leaderInfo = {
                    row_id,
                    row_name,
                    shorthand_name,
                    asset_name,
                    snap_addr,
                    assetId: payload.asset_id
                  }

                  const childInfo = {
                    row_id: linkRowRef
                  }

                  await CloudAlertsHelperModel.addEstopDisengageAlert(
                    pgWrite,
                    leaderInfo,
                    childInfo,
                    true,
                    notificationsOptions
                  );
                } else {

                // adding event log for disengage
                const addEstopEventLog = await addEventLog(
                  pgWrite,
                  payload,
                  assetInfo,
                  821
                );
                console.log('addEstopEventLog for disengage', addEstopEventLog)

                assetInfo.status_text = "Local Emergency Stop Disengaged";
                assetInfo.timestamp = payload.timestamp;
                assetInfo.icon_name = "mode_tracking_48x48.png";
                if (assetInfo.is_status_bits_notify){
                  processAssetStatusNotifications(assetInfo);}}
            }
      }
    }
  }
};
const getUpdateMeta = async (client, asset_id) => {
  console.log("getUpdateMeta ", asset_id);
  let result = await client.query(db.siteInfoByAssetId, [asset_id]);
  console.log("Res: ", result.rows);
  return result.rows[0];
};

const mapInfo = async (data) => {
  let assetInfo = {};
  console.log("ASSET_BITS_INFO: ", data);
  assetInfo.is_status_bits_notify = data.is_notify;
  assetInfo.site_id = data.site_id;
  assetInfo.site_name = data.site_name;
  assetInfo.device_type = getDeviceTypeNameFromAssetType(data.asset_type);
  assetInfo.location_lat = data.location_lat;
  assetInfo.location_lng = data.location_lng;
  assetInfo.asset_name = data.asset_name;
  assetInfo.project_location = data.project_location;
  assetInfo.project_name = data.project_name;
  assetInfo.status_bits = data.asset_status_bits;
  assetInfo.project_id = data.project_id;
  assetInfo.repeater_only = data.repeater_only;
  return assetInfo;
};

const updateNCCommandedStateAlert = async (
  client,
  pgWrite,
  payload,
  updateMeta
) => {
  const statusBits = getStatusBit(payload.status_bits);
  let cloudAlerts = await client.query(
    `SELECT * FROM terrasmart.cloud_alert WHERE asset_id = $1::UUID AND active = true
    AND event_name = 'NC-COMMANDED-STATE'
   `,
    [updateMeta.network_controller_asset_id]
  );
  console.log("===>", cloudAlerts.rows);
  const ncCommandedState = await client.query(
    `
  SELECT * FROM terrasmart.tracking_command_hist
  WHERE network_controller_id = $1::UUID
  ORDER BY changed_at DESC limit 1
  `,
    [updateMeta.network_controller_id]
  );
  if (payload.status_bits === 0) {
    const assetsWithActiveAlerts = await client.query(
      `
          SELECT cloud_alert.*
          FROM terrasmart.cloud_alert
          WHERE 
          cloud_alert.active = true AND (cloud_alert.asset_id in (
                  SELECT asset.id as asset_id FROM terrasmart.asset
                  INNER JOIN terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
                  WHERE network_controller.asset_id = $1 :: UUID 
                  )
              OR cloud_alert.asset_id = $1 :: UUID)
              AND event_name != 'NC-COMMANDED-STATE'                   
                  AND cloud_alert.event_name != 'Weather_Stow_AccuWeather-Wind_Gust'
                  AND cloud_alert.event_name != 'Weather_Stow_AccuWeather-Avg_Wind'
                  AND cloud_alert.event_name != 'Weather_Stow_AccuWeather-Deep_Snow'
                  AND cloud_alert.event_name != 'Weather_Stow_AccuWeather-Alert'
                  AND cloud_alert.event_name != 'Weather_Stow_Deep_Snow'
                  AND cloud_alert.event_name != 'Weather_Stow_Avg_Wind' 
                  AND cloud_alert.event_name != 'Weather_Stow_Wind_Gust' 
                  AND cloud_alert.event_name != 'Weather_Stow_Deep_Panel_Snow'
                  AND cloud_alert.event_name != 'Weather_Stow_To_Cold_To_Move'
                  AND cloud_alert.event_name != 'Weather_Stow_No_Weather_Station'
                  AND cloud_alert.event_name != 'Increased_Weather_Reporting_Avg_Wind'
                  AND cloud_alert.event_name != 'Increased_Weather_Reporting_Wind_Gust'
                  AND cloud_alert.event_name != 'Increased_Weather_Reporting_Deep_Snow'
                  AND cloud_alert.event_name != 'Increased_Weather_Reporting_Deep_Panel_Snow'
                  AND cloud_alert.event_name != 'ML_ISSUE-POC'
                  AND cloud_alert.event_name != 'ML_ISSUE-CURRENT_ANGLE'
                  AND cloud_alert.event_name != 'NC-BATTERY_WARNING'
                  AND cloud_alert.event_name != 'ASSET-BATTERY_WARNING'
                  AND cloud_alert.event_name NOT ILIKE 'Weather_Forecast%'
                  AND cloud_alert.event_name != 'VEGETATION-ALERT'
                  AND cloud_alert.event_name != 'SNOW_SHEDDING_DELAY'
              ORDER BY cloud_alert.created DESC;
          `,
      [updateMeta.network_controller_asset_id]
    );
    // console.log("assetsWithActiveAlerts ", assetsWithActiveAlerts.rows);
    //inspect site to verify if every asset have last status bits === 0
    //then check if current NC state is in 3,4,5 then remove the alert
    // const assetsWithLastStatusBits = await client.query(
    //   `SELECT asset.id,asset.status_bits,device_type.device_type,asset.name as asset_name FROM terrasmart.asset
    //   LEFT JOIN terrasmart.device_type on device_type.id = asset.device_type_id
    //   WHERE parent_network_controller_id = $1::UUID AND status_bits IS NOT NULL AND status_bits != 0`, //AND status_bits != 0;
    //   [updateMeta.network_controller_id]
    // );
    // console.log(
    //   `SELECT asset.id,asset.status_bits,device_type.device_type,asset.name as asset_name FROM terrasmart.asset
    // LEFT JOIN terrasmart.device_type on device_type.id = asset.device_type_id
    // WHERE parent_network_controller_id = $1::UUID AND status_bits IS NOT NULL AND status_bits != 0`, //AND status_bits != 0;
    //   [updateMeta.network_controller_id]
    // );
    // console.log("ASSETSTATUSBITS :", assetsWithLastStatusBits.rows);
    if (
      assetsWithActiveAlerts.rows.length === 0 &&
      cloudAlerts.rows.length > 0
    ) {
      if (
        ncCommandedState.rows[0].commanded_state === 3 ||
        ncCommandedState.rows[0].commanded_state === 4 ||
        ncCommandedState.rows[0].commanded_state === 5
      ) {
        console.log("ERRORCODE786");
        await clearAlert(pgWrite, payload, cloudAlerts.rows[0].id);
      }
    }
  }
  if (cloudAlerts.rows.length === 0) {
    cloudAlerts = await client.query(db.checkActiveWeatherAlertQuery, [
      updateMeta.network_controller_id,
    ]);
  }

  if (cloudAlerts.rows.length > 0) {
    try {
      /*//remove all & add new
      await pgWrite.query(
        `DELETE FROM terrasmart.cloud_alert_detail WHERE cloud_alert_id = $1::UUID AND asset_id = $2:: UUID`,
        [cloudAlerts.rows[0].id, payload.asset_id]
      );
      //add new
      let query =
        "INSERT INTO terrasmart.cloud_alert_detail (event_name,title,created,type,active,cloud_alert_id,asset_id) VALUES";
      let bitsCount = 0;
      //check if NC commanded state is in night time stow && statusBits contains 8 (Charger Faults)
      await statusBits.forEach(async bit => {
        if (bit === 8) {
          bitsCount++;
          console.log(
            "When system is in nighttime stow, do not add charger faults to the commanded state changes."
          );
        } else {
          bitsCount++;
          query +=
            "('" +
            EVENT_NAMES[bit] +
            "','" +
            EVENT_MSG[bit] +
            "'," +
            "$1 :: TIMESTAMP," +
            2 +
            "," +
            true +
            ",'" +
            cloudAlerts.rows[0].id +
            "','" +
            payload.asset_id +
            "')";
          if (bitsCount < statusBits.length) query += ",";
        }
      });
      console.log(query);
      let inf = await pgWrite.query(query, [payload.timestamp]);
      console.log(inf);*/
    } catch (exception) {
      console.log("Exception in NCCommandedState ", exception);
    } finally {
      // pgWrite.end();
    }
  }
};

function getAssetName(info, payload) {
  if (info?.device_type === "Row Controller") {
    const rowId = info?.row_id ? ` ${info.row_id}` : "";
    const rowName = info?.row_name ? `${info.row_name} | ` : "";
    const shorthandName = info?.shorthand_name ? `${info.shorthand_name} | ` : "";
    const snapAddr = payload?.snap_addr || "N/A";

    return `Row Box${rowId} (${rowName}${shorthandName}${snapAddr})`;
  }

  return info?.asset_name || info?.device_type || "Asset";
}

exports.handleAssetStatusBits = async function (client, pgWrite, payload) {
  try {
    // Get update meta and map asset info
    const updateMeta = await getUpdateMeta(client, payload.asset_id);
    const assetInfo = await mapInfo(updateMeta);

    // Check if the asset belongs to multiple sites
    assetInfo.multipleSites = await notificationService.checkProjectSites(client, assetInfo.project_id);

    // Retrieve site layout information
    const { rows: siteLayout } = await client.query(db.siteLayoutInfo, [payload.asset_id]);
    const siteLayoutInfo = siteLayout[0] || {};

    // Merge additional layout information
    Object.assign(assetInfo,{
      shorthand_name: siteLayoutInfo?.shorthand_name || null,
      row_id: siteLayoutInfo?.i || "",
      row_name: siteLayoutInfo?.name || null,
      asset_name: getAssetName(assetInfo, payload),
    });

    // Map notification type based on device type
    const notificationTypeMap = {
      "Row Controller": "rc_",
      "Weather Station": "ws_",
      "Network Controller": "nc_",
    };
    const notificationtype = (notificationTypeMap[assetInfo.device_type] || "rc_") + "local_status_bits";
    // Get accounts related to the site and notification type
    const {
      emails: emailAddrs, phone_nums: phoneNumbers, admin_emails: adminEmails, admin_phone_nums: adminPhoneNumbers,
    } = await notificationSettingService.getAccounts(client, assetInfo.site_id, notificationtype);

    // Merge account information into asset info
    Object.assign(assetInfo, { emailAddrs, phoneNumbers, adminEmails, adminPhoneNumbers });

    // Debugging log (optional: replace with proper logging)
    console.log("ASSETINFO: ", assetInfo);

    // Retrieve row details linked to the asset
    const linkedRowDetails = await getAssetAndSiteLayoutByAssetId(client, payload.asset_id);

    // Call alert-handling functions
    await updateNCCommandedStateAlert(client, pgWrite, payload, updateMeta);
    await handleNoCommunicationWithNC(client, pgWrite, payload, assetInfo, linkedRowDetails);
    await handleLowBatteryAutoStow(client, pgWrite, payload, assetInfo, linkedRowDetails);
    await handleChargerFault(client, payload, pgWrite, assetInfo, linkedRowDetails);
    
    // Below services are not to be checked for repeaters
    if (assetInfo.repeater_only) return;

    await handleLowTemperatureRestrictedMovement(client, pgWrite, payload, assetInfo, linkedRowDetails);
    await handleEmergencyStop(client, pgWrite, payload, assetInfo, linkedRowDetails);

    // Handle alerts that only require admin contact information
    const assetInfoWithOnlyAdminEmailAndPhones = {
      ...assetInfo,
      emailAddrs: adminEmails,
      phoneNumbers: adminPhoneNumbers,
    };

    await handleMotorCurrentSoftwareFault(client, pgWrite, payload, assetInfoWithOnlyAdminEmailAndPhones, linkedRowDetails);
    await handleMotorFaultTimeout(client, pgWrite, payload, assetInfoWithOnlyAdminEmailAndPhones, linkedRowDetails);
    await handleMotorCurrentHardwareFault(client, pgWrite, payload, assetInfoWithOnlyAdminEmailAndPhones, linkedRowDetails);

  } catch (error) {
    console.error("Error in handleAssetStatusBits: ", error);
  }
};

exports.handleChargerFault = async function (client, payload) {
  //todo: check if currently there is chargerFault found in last status_bits
  const updateMeta = await getUpdateMeta(client, payload.asset_id);
  const assetInfo = await mapInfo(updateMeta);

  console.log("ASSETINFO: ", assetInfo);
  const statusBitsList = statusBits(assetInfo.status_bits);
  await handleChargerFault(client, payload, assetInfo);
};

const processAssetStatusNotifications = async function (payload, callback) {
  console.log("Process Connection Notification1: ", payload);
  try {
    if (payload) {
      let params = {};

      let time_zone = "America/New_York";
      if (payload.location_lat !== "" && payload.location_lng !== "")
        time_zone = tzlookup(payload.location_lat, payload.location_lng);

      let timestamp = moment
        .tz(payload.timestamp, time_zone)
        .format("hh:mmA on MM/DD/YYYY ");
      console.log("TIME: ", timestamp);
      let asset_name =
        payload.asset_name !== null ? payload.asset_name : "Asset";
      console.log("PHONENUMS: ", payload.phoneNumbers);
      payload.phoneNumbers.forEach(async (data) => {
        params = {};
        params.phoneNumber = data;
        params.msgText =
          (payload.multipleSites ? payload.project_name + " | " : "") +
          payload.site_name + " | " +
          (payload.asset_name !== null
            ? payload.asset_name
            : payload.device_type) +
          (" - " + payload.status_text) +
          ("\n at " + timestamp);
        console.log(params);
        await aws_integration.sendSMS(params);
      });

      // await fs.readFile("./email-Temp.html", async function(
      //   err,
      //   emailHtmlTemplate
      // ) {
      //   if (err) {
      //     console.log("Unable to load HTML Template");
      //     throw err;
      //   }
      console.log("EMAILADRS: ", payload.emailAddrs);
      if (payload.emailAddrs.length > 0) {
        var emailData = {
          is_multiSites: payload.multipleSites,
          site_name: payload.site_name,
          status_text: (payload.device_type !== null ? payload.device_type : "Asset") + " | " + payload.status_text,
          asset_name: asset_name,
          timestamp: timestamp,
          project_name: payload.project_name,
          project_location: payload.project_location,
          msg: payload.message,
          s3_asset_url: getS3EmailAssetsUrl(),
          url: process.env.CLOUDUI_URL + ("/home/projects/" + payload.site_id + "/overview"),
          current_time: new Date(),
        };
        console.log(emailData);
        var templateHtml = Handlebars.compile(utils.emailTemp.toString());
        var bodyHtml = templateHtml(emailData);
        params.msgSubject =
          (payload.multipleSites ? payload.project_name + " | " : "") +
          payload.site_name +
          " | " +
          (payload.device_type !== null ? payload.device_type : "Asset ") +
          (" - " + payload.status_text);
        // params.emailAddrs = payload.emailAddrs;
        params.msgbody = bodyHtml;
        //console.log(params);
        payload.emailAddrs.forEach(async (data) => {
          params.emailAddrs = [data];
          await aws_integration.sendEmail(params);
        });
        // });
      }
    } else {
      console.log("NO Notif");
    }

    return callback(result.rows, null);
  } catch (e) {
    //console.error("Application ERROR:", e);
  } finally {
    console.log("releasing client");
  }
};
