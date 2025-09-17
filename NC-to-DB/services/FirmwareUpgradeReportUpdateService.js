
const { getSnapAddr } = require("../utils/helpers/functions");
const { assetTypes, cloudAlertMessages, TimelineEvents, AlertAndEventTitles } = require("../utils/constants")
const { getNetworkControllerBySnapAddr } = require("../models/network.controller.model")
const { removeScheduledFirmwareUpgrade, getSiteByNcSnapAddr } = require("../models/site.model")
const ActiveCloudAlerts= require("../models/cloudAlert.model")
const moment = require("moment");
const { createCloudEventLog } = require("../models/cloudEventLog.model")

class FirmwareUpgradeReportUpdateService {
  async handler(firmwareUpgradePbUpdate) {
    
    this.firmwareUpgradeReportUpdate = firmwareUpgradePbUpdate

    const firmwareUpgrade = {
      ncSnapAddr: getSnapAddr(this.firmwareUpgradeReportUpdate.getSnapAddr_asU8()),
      TimestampWhen:  moment(this.firmwareUpgradeReportUpdate.getWhen().toDate()).format(),
      report: {
        firmware: this.firmwareUpgradeReportUpdate.getReport().getFirmware(),
        startTime:  moment(this.firmwareUpgradeReportUpdate.getReport().getStartTime().toDate()).format(),
        attemptedList: JSON.stringify (this.firmwareUpgradeReportUpdate.getReport().getAttemptedList()), 
        succeededList: JSON.stringify(this.firmwareUpgradeReportUpdate.getReport().getSucceededList()), 
        failedList: this.firmwareUpgradeReportUpdate.getReport().getFailedList(), 
      } ,
      finished: this.firmwareUpgradeReportUpdate.getFinished()
    }

    console.log(`FirmwareUpgrade (${firmwareUpgrade.ncSnapAddr}) ${firmwareUpgrade?.finished ? "COMPLETED" : "IN_PROGRESS"}`, firmwareUpgrade);
    
    if (firmwareUpgrade?.finished) {
      await this.processScheduledUpgradeFinished(firmwareUpgrade.ncSnapAddr)
    }

    return {
      firmwareUpgrade: firmwareUpgrade?.finished ? "COMPLETED" : "IN_PROGRESS",
      ncSnapAddr: firmwareUpgrade.ncSnapAddr
    }
  }

  async processScheduledUpgradeFinished(ncSnapAddr){

    const nc = await getNetworkControllerBySnapAddr(ncSnapAddr);

    if (!nc) {
      console.log("Error: no nc found for processScheduledUpgradeFinished with nc snapAddr:", ncSnapAddr);
      return 
    }

    const asset = {
      id: nc.asset_id, /// network controller asset id
      asset_type: assetTypes.ASSET_TYPE_NC
    };

    // remove the alert of scheduled
    await ActiveCloudAlerts.removeCloudAlert( asset.id, cloudAlertMessages.autoFirmwareUpdateCompleted().eventName)

    const childAlert = await ActiveCloudAlerts.removeCloudAlertDetail(asset.id, cloudAlertMessages.autoFirmwareUpdateCompleted().eventName);

    if (childAlert?.cloud_alert_id) {
      // get parent alert by alert id
      const parentAlert = await ActiveCloudAlerts.getCloudAlertByCloudAlertID(childAlert.cloud_alert_id);
      if (parentAlert?.event_name === TimelineEvents.NC_COMMANDED_STATE && parentAlert?.title === AlertAndEventTitles.TRACKING_WITH_BACKTRACKING) {

        // Get cloud_alert_detail by cloud_alert_id (child alerts)
        const alertDetils = await ActiveCloudAlerts.getCloudAlertDetailByCloudAlertID(childAlert?.cloud_alert_id)
        if (alertDetils?.length == 0) { // if there is no child alert

          // If child alerts length is equal to 0, then delete parent alert
          await ActiveCloudAlerts.removeCloudAlert( asset.id,  TimelineEvents.NC_COMMANDED_STATE);
        }
      }
    }

    // add timeline event that scheduled firmware upgrade is canceled
    await this.createFirmwareAutoUpdateCloudEventLog(asset)

    // get site by nc 
    const site = await getSiteByNcSnapAddr(ncSnapAddr);

    if (site) {
      console.log(`deleting the firmware upgrade from db, as scheduled firmware upgrade COMPLETED, Details: ${{ ncSnapAddr: ncSnapAddr, asset: asset, ...site}}`);
      // remove the firmware upgrade from db 
      await removeScheduledFirmwareUpgrade(site?.id)
    }else{
      console.log(`FirmwareUpgrade: cannot remove Scheduled FirmwareUpgrade: site not found for ncSnapAddr: ${ncSnapAddr}`);
    }

    return true
  }

  createFirmwareAutoUpdateCloudEventLog(ncAsset) { 

    const eventOBj ={
      assetId: ncAsset.id,
      name: cloudAlertMessages.autoFirmwareUpdateCompleted().eventName,
      timestamp: new Date(),
      title: cloudAlertMessages.autoFirmwareUpdateCompleted().title,
      message: cloudAlertMessages.autoFirmwareUpdateCompleted().message,
      icon: "setting_gray",
      userName : "",
      userEmail: "",
      params:  { command: cloudAlertMessages.autoFirmwareUpdateCompleted().stage.COMPLETED },
    }
    return createCloudEventLog(eventOBj)
  }

}

exports.firmwareUpgradeReportUpdateService = new FirmwareUpgradeReportUpdateService();
