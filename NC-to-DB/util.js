exports.linkQualitydBmToPercent = function (linkQualitydBm) {
  // The following formula is based on information obtained from the Synapse Support Forum
  const linkQualityPercent = Math.min(
    99,
    Math.max(0, Math.floor(100 - (100.0 * (linkQualitydBm - 18)) / (95 - 18)))
  );
  return linkQualityPercent;
};

exports.sleep = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

exports.toSnakeCase = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(this.toSnakeCase);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(), // Convert camelCase to snake_case
      this.toSnakeCase(value),
    ])
  );
};

exports.getUTCNow = function () {
  return Math.round(new Date().valueOf() / 1000);
};

exports.snappyHex = (value) => {
  value = value >>> 0;// This gets us back to unsigned values
  value &= 0xffff;    // This gets us back to 16-bits
  const v = value.toString(16).toUpperCase();
  return `0x${this.padWithZeroes(v, 4)}`;
};

exports.padWithZeroes = (number, length) => {
  let str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

exports.uptimeStr = function (uptimeSecs) {
  const rem_secs = this.padWithZeroes(uptimeSecs % 60, 2);
  const mins = Math.trunc(uptimeSecs / 60);
  const rem_mins = this.padWithZeroes(mins % 60, 2);
  const hours = Math.trunc(mins / 60);
  const rem_hours = this.padWithZeroes(hours % 24, 2);
  const days = Math.trunc(hours / 24);
  const rem_days = days % 365;
  const years = Math.trunc(days / 365);

  let yd = "";
  if (years) {
    yd = `${years}y ${rem_days}d `;
  } else if (rem_days) {
    yd = `${rem_days}d `;
  }

  return `${yd}${rem_hours}:${rem_mins}:${rem_secs}`;
};

exports.getSnapAddress = function (snapAddr) {
  return snapAddr.reduce(
    (str, c) => str + c.toString(16).padStart(2, "0"),
    ""
  );
};

exports.compareVersionNumbers = function compareVersionNumbers(v1, v2) {
  var v1parts = v1.split(".");
  var v2parts = v2.split(".");

  // First, validate both numbers are true version numbers
  function validateParts(parts) {
    for (const part of parts) {
      if (!isPositiveInteger(part)) {
        return false;
      }
    }
    return true;
  }
  if (!validateParts(v1parts) || !validateParts(v2parts)) {
    return NaN;
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1;
    }

    if (v1parts[i] === v2parts[i]) {
      continue;
    }
    if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    return -1;
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
};
function isPositiveInteger(x) {
  return /^\d+$/.test(x);
}
