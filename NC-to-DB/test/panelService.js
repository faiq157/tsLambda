process.env.NODE_ENV = "test";

const { panelService } = require("../services/panelServiceN");
const {
  getPanelUpdateList,
  // PbPanelUpdateListFactory
} = require("./factories/pbPanelUpdateListFactory");
const moment = require("moment");

describe.skip("Panel Service", () => {
  let getPanelUpdate;

  before(async () => {
    getPanelUpdate = await getPanelUpdateList([
      {
        tcSnapAddr: "\\x0E2B81",
        solarVoltage: 20.5,
        solarCurrent: 1.13,
        timestamp: moment.utc().format()
      },
      {
        tcSnapAddr: "\\x0E2B81",
        solarVoltage: 25.5,
        solarCurrent: 1.12,
        timestamp: moment.utc().format()
      }
    ]);
  });

  //   afterEach(async () => {
  //     console.log = msg => {
  //       return "";
  //     };
  //   });

  it("Fail when snapAddr does not exist", async () => {
    for (let panelUpdate of getPanelUpdate) {
      if (
        panelUpdate.getSolarVoltage() > 0 ||
        panelUpdate.getSolarCurrent() > 0
      ) {
        await panelService
          .handler(panelUpdate)
          .then(res => {
            return res;
          })
          .catch(err => {
            console.log("Error in test.. ", err);
            return err;
          });
      }
    }
    return;
  }).timeout(5000);
});
