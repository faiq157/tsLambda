const mqtt = {
    accountPrefix: 'a2dlentyd00pdf',
    accountAtsPrefix: 'a2dlentyd00pdf-ats',
    ncTopic: '/topics/networkControllers'
}

const s3Bucket = {
    REGION: 'us-east-2'
};

const commandSource = Object.freeze({
    SLUI: "SLUI",
    CLOUD: "CLOUD",
    MODBUS: "MODBUS",
    NC: 'NC' // this is not being sent from NC, source is "SLUI" for both SLUI and NC
})

const StowTypes = Object.freeze({
  HAIL_STOW: "Accuweather_Alert-Hail_Stow",
  AVG_WIND: "Weather_Forecast-Avg_Wind",
  WIND_GUST: "Weather_Forecast-Wind_Gust"
})

/*
 * These states are defined for the hail stow purpose, can be used for new stow types
 */
const StowStates = Object.freeze({
  NOT_STARTED: 1,
  STARTED: 2,
  ENDED: 12
});


const assetTypes = Object.freeze({
  ASSET_TYPE_RB: 0,
  ASSET_TYPE_NC: 1,
  ASSET_TYPE_WS: 2,
  ASSET_TYPE_RP: 3,
});

const SiteLayoutTypes = Object.freeze({
  REPEATER: "Repeater",
  ROW_CONTROLLER: "Row Controller",
  WEATHER_STATION: "Weather Station",
  NETWORK_CONTROLLER: "Network Controller",
});

const getDeviceTypeNameFromAssetType = (assetType) => {
  switch (assetType) {
    case assetTypes.ASSET_TYPE_RB:
      return SiteLayoutTypes.ROW_CONTROLLER;
    case assetTypes.ASSET_TYPE_NC:
      return SiteLayoutTypes.NETWORK_CONTROLLER;
    case assetTypes.ASSET_TYPE_WS:
      return SiteLayoutTypes.WEATHER_STATION;
    case assetTypes.ASSET_TYPE_RP:
      return SiteLayoutTypes.REPEATER;
    default:
      return null;
  }
};

const deviceTypeIds = {
    DEVICE_TYPE_ID_RB: '1D6E2838-8AC9-42F2-8418-778A95A27E75',
    DEVICE_TYPE_ID_NC: '9C0720C1-C980-4BC4-B837-F6D5BF9C7BD4',
    DEVICE_TYPE_ID_WS: '14182D37-ACCB-4752-8558-EA874BEE2E24'
};

const deviceTypeNames = {
  '1D6E2838-8AC9-42F2-8418-778A95A27E75': 'Row Controller',
  '9C0720C1-C980-4BC4-B837-F6D5BF9C7BD4': 'Network Controller',
  '14182D37-ACCB-4752-8558-EA874BEE2E24': 'Weather Station'
};

const getAssetTypeStr = (assetType) => {
    switch (assetType) {
        case assetTypes.ASSET_TYPE_RB:
            return 'ROW';
        case assetTypes.ASSET_TYPE_NC:
            return 'NC';
        case assetTypes.ASSET_TYPE_WS:
            return 'WX';
        default:
            throw new Error(`cannot convert asset type to string, Unknown asset type ${assetType}`);
    }
}

const getDeviceModelFromAssetType = (assetType) => {
    // model_device byte has a lot packed into it. Total format is MMMMWRDD (binary)
    // MMMM - upper 4 bits is the model number minus 1. 0 to 15 map to models 1 to 16
    // Originally all products were Model 1, typically shown as trailing "-1" suffix
    // The cost-reduced (de-populated or "de-pop") Row Boxes were the first Model 2 hardware.
    // Model 3 Row Boxes now exist. These are similar to a "de-pop" but some parts have been added back in.
    // A Model-3 Row Box can monitor the voltage and current of the second external power input.
    // W - single bit that is set if the device has weather sensors. Might not be a Weather Station!
    // R - single bit that is set if the device has row control motor. To date, only set for true Row Controllers.
    // DD - values 0 - 3, indicating 0: Row Controller 1: Network Controller 2: Weather Station 3: Future/Reserved
    const hasRowContrlMotor = 0x00000004;
    const hasWeatherSensor = 0x00000008;
    const model = 0x00000010;

    switch (assetType) {
        case assetTypes.ASSET_TYPE_RB:
            return model | hasRowContrlMotor | assetTypes.ASSET_TYPE_RB;
        case assetTypes.ASSET_TYPE_NC:
            return model | assetTypes.ASSET_TYPE_NC;
        case assetTypes.ASSET_TYPE_WS:
            return model | hasWeatherSensor | assetTypes.ASSET_TYPE_WS;
        default:
            throw new Error(`cannot convert asset type to device model, Unknown asset type ${assetType}`);
    }
}

