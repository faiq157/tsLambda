process.env.NODE_ENV = "test";

const { PbCellDailyUpdatesFactory } = require("./factories/pbCellDailyUpdatesFactory");
const { cellDailyUpdatesService } = require("../services/cellDailyUpdatesService");
const assert = require("assert");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);


describe.skip("To test cellDailyUpdates factory", () => {

    let cellDailyUpdates;
    // let netCtrlId;
    let principal;

    before(async () => {
        // netCtrlId = "e177ebd3-a357-4ff7-9149-248b11bc52ec";
        principal = 'de6029e25ebb31fbb1244fc2d01016040ff35c0c8cf472337d47926350f4c482';
        cellDailyUpdates = new PbCellDailyUpdatesFactory(
            {
                timestamp: "2017-09-19 14:15:27.176000",
                linkStatus: "PPP Link is up",
                wanIp: "10.64.64.64",
                towerId: "2919420",
                rxDataUsage: 2271,
                txDataUsage: 1735,
                mdn: "+12392700236",
                imei: "353238062015341",
                roaming: false,
                lanIp: "100.101.202.38"
            }
        )
    })

    it("should go through the cellDailyUpdatesService", async () => {
        await pg.connect();
        await pgWrite.connect();
        return await cellDailyUpdatesService
            .handler(cellDailyUpdates, principal, pg, pgWrite)
            .catch(err => {
                console.log("\n\n\n\nError in test.. ", err);
                assert.fail(err);
                throw err;
            });
        // console.log("update : ", update);
        // console.log("update.getWhen().toDate() : ", update.getWhen().toDate());
    }).timeout(5000);


    // it("should print valid cellDailyUpdates", async () => {
    //     console.log("\n\n--------------------------", "\n\nNetCtrlId :\n", netCtrlId, "\ncellDailyUpdates made by the factory :\n", cellDailyUpdates, "\n\n------------------------\n\n");
    //     let update = cellDailyUpdates;
    //     console.log("\n\nobject n : \n\n\n");
    //     console.log("when : ", update.getWhen().toDate());
    //     console.log("link status : ", update.getLinkStatus());
    //     console.log("wanIp : ", update.getWanIp());
    //     console.log("towerId : ", update.getTowerId());
    //     console.log("rxDataUsage : ", update.getRxDataUsage());
    //     console.log("txDataUsage : ", update.getTxDataUsage());
    //     console.log("mdn : ", update.getMdn());
    //     console.log("imei : ", update.getImei());
    //     console.log("roaming : ", update.getRoaming());
    //     console.log("lanIp : ", update.getLanIp());
    // })
})