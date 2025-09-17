const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const fs = require("fs");
const db = require("../db");
var Handlebars = require("handlebars");
const utils = require("../utils");
const {getS3EmailAssetsUrl, isLinkedRow} = require("../utils/libs/functions");
const { cloudAlertService } = require("../services/cloudAlertService");
const { notificationSettingService } = require("../services/notificationSettingService");
const queueHelper = require("../QueueHelper");
const { notificationService } = require("../services/common/notificationService");
const { CloudAlertsHelperModel } = require("../models/cloudAlertsHelper.model");
const { getAssetAndSiteLayoutByAssetId } = require("../models/asset.model");
const { linkRowTypes, assetTypes, getDeviceTypeNameFromAssetType } = require("../utils/constants");
const { getSiteInfoByAssetId, getSiteInfoByNCAssetId, getAssetInfoDetailed, getLastBatteryUpdate, getNewBatteryAlert, addCloudAlert, removeCloudAlert, exeQuery } = require("../pg");
const cloudEventLogQuery = `
  INSERT INTO terrasmart.cloud_event_log (name,message,levelno,created,asset_id,type,title,icon, params)
  VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: INT, $4 :: TIMESTAMP,$5 :: UUID, $6::INT,$7::VARCHAR,$8 :: VARCHAR, $9 :: JSON)
  `;

const addAlert = async (
  payload,
  batteryInfo,
  alertMessage,
  alertTitle,
  alertIcon
) => {
  const eventName = batteryInfo.device_type === "Network Controller"
      ? batteryInfo.poc > 25
        ? "NC-BATTERY_WARNING"
        : "NC-BATTERY_FAULT"
      : batteryInfo.poc > 25
        ? "ASSET-BATTERY_WARNING"
        : "ASSET-BATTERY_FAULT";

  const type = batteryInfo.device_type === "Network Controller" ? 1 : 2

  return addCloudAlert(payload.asset_id, eventName, new Date(payload.timestamp), alertTitle, alertIcon, alertMessage, type, 20, batteryInfo?.poc ? {"poc": batteryInfo.poc} : null)
};

const addEventLog = async (
  payload,
  batteryInfo,
  logMessage,
  alertTitle,
  alertIcon,
  params = {}
) => {
  return await exeQuery(cloudEventLogQuery, [
    batteryInfo.device_type === "Network Controller"
      ? batteryInfo.poc > 25
        ? "NC-BATTERY_WARNING"
        : "NC-BATTERY_FAULT"
      : batteryInfo.poc > 25
        ? "ASSET-BATTERY_WARNING"
        : "ASSET-BATTERY_FAULT",
    logMessage,
    20,
    new Date(payload.timestamp),
    payload.asset_id,
    batteryInfo.device_type === "Network Controller" ? 1 : 2, //Individual Asset Events
    alertTitle,
    alertIcon,
	  params
  ]);
};

const updateAlert = async (payload, alertId, alertMessage, params = {}) => {
  const query =  `
    UPDATE terrasmart.cloud_alert  
      SET message = $1 :: TEXT, created = $2 :: TIMESTAMP, params = $4::JSON
    WHERE id = $3 :: UUID
  `;
  return await exeQuery(query, [alertMessage, new Date(payload.timestamp), alertId, params]);
};

const getUpdateMeta = async (payload) => {
  let assetsInfoByAddr = await getSiteInfoByAssetId(payload.asset_id)
  
  // console.log("RES: ", assetsInfoByAddr.rows);
  if (assetsInfoByAddr.rows[0].asset_type === assetTypes.ASSET_TYPE_NC) {
    assetsInfoByAddr = await getSiteInfoByNCAssetId(payload.asset_id)
    // console.log("RES: ", assetsInfoByAddr.rows);
  }

  var info = {};

  await assetsInfoByAddr.rows.forEach(async (data) => {
    // console.log("_INFO: ", data);
    info.is_notify = data.is_notify;
    info.site_id = data.site_id;
    info.site_name = data.site_name;
    info.device_type = getDeviceTypeNameFromAssetType(data.asset_type);
    info.location_lat = data.location_lat;
    info.location_lng = data.location_lng;
    info.asset_name = data.asset_name;
    info.project_name = data.project_name;
    info.project_id = data.project_id;
    info.project_location = data.project_location;
  });
  const checkProjectSites = await notificationService.checkProjectSites(info.project_id);
  info.multipleSites = checkProjectSites;
  return info;
};

