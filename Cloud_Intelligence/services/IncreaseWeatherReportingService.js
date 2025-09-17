const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
var Handlebars = require("handlebars");
const utils = require("../utils");
const {getS3EmailAssetsUrl} = require("../utils/libs/functions");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const { acquireLock } = require("../utils/libs/execSync");
const { notificationService } = require("./common/notificationService");
const { deviceTypeNames } = require("../utils/constants");

class IncreaseWeatherReportingService {
    async handler(client, pgWrite, payload) {
        this.client = client;
        this.pgWrite = pgWrite;
        this.payload = payload;
        try {
            if (this.payload.snapAddr !== null && this.payload.snapAddr !== "") {

                return await this.processEvent(payload);
            } else {
                /**
                 * Normal scenario for increase & stop increase event handling
                 */
                return await this.processStopEventOnReboot(payload);
            }
        } catch (err) {
            console.error(err);
            throw new Error(
                "Operation not completed error IncreaseWeatherReportingService handler..!!",
                err
            );
        }
    }
    /**
     * Processing Stop increase scenario on NC wakeup/Reboot
     * clear all alerts with the reference of asset ids which cause them increase
     */
    async processStopEventOnReboot(payload) {
        let siteConf = await this.getSiteThresholdConf(payload);
        siteConf = siteConf[0];
        if (siteConf.length === 0) {
            console.log("No siteConf found");
            return false;
        } else {
            if (payload.reportingType === 0) {
                const activeAlerts = await this.getAllActiveAlerts(payload);
                console.log(`activeAlerts: `, activeAlerts);
                if (activeAlerts) {
                    let alertCount = 1;
                    let query = `DELETE from terrasmart.cloud_alert where id in (`;
                    for (const data of activeAlerts) {
                        if (alertCount < activeAlerts.length) {
                            query += `'${data.id}',`;
                        } else {
                            query += `'${data.id}'`;
                        }
                        alertCount++;
                        let info = await this.updateClearEventMeta(data.asset_id);
                        info = this.mapSiteInfo(info, siteConf);
                        console.log(`adding Event Log: `, data.event_name, info, payload);
                        // await this.addEventLog(`Stop_${data.event_name}`, info, payload);
                        // if (info.is_notify) {
                        //     //if site notifications enabled send email & sms notifications as per settings
                        //     return this.processNotification(`Stop_${data.event_name}`, info, payload);
                        // }
                    }
                    query += `);`;
                    console.log(`query: `, query);
                    await this.pgWrite.query(query);
                }
            } else {
                let activeEventName = this.getEventName(payload.reportingType);
                const activeAlert = await this.getActiveAlert(payload, activeEventName);

                if (activeAlert) {
                    console.log("processing...")
                    let info = await this.updateClearEventMeta(activeAlert.asset_id);
                    info = this.mapSiteInfo(info, siteConf);
                    let eventName = this.getEventName(payload.reportingType, false);
                    await this.clearAlert(activeAlert.id);

                    await this.addEventLog(eventName, info, payload);
                    if (info.is_notify) {
                        //if site notifications enabled send email & sms notifications as per settings
                        return this.processNotification(eventName, info, payload);
                    }
                } else {
                    console.log(`Alert not found`);
                }
            }
        }
    }

    async processEvent(payload) {
        let siteConf = await this.getSiteThresholdConf(payload);
        siteConf = siteConf[0];
        if (siteConf.length === 0) {
            console.log("No siteConf found");
            return false;
        } else {
            let info = await this.updateMeta(payload);
            info = this.mapSiteInfo(info, siteConf);

            let eventName = this.getEventName(payload.reportingType);
            //check active alert
            const activeAlert = await this.getActiveAlert(payload, eventName);
            console.log(`active Alert: `, activeAlert);
            if (activeAlert === null) {
                if (payload.reportingFlag === 1) {
                    await this.addAlert(eventName, info, payload);
                    await this.addEventLog(eventName, info, payload);
                    if (info.is_notify) {
                        return this.processNotification(eventName, info, payload);
                    }
                } else {
                    eventName = this.getEventName(payload.reportingType, false);
                    await this.clearAlert(activeAlert.id);
                    await this.addEventLog(eventName, info, payload);
                    if (info.is_notify) {
                        //if site notifications enabled send email & sms notifications as per settings
                        return this.processNotification(eventName, info, payload);
                    }
                }

            } else {
                console.log("Alert already exists.. ", activeAlert);
            }
        }
    }


