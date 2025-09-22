const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const utils = require("../utils");
const { getS3EmailAssetsUrl, getStatusBit, isLinkedRow } = require("../utils/libs/functions");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const { notificationService } = require("./common/notificationService");
const { acquireLock } = require("../utils/libs/execSync");
const { assetStatus, eventName, qcStates, eventIcon } = require("../utils/constants");
const { getAssetBySnapAddr, getAssetAndSiteLayoutByAssetId } = require("../models/asset.model");
const { getSiteModeInfo } = require("../models/networkcontroller.model");
const { getActiveAlert, addCloudAlertWithUserInfo, addCloudAlert } = require("../models/cloudAlert.model");
const { addCloudEventLogWithUserInfo, addCloudEventLog, addCloudEventLogDetail, getTimelineEventByEventNameAndTime } = require("../models/cloudEventLog.model");
const { CloudAlertsHelperModel } = require("../models/cloudAlertsHelper.model");
const { exeQuery } = require("../pg");

class RemoteQCReportService {
    async handler(payload) {
        try {
            if (payload.siteMode === 8) {
                const res = await this.processQCModeEvent(payload);
                return res;
            } else {
                const res = await this.processEvent(payload);
                return res;
            }

        } catch (err) {
            console.error(err);
            throw new Error(
                "Operation not completed error RemoteQCReportService handler..!!",
                err
            );
        }
    }

    async getTimelineEvent(payload, assetInfo) {
        let timelineEvent = null;
        await acquireLock(
            "locks:qcreporteventlock:" + assetInfo.nc_asset_id,
            3000,
            // Things to do while being in locked state
            async () => {
                const getTrackingModeInfo = await getSiteModeInfo(assetInfo.nc_id);
                if (getTrackingModeInfo) {
                    //get timeline event for remote qc report
                    timelineEvent = await getTimelineEventByEventNameAndTime(assetInfo.nc_asset_id, eventName.REMOTE_QC_REPORT, getTrackingModeInfo.commanded_state_changed_at);
                    if (!timelineEvent) {
                        //add Eventlog and return timeLineEvent
                        let icon = await this.getIcon(eventName.REMOTE_QC_REPORT);
                        let title = `Remote QC Report`;
                        timelineEvent = await this.addEventLog(payload, assetInfo.nc_asset_id,
                            title, icon, eventName.REMOTE_QC_REPORT,
                            { user_name: null, user_email: null }, true);
                    }
                }
            });
        return timelineEvent;

    }

