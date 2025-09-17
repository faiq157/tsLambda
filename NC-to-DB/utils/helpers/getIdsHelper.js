const {
  NCTCMismatchException,
  RecordNotFoundException,
} = require("../customExceptions");
const {assetTypes} = require("../constants");
const {getOrCreateAsset, getAssetLinkedResourcesIds} = require("../../models/asset.model");
const { getSnapAddr } = require("../helpers/functions");
const { remoteCacheHelper } = require("../cache/remoteCacheHelper");
class GetIdsHelper {
  async getIds(tcSnapAddr, ncSnapAddr, net_ctrl_id) {
    console.log("In GetIds helper");

    return this.compareNCTCSnapAddr(tcSnapAddr, ncSnapAddr)
      .then(async () => {
        const result = await this.getSnapAddressAssetDetail(net_ctrl_id, ncSnapAddr, true);
        console.log("Log from .then of getIds():", result);
        return this.serializeNCResponse(result);
      })
      .catch(async (err) => {
        if (err.name == "NCTCMismatchException") {
          const result = await this.getSnapAddressAssetDetail(net_ctrl_id, tcSnapAddr, false);
          console.log("Log from .catch of getIds(): ", result);
          return this.serializeTCResponse(result);
        } else {
          console.log("Error in getIds, Rolling Back Database Changes..", err);
          throw err;
        }
      });
  }

  async compareNCTCSnapAddr(tcSnapAddr, ncSnapAddr) {
    if (Buffer.compare(tcSnapAddr, ncSnapAddr) == 0) {
      return true;
    } else {
      throw new NCTCMismatchException("NCTC snapAddr doesn't match");
    }
  }

  async getSnapAddressAssetDetail(netCtrlId, snapAddr, isNC) {
    let res;
    const snap_addr = getSnapAddr(snapAddr);
    try {
      //todo: get this information from cache instead of db
      //if not available then get this information from db & also update cache
      res = await remoteCacheHelper.getAssetEntitiesIds(snap_addr);
      if(!res) {
        const ids = await getAssetLinkedResourcesIds(isNC, snapAddr);
        if (!ids) {
          throw new RecordNotFoundException("No asset found against this snapAddr.");
        } else {
          const updateCache = await remoteCacheHelper.updateAssetEntitiesIds(snap_addr, ids);
          console.log("updateCache by getting ids from db  ",updateCache);
          return ids;
        }
      }
      return res;
    } catch (err) {
      if (err.name == "RecordNotFoundException") {
        console.log("getOrCreateAsset on RecordNotFoundException..");
        const asset = await getOrCreateAsset(snap_addr, netCtrlId, isNC ? assetTypes.ASSET_TYPE_NC : null);
        if (!asset) {
          throw new RecordNotFoundException(`No asset found against snapAddr: ${snap_addr}`);
        }
        const ids = await getAssetLinkedResourcesIds(isNC, snapAddr);
        if (!ids) {
          throw new RecordNotFoundException(`Asset Linked Resource IDs not found for snapAddr: ${snap_addr}`);
        }
        const updateCache = await remoteCacheHelper.updateAssetEntitiesIds(snap_addr, ids);
        console.warn("UPDATE CACHE RESPONSE: ", updateCache);
        return ids;
      } else {
        console.log("Error in getSnapAddressAssetDetail..", err);
        return err;
      }
    }
  }

  async serializeNCResponse(results) {
    return {
      assetId: results.asset_id,
      batteryId: results.battery_id,
      chargerId: results.charger_id,
      panelId: results.panel_id,
      radioId: results.radio_id,
    };
  }

  async serializeTCResponse(results) {
    return {
      assetId: results.asset_id,
      rackId: results.rack_id,
      batteryId: results.battery_id,
      chargerId: results.charger_id,
      panelId: results.panel_id,
      motorId: results.motor_id,
      radioId: results.radio_id,
    };
  }
}

exports.getIdsHelper = new GetIdsHelper();