const getHardwareRevFromAssetType = (assetType) => {
    const FRAM_PRESENT = 0x00000001;
    const RTC_PRESENT = 0x00000002;

    // uint8_t hardware_revision = 0x00;
    // hardware_revision |= FRAM_PRESENT;
    // hardware_revision |= RTC_PRESENT;
    switch (assetType) {
        case assetTypes.ASSET_TYPE_RB:
        case assetTypes.ASSET_TYPE_NC:
        case assetTypes.ASSET_TYPE_WS:
            return FRAM_PRESENT | RTC_PRESENT;
        default:
            throw new Error(`cannot convert asset type to config flags, Unknown asset type ${assetType}`);
    }
}

const getConfigFlagsFromAssetType = (assetType) => {
    // config_flag is different as
    // define REVERSE_ROTATION   0x0001 // set if clockwise should be negative (usually not set)
    // define ROW_AIMED_NORTH    0x0002 // set if clockwise rotation corresponds to "Eastward"
    // define MOTOR_CROSSWIRED   0x0004 // set if clockwise rotation corresponds to "that-a-way"
    // define ENABLE_HANDHELD_CONTROLLER   0x0040 // controller will be ignored if this bit is not set
    // temp = 0x0000;
    // temp |= REVERSE_ROTATION;
    // temp |= MOTOR_CROSSWIRED;
    // temp |= ENABLE_HANDHELD_CONTROLLER;
    // set_config_uint16(CONFIG_UINT16_BIT_FLAGS, temp, at_startup)

    switch (assetType) {
        case assetTypes.ASSET_TYPE_RB:
            return 453;
        case assetTypes.ASSET_TYPE_NC:
            return 0;
        case assetTypes.ASSET_TYPE_WS:
            return 2048;
        default:
            throw new Error(`cannot convert asset type to config flags, Unknown asset type ${assetType}`);
    }
}

const getDeviceTypeIdFromAssetType = (assetType) => {
    switch (assetType) {
        case assetTypes.ASSET_TYPE_RB:
            return deviceTypeIds.DEVICE_TYPE_ID_RB;
        case assetTypes.ASSET_TYPE_NC:
            return deviceTypeIds.DEVICE_TYPE_ID_NC;
        case assetTypes.ASSET_TYPE_WS:
            return deviceTypeIds.DEVICE_TYPE_ID_WS;
        default:
            throw new Error(`Unknown asset type ${assetType}`);
    }
}

const getAssetTypeFromDeviceModel = (deviceModel) => {
    const binaryVal = parseInt(deviceModel, 10).toString(2);
    const modelNumBn = binaryVal.slice(0, -4) != "" ? binaryVal.slice(0, -4) : "0";
    const modelNum = parseInt(modelNumBn, 2);
    const deviceTypeBn = binaryVal.substring(binaryVal.length - 2, binaryVal.length); // last two digits
    const deviceType = parseInt(deviceTypeBn, 2);
    const weatherSensorBn =
        binaryVal.length > 3 ? binaryVal.substring(binaryVal.length - 4, binaryVal.length - 3) : "0"; //4th digit from last
    const hasWeatherSensor = parseInt(weatherSensorBn) == 1 ? true : false;
    return {
        "deviceType": deviceType,
        "modelNum": modelNum,
        "hasWeatherSensor": hasWeatherSensor
    }
}

