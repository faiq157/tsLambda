process.env.NODE_ENV = "test";

const { getPbStartupDataList } = require("./factories/pbStartupDataListFactory");
const { startupDataService } = require("../services/startupDataService");
const assert = require("assert");
// const { pg } = require("../utils/lib/pg");
const db = require("../db");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);

describe.skip("To test startupData factory", () => {

    let startupDataList;

    before(async () => {
        // netCtrlId = "e177ebd3-a357-4ff7-9149-248b11bc52ec";
        startupDataList = await getPbStartupDataList([
            {
                timestamp: "2017-09-19 14:15:27.176000",
                fwVersion: "0.6.4",
                nccbUptime: "0 years 0 mons 2 days 20 hours 40 mins 50.00 secs",
                linuxUptime: "0 years 0 mons 2 days 20 hours 40 mins 50.00 secs",
                applicationUptime: "0 years 0 mons 2 days 20 hours 40 mins 50.00 secs"
            },
            {
                timestamp: "2017-09-19 14:15:27.176000",
                fwVersion: "0.6.4",
                nccbUptime: "0 years 0 mons 2 days 20 hours 40 mins 50.00 secs",
                linuxUptime: "0 years 0 mons 2 days 20 hours 40 mins 50.00 secs",
                applicationUptime: "0 years 0 mons 2 days 20 hours 40 mins 50.00 secs"
            }
        ])
    })



    it("should go through the StartupDataService", async () => {
        let principal = 'f0020c61d36662250bb1cface1b76ad49a6233e1278de4ef5345bfb3ee74f4f6';
        await pg.connect();
        await pgWrite.connect();
        for (let data of startupDataList) {
            const netCtrlResults = await pg
                .query(db.netCtrlQuery, [principal])
                .catch(err => {
                    console.log("\n\nError in netCtrlQuery in test .. \n");
                    assert.fail(err);
                    throw err;
                })
            await startupDataService
                .handler(netCtrlResults, data, pg, pgWrite)
                .catch(err => {
                    console.log("\n\n\n\nError in test.. ", err);
                    assert.fail(err);
                    throw err;
                });
            // console.log("update : ", update);
            // console.log("update.getWhen().toDate() : ", update.getWhen().toDate());
        }
        return true;
    }).timeout(5000);



    // it("should print a valid startupDataList", async () => {
    //     console.log("\n\n--------------------------", "\n\nNetCtrlId :\n", netCtrlId, "\nstartupDataList made by the factory :\n", startUpDataList, "\n\n------------------------\n\n");
    //     for (let update of startupDataList) {
    //         console.log("\n\nobject n : \n\n\n");
    //         console.log("when : ", update.getWhen().toDate());
    //         console.log("fwVersion : ", update.getFwVersion());
    //         console.log("nccbUptime : ", update.getNccbUptime());
    //         console.log("LinuxUptime : ", update.getLinuxUptime());
    //         console.log("applicationUptime : ", update.getApplicationUptime());
    //     }
    // })



})