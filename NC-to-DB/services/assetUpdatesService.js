const { updateAssetLastActivity } = require("../models/asset.model");
const { getAssetBySnapAddr, updateAssetTemp } = require("../models/asset.model");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { getIdsHelper } = require("../utils/helpers/getIdsHelper");
const helpers = require('../utils/helpers/functions');
const { logger } = require("../utils/logger");

class AssetUpdatesService {

  constructor() {
    this.assetUpdate = null;
  }

  async handler(net_ctrl_id, ncSnapAddr, pbUpdate) {
    try {
      console.log("In assetUpdatesService handler ..");
      this.assetUpdate = pbUpdate;
      this.netCtrlId = net_ctrl_id;
      this.snapAddr = this.assetUpdate.getSnapAddr_asU8();
      this.snapAddrStr = helpers.getSnapAddr(this.snapAddr);
      console.log(this.assetUpdate.getUnitTemperature());
      console.log(this.assetUpdate.getUpTime());
      if (this.assetUpdate.getUnitTemperature() === 0 && this.assetUpdate.getUpTime() === 0) {
        console.warn(`AssetUpdateService:: Dummy Update Ignored, ${this.snapAddrStr}, ${this.assetUpdate.getUnitTemperature()}, ${this.assetUpdate.getUpTime()}`);
        return;
      }

      const ids = await getIdsHelper.getIds(
        this.snapAddr,
        ncSnapAddr,
        net_ctrl_id
      );

      const asset = await getAssetBySnapAddr(this.snapAddrStr);
      if (!asset) {
        console.warn(`AssetUpdateService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
        return;
      }

      const assetLastUpdateTimeInSec = new Date(asset.last_asset_update).getTime() / 1000;
      const currentUpdateTimeInSec = new Date(this.assetUpdate.getWhen().toDate()).getTime() / 1000;
      const lastAndCurrentUpdateTimeDiff = currentUpdateTimeInSec - assetLastUpdateTimeInSec;
      console.log(`DIFFERENCE BETWEEN CURRENT AND LAST ASSET UPDATE: ${currentUpdateTimeInSec} - ${assetLastUpdateTimeInSec} =>`, lastAndCurrentUpdateTimeDiff);
      /*
       * If last time asset was updated 1 min before, only then it should be updated again (to avoid too many update requests for asset table)
       */
      if (lastAndCurrentUpdateTimeDiff > 60) {
        const assetUpdated = await updateAssetTemp(
          this.assetUpdate.getUnitTemperature(),
          this.assetUpdate.getUpTime(),
          this.assetUpdate.getWhen().toDate(),
          ids.assetId
        );
        console.log("Asset Updated: ", assetUpdated);
      }
      await this.queueAssetUpdateInfo(ids.assetId);

      await updateAssetLastActivity(
        this.assetUpdate.getWhen().toDate(),
        asset.id,
        asset.last_cloud_update
      );

      return true;
    } catch (err) {
      logger.error("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in assetUpdates handler..!!"
      );
    }
  }

  async getQueuePayload(assetId) {
    return {
      asset_temp: this.assetUpdate.getUnitTemperature(),
      timestamp: this.assetUpdate.getWhen().toDate(),
      uptime: this.assetUpdate.getUpTime(),
      asset_id: assetId,
      channel: "asset_update",
      type: "elastic_search-1",
    };
  }

  async queueAssetUpdateInfo(assetId) {
    let payload = await this.getQueuePayload(assetId);
    console.log("payload for elastic search :", payload);
    if (process.env.NODE_ENV !== "test") {
      await notificationHelper.sendNotification(payload);
      // await queueHelper.queueDetectedAnomaly(payload); // asset_update
    } else {
      logger.warn("  !!! Not sending the data to ES bcz of test env !!!");
    }
  }
}

exports.assetUpdatesService = new AssetUpdatesService();
