const mqtt = {
  accountPrefix: 'a2dlentyd00pdf',
  accountAtsPrefix: 'a2dlentyd00pdf-ats',
  ncTopic: '/topics/networkControllers'
}

const assetTypes = {
  ASSET_TYPE_RB: 0,
  ASSET_TYPE_NC: 1,
  ASSET_TYPE_WS: 2
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

const LOCAL_ERRORS = [
  "NO-CONNECTION_WITH_NC",
  "MOTOR-CURRENT-HW-FAULT",
  "MOTOR-FAULT-TIMEOUT",
  "CHARGER_FAULT",
  "MOTOR-CURRENT_SW_FAULT",
  "LOW-BATTERY_STOW",
  "LOW-TEMP_RESTRICTED_MOVEMENT",
  "ESTOP-Engaged",
  "ESTOP-Disengaged"
];

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

const rowTrackingAnomalyTypes = {
  ROW_NOT_MOVING: 'ROW_NOT_MOVING',
  ROW_NOT_FOLLOWING: 'ROW_NOT_FOLLOWING'
};

const cloudAlertEventNames = {
  ROW_NOT_TRACKING_ANOMALY: 'ROW_NOT_TRACKING_ANOMALY',
  ROW_TRACKING_NORMALLY: 'ROW_TRACKING_NORMALLY',
  NC_COMMANDED_STATE: 'NC-COMMANDED-STATE',
  MOBILE_FASTTRAK: 'MOBILE_FASTTRAK',
};

const cloudAlertEventTitles = {
  ROW_NOT_MOVING_TITLE: `Stopped Moving`,
  ROW_NOT_FOLLOWING_TITLE: `Stopped Tracking`,
  ROW_MOVING_AGAIN: `is Moving Again`,
  ROW_TRACKING_AGAIN: `is Tracking Again`,
  TRACKING_WITH_BACKTRACKING: `Mode Change - Tracking w/ Backtracking`
};

const timelineEventsAndCloudAlertIcons = {
  CLOUD_INTELLIGENCE_ALERT: 'cloud_intelligence',
  CLOUD_INTELLIGENCE_ALERT_CLEARED: 'cloud_intelligence_grey',
};

const TimelineEvents = Object.freeze({
  GRC_CMD_CREATED: 'GRC-CMD_CREATED',
  GRC_CMD_STARTED: 'GRC-CMD_STARTED',
  GRC_CMD_STOPPED: 'GRC-CMD_STOPPED',
  GRC_CMD_DELETED: 'GRC-CMD_DELETED',
  GRC_CMD_UPDATED: 'GRC-CMD_UPDATED',
  REMOTE_QA_QC_STOP: 'REMOTE_QA_QC_STOP',
  REMOTE_QA_QC_START: 'REMOTE_QA_QC_START',
  MOBILE_FASTTRAK: 'MOBILE_FASTTRAK',
  ROW_NOT_TRACKING_ANOMALY: 'ROW_NOT_TRACKING_ANOMALY',
  NC_COMMANDED_STATE: 'NC-COMMANDED-STATE',
  ASSET_MOTOR_CURRENT_SW_FAULT:'ASSET-MOTOR-CURRENT_SW_FAULT',
  ASSET_MOTOR_CURRENT_HW_FAULT: 'ASSET-MOTOR-CURRENT-HW-FAULT',
  AUTO_FIRMWARE_UPDATE: 'AUTO_FIRMWARE_UPDATE'
});

const AlertAndEventTitles = Object.freeze({
  TRACKING_WITH_BACKTRACKING: `Mode Change - Tracking w/ Backtracking`,
  NIGHT_TIME_STOW: `Mode Change - Night Time Stow`
});

const NotificationTypes = Object.freeze({
  ANOMALY_ROW_NOT_MOVING: 'anomaly_row_not_moving',
  ANOMALY_ROW_NOT_FOLLOWING: 'anomaly_row_not_following'
});

const linkRowTypes = {
  LEADER: "LEADER",
  FOLLOWER: "FOLLOWER",
  NONE: "NONE",
};

const cloudAlertMessages = {
  rowNotMovingMessage: (rowNum, snapAddr) => `Row${rowNum ? ' ' + rowNum + ' ' : ''}(Row Box: ${snapAddr}) has stopped moving. Please check to make sure the motor cable is connected to the motor and the connection is tight.`,
  rowNotFollowingMessage: (rowNum, snapAddr) => `Row${rowNum ? ' ' + rowNum + ' ' : ''}(Row Box: ${snapAddr}) is not able to track on its intended path. Please check to make sure the motor cable is connected to the motor and the connection is tight.`,
  rowMovingAgainMessage: (rowNum, snapAddr) => `Row${rowNum ? ' ' + rowNum + ' ' : ''}(Row Box: ${snapAddr}) has started moving again.`,
  linkedRowNotMovingMessage: (leaderName, FollowerName) => `${leaderName} & ${FollowerName} has stopped moving. Please check to make sure the motor cable is connected to the motor and the connection is tight.`,
  linkedRowNotFollowingMessage: (leaderName, FollowerName) => `${leaderName} & ${FollowerName} is not able to track on its intended path. Please check to make sure the motor cable is connected to the motor and the connection is tight.`,
  linkedRowMovingAgainMessage: (leaderName, FollowerName) => `${leaderName} & ${FollowerName} has started moving again.`,
  autoFirmwareUpdateCompleted: () => {
    return {
      eventName: "AUTO_FIRMWARE_UPDATE",
      title: `Auto Firmware Update Completed`,
      message: '',
      stage:{
        START:"START",
        STOP:"STOP",
        CANCELED: 'Cancelled',
        COMPLETED: "Completed"
      }
    }
  },

};

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

const hasModeDetail = (mode) => {
  return (mode === trackingModes.WEATHER_STOW || mode === trackingModes.MANUAL_STOW || mode === trackingModes.SNOW_SHEDDING);
}

const snowSheddingDetail = {
  SNOW_SHEDDING_WITH_DELAY: 1
}

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

const weatherDataType = {
  REALTIME: 'R',
  BUFFERED: 'B',
  FAKE: 'F',
}

const snowSheddingState = Object.freeze({
  SNOW_SHEDDING_STARTED: 0,
  SNOW_SHEDDING_STOPPED: 1,
  SNOW_SHEDDING_DELAYED: 2,
  SNOW_SHEDDING_STARTED_WITH_DELAY: 3
});

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

// 8 bit defined (Cannot extend it further) S-blob
// Mostly it has row faults
const assetStatusBits = {
  NC_OFFLINE: 0x0001, // 0b00000001
  OVER_CURRENT: 0x0002, // 0b00000010
  MOTOR_TIMEOUT: 0x0004,  // 0b00000100
  CHARGER_FAULT: 0x0008,  // 0b00001000
  MOTOR_CURRENT_LIMIT: 0x0010,  // 0b00010000
  BATTERY_LOW_MOVEMENT_RESTRICTED: 0x0020,  // 0b00100000
  DIFFUSE_MODE: 0x0040, // 0b01000000
  ESTOP_IS_PRESSED: 0x0080,  // 0b10000000
  MOBILE_QC: 0x100000,
  ROW_LOCK: 0x800000  // 0b100000000000000000000000
};

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

const redisStreamErrorString = {
  XADD_ID_EQUAL_OR_SMALLER: "ERR The ID specified in XADD is equal or smaller than the target stream top item"
};

const assetStatusValTextMapping = {
  0: 'OFFLINE',
  1: 'ONLINE',
  2: 'FCS',
  3: 'UNKNOWN',
  4: 'MANUAL CONTROL',
  5: 'FASTTRAK',
  6: 'GROUP CONTROL',
  7: 'QC FASTTRAK',
  8: 'REMOTE QC',
  9: 'MOBILE QC',
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
  HIGH_TEMPERATURE_MOTOR_CUTOFF: 9,
  QC_FASTTRAK: 10,
  TRACKING_WITH_DIFFUSE: 11,
  REMOTE_QC: 12,
  SNOW_SHEDDING: 13,
  AUTO_SNOW_SHEDDING: 14,
  SNOW_SHEDDING_RETRY: 15
};

const SnowSheddingReportStatus = Object.freeze({
  UNRESPONSIVE: 0,
  PENDING: 1,
  FAILED: 2,
  RETRIED: 3,
  COMPLETED: 4
})

const StowTypes = Object.freeze({
  HAIL_STOW: "Accuweather_Alert-Hail_Stow",
  AVG_WIND: "Weather_Forecast-Avg_Wind",
  WIND_GUST: "Weather_Forecast-Wind_Gust"
});

/*
 * These states are defined for the hail stow purpose, can be used for new stow types
 */
const StowStates = Object.freeze({
  NOT_STARTED: 1,
  STARTED: 2,
  ENDED: 12
});

const SiteStowTiltType = Object.freeze({
  "high_tilt": "high_tilt",
  "low_tilt": "low_tilt"
})

const URLs = {
  googleMapsLocationDetails: (latitude, longitude, googleMapsApiKey) => `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
};

const getSnowSheddingReportStatusStr = (status) => {
  switch (status) {
    case SnowSheddingReportStatus.UNRESPONSIVE:
      return 'unresponsive';
    case SnowSheddingReportStatus.PENDING:
      return 'pending';
    case SnowSheddingReportStatus.FAILED:
      return 'failed';
    case SnowSheddingReportStatus.RETRIED:
      return 'retried';
    case SnowSheddingReportStatus.COMPLETED:
      return 'completed';
    default:
      throw new Error(`Unknown snow shedding report status ${status}`);
  }
}

const constants = {
  INVALID_SNAP_ADDR: 'ffffff',
  trackingModes,
  hasModeDetail,
  snowSheddingDetail,
  snowSheddingState,
  manualModeDetail,
  wheatherStowDetail,
  weatherDataType,
  mqtt,
  StowTypes,
  StowStates,
  LAST_ACTIVITY_UPDATE_INTERVAL: 60, // 60 seconds
  assetTypes,
  getAssetTypeStr,
  deviceTypeIds,
  deviceTypeNames,
  getDeviceTypeIdFromAssetType,
  getHardwareRevFromAssetType,
  getDeviceModelFromAssetType,
  getConfigFlagsFromAssetType,
  getAssetTypeFromDeviceModel,
  AccumulatorModes,
  assetStatus,
  TimelineEvents,
  AlertAndEventTitles,
  LOCAL_ERRORS,
  URLs,
  cloudAlertEventNames,
  assetStatusValTextMapping,
  rowTrackingAnomalyTypes,
  NotificationTypes,
  SiteStowTiltType,
  cloudAlertEventTitles,
  cloudAlertMessages,
  assetStatusValue,
  trackingStatus,
  timelineEventsAndCloudAlertIcons,
  assetStatusBits,
  panelCommandState,
  redisStreamErrorString,
  SnowSheddingReportStatus,
  getSnowSheddingReportStatusStr,
  linkRowTypes
};


module.exports = constants;
