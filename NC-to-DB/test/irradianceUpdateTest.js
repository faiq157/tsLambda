const testBase = require("./common/testBase");
const { site } = require("./common/testData");
const { mockSns } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const { channels } = require('../utils/helpers/NotificationHelper');
const testPg = require('./common/testPg');
const { verifyDbRow } = require('./common/dbVerify');


describe('irradianceUpdate', () => {

  beforeEach(async () => {
    await testBase.init();
    await testPg.delIrradianceHist(site.project_id);
  });

  // Sample Payload
  // {
  //   "ncSnapAddr": "0e2bab",
  //   "irradianceUpdate": {
  //     "when": "2022-03-24T23:21:11.340Z",
  //     "siteGhi": 1.7486668825149536,
  //     "sitePoa": 0.7434883117675781
  //   }
  // }

  const testCases = [{
    name: "insert case",
    removeOldIrradiance: true,
    ghi: 1.75,
    poa: 0.75,
  }, {
    name: "update case",
    removeOldIrradiance: false,
    ghi: 1.75,
    poa: 0.75,
  }];

  for (const testcase of testCases) {
    const { project_id } = site;
    const { ghi, poa } = testcase;

    it(testcase.name, async () => {

      if (testcase.removeOldIrradiance) {
        await testPg.delWeatherIrradiance(project_id);
      } else {
        await testPg.updateWeatherIrradiance(project_id, {
          ghi: null,
          poa: null,
          snap_addr: null,
          solar_irradiance: null
        });
      }

      const date = new Date();
      const when = {
        seconds: Math.floor(date.getTime() / 1000),
        nanos: 0,
      };

      const irradianceUpdate = {
        when,
        siteGhi: ghi,
        sitePoa: poa,
      }

      const payload = {
        type: 'elastic_search-1',
        channel: channels.IRRADIANCE_HISTORY,
        network_controller_id: site.network_controller_id,
        snap_addr: site.nc_snap_addr,
        asset_id: site.asset_id,
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        project_id: project_id,
        site_ghi: testcase.ghi,
        site_poa: testcase.poa,
        timestamp: new Date(when.seconds * 1000),
      }

      const scopeSns = mockSns(payload);

      const result = await testBase.invokeLambda({ irradianceUpdate });

      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(false);

      await verifyDbRow(() => testPg.getWeatherIrradiance(project_id), {
        poa,
        ghi,
        solar_irradiance: null,
        snap_addr: site.nc_snap_addr,
        timestamp: when.seconds.toString()
      });

      await verifyDbRow(() => testPg.getIrradianceHist(project_id), {
        site_poa: poa,
        site_ghi: ghi,
        solar_irradiance: null,
        snap_addr: site.nc_snap_addr,
        timestamp: new Date(when.seconds * 1000),
      });

    });
  }
});
