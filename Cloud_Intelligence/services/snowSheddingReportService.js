const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
const Handlebars = require("handlebars");
const utils = require("../utils");
const { getS3EmailAssetsUrl } = require("../utils/libs/functions");
const { addFullCloudEventLog } = require("../models/cloudEventLog.model");
const { notificationSettingService } = require("./notificationSettingService");
const { notificationService } = require("./common/notificationService");
const functions = require("../utils/libs/groupedEventsHelperFunctions");
var unflatten = require('flat').unflatten;
class SnowSheddingReportService {
  async handler(client, pgWrite, payload) {

    console.log("SnowSheddingReportService handler:", payload);
    this.client = client;
    this.pgWrite = pgWrite;
    this.payload = unflatten(payload);
    try {
      return await this.processEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error SnowSheddingReportService handler..!!",
        err
      );
    }
  }

  async processEvent() {
    try {
      //todo add cloud_event_log entry
      //todo if report have failed then do send notifications

      let reportDetail = unflatten(JSON.parse(this.payload.reportDetail));
      let title = reportDetail.snow_shedding_report.delayed === true ? 'Delayed Snow Shed Report' : 'Snow Shedding Report';

      await addFullCloudEventLog(
        this.pgWrite,
        this.payload.asset_id,
        20,
        this.payload.timestamp,
        'SNOW_SHEDDING_REPORT',
        null,
        title,
        'mode_snow_blue',
        1,
        null,
        null,
        JSON.parse(this.payload.reportDetail)
      );
      let info = await this.getUpdateMeta();
      //const reportDetail = JSON.parse(this.payload.reportDetail);

      reportDetail = reportDetail.snow_shedding_report;
      if (reportDetail.hasOwnProperty('failed') ||
        reportDetail.hasOwnProperty('unresponsive')) {
        if (info.is_notify)
          await this.sendNotification(info, reportDetail);
      }
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error processEvent handler..!!",
        err
      );
    }

  }

  async getUpdateMeta() {
    let info = {};
    try {
      const network_controller_info = await this.client.query(db.ncInfo, [
        this.payload.network_controller_id,
      ]);
      if (network_controller_info.rows.length !== 0) {
        let data = network_controller_info.rows[0];
        info.is_notify = data.is_notify;
        info.site_id = data.site_id;
        info.site_name = data.site_name;
        info.device_type = "Network Controller";
        info.location_lat = data.location_lat;
        info.location_lng = data.location_lng;
        info.asset_name = data.network_controller_name;
        info.project_name = data.project_name;
        info.project_id = data.project_id;
        info.project_location = data.project_location;
        info.site_ghi = data.site_ghi;
        info.site_poa = data.site_poa;
        info.enter_diffuse_mode_duration = data.enter_diffuse_mode_duration;
        info.exit_diffuse_mode_duration = data.exit_diffuse_mode_duration;
      }
      info.multipleSites = await notificationService.checkProjectSites(this.client, info.project_id);
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error getUpdateMeta..!!", err);
    }

    return info;
  }

  async sendNotification(info, reportDetail) {
    try {
      console.log("sendNotification ReportDetail: ", reportDetail);
      let status_text = `Snow Shedding Report`;

      info.status_text = `Snow Shedding Report`;
      let time_zone = "America/New_York";
      if (info.location_lat !== "" && info.location_lng !== "")
        time_zone = tzlookup(info.location_lat, info.location_lng);

      let timestamp = moment
        .tz(this.payload.timestamp, time_zone)
        .format("hh:mmA on MMM DD, YYYY ");
      info.timestamp = timestamp;
      info.device_type = info.device_type !== null ? info.device_type : "Asset";
      info.asset_name =
        info.asset_name !== null ? info.asset_name : info.device_type;
      //Notification accounts
      let notificationType = "snow_shedding_report";
      var userAccounts = await notificationSettingService.getAccounts(
        this.client,
        info.site_id,
        notificationType
      );
      info.emailAddrs = userAccounts.emails;
      info.phoneNumbers = userAccounts.phone_nums;

      info.smsText = functions.getSnowSheddingGroupedEventsForSMS(info, reportDetail, status_text, timestamp);

      console.log(`SMS: ${info.smsText}`);
      //todo: add snap address
      if (info.phoneNumbers.length > 0) {
        await this.sendSMSNotification(info);
      }
      if (info.emailAddrs.length > 0) {
        let msgsubject =
          info.site_name + " | " + status_text;
        let detail_text = functions.getSnowSheddingGroupedEvents(reportDetail);

        // console.log(detail_text);
        let body_text = ``;

        // console.log("--body_text: ", body_text);
        // console.log("--detail_text: ", detail_text);
        // console.log("--project_location: ", info.project_location);

        info.body_text = body_text;
        info.msgSubject = msgsubject;
        info.detail = detail_text;

        await this.sendEmailNotification(info);
      }
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error sendNotification..!!", err);
    }
  }




  async sendSMSNotification(info) {
    try {
      console.log("PHONENUMS: ", info.phoneNumbers);
      info.phoneNumbers.forEach(async (data) => {
        let params = {};
        params.phoneNumber = data;
        params.msgText = info.smsText;
        console.log(params);
        await aws_integration.sendSMS(params);
      });
      return true;
    } catch (e) {
      console.error("Error in sendSMSNotification... " + e);
    }
  }
  async sendEmailNotification(payload) {
    console.log("email notification ", payload);
    try {
      let params = {};
      console.log("EMAILADRS: ", payload.emailAddrs);
      var emailData = {
        is_multiSites: payload.multipleSites,
        site_name: payload.site_name,
        status_text: payload.status_text,
        body_text: payload.body_text,
        asset_name: payload.asset_name,
        timestamp: payload.timestamp,
        detail: payload.detail,
        project_name: payload.project_name,
        project_location: payload.project_location,
        s3_asset_url: getS3EmailAssetsUrl(),
        icon_url: getS3EmailAssetsUrl() + payload.icon_name,
        url: process.env.CLOUDUI_URL + ("/home/projects/" + payload.site_id + "/overview"),
        current_time: new Date(),
      };
      console.log(`emailData: `, emailData);
      var templateHtml = Handlebars.compile(utils.emailTempSiteMode.toString());
      var bodyHtml = templateHtml(emailData);
      params.msgSubject = (payload.multipleSites ? payload.project_name + " | " : "") + payload.msgSubject;
      params.msgbody = bodyHtml;
      // console.log(bodyHtml);
      payload.emailAddrs.forEach(async (data) => {
        params.emailAddrs = [data];
        await aws_integration.sendEmail(params);
      });

      return true;
    } catch (e) {
      console.error("Error in sendEmailNotification... " + e);
    }
  }
}

exports.snowSheddingReportService = new SnowSheddingReportService();
