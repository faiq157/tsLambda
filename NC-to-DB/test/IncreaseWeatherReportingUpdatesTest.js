const testBase = require("./common/testBase");
const { site } = require("./common/testData");
const { mockSns } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const { channels } = require('../utils/helpers/NotificationHelper');

describe("IncreaseWeatherReporting Start", () => {

  const [weatherStation] = site.weatherStations;

  beforeEach(async () => {
    await testBase.init();

  });
  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const testCases = [{
    name: "increase weather reporting start for wind gust",
    when,
    snapAddr: weatherStation.snap_addr_b64,
    reportingType: 1,
    reportingFlag: 1,
    reportingValue: 0,
    reportingThreshold: 1.5,
    closePercentage: 30
  }, {
    name: "increase weather reporting start for average wind",
    when,
    snapAddr: weatherStation.snap_addr_b64,
    reportingType: 2,
    reportingFlag: 1,
    reportingValue: 0,
    reportingThreshold: 1.5,
    closePercentage: 30
  }, {
    name: "increase weather reporting start for snow",
    when,
    snapAddr: weatherStation.snap_addr_b64,
    reportingType: 3,
    reportingFlag: 1,
    reportingValue: 0,
    reportingThreshold: 1.5,
    closePercentage: 10
  }];

  for (const testcase of testCases) {

    const update = testcase;

    it(testcase.name, async () => {


      const payload = {
        type: 'elastic_search-1',
        channel: channels.INCREASE_WEATHER_REPORTING_UPDATE,
        network_controller_id: site.network_controller_id,
        snapAddr: weatherStation.snap_addr,
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        reportingType: update.reportingType,
        reportingFlag: update.reportingFlag,
        reportingValue: update.reportingType === 3 ? update.reportingValue / 0.0254 : update.reportingValue,
        reportingThreshold: update.reportingType === 3 ? update.reportingThreshold / 0.0254 : update.reportingThreshold,
        closePercentage: update.closePercentage,
        timestamp: new Date(when.seconds * 1000)
      }

      const scopeSns = mockSns(payload);

      const result = await testBase.invokeLambda({ increaseWeatherReporting: update });

      expect(result).to.equal(true);
      scopeSns.done();


    });
  }
});


describe("IncreaseWeatherReporting Stop", () => {

  const [weatherStation] = site.weatherStations;

  beforeEach(async () => {
    await testBase.init();

  });
  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const testCases = [{
    name: "increase weather reporting stop for wind gust",
    when,
    snapAddr: weatherStation.snap_addr_b64,
    reportingType: 1,
    reportingFlag: 0,
    reportingValue: 0,
    reportingThreshold: 1.5,
    closePercentage: 30
  }, {
    name: "increase weather reporting stop for average wind",
    when,
    snapAddr: weatherStation.snap_addr_b64,
    reportingType: 2,
    reportingFlag: 0,
    reportingValue: 0,
    reportingThreshold: 1.5,
    closePercentage: 30
  }, {
    name: "increase weather reporting stop for snow depth",
    when,
    snapAddr: weatherStation.snap_addr_b64,
    reportingType: 3,
    reportingFlag: 0,
    reportingValue: 0,
    reportingThreshold: 1.5,
    closePercentage: 30
  }];

  for (const testcase of testCases) {

    const update = testcase;

    it(testcase.name, async () => {


      const payload = {
        type: 'elastic_search-1',
        channel: channels.INCREASE_WEATHER_REPORTING_UPDATE,
        network_controller_id: site.network_controller_id,
        snapAddr: weatherStation.snap_addr,
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        reportingType: update.reportingType,
        reportingFlag: update.reportingFlag,
        reportingValue: update.reportingType === 3 ? update.reportingValue / 0.0254 : update.reportingValue,
        reportingThreshold: update.reportingType === 3 ? update.reportingThreshold / 0.0254 : update.reportingThreshold,
        closePercentage: update.closePercentage,
        timestamp: new Date(when.seconds * 1000)
      }

      const scopeSns = mockSns(payload);

      const result = await testBase.invokeLambda({ increaseWeatherReporting: update });

      expect(result).to.equal(true);
      scopeSns.done();


    });
  }
});
