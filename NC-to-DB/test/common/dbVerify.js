const testPg = require('./testPg');
const chai = require('chai');
const { expect } = chai;
const { find: _find } = require('lodash');
const { site } = require('./testData');
const assetModel = require('../../models/asset.model');
const { hasModeDetail } = require('../../utils/constants');
const { isValidTimestamp, areTimestampsEqual } = require("../../utils/helpers/functions");

const verifyDbRow = async (rowFactory, item, customTimestampCheck = false) => {
  const { rows } = await rowFactory();
  expect(rows.length).to.equal(1);

  const [row] = rows;

  for (const key in item) {
    if (item[key] instanceof Date) {
      expect(row[key] ? row[key].getTime() : null).to.equal(item[key].getTime(), `${key} expected: ${item[key]} actual: ${row[key]}`);
    } else if (item[key] instanceof Object) {
      expect(row[key]).to.deep.equal(item[key]);
    } else if (customTimestampCheck && isValidTimestamp(item[key]) && isValidTimestamp(row[key])) {
      expect(areTimestampsEqual(row[key], item[key])).to.be.true;
    } else if (item[key] !== undefined) {
      expect(row[key]).to.equal(item[key], `${key} expected: ${item[key]} actual: ${row[key]}`);
    }
  }

  return row;
};
const verifySnowSheddingReport = async (rowFactory, item) => {
  const { rows } = await rowFactory();
  expect(rows.length).to.equal(1);
  const [row] = rows;
  console.log(` rows : `, rows);
  console.log(`db: `, JSON.stringify(row['report_detail']));
  console.log(`input: `, JSON.stringify(item['report_detail']));

  expect(JSON.stringify(row['report_detail'])).to.equal(JSON.stringify(item['report_detail']));
  return row;
};

const verifyDbRows = async (data, uniqueProp, rowFactory) => {

  const rowSet = await rowFactory();
  expect(rowSet.rows.length).to.equal(data.length);

  for (const item of data) {

    const row = _find(rowSet.rows, r => r[uniqueProp] === item[uniqueProp]);
    if (!row < 0) {
      throw new Error('expected item not found in table');
    }

    for (const key in item) {
      if (item[key]) {
        expect(row[key]).to.equal(item[key], `${key} expected: ${JSON.stringify(item)} actual: ${JSON.stringify(row)}`);
      }
    }
  }
};

const verifyTime = (dbTime, expectedTime) => {
  const dbTimeInUtc = Math.floor(dbTime / 1000);
  const expectedTimeInUtc = Math.floor(expectedTime / 1000);
  expect(dbTimeInUtc).to.equal(expectedTimeInUtc);
}

const verifyTrackingModeHistory = async (expectedRow = {}, nc = null) => {
  nc = nc || site;

  const { rows } = await testPg.getTrackingModeHistory(nc.network_controller_id);
  expect(rows.length).to.equal(1);

  const [row] = rows;

  if (expectedRow.changed_at) {
    verifyTime(row.changed_at, expectedRow.changed_at);
  }

  if (expectedRow.commanded_state) {
    expect(row.commanded_state).to.equal(expectedRow.commanded_state);
  }

  if (expectedRow.commanded_state_detail !== undefined) {
    expect(row.commanded_state_detail).to.equal(expectedRow.commanded_state_detail);
  }

  return row;
}

const verifyTrackingModeAssetHisotry = async (expected, timestamp, nc = null) => {
  nc = nc || site;

  const { rows } = await testPg.getAllAssetHistoryBySnapAddr(nc.nc_snap_addr);
  if(!expected) {
    expect(rows.length).to.equal(0);
    return;
  }

  expect(rows.length).to.equal(1);
  const [row] = rows;

  const payload = {
    snap_addr: site.nc_snap_addr,
    timestamp: timestamp.toString(),
    data: {
      'tracking.mode': expected.trackingMode
    }
  }

  if (expected.userDetails) {
    payload.data["tracking.user_email"] = expected.userDetails.userEmail
    payload.data["tracking.user_name"] = expected.userDetails.userName
  }

  if (expected.source) {
    payload.data["tracking.source"] = expected.source
  }

  if(hasModeDetail(expected.trackingMode) || expected.detail != null) {
    payload.data['tracking.mode_detail'] = expected.detail
  }

  expect(row).to.deep.include(payload);

  return row;
}

