const pg = require("../utils/lib/pg");
const moment = require("moment");
const flatten = require('flat');

const prefixes = Object.freeze({
  PREFIX_ASSET: 'asset',
  PREFIX_BATTERY: 'battery',
  PREFIX_CHARGER: 'charger',
  PREFIX_TRACKING: 'tracking', // tracking mode update
  PREFIX_ASSET_CONF: 'asset_conf', // asset current configuration update
  PREFIX_SNOW_SHEDDING: 'snow_shedding',
  PREFIX_SNOW_SHEDDING_REPORT: 'snow_shedding_report',
  PREFIX_RACK: 'rack',
  PREFIX_RADIO: 'radio',
  PREFIX_MOTOR: 'motor',
  PREFIX_PANEL: 'panel',
  PREFIX_PANEL2: 'panel2'
});

const getPayload = (prefix, data) => {
  if (prefix) {
    let payload = {};
    payload[prefix] = data;
    return payload;
  }

  throw new Error(`Uknown history prefix ${prefix}`);
}

/*
 * If prefix is not passed, then payload should look like this:
 * payload = {
 *    prefix1: {...payload1},
 *    prefix2: {...payload2}
 * }
 *
 * Otherwise prefix must be passed.
 */
const addUpdateAssetHistory = async (snapAddr, timestamp, payload, prefix) => {

  if (prefix) {
    payload = getPayload(prefix, payload);
  }

  const flat = flatten(payload, { safe: true });
  const { rowCount } = await pg.addUpdateAssetHistory(snapAddr, timestamp, JSON.stringify(flat));
  if (rowCount < 1) {
    console.error('unable to add asset history', JSON.stringify({ rowCount, snapAddr, timestamp, flat }));
  }

  return {
    rowCount,
    payload,
    flat
  }
}

const addUpdateAssetHistoryCombine = async (snapAddr, timestamp, data) => {
  return addUpdateAssetHistory(snapAddr, timestamp, data);
};

const addSnowSheddingReportHistory = async (snapAddr, timestamp, payload) => {
  return addUpdateAssetHistory(snapAddr, moment(timestamp).format(), payload, prefixes.PREFIX_SNOW_SHEDDING_REPORT);
};

/*
 * Format for Rack Angle History Data, Example JSON
 * [{
 *  "timestamp": "2023-01-01T00:00:00Z"
 *  "snap_addr": "13b4aa"
 *  "data": {
 *    "asset.tracking_status": 1,
 *    "asset.panel_index": 0,
 *    "asset.panel_commanded_state": 0
 *    "tracking.mode": 1,
 *    "tracking.mode_detail": 1,
 *    "motor.current": 1.221,
 *    "rack.current_angle": 11,
 *    "rack.requested_angle": 12
 *  }
 * }]
 */
const getRackHistBySnapAddrAndTimestamp = async (snapAddr, startTime, endTime) => {
  const {rows} = await pg.getRackAngleHistBySnapAddr(snapAddr, startTime, endTime);
  return rows?.length > 0 ? rows : [];
};



const getAssetHistoryBySnapAddr = async (snapAddr) => {
  const res = await pg.getAssetHistoryBySnapAddr(snapAddr)
  if (res && res.rows.length > 0) {
    return res.rows[0];
  }
  return null;
}

module.exports = {
  getAssetHistoryBySnapAddr,
  addSnowSheddingReportHistory,
  getRackHistBySnapAddrAndTimestamp,
  addUpdateAssetHistoryCombine,
  prefixes
};



