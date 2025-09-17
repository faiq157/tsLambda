const testBase = require("./common/testBase");
const { site } = require("./common/testData");
const { mockSns } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const { AccumulatorModes } = require('../utils/constants');
const { channels } = require('../utils/helpers/NotificationHelper');
const testPg = require('./common/testPg');
const { verifyDbRow } = require('./common/dbVerify');

describe("tcDayUpdates", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    await testPg.delMotorRuntimeDay(rowbox.motor_id);
    await testPg.deleteAssetHistoryBySnapAddr(rowbox.snap_addr);
    await testPg.updateRadio(rowbox.radio_id, {
      mesh_depth: null,
      polls_sent: null,
      polls_recv: null,
      link_quality: null
    });
  });

  const tcDayUpdatesTestCases = [{
    name: "motor runtime",
    update: {
      type: AccumulatorModes.MOTOR_RUNTIME,
      value: 716,
      partialData: false
    }
  }];

  for (const testcase of tcDayUpdatesTestCases) {

    const { update } = testcase;

    it(testcase.name, async () => {

      const date = new Date();
      const when = {
        seconds: Math.floor(date.getTime() / 1000),
        nanos: 0,
      };

      const tcUpdate = {
        tcSnapAddr: rowbox.snap_addr_b64,
        updates: [update],
        when,
        pollsSent: 64329,
        pollsReceived: 62002,
        linkQuality: 56,
        meshDepth: 2
      }

      const payload = {
        type: 'elastic_search-1',
        channel: channels.ASSET_MOTOR_RUNTIME_DAY,
        network_controller_id: site.network_controller_id,
        snap_addr: rowbox.snap_addr,
        asset_id: rowbox.asset_id,
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        motor_id: rowbox.motor_id,
        total_day: update.value,
        day: new Date(when.seconds * 1000),
        timestamp: new Date(when.seconds * 1000),
      }

      const scopeSns = mockSns(payload);

      const result = await testBase.invokeLambda({ tcDayUpdates: [tcUpdate] });

      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(false);

      await verifyDbRow(() => testPg.getRadio(rowbox.snap_addr), {
        link_quality: tcUpdate.linkQuality.toString(),
        mesh_depth: tcUpdate.meshDepth.toString(),
        polls_sent: tcUpdate.pollsSent,
        polls_recv: tcUpdate.pollsReceived
      })

      await verifyDbRow(() => testPg.getRadioHist(rowbox.snap_addr), {
        snap_addr: rowbox.snap_addr,
        data: {
          'radio.link_quality': tcUpdate.linkQuality,
          'radio.mesh_depth': tcUpdate.meshDepth,
          'radio.polls_sent': tcUpdate.pollsSent,
          'radio.polls_recv': tcUpdate.pollsReceived
        }
      });

      await verifyDbRow(() => testPg.getMotorRuntimeDay(rowbox.motor_id), {
        day: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        total_day: update.value,
        // collected_at: new Date(when.seconds * 1000) ignoring this server time is probabbly being used
      })
    });
  }
});
