const {
  notificationSettingService,
} = require("../services/notificationSettingService");
const {
  eventName,
  eventIcon,
  generateAlertTitleAndMessage,
  NotificationTypes,
  linkRowTypes,
} = require("../utils/constants");
const {
  addCloudAlert,
  addCloudAlertWithUserInfo,
  getActiveAlertByAssetId,
} = require("./cloudAlert.model");
const {
  addFullCloudEventLog,
  addCloudEventLog,
} = require("./cloudEventLog.model");

const aws_integration = require("../aws_integration");
const utils = require("../utils");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
var Handlebars = require("handlebars");
const { getS3EmailAssetsUrl } = require("../utils/libs/functions");

class CloudAlertsHelperModel {
  // Helper functions for alerts
  createAlertObject(alertOptions) {
    const {
      leaderinfo,
      followerinfo,
      alertType,
      event,
      icon,
      isLinked,
      created,
      status = null,
      userInfo = null,
      batteryCurrent = 0,
      lastreported = 0,
      mlCurrentTime = null,
      mlDueDate = null,
      anomalyCurrentTimestamp = null,
      anomalyBatteryLevel = null,
      anomalyBatteryThreshold = null,
    } = alertOptions;

    const leaderName = this.getRowName(leaderinfo, isLinked, true);
    const followerName = this.getRowName(followerinfo, isLinked);
    const { params, assetId } = leaderinfo;
    // Create a new object with params or use an empty object if params is undefined
    const paramsObject = { ...(params ?? {}) };

    // Adding leader and follower info with params
    paramsObject.leaderName = leaderName;
    paramsObject.followerName = followerName;
    paramsObject.linkRowType = isLinked ? linkRowTypes.LEADER : linkRowTypes.NONE;
    paramsObject.linkRowRef = followerinfo?.row_id;
    paramsObject.row_no =leaderinfo.row_id,
    paramsObject.snap_addr = leaderinfo.snap_addr
    paramsObject.name = leaderinfo.asset_name
    paramsObject.asset_type = 0


    const { title, message } = generateAlertTitleAndMessage({
      alertType,
      leaderName,
      followerName,
      isLinked,
      status,
      batteryCurrent,
      lastreported,
      mlCurrentTime,
      mlDueDate,
      anomalyCurrentTimestamp,
      anomalyBatteryLevel,
      anomalyBatteryThreshold
    }
    );

    return {
      eventName: event,
      title,
      message,
      icon,
      created,
      assetId: assetId,
      type: 2,
      active: true,
      params: paramsObject,
      userInfo,
      leaderName,
      followerName
    };
  }

  createNotificationObject(notificationOptions, alertOptions) {
    notificationOptions.title = alertOptions.title;
    notificationOptions.message = alertOptions.message;
    notificationOptions.leaderName = alertOptions.leaderName;
    notificationOptions.followerName = alertOptions.followerName;
    notificationOptions.icon = alertOptions.icon;
    notificationOptions.notificationType = alertOptions.notificationType;
    return notificationOptions;
  }

  getRowName(row, isLinked = false, isLeader = false) {
    return `Row ${row.row_id}${this.createRowPart(row, isLinked, isLeader)}`;
  }

  createRowPart(info, isLinked, isLeader ) {
    const parts = [];
    if (isLinked && isLeader) parts.push('LEADER');
    if (isLinked && !isLeader) parts.push('FOLLOWER');
    if (info?.row_name) parts.push(info.row_name);
    if (info?.shorthand_name) parts.push(info.shorthand_name);
    if (info?.snap_addr) parts.push(info.snap_addr);
    return parts.length > 0 ? ` (${parts.join(" | ")})` : "";
  }

  //All alerts function
  async addRowAlert(alertOptions) { 
    const { userInfo, eventName, assetId, created, title, message, icon, params, levelNo = 20 } =
      alertOptions;      
    const { userName, email } = userInfo || {};
    if (userInfo) {
      return addCloudAlertWithUserInfo(
        assetId,
        eventName,
        created,
        title,
        icon,
        userName,
        email,
        message,
        params,
        levelNo
      );
    } else {
      return addCloudAlert(
        assetId,
        eventName,
        created,
        title,
        icon,
        message,
        2,
        levelNo,
        params
      );
    }
  }

