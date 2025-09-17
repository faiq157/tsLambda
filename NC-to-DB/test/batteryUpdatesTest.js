process.env.NODE_ENV = "test";

const chai = require("chai");
const { expect } = chai;
const {deviceTypeIds} = require("../utils/constants")
const { channels } = require('../utils/helpers/NotificationHelper');
const {getBatteryBySnapAddr} = require("../models/battery.model");
const moment = require("moment");
const {getSnapAddrB64, site} = require("./common/testData");
const testBase = require("./common/testBase");
const testPg = require("./common/testPg");
const { mockSns } = require('./common/mock');

describe("batteryUpdates", () => {
  const rowBox = site.rowBoxes[0];
  beforeEach(async () => {
    await testBase.init();
    await testPg.updateAsset(rowBox.asset_id, {device_type_id: deviceTypeIds.DEVICE_TYPE_ID_RB})
    await testPg.deleteAssetHistoryBySnapAddr(rowBox.snap_addr);
    await testPg.deleteAssetLastUpdateBySnapAddr(rowBox.snap_addr);
  });

  const batteryUpdate = {
    "voltage": 13.300000190734863,
    "current": 0,
    "charged": 80,
    "health": 100,
    "battTemp": 50.099998474121094,
    "heaterTemp": 51.400001525878906,
    "miscStatusBits": 0,
    "tcSnapAddr": getSnapAddrB64(rowBox.snap_addr)      // This snap address is from project with timezone "Asia/Karachi" i.e. GMT+5
  };

  const expectedSNSData = {
    device_type: deviceTypeIds.DEVICE_TYPE_ID_RB.toLowerCase(),
    voltage: batteryUpdate.voltage,
    current: batteryUpdate.current,
    poc: batteryUpdate.charged,
    poh: batteryUpdate.health,
    battery_temperature: batteryUpdate.battTemp,
    heater_temperature: batteryUpdate.heaterTemp,
    misc_status_bits: batteryUpdate.miscStatusBits,
    channel: channels.BATTERY_UPDATE,
    type: 'elastic_search-1',
    network_controller_id: site.network_controller_id,
    snap_addr: site.rowBoxes[0].snap_addr,
    asset_id: site.rowBoxes[0].asset_id,
    nc_snap_addr: site.nc_snap_addr,
    site_id: site.site_id
  };

  /*
   * When wekeup poc doesn't exist in battery, then it should add wakeup_poc and wakeup_poc_at values
   */
  it ("When wakeup_poc doesn't exist against an asset in battery", async () => {
    await testPg.updateProjectById(site.project_id, {timezone: 'Asia/Karachi'});
    await testPg.delBatteryHistory(rowBox.snap_addr);
    await testPg.updateBatteryBySnapAddr(rowBox.snap_addr, {wakeup_poc: null, wakeup_poc_at: null});

    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: 0,
    };
    const event = {when, ...batteryUpdate};
    const expected = {timestamp: moment(when.seconds * 1000).utc(), ...expectedSNSData};
    const scopeSns = mockSns(expected);
    const result = await testBase.invokeLambda({ batteryUpdates: [event] });
    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(true);

    const battery = await getBatteryBySnapAddr(rowBox.snap_addr);
    expect(battery.wakeup_poc).to.equal(event.charged);
    expect(new Date(battery.wakeup_poc_at).getTime())
      .to.equal(new Date(expected.timestamp).getTime());

    const {rows} = await testPg.getBatteryHistBySnapAddr(rowBox.snap_addr);
    const batteryHist = rows[0];
    expect(batteryHist.data["battery.wakeup_poc"]).to.equal(event.charged);
    expect(new Date(batteryHist.data["battery.wakeup_poc_at"]).getTime())
    .to.equal(new Date(expected.timestamp).getTime());

    const {rows: assetLastUpdate} = await testPg.getAssetLastUpdate(rowBox.snap_addr);
    expect(assetLastUpdate.length).to.equal(1);
  });

  /*
   * When wakeup_poc already exist for the previous day, and new value
   * is from new date then it should update the wakeup_poc & wakeup_poc_at
   */
  it ("When wakeup_poc already exist for the previous day", async () => {
    await testPg.updateProjectById(site.project_id, {timezone: 'Asia/Karachi'});
    await testPg.delBatteryHistory(rowBox.snap_addr);
    const previousDate = moment().subtract(1, "days").utc().format();
    await testPg.updateBatteryBySnapAddr(rowBox.snap_addr, {wakeup_poc: 20, wakeup_poc_at: previousDate});

    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: 0,
    };
    const event = {when, ...batteryUpdate};
    const expected = {timestamp: moment(when.seconds * 1000).utc(), ...expectedSNSData};
    const scopeSns = mockSns(expected);
    const result = await testBase.invokeLambda({ batteryUpdates: [event] });
    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(true);

    const battery = await getBatteryBySnapAddr(rowBox.snap_addr);
    expect(battery.wakeup_poc).to.equal(event.charged);
    expect(new Date(battery.wakeup_poc_at).getTime())
      .to.equal(new Date(expected.timestamp).getTime());

    const {rows} = await testPg.getBatteryHistBySnapAddr(rowBox.snap_addr);
    const batteryHist = rows[0];
    expect(batteryHist.data['battery.wakeup_poc']).to.equal(event.charged);
    expect(new Date(batteryHist.data['battery.wakeup_poc_at']).getTime())
    .to.equal(new Date(expected.timestamp).getTime());
    const {rows: assetLastUpdate} = await testPg.getAssetLastUpdate(rowBox.snap_addr);
    expect(assetLastUpdate.length).to.equal(1);
  });

  it ("When wakeup_poc already exist for the previous month", async () => {
    await testPg.updateProjectById(site.project_id, {timezone: 'Asia/Karachi'});
    await testPg.delBatteryHistory(rowBox.snap_addr);
    const previousDate = moment().subtract(1, "month").utc().format();
    await testPg.updateBatteryBySnapAddr(rowBox.snap_addr, {wakeup_poc: 20, wakeup_poc_at: previousDate});

    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: 0,
    };
    const event = {when, ...batteryUpdate};
    const expected = {timestamp: moment(when.seconds * 1000).utc(), ...expectedSNSData};
    const scopeSns = mockSns(expected);
    const result = await testBase.invokeLambda({ batteryUpdates: [event] });
    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(true);

    const battery = await getBatteryBySnapAddr(rowBox.snap_addr);
    expect(battery.wakeup_poc).to.equal(event.charged);
    expect(new Date(battery.wakeup_poc_at).getTime())
    .to.equal(new Date(expected.timestamp).getTime());

    const {rows} = await testPg.getBatteryHistBySnapAddr(rowBox.snap_addr);
    const batteryHist = rows[0];
    expect(batteryHist.data['battery.wakeup_poc']).to.equal(event.charged);
    expect(new Date(batteryHist.data['battery.wakeup_poc_at']).getTime())
    .to.equal(new Date(expected.timestamp).getTime());
  });

  it ("When wakeup_poc already exist for the previous year", async () => {
    await testPg.updateProjectById(site.project_id, {timezone: 'Asia/Karachi'});
    await testPg.delBatteryHistory(rowBox.snap_addr);
    const previousDate = moment().subtract(1, "year").utc().format();
    await testPg.updateBatteryBySnapAddr(rowBox.snap_addr, {wakeup_poc: 20, wakeup_poc_at: previousDate});

    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: 0,
    };
    const event = {when, ...batteryUpdate};
    const expected = {timestamp: moment(when.seconds * 1000).utc(), ...expectedSNSData};
    const scopeSns = mockSns(expected);
    const result = await testBase.invokeLambda({ batteryUpdates: [event] });
    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(true);

    const battery = await getBatteryBySnapAddr(rowBox.snap_addr);
    expect(battery.wakeup_poc).to.equal(event.charged);
    expect(new Date(battery.wakeup_poc_at).getTime())
    .to.equal(new Date(expected.timestamp).getTime());

    const {rows} = await testPg.getBatteryHistBySnapAddr(rowBox.snap_addr);
    const batteryHist = rows[0];
    expect(batteryHist.data['battery.wakeup_poc']).to.equal(event.charged);
    expect(new Date(batteryHist.data['battery.wakeup_poc_at']).getTime())
    .to.equal(new Date(expected.timestamp).getTime());
    expect(batteryHist.data).to.includes({
      "battery.current": batteryUpdate.current,
      "battery.heater_temp": batteryUpdate.heaterTemp,
      "battery.poc": batteryUpdate.charged,
      "battery.poh": batteryUpdate.health,
      "battery.temp": batteryUpdate.battTemp,
      "battery.voltage": batteryUpdate.voltage
    });
  });

  /*
   * When wakeup_poc already exist, and new value is from same date then the
   * wakeup_poc should not be updated
   */
  it ("When wakeup_poc already exist, and new value is from same date", async () => {
    await testPg.updateProjectById(site.project_id, {timezone: 'Asia/Karachi'});
    await testPg.delBatteryHistory(rowBox.snap_addr);
    const previousDate = moment().utc().format();
    const oldPoc = 20;
    await testPg.updateBatteryBySnapAddr(rowBox.snap_addr, {wakeup_poc: oldPoc, wakeup_poc_at: previousDate});

    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: 0,
    };
    const event = {when, ...batteryUpdate};
    const expected = {timestamp: moment(when.seconds * 1000).utc(), ...expectedSNSData};
    const scopeSns = mockSns(expected);
    const result = await testBase.invokeLambda({ batteryUpdates: [event] });
    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(true);

    const battery = await getBatteryBySnapAddr(rowBox.snap_addr);
    expect(battery.wakeup_poc).to.equal(oldPoc);
    expect(battery.wakeup_poc).to.not.equal(event.charged)
    expect(new Date(battery.wakeup_poc_at).getTime())
      .to.equal(new Date(previousDate).getTime());

    const {rows} = await testPg.getBatteryHistBySnapAddr(rowBox.snap_addr);
    const batteryHist = rows[0];
    expect(batteryHist.data['battery.wakeup_poc']).to.equal(oldPoc);
    expect(new Date(batteryHist.data['battery.wakeup_poc_at']).getTime())
    .to.equal(new Date(previousDate).getTime());
    expect(batteryHist.data).to.includes({
      "battery.current": batteryUpdate.current,
      "battery.heater_temp": batteryUpdate.heaterTemp,
      "battery.poc": batteryUpdate.charged,
      "battery.poh": batteryUpdate.health,
      "battery.temp": batteryUpdate.battTemp,
      "battery.voltage": batteryUpdate.voltage
    });
  });

  /*
   * When project's timezone doesn't exist, it should set wakeup_poc and wakeup_poc_at to null
   */
  it ("When project's timezone doesn't exist", async () => {
    await testPg.updateProjectById(site.project_id, {timezone: 'Asia/Karachi'});
    await testPg.delBatteryHistory(rowBox.snap_addr);
    const previousDate = moment().utc().format();
    const oldPoc = 20;
    await testPg.updateBatteryBySnapAddr(rowBox.snap_addr, {wakeup_poc: oldPoc, wakeup_poc_at: previousDate});
    await testPg.updateProjectById(site.project_id, {timezone: null});
    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: 0,
    };
    const event = {when, ...batteryUpdate};
    const expected = {timestamp: moment(when.seconds * 1000).utc(), ...expectedSNSData};
    const scopeSns = mockSns(expected);
    const result = await testBase.invokeLambda({ batteryUpdates: [event] });
    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(true);

    const battery = await getBatteryBySnapAddr(rowBox.snap_addr);
    expect(battery.wakeup_poc).to.equal(null);
    expect(battery.wakeup_poc_at).to.equal(null);

    const {rows} = await testPg.getBatteryHistBySnapAddr(rowBox.snap_addr);
    const batteryHist = rows[0];
    expect(batteryHist.data['battery.wakeup_poc']).to.equal(null);
    expect(batteryHist.data['battery.wakeup_poc_at']).to.equal(null);
    expect(batteryHist.data).to.includes({
      "battery.current": batteryUpdate.current,
      "battery.heater_temp": batteryUpdate.heaterTemp,
      "battery.poc": batteryUpdate.charged,
      "battery.poh": batteryUpdate.health,
      "battery.temp": batteryUpdate.battTemp,
      "battery.voltage": batteryUpdate.voltage
    });
  });
});
