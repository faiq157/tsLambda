process.env.NODE_ENV = "test";

const { getPbClearLogEntriesList } = require("./factories/pbClearLogEntriesListFactory");
const { clearLogEntriesService } = require("../services/clearLogEntriesService");
const assert = require("assert");
// const moment = require("moment");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);

describe.skip("To test clearLogEntries factory", () => {

    let clearLogEntriesList;
    let netCtrlId;
    
    before(async () => {
        netCtrlId = "e177ebd3-a357-4ff7-9149-248b11bc52ec";
        clearLogEntriesList = await getPbClearLogEntriesList([
            {
                created: "2017-09-19 14:15:27.176000",
                cleared: "2017-09-20 14:15:27.176000"
            },
            {
                created: "2017-10-24 20:56:26.976000",
                cleared: "2017-10-25 20:56:26.976000"
            }
        ])
    })


    it("should go through the clearLogEntriesService", async () => {
        await pg.connect();
        await pgWrite.connect();
        for (let logEntry of clearLogEntriesList) {
            await clearLogEntriesService
                .handler(netCtrlId, logEntry, pg, pgWrite)
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



    // it("should print a valid ClearLogEntriesList", async () => {
    //     console.log("\n\n--------------------------", "\n\nNetCtrlId :\n", netCtrlId, "\nclearLogEntriesList made by the factory :\n", clearLogEntriesList, "\n\n------------------------\n\n");
    //     for (let update of clearLogEntriesList) {
    //         console.log("\n\nobject n : \n\n\n");
    //         console.log("cleared : ", update.getCleared());
    //         console.log("created : ", update.getCreated());
    //     }
    // })


})