const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { logger } = require("../utils/logger");

const { getSnapAddr } = require("../utils/helpers/functions");
const {updatePanelVoltageAndCurrent, updatePanelVoltageAndCurrentNew} = require("../models/panel.model");
class PanelServiceN {

  constructor() {
    this.panelUpdate = null;
  }

  async handler(pbUpdate) {
    try {
      console.log("In panelService handler ...");
      this.panelUpdate = pbUpdate;
      this.panelUpdate.snapAddr = getSnapAddr(this.panelUpdate.getTcSnapAddr_asU8());

      if (
        this.panelUpdate.getSolarVoltage() > 0 ||
        this.panelUpdate.getSolarCurrent() > 0 ||
        this.panelUpdate.getExternalInput2Voltage() > 0 ||
        this.panelUpdate.getExternalInput2Current() > 0
      ) {
        const res = await this.updatePanelCurrentAndVoltage(this.panelUpdate.snapAddr);
        console.log("Update Panel Resp:", res);

        await this.queuePanelUpdateInfo(this.panelUpdate.snapAddr);
      } else {

        const res = await this.updatePanelCurrentAndVoltageForZeroValues(this.panelUpdate.snapAddr);
        console.log("Update Panel Resp:", res);

        if (res) {
          await this.queuePanelUpdateInfo(this.panelUpdate.snapAddr);
        } else {
          console.log("Zero for all value already stored in db");
        }
      }

      return true;
    } catch (err) {
      console.log("Issue in panel service", err);
      //await panelService.handler(pbUpdate, pg, pgWrite);
      //logger.error("Rolling Back Database Changes..", err);
      throw new Error("Operation not completed error PanelService handler..!!");
    }
  }

  async updatePanelCurrentAndVoltage(snap_addr) {
    return updatePanelVoltageAndCurrent(snap_addr, [
      this.panelUpdate.getSolarVoltage(),
      this.panelUpdate.getSolarCurrent(),
      this.panelUpdate.getExternalInput2Voltage(),
      this.panelUpdate.getExternalInput2Current(),
      snap_addr,
    ]);
  }

  async updatePanelCurrentAndVoltageForZeroValues(snap_addr) {
    return updatePanelVoltageAndCurrentNew(snap_addr, [
      this.panelUpdate.getSolarVoltage(),
      this.panelUpdate.getSolarCurrent(),
      this.panelUpdate.getExternalInput2Voltage(),
      this.panelUpdate.getExternalInput2Current(),
      snap_addr
    ]);
  }

  async queuePanelUpdateInfo(snap_addr) {
    try {
      const assetInfo = await getAssetBySnapAddr(snap_addr);
      if (!assetInfo) {
        console.warn(`PanelService:: Asset Info doesn't exist against Snap Address: ${snap_addr}`);
        return;
      }

      let payload = await this.getQueuePayload(assetInfo.id);
      console.log("payload for Elastic Search :", payload);

      // await notificationHelper.sendNotification(payload);
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(payload);
        // await queueHelper.queueDetectedAnomaly(payload); // asset_solar_panel_hist
      } else {
        logger.warn("   !!! Not sending the data to ES bcz of test env !!!");
      }
      await updateAssetLastActivity(
        this.panelUpdate.getWhen().toDate(),
        assetInfo.id,
        assetInfo.last_cloud_update
      );
      return true;
    } catch (err) {
      logger.error("Error in queuePanelUpdateInfo(), ", err);
      throw err;
    }
  }

  async getQueuePayload(assetId) {
    try {
      return {
        solar_voltage: this.panelUpdate.getSolarVoltage(),
        solar_current: this.panelUpdate.getSolarCurrent(),
        external_input_voltage: this.panelUpdate.getExternalInput2Voltage(),
        external_input_current: this.panelUpdate.getExternalInput2Current(),
        timestamp: this.panelUpdate.getWhen().toDate(),
        snap_addr: this.panelUpdate.snapAddr,
        asset_id: assetId,
        channel: "asset_solar_panel_hist",
        type: "elastic_search-1",
      };
    } catch (err) {
      logger.error("Error in getQueuePayload(), ", err);
      throw err;
    }
  }
}

exports.panelServiceN = new PanelServiceN();
