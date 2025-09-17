const chai = require("chai");
const { expect } = chai;
const { verifyDbRow } = require("./common/dbVerify");
const testBase = require("../test/common/testBase");
const { site } = require("./common/testData");
const testPg = require("./common/testPg");
const { getCurrentTime, convertWhenToTimestamp } = require("../utils/helpers/functions");
const { weatherDataType } = require("../utils/constants");
const moment = require("moment");

describe("Weather Update Service", () => {
  const [weatherStation] = site.weatherStations;
  const timestamp1 = getCurrentTime(0, "seconds", true);   // MM-DD-YY HH:mm:ss
  const timestamp2 = getCurrentTime(24, "seconds");       // ISO 8601 
  const when = {
    seconds: Math.floor(Date.now() / 1000),
    nanos: 0,
  };
  const toDate = () => moment.utc().format();
  const weatherUpdatesList = [
    {
      // protobuf fields
      snapAddr: weatherStation.snap_addr_b64,
      windSpeed: 4.900000095367432,
      windDirection: 198.5,
      averageWindSpeed: 3.700000047683716,
      peakWindSpeed: 10.199999809265137,
      temperature: 65,
      snowDepth: 0.012000000104308128,
      increaseAvgWindReporting: 0,
      increaseWindGustReporting: 0,
      timestamp: timestamp1,  // MM-DD-YY HH:mm:ss
      dataType: weatherDataType.FAKE,
      when,
      // additional fields for testing
      toDate,
      snapAddr_hex: weatherStation.snap_addr,
    },
    {
      // protobuf fields
      snapAddr: weatherStation.snap_addr_b64,
      windSpeed: 2.4000000953674316,
      windDirection: 237.3000030517578,
      averageWindSpeed: 3.200000047683716,
      peakWindSpeed: 22,
      temperature: 0,
      snowDepth: 0,
      increaseAvgWindReporting: 0,
      increaseWindGustReporting: 0,
      timestamp: timestamp2.toISOString(),  // ISO 8601
      dataType: weatherDataType.FAKE,
      when,
      // additional fields for testing
      toDate,
      snapAddr_hex: weatherStation.snap_addr,
    },
  ];

  before(async () => {
    await testBase.init();
  });

  it("should test basic functionality of weatherUpdates", async () => {
    for (let pbUpdate of weatherUpdatesList) {
      const result = await testBase.invokeLambda({
        weatherUpdates: [pbUpdate],
      });
      expect(result).to.equal(true);
      await verifyDbRow(
        () => testPg.getWeatherBySnapAddr(pbUpdate.snapAddr_hex),
        {
          snap_addr: pbUpdate.snapAddr_hex,
          wind_speed: pbUpdate.windSpeed,
          wind_direction: pbUpdate.windDirection,
          average_wind_speed: pbUpdate.averageWindSpeed,
          peak_wind_speed: pbUpdate.peakWindSpeed,
          temperature: pbUpdate.temperature,
          snow_depth: pbUpdate.snowDepth / 0.0254,
          increase_avg_wind_reporting: pbUpdate.increaseAvgWindReporting,
          increase_wind_gust_reporting: pbUpdate.increaseWindGustReporting,
          last_updated: pbUpdate.timestamp,
          data_type: pbUpdate.dataType,
          nc_reported_at: convertWhenToTimestamp(pbUpdate.when).toISOString(),
        },
        true
      );

      await verifyDbRow(
        () =>
          testPg.getLastWeatherHistory(
            pbUpdate.snapAddr_hex,
            pbUpdate.timestamp
          ),
        {
          snap_addr: pbUpdate.snapAddr_hex,
          wind_speed: pbUpdate.windSpeed,
          wind_direction: pbUpdate.windDirection,
          average_wind_speed: pbUpdate.averageWindSpeed,
          peak_wind_speed: pbUpdate.peakWindSpeed,
          temperature: pbUpdate.temperature,
          snow_depth: pbUpdate.snowDepth / 0.0254,
          increase_avg_wind_reporting: pbUpdate.increaseAvgWindReporting,
          increase_wind_gust_reporting: pbUpdate.increaseWindGustReporting,
          timestamp: pbUpdate.timestamp,
          data_type: pbUpdate.dataType,
          nc_reported_at: convertWhenToTimestamp(pbUpdate.when).toISOString(),
        },
        true
      );
    }
  });
});
