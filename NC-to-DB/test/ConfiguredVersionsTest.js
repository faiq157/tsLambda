process.env.NODE_ENV = "test";

const { configuredVersionsService } = require("../services/configuredVersionsService");
const { PbConfiguredVersionsFactory } = require("./factories/pbConfiguredVersionsFactory");
const moment = require("moment");
const assert = require("assert");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../utils/lib/pg");

const pg = new Client(pgConfig);
const pgWrite = new Client(pgMasterConfig);


describe.skip("ConfiguredVersions Service Test", () => {
    let configVersionsUpdate;
    let net_ctrl_id;

    before(() => {
        net_ctrl_id = "e177ebd3-a357-4ff7-9149-248b11bc52ec";
        // netCtrlAddr = new Uint8Array([255, 255, 255]);

        configVersionsUpdate = new PbConfiguredVersionsFactory({
            when: moment.utc().format(),
            ncVersion: '0.7.6',
            ncScriptVersion: 'ncScriptVersion',
            ncRadioVersion: 'ncRadioVersion',
            ncStm32Version: 'ncStm32Version',
            ncGasGuageVersion: 'ncGasGuageVersion',
            assetScriptVersion: 'assetScriptVersion',
            assetRadioVersion: 'assetRadioVersion',
            assetStm32Version: 'assetStm32Version',
            assetGasGuageVersion: 'assetGasGuageVersion'
        });
    });

    

    it("should store configuredVersion in db", async () => {
        await pg.connect();
        await pgWrite.connect();
        return await configuredVersionsService.handler(configVersionsUpdate, pg, pgWrite,net_ctrl_id)
            .then(res => {
                return res;
            })
            .catch(err => {
                assert.fail(err);
                console.log("Error in test.. ", err);
                return err;
            });
    });

    after(() => {
          console.log = () => {
          return "exiting...";
        };
      });



});
