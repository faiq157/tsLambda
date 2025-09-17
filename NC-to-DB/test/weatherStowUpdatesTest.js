process.env.NODE_ENV = "test";

const { PbWeatherStowUpdatesFactory } = require("./factories/pbWeatherStowUpdatesFactory");
// const { pg } = require("../utils/lib/pg");
const { weatherStowUpdatesService } = require("../services/weatherStowUpdatesService");
// const assert = require("assert");
// const db = require("../db");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);


describe.skip("To test weatherStowUpdates factory", () => {

    let weatherStowUpdate;
    let netCtrlId;
    let ncSnapAddr_asU8;

    before(async () => {
        netCtrlId = "e177ebd3-a357-4ff7-9149-248b11bc52ec";
        ncSnapAddr_asU8 = new Uint8Array([10, 196, 74]);
        weatherStowUpdate = new PbWeatherStowUpdatesFactory(
            {
                ncSnapAddr_asU8: new Uint8Array([10, 196, 74]),
                tcSnapAddr: "//x0E2B81",
                timestamp: "2019-09-13 23:33:46.053000",
                stowType: 0,
                stowValue: 0,
                stowThreshold: 0

            })
    })

    it("should test basic functionality of weatherStowUpdates", async () => {
        await pg.connect();
        await pgWrite.connect();
        return await weatherStowUpdatesService
            .handler(netCtrlId, ncSnapAddr_asU8, weatherStowUpdate, pg, pgWrite)
            .then(res => {
                return res;
            })
            .catch(err => {
                console.log("Error in test.. ", err);
                return err;
            });
    })

    // it("should print a valid weatherStowUpdate", async () => {
    //     console.log("\n\n--------------------------", "\n\nNetCtrlId :\n", netCtrlId, "\nweatherStowUpdate made by the factory :\n", weatherStowUpdate, "\n\n------------------------\n\n");
    //     let update = weatherStowUpdate;
    //     console.log("\n\nobject n : \n\n\n");
    //     console.log("when : ", update.getWhen().toDate());
    //     console.log("tcSnapAddr : ", update.getTcSnapAddr_asU8());
    //     console.log("stow type : ", update.getStowType());
    //     console.log("stow value : ", update.getValue());
    //     console.log("stow threshold : ", update.getThreshold());

    // })

})