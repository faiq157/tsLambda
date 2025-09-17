const testBase = require("./common/testBase");
const { site } = require("./common/testData");
const { mockSns } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const testPg = require('./common/testPg');
const { verifySnowSheddingReport, verifyAssetHisotryJson } = require('./common/dbVerify');


describe("snowSheddingReport", () => {
  const [rowbox] = site.rowBoxes;
  beforeEach(async () => {
    await testBase.init();
    await testPg.removeAssetHistoryBySnapAddr(site.nc_snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const snowSheddingTestCases = [{
    name: "snowSheddingReport",
    when: when,
    snapAddr: site.nc_snap_addr_b64,
    report: [
      {
        "status": 4,
        "assets": [
          {
            "snapAddr": rowbox.snap_addr_b64,
            "snow_shedding_retries": 0
          }
        ]
      },
      {
        "status": 3,
        "assets": [
          {
            "snapAddr": rowbox.snap_addr_b64,
            "snow_shedding_retries": 1
          }
        ]
      },
      {
        "status": 2,
        "assets": [
          {
            "snapAddr": rowbox.snap_addr_b64,
            "snow_shedding_retries": 0
          }
        ]
      }
    ],
    delayed: false
  }];

  for (const testcase of snowSheddingTestCases) {

    it(testcase.name, async () => {
      const snowSheddingReport = testcase;
      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        type: 'elastic_search-1',
        channel: 'snow_shedding_report',
        network_controller_id: site.network_controller_id,
        snap_addr: site.nc_snap_addr,
        asset_id: site.asset_id,
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        reportDetail: '{"snow_shedding_report.completed":[{"snap_address":"0ac44f","row_id":null}],"snow_shedding_report.retried":[{"snap_address":"0ac44f","row_id":null}],"snow_shedding_report.retried_frequency":[0],"snow_shedding_report.failed":[{"snap_address":"0ac44f","row_id":null}],"snow_shedding_report.delayed":false}'
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ snowSheddingReportUpdate: snowSheddingReport });
      expect(scopeSns.isDone()).to.equal(true);
      expect(result).to.equal(true);

      const data = { "snow_shedding_report.failed": [{ "row_id": null, "snap_address": "0ac44f" }], "snow_shedding_report.delayed": false, "snow_shedding_report.retried": [{ "row_id": null, "snap_address": "0ac44f" }], "snow_shedding_report.completed": [{ "row_id": null, "snap_address": "0ac44f" }], "snow_shedding_report.retried_frequency": [0] };

      await verifySnowSheddingReport(() => testPg.getSnowSheddingReport(site.nc_snap_addr), {
        // timestamp: when.seconds,
        report_detail: data
      });

      await verifyAssetHisotryJson(data);
    });
  }
});