const trackingModes = {
    UNKNOWN: 0,
    ESTOP_ENGAGE: 1,
    WEATHER_STOW: 2,
    TRACKING: 3,
    TRAKING_WITH_BACKTRACKING: 4,
    NIGHTLY_STOW: 5,
    MANUAL_STOW: 6,
    DIFUSE_TRACKING: 7,
    REMOTE_QC: 8,
    FLAT_MAINTENANCE: 9,
    SNOW_SHEDDING: 10
};

const manualModeDetail = {
    STOW: 0,
    FLAT: 1,
    CLEAN: 2,
    MOWING: 3,
    FLAT_CONSTRUCTION: 4,
    NC_OFFLINE_AUTO_STOW: 5,
    MINIMUM_ANGLE: 6,
    MAXIMUM_ANGLE: 7,
    STOW_NIGHT: 8,
    DIFFUSE_MODE: 9,
    REMOTE_QC: 10,
    FLAT_MAINTENANCE: 11,
    SNOW_SHEDDING: 12,
    LOW_BATTERY_AUTO_STOW: 13,
    WIND_STOW: 14,
    SNOW_STOW: 15,
    HAIL_STOW_MIN_ANGLE: 17,
    HAIL_STOW_MAX_ANGLE: 18
};

const wheatherStowDetail = {
    HIGH_WIND_GUST: 1,
    HIGH_AVG_WIND: 2,
    DEEP_SNOW: 3,
    DEEP_PANEL_SNOW: 4,
    LACK_WEATHER_INFO: 5,
    ACCU_WEATHER_WIND_GUST: 6,
    ACCU_WEATHER_AVG_WIND: 7,
    ACCU_WEATHER_DEEP_SNOW: 8,
    ACCU_WEATHER_ALERT_API: 9,
    TOO_COLD_TO_MOVE: 10
};

const AccumulatorModes = {
    UNKNOWN: 0,
    BATT: 1,
    PANEL: 2,
    MOTOR: 3,
    ANGULAR_ERROR: 4,
    CHARGER: 5,
    EXTERNAL_INPUT_2: 6,
    MOTOR_RUNTIME: 7
}

const assetStatus = {
    OFFLINE: 'OFFLINE',
    ONLINE: 'ONLINE',
    FCS: 'FCS',
    UNKNOWN: 'UNKNOWN',
    MANUAL_CONTROL: 'MANUAL CONTROL',
    FASTTRAK: 'FASTTRAK',
    GROUP_CONTROL: 'GROUP CONTROL',
    QC_FASTTRAK: 'QC FASTTRAK',
    REMOTE_QC: 'REMOTE QC',
    MOBILE_QC: 'MOBILE QC',
    NO_STATUS_MATCH: 'NO status match'
};

const assetStatusValue = {
    OFFLINE: 0,
    ONLINE: 1,
    FCS: 2,
    UNKNOWN: 3,
    MANUAL_CONTROL: 4,
    FASTTRAK_BLUE: 5,
    GROUP_CONTROL: 6,
    FASTTRAK_RED: 7,
    REMOTE_QC: 8,
    MOBILE_QC: 9
};

const terratrakSourceEmail = Object.freeze({
  DEVELOPMENT: "notify-dev@terratrak.com",
  STAGING: "notify-stage@terratrak.com",
  PRODUCTION: "notify@terratrak.com"
})

const terratrakStage = Object.freeze({
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production"
})



const panelCommandState = {
    NONE: 0,
    V_ESTOP: 1,
    PAUSE: 2,
    MOVE_TO_ABS: 3,
    MOVE_BY_DELTA: 4,
    MOVE_TO_PRESET: 5,
    LOCAL_ESTOP: 6,
    NCCB_STOP: 7,
    HHC_STOP: 8,
    CONFIG_CHANGE_STOP: 9,
    QAQC_STOP: 10,
}

const trackingStatus = {
    UNKNOWN: 0,
    MANUAL: 1,
    TRACKING_ONLY: 2,
    TRACKING_WITH_BACKTRACKING: 3,
    LOW_BATTERY_AUTO_STOW: 4,
    LOCAL_ESTOP: 5,
    IRC: 6,
    GRC: 7,
    FASTTRAK: 8,
    QC_FASTTRAK: 10,
    REMOTE_QC: 12
};