    async updateClearEventMeta(asset_id) {
        let json = {};
        const assetsInfo = await this.client.query(db.assetinfoForWSReporting, [asset_id]);
        assetsInfo.rows.forEach( (data) => {
            json.asset_id = data.asset_id;
            json.device_type = data.device_type;
            json.name = data.name;
            json.snapAddr = data.snapAddr;
            json.row_id = data.row_id;
            json.row_name = data.row_name;
            json.shorthand_name = data.shorthand_name;
            json.network_controller_asset_id = data.network_controller_asset_id;
        });
        json.name = this.getAssetName(json);
        return json;
    }

    async updateMeta(payload) {
        var json = {};
        const assetsInfo = await this.client.query(db.assetinfoForWSReportingBySnapAddr, [
            payload.snapAddr,
        ]);

        let data = assetsInfo.rows[0];
        json.asset_id = data.asset_id;
        json.device_type = data.device_type;
        json.name = data.name;
        json.snapAddr = data.snapAddr;
        json.row_id = data.row_id;
        json.row_name = data.row_name;
        json.shorthand_name = data.shorthand_name;
        json.network_controller_asset_id = data.network_controller_asset_id;

        console.log("NCASSET: ", payload.network_controller_id);
        json.name = this.getAssetName(json);
        json.timestamp = new Date(payload.timestamp);
        return json;
    }

    getAssetName(info) {
        let assetName =
            info.name !== null
                ? info.name
                : info.device_type !== null
                    ? info.device_type
                    : "ASSET";
        if (info.device_type === "Row Controller") {
            assetName =
                "Row Box " +
                (info.row_id !== null ? info.row_id : "") +
                " (" +
                (info.row_name !== null ? info.row_name + " | " : "") +
                (info.shorthand_name !== null ? info.shorthand_name + " | " : "") +
                info.snapAddr +
                ")";
        }
        return assetName;
    }

    mapSiteInfo(info, siteInfo) {
        info.site_id = siteInfo.site_id;
        info.site_name = siteInfo.site_name;
        info.device_type = deviceTypeNames[siteInfo.device_type_id];
        info.location_lat = siteInfo.location_lat;
        info.location_lng = siteInfo.location_lng;
        info.asset_name = siteInfo.asset_name;
        info.project_name = siteInfo.project_name;
        info.project_id = siteInfo.project_id;
        info.project_location = siteInfo.project_location;
        info.is_notify = siteInfo.is_notify;

        return info;
    }

    async getSiteThresholdConf(payload) {
        try {
            console.log();
            const siteConfResult = await this.client.query(db.siteInfoByNCId, [
                payload.network_controller_id,
            ]);
            return siteConfResult.rows;
        } catch (err) {
            console.error(err);
            throw new Error(
                "Operation not completed error getSiteThresholdConf..!!",
                err
            );
        }
    }
    async getAllActiveAlerts(payload) {
        try {
            let checkAlert = [];
            await acquireLock(
                "locks:wxreporting:" + payload.network_controller_id,
                3000,
                // Things to do while being in locked state
                async () => {
                    console.log(db.checkCloudAlertForAllAssetsBYNCAssetIDNoType, [
                        payload.network_controller_id

                    ]);
                    checkAlert = await this.client.query(db.checkCloudAlertForAllAssetsBYNCAssetIDNoType, [
                        payload.network_controller_id
                    ]);
                }
            );
            console.log("active alert: ", checkAlert.rows);
            if (checkAlert.rows.length !== 0) {
                return checkAlert.rows;
            } else {
                return null;
            }
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error getAllActiveAlerts..!!", err);
        }
    }
    async getActiveAlert(payload, eventName) {
        try {
            let checkAlert = [];
            await acquireLock(
                "locks:wxreporting:" + payload.network_controller_id,
                3000,
                // Things to do while being in locked state
                async () => {
                    console.log(db.checkCloudAlertForAllAssetsBYNCAssetID, [
                        payload.network_controller_id,
                        eventName
                    ]);
                    checkAlert = await this.client.query(db.checkCloudAlertForAllAssetsBYNCAssetID, [
                        payload.network_controller_id,
                        eventName
                    ]);
                }
            );
            console.log("active alert: ", checkAlert.rows);
            if (checkAlert.rows.length !== 0) {
                return checkAlert.rows[0];
            } else {
                return null;
            }
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error getActiveAlert..!!", err);
        }
    }
    async addAlert(eventName, info, payload) {
        try {
            console.log(db.addFullCloudAlertQuery, [
                eventName,
                payload.timestamp,
                info.asset_id,
                2,
                true,
                this.getEventTitle(eventName, info),
                this.getEventICon(eventName),
                this.getEventMessage(eventName, info, payload)
            ]);
            const res = await this.pgWrite.query(db.addFullCloudAlertQuery, [
                eventName,
                payload.timestamp,
                info.asset_id,
                2,
                true,
                this.getEventTitle(eventName, info),
                this.getEventICon(eventName),
                this.getEventMessage(eventName, info, payload)
            ]);
            console.log("ADD ALERT: ", res);
            return res;
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error addAlert..!!", err);
        }
    }


