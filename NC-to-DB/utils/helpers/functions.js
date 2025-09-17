const fs = require('fs');
const { INVALID_SNAP_ADDR, linkRowTypes, URLs } = require('../constants');
const moment = require("moment");
const momentTimezone = require("moment-timezone");
const axios = require("axios");
const tzlookup = require("tz-lookup"); // npm package for timezone lookup

exports.getPgTimestamp = () => {
  const now = new Date();

  return `${now.getUTCFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${(
    "0" + now.getDate()
  ).slice(
    -2
  )} ${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}.${now.getUTCMilliseconds()}`;
};


const isValidCoordinates = (longitude, latitude) =>
  typeof longitude === "number" &&
  typeof latitude === "number" &&
  longitude >= -180 &&
  longitude <= 180 &&
  latitude >= -90 &&
  latitude <= 90;

// Updated getTimezone Function
const getTimezone = ({ longitude, latitude, timezone }) => {
  if (timezone) return timezone;

  return isValidCoordinates(longitude, latitude)
    ? tzlookup(latitude || 0, longitude || 0)
    : "";
};

// Function to extract map information
const getMapInformation = (data) => {
  const filteredData = data?.results?.[0]?.address_components
  .filter((address) =>
    ["country", "administrative_area_level_1"].includes(address.types[0])
  )
  .reduce((prevAddress, currentAddress) => {
    return {
      ...prevAddress,
      [currentAddress?.types[0]]: currentAddress.long_name,
    };
  }, {});
  console.log("filteredData: ", filteredData);
  const { lat: latitude, lng: longitude } =
  data?.results?.[0]?.geometry.location || {};

  return {
    timezone: getTimezone({ latitude, longitude }),
    country: filteredData?.country,
    state: filteredData?.administrative_area_level_1,
    address: data?.results?.[0]?.formatted_address,
    latLong: data?.results?.[0]?.geometry.location,
  };
};

// Function to get address information from Google Maps API
exports.getAddressApi = async ({ longitude, latitude }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_KEY;

  if (!googleMapsApiKey) {
    throw new Error("Google Maps API key is not set.");
  }

  try {
    const { data } = await axios.get(URLs.googleMapsLocationDetails(latitude, longitude, googleMapsApiKey));
    console.log("Google Maps Data: ", data);

    return getMapInformation(data);
  } catch (error) {
    console.error("Error fetching data from Google Maps API:", error.message);
    throw error;
  }
};

function isNewTimeGreater(nT, oT) {
  return (nT.year() > oT.year())
    || (nT.year() == oT.year() && nT.month() > oT.month())
    || (nT.year() == oT.year() && nT.month() == oT.month() && nT.date() > oT.date());
}
/*
 * Returns wakeup_poc and wakeup_poc_at of battery
 */
exports.evaluateWakeupPOC = async (battUpdate, project, batteryInfo) => {
  const { wakeup_poc: oldWakeupPoc, wakeup_poc_at: oldWakeupPocAt } = batteryInfo;
  const newWakeupPoc = battUpdate.getCharged();
  const newWakeupPocAt = battUpdate.getWhen().toDate();

  if (!project || (project && !project.timezone)) {
    return { newWakeupPoc: null, newWakeupPocAt: null };
  }

  if (!oldWakeupPoc || !oldWakeupPocAt) {
    return { newWakeupPoc, newWakeupPocAt };
  }

  const tzNewTime = momentTimezone(newWakeupPocAt).tz(project.timezone);
  const tzOldTime = momentTimezone(oldWakeupPocAt).tz(project.timezone);
  if (isNewTimeGreater(tzNewTime, tzOldTime)) {
    return { newWakeupPoc, newWakeupPocAt };
  }
  return {
    newWakeupPoc: oldWakeupPoc,
    newWakeupPocAt: oldWakeupPocAt
  };
};

exports.arrayToString = (array) => {
  let strVals = "";
  array.forEach((e) => {
    strVals = `${strVals} '${e}',`;
  });
  return strVals.slice(0, -1);
};

exports.getEpochTime = (dateTime, minToSubtract) => {
  if (!minToSubtract && dateTime) {
    return moment(dateTime).valueOf().toString();
  }
  const startTime = moment(dateTime)
  const endTime = moment(dateTime);
  if (minToSubtract) {
    startTime.subtract(minToSubtract, 'minutes');
  }
  return {
    startTime: startTime.valueOf().toString(),
    endTime: endTime.valueOf().toString()
  };
};

exports.getKeysAndValues = (data, type) => {
  let query = "";
  const values = [];
  let i = 1;

  if (type === "update") {
    for (const value in data) {
      query = `${query}${value}=$${i}, `;
      values.push(data[value]);
      i++;
    }
    query = query.slice(0, -2);
  } else if (type === "insert") {
    let placeholderVals = "";
    for (const value in data) {
      query = `${query} ${value},`;
      placeholderVals = `${placeholderVals}$${i},`;
      values.push(data[value]);
      i++;
    }

    query = `(${query.slice(0, -1)}) VALUES (${placeholderVals.slice(0, -1)})`;
  }
  return { query, values };
};

exports.getS3BucketAndFileName = (asset) => {
  const fileName = process.env["RC_FILE_PREFIX"] + asset.nc_asset_id + ".json";
  const filePath = process.env["RC_FILE_PATH"] + "/" + fileName;
  const bucket = process.env["RC_FILE_BUCKET"];

  return { filePath, bucket };
};

