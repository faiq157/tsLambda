const {assetTypes} = require("../utils/constants");
const {getOrCreateAsset, updateAssetLastActivity} = require("../models/asset.model");
const {getRadioBySnapAddr, updateRadioInfo} = require("../models/radio.info.model");
const {addRadioConfig} = require("../models/radio.info.model");
const helpers = require("../utils/helpers/functions");
const {snappyHex} = require("../util");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");

class AssetRadioUpdatesService {
  async handler(net_ctrl_id, ncSnapAddr, pbUpdate) {
    try {
      console.log("In AssetRadioUpdatesService handler ..");
      this.assetRadioUpdate = pbUpdate;
      this.netCtrlId = net_ctrl_id;

      const snapAddr = this.assetRadioUpdate.getSnapAddr_asU8();
      const snapAddrStr = helpers.getSnapAddr(snapAddr);
      const when = this.assetRadioUpdate.getWhen().toDate();
      const radio_channel = this.assetRadioUpdate.getRadioChannel() || null;
      const radio_network_id = await snappyHex(
        this.assetRadioUpdate.getRadioNetworkId()
      ) || null;
      const radio_link_quality = this.assetRadioUpdate.getRadioLinkQuality() || null;
      const radio_polls_sent = this.assetRadioUpdate.getRadioPollsSent();
      const isNC = Buffer.compare(snapAddr, ncSnapAddr) == 0;

      if (radio_polls_sent !== "" && radio_link_quality && radio_link_quality !== "None") {
        const asset = await getOrCreateAsset(snapAddrStr, net_ctrl_id, isNC ? assetTypes.ASSET_TYPE_NC : null);

        const radioInfoRes = await getRadioBySnapAddr(snapAddrStr);
        if (radioInfoRes) {
          await updateRadioInfo(asset.id, this.assetRadioUpdate, radioInfoRes.id, snapAddrStr);
        } else {
          console.error("ERROR: Radio doesn't exist against snap_addr: ", {snap_addr: snapAddrStr});
        }

        if (radio_channel) {
          
          await addRadioConfig([radioInfoRes.id, radio_channel, radio_network_id, when]);  //add radio_config
        } else {
          console.log("INFO: Invalid radio_channel:", radio_channel, "in AssetRadioUpdatesService:", snapAddrStr);
        }
        await notificationHelper.sendRadioUpdatesToElasticSearch(this.assetRadioUpdate, radioInfoRes.id, snapAddrStr, asset.id, asset.device_type_id);
        await updateAssetLastActivity(when, asset.id, asset.last_cloud_update);

        return true;
      }
      console.log("No request process due to empty values");
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in assetRadioUpdates handler..!!"
      );
    }
  }
}

exports.assetRadioUpdatesService = new AssetRadioUpdatesService();
