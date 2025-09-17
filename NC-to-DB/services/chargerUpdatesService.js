const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const {updateChargerInfo, getChargerByAssetId, addChargerInfo} = require("../models/charger.model");
const helpers = require('../utils/helpers/functions');

class ChargerUpdatesService {
  async handler(pbUpdate) {
    // Update and the principal, needed in one of the queries
    try {
      console.log("In chargerUpdatesHandler ..");
      this.chargerUpdate = pbUpdate;

      this.snapAddr = this.chargerUpdate.getSnapAddr_asU8();
      this.snapAddrStr = helpers.getSnapAddr(this.snapAddr);
      let voltage = this.chargerUpdate.getVoltage();
      let current = this.chargerUpdate.getCurrent();

      //get asset info,
      // get charger info
      //if no charger then add it
      //if already exists update it
      const assetInfo = await getAssetBySnapAddr(this.snapAddrStr);
      if (!assetInfo) {
        console.warn(`ChargerUpdateService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
        return;
      }

      let charger = await getChargerByAssetId(assetInfo.id);
      if (charger) {
        await updateChargerInfo({voltage, current}, charger.id, this.snapAddrStr);
      } else {
        await addChargerInfo(assetInfo.id, voltage, current);
      }

      await updateAssetLastActivity(
        this.chargerUpdate.getWhen().toDate(),
        assetInfo.id,
        assetInfo.last_cloud_update
      );

      return true
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in chargerUpdates handler..!!"
      );
    }
  }
}

exports.chargerUpdatesService = new ChargerUpdatesService();
