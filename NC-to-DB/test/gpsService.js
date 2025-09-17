process.env.NODE_ENV = "test";
//test_comment
const { gpsService } = require("../services/gpsService");
const { PbGPSUpdateFactory } = require("./factories/pbGPSUpdateFactory");
const moment = require("moment");

describe.skip("GPS Service", () => {
  let cloudUpdatesPb;

  before(() => {
    cloudUpdatesPb = new PbGPSUpdateFactory({
      ncSnapAddr: "\\x0E2B81",
      lat: 0.0,
      lng: 0.0,
      alt: 0.0,
      sats: 0,
      quality: 0,
      fixTime: moment.utc().format(),
      isResponding: true,
      altUnits: "0",
      isClockQuestionable: true,
      timestamp: moment.utc().format()
    });
  });

  // afterEach(() => {
  //   console.log = msg => {
  //     return "";
  //   };
  // });

  it("Fail when snapAddr does not exist", async () => {
    cloudUpdatesPb.setProp("ncSnapAddr", "\\x0E2B81");
    return await gpsService
      .handler(cloudUpdatesPb)
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log("Error in test.. ", err);
        return err;
      });
  });

  it("Create GPS history log", async () => {
    return await gpsService
      .handler(cloudUpdatesPb)
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log("Error in test.. ", err);
        return err;
      });
  });
});