    async clearAlert(alertId) {
        try {
            console.log("Delete Cloud Alert: ", alertId);
            //await cloudAlertService.clearAlertDetail(this.pgWrite, alertId);
            return await this.pgWrite.query(db.removeCloudAlert, [alertId]);
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error clearAlert..!!", err);
        }
    }

    async addEventLog(event_name, info, payload) {
        try {
            //name,levelno,created,asset_id,type,title,icon,message
            console.log(`ADDEventLog`, db.addFullCloudEventLogQuery,
                [
                    event_name,
                    20,
                    payload.timestamp,
                    info.asset_id,
                    2,
                    this.getEventTitle(event_name, info),
                    this.getEventICon(event_name),
                    this.getEventMessage(event_name, info, payload),
                ]);
            const addEventRes = await this.pgWrite.query(
                db.addFullCloudEventLogQuery,
                [
                    event_name,
                    20,
                    payload.timestamp,
                    info.asset_id,
                    2,
                    this.getEventTitle(event_name, info),
                    this.getEventICon(event_name),
                    this.getEventMessage(event_name, info, payload),
                ]
            );
            console.log("Add event for " + event_name + " :", addEventRes);
        } catch (err) {
            console.error(err);
            throw new Error("Operation not completed error addEventLog..!!", err);
        }
    }
    getType(type) {
        let typeName = null;
        switch (type) {
            case 1:
                typeName = "WIND_GUST"
                break;
            case 2:
                typeName = "WIND_SPEED"
                break;
            case 3:
                typeName = "SNOW_DEPTH"
                break;
            case 4:
                typeName = "PANEL_SNOW_DEPTH"
                break;
        }
        return typeName;
    }

    getEventName(type, is_start = true) {
        let event_name = null;
        switch (type) {
            case 2:
                event_name = is_start
                    ? "Increased_Weather_Reporting_Avg_Wind"
                    : "Stop_Increased_Weather_Reporting_Avg_Wind";
                break;
            case 1:
                event_name = is_start
                    ? "Increased_Weather_Reporting_Wind_Gust"
                    : "Stop_Increased_Weather_Reporting_Wind_Gust";
                break;
            case 3:
                event_name = is_start
                    ? "Increased_Weather_Reporting_Deep_Snow"
                    : "Stop_Increased_Weather_Reporting_Deep_Snow";
                break;
            case 4:
                event_name = is_start
                    ? "Increased_Weather_Reporting_Deep_Panel_Snow"
                    : "Stop_Increased_Weather_Reporting_Deep_Panel_Snow";
                break;
        }
        return event_name;
    }
    getEventICon(event_name) {
        let icon = null;
        switch (event_name) {
            case "Increased_Weather_Reporting_Avg_Wind":
            case "Increased_Weather_Reporting_Wind_Gust":
            case "Increased_Weather_Reporting_Deep_Snow":
            case "Increased_Weather_Reporting_Deep_Panel_Snow":
                icon = "weather_increase_start";
                break;
            case "Stop_Increased_Weather_Reporting_Avg_Wind":
            case "Stop_Increased_Weather_Reporting_Wind_Gust":
            case "Stop_Increased_Weather_Reporting_Deep_Snow":
            case "Stop_Increased_Weather_Reporting_Deep_Panel_Snow":
                icon = "weather_increase_stop";
                break;
        }

        return icon;
    }
    getEventSubject(event_name, info) {
        let title = null;
        switch (event_name) {
            case "Increased_Weather_Reporting_Avg_Wind":
                title = "Increased Weather Reporting: High Average Wind";
                break;
            case "Increased_Weather_Reporting_Wind_Gust":
                title = "Increased Weather Reporting: High Wind Gust";
                break;
            case "Increased_Weather_Reporting_Deep_Snow":
                title = "Increased Weather Reporting: Deep Snow";
                break;
            case "Increased_Weather_Reporting_Deep_Panel_Snow":
                title = "Increased Weather Reporting: Deep Panel Snow";
                break;
            case "Stop_Increased_Weather_Reporting_Avg_Wind":
            case "Stop_Increased_Weather_Reporting_Wind_Gust":
            case "Stop_Increased_Weather_Reporting_Deep_Snow":
            case "Stop_Increased_Weather_Reporting_Deep_Panel_Snow":
                title = "Stop Increased Weather Reporting on " + info.name;
                break;
        }
        title = (info.device_type !== null ? info.device_type : "Asset") + " | " + title;
        return title;
    }

