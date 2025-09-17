process.env.NODE_ENV = "test";

const {
  assetConnectionHistService
} = require("../services/assetConnectionStatusService");
const moment = require("moment");
var assert = require("assert");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../pg");
/*
describe("AssetConnectionStatus Service", () => {
  let payload;

  before(() => {
    payload = {
      channel: "asset_connection_hist",
      asset_id: "e3de00e8-68ed-4a78-a752-982932a3b699",
      timestamp: moment.utc().format(),
      connected_state: "FCS",
      last_connected: moment.utc().format(),
      last_asset_update: moment.utc().format()
    };
  });
  it("Fail when adding FCS mode", async () => {
    const client = new Client(pgConfig);
    const pgWrite = new Client(pgMasterConfig);
    return await assetConnectionHistService
      .handler(client, pgWrite, payload)
      .then(res => {
        //assert("Asset Not Found" === res);
        return res;
      })
      .catch(err => {
        console.log("Error in test.. ", err);
        return err;
      });
  });
});
*/