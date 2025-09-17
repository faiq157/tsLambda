const { getSnapAddr } = require("../utils/helpers/functions");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { getProjectIdByNcAssetId } = require("../models/project.model");
const { upsertIrradianceByProjID, addIrradianceHistory } = require("../models/weatherIrradiance.model");

class IrradianceUpdateService {

  async handler(net_ctrl_id, nc_asset_Id, nc_snap_addr, pbUpdate) {

    this.update = pbUpdate;
    this.snap_addr = getSnapAddr(nc_snap_addr);
    const timestamp = this.update.getWhen().toDate();
    const epochTime = Math.round(new Date(timestamp).getTime()/1000);

    const { project_id: pId } = await getProjectIdByNcAssetId(nc_asset_Id);
    const params = [this.update.getSiteGhi(), this.update.getSitePoa(), this.snap_addr, pId];
    await upsertIrradianceByProjID([epochTime, ...params]);
    await addIrradianceHistory([timestamp, ...params]);
    await notificationHelper.sendIrradianceHistoryToElasticSearch(pbUpdate, nc_asset_Id, this.snap_addr, pId);

    return true;
  }
}

exports.irradianceUpdateService = new IrradianceUpdateService();