  async addRowEventlog(eventOptions) {
    const {
      userInfo,
      eventName,
      assetId,
      created,
      title,
      message,
      icon,
      params,
      levelNo = 20
    } = eventOptions;
    const { userName, email } = userInfo || {};
    if (userInfo) {
      return addFullCloudEventLog(
        assetId,
        levelNo,
        created,
        eventName,
        message,
        title,
        icon,
        2,
        userName,
        email,
        params
      );
    } else {
      return addCloudEventLog(assetId, eventName, created, title, icon, params, levelNo);
    }
  }

  async sendNotification(notificationsOptions) {
    const {
      locationLat,
      locationLng,
      created,
      deviceType,
      siteId,
      siteName,
      multipleSites,
      projectName,
      projectLocation,
      notificationType,
      title,
      message,
      leaderName,
      followerName,
      icon,
    } = notificationsOptions;

    const linkedRowTitle = `${followerName} & ${leaderName}: ${title}`

    let time_zone = "America/New_York";
    if (locationLat !== "" && locationLng !== "")
      time_zone = tzlookup(locationLat, locationLng);

    const timestamp = moment
      .tz(created, time_zone)
      .format("hh:mmA on MMM DD, YYYY");

    const { emails: emailAddrs, phone_nums: phoneNumbers } =
      await notificationSettingService.getAccounts(
        siteId,
        notificationType,
        true
      );

    if (phoneNumbers.length > 0) {
      const smsText = `${siteName} | ${linkedRowTitle} at ${timestamp}`;
      await this.sendSMSNotification({
        phoneNumbers,
        multipleSites,
        projectName,
        smsText,
      });
    }
    if (emailAddrs.length > 0) {
      const statusText = linkedRowTitle;
      const bodyText = message;
      const msgSubject = `${
        multipleSites ? projectName + " | " : ""
      }${siteName} | ${deviceType} - ${statusText}`;
      await this.sendEmailNotification({
        siteName,
        statusText,
        bodyText,
        leaderName,
        followerName,
        created,
        projectName,
        projectLocation,
        icon,
        siteId,
        msgSubject,
        emailAddrs,
      });
    }
  }

  async sendSMSNotification(smsPayload) {
    try {
      const { phoneNumbers, multipleSites, projectName, smsText } = smsPayload;
      phoneNumbers.forEach(async (data) => {
        await aws_integration.sendSMS({
          phoneNumber: data,
          msgText: (multipleSites ? projectName + " | " : "") + smsText,
        });
      });
      return true;
    } catch (e) {
      console.log("Error in sendSMSNotification... " + e);
    }
  }

  async sendEmailNotification(emailPayload) {
    try {
      const {
        siteName,
        statusText,
        bodyText,
        leaderName,
        followerName,
        created,
        projectName,
        projectLocation,
        icon,
        siteId,
        msgSubject,
        emailAddrs,
      } = emailPayload;
      const params = {};
      const emailData = {
        site_name: siteName,
        status_text: statusText,
        body_text: bodyText,
        asset_name: `${leaderName} And ${followerName}`,
        timestamp: created,
        project_name: projectName,
        project_location: projectLocation,
        s3_asset_url: getS3EmailAssetsUrl(),
        icon_url: getS3EmailAssetsUrl() + icon,
        url:
          process.env.CLOUDUI_URL + ("/home/projects/" + siteId + "/overview"),
        current_time: new Date(),
      };

      const templateHtml = Handlebars.compile(
        utils.emailTempSiteMode.toString()
      );
      const bodyHtml = templateHtml(emailData);
      params.msgSubject = msgSubject;
      params.msgbody = bodyHtml;
      emailAddrs.forEach(async (data) => {
        params.emailAddrs = [data];
        await aws_integration.sendEmail(params);
      });
      return true;
    } catch (e) {
      console.log("Error in sendEmailNotification... " + e);
    }
  }

