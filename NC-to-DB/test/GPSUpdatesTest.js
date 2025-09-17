process.env.NODE_ENV = "test";

const { gpsService } = require("../services/gpsService");
const { PbGPSUpdateFactory } = require("./factories/pbGPSUpdatesFactory");
const moment = require("moment");
const assert = require("assert");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);


describe.skip("GPS Service Test", () => {
    let gpsUpdate;
    let netCtrlAddr;

    before(() => {
        // const netCtrlId = "e177ebd3-a357-4ff7-9149-248b11bc52ec";
        netCtrlAddr = new Uint8Array([255, 255, 255]);
        gpsUpdate = new PbGPSUpdateFactory({
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


    it("should go through gpsUpdate", async () => {
        await pg.connect();
        await pgWrite.connect();
        return await gpsService
            .handler(netCtrlAddr, gpsUpdate, pg, pgWrite)
            // .then(res => {
            //     return res;
            // })
            .catch(err => {
                assert.fail(err);
                console.log("Error in test.. ", err);
                return err;
            });
    });



    // it("should print valid GPSUpdate", async () => {
    //     console.log("\n\n--------------------------", "\n\nNetCtrlId :\n", netCtrlId, "\nGPSUpdate made by the factory :\n", gpsUpdate, "\n\n------------------------\n\n");
    //     console.log("\n\nobject n : \n\n\n");
    //     console.log("ncSnapAddr : ", gpsUpdate.getNcSnapAddr_asU8());
    //     console.log("when : ", gpsUpdate.getWhen().toDate());
    //     console.log("gpsUpdates : ", gpsUpdate.getGpsUpdates());
    //     console.log("latitude : ", gpsUpdate.getLatitude());
    //     console.log("longitude : ", gpsUpdate.getLongitude());
    //     console.log("altitude : ", gpsUpdate.getAltitude());
    //     console.log("numSats : ", gpsUpdate.getNumSats());
    //     console.log("quality : ", gpsUpdate.getQuality());
    //     console.log("fixTime : ", gpsUpdate.getFixTime());
    //     console.log("isrResponding : ", gpsUpdate.getIsResponding());
    //     console.log("altitudeUnits : ", gpsUpdate.getAltitudeUnits());
    //     console.log("isClockQuestionable : ", gpsUpdate.getIsClockQuestionable());
    // })

    // it("Fail when snapAddr does not exist", async () => {
    //     gpsUpdate.setProp("ncSnapAddr", "\\x0E2B81");
    //     return await gpsService
    //         .handler(netCtrlId, gpsUpdate)
    //         .then(res => {
    //             return res;
    //         })
    //         .catch(err => {
    //             console.log("Error in test.. ", err);
    //             return err;
    //         });
    // });

    // it("Create GPS history log", async () => {
    //     return await gpsService
    //         .handler(gpsUpdate)
    //         .then(res => {
    //             return res;
    //         })
    //         .catch(err => {
    //             console.log("Error in test.. ", err);
    //             return err;
    //         });
    // });


});
