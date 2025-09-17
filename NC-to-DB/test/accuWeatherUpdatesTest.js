const testBase = require("./common/testBase");
const testPg = require('./common/testPg');
const { site } = require('./common/testData');
const { mockSns, mockMqtt } = require('./common/mock');
const { channels } = require('../utils/helpers/NotificationHelper');
const { verifyNetworkController } = require('./common/dbVerify');
const { LAST_ACTIVITY_UPDATE_INTERVAL } =  require('../utils/constants');


const chai = require('chai');

// const sinon = require('sinon');
// const nock = require('nock');
// nock.recorder.rec();

const { expect } = chai;

describe("AccuweatherUpdates", function () {

  const date = new Date();

  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0
  }

  // Sample Message in Json
  // {
  //   "ncSnapAddr": "19b0cf",
  //   "cloudAccuWeatherUpdate": {
  //     "snapAddr": "19b0cf",
  //     "when": "2022-01-25T23:34:58.501Z",
  //     "needAccuWeatherUpdate": true,
  //     "accuStow": false,
  //     "stowType": "deep_snow",
  //     "stowStartTime": "2022-01-25T23:34:58z",
  //     "stowEndTime": "2022-01-23T23:49:02z",
  //     "errorCodes": 0
  //   }
  // }

  const cloudAccuWeatherUpdate = {
    snapAddr: site.nc_snap_addr_b64,
    when,
    needAccuWeatherUpdate: true,
    accuStow: false,
    stowType: 'avg_wind',
    stowStartTime: "2019-09-13 23:33:46.053000",
    stowEndTime: "2019-09-13 23:33:46.053000",
    errorCodes: 0
  };
    
  beforeEach(async () => {
    await testBase.init();
    await testPg.resetNCLastActivityTimeBySec(site.network_controller_id, LAST_ACTIVITY_UPDATE_INTERVAL + 1);
  })

  it("get stow status when accuweather enabled", async () => {
    await testPg.setAccuWeatherProjectFlag(site.site_id, true);
    const payload = {
      nc_snap_addr: site.nc_snap_addr,
      snap_addr: site.nc_snap_addr,
      site_id: site.site_id,
      timestamp: new Date(when.seconds * 1000),
      network_controller_id: site.network_controller_id,
      asset_id: site.asset_id,
      need_accu_weather_update: cloudAccuWeatherUpdate.needAccuWeatherUpdate,
      accu_stow: cloudAccuWeatherUpdate.accuStow,
      stow_type: cloudAccuWeatherUpdate.stowType,
      stow_start_time: cloudAccuWeatherUpdate.stowStartTime,
      stow_end_time: cloudAccuWeatherUpdate.stowEndTime,
      error_code: cloudAccuWeatherUpdate.errorCodes,
      type: 'elastic_search-1',
      channel: channels.LOCAL_WEATHER_STOW_UPDATE
    }

    const scopeSns = mockSns(payload);
    const scopeMqtt = mockMqtt(null);
    const result = await testBase.invokeLambda({
      cloudAccuWeatherUpdate
    });
    expect(result).to.equal(true);
    scopeSns.done();
    expect(scopeMqtt.isDone()).to.equal(false);
    await verifyNetworkController({ last_updated: null });
  })

  it("get stow status when accuweather disabled", async () => {
    await testPg.setAccuWeatherProjectFlag(site.site_id, false);
    const scopeSns = mockSns(null);
    const scopeMqtt = mockMqtt({
      "cmd":"cloud_accu_weather_alert",
      "args":{
        accu_stow: false,
        stow_type: "avg_wind",
        // stow_start_time: "2022-02-01T04:14:39Z",
        // stow_end_time: "2022-02-01T04:14:39Z"
      }});
    const result = await testBase.invokeLambda({
      cloudAccuWeatherUpdate
    });
    expect(result).to.equal(true);
    scopeMqtt.done();
    expect(scopeSns.isDone()).to.equal(false);
    await verifyNetworkController({ last_updated: null });
  });

  it("stow status ack when accuweather enabled", async () => {
    await testPg.setAccuWeatherProjectFlag(site.site_id, true);
    const payload = {
      nc_snap_addr: site.nc_snap_addr,
      snap_addr: site.nc_snap_addr,
      site_id: site.site_id,
      timestamp: new Date(cloudAccuWeatherUpdate.when.seconds * 1000),
      network_controller_id: site.network_controller_id,
      asset_id: site.asset_id,
      need_accu_weather_update: false,
      accu_stow: cloudAccuWeatherUpdate.accuStow,
      stow_type: cloudAccuWeatherUpdate.stowType,
      stow_start_time: cloudAccuWeatherUpdate.stowStartTime,
      stow_end_time: cloudAccuWeatherUpdate.stowEndTime,
      error_code: cloudAccuWeatherUpdate.errorCodes,
      type: 'elastic_search-1',
      channel: channels.LOCAL_WEATHER_STOW_UPDATE
    }
    const scopeSns = mockSns(payload);
    const scopeMqtt = mockMqtt(null);
    const update = { ...cloudAccuWeatherUpdate, needAccuWeatherUpdate: false }
    const result = await testBase.invokeLambda({
      cloudAccuWeatherUpdate : update
    });
    expect(result).to.equal(true);
    scopeSns.done();
    expect(scopeMqtt.isDone()).to.equal(false);
    await verifyNetworkController({ last_updated: null });
  })

  it("stow status ack when accuweather disabled", async () => {
    await testPg.setAccuWeatherProjectFlag(site.site_id, false);
    const scopeSns = mockSns(null);
    const scopeMqtt = mockMqtt(null);
    const update = { ...cloudAccuWeatherUpdate, needAccuWeatherUpdate: false }
    const result = await testBase.invokeLambda({
      cloudAccuWeatherUpdate : update
    });
    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(false);
    expect(scopeMqtt.isDone()).to.equal(false);
    await verifyNetworkController({ last_updated: null });
  })

})