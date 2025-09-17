const chai = require("chai");
const { expect } = chai;
const { verifyDbRow } = require('./common/dbVerify');
const testBase = require("../test/common/testBase");
const { site } = require("./common/testData");
const testPg = require("./common/testPg");
const pg = require("../utils/lib/pg");

describe("Panel Service", () => {
  const [rowbox] = site.rowBoxes;
  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };
  before(async () => {
    await testBase.init();
    await testPg.deleteAssetHistoryBySnapAddr(rowbox.snap_addr);
  });

  it("panel updates", async () => {

    const panelUpdatesList = [
      {
        "tcSnapAddr": rowbox.snap_addr_b64,
        "solarVoltage": 21.899999618530273,
        "solarCurrent": 0.07999999821186066,
        when,
        "externalInput2Voltage": 0,
        "externalInput2Current": 0
      }
    ];

    for (let update of panelUpdatesList) {
      const result = await testBase.invokeLambda({ panelUpdate: [update] });
      expect(result).to.equal(true);

      await verifyDbRow(() => pg.getPanelBySnapAddr(rowbox.snap_addr), {
        snap_addr: rowbox.snap_addr,
        voltage: update.solarVoltage,
        current: update.solarCurrent,
        external_voltage: update.externalInput2Voltage,
        external_current: update.externalInput2Current
      });

      await verifyDbRow(() => testPg.getPanelHistory(rowbox.snap_addr), {
        snap_addr: rowbox.snap_addr,
        data: {
          'panel.voltage': update.solarVoltage,
          'panel.current': update.solarCurrent,
          'panel2.voltage': update.externalInput2Voltage,
          'panel2.current': update.externalInput2Current
        }
      });
    }
  });

});
