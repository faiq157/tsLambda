const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const fs = require("fs");
const db = require("../db");
var Handlebars = require("handlebars");
const { notificationSettingService } = require("../services/notificationSettingService");
const utils = require("../utils");
const {getS3EmailAssetsUrl} = require("../utils/libs/functions");

exports.handleNCHist = async function (client, payload) {
  console.log("network_controller_connection_hist ", payload);
  const network_controller_info = await client.query(db.ncInfo, [
    payload.network_controller_id,
  ]);
  let info = {};
  let is_notify_nc_stauts = true;
  await network_controller_info.rows.forEach(async (data) => {
    is_notify_nc_stauts = data.is_notify;
    info.site_id = data.site_id;
    info.site_name = data.site_name;
    info.device_type = "Network Controller";
    info.location_lat = data.location_lat;
    info.location_lng = data.location_lng;
    info.asset_name = data.network_controller_name;
    info.project_location = data.project_location;
    info.network_controller_connected_status = data.connected;
    info.network_controller_last_connected = data.last_connected;
    info.network_controller_last_disconnected = data.last_disconnected;
  });
  if (is_notify_nc_stauts) {
    var userAccounts = await notificationSettingService.getAccounts(
      client,
      info.site_id,
      "nc_status"
    );
    info.emailAddrs = userAccounts.emails;
    info.phoneNumbers = userAccounts.phone_nums;
    info.payload = payload;
    processNCConnNotifications(info);
  } else {
    console.log("SITE NOTIFICATION DISABLED");
  }
};

const processNCConnNotifications = async function (payload, callback) {
  console.log("Process Notification ", payload);
  try {
    if (payload) {
      let params = {};

      let time_zone = "America/New_York";
      if (
        payload.location_lat !== "" &&
        payload.location_lat !== 0 &&
        payload.location_lng !== "" &&
        payload.location_lng !== 0
      )
        time_zone = tzlookup(payload.location_lat, payload.location_lng);

      let timestamp = moment
        .tz(payload.payload.timestamp, time_zone)
        .format("hh:mmA on MM/DD/YYYY ");

      let status_text,
        icon_name = "";
      if (payload.payload.connected_state == true) {
        status_text = "Network Controller Online";
        icon_name = "cloud_online_2_48x48.png";
      } else {
        status_text = "Network Controller Offline";
        icon_name = "cloud_off_48x48.png";
      }

      // console.log("EMAILIDS", payload.emailAddrs);
      // await fs.readFile("./email-Temp.html", async function(
      //   err,
      //   emailHtmlTemplate
      // ) {
      // if (err) {
      //  q console.log("Unable to load HTML Template");
      //   throw err;
      // }
      console.log("PHONENUMS: ", payload.phoneNumbers);
      await payload.phoneNumbers.forEach(async (data) => {
        params = {};
        params.phoneNumber = data;
        params.msgText =
          payload.site_name + "'s \n" + status_text + " at " + timestamp;
        console.log(params);
        await aws_integration.sendSMS(params);
      });

      console.log("EMAILIDS", payload.emailAddrs);
      if (payload.emailAddrs.length > 0) {
        var emailData = {
          site_name: payload.site_name,
          status_text: status_text,
          asset_name: payload.asset_name,
          timestamp: timestamp,
          project_name: payload.project_name,
          project_location: payload.project_location,
          s3_asset_url: getS3EmailAssetsUrl(),
          icon_url: getS3EmailAssetsUrl() + icon_name,
          url:
            process.env.CLOUDUI_URL +
            ("/home/projects/" + payload.site_id + "/overview"),
          current_time: new Date(),
        };
        console.log("EmailData ", emailData);
        var templateHtml = Handlebars.compile(utils.emailTemp.toString());
        // params.emailAddrs = payload.emailAddrs;
        params.msgSubject = payload.site_name + " | " + status_text;
        var bodyHtml = templateHtml(emailData);
        params.msgbody = bodyHtml;
        //console.log(params);
        payload.emailAddrs.forEach(async (data) => {
          params.emailAddrs = [data];
          await aws_integration.sendEmail(params);
        });
        // });
      }

      console.log(params);
    } else {
      console.log("No payload");
    }
  } catch (e) {
    //console.error("Application ERROR:", e);
  } finally {
    console.log("releasing client");
  }
  return true;
};
