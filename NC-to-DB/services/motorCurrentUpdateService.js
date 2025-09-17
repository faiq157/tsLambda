const { getSnapAddr } = require("../utils/helpers/functions");
const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { acquireLock } = require("../utils/lib/distributedLock");
const { updateFasttrakMotorCurrent } = require("../models/fasttrak.model");
const {updateMotorInfo} = require("../models/motor.model");
class MotorCurrentUpdateService {

  constructor() {
    this.mottorUpdate = null;
  }

  async handler(pbUpdate) {

    try {
      this.motorUpdate = pbUpdate;
      this.motorUpdate.snapAddr = getSnapAddr(this.motorUpdate.getSnapAddr_asU8());

      const assetInfo = await getAssetBySnapAddr(this.motorUpdate.snapAddr);
      if (!assetInfo) {
        console.error(`MotorCurrentService:: Asset Info doesn't exist against Snap Address: ${this.motorUpdate.snapAddr}`);
        return;
      }

      if (assetInfo?.repeater_only) {
        console.info("In MotorCurrentUpdateService Ignoring repeater update,", this?.motorUpdate?.snapAddr);
        return null
      }

      await updateMotorInfo(this.motorUpdate, this.motorUpdate.snapAddr);

      //update fasttrak detail if Fasttrak started
      await this.updateFasttrakReport(assetInfo);

      //send info to ES
      await this.sendMotorUpdateInfo(assetInfo.id);

      await updateAssetLastActivity(
        this.motorUpdate.getWhen().toDate(),
        assetInfo.id,
        assetInfo.last_cloud_update
      );

      return true;
    } catch (err) {
      throw new Error(
        "Operation not completed, error in MotorCurrentUpdateService handler..!!"
      );
    }
  }

  async updateFasttrakReport(assetInfo) {
    try {
      // console.log("updateFasttrakReport: ", assetInfo);
      if (this.motorUpdate.getTrackingStatus() && this.motorUpdate.getTrackingStatus() === 10 || assetInfo.reporting === "QC FASTTRAK" ||
        (process.env.NODE_ENV !== 'production' &&
          (this.motorUpdate.getTrackingStatus() && this.motorUpdate.getTrackingStatus() === 8 || assetInfo.reporting === "FASTTRAK"))) {
        //update fasttrak report buy checking tracking status
        await acquireLock(
          "locks:fasttrakreport:" + this.motorUpdate.snapAddr,
          3000,
          // Things to do while being in locked state
          async () => {
            await updateFasttrakMotorCurrent('peak_motor_inrush_current', this.motorUpdate.getPeakMotorInrushCurrent(), this.motorUpdate.snapAddr);
            await updateFasttrakMotorCurrent('peak_motor_current', this.motorUpdate.getPeakMotorCurrent(), this.motorUpdate.snapAddr);
            await updateFasttrakMotorCurrent('average_motor_current', this.motorUpdate.getAverageMotorCurrent(), this.motorUpdate.snapAddr);
          });
      }
    } catch (err) {
      console.error("Error in updateFasttrakReport ", err);
    }
  }

  async getQueuePayload(asset_id) {
    return {
      asset_id: asset_id,
      snap_addr: this.motorUpdate.snapAddr,
      timestamp: this.motorUpdate.getWhen().toDate(),
      peak_motor_inrush_current: this.motorUpdate.getPeakMotorInrushCurrent(),
      peak_motor_current: this.motorUpdate.getPeakMotorCurrent(),
      average_motor_current: this.motorUpdate.getAverageMotorCurrent(),
      ending_motor_current: this.motorUpdate.getEndingMotorCurrent(),
      channel: "motor_hist",
      type: "elastic_search-1",
    };
  }

  async sendMotorUpdateInfo(asset_id) {
    let payload = await this.getQueuePayload(asset_id);
    console.log(payload);
    if (process.env.NODE_ENV !== "test") {
      await notificationHelper.sendNotification(payload);
    } else {
      console.log("  !!! Not sending the data to ES bcz of test env !!!");
    }
  }
}

exports.motorCurrentUpdateService = new MotorCurrentUpdateService();
