const db = require("../db");
const { exeQuery } = require("../pg");

class AssetWrongReportingService {
  async handler(payload) {
    this.payload = payload;
    try {
      if (this.payload.registered_NC !== null) {
        return await this.processEvent();
      } else {
        return await this.processNonAssociatedAssetsEvent();
      }
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error AssetWrongReporting handler..!!",
        err
      );
    }
  }
  async processNonAssociatedAssetsEvent() {
    const reportingNCAssetInfo = await this.getNCAssetInfo(
      this.payload.reporting_NC
    );
    const reportingNCAssetId = reportingNCAssetInfo.asset_id;
    console.log("R: ", reportingNCAssetId);
    let reportingNCName =
      reportingNCAssetInfo.name !== null
        ? reportingNCAssetInfo.name
        : "Network Controller";
    const assetInfo = await this.getAssetInfo();
    let assetName = assetInfo.name !== null ? assetInfo.name : "Asset";

    let title = reportingNCName +
      (" is reporting updates for an asset that has been previously assigned to another network controller. " +
        assetName) +
      (": " + this.payload.snap_addr);
    await this.addCloudEventLog(
      title,
      "ASSET_WRONG_REPORTING",
      reportingNCAssetId,
      "cloud_intelligence"
    );
    return true;
  }

  async processEvent() {
    const parentNCAssetInfo = await this.getNCAssetInfo(
      this.payload.registered_NC
    );
    const parentNCAssetId = parentNCAssetInfo.asset_id;
    console.log("P: ", parentNCAssetId);
    let parentNCName =
      parentNCAssetInfo.name !== null
        ? parentNCAssetInfo.name
        : "Network Controller";

    const reportingNCAssetInfo = await this.getNCAssetInfo(
      this.payload.reporting_NC
    );
    const reportingNCAssetId = reportingNCAssetInfo.asset_id;
    console.log("R: ", reportingNCAssetId);
    let reportingNCName =
      reportingNCAssetInfo.name !== null
        ? reportingNCAssetInfo.name
        : "Network Controller";
    const assetInfo = await this.getAssetInfo();
    let assetName = assetInfo.name !== null ? assetInfo.name : "Asset";

    let title =
      reportingNCName +
      (" is sending updates for an asset assigned to this site: " + assetName) +
      (": " + this.payload.snap_addr);
    await this.addCloudEventLog(
      title,
      "ASSET_WRONG_REPORTING",
      parentNCAssetId,
      "cloud_intelligence"
    );

    title =
      reportingNCName +
      (" is sending updates for an asset that hasn't been assigned to this site: " +
        assetName) +
      (": " + this.payload.snap_addr);
    await this.addCloudEventLog(
      title,
      "ASSET_WRONG_REPORTING",
      reportingNCAssetId,
      "cloud_intelligence"
    );
    return true;
  }

  async addCloudEventLog(title, eventName, asset_id, icon) {
    return await exeQuery(db.addCloudEventLogQuery, [
      eventName,
      20,
      this.payload.timestamp,
      asset_id,
      1,
      title,
      icon
    ], { writer: true });
  }

  async getAssetInfo() {
    const res = await exeQuery(
      `SELECT * FROM terrasmart.asset
      WHERE id = $1::UUID`,
      [this.payload.asset_id]
    );
    return res.rows[0];
  }
  async getNCAssetInfo(nc_id) {
    const res = await exeQuery(
      `SELECT asset_id,name FROM terrasmart.network_controller WHERE id = $1::UUID`,
      [nc_id]
    );
    console.log(
      `SELECT asset_id,name FROM terrasmart.network_controller WHERE id = $1::UUID`,
      nc_id
    );
    console.log(res.rows);
    return res.rows[0];
  }
}

exports.assetWrongReportingService = new AssetWrongReportingService();
