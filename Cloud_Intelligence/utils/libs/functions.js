const { s3Bucket, linkRowTypes } = require("../constants");
const moment = require("moment");

exports.getPgTimestamp = (timestamp) => {
  const now = timestamp ? timestamp : new Date();

  return `${now.getUTCFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${(
    "0" + now.getDate()
  ).slice(
    -2
  )} ${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}.${now.getUTCMilliseconds()}`;
};

exports.getS3EmailAssetsUrl = () => {
  const env = ['staging', 'production'].includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';
  const url = `https://s3.${s3Bucket.REGION}.amazonaws.com/ts-cloud-ui-assets/${env}/email-assets/`;
  return url;
};

/**
 * Returns the time minus the hours, specified in args, from now/timestamp
 * @param {int} howOld number of hour to subtract from the time
 * @param {timestamp} timestamp timestamp to which hours are to be added
 */
exports.getOldTime = (howOld, timestamp = null) => {
  const time = timestamp === null ? new Date() : new Date(timestamp);
  time.setHours(time.getHours() - howOld);
  return time;
};

/**
 * Returns the time plus the hours, specified in args, from now/timestamp
 * @param {int} hours number of hour to add to time
 * @param {timestamp} timestamp timestamp to which hours are to be added
 */
exports.addTime = (hours, timestamp = null) => {
  const time = timestamp === null ? new Date() : new Date(timestamp);
  time.setHours(time.getHours() + hours);
  return time;
};

/**
 * Formats a given date string into a user-friendly, timezone-aware format.
 *
 * If a valid IANA timezone is provided, it uses that to localize the time.
 * Fallbacks to 'America/New_York' if timezone is not provided or invalid.
 *
 * Handles custom formatting of numeric timezone abbreviations (e.g., '+04') 
 * into 'UTC +04:00' format.
 *
 * Example output: `'Jul 21, 2025 at 03:30 PM UTC +05:00'`
 *
 * @function
 * @param {string|Date|null|undefined} date - The date input to be formatted. Accepts ISO strings or Date objects.
 * @param {string} [timezone] - Optional IANA timezone string (e.g., 'Asia/Karachi', 'America/Los_Angeles').
 * @returns {string} A formatted string like `'Jul 21, 2025 at 01:30 PM EDT'`, or an empty string if input is invalid.
 */
exports.formatUserFriendlyTime = (date, timezone = "America/New_York") => {
  if (!date) return '';
  try {
    const m = moment.tz(date, timezone);
    let tzAbbr = m.format('z'); // Could be 'EDT', 'PKT', or a numeric offset like '-03'
    // Check if it's a numeric-only abbreviation
    if (/^[+-]?\d+$/.test(tzAbbr)) {
      const offsetMinutes = m.utcOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const absMinutes = Math.abs(offsetMinutes);
      const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
      const minutes = String(absMinutes % 60).padStart(2, '0');
      tzAbbr = `UTC ${sign}${hours}:${minutes}`;
    }
    return m.format('MMM DD, YYYY [at] hh:mm A') + ' ' + tzAbbr;
  } catch (e) {
    return moment(date).format('MMM DD, YYYY [at] hh:mm A z');
  }
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

exports.getStatusBit = (status) => {
  let arr = [];
  [1, 2, 4, 8, 16, 32, 64, 128].forEach((item) => {
    if ((item & status) === item) {
      arr = [...arr, item];
    }
  });
  return arr;
};

exports.isLinkedRow = (linkRowType, linkRowRef, device_type) =>
  linkRowType === linkRowTypes.LEADER &&
  linkRowRef &&
  device_type === "Row Controller";