const testBase = require("./common/testBase");
// const testPg = require('./common/testPg');
const { site } = require('./common/testData');
const { mockSns, mockMqtt } = require('./common/mock');
// const { channels } = require('../utils/helpers/NotificationHelper');


const chai = require('chai');

// const sinon = require('sinon');
// const nock = require('nock');
// nock.recorder.rec();

const { expect } = chai;

describe("CommandStatusUpdateService", function () {

  // Sample message in Json
  // {
  //   "ncSnapAddr": "13520b",
  //   "commandStatus": {
  //     "snapAddr": "13b4c3",
  //     "when": "2022-02-18T11:11:37.410Z",
  //     "command": 5,
  //     "status": 0,
  //     "errorCode": 0
  //   }
  // }

  beforeEach(async () => {
    await testBase.init();
    // await testPg.resetNCLastActivityTimeBySec(site.network_controller_id, LAST_ACTIVITY_UPDATE_INTERVAL + 1);
  })

  it("success test", async () => {
    const date = new Date();

    const when = {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: 0
    }

    const [ rowBox ]= site.rowBoxes;

    const commandStatus = {
      snapAddr: rowBox.snap_addr_b64,
      when,
      command: 5,
      status: 0,
      errorCode: 0
    };

    // const payload = {
    //   nc_snap_addr: site.nc_snap_addr,
    //   snap_addr: rowBox.snap_addr,
    //   site_id: site.site_id,
    //   timestamp: new Date(when.seconds * 1000),
    //   network_controller_id: site.network_controller_id,
    //   asset_id: rowBox.asset_id,
    //   type: 'elastic_search-1',
    //   channel: channels.COMMAND_STATUS_UPDATE,
    //   command: commandStatus.command,
    //   status: commandStatus.status,
    //   error_code: commandStatus.errorCode
    // }

    const scopeSns = mockSns(null);
    const scopeMqtt = mockMqtt(null);
    const result = await testBase.invokeLambda({
      commandStatus
    });
    expect(result).to.equal(true);
    // scopeSns.done();
    expect(scopeSns.isDone()).to.equal(false);
    expect(scopeMqtt.isDone()).to.equal(false);
  })
});
