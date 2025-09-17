const chai = require("chai");
const { expect } = chai;
const { verifyDbRow } = require('./common/dbVerify');
const testBase = require("../test/common/testBase");
const { site } = require("./common/testData");
const testPg = require("./common/testPg");

describe("Bridge Update Service", () => {
  const [rowbox] = site.rowBoxes;
  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };
  before(async () => {
    await testBase.init();
    await testPg.deleteAssetHistoryBySnapAddr(rowbox.snap_addr);
    await testPg.updateRadio(rowbox.radio_id, {
      firmware_version: null,
      script_version: null
    });
  });

  it("bridge updates", async () => {
    const bridgeUpdate = [{
        "snapAddr": rowbox.snap_addr_b64,
        when,
        "scriptVersion": "4",
        "firmwareVersion": "RF220-2.8.2"
      }
    ];

    for (let update of bridgeUpdate) {
      const result = await testBase.invokeLambda({ bridgeUpdates: update });
      expect(result).to.equal(true);

      await verifyDbRow(() => testPg.getRadio(rowbox.snap_addr), {
        script_version: update.scriptVersion,
        firmware_version: update.firmwareVersion
      });
      await verifyDbRow(() => testPg.getRadioHist(rowbox.snap_addr), {
        snap_addr: rowbox.snap_addr,
        data: {
          'radio.firmware_rev': update.firmwareVersion,
          'radio.script_rev': update.scriptVersion
        }
      });
    }
  });

});
