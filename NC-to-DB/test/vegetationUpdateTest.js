process.env.NODE_ENV = "test";

const { PbVegetationUpdatsFactory } = require("./factories/pbVegetationUpdatesFactory");
const { vegetationUpdateService } = require("../services/vegetationUpdateService");
// const assert = require("assert");
// const moment = require("moment");
// const { pg } = require("../utils/lib/pg");
// const db = require("../db");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);

describe.skip("VegetationUpdateService tests", () => {

    let vegetationUpdates;

    before(async () => {
        // const assetSnapAddr = new Uint8Array([10, 196, 74]);
        vegetationUpdates = new PbVegetationUpdatsFactory(
            {
                assetSnapAddr_asU8: '//x13B4AA',
                timestamp: "2021-07-02 11:33:46.053000",
                vegetationModeStatus: true,
                temperatureThreshold: 45,
                daysHistoryList: [60,50,30]
            })        
    });


    it("should go through the VegetationUpdateService", async () => {
        await pg.connect();
        await pgWrite.connect();
        return await vegetationUpdateService
            .handler(vegetationUpdates, pg, pgWrite)
            .then(res => {
                return res;
            })
            .catch(err => {
                console.log("Error in test.. ", err);
                return err;
            });
    }).timeout(5000);


});