const eventName = {
    REMOTE_QC: 'ASSET-REMOTE-QC',
    REMOTE_QC_COMPLETE: 'ASSET-REMOTE-QC_COMPLETE',
    REMOTE_QC_FAILED: 'ASSET-REMOTE-QC_FAILED',
    REMOTE_QC_STOP: 'ASSET-REMOTE-QC_STOP',
    OFFLINE: 'ASSET-OFFLINE',
    ONLINE: 'ASSET-ONLINE',
    REMOTE_QC_REPORT: 'REMOTE_QC_REPORT',
    ASSET_FCS: 'ASSET-FCS',
    ASSET_FASTTRAK: 'ASSET-FASTTRAK',
    ASSET_FASTTRAK_STOP: 'ASSET-UNDER_FASTTRAK_STOP',
    ASSET_QC_FASTTRAK: 'ASSET-QC-FASTTRAK',
    ASSET_UNDER_QC_FASTTRAK_STOP: 'ASSET-UNDER_QC_FASTTRAK_STOP',
    ASSET_UNDER_MANUAL_CONTROL: 'ASSET-UNDER_MANUAL_CONTROL',
    ASSET_UNDER_MANUAL_CONTROL_STOP: 'ASSET-UNDER_MANUAL_CONTROL_STOP',
    ASSET_ESTOP_Engaged: 'ASSET-ESTOP-Engaged',
    ASSET_ESTOP_Disengaged: 'ASSET-ESTOP-Disengaged',
    ASSET_MOTOR_CURRENT_HW_FAULT: 'ASSET-MOTOR-CURRENT-HW-FAULT',
    ASSET_MOTOR_CURRENT_SW_FAULT: 'ASSET-MOTOR-CURRENT_SW_FAULT',
    ASSET_LOW_TEMP_RESTRICTED_MOVEMENT: 'ASSET-LOW-TEMP_RESTRICTED_MOVEMENT',
    ASSET_LOW_BATTERY_STOW: 'ASSET-LOW-BATTERY_STOW',
    ASSET_CHARGER_FAULT: 'ASSET-CHARGER_FAULT',
    ASSET_MOTOR_FAULT_TIMEOUT: 'ASSET-MOTOR-FAULT-TIMEOUT',
    ASSET_NO_CONNECTION_WITH_NC: 'ASSET-NO-CONNECTION_WITH_NC',
    ASSET_BATTERY_WARNING: 'ASSET-BATTERY_WARNING',
    ASSET_BATTERY_FAULT: 'ASSET-BATTERY_FAULT',
    ASSET_WRONG_REPORTING: 'ASSET_WRONG_REPORTING',// only in events
    //Machine Leaning events
    ML_ISSUE_POC: 'ML_ISSUE-POC',
    ML_ISSUE_CLEARED_POC: 'ML_ISSUE-CLEARED_POC',
    ML_ISSUE_CURRENT_ANGLE: 'ML_ISSUE-CURRENT_ANGLE',
    ML_ISSUE_CLEARED_CURRENT_ANGLE: 'ML_ISSUE_CLEARED-CURRENT_ANGLE',
    //Anomaly detection events
    ANOMALY_POC_WAKEUP: 'ANOMALY-POC_WAKEUP',
    ANOMALY_CLEARED_POC_WAKEUP: 'ANOMALY-CLEARED_POC_WAKEUP',
    ANOMALY_POC_NIGHTTIME_STOW: 'ANOMALY-POC_NIGHTTIME_STOW',
    ANOMALY_CLEARED_POC_NIGHTTIME_STOW: 'ANOMALY-CLEARED_POC_NIGHTTIME_STOW',
    ANOMALY_CURRENT_ANGLE: 'ANOMALY-CURRENT_ANGLE',
    ANOMALY_CLEARED_CURRENT_ANGLE: 'ANOMALY_CLEARED-CURRENT_ANGLE',


};

const userNotificationSchedulesType =  Object.freeze({
  "all_days" : "all_days",
  "work_days" : "work_days",
})


