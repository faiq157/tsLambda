const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const utils = require("../utils");
const { getS3EmailAssetsUrl, isLinkedRow } = require("../utils/libs/functions");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const { individualRCAlertService } = require("./individualRCAlertService");
const { notificationService } = require("./common/notificationService");
const { CloudAlertsHelperModel } = require("../models/cloudAlertsHelper.model");
const { getAssetAndSiteLayoutByAssetId } = require("../models/asset.model");
const { getDeviceTypeNameFromAssetType } = require("../utils/constants");

class AssetConnectionHistService {
  async handler(client, pgWrite, payload) {
    this.client = client;
    this.pgWrite = pgWrite;
    this.payload = payload;
    try {
      const res = await this.processEvent();
      console.log("Calling updateCommandStatus..!");
      await individualRCAlertService.updateCommandStatus(
        {
          assetId: this.payload.asset_id,
          timestamp: this.payload.last_asset_updated,
        },
        client,
        pgWrite
      );
      return res;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error AssetConnectionHistService handler..!!",
        err
      );
    }
  }

  async processEvent() {
    try {
      console.log("Processing Asset Connection Event ");
      //handle out of order offline
      const is_new = true || await this.checkNewEvent();
      if (is_new) {
        console.log("Latest Update");
        //get asset info

        //check if alert exists?
        const checkAlert = await this.getActiveAlert("ASSET-OFFLINE");
        const lastStatus = await this.getLastStatus();
        const isStateChanged = lastStatus.check;
        const checkFCSAlert = await this.getActiveAlert("ASSET-FCS");
        const checkFasttrackAlert = await this.getActiveAlert("ASSET-FASTTRAK");
        const checkRemoteQaQcAlert = await this.getActiveAlert("ASSET-REMOTE-QC");
        const checkUnknownAlert = await this.getActiveAlert("ASSET-UNKNOWN");
        const checkUMCAlert = await this.getActiveAlert(
          "ASSET-UNDER_MANUAL_CONTROL"
        );
        const checkQCFasttrackAlert = await this.getActiveAlert(
          "ASSET-QC-FASTTRAK"
        );
        let isAnyAlert = false;

        let commandInfo = await this.getCommandInfo();
        console.log('getting connectLinkedRow data')
       const connectLinkedRow = await getAssetAndSiteLayoutByAssetId(this.client, this.payload.asset_id)
       console.log('connectLinkedRow')
       console.log(connectLinkedRow)
       const {
        linkRowType,
        linkRowRef,
        row_id,
        row_name,
        shorthand_name,
        asset_name,
        device_type
      } = connectLinkedRow

        if (
          checkAlert.length === 0 &&
          this.payload.connected_state === "OFFLINE" &&
          isStateChanged
        ) {
          const assetInfo = await this.getAssetInfo(commandInfo, "OFFLINE");

          const notificationsOptions = {
            isNotify: assetInfo?.is_notify,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: this.payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr: this.payload.snap_addr,
            assetId: this.payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          console.log("CASE OFFLINE");
          console.log('linkRowType')
          console.log( linkRowType)
          console.log('device_type')
          console.log(device_type)
          let icon = await this.getIcon(assetInfo, "OFFLINE");
          let title = await this.getTitle(assetInfo, "OFFLINE");
          //adding linked row offline alert

          if (isLinkedRow(linkRowType, linkRowRef,  device_type)) {
           await CloudAlertsHelperModel.addRowOfflineAlert(
            this.pgWrite,
             leaderInfo,
             childInfo,
             true,
             notificationsOptions
           );
         } else {
           //add alert
           await this.addCloudAlert(title, icon, "ASSET-OFFLINE");
           //add event log
           await this.addEventLog(title, icon, "ASSET-OFFLINE");
           //send notification
           assetInfo.connected_state = this.payload.connected_state;
           assetInfo.last_disconnected = this.payload.last_disconnected;
           assetInfo.icon_name = icon + "_48x48.png";
           if (assetInfo.is_notify)
             await this.processAssetsConnectionNotifications(
               assetInfo,
               false,
               commandInfo
             );
         }
          if (checkFCSAlert.length > 0) {
            console.log('Clearing FCS alert', checkFCSAlert)
            await this.clearAlert(checkFCSAlert[0].id);
          }
          if (checkUnknownAlert.length > 0) {
            await this.clearAlert(checkUnknownAlert[0].id);
          }
        } else if (this.payload.connected_state === "ONLINE") {
          console.log("CASE ONLINE");
          let isLastUMC = false;
          console.log(commandInfo);
          if (commandInfo !== null) {
            if (commandInfo.lastStatus !== null) {
              const assetInfo = await this.getAssetInfo(
                commandInfo,
                "MANUAL CONTROL"
              );
              let icon = await this.getIcon(assetInfo, "ONLINE");
              isLastUMC = true;
              console.log("Stopping under mandual control");
              let title = await this.getTitle(assetInfo, "MANUAL CONTROL");

              if (commandInfo.lastStatus === "Virtual EStop") {
                title = title + " Virtual Emergency Stop Disengaged";
                icon = "mode_stop_dis";
              } else {
                title = title + " Manual Row Control Stop";
              }

              if (isLinkedRow(linkRowType, linkRowRef,  device_type)) {
                const notificationsOptions = {
                  isNotify: assetInfo?.is_notify,
                  locationLat: assetInfo?.location_lat ,
                  locationLng: assetInfo?.location_lng,
                  created: this.payload.timestamp,
                  deviceType: assetInfo?.device_type,
                  siteId: assetInfo?.site_id,
                  siteName: assetInfo?.site_name,
                  multipleSites: assetInfo?.multipleSites,
                  projectName: assetInfo?.project_name,
                  projectLocation: assetInfo?.project_location,
                };

                const leaderInfo = {
                  row_id,
                  row_name,
                  shorthand_name,
                  asset_name,
                  snap_addr: this.payload.snap_addr,
                  assetId: this.payload.asset_id
                }

                const childInfo = {
                  row_id: linkRowRef
                }

                await CloudAlertsHelperModel.addManualControlStopAlert(
                this.pgWrite,
                  leaderInfo,
                  childInfo,
                  commandInfo.lastStatus,
                  true,
                  { user_name: commandInfo.user_name, email: commandInfo.email },
                  notificationsOptions
                );
              }
              else {
              await this.addEventLog(
                title,
                icon,
                "ASSET-UNDER_MANUAL_CONTROL_STOP",
                { user_name: commandInfo.user_name, email: commandInfo.email }
              );}

              if (checkAlert.length > 0) {
                //clear alert
                isAnyAlert = true;
                await this.clearAlert(checkAlert[0].id);
              }
              if (checkFCSAlert.length > 0) {
                isAnyAlert = true;
                await this.clearAlert(checkFCSAlert[0].id);
              }
              if (checkUMCAlert.length > 0) {
                isAnyAlert = true;
                await this.clearAlert(checkUMCAlert[0].id);
              }
              assetInfo.connected_state = this.payload.connected_state;
              assetInfo.last_connected = this.payload.last_connected;
              assetInfo.icon_name = icon + "_48x48.png";
              if (assetInfo.is_notify && !isLinkedRow(linkRowType, linkRowRef,  device_type))
                await this.processAssetsConnectionNotifications(
                  assetInfo,
                  true,
                  commandInfo
                );
            }
          }
          /*if (checkRemoteQaQcAlert.length > 0) {
            console.log("INSIDE Remote QC FT..!");
            const assetInfo = await this.getAssetInfo(commandInfo, "REMOTE QC");
            //Handle RemoteQAQC Stop scenario on Online
            if (checkRemoteQaQcAlert[0] && checkRemoteQaQcAlert[0].length) {
              await this.clearAlert(checkRemoteQaQcAlert[0].id);
            }
            await this.clearAlert(checkRemoteQaQcAlert[0].id); //add event log for Remote QC Stop
            if (checkAlert.length > 0) {
              //clear alert
              isAnyAlert = true;
              await this.clearAlert(checkAlert[0].id);
            }
            let icon = await this.getIcon(assetInfo, "REMOTE QC");
            let title = await this.getTitle(assetInfo, "REMOTE QC");
            title = `${title} Remote QC Stop`;
            await this.addEventLog(title, icon, "ASSET-REMOTE-QC_STOP");
            //send stop Remote QC Notifications
            //send notification
            assetInfo.connected_state = this.payload.connected_state;
            assetInfo.last_connected = this.payload.last_connected;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify)
              await this.processRemoteQAQCNotification(assetInfo, true);
          } else*/
          if (checkFasttrackAlert.length > 0) {
            console.log("INSIDE QA FT..!");
            const assetInfo = await this.getAssetInfo(commandInfo, "FASTTRAK");
            //Handle FastTrak Disconnected scenario on Online
            if (checkFasttrackAlert[0] && checkFasttrackAlert[0].length) {
              await this.clearAlert(checkQCFasttrackAlert[0].id);
            }
            await this.clearAlert(checkFasttrackAlert[0].id); //add event log for FastTrak Disconnected
            if (checkAlert.length > 0) {
              //clear alert
              isAnyAlert = true;
              await this.clearAlert(checkAlert[0].id);
            }
            let icon = await this.getIcon(assetInfo, "FASTTRAK");
            let title = await this.getTitle(assetInfo, "FASTTRAK");
            title = `${title} FastTrak Disconnected`;
            if (isLinkedRow(linkRowType, linkRowRef,  device_type)) {
              const notificationsOptions = {
                isNotify: assetInfo?.is_notify,
                locationLat: assetInfo?.location_lat ,
                locationLng: assetInfo?.location_lng,
                created: this.payload.timestamp,
                deviceType: assetInfo?.device_type,
                siteId: assetInfo?.site_id,
                siteName: assetInfo?.site_name,
                multipleSites: assetInfo?.multipleSites,
                projectName: assetInfo?.project_name,
                projectLocation: assetInfo?.project_location,
              };

              const leaderInfo = {
                row_id,
                row_name,
                shorthand_name,
                asset_name,
                snap_addr: this.payload.snap_addr,
                assetId: this.payload.asset_id
              }

              const childInfo = {
                row_id: linkRowRef
              }

              await CloudAlertsHelperModel.addRowFasttrakStopAlert(
              this.pgWrite,
                leaderInfo,
                childInfo,
                true,
                notificationsOptions
              );
            }else{
            await this.addEventLog(title, icon, "ASSET-UNDER_FASTTRAK_STOP");}
            //send stop FastTrack Notifications
            //send notification
            assetInfo.connected_state = this.payload.connected_state;
            assetInfo.last_connected = this.payload.last_connected;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify && !isLinkedRow(linkRowType, linkRowRef,  device_type))
              await this.processFastTrakNotification(assetInfo, true);
          } else if (checkQCFasttrackAlert.length > 0) {
            console.log("INSIDE QC FT..!");

            const assetInfo = await this.getAssetInfo(commandInfo, "FASTTRAK");
            //Handle FastTrak Disconnected scenario on Online
            await this.clearAlert(checkQCFasttrackAlert[0].id);
            if (checkQCFasttrackAlert[0] && checkQCFasttrackAlert[0].length) {
              await this.clearAlert(checkQCFasttrackAlert[0].id);
            }

            if (checkAlert.length > 0) {
              //clear alert
              isAnyAlert = true;
              await this.clearAlert(checkAlert[0].id);
            }

            //add event log for FastTrak Disconnected
            let icon = await this.getIcon(assetInfo, "FASTTRAK");
            let title = await this.getTitle(assetInfo, "FASTTRAK");
            title = `${title} (QC)FastTrak Disconnected`;
            if (isLinkedRow(linkRowType, linkRowRef,  device_type)) {
              const notificationsOptions = {
                isNotify: assetInfo?.is_notify,
                locationLat: assetInfo?.location_lat ,
                locationLng: assetInfo?.location_lng,
                created: this.payload.timestamp,
                deviceType: assetInfo?.device_type,
                siteId: assetInfo?.site_id,
                siteName: assetInfo?.site_name,
                multipleSites: assetInfo?.multipleSites,
                projectName: assetInfo?.project_name,
                projectLocation: assetInfo?.project_location,
              };

              const leaderInfo = {
                row_id,
                row_name,
                shorthand_name,
                asset_name,
                snap_addr: this.payload.snap_addr,
                assetId: this.payload.asset_id
              }

              const childInfo = {
                row_id: linkRowRef
              }

              await CloudAlertsHelperModel.addRowQCFasttrakStopAlert(
              this.pgWrite,
                leaderInfo,
                childInfo,
                true,
                notificationsOptions
              );
            }else{
            await this.addEventLog(title, icon, "ASSET-UNDER_QC_FASTTRAK_STOP");}
            //send stop FastTrack Notifications
            //send notification
            assetInfo.connected_state = this.payload.connected_state;
            assetInfo.last_connected = this.payload.last_connected;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify && !isLinkedRow(linkRowType, linkRowRef,  device_type))
              await this.processFastTrakNotification(assetInfo, true, true);
          } else if (!isLastUMC) {
            console.log("INSIDE QA isLastUMC..! ", checkAlert);

            const assetInfo = await this.getAssetInfo(commandInfo, "ONLINE");
            let title = await this.getTitle(assetInfo, "ONLINE");
            let icon = await this.getIcon(assetInfo, "ONLINE");
            let isAnyAlert = false;
            if (checkAlert.length > 0) {
              //clear alert
              isAnyAlert = true;
              await this.clearAlert(checkAlert[0].id);
            }

            if (checkFCSAlert.length > 0) {
              isAnyAlert = true;
              await this.clearAlert(checkFCSAlert[0].id);
            }
            if (checkUMCAlert.length > 0) {
              isAnyAlert = true;
              await this.clearAlert(checkUMCAlert[0].id);
            }

            if (checkUnknownAlert.length > 0) {
              isAnyAlert = true;
              await this.clearAlert(checkUnknownAlert[0].id);
            }
            if (isAnyAlert) {
              //add event log
              if (isLinkedRow(linkRowType, linkRowRef,  device_type)) {
                const notificationsOptions = {
                  isNotify: assetInfo?.is_notify,
                  locationLat: assetInfo?.location_lat ,
                  locationLng: assetInfo?.location_lng,
                  created: this.payload.timestamp,
                  deviceType: assetInfo?.device_type,
                  siteId: assetInfo?.site_id,
                  siteName: assetInfo?.site_name,
                  multipleSites: assetInfo?.multipleSites,
                  projectName: assetInfo?.project_name,
                  projectLocation: assetInfo?.project_location,
                };

                const leaderInfo = {
                  row_id,
                  row_name,
                  shorthand_name,
                  asset_name,
                  snap_addr: this.payload.snap_addr,
                  assetId: this.payload.asset_id
                }

                const childInfo = {
                  row_id: linkRowRef
                }

                await CloudAlertsHelperModel.addRowOnlineAlert(
                this.pgWrite,
                  leaderInfo,
                  childInfo,
                  true,
                  notificationsOptions
                );
              }else{
              await this.addEventLog(title, icon, "ASSET-ONLINE");}

              //send notification
              assetInfo.connected_state = this.payload.connected_state;
              assetInfo.last_connected = this.payload.last_connected;
              assetInfo.icon_name = icon + "_48x48.png";
              if (assetInfo.is_notify && !isLinkedRow(linkRowType, linkRowRef,  device_type))
                await this.processAssetsConnectionNotifications(
                  assetInfo,
                  false,
                  commandInfo
                );
            }
          }
        } else if (
          checkFCSAlert.length === 0 &&
          this.payload.connected_state === "FCS" &&
          isStateChanged
        ) {
          const assetInfo = await this.getAssetInfo(commandInfo, "FCS");
          console.log("FCS CASE");

          const notificationsOptions = {
            isNotify: assetInfo?.is_notify,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: this.payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr: this.payload.snap_addr,
            assetId: this.payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          let icon = await this.getIcon(assetInfo, "ONLINE");
          let title = await this.getTitle(assetInfo, "FCS");
          if (isLinkedRow(linkRowType, linkRowRef, device_type)) {
            await CloudAlertsHelperModel.addRowFcsAlert(
              this.pgWrite,
              leaderInfo,
              childInfo,
              true,
              notificationsOptions
            );
          } else {
            //add alert
            await this.addCloudAlert(title, icon, "ASSET-FCS");
            //add event log
            await this.addEventLog(title, icon, "ASSET-FCS");
            //send notification
            assetInfo.connected_state = this.payload.connected_state;
            assetInfo.last_disconnected = this.payload.last_disconnected;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify)
              await this.processAssetsConnectionNotifications(
                assetInfo,
                false,
                commandInfo
              );
          }
          if (checkAlert.length > 0) await this.clearAlert(checkAlert[0].id);
          if (checkUnknownAlert.length > 0)
            await this.clearAlert(checkUnknownAlert[0].id);
          if (checkUMCAlert.length > 0) {
            await this.clearAlert(checkUMCAlert[0].id);
          }
        } else if (
          checkFasttrackAlert.length === 0 &&
          this.payload.connected_state === "FASTTRAK" &&
          isStateChanged
        ) {
          const assetInfo = await this.getAssetInfo(commandInfo, "FASTTRAK");
          console.log("FastTraK CASE");

          const notificationsOptions = {
            isNotify: assetInfo?.is_notify,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: this.payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr: this.payload.snap_addr,
            assetId: this.payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          let icon = await this.getIcon(assetInfo, "FASTTRAK");
          let title = await this.getTitle(assetInfo, "FASTTRAK");
          title = `${title} FastTrak Connected`;

          if (isLinkedRow(linkRowType, linkRowRef, device_type)) {
            await CloudAlertsHelperModel.addRowFasttrakAlert(
              this.pgWrite,
              leaderInfo,
              childInfo,
              true,
              notificationsOptions
            );
          } else {
            //add alert
            await this.addCloudAlert(title, icon, "ASSET-FASTTRAK");
            //add event log
            await this.addEventLog(title, icon, "ASSET-FASTTRAK");
            //send notification
            assetInfo.connected_state = this.payload.connected_state;
            assetInfo.last_disconnected = this.payload.last_disconnected;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify)
              await this.processFastTrakNotification(assetInfo, false);
          }

          if (checkAlert.length > 0) await this.clearAlert(checkAlert[0].id);
          if (checkUnknownAlert.length > 0)
            await this.clearAlert(checkUnknownAlert[0].id);
          if (checkFCSAlert.length > 0) {
            isAnyAlert = true;
            await this.clearAlert(checkFCSAlert[0].id);
          }
        } else if (
          checkQCFasttrackAlert.length === 0 &&
          this.payload.connected_state === "QC FASTTRAK" &&
          isStateChanged
        ) {
          const assetInfo = await this.getAssetInfo(commandInfo, "FASTTRAK");
          console.log("QC FASTTRAK Case");

          const notificationsOptions = {
            isNotify: assetInfo?.is_notify,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: this.payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr: this.payload.snap_addr,
            assetId: this.payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }

          let icon = await this.getIcon(assetInfo, "FASTTRAK");
          let title = await this.getTitle(assetInfo, "FASTTRAK");
          title = `${title} (QC)FastTrak Connected`;

         if (isLinkedRow(linkRowType, linkRowRef, device_type)) {
            await CloudAlertsHelperModel.addRowQCFasttrakAlert(
              this.pgWrite,
              leaderInfo,
              childInfo,
              true,
              notificationsOptions
            );
          } else {
            //add alert
            await this.addCloudAlert(title, icon, "ASSET-QC-FASTTRAK");
            //add event log
            await this.addEventLog(title, icon, "ASSET-QC-FASTTRAK");
            //send notification
            assetInfo.connected_state = this.payload.connected_state;
            assetInfo.last_disconnected = this.payload.last_disconnected;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify)
              await this.processFastTrakNotification(assetInfo, false, true);
          }

          if (checkAlert.length > 0) await this.clearAlert(checkAlert[0].id);
          if (checkUnknownAlert.length > 0)
            await this.clearAlert(checkUnknownAlert[0].id);
          if (checkFCSAlert.length > 0) {
            isAnyAlert = true;
            await this.clearAlert(checkFCSAlert[0].id);
          }
        }
        else if (
          checkRemoteQaQcAlert.length === 0 &&
          this.payload.connected_state === "REMOTE QC" &&
          isStateChanged
        ) {
          console.log('Inside remote QC...');
          //if (checkAlert.length > 0) await this.clearAlert(checkAlert[0].id);
          /*const assetInfo = await this.getAssetInfo(commandInfo, "REMOTE QC");
          console.log("REMOTE QC Case");
          let icon = await this.getIcon(assetInfo, "REMOTE QC");
          let title = await this.getTitle(assetInfo, "REMOTE QC");
          title = `${title} Remote QC Start`;
          //add alert
          await this.addCloudAlert(title, icon, "ASSET-REMOTE-QC");
          //add event log
          await this.addEventLog(title, icon, "ASSET-REMOTE-QC");
          //send notification
          assetInfo.connected_state = this.payload.connected_state;
          assetInfo.last_disconnected = this.payload.last_disconnected;
          assetInfo.icon_name = icon + "_48x48.png";
          if (assetInfo.is_notify)
            await this.processRemoteQAQCNotification(assetInfo, false);

          if (checkAlert.length > 0) await this.clearAlert(checkAlert[0].id);
          if (checkUnknownAlert.length > 0)
            await this.clearAlert(checkUnknownAlert[0].id);
          if (checkFCSAlert.length > 0) {
            isAnyAlert = true;
            await this.clearAlert(checkFCSAlert[0].id);
          }*/
        }
        else if (
          checkUnknownAlert.length === 0 &&
          this.payload.connected_state === "UNKNOWN" &&
          isStateChanged
        ) {
          console.log("UNKNOWN CASE");
        } else if (
          checkUMCAlert.length === 0 &&
          this.payload.connected_state === "MANUAL CONTROL" &&
          isStateChanged
        ) {
          console.log("MANUAL CONTROL CASE ", commandInfo);
          if (
            checkFasttrackAlert.length > 0 ||
            checkQCFasttrackAlert.length > 0
          ) {
            const assetInfo = await this.getAssetInfo(commandInfo, "FASTTRAK");
            //Handle FastTrak Disconnected case when in manual control
            let icon = await this.getIcon(assetInfo, "FASTTRAK");
            let title = await this.getTitle(assetInfo, "FASTTRAK");
            title = `${title} FastTrak Connected`;
            await this.clearAlert(checkFasttrackAlert[0].id);
            if (isLinkedRow(linkRowType, linkRowRef,  device_type)) {
              const notificationsOptions = {
                isNotify: assetInfo?.is_notify,
                locationLat: assetInfo?.location_lat ,
                locationLng: assetInfo?.location_lng,
                created: this.payload.timestamp,
                deviceType: assetInfo?.device_type,
                siteId: assetInfo?.site_id,
                siteName: assetInfo?.site_name,
                multipleSites: assetInfo?.multipleSites,
                projectName: assetInfo?.project_name,
                projectLocation: assetInfo?.project_location,
              };

              const leaderInfo = {
                row_id,
                row_name,
                shorthand_name,
                asset_name,
                snap_addr: this.payload.snap_addr,
                assetId: this.payload.asset_id
              }

              const childInfo = {
                row_id: linkRowRef
              }

              await CloudAlertsHelperModel.addRowFasttrakStopAlert(
              this.pgWrite,
                leaderInfo,
                childInfo,
                true,
                notificationsOptions
              );
            }else{
            //add event log for FastTrak Disconnected
            await this.addEventLog(title, icon, "ASSET-UNDER_FASTTRAK_STOP");}
            //send stop FastTrack Notifications
            //send notification
            assetInfo.connected_state = this.payload.connected_state;
            assetInfo.last_connected = this.payload.last_connected;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify && !isLinkedRow(linkRowType, linkRowRef,  device_type)) {
              if (checkFasttrackAlert.length > 0) {
                await this.processFastTrakNotification(assetInfo, true);
              } else {
                await this.processFastTrakNotification(assetInfo, true, true);
              }
            }
          } else {
            const assetInfo = await this.getAssetInfo(
              commandInfo,
              "MANUAL CONTROL"
            );
            let title = await this.getTitle(assetInfo, "MANUAL CONTROL");
            let icon = await this.getIcon(assetInfo, "MANUAL CONTROL");
            if (commandInfo !== null) {
              if (commandInfo.status === "Virtual EStop") {
                title = title + " Virtual Emergency Stop Engaged";
                icon = "virtual_estop";
              } else {
                title =
                  title + ` Manual Row Control Start (${commandInfo.status})`;
              }
            } else {
              title = title + ` Manual Row Control Start`;
            }

            //add alert
            if (commandInfo !== null) {

          const notificationsOptions = {
            isNotify: assetInfo?.is_notify,
            locationLat: assetInfo?.location_lat ,
            locationLng: assetInfo?.location_lng,
            created: this.payload.timestamp,
            deviceType: assetInfo?.device_type,
            siteId: assetInfo?.site_id,
            siteName: assetInfo?.site_name,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.project_name,
            projectLocation: assetInfo?.project_location,
          };

          const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr: this.payload.snap_addr,
            assetId: this.payload.asset_id
          }

          const childInfo = {
            row_id: linkRowRef
          }
              console.log(
                `UPDATE terrasmart.site_layout set last_action_completed = true, timestamp = $2::TIMESTAMP
            WHERE asset_id = $1::UUID `,
                [this.payload.asset_id, this.payload.timestamp]
              );
              const updateSiteLayout = await this.pgWrite.query(
                `UPDATE terrasmart.site_layout set last_action_completed = true, timestamp = $2::TIMESTAMP
               WHERE asset_id = $1::UUID `,
                [this.payload.asset_id, this.payload.timestamp]
              );
              console.log("updateSiteLayout ", updateSiteLayout);
              if (isLinkedRow(linkRowType, linkRowRef, device_type)) {
                await CloudAlertsHelperModel.addManualControlAlert(
                  this.pgWrite,
                  leaderInfo,
                  childInfo,
                  commandInfo.status,
                  true,
                  null,
                  notificationsOptions
                );
              } else {
                await this.addCloudAlert(
                  title,
                  icon,
                  "ASSET-UNDER_MANUAL_CONTROL",
                  { user_name: commandInfo.user_name, email: commandInfo.email }
                );
                //add event log
                await this.addEventLog(
                  title,
                  icon,
                  "ASSET-UNDER_MANUAL_CONTROL",
                  {
                    user_name: commandInfo.user_name,
                    email: commandInfo.email,
                  }
                );
                assetInfo.connected_state = this.payload.connected_state;
                assetInfo.last_disconnected = this.payload.last_disconnected;
                assetInfo.icon_name = icon + "_48x48.png";
                if (assetInfo.is_notify)
                  await this.processAssetsConnectionNotifications(
                    assetInfo,
                    false,
                    commandInfo
                  );
              }
            } else {
              //await this.addCloudAlert(title, icon, "ASSET-UNDER_MANUAL_CONTROL");
              //add event log
              // await this.addEventLog(title, icon, "ASSET-UNDER_MANUAL_CONTROL");
            }

            //send notification

            console.log("ASSET_OFFLINE-ALERT ", checkAlert);
            if (checkAlert.length > 0) await this.clearAlert(checkAlert[0].id);
            if (checkUnknownAlert.length > 0)
              await this.clearAlert(checkUnknownAlert[0].id);
            if (checkFCSAlert.length > 0)
              await this.clearAlert(checkFCSAlert[0].id);
          }
        } else if (
          (this.payload.connected_state === "MANUAL CONTROL" ||
            this.payload.connected_state === "FASTTRAK" ||
            this.payload.connected_state === "REMOTE QC" ||
            this.payload.connected_state === "QC FASTTRAK") &&
          isStateChanged
        ) {
          console.log(`${this.payload.connected_state} Alert Already Exists`);
          console.log("ASSET_OFFLINE-ALERT ", checkAlert);
          if (checkAlert.length > 0) {
            const assetInfo = await this.getAssetInfo(commandInfo, "ONLINE");
            await this.clearAlert(checkAlert[0].id);
            let icon = await this.getIcon(assetInfo, "ONLINE");
            let title = await this.getTitle(assetInfo, "ONLINE");
            if (isLinkedRow(linkRowType, linkRowRef,  device_type)) {
              const notificationsOptions = {
                isNotify: assetInfo?.is_notify,
                locationLat: assetInfo?.location_lat ,
                locationLng: assetInfo?.location_lng,
                created: this.payload.timestamp,
                deviceType: assetInfo?.device_type,
                siteId: assetInfo?.site_id,
                siteName: assetInfo?.site_name,
                multipleSites: assetInfo?.multipleSites,
                projectName: assetInfo?.project_name,
                projectLocation: assetInfo?.project_location,
              };

              const leaderInfo = {
                row_id,
                row_name,
                shorthand_name,
                asset_name,
                snap_addr: this.payload.snap_addr,
                assetId: this.payload.asset_id
              }

              const childInfo = {
                row_id: linkRowRef
              }

              await CloudAlertsHelperModel.addRowOnlineAlert(
              this.pgWrite,
                leaderInfo,
                childInfo,
                true,
                notificationsOptions
              );
            }else{
            await this.addEventLog(title, icon, "ASSET-ONLINE");}

            //send notification
            assetInfo.connected_state = this.payload.connected_state;
            assetInfo.last_connected = this.payload.last_connected;
            assetInfo.icon_name = icon + "_48x48.png";
            if (assetInfo.is_notify && !isLinkedRow(linkRowType, linkRowRef,  device_type))
              await this.processAssetsConnectionNotifications(
                assetInfo,
                false,
                commandInfo
              );
          }
        }
      } else {
        console.log("Out of Order Update");
      }

      return true;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error processEvent..!!", err);
    }
  }
  async getCommandInfo() {
    console.log(
      "getCommandInfo",
      `
    Select * from terrasmart.site_layout
    Where site_layout.asset_id = $1::UUID
    AND last_action_completed = false`,
      [this.payload.asset_id]
    );
    let res = await this.client.query(
      `
    Select * from terrasmart.site_layout
    Where site_layout.asset_id = $1::UUID
    AND last_action_completed = false`,
      [this.payload.asset_id]
    );
    // console.log("RESULT: ", res);

    let res1 = await this.client.query(
      `
    Select * from terrasmart.site_layout
    Where site_layout.asset_id = $1::UUID`,
      [this.payload.asset_id]
    );
    // console.log("RESULT1: ", res1);
    if (res.rows.length > 0) {
      let rc_cmd_state = res.rows[0].individual_rc_cmd_state;
      // if (rc_cmd_state === 3) {
      //   return null;
      // } else {
      let rc_param = res.rows[0].individual_rc_param;
      let rc_previous_state = res.rows[0].individual_rc_previous_state;
      let rc_privious_param = res.rows[0].individual_rc_previous_param;
      let user_name = res.rows[0].username;
      let email = res.rows[0].email;
      let status = this.getUnderManualCommandStatus(rc_cmd_state, rc_param);
      let lastStatus = this.getUnderManualCommandStatus(
        rc_previous_state,
        rc_privious_param
      );
      return {
        status: status,
        user_name: user_name,
        email: email,
        lastStatus: lastStatus,
      };
      //}
    } else {
      return null;
    }
  }

  getUnderManualCommandStatus(rc_cmd_state, rc_param) {
    console.log("getUnderManualCommandStatus ", rc_cmd_state, rc_param);
    let status = "";
    if (rc_cmd_state === 5) {
      if (rc_param === 0) status = "Preset: Stow";
      if (rc_param === 1) status = "Preset: Flat";
      if (rc_param === 6) status = "Preset: Min";
      if (rc_param === 7) status = "Preset: Max";
    } else if (rc_cmd_state === 3) {
      status = `${rc_param}&deg;`;
    } else if (rc_cmd_state === 1) {
      status = "Virtual EStop";
    }
    return status;
  }
  async checkNewEvent() {
    try {
      const conhist = await this.client.query(db.checkLastAssetHistUpdate, [
        this.payload.asset_id,
        this.payload.last_asset_updated,
      ]);

      // console.log("AssetHist ", conhist);
      let is_new = true;
      if (conhist.rows.length > 0) {
        is_new = false;
      }
      console.log("IS NEW: ", is_new);
      return is_new;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error checkNewEvent..!!", err);
    }
  }
  async getAssetInfo(commandInfo, asset_status) {
    try {
      console.log("ASSETSTATUS: ", asset_status);
      if (asset_status === null || asset_status === undefined) {
        asset_status = this.payload.connected_state;
      }
      const assetInfo = await this.client.query(db.siteInfoByAssetId, [this.payload.asset_id ]);
      let info = {};
      await assetInfo.rows.forEach(async (data) => {
        info.is_notify = data.is_notify;
        info.site_id = data.site_id;
        info.site_name = data.site_name;
        info.device_type = getDeviceTypeNameFromAssetType(data.asset_type);
        info.location_lat = data.location_lat;
        info.location_lng = data.location_lng;
        info.asset_name = data.asset_name;
        info.project_name = data.project_name;
        info.project_id = data.project_id;
        info.project_location = data.project_location;
        info.last_reporting_status = data.last_reporting_status;
      });
      info.multipleSites = await notificationService.checkProjectSites(this.client, info.project_id);
      info.timestamp = this.payload.timestamp;
      //Notification accounts
      let notification_type = "rc_";
      if (info.device_type === "Row Controller")
        notification_type = "rc_status";
      if (info.device_type === "Weather Station")
        notification_type = "ws_status";
      if (asset_status === "FCS") notification_type = "rc_fcs";
      if (asset_status === "FASTTRAK")
        notification_type = "rc_under_fasttrak_control";
      if (asset_status === "MANUAL CONTROL")
        notification_type = "rc_under_manual_control";
      if (asset_status === "REMOTE QC")
        notification_type = "rc_remote_qaqc_control";

      if (asset_status === "ONLINE") {
        if (commandInfo !== null) {
          if (commandInfo.lastStatus !== null) {
            notification_type = "rc_under_manual_control";
          }
        }
      }

      if (notification_type === "rc_") {
        console.log("WARNING: invalid notification_type(check info for details): ", notification_type, "info.device_type:", info.device_type, "asset_status:", asset_status);
      }
      console.log("Notif Type ", notification_type);
      console.log("INFO ", info);
      var userAccounts = await notificationSettingService.getAccounts(
        this.client,
        info.site_id,
        notification_type
      );
      info.emailAddrs = userAccounts.emails;
      info.phoneNumbers = userAccounts.phone_nums;

      var siteLayoutInfo = await this.client.query(
        `
      SELECT site_layout.name,site_layout.i,site_layout.shorthand_name FROM terrasmart.site_layout
      WHERE site_layout.asset_id = $1::UUID
      `,
        [this.payload.asset_id]
      );
      info.shorthand_name = null;
      info.row_id = "";
      info.row_name = null;
      if (siteLayoutInfo.rows.length !== 0) {
        info.shorthand_name = siteLayoutInfo.rows[0].shorthand_name;
        info.row_id = siteLayoutInfo.rows[0].i;
        info.row_name = siteLayoutInfo.rows[0].name;
      }
      console.log(info);
      return info;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getAssetInfo..!!", err);
    }
  }
  async getLastStatus() {
    try {
      const conhist = await this.client.query(db.checkLastStatusCurrent, [
        this.payload.asset_id
      ]);
      console.log("ConHist ", conhist);
      let sendNotification = false;
      let res = { check: false, status: null };
      await conhist.rows.forEach(async (data) => {
        console.log("DATA: ", data);
        if (data.connected_state !== this.payload.connected_state) {
          sendNotification = true;
          res = {
            check: sendNotification,
            status: data.connected_state,
          };
        } else {
          res = {
            check: sendNotification,
            status: data.connected_state,
          };
          console.log("Not Matched");
        }
      });
      console.log("IS CHANGE LASTSTATE: ", sendNotification);
      return res;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getLastConStatus..!!",
        err
      );
    }
  }

  async getActiveAlert(event_name) {
    try {
      console.log(
        `SELECT * FROM terrasmart.cloud_alert
      WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true`,
        [this.payload.asset_id, event_name]
      );
      const res = await this.client.query(
        `SELECT * FROM terrasmart.cloud_alert
             WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND active = true`,
        [this.payload.asset_id, event_name]
      );
      console.log("ACTIVEALERT: ", res.rows);
      return res.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getActiveAlert..!!", err);
    }
  }

  async addCloudAlert(title, icon, event_name, userInfo) {
    try {
      // Check if alert already exists with same event_name, asset_id and active status
      const duplicateAlert = await this.getActiveAlert(event_name);

      if (duplicateAlert.length > 0) {
        console.log("Cloud Alert with same pk already exists: ", duplicateAlert);
        return;
      }

      if (userInfo !== null && userInfo !== undefined) {
        return await this.pgWrite.query(
          db.addCloudAlertWithUserInfoByReturnId,
          [
            event_name,
            null,
            new Date(this.payload.timestamp),
            this.payload.asset_id,
            2,
            true,
            title,
            icon,
            userInfo.user_name,
            userInfo.email,
            null,
            20
          ]
        );
      } else {
        //ADD Alert
        const addCloudAlertQuery = `
            INSERT INTO terrasmart.cloud_alert(event_name,created,asset_id,type,active,title,icon)
            VALUES ($1 :: VARCHAR, $2 :: TIMESTAMP,$3 :: UUID, $4 :: INT, $5 :: Boolean,$6::VARCHAR,$7::VARCHAR)
            `;
        return await this.pgWrite.query(addCloudAlertQuery, [
          event_name,
          new Date(this.payload.timestamp),
          this.payload.asset_id,
          2,
          true,
          title,
          icon,
        ]);
      }
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addCloudAlert..!!", err);
    }
  }

  async addEventLog(title, icon, eventName, userInfo) {
    try {
      console.log("ADDEVENTLOG ", title, icon, eventName, userInfo);
      if (userInfo !== null && userInfo !== undefined) {
        return await this.pgWrite.query(
          db.addCloudEventLogWithUserInfoByReturnId,
          [
            eventName,
            null,
            20,
            new Date(this.payload.timestamp),
            this.payload.asset_id,
            1,
            title,
            icon,
            userInfo.user_name,
            userInfo.email,
            null
          ]
        );
      } else {
        const cloudEventLogQuery = `
        INSERT INTO terrasmart.cloud_event_log (name,levelno,created,asset_id,type,title,icon)
        VALUES ($1 :: VARCHAR, $2 :: INT, $3 :: TIMESTAMP,$4 :: UUID, $5::INT,$6::VARCHAR,$7::VARCHAR)
        `;
        //ADD Log
        return await this.pgWrite.query(cloudEventLogQuery, [
          eventName,
          20,
          new Date(this.payload.timestamp),
          this.payload.asset_id,
          2, //Individual Asset Events,
          title,
          icon,
        ]);
      }
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error addEventLog..!!", err);
    }
  }

  async clearAlert(alertId) {
    try {
      console.log("Delete Cloud Alert: ", alertId);

      await cloudAlertService.clearAlertDetail(this.pgWrite, alertId);
      return await this.pgWrite.query(db.removeCloudAlert, [alertId]);
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error clearAlert..!!", err);
    }
  }

  async clearFCSAlert(alertId) {
    // console.log("Delete Cloud Alert: ", alertId);
    await this.pgWrite.query(db.removeCloudAlert, [alertId]);
    // await this.pgWrite.query(db.updateCLoudAlertQuery, [
    //   this.payload.timestamp,
    //   alertId,
    // ]);
  }
  async getTitle(info, status) {
    console.log("Title status:", status);
    let assetName = "";
    if (info.device_type === "Row Controller") {
      assetName =
        "Row Box " +
        info.row_id +
        " (" +
        (info.row_name !== null ? info.row_name + " | " : "") +
        (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
        this.payload.snap_addr +
        "):";
    } else {
      assetName =
        info.asset_name !== undefined && info.asset_name !== null
          ? info.asset_name + " (" + this.payload.snap_addr + "):"
          : info.device_type + " (" + this.payload.snap_addr + "):";
    }
    if (status === "OFFLINE") {
      console.log("in offline");
      assetName = `${assetName} Offline`;
      console.log("asset name: ", assetName);
    } else if (status === "ONLINE") {
      console.log("in online");
      assetName = `${assetName} Online`;
      console.log("asset name: ", assetName);
    } else if (status === "FCS") {
      console.log("in fcs");
      assetName = `${assetName} FCS`;
      console.log("asset name: ", assetName);
    } else if (status === "UNKNOWN") {
      console.log("in unknown");
      assetName = `${assetName} Unknown`;
      console.log("asset name: ", assetName);
    }
    console.log("Final title: ", assetName);
    return assetName;
  }

  async getIcon(info, status) {
    let icon = null;
    if (status == "OFFLINE") {
      if (info.device_type === "Row Controller") {
        icon = "mode_tracking_offline";
      } else {
        icon = "weather_offline";
      }
    } else if (status == "ONLINE") {
      if (info.device_type === "Row Controller") {
        icon = "mode_tracking";
      } else {
        icon = "weather_online";
      }
    } else if (status == "FCS") {
      if (info.device_type === "Row Controller") {
        icon = "fcs_control";
      } else {
        icon = "fcs_control";
      }
    } else if (status == "UNKNOWN") {
      if (info.device_type === "Row Controller") {
        icon = "unknown";
      } else {
        icon = "unknown";
      }
    } else if (status == "MANUAL CONTROL" || status == "FASTTRAK" || status === "REMOTE QC") {
      icon = "setting_gray";
    }
    return icon;
  }
  getAssetName(info) {
    let assetName = info.asset_name;
    if (info.device_type === "Row Controller") {
      assetName =
        "Row Box " +
        info.row_id +
        " (" +
        (info.row_name !== null ? info.row_name + " | " : "") +
        (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
        this.payload.snap_addr +
        ")";
    } else {
      assetName =
        info.asset_name !== null
          ? info.asset_name + " (" + this.payload.snap_addr + ")"
          : info.device_type !== null
            ? info.device_type + " (" + this.payload.snap_addr + ")"
            : "Asset" + " (" + this.payload.snap_addr + ")";
    }
    return assetName;
  }

  async processFastTrakNotification(info, isStop, isQC = false) {
    console.log("processFastTrakStopNotification: ", info, isStop, isQC);
    try {
      const QCString = isQC === true ? "(QC)" : "";
      if (info) {
        let time_zone = "America/New_York";
        if (info.location_lat !== "" && info.location_lng !== "")
          time_zone = tzlookup(info.location_lat, info.location_lng);
        let connection_time = this.payload.last_connected;
        let timestamp = moment
          .tz(connection_time, time_zone)
          .format("hh:mmA on MM/DD/YYYY ");

        let asset_name = this.getAssetName(info);
        let body_text = ``;
        let connected_state = `${QCString}FastTrak Connected`;
        if (isStop) {
          connected_state = `${QCString}FastTrak Disconnected`;
          body_text = `${asset_name}: ${QCString}FastTrak was disconnected`;
        } else {
          connected_state = `${QCString}FastTrak Connected`;
          body_text = `${asset_name}: ${QCString}FastTrak was connected`;
        }
        let status_text = info.device_type + " " + connected_state;

        let site_name = info.site_name !== null ? info.site_name : "Site";
        let msg_subject = (info.multipleSites ? info.project_name + " | " : "") +
          `${site_name} | Row Controller ${connected_state}`;
        //send SMS
        console.log("Sending SMS...");
        await this.sendSMSFastTrakNotification(info, timestamp, isStop, isQC);
        //send email
        console.log("Sending Email...");
        if (info.emailAddrs.length > 0) {
          console.log("EMAILADRS: ", info.emailAddrs);
          var emailData = {
            is_multiSites: info.multipleSites,
            site_name: info.site_name,
            status_text: status_text,
            asset_name: asset_name,
            body_text: body_text,
            timestamp: timestamp,
            project_name: info.project_name,
            project_location: info.project_location,
            s3_asset_url: getS3EmailAssetsUrl(),
            icon_url: getS3EmailAssetsUrl() + info.icon_name,
            url: process.env.CLOUDUI_URL + ("/home/projects/" + info.site_id + "/overview"),
            current_time: new Date(),
          };
          var templateHtml = Handlebars.compile(
            utils.emailTempAssetStatus.toString()
          );

          var bodyHtml = templateHtml(emailData);
          var params = {};
          params.msgSubject = msg_subject;
          params.msgbody = bodyHtml;

          info.emailAddrs.forEach(async (data) => {
            params.emailAddrs = [data];
            await aws_integration.sendEmail(params);
          });
        } else {
          console.log("No email Add found");
        }
      }
    } catch (err) {
      console.log("Notification sending err ", err);
    }
  }
  async processRemoteQAQCNotification(info, isStop) {
    console.log("processRemoteQCNotification: ", info, isStop);
    try {
      if (info) {
        let time_zone = "America/New_York";
        if (info.location_lat !== "" && info.location_lng !== "")
          time_zone = tzlookup(info.location_lat, info.location_lng);
        let connection_time = this.payload.last_connected;
        let timestamp = moment
          .tz(connection_time, time_zone)
          .format("hh:mmA on MM/DD/YYYY ");

        let asset_name = this.getAssetName(info);
        let body_text = ``;
        let connected_state = `Remote QC Start`;
        if (isStop) {
          connected_state = `Remote QC Stop`;
          body_text = `${asset_name}: Remote QC was stopped`;
        } else {
          connected_state = `Remote QC Start`;
          body_text = `${asset_name}: Remote QC was started`;
        }
        let status_text = info.device_type + " " + connected_state;

        let site_name = info.site_name !== null ? info.site_name : "Site";
        let msg_subject = (info.multipleSites ? info.project_name + " | " : "") +
          `${site_name} | Row Controller ${connected_state}`;
        //send SMS
        console.log("Sending SMS...");
        await this.sendSMSRemoteQAQCNotification(info, timestamp, isStop);
        //send email
        console.log("Sending Email...");
        if (info.emailAddrs.length > 0) {
          console.log("EMAILADRS: ", info.emailAddrs);
          var emailData = {
            is_multiSites: info.multipleSites,
            site_name: info.site_name,
            status_text: status_text,
            asset_name: asset_name,
            body_text: body_text,
            timestamp: timestamp,
            project_name: info.project_name,
            project_location: info.project_location,
            s3_asset_url: getS3EmailAssetsUrl(),
            icon_url: getS3EmailAssetsUrl() + info.icon_name,
            url: process.env.CLOUDUI_URL + ("/home/projects/" + info.site_id + "/overview"),
            current_time: new Date(),
          };
          var templateHtml = Handlebars.compile(
            utils.emailTempAssetStatus.toString()
          );

          var bodyHtml = templateHtml(emailData);
          var params = {};
          params.msgSubject = msg_subject;
          params.msgbody = bodyHtml;

          info.emailAddrs.forEach(async (data) => {
            params.emailAddrs = [data];
            await aws_integration.sendEmail(params);
          });
        } else {
          console.log("No email Add found");
        }
      }
    } catch (err) {
      console.log("Notification sending err ", err);
    }
  }

  async processAssetsConnectionNotifications(
    info,
    isManualControlStop,
    commandInfo
  ) {
    console.log(
      "Process Connection Notification1: ",
      info,
      " ",
      isManualControlStop,
      commandInfo
    );
    try {
      if (info) {
        let params = {};
        console.log("Here 1");
        let time_zone = "America/New_York";
        if (info.location_lat !== "" && info.location_lng !== "")
          time_zone = tzlookup(info.location_lat, info.location_lng);
        console.log("Here 2");
        let connected_state = "Online";
        let connection_time = null;
        if (
          this.payload.connected_state === "ONLINE" ||
          this.payload.connected_state === "FCS" ||
          this.payload.connected_state === "MANUAL CONTROL"
        ) {
          console.log("Here 3");
          connection_time = this.payload.last_connected;

          if (this.payload.connected_state === "FCS") connected_state = "FCS";
          if (this.payload.connected_state === "ONLINE") {
            connected_state = "Online";
          } else if (this.payload.connected_state === "MANUAL CONTROL") {
            console.log("Here 4");
            if (commandInfo !== null) {
              console.log("Here 5");
              if (commandInfo.status === "Virtual EStop") {
                connected_state = "Virtual Emergency Stop Engaged";
              } else {
                connected_state = "Manual Row Control Start";
              }
            } else {
              console.log("Here 6");
              if (info.last_reporting_status === "OFFLINE") {
                connected_state = "Online";
              } else {
                connected_state = "Manual Row Control Start";
              }
            }
          }
        } else if (
          this.payload.connected_state === "OFFLINE" ||
          this.payload.connected_state === "UNKNOWN"
        ) {
          console.log("Here 7");
          connection_time = this.payload.last_disconnected;
          this.payload.connected_state === "OFFLINE"
            ? (connected_state = "Offline")
            : (connected_state = "Unknown");
        }
        console.log("Here 8");
        let timestamp = moment
          .tz(connection_time, time_zone)
          .format("hh:mmA on MM/DD/YYYY ");

        let asset_name = this.getAssetName(info);
        let status_text = info.device_type + " " + connected_state;
        if (isManualControlStop) {
          console.log("CMDINFO ", commandInfo);
          if (commandInfo !== null) {
            console.log("Here 9");
            if (commandInfo.lastStatus === "Virtual EStop") {
              status_text =
                info.device_type + " " + "Virtual Emergency Stop Disengaged";
            } else {
              status_text = info.device_type + " " + "Manual Row Control Stop";
            }
          } else {
            status_text = info.device_type + " " + "Manual Row Control Stop";
          }
        }
        console.log("Here 10");
        console.log(status_text, " ", isManualControlStop);
        if (
          this.payload.connected_state === "ONLINE" ||
          this.payload.connected_state === "FCS" ||
          this.payload.connected_state === "MANUAL CONTROL"
        ) {
          let body_text = "";
          if (this.payload.connected_state === "FCS")
            body_text = `${asset_name}  reported that it is under control of the Field Commissioning Software (FCS).`;

          if (this.payload.connected_state === "MANUAL CONTROL") {
            if (commandInfo !== null) {
              if (commandInfo.status === "Virtual EStop") {
                body_text = `${asset_name}: Virtual Emergency Stop Engaged by ${commandInfo.user_name} (${commandInfo.email})`;
              } else {
                body_text = `${asset_name}: Manual Row Control Start (${commandInfo.status}) by ${commandInfo.user_name} (${commandInfo.email})`;
              }
            } else {
              body_text = `${asset_name} reported that it is under manual control.`;
            }
          } else if (isManualControlStop) {
            console.log("CMDINFO ", commandInfo);
            if (commandInfo !== null) {
              if (commandInfo.lastStatus === "Virtual EStop") {
                body_text = `${asset_name}: Virtual Emergency Stop Disengaged by ${commandInfo.user_name} (${commandInfo.email})`;
              } else {
                body_text = `${asset_name}: Manual Row Control Stop by ${commandInfo.user_name} (${commandInfo.email})`;
              }
            } else {
              body_text = `${asset_name}: Manual Row Control Stop by ${commandInfo.user_name} (${commandInfo.email})`;
            }
          }
          console.log(body_text, " ", isManualControlStop);
          console.log("Sending SMS....");

          await this.sendSMSNotification(
            info,
            true,
            timestamp,
            connected_state,
            isManualControlStop,
            commandInfo
          );
          console.log("Sending Email....");
          if (info.emailAddrs.length > 0) {
            console.log("EMAILADRS: ", info.emailAddrs);
            var emailData = {
              is_multiSites: info.multipleSites,
              site_name: info.site_name,
              status_text: status_text,
              asset_name: asset_name,
              body_text: body_text,
              timestamp: timestamp,
              project_name: info.project_name,
              project_location: info.project_location,
              s3_asset_url: getS3EmailAssetsUrl(),
              icon_url: getS3EmailAssetsUrl() + info.icon_name,
              url: process.env.CLOUDUI_URL + ("/home/projects/" + info.site_id + "/overview"),
              current_time: new Date(),
            };

            var templateHtml = Handlebars.compile(utils.emailTemp.toString());
            if (
              this.payload.connected_state === "FCS" ||
              this.payload.connected_state === "MANUAL CONTROL" ||
              isManualControlStop
            ) {
              templateHtml = Handlebars.compile(
                utils.emailTempAssetStatus.toString()
              );
            }
            var bodyHtml = templateHtml(emailData);
            // params.emailAddrs = info.emailAddrs;
            params.msgSubject =
              (info.multipleSites ? info.project_name + " | " : "") +
              (info.site_name !== null ? info.site_name : "Site") +
              " | " +
              (info.device_type !== null ? info.device_type : "Asset") +
              (" " + connected_state);

            if (this.payload.connected_state === "MANUAL CONTROL") {
              if (
                commandInfo !== null &&
                commandInfo.status === "Virtual EStop"
              ) {
                params.msgSubject =
                  (info.multipleSites ? info.project_name + " | " : "") +
                  (info.site_name !== null ? info.site_name : "Site") +
                  " | " +
                  (info.device_type !== null ? info.device_type : "Asset") +
                  (" " + " Virtual Emergency Stop Engaged");
              } else {
                params.msgSubject =
                  (info.multipleSites ? info.project_name + " | " : "") +
                  (info.site_name !== null ? info.site_name : "Site") +
                  " | " +
                  (info.device_type !== null ? info.device_type : "Asset") +
                  (" " + " Manual Row Control Start");
              }
            } else if (isManualControlStop) {
              if (commandInfo !== null) {
                if (commandInfo.lastStatus === "Virtual EStop") {
                  params.msgSubject =
                    (info.multipleSites ? info.project_name + " | " : "") +
                    (info.site_name !== null ? info.site_name : "Site") +
                    " | " +
                    (info.device_type !== null ? info.device_type : "Asset") +
                    (" " + " Virtual Emergency Stop Disengaged");
                } else {
                  params.msgSubject =
                    (info.multipleSites ? info.project_name + " | " : "") +
                    (info.site_name !== null ? info.site_name : "Site") +
                    " | " +
                    (info.device_type !== null ? info.device_type : "Asset") +
                    (" " + " Manual Row Control Stop");
                }
              } else {
                params.msgSubject =
                  (info.multipleSites ? info.project_name + " | " : "") +
                  (info.site_name !== null ? info.site_name : "Site") +
                  " | " +
                  (info.device_type !== null ? info.device_type : "Asset") +
                  (" " + " Manual Row Control Stop");
              }
            }

            params.msgbody = bodyHtml;

            info.emailAddrs.forEach(async (data) => {
              params.emailAddrs = [data];
              await aws_integration.sendEmail(params);
            });
          }
        } else {
          await this.sendSMSNotification(
            info,
            false,
            timestamp,
            connected_state,
            false
          );

          console.log("EMAILADRS: ", info.emailAddrs);
          if (info.emailAddrs.length > 0) {
            var emailData = {
              is_multiSites: info.multipleSites,
              site_name: info.site_name,
              status_text: info.device_type + " " + connected_state,
              asset_name: asset_name,
              timestamp: timestamp,
              project_name: info.project_name,
              project_location: info.project_location,
              s3_asset_url: getS3EmailAssetsUrl(),
              icon_url: getS3EmailAssetsUrl() + info.icon_name,
              url: process.env.CLOUDUI_URL + ("/home/projects/" + info.site_id + "/overview"),
            };
            var templateHtml = Handlebars.compile(utils.emailTemp.toString());
            var bodyHtml = templateHtml(emailData);
            // params.emailAddrs = info.emailAddrs;
            params.msgSubject =
              (info.multipleSites ? info.project_name + " | " : "") +
              info.site_name +
              " | " +
              (info.device_type !== null ? info.device_type : "Asset") +
              (" " + connected_state);
            params.msgbody = bodyHtml;
            //console.log(params);
            info.emailAddrs.forEach(async (data) => {
              params.emailAddrs = [data];
              await aws_integration.sendEmail(params);
            });
            // });
          }
        }
      } else {
        console.log("NO Notif");
      }
    } catch (e) {
      console.error("ASSET CONNECTION HIST ERROR:", e);
    } finally {
      console.log("releasing client");
    }
  }

  async sendSMSNotification(
    info,
    status,
    timestamp,
    connected_state,
    isManualControlStop,
    commandInfo
  ) {
    console.log(info,
      status,
      timestamp,
      connected_state,
      isManualControlStop,
      commandInfo);
    console.log("ISMANUALCONTROLSTOP ", isManualControlStop);
    console.log("PHONENUMS: ", info.phoneNumbers);
    let asset_name = this.getAssetName(info);
    let params = {};
    let connection_msg =
      connected_state === "FCS"
        ? " under FCS control at "
        : " came " + connected_state + " at ";
    if (connected_state === "FCS") {
      connection_msg = " under FCS control at ";
      params.msgText =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name +
        (" | " + asset_name + " FCS") +
        ("\n" + info.site_name + "'s ") +
        (asset_name + connection_msg + timestamp);
    } else if (connected_state === "Virtual Emergency Stop Engaged") {
      connection_msg = ` Virtual Emergency Stop Engaged by ${commandInfo.user_name} (${commandInfo.email}) at `;
      params.msgText =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name +
        (" | " + asset_name + " Virtual Emergency Stop Engaged") +
        ("\n" + info.site_name + "'s ") +
        (asset_name + connection_msg + timestamp);
    } else if (connected_state === "Manual Row Control Start") {
      const status = commandInfo?.status?.replace("&deg;", "°") || '';
      const userName = commandInfo?.user_name ? `by ${commandInfo.user_name} ` : '';
      const email = commandInfo?.email ? `(${commandInfo.email}) ` : '';
      
      connection_msg = ` Manual Row Control Start (${status}) ${userName}${email}at `;

      params.msgText =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name +
        (" | " + asset_name + " Manual Row Control Start") +
        ("\n" + info.site_name + "'s ") +
        (asset_name + connection_msg + timestamp);
    } else if (isManualControlStop && connected_state === "Online") {
      if (commandInfo !== null) {
        if (commandInfo.lastStatus === "Virtual EStop") {
          connection_msg = ` Virtual Emergency Stop Disengaged by ${commandInfo.user_name} (${commandInfo.email}) at `;
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + asset_name + " Virtual Emergency Stop Disengaged") +
            ("\n" + info.site_name + "'s ") +
            (asset_name + connection_msg + timestamp);
        } else {
          connection_msg = ` stopped Manual Row Control by ${commandInfo.user_name} (${commandInfo.email}) at `;
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + asset_name + " Manual Row Control Stop") +
            ("\n" + info.site_name + "'s ") +
            (asset_name + connection_msg + timestamp);
        }
      } else {
        connection_msg = ` Manual Row Control Stop at `;
        params.msgText =
          (info.multipleSites ? info.project_name + " | " : "") +
          info.site_name +
          (" | " + asset_name + " Manual Row Control Stop") +
          ("\n" + info.site_name + "'s ") +
          (asset_name + connection_msg + timestamp);
      }
    } else if (!isManualControlStop && connected_state === "Online") {
      console.log("HERE ONLINE");
      connection_msg = " came Online at ";
      params.msgText =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name +
        (" | " + asset_name + " Online") +
        ("\n" + info.site_name + "'s ") +
        (asset_name + connection_msg + timestamp);
    } else {
      params.msgText =
        (info.multipleSites ? info.project_name + " | " : "") +
        info.site_name +
        (" | " + asset_name + " " + connected_state) +
        ("\n" + info.site_name + "'s ") +
        asset_name +
        (status === true
          ? connection_msg
          : " went " + connected_state + " at ") +
        timestamp;
    }

    console.log("SMSPARAMS ", params);
    info.phoneNumbers.forEach(async (data) => {
      if (data !== null) {
        let asset_name = this.getAssetName(info);
        let params = {};
        params.phoneNumber = data;
        let connection_msg =
          connected_state === "FCS"
            ? " under FCS control at "
            : " came " + connected_state + " at ";
        if (connected_state === "FCS") {
          connection_msg = " under FCS control at ";
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + info.device_type + " FCS") +
            ("\n" + info.site_name + "'s ") +
            (asset_name + connection_msg + timestamp);
        } else if (connected_state === "Virtual Emergency Stop Engaged") {
          connection_msg = ` Virtual Emergency Stop Engaged by ${commandInfo.user_name} (${commandInfo.email}) at `;
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + info.device_type + " Virtual Emergency Stop Engaged") +
            ("\n" + info.site_name + "'s ") +
            (asset_name + connection_msg + timestamp);
        } else if (connected_state === "Manual Row Control Start") {
          const status = commandInfo?.status?.replace("&deg;", "°") || '';
          const userName = commandInfo?.user_name ? `by ${commandInfo.user_name} ` : '';
          const email = commandInfo?.email ? `(${commandInfo.email}) ` : '';
          
          connection_msg = ` Manual Row Control Start (${status}) ${userName}${email}at `;

          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + info.device_type + " Manual Row Control Start") +
            ("\n" + info.site_name + "'s ") +
            (asset_name + connection_msg + timestamp);
        } else if (isManualControlStop && connected_state === "Online") {
          if (commandInfo !== null) {
            if (commandInfo.lastStatus === "Virtual EStop") {
              connection_msg = ` Virtual Emergency Stop Disengaged by ${commandInfo.user_name} (${commandInfo.email}) at `;
              params.msgText =
                (info.multipleSites ? info.project_name + " | " : "") +
                info.site_name +
                (" | " + info.device_type + " Virtual Emergency Stop Disengaged") +
                ("\n" + info.site_name + "'s ") +
                (asset_name + connection_msg + timestamp);
            } else {
              connection_msg = ` stopped Manual Row Control by ${commandInfo.user_name} (${commandInfo.email}) at `;
              params.msgText =
                (info.multipleSites ? info.project_name + " | " : "") +
                info.site_name +
                (" | " + info.device_type + " Manual Row Control Stop") +
                ("\n" + info.site_name + "'s ") +
                (asset_name + connection_msg + timestamp);
            }
          } else {
            connection_msg = ` Manual Row Control Stop at `;
            params.msgText =
              (info.multipleSites ? info.project_name + " | " : "") +
              info.site_name +
              (" | " + info.device_type + " Manual Row Control Stop") +
              ("\n" + info.site_name + "'s ") +
              (asset_name + connection_msg + timestamp);
          }
        } else if (!isManualControlStop && connected_state === "Online") {
          console.log("HERE ONLINE");
          connection_msg = " came Online at ";
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + info.device_type + " Online") +
            ("\n" + info.site_name + "'s ") +
            (asset_name + connection_msg + timestamp);
        } else {
          params.msgText =
            (info.multipleSites ? info.project_name + " | " : "") +
            info.site_name +
            (" | " + info.device_type + " " + connected_state) +
            ("\n" + info.site_name + "'s ") +
            asset_name +
            (status === true
              ? connection_msg
              : " went " + connected_state + " at ") +
            timestamp;
        }

        console.log("SMSPARAMS ", params);
        await aws_integration.sendSMS(params);
      }
    });
    return true;
  }
  async sendSMSFastTrakNotification(info, timestamp, isStop, isQC) {
    console.log("ISFastTrakStop ", isStop);
    console.log("PHONENUMS: ", info.phoneNumbers);
    info.phoneNumbers.forEach(async (data) => {
      if (data !== null) {
        let asset_name = this.getAssetName(info);
        let params = {};
        params.phoneNumber = data;
        const QCString = isQC === true ? "(QC)" : "";
        if (isStop) {
          params.msgText = (info.multipleSites ? info.project_name + " | " : "") + `${info.site_name} | ${info.device_type} ${QCString}FastTrak Disconnected \n ${info.site_name}'s ${asset_name} ${QCString}FastTrak was disconnected at ${timestamp}`;
        } else {
          params.msgText = (info.multipleSites ? info.project_name + " | " : "") + `${info.site_name} | ${info.device_type} ${QCString}FastTrak Connected \n ${info.site_name}'s ${asset_name} ${QCString}FastTrak was connected at ${timestamp}`;
        }
        console.log("SMSPARAMS ", params);
        await aws_integration.sendSMS(params);
      }
    });
    return true;
  }
  async sendSMSRemoteQAQCNotification(info, timestamp, isStop) {
    console.log("ISRemoteQaQcStop ", isStop);
    console.log("PHONENUMS: ", info.phoneNumbers);
    info.phoneNumbers.forEach(async (data) => {
      if (data !== null) {
        let asset_name = this.getAssetName(info);
        let params = {};
        params.phoneNumber = data;
        if (isStop) {
          params.msgText = (info.multipleSites ? info.project_name + " | " : "") + `${info.site_name} | ${info.device_type} Remote QC Stopped \n ${info.site_name}'s ${asset_name} Remote QC was stoped at ${timestamp}`;
        } else {
          params.msgText = (info.multipleSites ? info.project_name + " | " : "") + `${info.site_name} | ${info.device_type} Remote QC Start \n ${info.site_name}'s ${asset_name} Remote QC was started at ${timestamp}`;
        }
        console.log("SMSPARAMS ", params);
        await aws_integration.sendSMS(params);
      }
    });
    return true;
  }
}

exports.assetConnectionHistService = new AssetConnectionHistService();
