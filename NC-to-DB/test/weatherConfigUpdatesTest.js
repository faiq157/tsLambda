process.env.NODE_ENV = "test";

const { PbWeatherConfigUpdatesFactory } = require("./factories/pbWeatherConfigUpdatesFactory");
// const { pg } = require("../utils/lib/pg");
const { weatherConfigUpdatesService } = require("../services/weatherConfigUpdatesService");
const assert = require("assert");
const db = require("../db");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);

describe.skip("To test weatherConfigUpdates factory", () => {

    let ncSnapAddr_asU8;
    let weatherConfigUpdates;
    
    before(async () => {
        // netCtrlId = "e177ebd3-a357-4ff7-9149-248b11bc52ec";
        ncSnapAddr_asU8 = new Uint8Array([10, 196, 74]);
        weatherConfigUpdates = new PbWeatherConfigUpdatesFactory(
            {
                ncSnapAddr_asU8: new Uint8Array([10, 196, 74]),
                tcSnapAddr: "//x0E2B81",
                timestamp: "2019-09-13 23:33:46.053000",
                windSpeedThreshold: 30,
                windGustThreshold: 45,
                snowDepthThreshold: 0.5,
                panelSnowDepthThreshold: 0.05000000074505806
            })
            // getNcSnapAddr_asU8 = function () {
            //     return ncSnapAddr_asU8;
            // }
    })

    it("should test basic functionality of weatherConfigUpdates", async () => {
        await pg.connect();
        await pgWrite.connect();
        let principal = 'f0020c61d36662250bb1cface1b76ad49a6233e1278de4ef5345bfb3ee74f4f6';
        const netCtrlResults = await pg
            .query(db.netCtrlQuery, [principal])
            .catch(err => {
                console.log("\n\nError in netCtrlQuery in test .. \n");
                assert.fail(err);
                throw err;
            })
        return await weatherConfigUpdatesService
            .handler(netCtrlResults.rows[0].id, ncSnapAddr_asU8, netCtrlResults, weatherConfigUpdates, pg, pgWrite)
            .then(res => {
                return res;
            })
            .catch(err => {
                console.log("Error in test.. ", err);
                return err;
            });
    })

    // it("should print a valid weatherConfigUpdates", async () => {
    //     console.log("\n\n--------------------------", "\n\nNetCtrlId :\n", netCtrlId, "\nweatherConfigUpdates made by the factory :\n", weatherConfigUpdates, "\n\n------------------------\n\n");
    //     let update = weatherConfigUpdates;
    //     console.log("\n\nobject n : \n\n\n");
    //     console.log("when : ", update.getWhen().toDate());
    //     console.log("tcSnapAddr : ", update.getTcSnapAddr_asU8());
    //     console.log("wind speed threshold : ", update.getWindSpeedThreshold());
    //     console.log("wind gust threshold : ", update.getWindGustThreshold());
    //     console.log("snow depth threshold : ", update.getSnowDepthThreshold());
    //     console.log("panel snow depth threshold : ", update.getPanelSnowDepthThreshold());

    // })

})