const cloudAlertMessages = {

  hailStormEvent: (siteMode, startTime, endTime, alertIssuedTime, bufferMinutes) => {
    const hailSiteMode = (siteMode == siteModes.MAX_ANGLE_WEST) ? siteModes.HAIL_STOW_MAX_ANGLE_WEST : siteModes.HAIL_STOW_MIN_ANGLE_EAST;
    return {
      icon: eventIcon[siteMode] + "_red",
      title: "AccuWeather Hail Stow: Hail Storm Alert",
      message:
        `AccuWeather is reporting a weather event with a possibility of hail.` +
        (alertIssuedTime ? ` Alert Issued: ${alertIssuedTime}.` : "") +
        ` Start Time: ${startTime}. End Time: ${endTime}. Proactive Hail Stow is enabled on this site, with a buffer of ${bufferMinutes} minutes. We will proactively place the site into a safe position (${AlertAndEventTitles[hailSiteMode]}) from ${startTime} to ${endTime}.`
    }
  }
};

const siteModes = Object.freeze({
  TRACKING_WITH_BACKTRACKING: 'TRACKING_WITH_BACKTRACKING',
  STOW: 'STOW',
  MIN_ANGLE_EAST: 'MIN_ANGLE_EAST',
  MAX_ANGLE_WEST: 'MAX_ANGLE_WEST',
  FLAT: 'FLAT',
  REMOTE_QC: 'REMOTE_QC',
  FLAT_MAINTENANCE: 'FLAT_MAINTENANCE',
  SNOW_SHEDDING: 'SNOW_SHEDDING',
  FLAT_CONSTRUCTION: 'FLAT_CONSTRUCTION',
  HAIL_STOW_MIN_ANGLE_EAST: 'HAIL_STOW_MIN_ANGLE_EAST',
  HAIL_STOW_MAX_ANGLE_WEST: 'HAIL_STOW_MAX_ANGLE_WEST',
});

