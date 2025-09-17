const testBase = require("./common/testBase");
const { site } = require("./common/testData");
const { mockSns } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const testPg = require('./common/testPg');
const { verifyDbRow, verifyAssetHisotryJson } = require('./common/dbVerify');
const { snowSheddingState } = require('../utils/constants');

const flatten = require('flat');

describe("snowSheddingUpdate", () => {
  const [weatherStation] = site.weatherStations;

  beforeEach(async () => {
    await testBase.init();
    await testPg.removeAssetHistoryBySnapAddr(site.nc_snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const update = {
    when,
    snapAddr: weatherStation.snap_addr_b64,
    timestamp: when,
    depth: 0.6000000238418579,
    baseline: 0.5,
    snowOnGroundNow: 0.5,
    estimate: 0.10000000149011612,
    trigger: 0.5,
    threshold: 0.10000000149011612,
    active: true
  }

  const snowSheddingTestCases = [{
    name: "snowSheddingUpdate State: Started",
    snowSheddingUpdate: {
      ...update,
      state: snowSheddingState.SNOW_SHEDDING_STARTED
    }
  }, {
    name: "snowSheddingUpdate State: Delayed",
    snowSheddingUpdate: {
      ...update,
      state: snowSheddingState.SNOW_SHEDDING_DELAYED
    }
  }];

  for (const testcase of snowSheddingTestCases) {
    const { name, snowSheddingUpdate } = testcase;
    it(name, async () => {
      const { nc_snap_addr } = site;

      const payload = {
        "type": "elastic_search-1",
        "channel": "snow_shedding",
        "network_controller_id": site.network_controller_id,
        "snap_addr": weatherStation.snap_addr,
        "asset_id": weatherStation.asset_id,
        "nc_snap_addr": site.nc_snap_addr,
        "site_id": site.site_id,
        "timestamp": new Date((when.seconds) * 1000),
        "nc_asset_id": site.asset_id,
        "snow_shedding.depth": snowSheddingUpdate.depth / 0.0254,
        "snow_shedding.baseline": snowSheddingUpdate.baseline / 0.0254,
        "snow_shedding.snow_on_ground_now": snowSheddingUpdate.snowOnGroundNow / 0.0254,
        "snow_shedding.estimate": snowSheddingUpdate.estimate / 0.0254,
        "snow_shedding.trigger": snowSheddingUpdate.trigger / 0.0254,
        "snow_shedding.threshold": snowSheddingUpdate.threshold / 0.0254,
        "snow_shedding.active": snowSheddingUpdate.active,
        "snow_shedding.last_snow_shedding": snowSheddingUpdate.timestamp.seconds,
        "snow_shedding.state": snowSheddingUpdate.state
      }

      const scopeSns = mockSns(payload);

      const result = await testBase.invokeLambda({ snowSheddingUpdate });
      expect(scopeSns.isDone()).to.equal(true);
      expect(result).to.equal(true);

      const data = {
        timestamp: snowSheddingUpdate.when.seconds,
        depth: snowSheddingUpdate.depth / 0.0254,
        baseline: snowSheddingUpdate.baseline / 0.0254,
        snow_on_ground_now: snowSheddingUpdate.snowOnGroundNow / 0.0254,
        estimate: snowSheddingUpdate.estimate / 0.0254,
        trigger: snowSheddingUpdate.trigger / 0.0254,
        threshold: snowSheddingUpdate.threshold / 0.0254,
        active: snowSheddingUpdate.active,
        asset_snap_addr: weatherStation.snap_addr,
        last_snow_shedding: snowSheddingUpdate.timestamp.seconds,
        state: snowSheddingUpdate.state
      }

      await verifyDbRow(() => testPg.getSnowShedding(nc_snap_addr), data);

      const hist = { ...data };
      delete hist['timestamp'];

      await verifyAssetHisotryJson(flatten({ snow_shedding: hist }), when.seconds);
    });
  }
});