  async addRowOfflineAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowOffline",
      event: eventName.OFFLINE,
      icon: eventIcon.OFFLINE,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_STATUS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addRowOnlineAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowOnline",
      event: eventName.ONLINE,
      icon: eventIcon.MODE_TRACKING,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_STATUS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addRowFcsAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowFcs",
      event: eventName.ASSET_FCS,
      icon: eventIcon.MODE_TRACKING,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_FCS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addRowFasttrakAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowFasttrak",
      event: eventName.ASSET_FASTTRAK,
      icon: eventIcon.SETTING,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_FASTTRAK,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addRowFasttrakStopAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowFasttrakStop",
      event: eventName.ASSET_FASTTRAK_STOP,
      icon: eventIcon.SETTING,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_FASTTRAK,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addRowQCFasttrakAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowQCFasttrak",
      event: eventName.ASSET_QC_FASTTRAK,
      icon: eventIcon.SETTING,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_FASTTRAK,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }
  async addRowQCFasttrakStopAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowQCFasttrakStop",
      event: eventName.ASSET_UNDER_QC_FASTTRAK_STOP,
      icon: eventIcon.SETTING,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_FASTTRAK,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addManualControlAlert(
    client,
    leaderinfo,
    followerinfo,
    status,
    isLinked = false,
    userInfo = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowManualControl",
      event: eventName.ASSET_UNDER_MANUAL_CONTROL,
      icon: status === "Virtual EStop" ? eventIcon.ESTOP : eventIcon.SETTING,
      isLinked,
      status,
      userInfo,
      created: notificationOptions.created ? notificationOptions.created : new Date()
    }
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_MANUAL_CONTROL,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addManualControlStopAlert(
    client,
    leaderinfo,
    followerinfo,
    status,
    isLinked = false,
    userInfo = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "rowManualControlStop",
      event: eventName.ASSET_UNDER_MANUAL_CONTROL_STOP,
      icon: status === "Virtual EStop" ? eventIcon.ESTOP_DISENGAGED : eventIcon.MODE_TRACKING,
      isLinked,
      status,
      userInfo,
      created: notificationOptions.created ? notificationOptions.created : new Date()
    }
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_MANUAL_CONTROL,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addRemoteqcStartAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "remoteqcStart",
      event: eventName.REMOTE_QC,
      icon: eventIcon.REMOTE_QC,
      isLinked,
      created: notificationOptions?.created,
      levelNo: 30
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_REMOTE_QC,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }
  async addRemoteqcStopAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "remoteqcStop",
      event: eventName.REMOTE_QC_STOP,
      icon: eventIcon.REMOTE_QC,
      isLinked,
      created: notificationOptions?.created,
      levelNo: 30
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_REMOTE_QC,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addEstopEngageAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "estopEngage",
      event: eventName.ASSET_ESTOP_Engaged,
      icon: eventIcon.ESTOP_ENGAGED,
      isLinked,
      created: notificationOptions?.created
    };

    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_ESTOP,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addEstopDisengageAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "estopDisengage",
      event: eventName.ASSET_ESTOP_Disengaged,
      icon: eventIcon.MODE_TRACKING,
      isLinked,
      created: notificationOptions?.created
    };

    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_ESTOP,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addMotorCurrentHardwareFaultAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "motorCurrentHardwareFault",
      event: eventName.ASSET_MOTOR_CURRENT_HW_FAULT,
      icon: eventIcon.MODE_TRACKING_FAULT,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, {...alertObj, levelNo: 30});
    await this.addRowEventlog(client, {...alertObj, levelNo: 30});

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOCAL_STATUS_BITS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addMotorCurrentSoftwareFaultAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "motorCurrentSoftwareFault",
      event: eventName.ASSET_MOTOR_CURRENT_SW_FAULT,
      icon: eventIcon.MODE_TRACKING_FAULT,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, {...alertObj, levelNo: 30});
    await this.addRowEventlog(client, {...alertObj, levelNo: 30});

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOCAL_STATUS_BITS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addLowTempRestrictedMovementAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "lowTempRestrictedMovement",
      event: eventName.ASSET_LOW_TEMP_RESTRICTED_MOVEMENT,
      icon: eventIcon.MODE_TRACKING_FAULT,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOCAL_STATUS_BITS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addLowBatteryStowAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "lowBatteryStow",
      event: eventName.ASSET_LOW_BATTERY_STOW,
      icon: eventIcon.BATTERY_LOW,
      isLinked,
      created: notificationOptions?.created
    };

    const alertObj = this.createAlertObject(alertOptions);

    // check if the alert with the title and the asset id exists
    if (alertObj?.assetId && alertObj?.eventName) {

      const existingAlert = await getActiveAlertByAssetId(client, alertObj?.assetId, alertOptions?.event);
  
      if (existingAlert) {
        console.log("Info: (ignoring duplicate alert) Alert already exists", alertObj);
        return false
      }

    }

    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOCAL_STATUS_BITS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addChargerFaultAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "chargerFault",
      event: eventName.ASSET_CHARGER_FAULT,
      icon: eventIcon.BATTERY_DAMAGE,
      isLinked,
      created: notificationOptions?.created
    };

    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOCAL_STATUS_BITS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addMotorFaultTimeoutAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "motorFaultTimeout",
      event: eventName.ASSET_MOTOR_FAULT_TIMEOUT,
      icon: eventIcon.MODE_MAINTENANCE,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, {...alertObj, levelNo: 30});
    await this.addRowEventlog(client, {...alertObj, levelNo: 30});

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOCAL_STATUS_BITS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addNoConnectionWithNCAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "noConnectionWithNC",
      event: eventName.ASSET_NO_CONNECTION_WITH_NC,
      icon: eventIcon.MODE_TRACKING_FAULT,
      isLinked,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOCAL_STATUS_BITS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addAssetBatteryWarningAlert(
    leaderinfo,
    followerinfo,
    isLinked = false,
    batteryCurrent = null,
    lastreported = null,
    notificationOptions
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "batteryWarning",
      event: eventName.ASSET_BATTERY_WARNING,
      icon: eventIcon.BATTERY_WARNING,
      isLinked,
      batteryCurrent,
      lastreported,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(alertObj);
    await this.addRowEventlog(alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOW_BATTERY_WARNING,
        }
      );
      await this.sendNotification(notificationPayload);
    }
  }

  async addAssetBatteryFaultAlert(
    leaderinfo,
    followerinfo,
    isLinked = false,
    batteryCurrent = null,
    lastreported = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "lowBatteryFault",
      event: eventName.ASSET_BATTERY_FAULT,
      icon: eventIcon.BATTERY_DAMAGE,
      isLinked,
      batteryCurrent,
      lastreported,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(alertObj);
    await this.addRowEventlog(alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ROW_LOW_BATTERY_FAULT,
        }
      );
      await this.sendNotification(notificationPayload);
    }
  }

  async addMLIssuePocAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    mlCurrentTime = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "mlIssuePoc",
      event: eventName.ML_ISSUE_POC,
      icon: eventIcon.CLOUD_INTELLIGENCE,
      isLinked,
      mlCurrentTime,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ML_ROW_BATTERY_ANALYSIS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addMLIssueClearedPocAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    mlCurrentTime = null,
    mlDueDate = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "mlIssueClearedPoc",
      event: eventName.ML_ISSUE_CLEARED_POC,
      icon: eventIcon.CLOUD_INTELLIGENCE_GREY,
      isLinked,
      mlCurrentTime,
      mlDueDate,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    // await this.addRowAlert(client, alertObj); NO ALERT FOR THIS CASE
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ML_ROW_BATTERY_ANALYSIS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addMLIssueCurrentAngleAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    mlCurrentTime = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "mlIssueCurrentAngle",
      event: eventName.ML_ISSUE_CURRENT_ANGLE,
      icon: eventIcon.CLOUD_INTELLIGENCE,
      isLinked,
      mlCurrentTime,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ML_ROW_TRACKING,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addMLIssueClearedCurrentAngleAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    mlCurrentTime = null,
    mlDueDate = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "mlIssueClearedCurrentAngle",
      event: eventName.ML_ISSUE_CLEARED_CURRENT_ANGLE,
      icon: eventIcon.CLOUD_INTELLIGENCE_GREY,
      isLinked,
      mlCurrentTime,
      mlDueDate,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    // await this.addRowAlert(client, alertObj); NO ALERT FOR THIS CASE
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ML_ROW_TRACKING,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addAnomalyPocWakeupAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    anomalyCurrentTimestamp = null,
    anomalyBatteryLevel = null,
    anomalyBatteryThreshold = null,
    notificationOptions
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "anomalyPocWakeup",
      event: eventName.ANOMALY_POC_WAKEUP,
      icon: eventIcon.CLOUD_INTELLIGENCE,
      isLinked,
      anomalyCurrentTimestamp,
      anomalyBatteryLevel,
      anomalyBatteryThreshold,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ANOMALY_ROW_AM_BATTERY_ANALYSIS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addAnomalyPocWakeupClearAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    anomalyCurrentTimestamp = null,
    anomalyBatteryLevel = null,
    anomalyBatteryThreshold = null,
    notificationOptions
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "anomalyClearedPocWakeup",
      event: eventName.ANOMALY_CLEARED_POC_WAKEUP,
      icon: eventIcon.CLOUD_INTELLIGENCE_GREY,
      isLinked,
      anomalyCurrentTimestamp,
      anomalyBatteryLevel,
      anomalyBatteryThreshold,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ANOMALY_ROW_AM_BATTERY_ANALYSIS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addAnomalyPocNighttimeStowAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    anomalyCurrentTimestamp = null,
    anomalyBatteryLevel = null,
    anomalyBatteryThreshold = null,
    notificationOptions
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "anomalyPocNightTimeStow",
      event: eventName.ANOMALY_POC_NIGHTTIME_STOW,
      icon: eventIcon.CLOUD_INTELLIGENCE,
      isLinked,
      anomalyCurrentTimestamp,
      anomalyBatteryLevel,
      anomalyBatteryThreshold,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ANOMALY_ROW_PM_BATTERY_ANALYSIS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addAnomalyPocNighttimeStowClearAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    anomalyCurrentTimestamp = null,
    anomalyBatteryLevel = null,
    anomalyBatteryThreshold = null,
    notificationOptions
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "anomalyClearedPocNightTimeStow",
      event: eventName.ANOMALY_CLEARED_POC_NIGHTTIME_STOW,
      icon: eventIcon.CLOUD_INTELLIGENCE_GREY,
      isLinked,
      anomalyCurrentTimestamp,
      anomalyBatteryLevel,
      anomalyBatteryThreshold,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ANOMALY_ROW_PM_BATTERY_ANALYSIS,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addAnomalyCurrentAngleAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    anomalyCurrentTimestamp = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "anomalyCurrentAngle",
      event: eventName.ANOMALY_CURRENT_ANGLE,
      icon: eventIcon.CLOUD_INTELLIGENCE,
      isLinked,
      anomalyCurrentTimestamp,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowAlert(client, alertObj);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ANOMALY_ROW_TRACKING,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }

  async addAnomalyCurrentAngleClearAlert(
    client,
    leaderinfo,
    followerinfo,
    isLinked = false,
    anomalyCurrentTimestamp = null,
    notificationOptions = {}
  ) {
    const alertOptions = {
      leaderinfo,
      followerinfo,
      alertType: "anomalyClearedCurrentAngle",
      event: eventName.ANOMALY_CLEARED_CURRENT_ANGLE,
      icon: eventIcon.CLOUD_INTELLIGENCE_GREY,
      isLinked,
      anomalyCurrentTimestamp,
      created: notificationOptions?.created
    };
    const alertObj = this.createAlertObject(alertOptions);
    await this.addRowEventlog(client, alertObj);

    const { isNotify } = notificationOptions;
    if (isNotify) {
      const notificationPayload = this.createNotificationObject(
        notificationOptions,
        {
          ...alertObj,
          icon: alertOptions.icon,
          notificationType: NotificationTypes.ANOMALY_ROW_TRACKING,
        }
      );
      await this.sendNotification(client, notificationPayload);
    }
  }
}

exports.CloudAlertsHelperModel = new CloudAlertsHelperModel();