const generateAlertTitleAndMessage = (alertOptions) => {
  const {
    alertType,
    leaderName,
    followerName,
    isLinked = false,
    status = null,
    batteryCurrent = 0,
    lastreported = 0,
    mlCurrentTime,
    mlDueDate,
    anomalyCurrentTimestamp,
    anomalyBatteryLevel,
    anomalyBatteryThreshold,
  } = alertOptions;
  // const linkedText = isLinked
  //   ? `${leaderName} & ${followerName}: `
  //   : `${leaderName}: `;
  const linkedText = ""

  const alertTypes = {
    rowOffline: {
      title: "Offline",
    },
    rowOnline: {
      title: "Online",
    },
    rowFcs: {
      title: "FCS",
    },
    rowFasttrak: {
      title: "FastTrak Connected",
    },
    rowFasttrakStop: {
      title: "FastTrak Disconnected",
    },
    rowQCFasttrak: {
      title: "(QC)FastTrak Connected",
    },
    rowQCFasttrakStop: {
      title: "(QC)FastTrak Disconnected",
    },
    remoteqcStart: {
      title: "Remote QC Start",
    },
    remoteqcStop: {
      title: "Remote QC Stop",
    },
    estopEngage: {
      title: "Local Emergency Stop Engaged",
    },
    estopDisengage: {
      title: "Local Emergency Stop button Disengaged",
    },
    motorCurrentHardwareFault: {
      title: "Motor Current Fault Detected (HW)",
    },
    motorCurrentSoftwareFault: {
      title: "Motor Current Fault Detected (SW)",
    },
    lowTempRestrictedMovement: {
      title: "Low Temperature Restricted Movement",
    },
    lowBatteryStow: {
      title: "Low Battery Auto Stow",
    },
    chargerFault: {
      title: "Charger Fault",
    },
    motorFaultTimeout: {
      title: "Motor Fault Detected (Timeout)",
    },
    noConnectionWithNC: {
      title: "Cannot communicate with Network Controller",
    },
    batteryWarning: {
      title: "Low Battery Warning",
      message: `battery is less than ${batteryCurrent}%. Last value reported was ${lastreported}%`,
    },
    lowBatteryFault: {
      title: "Low Battery Fault",
      message: `battery is less than ${batteryCurrent}%. Last value reported was ${lastreported}%`,
    },
    //Machine learning titles and messages
    mlIssuePoc: {
      title:
        "TerraTrak CloudSense: Machine Learning Issue Detected - Battery Charge Analysis Failed",
      message: `The Battery Charge Analysis has completed processing at ${mlCurrentTime}`,
    },
    mlIssueClearedPoc: {
      title:
        "TerraTrak CloudSense: Machine Learning Issued Cleared - Battery Charge Analysis",
      message: `TerraTrak's Machine Learning Platform was unable to complete the Battery Charge Analysis 
        at ${mlCurrentTime}. The system will re-run the analysis at ${mlDueDate}.`,
    },
    mlIssueCurrentAngle: {
      title:
        "TerraTrak CloudSense: Machine Learning Issue Detected - Current Angle Analysis Failed",
      message: `The Current Angle Analysis has completed processing at ${mlCurrentTime}`,
    },
    mlIssueClearedCurrentAngle: {
      title:
        "TerraTrak CloudSense: Machine Learning Issued Cleared - Current Angle Analysis",
      message: `TerraTrak's Machine Learning Platform was unable to complete the Current Angle Analysis
        at ${mlCurrentTime}. The system will re-run the analysis at ${mlDueDate}.`,
    },
    //Anomaly detection titles and messages
    anomalyPocWakeup: {
      title: "Low Battery Anomaly Detected",
      message: `The morning analysis of battery charge triggered an anomaly at 
        ${anomalyCurrentTimestamp}. The most recent battery charge reported ${anomalyBatteryLevel}% 
        which below its historical threshold of ${anomalyBatteryThreshold}%`,
    },
    anomalyClearedPocWakeup: {
      title: "Low Battery Anomaly Cleared",
      message: `The morning analysis of battery charge cleared the previous anomaly at 
        ${anomalyCurrentTimestamp}. The most recent battery charge reported ${anomalyBatteryLevel}%
         which is above its historical threshold of ${anomalyBatteryThreshold}%`,
    },
    anomalyPocNightTimeStow: {
      title: "Low Battery Anomaly Detected",
      message: `The evening analysis of battery charge triggered an anomaly at
        ${anomalyCurrentTimestamp}. The most recent battery charge reported ${anomalyBatteryLevel}% 
        which below its historical threshold of ${anomalyBatteryThreshold}%%`,
    },
    anomalyClearedPocNightTimeStow: {
      title: "Low Battery Anomaly Cleared",
      message: `The evening analysis of battery charge cleared the previous anomaly at
        ${anomalyCurrentTimestamp}. The most recent battery charge reported ${anomalyBatteryLevel}% 
        which is above its historical threshold of ${anomalyBatteryThreshold}%`,
    },
    anomalyCurrentAngle: {
      title: "Current Angle Anomaly Detected",
      message: `The TerraTrak Machine Learning system has identified an issue at ${anomalyCurrentTimestamp}.
        The row is not tracking on its projected path.`,
    },
    anomalyClearedCurrentAngle: {
      title: "Current Angle Anomaly Cleared",
      message: `The Current Angle Anomaly has cleared at ${anomalyCurrentTimestamp}.
        The row is tracking on its projected path.`,
    },

    //Manual Control alerts
    rowManualControl: {
      title: (status) => {
        return status === "Virtual EStop" ? "Virtual Emergency Stop Engaged" : `Manual Row Control Start ${status.replace("&deg;", "°")}`;
      },
    },
    //Manual Control stop alerts
    rowManualControlStop: {
      title: (status) => {
        if (status === "Virtual EStop") {
          return "Virtual Emergency Stop Disengaged";
        }
        return `Manual Row Control Stop`;
      },
    },
  };

  const title =
    typeof alertTypes[alertType].title === "function"
      ? alertTypes[alertType].title(status)
      : alertTypes[alertType].title;

  const message = alertTypes[alertType]?.message || null;

  return {
    title: linkedText + title,
    message: message ? linkedText + message : null,
  };
};

const linkRowTypes = {
  LEADER: "LEADER",
  FOLLOWER: "FOLLOWER",
  NONE: "NONE",
};