const verifyAssetHisotryJson = async (expected, timestamp, nc = null) => {
  nc = nc || site;

  const { rows } = await testPg.getAllAssetHistoryBySnapAddr(nc.nc_snap_addr);

  expect(rows.length).to.equal(1);
  const [ row ] = rows;

  if(timestamp) {
    expect(parseInt(row.timestamp)).to.equal(timestamp);
  }

  expect(row.data).to.deep.include(expected);

  return row;
}

const verifyAsset = async (expectedRow = {}, assetToVerify = null) => {
  assetToVerify = assetToVerify || site;

  const asset = await assetModel.getAssetBySnapAddr(assetToVerify.snap_addr);
  expect(asset).to.not.be.null;

  if (expectedRow.parent_network_controller_id !== undefined) {
    expect(asset.parent_network_controller_id).to.equal(expectedRow.parent_network_controller_id);
  }

  if (expectedRow.device_type_id !== undefined) {
    expect(asset.device_type_id).to.equal(expectedRow.device_type_id);
  }

  if (expectedRow.asset_type !== undefined) {
    expect(asset.asset_type).to.equal(expectedRow.asset_type);
  }

  if (expectedRow.stm_rev !== undefined) {
    expect(asset.stm_rev).to.equal(expectedRow.stm_rev);
  }

  if (expectedRow.radio_rev !== undefined) {
    expect(asset.radio_rev).to.equal(expectedRow.radio_rev);
  }

  if (expectedRow.script_rev !== undefined) {
    expect(asset.script_rev).to.equal(expectedRow.script_rev);
  }

  if (expectedRow.battery_rev !== undefined) {
    expect(asset.battery_rev).to.equal(expectedRow.battery_rev);
  }

  if (expectedRow.battery_flash_rev !== undefined) {
    expect(asset.battery_flash_rev).to.equal(expectedRow.battery_flash_rev);
  }

  if (expectedRow.nc_mac !== undefined) {
    expect(asset.nc_mac).to.equal(expectedRow.nc_mac);
  }

  if (expectedRow.config_version !== undefined) {
    expect(asset.config_version).to.equal(expectedRow.config_version);
  }

  return asset;
}

const verifyAssetHistory = async (expectedRow = {}, assetToVerify = null) => {
  assetToVerify = assetToVerify || site;

  const { rows } = await testPg.getAssetHistory(assetToVerify.asset_id);
  expect(rows.length > 0).to.equal(true);

  if (expectedRow.firmware_rev_id !== undefined) {
    const firmwareRevRows = rows.filter(item => item.firmware_rev_id != null);
    expect(firmwareRevRows.length > 0).to.equal(true);
    const [row] = firmwareRevRows;
    expect(row.firmware_rev_id).to.equal(expectedRow.firmware_rev_id);
    expect(row.raw_firmware_rev).to.equal(expectedRow.raw_firmware_rev);

    if (expectedRow.stm_rev !== undefined) {
      expect(row.stm_rev).to.equal(expectedRow.stm_rev);
    }

    if (expectedRow.radio_rev !== undefined) {
      expect(row.radio_rev).to.equal(expectedRow.radio_rev);
    }

    if (expectedRow.script_rev !== undefined) {
      expect(row.script_rev).to.equal(expectedRow.script_rev);
    }

    if (expectedRow.battery_rev !== undefined) {
      expect(row.battery_rev).to.equal(expectedRow.battery_rev);
    }

    if (expectedRow.battery_flash_rev !== undefined) {
      expect(row.battery_flash_rev).to.equal(expectedRow.battery_flash_rev);
    }

    if (expectedRow.nc_mac !== undefined) {
      expect(row.nc_mac).to.equal(expectedRow.nc_mac);
    }
  }

  if (expectedRow.hardware_rev_id !== undefined) {
    const hardwareRevRows = rows.filter(item => item.hardware_rev_id != null);
    expect(hardwareRevRows.length > 0).to.equal(true);
    const [row] = hardwareRevRows;
    expect(row.hardware_rev_id).to.equal(expectedRow.hardware_rev_id);
    expect(row.raw_hardware_rev).to.equal(expectedRow.raw_hardware_rev);

    if (expectedRow.stm_rev !== undefined) {
      expect(row.stm_rev).to.equal(expectedRow.stm_rev);
    }

    if (expectedRow.radio_rev !== undefined) {
      expect(row.radio_rev).to.equal(expectedRow.radio_rev);
    }

    if (expectedRow.script_rev !== undefined) {
      expect(row.script_rev).to.equal(expectedRow.script_rev);
    }

    if (expectedRow.battery_rev !== undefined) {
      expect(row.battery_rev).to.equal(expectedRow.battery_rev);
    }

    if (expectedRow.battery_flash_rev !== undefined) {
      expect(row.battery_flash_rev).to.equal(expectedRow.battery_flash_rev);
    }

    if (expectedRow.nc_mac !== undefined) {
      expect(row.nc_mac).to.equal(expectedRow.nc_mac);
    }
  }

  return rows;
}

