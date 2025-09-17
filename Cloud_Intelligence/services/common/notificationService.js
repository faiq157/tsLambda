const db = require("../../db");
const tzlookup = require("tz-lookup");
var Handlebars = require("handlebars");
const utils = require("../../utils");
const {getS3EmailAssetsUrl} = require("../../utils/libs/functions");
const { getSiteByProjectID } = require("../../pg");

class NotificationService {

  async checkProjectSites(projectId) {
    try {
      const getSitesInfo = await getSiteByProjectID(projectId);
      if (getSitesInfo.rows.length > 1) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log('ERROR...', err);
    }

  }
  getTimeFromTimezone(location_lat, location_lng, timestamp) {
    let time_zone = "America/New_York";
    if (location_lat !== "" && location_lng !== "")
      time_zone = tzlookup(location_lat, location_lng);

    return moment
      .tz(timestamp, time_zone)
      .format("hh:mmA on MM/DD/YYYY ");

  }

  async processLocalErrosNotifications(payload) {
    console.log("Process Connection Notification1: ", payload);
    try {
      if (payload) {
        let params = {};
        let timestamp = getTimeFromTimezone(payload.location_lat, payload.location_lng, payload.timestamp);
        console.log("TIME: ", timestamp);
        console.log("PHONENUMS: ", payload.phoneNumbers);
        payload.phoneNumbers.forEach(async (data) => {
          params = {};
          params.phoneNumber = data;
          params.msgText =
            payload.site_name +
            " | " +
            (payload.asset_name !== null
              ? payload.asset_name
              : payload.device_type) +
            (" - " + payload.status_text) +
            ("\n at " + timestamp);
          console.log(params);
          await aws_integration.sendSMS(params);
        });

        console.log("EMAILADRS: ", payload.emailAddrs);
        if (payload.emailAddrs.length > 0) {
          var emailData = {
            site_name: payload.site_name,
            status_text: payload.status_text,
            asset_name: asset_name,
            timestamp: timestamp,
            project_name: payload.project_name,
            project_location: payload.project_location,
            msg: payload.message,
            s3_asset_url: getS3EmailAssetsUrl(),
            url: process.env.CLOUDUI_URL + ("/home/projects/" + payload.site_id + "/overview"),
            current_time: new Date(),
          };
          console.log(emailData);
          var templateHtml = Handlebars.compile(utils.emailTemp.toString());
          var bodyHtml = templateHtml(emailData);
          params.msgSubject =
            payload.site_name +
            " | " +
            (payload.device_type !== null ? payload.device_type : "Asset ") +
            (" - " + payload.status_text);
          // params.emailAddrs = payload.emailAddrs;
          params.msgbody = bodyHtml;
          //console.log(params);
          payload.emailAddrs.forEach(async (data) => {
            params.emailAddrs = [data];
            await aws_integration.sendEmail(params);
          });
          // });
        }
      } else {
        console.log("NO Notif");
      }

      return true;
    } catch (e) {
      //console.error("Application ERROR:", e);
    } finally {
      console.log("releasing client");
    }
  };

}

exports.notificationService = new NotificationService();