const eventIcon = {
  REMOTE_QC: "remote_qc",
  SETTING: "setting_gray",
  MIN_ANGLE_EAST: "min_angle",
  MAX_ANGLE_WEST: "max_angle",
  MODE_TRACKING: "mode_tracking",
  MODE_TRACKING_FAULT: "mode_tracking_fault",
  MODE_MAINTENANCE: "mode_maintenance",
  OFFLINE: "mode_tracking_offline",
  ESTOP: "virtual_estop",
  ESTOP_ENGAGED: "mode_tracking_engaged",
  ESTOP_DISENGAGED: "mode_stop_dis",
  BATTERY_LOW: "battery_low",
  BATTERY_DAMAGE: "battery_damage",
  BATTERY_WARNING: "battery_25",
  CLOUD_INTELLIGENCE: "cloud_intelligence",
  CLOUD_INTELLIGENCE_GREY: "cloud_intelligence_grey",
};

const NotificationTypes = Object.freeze({
//ROW BOX NOTIFICATIONS TYPES
  ROW_STATUS: 'rc_status',
  ROW_FCS: 'rc_fcs',
  ROW_FASTTRAK: 'rc_under_fasttrak_control',
  ROW_REMOTE_QC: 'rc_remote_qaqc_control',
  ROW_MANUAL_CONTROL: 'rc_under_manual_control',
  ROW_ESTOP: 'rc_estop',
  ROW_LOCAL_STATUS_BITS: 'rc_local_status_bits',
  ROW_LOW_BATTERY_WARNING: 'rc_low_battery_warning',
  ROW_LOW_BATTERY_FAULT: 'rc_low_battery_fault',
  ML_ROW_TRACKING: 'ml_row_tracking',
  ML_ROW_BATTERY_ANALYSIS: 'ml_battery_analysis',
  ANOMALY_ROW_TRACKING: 'anomaly_row_tracking',
  ANOMALY_ROW_PM_BATTERY_ANALYSIS: 'anomaly_pm_battery_analysis',
  ANOMALY_ROW_AM_BATTERY_ANALYSIS: 'anomaly_am_battery_analysis',
});

const AlertAndEventTitles = Object.freeze({
  TRACKING_WITH_BACKTRACKING: `Mode Change - Tracking w/ Backtracking`,
  NIGHT_TIME_STOW: `Mode Change - Night Time Stow`,
  MIN_ANGLE_EAST: `Preset Fixed Angle: Minimum Angle`,
  MAX_ANGLE_WEST: `Preset Fixed Angle: Maximum Angle`,
  HAIL_STOW_MIN_ANGLE_EAST: `Hail Stow: Minimum Angle`,
  HAIL_STOW_MAX_ANGLE_WEST: `Hail Stow: Maximum Angle`,
});

const qcStates = {
    DONE: 'DONE',
    STOP: 'STOP'
}

const userNotificationScheduleWorkHours =  Object.freeze({
  "START" : '08:00', // 08:00 am
  "END" : '17:00', // 05:00 pm
})

const constants = {
    INVALID_SNAP_ADDR: 'ffffff',
    trackingModes,
    manualModeDetail,
    wheatherStowDetail,
    mqtt,
    LAST_ACTIVITY_UPDATE_INTERVAL: 60, // 60 seconds
    assetTypes,
    getAssetTypeStr,
    deviceTypeIds,
    deviceTypeNames,
    getDeviceTypeIdFromAssetType,
    terratrakSourceEmail,
    terratrakStage,
    getHardwareRevFromAssetType,
    getDeviceModelFromAssetType,
    s3Bucket,
    cloudAlertMessages,
    commandSource,
    userNotificationScheduleWorkHours,
    getConfigFlagsFromAssetType,
    getAssetTypeFromDeviceModel,
    userNotificationSchedulesType,
    AccumulatorModes,
    StowStates,
    siteModes,
    assetStatus,
    assetStatusValue,
    trackingStatus,
    AlertAndEventTitles,
    panelCommandState,
    eventName,
    eventIcon,
    StowTypes,
    qcStates,
    generateAlertTitleAndMessage,
    linkRowTypes,
    getDeviceTypeNameFromAssetType,
    NotificationTypes
};


module.exports = constants;
