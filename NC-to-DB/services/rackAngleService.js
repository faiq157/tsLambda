const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { queueHelper } = require("../utils/helpers/QueueHelper");
const remoteCache = require("../utils/cache/remoteCache")
const moment = require("moment");
const flatten = require("flat");
const {prefixes} = require("../models/asset.history.model");
const { getIdsHelper } = require("../utils/helpers/getIdsHelper");
const { getSnapAddr } = require("../utils/helpers/functions");
const { acquireLock, acquireMLLock } = require("../utils/lib/distributedLock");
const { updateFasttrakCompletedStatus } = require("../models/fasttrak.model");
const {getRackHistBySnapAddrAndTimestamp} = require("../models/asset.history.model");
const {updateRack, getRackBySnapAddr} = require("../models/rack.model");
const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const {getProjectDetailsByNcId} = require("../models/project.model");
const {checkAnomalyConfigAndProcessData} = require("../utils/lib/mlDataProcessing");
class RackAngleService {
  async handler(netCtrlId, ncSnapAddr, pbUpdate) {
    try {
      console.log("In RackAngleService Handler ..");
      this.rackAngleUpdates = pbUpdate;

      let tcSnapAddr = this.rackAngleUpdates.getTcSnapAddr_asU8();
      this.rackAngleUpdates.snapAddr = getSnapAddr(tcSnapAddr);
      const snapAddrStr = this.rackAngleUpdates.snapAddr;

      // if the asset is repeater // ignore this update
      const assetDetail = await getAssetBySnapAddr(snapAddrStr);
      if (assetDetail?.repeater_only) {
        console.info("In RackAngleService Ignoring repeater update,", snapAddrStr);
        return null
      }

      const project = await getProjectDetailsByNcId(netCtrlId);

      await getIdsHelper.getIds(tcSnapAddr, ncSnapAddr, netCtrlId);

      for (const angleUpdate of this.rackAngleUpdates.getAnglesList()) {
        const assetInfo_res = await getAssetBySnapAddr(snapAddrStr);
        const rackInfo = await getRackBySnapAddr(snapAddrStr);

        const rackEvent = await this.insertRackEventInCacheAndReturn(snapAddrStr, angleUpdate);

        //todo update values in rack table
        const rackUpdateInfo = await notificationHelper.sendRackUpdatesToElasticSearch(angleUpdate, snapAddrStr, assetInfo_res.id, assetInfo_res.device_type_id);
        const updateRackInfo = await updateRack(angleUpdate, snapAddrStr);
        if (updateRackInfo) {
          if (!assetInfo_res.repeater_only) {
            await acquireMLLock(snapAddrStr, () => {
              return checkAnomalyConfigAndProcessData(project, assetInfo_res, rackEvent);
            });
          }
          if (angleUpdate.getTrackingStatus() === 10 || (process.env.NODE_ENV !== 'production' && angleUpdate.getTrackingStatus() === 8)) {
            await this.updateFasttrakReport(updateRackInfo,
              angleUpdate.getWhen().toDate(),
              angleUpdate.getRequestedAngle(),
              angleUpdate.getCurrentAngle(),
              angleUpdate.getTrackingStatus()
            );
          }
          await queueHelper.queueDetectedAnomaly(rackUpdateInfo); // rack_hist
          await updateAssetLastActivity(angleUpdate.getWhen().toDate(), assetInfo_res.id, assetInfo_res.last_cloud_update);
        } else {
          console.warn("Warning: Out of order processing.", JSON.stringify({'oldRackInfo': rackInfo, 'newRackInfo': [
            angleUpdate.getCurrentAngle(),
            angleUpdate.getRequestedAngle(),
            angleUpdate.getCommandedState(),
            angleUpdate.getTrackingStatus(),
            angleUpdate.getCommandedStateDetail(),
            angleUpdate.getMotorCurrent(),
            angleUpdate.getWhen().toDate(),
            angleUpdate.getPanelIndex(),
            angleUpdate.getPanelCommandState(),
            snapAddrStr
          ]}));
        }
      }

      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in RackAngleService handler..!!"
      );
    }
  }

  async insertRackEventInCacheAndReturn (snapAddr, angleUpdate) {
    const payload = {
      [prefixes.PREFIX_ASSET]: {
        tracking_status: angleUpdate.getTrackingStatus(),
        panel_index: angleUpdate.getPanelIndex(),
        panel_commanded_state: angleUpdate.getPanelCommandState()
      },
      [prefixes.PREFIX_TRACKING]: {
        mode: angleUpdate.getCommandedState(),
        mode_detail: angleUpdate.getCommandedStateDetail()
      },
      [prefixes.PREFIX_MOTOR]: {
        current: angleUpdate.getMotorCurrent()
      },
      [prefixes.PREFIX_RACK]: {
        current_angle: angleUpdate.getCurrentAngle(),
        requested_angle: angleUpdate.getRequestedAngle()
      }
    };
    const flatPayload = flatten(payload, { safe: true });
    const rackEvent = {
      timestamp: moment(angleUpdate.getWhen().toDate()).format(),
      snap_addr: snapAddr,
      data: flatPayload
    };
    await remoteCache.insertRackHist(rackEvent, getRackHistBySnapAddrAndTimestamp);
    return rackEvent;
  }

  async updateFasttrakReport(rackInfo, timestamp, target_angle, current_angle, tracking_status) {
    console.log(
      `In updateFasttrakReport()`,
      rackInfo,
      this.rackAngleUpdates.snapAddr,
      timestamp,
      target_angle,
      current_angle,
      tracking_status
    );
    if (target_angle === 60) {
      if (rackInfo.last_requested_angle <= -58) {
        console.log('Updating plus60_completed = false for ', this.rackAngleUpdates.snapAddr);
        await acquireLock(
          "locks:fasttrakreport:" + this.rackAngleUpdates.snapAddr,
          3000,
          // Things to do while being in locked state
          async () => {
            await updateFasttrakCompletedStatus(60, false, timestamp, this.rackAngleUpdates.snapAddr);
          });
      } else if (current_angle >= 57) {
        console.log('Updating plus60_completed = true for ', this.rackAngleUpdates.snapAddr);
        await acquireLock(
          "locks:fasttrakreport:" + this.rackAngleUpdates.snapAddr,
          3000,
          // Things to do while being in locked state
          async () => {
            await updateFasttrakCompletedStatus(60, true, timestamp, this.rackAngleUpdates.snapAddr);
          });
      }
    } else if (target_angle === -60) {
      if (rackInfo.last_requested_angle >= 58) {
        console.log('Updating minus60_completed = false for ', this.rackAngleUpdates.snapAddr);
        await acquireLock(
          "locks:fasttrakreport:" + this.rackAngleUpdates.snapAddr,
          3000,
          // Things to do while being in locked state
          async () => {
            await updateFasttrakCompletedStatus(-60, false, timestamp, this.rackAngleUpdates.snapAddr);
          });
      } else if (current_angle <= -57) {
        console.log('Updating minus60_completed = true for ', this.rackAngleUpdates.snapAddr);
        await acquireLock(
          "locks:fasttrakreport:" + this.rackAngleUpdates.snapAddr,
          3000,
          // Things to do while being in locked state
          async () => {
            await updateFasttrakCompletedStatus(-60, true, timestamp, this.rackAngleUpdates.snapAddr);
          });
      }
    }
  }

}

exports.rackAngleService = new RackAngleService();