const verifyRowControllerConfigHistory = async (expectedRow = {}, assetToVerify = null) => {
  assetToVerify = assetToVerify || site;

  const { rows } = await testPg.getRowControllerConfigHistory(assetToVerify.asset_id);
  expect(rows.length).to.equal(1);

  const [row] = rows;

  if (expectedRow.model_device !== undefined) {
    expect(row.model_device).to.equal(expectedRow.model_device);
  }

  if (expectedRow.config_label !== undefined) {
    expect(row.config_label).to.equal(expectedRow.config_label);
  }

  if (expectedRow.config_timestamp !== undefined) {
    expect(row.config_timestamp).to.equal(expectedRow.config_timestamp.toString());
  }

  return rows;
}

const verifyAssetConfig = async (expectedRow = {}, assetToVerify = null) => {
  assetToVerify = assetToVerify || site;

  const { rows } = await testPg.getAssetConfig(assetToVerify.snap_addr);
  expect(rows.length).to.equal(1);

  const [row] = rows;

  if (expectedRow.model_device !== undefined) {
    expect(row.model_device).to.equal(expectedRow.model_device);
  }

  if (expectedRow.config_label !== undefined) {
    expect(row.config_label).to.equal(expectedRow.config_label);
  }

  if (expectedRow.config_timestamp !== undefined) {
    expect(row.config_timestamp).to.equal(expectedRow.config_timestamp.toString());
  }

  return rows;
}


const verifyNetworkController = async (expectedRow = {}, nc = null) => {
  nc = nc || site;

  const { rows } = await testPg.getNetworkControllerByAssetId(nc.asset_id);
  expect(rows.length).to.equal(1);

  const [row] = rows;

  if (expectedRow.last_updated) {
    expect(row.last_updated).to.equal(expectedRow.last_updated);
  } else if (expectedRow.last_updated === null) {
    const nowInSeconds = Math.ceil((Date.now() / 1000) + 1);
    const lastUpdated = row.last_updated ? Math.floor(row.last_updated.getTime() / 1000) : row.last_updated;
    expect(lastUpdated).to.be.within(nowInSeconds - 10, nowInSeconds); // within the last 10 seconds
  }

  if (expectedRow.connected) {
    expect(row.connected).to.equal(expectedRow.connected);
  }

  if (expectedRow.commanded_state) {
    expect(row.commanded_state).to.equal(expectedRow.commanded_state);
  }

  if (expectedRow.commanded_state_detail) {
    expect(row.commanded_state_detail).to.equal(expectedRow.commanded_state_detail);
  }

  if (expectedRow.commanded_state_changed_at) {
    verifyTime(row.commanded_state_changed_at, expectedRow.commanded_state_changed_at);
  }

  if (expectedRow.last_estop_engage_at !== undefined) {
    verifyTime(row.last_estop_engage_at, expectedRow.last_estop_engage_at);
  }

  if (expectedRow.last_estop_disengage_at !== undefined) {
    verifyTime(row.last_estop_disengage_at, expectedRow.last_estop_disengage_at);
  }

  return row;
};

module.exports = {
  verifyDbRow,
  verifyDbRows,
  verifyAsset,
  verifyAssetHistory,
  verifyAssetHisotryJson,
  verifyAssetConfig,
  verifyRowControllerConfigHistory,
  verifyNetworkController,
  verifyTrackingModeHistory,
  verifyTrackingModeAssetHisotry,
  verifySnowSheddingReport
}

