process.env.NODE_ENV = "test";

const { getPbLogEntriesList } = require("./factories/pbLogEntriesListFactory");
const { logEntriesService } = require("../services/logEntriesService");
const assert = require("assert");
// const moment = require("moment");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);


describe.skip("To test logEntries factory", () => {

    let logEntriesList;
    let netCtrlId;
    
    before(async () => {
        netCtrlId = "e177ebd3-a357-4ff7-9149-248b11bc52ec";
        logEntriesList = await getPbLogEntriesList([
            {
                logger: "ModemMonitor",
                message: "Cell modem is not responding!",
                levelno: 50,
                created: "2017-09-19 14:15:27.176000",
                type: 3
            },
            {
                logger: "AssetPoller",
                message: "Asset ffb5cf has stopped sending data",
                levelno: 50,
                created: "2017-10-24 20:56:26.976000",
                type: 3
            }
        ])
    })


    it("should go through the logEntriesService", async () => {
        await pg.connect();
        await pgWrite.connect();
        for (let logEntry of logEntriesList) {
            await logEntriesService
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



    // it("should print a valid logEntriesList", async () => {
    //     console.log("\n\n--------------------------", "\n\nNetCtrlId :\n", netCtrlId, "\nlogEntriesList made by the factory :\n", logEntriesList, "\n\n------------------------\n\n");
    //     for (let update of logEntriesList) {
    //         console.log("\n\nobject n : \n\n\n");
    //         console.log("logger : ", update.getLogger());
    //         console.log("message : ", update.getMessage());
    //         console.log("levelno : ", update.getLevelno());
    //         console.log("created : ", update.getCreated());
    //         console.log("type : ", update.getType());
    //     }
    // })



})