    getEventTitle(event_name, info) {
        let title = null;
        switch (event_name) {
            case "Increased_Weather_Reporting_Avg_Wind":
            case "Increased_Weather_Reporting_Wind_Gust":
            case "Increased_Weather_Reporting_Deep_Snow":
            case "Increased_Weather_Reporting_Deep_Panel_Snow":
                title = "Increased Weather Reporting on " + info.name;
                break;
            case "Stop_Increased_Weather_Reporting_Avg_Wind":
            case "Stop_Increased_Weather_Reporting_Wind_Gust":
            case "Stop_Increased_Weather_Reporting_Deep_Snow":
            case "Stop_Increased_Weather_Reporting_Deep_Panel_Snow":
                title = "Stop Increased Weather Reporting on " + info.name;
                break;
        }

        return title;
    }

    getEventMessage(event_name, info, payload) {
        let msg = null;
        switch (event_name) {
            case "Increased_Weather_Reporting_Avg_Wind":
                msg =
                    "An average wind speed of " +
                    (utils.roundNumber(payload.reportingValue) +
                        "mph was recorded by ") +
                    (info.name +
                        ".  Since this value is greater than " +
                        payload.closePercentage +
                        "% of the ") +
                    (utils.roundNumber(payload.reportingThreshold) +
                        "mph threshold, the system has started increased weather reporting.");
                break;
            case "Stop_Increased_Weather_Reporting_Avg_Wind":
                msg =
                    "An average wind speed of " +
                    (utils.roundNumber(payload.reportingValue) +
                        "mph was reported by ") +
                    (info.name +
                        ".  Since this value is less than " +
                        payload.closePercentage +
                        "% of the ") +
                    (utils.roundNumber(payload.reportingThreshold) +
                        "mph threshold, the system has returned to normal weather reporting.");
                break;

            case "Increased_Weather_Reporting_Wind_Gust":
                msg =
                    "A wind gust of " +
                    utils.roundNumber(payload.reportingValue) +
                    ("mph was recorded by " + info.name) +
                    (". Since this value is greater than " +
                        payload.closePercentage +
                        "% of the " +
                        utils.roundNumber(payload.reportingThreshold) +
                        "mph threshold the system has started increased weather reporting.");
                break;
            case "Stop_Increased_Weather_Reporting_Wind_Gust":
                msg =
                    "A wind gust of " +
                    (utils.roundNumber(payload.reportingValue) +
                        "mph was reported by ") +
                    (info.name +
                        ". Since this value is less than " +
                        payload.closePercentage +
                        "% of the ") +
                    (utils.roundNumber(payload.reportingThreshold) +
                        "mph threshold, the system has returned to normal weather reporting");
                break;
            case "Increased_Weather_Reporting_Deep_Snow":
            case "Increased_Weather_Reporting_Deep_Panel_Snow":
                msg =
                    "A snow depth of " +
                    (utils.roundNumber(payload.reportingValue) +
                        " inches was recorded by ") +
                    (info.name +
                        ". Since this value is greater than " +
                        payload.closePercentage +
                        "% of the ") +
                    (utils.roundNumber(payload.reportingThreshold) +
                        " inches threshold, the system has started increased weather reporting.");
                break;
            case "Stop_Increased_Weather_Reporting_Deep_Snow":
            case "Stop_Increased_Weather_Reporting_Deep_Panel_Snow":
                msg =
                    "A snow Depth of " +
                    (utils.roundNumber(payload.reportingValue) +
                        " inches was reported by ") +
                    (info.name +
                        ". Since this value is less than " +
                        payload.closePercentage +
                        "% of the ") +
                    (utils.roundNumber(payload.reportingThreshold) +
                        " inches threshold, the system has returned to normal weather reporting.");
                break;
        }

        return msg;
    }
    async processNotification(event_name, info, payload) {
        console.log(`processNotification `, event_name, info, payload);
        info.multipleSites = await notificationService.checkProjectSites(this.client, info.project_id);
        console.log(`Multiple sites check: `, info.multipleSites);
        //Get user & site notifications settings
        var userAccounts = await notificationSettingService.getAccounts(
            this.client,
            info.site_id,
            "ws_inc_repo_" + this.getType(payload.reportingType).toString().toLowerCase()
        );
        if (userAccounts) {
            info.emailAddrs = userAccounts.emails;
            info.phoneNumbers = userAccounts.phone_nums;
        }
        info.status_text = this.getEventSubject(event_name, info);
        info.message = this.getEventMessage(event_name, info, payload);
        info.icon_name = this.getEventICon(event_name) + "_48x48.png";
        if (info.phoneNumbers.length > 0) await this.sendSmsNotification(info, payload);
        if (info.emailAddrs.length > 0) await this.sendNotification(info, payload);
        return true;
    }
    async sendSmsNotification(info, payload) {
        try {
            console.log("Process Weather Station SMS Notification: ", info);

            let time_zone = "America/New_York";
            if (info.location_lat !== "" && info.location_lng !== "")
                time_zone = tzlookup(info.location_lat, info.location_lng);

            let timestamp = moment
                .tz(payload.timestamp, time_zone)
                .format("MM/DD/YYYY hh:mmA ");
            console.log("TIME: ", timestamp);
            let asset_name =
                info.asset_name !== null && info.asset_name !== undefined
                    ? info.asset_name
                    : "Asset";
            console.log(asset_name);
            console.log("PHONENUMS: ", info.phoneNumbers);
            await info.phoneNumbers.forEach(async (data) => {
                let params = {};
                params.phoneNumber = data;
                params.msgText =
                    (info.multipleSites ? info.project_name + " | " : "") +
                    info.site_name +
                    ("\n" + info.status_text) +
                    ("\n" + timestamp + ": ") +
                    info.message;
                console.log(">>>>", info);
                console.log(params);
                await aws_integration.sendSMS(params);
            });
        } catch (e) {
            console.error("SMS Application ERROR:", e);
        }
        return true;
    }
    async sendNotification(info, payload) {
        console.log("Process Weather Station Notification: ", info);
        try {
            if (info) {
                let params = {};

                let time_zone = "America/New_York";
                if (info.location_lat !== "" && info.location_lng !== "")
                    time_zone = tzlookup(info.location_lat, info.location_lng);

                let timestamp = moment
                    .tz(payload.timestamp, time_zone)
                    .format("MM/DD/YYYY hh:mmA ");
                console.log("TIME: ", timestamp);
                let asset_name =
                    info.asset_name !== null && info.asset_name !== undefined
                        ? info.asset_name
                        : "Asset";
                console.log(asset_name);
                console.log("EMAILIDS", info.emailAddrs);
                if (info.emailAddrs.length > 0) {
                    // await fs.readFile(
                    //   "./email-Temp-Weather-Notifications.html",
                    //   async function(err, emailHtmlTemplate) {
                    //     if (err) {
                    //       console.log("Unable to load HTML Template");
                    //       throw err;
                    //     }
                    var emailData = {
                        is_multiSites: info.multipleSites,
                        site_name: info.site_name,
                        status_text: info.status_text,
                        body_text: info.message,
                        asset_name: asset_name,
                        timestamp: timestamp,
                        project_name: info.project_name,
                        project_location: info.project_location,
                        s3_asset_url: getS3EmailAssetsUrl(),
                        icon_url: getS3EmailAssetsUrl() + info.icon_name,
                        url: process.env.CLOUDUI_URL + ("/home/projects/" + info.site_id + "/overview"),
                        current_time: new Date(),
                    };
                    console.log(emailData);
                    var templateHtml = Handlebars.compile(
                        utils.emailTempWeatherNotifications.toString()
                    );
                    var bodyHtml = templateHtml(emailData);
                    console.log("EMAILIDS: ", info.emailAddrs);
                    // params.emailAddrs = info.emailAddrs;
                    params.msgbody = bodyHtml;
                    params.msgSubject =
                        (info.multipleSites ? info.project_name + " | " : "") +
                        info.site_name +
                        (" | " + info.status_text);
                    //console.log(params);
                    info.emailAddrs.forEach(async (data) => {
                        params.emailAddrs = [data];
                        await aws_integration.sendEmail(params);
                    });

                    //   }
                    // );
                }
            } else {
                console.log("NO Notif");
            }
        } catch (e) {
            console.error("WS Application ERROR:", e);
        }
        return true;
    }
}

exports.increaseWeatherReportingService = new IncreaseWeatherReportingService();