exports.sleep = (ms = generateWait()) => {
  console.log(`Sleeping for ${ms}ms`);
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log(`waking up after ${ms}ms`);
      resolve();
    }, ms)
  );
};

const generateWait = () => {
  return Math.floor(Math.random() * 2000 + 500);
};

exports.generateWait = generateWait;

const getSnapAddress = (snap_addr) => {

  return snap_addr.reduce(
    (str, c) => str + c.toString(16).padStart(2, "0"),
    ""
  );
};
exports.getSnapAddr = getSnapAddress;

exports.logQuery = (query, result) => {
  let query_log = {
    "query": query,
    "result": result
  }
  console.log(query_log);
}

exports.logUpdate = (update, network_controller, snap_addr, detail) => {
  let log = {
    "update": update, "network_controller": network_controller, "snap_addr": getSnapAddress(snap_addr), "detail": detail
  };
  console.log(JSON.stringify(log));
}

const base64ToHex = (str) => {
  return Buffer.from(str, 'base64').toString('hex');
};

const isObject = (obj) => {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
};
const formatCloudUpdate = (obj) => {
  //console.log(`formatCloudUpdate `,obj);
  const rval = Object.entries(obj)
    .filter(k => !(k[1] === undefined || (Array.isArray(k[1]) && k[1].length === 0)))
    .reduce((acc, key) => {
      if (Array.isArray(key[1])) {
        //console.log(`isArray[${key[0]}:`,key[1]);
        acc[key[0]] = key[1].map(item => formatCloudUpdate(item));
        //console.log(`isArray[${key[0]}-}:`,acc[key[0]]);
      } else if (isObject(key[1])) {
        //console.log(`isObj[${key[0]}]:`,key[1]);
        //if (key[0] == 'when' && 'seconds' in key[1] && 'nanos' in key[1]) {
        if ('seconds' in key[1] && 'nanos' in key[1]) {
          acc[key[0]] = new Date((key[1].seconds * 1000) + (key[1].nanos / 1000000));
        } else {
          acc[key[0]] = formatCloudUpdate(key[1]);
        }
        //console.log(`isObj[${key[0]}]-:`,acc[key[0]]);
      } else {
        //console.log(`isKey[${key[0]}]:`,key[1]);
        if (key[0].indexOf('napAddr') != -1) {
          acc[key[0]] = base64ToHex(key[1]);
        } else {
          acc[key[0]] = key[1];
        }
        //console.log(`isKey[${key[0]}]-:`,acc[key[0]]);
      }
      return acc;
    }, {});

  //console.log(`formatCloudUpdate- `,rval);
  return rval;
};

exports.readFileAsync = async (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
}

exports.isValidSnapAddr = (snapAddr) => {
  if (!snapAddr || snapAddr === INVALID_SNAP_ADDR) {
    return false;
  }

  const regex = /[0-9a-f]{6}/;
  const result = regex.exec(snapAddr);
  return result !== null;
}

exports.isLinkedRow = (linkRowType, linkRowRef, device_type) =>
  linkRowType === linkRowTypes.LEADER &&
  linkRowRef &&
  device_type === "Row Controller";

exports.formatCloudUpdate = formatCloudUpdate;

/**
 * Check if a timestamp is valid.
 * @param {string} timestamp - The timestamp to check.
 * @returns {boolean} - Whether the timestamp is valid.
 */
exports.isValidTimestamp = (timestamp) => {
  return moment(timestamp).isValid();
};

/**
 * Check if two timestamps are equal.
 * @param {string} timestamp1
 * @param {string} timestamp2
 * @returns {boolean} - Whether the two timestamps are equal.
 */
exports.areTimestampsEqual = (timestamp1, timestamp2) => {
  return moment(timestamp1).isSame(moment(timestamp2));
}

/**
 * Parse a timestamp string with a fallback value.
 * @param {string} timestampStr - The timestamp string to parse.
 * @param {string} fallback - The fallback timestamp string.
 * @returns {Date} - The parsed timestamp or the fallback timestamp.
 */
exports.parseTimestampWithFallback = (timestampStr, fallback) => {
  if (this.isValidTimestamp(timestampStr)) return new Date(timestampStr)

  console.warn(`Invalid timestamp format: ${timestampStr}`);

  if (fallback) {
    console.warn(`Using fallback timestamp: ${fallback}`);
    return fallback ?? null;
  }

  console.warn(`Invalid fallback timestamp: ${fallback}`);
  return null;
}

/**
 * Get the current time or add a specified value of time.
 * @param {number} [val] - The value to add to the current time.
 * @param {moment.unitOfTime.DurationConstructor} [unit] - The unit of time (e.g., 'seconds', 'minutes', 'hours', etc.) to add to the current time.
 * @returns {moment.Moment} - The current time or the time after adding the specified value.
 */
exports.getCurrentTime = (val, unit, formatted=false) => {
  const currentTime = moment();
  if (val && unit) currentTime.add(val,unit);
  return formatted ? currentTime.format('MM/DD/YY HH:mm:ss') : currentTime;
}

/**
 * Converts a 'when' object containing seconds and nanoseconds to a timestamp.
 * @param {Object} when The 'when' object containing seconds and nanoseconds.
 * @param {number} when.seconds The seconds part of the 'when' object.
 * @param {number} when.nanos The nanoseconds part of the 'when' object.
 * @returns {Date} The timestamp converted from the 'when' object.
 */
exports.convertWhenToTimestamp = (when) => {
  const { seconds, nanos } = when;
  const milliseconds = seconds * 1000 + Math.floor(nanos / 1000000);
  return new Date(milliseconds);
};