const getAssetName = async (batteryInfo) => {
  let assetName =
    batteryInfo.asset_name !== null
      ? batteryInfo.asset_name
      : batteryInfo.device_type !== null
        ? batteryInfo.device_type
        : "ASSET";
  return assetName;
};

const getBatteryPercentage = async (batteryInfo) => {
  return batteryInfo.poc > 25 ? "50" : "25";
};

const eventLogMsg = async (info, pocPercentage, assetName, payload) => {
  let fullAssetName = info.device_type === "Row Controller"
    ? "Row Box " +
    info.row_id +
    " (" +
    (info.row_name !== null ? info.row_name + " | " : "") +
    (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
    payload.snap_addr +
    ")" : assetName;
  return (
    "The " +
    (fullAssetName + "`s battery is less than ") +
    (pocPercentage + "%. Last value reported was ") +
    (info.poc + "%.")
  );
};
const getAlertMessage = async (info, pocPercentage, assetName, payload) => {
  let fullAssetName = info.device_type === "Row Controller"
    ? "Row Box " +
    info.row_id +
    " (" +
    (info.row_name !== null ? info.row_name + " | " : "") +
    (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
    payload.snap_addr +
    ")" : assetName;
  return (
    "The " +
    (fullAssetName + "`s battery is less than ") +
    (pocPercentage + "%. Last value reported was ") +
    (info.poc + "%.")
  );
};

const getAlertIcon = async (batteryInfo) => {
  return batteryInfo.poc > 25 ? "battery_25" : "battery_damage";
};

const getAlertTitle = async (info, assetName, payload) => {
  return info.device_type === "Network Controller"
    ? info.poc > 25
      ? "Network Controller Low Battery Warning"
      : "Network Controller Low Battery Fault"
    : info.device_type === "Row Controller"
      ? info.poc > 25
        ? "Low Battery Warning"
        : "Low Battery Fault"
      : (info.poc > 25 ? "Low Battery Warning" : "Low Battery Fault");
};
const getStatusTitle = (info) => {
  return info.poc > 25 ? "Low Battery Warning" : "Low Battery Fault";
}
const getStatusText = async (payload, info, assetName) => {
  return info.device_type === "Network Controller"
    ? info.poc > 25
      ? "Network Controller Low Battery Warning"
      : "Network Controller Low Battery Fault"
    : info.device_type === "Row Controller"
      ? "Row Box " +
      info.row_id +
      "(" +
      (info.row_name !== null ? info.row_name + " | " : "") +
      (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
      payload.snap_addr +
      "): " +
      (info.poc > 25 ? " Low Battery Warning" : " Low Battery Fault")
      : assetName +
      (info.poc > 25 ? " Low Battery Warning" : " Low Battery Fault");
};
const getAssetInfo = async (payload) => {
  const assetsInfoRes = await getAssetInfoDetailed(payload.asset_id)
  // console.log(assetsInfoRes.rows);
  let batteryInfo = {};

  batteryInfo.shorthand_name = null;
  batteryInfo.row_id = "";
  batteryInfo.row_name = null;
  
  await assetsInfoRes.rows.forEach(async (data) => {
    batteryInfo.asset_id = data.asset_id;
    batteryInfo.device_type = data.device_type;
    batteryInfo.asset_name = data.name;
    batteryInfo.shorthand_name = data.shorthand_name;
    batteryInfo.row_id = data.row_id;
    batteryInfo.row_name = data.row_name;
  });

  batteryInfo.timestamp = new Date(payload.timestamp);
  batteryInfo.current = payload.current;
  batteryInfo.voltage = payload.voltage;
  batteryInfo.poc = payload.poc;
  batteryInfo.poh = payload.poh;
  batteryInfo.battery_temperature = payload.temperature;
  batteryInfo.heater_temperature = payload.heater_temperature;

  return batteryInfo;
};

const getValueStatus = async (lastBatteryUpdate, payload) => {
  let isValueChanged = false;
  if (lastBatteryUpdate.rows[0]) {
    if (lastBatteryUpdate.rows[0].poc !== payload.poc) {
      isValueChanged = true;
    }
  }
  return isValueChanged;
};


exports.handleBatteryHist = async function (payload) {
  console.log("Process B-info");
  let info = await getUpdateMeta(payload);
  console.log("siteInfo: ", info);

  let batteryInfo = await getAssetInfo(payload);
  const {
    linkRowType,
    linkRowRef,
    row_id,
    row_name,
    shorthand_name,
    asset_name,
    device_type
  }  = await getAssetAndSiteLayoutByAssetId(payload.asset_id)
  const isLinked = isLinkedRow(linkRowType, linkRowRef, device_type)
  const leaderInfo = {
    row_id,
    asset_id : payload.asset_id,
    row_name,
    shorthand_name,
    asset_name,
    snap_addr : payload.snap_addr,
    assetId: payload.asset_id,
    params:
      batteryInfo && batteryInfo.poc ? { poc: batteryInfo.poc } : null,
  };

  const childInfo = {
    row_id: linkRowRef,
  };

  const notificationsOptions = {
    isNotify: info?.is_notify,
    locationLat: info?.location_lat,
    locationLng: info?.location_lng,
    created: payload.timestamp,
    deviceType: info?.device_type,
    siteId: info?.site_id,
    siteName: info?.site_name,
    multipleSites: info?.multipleSites,
    projectName: info?.project_name,
    projectLocation: info?.project_location,
  };
  let assetName = await getAssetName(batteryInfo);
  let pocPercentage = await getBatteryPercentage(batteryInfo);
  let logMessage = await eventLogMsg(batteryInfo, pocPercentage, assetName, payload);
  let alertIcon = await getAlertIcon(batteryInfo);
  let alertTitle = await getAlertTitle(batteryInfo, assetName, payload);
  let alertMessage = await getAlertMessage(batteryInfo, pocPercentage, assetName, payload);

  // await pgWrite.connect();
  //add cloud event when battery received is less then 50%
  //1. Battery Warning - When battery is less than 50% but greater than 25% -
  //2. Battery Fault - When battery is less than 25%.
  if (batteryInfo.poc < 50) {
    console.log("info less then 50");
    const lastBattupdate = await getLastBatteryUpdate(payload.asset_id);
    console.log('Last Battery State: ', lastBattupdate.rows[0])
    //check if poc is 0%
    if (batteryInfo.poc === 0) {
      //check if last row also contain poc value 0 if not then return
      //handle for exceptional battery value = 0
      if (lastBattupdate.rows[0].poc !== 0) {
        console.log(
          "BATTUPDATE No alert & event log will be generated for this scenario"
        );
        return true;
      }
    }
    await queueHelper.queueDetectedAnomaly(payload); // battery_hist
    //Add Alert
    //check if already exist then do not add alert
    const checkBatteryAlert = await await getNewBatteryAlert(payload, batteryInfo);
    console.log("ALERTRESS ", checkBatteryAlert.rows);
    if (checkBatteryAlert.rows.length === 0) {

      if (isLinked) {

        if (batteryInfo.poc > 25) {
          await CloudAlertsHelperModel.addAssetBatteryWarningAlert(
            leaderInfo,
            childInfo,
            true,
            pocPercentage,
            batteryInfo.poc,
            notificationsOptions
          );
        } else {
          await CloudAlertsHelperModel.addAssetBatteryFaultAlert(
            leaderInfo,
            childInfo,
            true,
            pocPercentage,
            batteryInfo.poc,
            notificationsOptions
          );
        }
      } else {
        const addRes = await addAlert(
          payload,
          batteryInfo,
          alertMessage,
          alertTitle,
          alertIcon
        );
        //todo: Send Fault Notification
        console.log("Add Alert Res ", addRes);
        info.status_text = await getStatusText(payload, batteryInfo, assetName);
        info.status_title = getStatusTitle(batteryInfo);
        info.message = logMessage;
        info.timestamp = payload.timestamp;
        info.icon_name = (await getAlertIcon(batteryInfo)) + "_48x48.png";
        console.log("INFO--", info);
        
        if (info.is_notify) {

          let notificationtype = "nc_";
          if (info.device_type === "Row Controller") notificationtype = "rc_";
          if (info.device_type === "Weather Station") notificationtype = "ws_";
          if (info.device_type === "Network Controller") notificationtype = "nc_";
          
          if (batteryInfo.poc > 25) {
            notificationtype = notificationtype + "low_battery_warning";
          } else {
            notificationtype = notificationtype + "low_battery_fault";
          }
          
          console.log("Getting Notification for ", notificationtype);
          
          const userAccounts = await notificationSettingService.getAccounts(
            info.site_id,
            notificationtype
          );
          info.emailAddrs = userAccounts.emails;
          info.phoneNumbers = userAccounts.phone_nums;

          await processBatteryNotifications(info);
        }
      }
    } else if (
      checkBatteryAlert.rows[0].event_name !==
      (batteryInfo.device_type === "Network Controller"
        ? batteryInfo.poc > 25
          ? "NC-BATTERY_WARNING"
          : "NC-BATTERY_FAULT"
        : batteryInfo.poc > 25
          ? "ASSET-BATTERY_WARNING"
          : "ASSET-BATTERY_FAULT")
    ) {
      //update exiting as inactive
      await removeCloudAlert(checkBatteryAlert.rows[0].id)
      await cloudAlertService.clearAlertDetail(checkBatteryAlert.rows[0].id);

       if (isLinked) {
        if (batteryInfo.poc > 25) {
          await CloudAlertsHelperModel.addAssetBatteryWarningAlert(
            leaderInfo,
            childInfo,
            true,
            pocPercentage,
            batteryInfo.poc,
            notificationsOptions
          );
        } else {
          await CloudAlertsHelperModel.addAssetBatteryFaultAlert(
            leaderInfo,
            childInfo,
            true,
            pocPercentage,
            batteryInfo.poc,
            notificationsOptions
          );
        }
      } else {
        //Add new alert with new status
        await addAlert(
          payload,
          batteryInfo,
          alertMessage,
          alertTitle,
          alertIcon
        );
      }
    }

    //Add event log
    //check if there is change in percentage from old value of poc or not
    //if found log info else ignore
    let isValueChanged = await getValueStatus(lastBattupdate, payload);
    console.log("IS VALUE CHNAGE", isValueChanged);

    if (isValueChanged) {
      //update exiting alerts message & timestamp
      const checkNewBatteryAlert = await getNewBatteryAlert(payload, batteryInfo);
      const paramsObject = {}

      if (checkNewBatteryAlert.rows.length > 0) {

        let leaderName = ""
        let followerName = ""

        if (batteryInfo && batteryInfo.poc) {
          paramsObject.poc = batteryInfo.poc;
        }
        // link row logic
        if(isLinked){
         leaderName = CloudAlertsHelperModel.getRowName(leaderInfo, true, true)
         followerName = CloudAlertsHelperModel.getRowName(childInfo, true, false)
         paramsObject.leaderName = leaderName;
         paramsObject.followerName = followerName;
         paramsObject.linkRowType = isLinked ? linkRowTypes.LEADER : linkRowTypes.NONE;
         paramsObject.linkRowRef = childInfo?.row_id;
         paramsObject.row_no =leaderInfo.row_id,
         paramsObject.snap_addr = leaderInfo.snap_addr
         paramsObject.name = leaderInfo.asset_name
         paramsObject.asset_type = 0

         if(batteryInfo?.poc > 25){
            alertTitle = "Low Battery Warning";
            alertMessage =`battery is less than ${pocPercentage}%. Last value reported was ${batteryInfo?.poc}%`;
            logMessage = alertMessage;
         }else{
            alertTitle = "Low Battery Fault";
            alertMessage =`battery is less than ${pocPercentage}%. Last value reported was ${batteryInfo?.poc}%`;
            logMessage = alertMessage;
         }

        }

        await updateAlert(
          payload,
          checkNewBatteryAlert.rows[0].id,
          alertMessage,
          paramsObject
        );
      }

      const insertBatteryIssueog = await addEventLog(
        payload,
        batteryInfo,
        logMessage,
        alertTitle,
        alertIcon,
        paramsObject
      );
      console.log("insertBatteryIssueog", insertBatteryIssueog.rows[0]);
    }
  } else {
    //check if alert already exist then inactive it
    await queueHelper.queueDetectedAnomaly(payload); // battery_hist
    //check if already exist then do not add alert
    const checkBatteryAlert = await getNewBatteryAlert(
      payload,
      batteryInfo
    );

    console.log("check Battery Alert ", checkBatteryAlert.rows);
    if (checkBatteryAlert.rows.length > 0) {
      //clear alert details
      await cloudAlertService.clearAlertDetail(
        checkBatteryAlert.rows[0].id
      );

      await removeCloudAlert(checkBatteryAlert.rows[0].id)
    }
  }
};

const processBatteryNotifications = async function (payload, callback) {
  console.log("Process Notification: ", payload);
  try {
    if (payload) {
      let params = {};

      let time_zone = "America/New_York";
      if (payload.location_lat !== "" && payload.location_lng !== "")
        time_zone = tzlookup(payload.location_lat, payload.location_lng);

      let timestamp = moment
        .tz(payload.timestamp, time_zone)
        .format("hh:mmA on MM/DD/YYYY ");
      //console.log("TIME: ", timestamp);
      let asset_name =
        payload.asset_name !== null ? payload.asset_name : "Asset";
      console.log("PHONENUMS ", payload.phoneNumbers);
      payload.phoneNumbers.forEach(async (data) => {
        params = {};
        params.phoneNumber = data;
        params.msgText =
          (payload.multipleSites ? payload.project_name + " | " : "") +
          payload.site_name + " | " + payload.status_text + " at " + timestamp;
        console.log(params);
        aws_integration.sendSMS(params);
      });
      console.log("EMAILADDRS ", payload.emailAddrs);
      if (payload.emailAddrs.length > 0) {
        var emailData = {
          is_multiSites: payload.multipleSites,
          site_name: payload.site_name,
          status_text: (payload.device_type !== null ? payload.device_type : "Asset") + " | " + payload.status_title,
          asset_name: asset_name,
          timestamp: timestamp,
          project_name: payload.project_name,
          project_location: payload.project_location,
          msg: payload.message,
          s3_asset_url: getS3EmailAssetsUrl(),
          icon_url: getS3EmailAssetsUrl() + payload.icon_name,
          url: process.env.CLOUDUI_URL + ("/home/projects/" + payload.site_id + "/overview"),
          current_time: new Date(),
        };
        console.log(emailData);
        var templateHtml = Handlebars.compile(
          utils.emailTempBatteryNotif.toString()
        );
        var bodyHtml = templateHtml(emailData);
        // params.emailAddrs = payload.emailAddrs;
        params.msgSubject =
          (payload.multipleSites ? payload.project_name + " | " : "") +
          payload.site_name +
          " | " +
          (payload.device_type !== null ? payload.device_type : "Asset ") +
          " - " +
          payload.status_title;
        params.msgbody = bodyHtml;
        //console.log(params);
        payload.emailAddrs.forEach(async (data) => {
          params.emailAddrs = [data];
          await aws_integration.sendEmail(params);
        });
        //   }
        // );
      }
    } else {
      console.log("NO Notif");
    }

    return callback(result.rows, null);
  } catch (e) {
    //console.error("Application ERROR:", e);
  }
};