    async processQCModeEvent(payload) {
        let assetInfo = await this.getAssetInfo(payload.snapAddr);
        const checkAlert = await getActiveAlert(payload.snapAddr, eventName.OFFLINE);
        const checkRemoteQaQcAlert = await getActiveAlert(payload.snapAddr, eventName.REMOTE_QC);
        if (checkAlert) {
            let icon = await this.getIcon(eventName.ONLINE);
            let title = await this.getTitle(assetInfo, payload, eventName.ONLINE);
            await this.clearAlert(checkAlert.id);
            await this.addEventLog(payload, assetInfo.assetId, title, icon, eventName.ONLINE, null);
        }
        if (checkRemoteQaQcAlert) await this.clearAlert(checkRemoteQaQcAlert.id);
        if (payload.stage === qcStates.DONE) {
            //add event log
            let icon = await this.getIcon(eventName.REMOTE_QC);
            let title = await this.getTitle(assetInfo, payload);
            title = `Remote QC Completed`;
            //add stop remote qc timeline event
            // await this.addEventLog(payload, assetInfo,
            //     title, icon, eventName.REMOTE_QC_COMPLETE,
            //     { user_name: null, user_email: null }, true);
            const getTimelineEvent = await this.getTimelineEvent(payload, assetInfo);
            if (getTimelineEvent) {
                //add cloud event log detail
                await addCloudEventLogDetail(assetInfo.assetId, eventName.REMOTE_QC_COMPLETE, payload.timestamp,
                    title, icon, 2, 30, getTimelineEvent.id)
            } else {
                //add remoteQC Event
                console.error(`No Remote QC event found `, eventName.REMOTE_QC_COMPLETE);
            }

        } else if (payload.stage === qcStates.STOP) {
            if (payload.lastState !== qcStates.DONE) {
                let icon = await this.getIcon(eventName.REMOTE_QC);
                let title = await this.getTitle(assetInfo, payload);
                title = `Remote QC Failed`;
                //add stop remote qc timeline event
                // await this.addEventLog(payload, assetInfo,
                //     title, icon, eventName.REMOTE_QC_FAILED,
                //     { user_name: null, user_email: null }, true);
                const getTimelineEvent = await this.getTimelineEvent(payload, assetInfo);
                if (getTimelineEvent) {
                    //check if there is any local error 
                    console.log('STATUS BITS: ', assetInfo.statusBits);
                    console.log(getStatusBit(assetInfo.statusBits));
                    //add cloud event log detail
                    await addCloudEventLogDetail(assetInfo.assetId, eventName.REMOTE_QC_FAILED, payload.timestamp,
                        title, icon, 2, 30, getTimelineEvent.id, { status_bits: getStatusBit(assetInfo.statusBits) });
                } else {
                    //add remoteQC Event
                    console.error(`No Remote QC event found `, eventName.REMOTE_QC_FAILED);
                }
            }
        }
    }
    async processEvent(payload) {
        let assetInfo = await this.getAssetInfo(payload.snapAddr);
        const checkAlert = await getActiveAlert(payload.snapAddr, eventName.OFFLINE);
        const checkRemoteQaQcAlert = await getActiveAlert(payload.snapAddr, eventName.REMOTE_QC);

        const {
            linkRowType,
            linkRowRef,
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            device_type,
            assetId
          } = await getAssetAndSiteLayoutByAssetId(assetInfo.assetId)

         const isLinked = isLinkedRow(linkRowType, linkRowRef, device_type)

         const leaderInfo = {
            row_id,
            row_name,
            shorthand_name,
            asset_name,
            snap_addr: payload.snapAddr,
            assetId
          };

          const childInfo = {
            row_id: linkRowRef,
          };

          const notificationsOptions = {
            isNotify: assetInfo?.isNotify,
            locationLat: assetInfo?.locationLat,
            locationLng: assetInfo?.locationLng,
            created: payload.timestamp,
            deviceType: device_type,
            siteId: assetInfo?.siteId,
            siteName: assetInfo?.siteName,
            multipleSites: assetInfo?.multipleSites,
            projectName: assetInfo?.projectName,
            projectLocation: assetInfo?.projectLocation,
          };

        if (payload.stage === qcStates.STOP) {
            //remove offline alert if any
            console.log('rqc alert ', checkRemoteQaQcAlert);
            if (checkAlert) {
                let icon = await this.getIcon(eventName.ONLINE);
                let title = await this.getTitle(assetInfo, payload, eventName.ONLINE);
                await this.clearAlert(checkAlert.id);
                if (isLinked) {
                    
                    await CloudAlertsHelperModel.addRowOnlineAlert(
                        leaderInfo,
                        childInfo,
                        true,
                        {...notificationsOptions, isNotify: false}
                    )
                }else{
                await this.addEventLog(payload, assetInfo.assetId, title, icon, eventName.ONLINE, null);
                }
            }

            if (checkRemoteQaQcAlert) {
                //remove cloud alert
                await this.clearAlert(checkRemoteQaQcAlert.id);

                let icon = await this.getIcon(eventName.REMOTE_QC);
                let title = await this.getTitle(assetInfo, payload);
                title = `${title} Remote QC Stop`;

                if (isLinked) {
                    await CloudAlertsHelperModel.addRemoteqcStopAlert(
                      leaderInfo,
                      childInfo,
                      true,
                      notificationsOptions
                    );
                  } else {
                
                //add stop remote qc timeline event
                await this.addEventLog(payload, assetInfo.assetId,
                    title, icon, eventName.REMOTE_QC_STOP,
                    { user_name: payload.user_name, user_email: payload.user_email }, true);

                //send email & sms notifications
                if (assetInfo.isNotify)
                    await this.processRemoteQAQCNotification(assetInfo, payload, true);
                  }

            }
        } else {
            //check cloud alert not exists
            //if not then add cloud alert
            if (checkRemoteQaQcAlert === null) {
                const {
                    linkRowType,
                    linkRowRef,
                    row_id,
                    row_name,
                    shorthand_name,
                    asset_name,
                    device_type,
                    assetId
                  } = await getAssetAndSiteLayoutByAssetId(assetInfo.assetId)
                let icon = await this.getIcon(assetStatus.REMOTE_QC);
                let title = await this.getTitle(assetInfo, payload);
                title = `${title} Remote QC Start`;

                if (isLinked) {
                  await CloudAlertsHelperModel.addRemoteqcStartAlert(
                    leaderInfo,
                    childInfo,
                    true,
                    notificationsOptions
                  );
                } else {
                  await this.addCloudAlert(
                    payload,
                    assetInfo,
                    title,
                    icon,
                    eventName.REMOTE_QC
                  );
                  await this.addEventLog(
                    payload,
                    assetInfo.assetId,
                    title,
                    icon,
                    eventName.REMOTE_QC,
                    {
                      user_name: payload.user_name,
                      user_email: payload.user_email,
                    }
                  );

                  if (assetInfo.isNotify)
                    await this.processRemoteQAQCNotification(
                      assetInfo,
                      payload,
                      false
                    );
                }
            }
        }
    }

