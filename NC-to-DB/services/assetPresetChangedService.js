const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");
const helpers = require('../utils/helpers/functions');

class AssetPresetChangedService {
  async handler(pbUpdate) {
    try {
      console.log("In AssetPresetChangedService Handler ..");
      this.assetPresetUpdate = pbUpdate;

      const tcSnapAddr = this.assetPresetUpdate.getSnapAddr_asU8();
      this.snapAddrStr = helpers.getSnapAddr(tcSnapAddr);
      const insertHistory_res = await this.insertRackHistory();
      console.log("query response:", insertHistory_res.rowCount);

      const asset = await getAssetBySnapAddr(this.snapAddrStr);

      if (asset?.repeater_only) {
        console.info("In AssetPresetChangedService Ignoring repeater update,", this.snapAddrStr);
        return null
      }

      await this.sendToElasticSearch(asset);

      if (!asset) {
        console.warn(`AssetPresetChangedService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
        return;
      }
      await updateAssetLastActivity(
        this.assetPresetUpdate.getWhen().toDate(),
        asset.id,
        asset.last_cloud_update
      );

      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in RackAngleService handler..!!"
      );
    }
  }

  async insertRackHistory() {
    console.log("In insertRackHistory()");
    
    return exeQuery(db.rackPresetHistInsert, [
      this.snapAddrStr,
      this.assetPresetUpdate.getWhen().toDate(),
      this.assetPresetUpdate.getPanelIndex(),
      this.assetPresetUpdate.getPanelCommandState(),
    ])
    .catch((err) => {
      console.log("Error in insertRackHistory .. ");
      console.log("ERROR/Error in query :", db.rackPresetHistInsert, [
        this.snapAddrStr,
        this.assetPresetUpdate?.getWhen()?.toDate(),
        this.assetPresetUpdate?.getPanelIndex(),
        this.assetPresetUpdate?.getPanelCommandState(),
      ]);
        throw err;
      });
  }

  async sendToElasticSearch(assetsInfo) {
    try {
      let rackJson = {};
      rackJson.asset_id = assetsInfo.id;
      rackJson.device_type = assetsInfo.device_type_id;
      rackJson.timestamp = this.assetPresetUpdate.getWhen().toDate();
      rackJson.panel_index = this.assetPresetUpdate.getPanelIndex();
      rackJson.panel_command_state = this.assetPresetUpdate.getPanelCommandState();
      rackJson.type = "elastic_search-1";
      rackJson.channel = "asset_preset_update";

      console.log("payload to be sent to ElasticSearch : ", rackJson);
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(rackJson);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.log("Error in sendToElasticSearch .. ", err);
      throw err;
    }
  }
}

exports.assetPresetChangedService = new AssetPresetChangedService();
