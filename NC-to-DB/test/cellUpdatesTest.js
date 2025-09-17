const testBase = require("./common/testBase");
// const testPg = require('./common/testPg');
const { site } = require('./common/testData');
const { mockSns, mockMqtt } = require('./common/mock');
const { channels } = require('../utils/helpers/NotificationHelper');
const util = require('../util');


const chai = require('chai');

// const sinon = require('sinon');
// const nock = require('nock');
// nock.recorder.rec();

const { expect } = chai;

describe("CellUpdatesService", function () {

  // Sample message in Json
  // {
  //   "ncSnapAddr": "19b0cf",
  //   "cellUpdates": {
  //     "ncSnapAddr": "19b0cf",
  //     "when": "2022-02-11T09:00:16.343Z",
  //     "uptime": 0,
  //     "rssiDbm": 0
  //   }
  // }

  beforeEach(async () => {
    await testBase.init();
    // await testPg.resetNCLastActivityTimeBySec(site.network_controller_id, LAST_ACTIVITY_UPDATE_INTERVAL + 1);
  })

  it("Cell Update test", async () => {
    const date = new Date();

    const when = {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: 0
    }

    const cellUpdates = {
      ncSnapAddr: site.nc_snap_addr_b64,
      when,
      uptime: 0,
      rssiDbm: 0
    };

    const payload = {
      nc_snap_addr: site.nc_snap_addr,
      snap_addr: site.nc_snap_addr,
      site_id: site.site_id,
      timestamp: new Date(when.seconds * 1000),
      network_controller_id: site.network_controller_id,
      asset_id: site.asset_id,
      type: 'elastic_search-1',
      channel: channels.CELL_UPDATE,
      rssi_dbm: cellUpdates.rssiDbm,
      up_time: util.uptimeStr(cellUpdates.uptime)
    }

    const scopeSns = mockSns(payload);
    const scopeMqtt = mockMqtt(null);
    const result = await testBase.invokeLambda({
      cellUpdates
    });
    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(false);
    expect(scopeMqtt.isDone()).to.equal(false);
  })
});