    async getAssetInfo(snapAddr) {
        try {

            const assetInfo = await getAssetBySnapAddr(snapAddr);
            let info = this.mapInfo(assetInfo);
            info.multipleSites = await notificationService.checkProjectSites(info.projectId);

            //Notification accounts
            let notification_type = "rc_remote_qaqc_control";

            var userAccounts = await notificationSettingService.getAccounts(
                info.siteId,
                notification_type
            );
            info.emailAddrs = userAccounts.emails;
            info.phoneNumbers = userAccounts.phone_nums;

            console.log(info);
            return info;
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error getAssetInfo..!!", err);
        }
    }

    mapInfo(data) {
        return {
            assetId: data.asset_id,
            statusBits: data.status_bits,
            isNotify: data.is_notify,
            siteId: data.site_id,
            siteName: data.site_name,
            locationLat: data.location_lat,
            locationLng: data.location_lng,
            assetName: data.asset_name,
            projectName: data.project_name,
            projectId: data.project_id,
            projectLocation: data.project_location,
            shorthandName: data.shorthand_name,
            rowId: data.row_id,
            rowName: data.row_name,
            nc_id: data.nc_id,
            nc_asset_id: data.nc_asset_id
        }
    }
    async addEventLog(payload, assetId, title, icon, eventName, userInfo) {
        try {
            console.log("ADDEVENTLOG ", title, icon, eventName, userInfo);
            if (userInfo !== null && userInfo !== undefined) {
                return await addCloudEventLogWithUserInfo(
                    assetId, eventName, payload.timestamp,
                    title, icon, userInfo.user_name, userInfo.user_email, 30);
            } else {
                //ADD Log
                return await addCloudEventLog(assetId, eventName, payload.timestamp, title, icon, null, 30);
            }
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error addEventLog..!!", err);
        }
    }

    async clearAlert(alertId) {
        try {
            console.log("Delete Cloud Alert: ", alertId);

            await cloudAlertService.clearAlertDetail(alertId);
            return await exeQuery(db.removeCloudAlert, [alertId], { writer: true });
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error clearAlert..!!", err);
        }
    }

    async getActiveAlert(payload, eventName) {
        try {
            return getActiveAlert(payload.snapAddr, eventName);

        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error getActiveAlert..!!", err);
        }
    }
    async addCloudAlert(payload, assetInfo, title, icon, eventName) {
        try {
            if (payload.user_email !== null && payload.user_email !== undefined) {
                console.log("adding alert with user info...")
                return await addCloudAlertWithUserInfo(
                    assetInfo.assetId, eventName, payload.timestamp,
                    title, icon, payload.user_name, payload.user_email, null, null, 30);
            } else {
                //ADD Alert
                return addCloudAlert(assetInfo.assetId, eventName, payload.timestamp, title, icon, null,null, 30);
            }
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error addCloudAlert..!!", err);
        }
    }
    async getIcon(event_name = null) {
        let icon = eventIcon.SETTING;
    
        if (event_name === eventName.REMOTE_QC_REPORT) {
            icon = eventIcon.REMOTE_QC;
        } else if (event_name === eventName.ONLINE) {
            icon = eventIcon.MODE_TRACKING;
        }
    
        return icon;
    }

