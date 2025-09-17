const chai = require("chai");
const { expect } = chai;
const { verifyDbRow } = require('./common/dbVerify');
const testBase = require("../test/common/testBase");
const { site } = require("./common/testData");
const testPg = require("./common/testPg");
const pg = require("../utils/lib/pg");

describe("Motor Current Update Service", () => {
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

  it("motor current updates", async () => {

    const motorCurrentUpdatesList = [
      {
        "snapAddr": rowbox.snap_addr_b64,
        when,
        "peakMotorInrushCurrent": 2.9100000858306885,
        "peakMotorCurrent": 0.009999999776482582,
        "averageMotorCurrent": 1.2300000190734863,
        "endingMotorCurrent": 1.1100000143051147,
        "currentAngle": -6.900000095367432,
        "trackingStatus": 3
      }
    ];

    for (let update of motorCurrentUpdatesList) {
      const result = await testBase.invokeLambda({ motorCurrentUpdate: update });
      expect(result).to.equal(true);

      await verifyDbRow(() => pg.getMotorBySnapAddr(rowbox.snap_addr), {
        snap_addr: rowbox.snap_addr,
        peak_motor_inrush_current: update.peakMotorInrushCurrent,
        peak_motor_current: update.peakMotorCurrent,
        average_motor_current: update.averageMotorCurrent,
        ending_motor_current: update.endingMotorCurrent
      });

      await verifyDbRow(() => testPg.getMotorHistory(rowbox.snap_addr), {
        snap_addr: rowbox.snap_addr,
        data: {
          'motor.peak_inrush_current': update.peakMotorInrushCurrent,
          'motor.peak_current': update.peakMotorCurrent,
          'motor.avg_current': update.averageMotorCurrent,
          'motor.ending_current': update.endingMotorCurrent
        }
      });
    }
  });

});
