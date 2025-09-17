const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const helpers = require('../utils/helpers/functions');

class AssetRestartedService {
  async handler(pbUpdate) {
    // Update and the principal, needed in one of the queries
    try {
      console.log("In assetRestartedHandler ..");
      this.assetRestartedUpdate = pbUpdate;

      const snapAddr = this.assetRestartedUpdate.getSnapAddr_asU8();
      const snapAddrStr = helpers.getSnapAddr(snapAddr);
      const asset = await getAssetBySnapAddr(snapAddrStr);

      await updateAssetLastActivity(
        this.assetRestartedUpdate.getWhen().toDate(),
        asset.id,
        asset.last_cloud_update
      );
      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in assetRestartedUpdates handler..!!"
      );
    }
  }
}

exports.assetRestartedService = new AssetRestartedService();