    getAssetName(info, payload) {
        let assetName =
            "Row Box " +
            info.rowId +
            " (" +
            (info.rowName !== null ? info.rowName + " | " : "") +
            (info.shorthandName !== null ? info.shorthandName + " | " : "") +
            payload.snapAddr +
            ")";

        return assetName;
    }

    async getTitle(info, payload, event_name = null) {
        let assetName = await this.getAssetName(info, payload)
        if (event_name === eventName.ONLINE) {
            assetName = `${assetName} Online`
        }
        console.log("Final title: ", assetName);
        return assetName;
    }

    async processRemoteQAQCNotification(info, payload, isStop) {
        console.log("processRemoteQCNotification: ", info, isStop);
        try {
            if (info) {
                let time_zone = "America/New_York";
                if (info.locationLat !== "" && info.locationLng !== "")
                    time_zone = tzlookup(info.locationLat, info.locationLng);
                let connection_time = payload.timestamp;
                let timestamp = moment
                    .tz(connection_time, time_zone)
                    .format("hh:mmA on MM/DD/YYYY ");

                let assetName = this.getAssetName(info, payload);
                let body_text = ``;
                let connected_state = `Remote QC Start`;
                if (isStop) {
                    connected_state = `Remote QC Stop`;
                    body_text = `${assetName}: Remote QC was stopped`;
                } else {
                    connected_state = `Remote QC Start`;
                    body_text = `${assetName}: Remote QC was started`;
                }

                if (payload.user_email !== null && payload.user_email !== undefined && payload.user_email != '') {
                    body_text += ` by ${payload.user_name} (${payload.user_email})`;
                }
                let status_text = "Row Controller " + connected_state;

                let siteName = info.siteName !== null ? info.siteName : "Site";
                let msg_subject = (info.multipleSites ? info.projectName + " | " : "") +
                    `${siteName} | Row Controller ${connected_state}`;
                //send SMS
                console.log("Sending SMS...");
                await this.sendSMSRemoteQAQCNotification(info, timestamp, payload, isStop);
                //send email
                console.log("Sending Email...");
                if (info.emailAddrs.length > 0) {
                    console.log("EMAILADRS: ", info.emailAddrs);
                    var emailData = {
                        is_multiSites: info.multipleSites,
                        site_name: info.siteName,
                        status_text: status_text,
                        asset_name: assetName,
                        body_text: body_text,
                        timestamp: timestamp,
                        project_name: info.projectName,
                        project_location: info.projectLocation,
                        s3_asset_url: getS3EmailAssetsUrl(),
                        icon_url: getS3EmailAssetsUrl() + info.icon_name,
                        url: process.env.CLOUDUI_URL + ("/home/projects/" + info.siteId + "/overview"),
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

    async sendSMSRemoteQAQCNotification(info, timestamp, payload, isStop) {
        console.log("ISRemoteQaQcStop ", isStop);
        console.log("PHONENUMS: ", info.phoneNumbers);
        info.phoneNumbers.forEach(async (data) => {
            if (data !== null) {
                let assetName = this.getAssetName(info, payload);
                let params = {};
                params.phoneNumber = data;
                if (isStop) {
                    params.msgText = (info.multipleSites ? info.projectName + " | " : "") + `${info.siteName} | Row Controller Remote QC Stopped \n ${info.siteName}'s ${assetName} Remote QC was stoped at ${timestamp}`;
                } else {
                    params.msgText = (info.multipleSites ? info.projectName + " | " : "") + `${info.siteName} | Row Controller Remote QC Start \n ${info.siteName}'s ${assetName} Remote QC was started at ${timestamp}`;
                }
                if (payload.user_email !== null && payload.user_email !== undefined && payload.user_email != '') {
                    params.msgText += ` by ${payload.user_name} (${payload.user_email})`;
                }
                console.log("SMSPARAMS ", params);
                await aws_integration.sendSMS(params);
            }
        });
        return true;
    }
}

exports.remoteQCReportService = new RemoteQCReportService();
