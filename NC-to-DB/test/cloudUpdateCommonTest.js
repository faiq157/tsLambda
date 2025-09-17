const testBase = require("./common/testBase");
const assetModel = require('../models/asset.model');
const ncModel = require('../models/network.controller.model');
const pg = require('../utils/lib/pg');
const testPg = require('./common/testPg');
const { newSite: site, invalidSite, aws } = require('./common/testData');
const { mockSns, mockMqtt, mockSqsGetQueueUrl, mockSqsDeleteMessageBatch } = require('./common/mock');
const { channels } = require('../utils/helpers/NotificationHelper');
const { verifyDbRow, verifyNetworkController, verifyAsset, verifyAssetConfig } = require('./common/dbVerify');
const { trackingModes, assetTypes } =  require('../utils/constants');

const chai = require('chai');

const { expect } = chai;

describe("Adding Network Controller", function () {

  const date = new Date();

  const when = {
    seconds: Math.round(date.getTime() / 1000),
    nanos: 0
  }
  
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
    await testBase.removeNetworkController(site.nc_snap_addr, site.asset_id);
    mockSns(null);
    mockMqtt(null, site.aws_iot_principal_id);
  })

  it("success case", async () => {
    const result = await testBase.invokeLambda({
      cloudAccuWeatherUpdate,
    }, site);
    expect(result).to.equal(true);
    await verifyNetworkController({}, site);
    await verifyAsset({ parent_network_controller_id: null }, site);
    await verifyAssetConfig({ }, site)
  });

  it("success case with sqs", async () => {
    
    const nocks = [
      mockSqsGetQueueUrl(aws.lambdaTriggerQueueName),
      mockSqsDeleteMessageBatch(aws.lambdaTriggerQueueName)
    ]

    const results = await testBase.invokeLambda({
      cloudAccuWeatherUpdate,
    }, site, true);

    for(const nock of nocks) {
      expect(nock.isDone()).to.equal(true);
    }
    expect(results.length).to.equal(1);
    expect(results[0]).to.equal(true);
    await verifyNetworkController({}, site);
    await verifyAsset({ parent_network_controller_id: null }, site);
    await verifyAssetConfig({ }, site);
  });

  it("asset already added case", async () => {
    await assetModel.addAsset(site.nc_snap_addr, null, assetTypes.ASSET_TYPE_NC);

    const result = await testBase.invokeLambda({
      cloudAccuWeatherUpdate,
    }, site);
    expect(result).to.equal(true);
    await verifyNetworkController({}, site);
    await verifyAsset({ parent_network_controller_id: null }, site);
  })
});

describe("Network Controller Certificate Changed", function () {

  beforeEach(async () => {
    await testBase.init();
  })

  const testcases = [{
    name: `valid snap addr '${site.nc_snap_addr}'`,
    nc_snap_addr: site.nc_snap_addr,
    nc_snap_addr_b64: site.nc_snap_addr_b64,
  }, {
    name: `invalid snap addr '${invalidSite.nc_snap_addr}'`,
    invalid: true,
    nc_snap_addr: invalidSite.nc_snap_addr,
    nc_snap_addr_b64: invalidSite.nc_snap_addr_b64,
  }];

  for(const testcase of testcases) {
    const { nc_snap_addr, nc_snap_addr_b64 } = testcase;

    it(testcase.name, async () => {
      const newIotPrincipalId = '2222222222222222222222222222222222222222222222222222222222222222';
      await testBase.removeNetworkController(site.nc_snap_addr, site.asset_id);
      await ncModel.getOrCreateNetworkController(site.nc_snap_addr, site.aws_iot_principal_id, site.nc_snap_addr, site.network_controller_id);
      await testPg.updateNetworkController(site.network_controller_id, { 
        aws_iot_principal_id: newIotPrincipalId,
        presence_version: 123
      })
  
      const date = new Date();
  
      const when = {
        seconds: Math.floor(date.getTime() / 1000),
        nanos: 0
      }
    
      const trackingChange = {
        updatedState: trackingModes.TRACKING,
        stateChangedAt: when,
        commandedPreset: 0
      };
    
      const trackingChanges = [ trackingChange ];
      
      const trackingModeSNSPaylaod = {
        nc_snap_addr: site.nc_snap_addr,
        snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        asset_id: site.asset_id,
        timestamp: new Date(when.seconds * 1000),
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: trackingChange.commandedPreset,
        network_controller_id: site.network_controller_id,
        type: 'elastic_search-1',
        channel: channels.TRACKING_MODE_CHANGE
      }
    
  
      const scopeSns = mockSns(trackingModeSNSPaylaod);
      const scopeMqtt = mockMqtt(null);
  
      const result = await testBase.invokeLambda({
        trackingChanges
      }, { ...site, nc_snap_addr, nc_snap_addr_b64 }).catch(err => err);

      if(testcase.invalid) {
        expect(result instanceof Error).to.equal(true);
        expect(scopeSns.isDone()).to.equal(false);
        await verifyDbRow(() => pg.getNetworkControllerById(site.network_controller_id), {
          aws_iot_principal_id: site.newIotPrincipalId
        })
  
      } else {
        scopeSns.done();
        expect(result).to.equal(true);
        await verifyDbRow(() => pg.getNetworkControllerById(site.network_controller_id), {
          aws_iot_principal_id: site.aws_iot_principal_id, 
          presence_version: 0
        })
      }
      
      expect(scopeMqtt.isDone()).to.equal(false);
  
    });  
  }

});

describe("Ignorig Lambda Processing", function () {
  const date = new Date();

  const when = {
    seconds: Math.round(date.getTime() / 1000),
    nanos: 0
  }
  
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
  });

  it("duplicate invocation", async () => {
    const scopeSns = mockSns(null);
    const scopeSns2 = mockSns(null);
    const scopeMqtt = mockMqtt(null, site.aws_iot_principal_id);
    const scopeMqtt2 = mockMqtt(null, site.aws_iot_principal_id);
    
    const result = await testBase.invokeLambda({
      cloudAccuWeatherUpdate,
    }, site);

    expect(result).to.equal(true);
    
    const result2 = await testBase.invokeLambda({
      cloudAccuWeatherUpdate,
    }, site);

    expect(result2).to.equal(true);

    expect(scopeSns.isDone()).to.equal(false);
    expect(scopeSns2.isDone()).to.equal(false);
    expect(scopeMqtt.isDone()).to.equal(true);
    expect(scopeMqtt2.isDone()).to.equal(false);
  });

  it.skip("invalid snap address ffffff", async () => {
    const scopeSns = mockSns(null);
    const scopeMqtt = mockMqtt(null, invalidSite.aws_iot_principal_id);
    
    const result = await testBase.invokeLambda({
      cloudAccuWeatherUpdate,
    }, invalidSite);

    expect(result).to.equal(true);
    
    expect(scopeSns.isDone()).to.equal(false);
    expect(scopeMqtt.isDone()).to.equal(false);
  })

});