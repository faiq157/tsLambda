const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { getAssetBySnapAddr, updateAssetLastActivity } = require("../models/asset.model");
const { getProjectDetailsBySiteId } = require("../models/project.model");
const { getBatteryBySnapAddr, updateBatteryInfo } = require("../models/battery.model");
const helpers = require('../utils/helpers/functions');
const { getContext } = require("../utils/lib/context");

class BatteryUpdatesService {

  constructor() {
    this.battUpdate = null;
  }

  async handler(pbUpdate) {
    console.log("In BatteryUpdateServiceHandler ..");
    this.battUpdate = pbUpdate;
    this.snapAddr = pbUpdate.getTcSnapAddr_asU8();
    this.snapAddrStr = helpers.getSnapAddr(this.snapAddr);
    const { siteId } = getContext();
    const project = await getProjectDetailsBySiteId(siteId);

    const assetInfo = await getAssetBySnapAddr(this.snapAddrStr);
    if (!assetInfo) {
      console.error(`BatteryUpdateService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
      return;
    }

    const battery = await getBatteryBySnapAddr(this.snapAddrStr);
    if (!battery) {
      console.error(`BatteryUpdateService:: Battery Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
      return;
    }

    const wakeupPoc = await helpers.evaluateWakeupPOC(this.battUpdate, project, battery);
    this.battUpdate.newWakeupPoc = wakeupPoc.newWakeupPoc;
    this.battUpdate.newWakeupPocAt = wakeupPoc.newWakeupPocAt;
    await updateBatteryInfo(battery.id, this.battUpdate, this.snapAddrStr);

    // Elastic search notification function
    await notificationHelper.sendBatteryUpdatesToElasticSearch(
      this.battUpdate,
      this.snapAddrStr,
      assetInfo.id,
      assetInfo.device_type_id
    );
    await updateAssetLastActivity(
      this.battUpdate.getWhen().toDate(),
      assetInfo.id,
      assetInfo.last_cloud_update
    );

    return true;
  }

}

exports.batteryUpdatesService = new BatteryUpdatesService();
