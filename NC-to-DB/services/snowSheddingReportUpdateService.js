
const { getSnapAddr } = require("../utils/helpers/functions");
const { addSnowSheddingReport } = require("../models/snow.shedding.model");
const { addSnowSheddingReportHistory } = require("../models/asset.history.model");
const { getRowId, getAssetBySnapAddr } = require("../models/asset.model");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { getContext } = require("../utils/lib/context");
const { SnowSheddingReportStatus, getSnowSheddingReportStatusStr } = require("../utils/constants");

class SnowSheddingReportUpdateService {
  async handler(pbUpdate) {
    console.log("SnowSheddingReportUpdateService Handler ..");

    this.snowSheddingReportUpdate = pbUpdate;
    this.snowSheddingReportUpdate.snapAddr = getSnapAddr(this.snowSheddingReportUpdate.getSnapAddr_asU8());

    const { snapAddr } = getContext();
    const reportDetail = {};

    for (const report of this.snowSheddingReportUpdate.getReportList()) {

      // console.log("Report ", report);

      const assets = [];
      const retried = [];

      for (const asset of report.getAssetsList()) {
        
        const assetSnapAddr = getSnapAddr(asset.getSnapAddr_asU8())
        const thisAssetDetail = await getAssetBySnapAddr(assetSnapAddr)
        if (thisAssetDetail?.repeater_only) {
          console.info("In SnowSheddingReportUpdateService Ignoring repeater update,", assetSnapAddr);
          continue
        }

        assets.push({
          "snap_address": getSnapAddr(asset.getSnapAddr_asU8()),
          "row_id": await getRowId(getSnapAddr(asset.getSnapAddr_asU8()))
        });
        retried.push(asset.getSnowSheddingRetries());
      }

      const key = `${getSnowSheddingReportStatusStr(report.getStatus())}`;
      reportDetail[key] = assets;
      if (report.getStatus() === SnowSheddingReportStatus.RETRIED) {
        reportDetail['retried_frequency'] = retried;
      }
    }
    reportDetail.delayed = this.snowSheddingReportUpdate.getDelayed();

    const epochInSec = Math.floor(new Date(this.snowSheddingReportUpdate.getWhen().toDate()).getTime() / 1000);

    const { flat } = await addSnowSheddingReportHistory(snapAddr, this.snowSheddingReportUpdate.getWhen().toDate(), reportDetail);
    await addSnowSheddingReport(snapAddr, epochInSec, flat);

    await notificationHelper.sendSnowSheddingReportUpdate(this.snowSheddingReportUpdate.getWhen().toDate(), flat);

    return true;
  }
}

exports.snowSheddingReportUpdateService = new SnowSheddingReportUpdateService();
