const queueHelper = require("../QueueHelper");
const db = require("../db");
const moment = require('moment');
const { accuWeatherService } = require("../services/accuWeatherService");


const cloudEventLog = `INSERT INTO terrasmart.cloud_event_log (name,levelno,created,asset_id,type,title,icon)
VALUES ($1 :: VARCHAR, $2 :: INT, $3 :: TIMESTAMP,$4 :: UUID, $5 :: INT, $6 :: VARCHAR,$7 :: VARCHAR) `;

exports.handleNCRebootUpdate = async function (client, pgWrite, payload) {

  // await pgWrite.connect();
  let reset_sec = getSeconds("0D 00:00:00");

      let isNccbUptimeReset =
        getSeconds(payload.nccbUptime) - reset_sec < 180 ? true : false;
      let isLinuxUptimeReset =
        getSeconds(payload.linuxUptime) - reset_sec < 180 ? true : false;
      let isAppUptimeReset =
        getSeconds(payload.applicationUptime) - reset_sec < 180 ? true : false;

    let wakeUpTime = await getWakeUpTime(pgWrite,payload);

    let checkWakeupInterval = compareWakeUpTime(wakeUpTime,payload);
    console.log('checkWakeupInterval',checkWakeupInterval);

    if(checkWakeupInterval){
        //Linux Uptime and Application Uptime reset, but NCCB is not = Title: Network Controller Wake Up
        // if (!isNccbUptimeReset && isLinuxUptimeReset && isAppUptimeReset) {
          await addWakeupEvent(pgWrite,payload);
       // }


    }else{
      //1. NCCB Uptime is reset and Linux uptime is reset and Application up time is reset = Title: Network Controller Reboot
      if (isNccbUptimeReset && isLinuxUptimeReset && isAppUptimeReset) {
        console.log("NC REBOOTTTT");
        await cloudEventLogResults(pgWrite, payload, "NC-REBOOT", "Network Controller Reboot", "firmware_update");
        // await client.connect();
        const nc_reboot_event = {
          channel: "local_weather_nc_reboot",
          timestamp: new Date(payload.timestamp),
          //asset_id: payload.asset_id,
          network_controller_id: payload.network_controller_id,
          type: "elastic_search-1"
        };
        await accuWeatherService.handler(client, pgWrite, nc_reboot_event);
        await client.end();
      }

      //Application Uptime is reset, but Linux uptime and NCCB are not = Title: Network Controller Application Reboot
      if (!isNccbUptimeReset && !isLinuxUptimeReset && isAppUptimeReset) {
        console.log("APP REBOOT");
        await cloudEventLogResults(pgWrite,payload,"NC-APPLICATION-REBOOT","Network Controller Application Reboot", "firmware_update");
      }

      //Linux Uptime and Application Uptime reset, but NCCB is not = Title: Network Controller Wake Up
      if (!isNccbUptimeReset && isLinuxUptimeReset && isAppUptimeReset) {
        console.log("WAKE");
        await addWakeupEvent(pgWrite, payload);
      }

      return true;
    }

};


const getWakeUpTime = async function(pgWrite,payload){
  let wakeUpTime = moment.utc();;
  //get nc wakeup time information
  const ncInfoRes = await pgWrite.query(db.ncInfoById,[payload.network_controller_id]);
    // console.log(ncInfoRes.rows);
    if(ncInfoRes.rows.length > 0){
      let ncInfo = ncInfoRes.rows[0];
      if(ncInfo.last_sleep_mode_update && ncInfo.wake_up_time){
        let sleepTime = moment(ncInfo.last_sleep_mode_update);
          console.log("sleep time ",sleepTime.format('YYYY-MM-DDTHH:mm:ss.SSSSZ'));
          console.log('wkt ',parseInt(ncInfo.wake_up_time));
          wakeUpTime = sleepTime.add(parseInt(ncInfo.wake_up_time),'second');
          console.log('wakeup time', wakeUpTime.format('YYYY-MM-DDTHH:mm:ss.SSSSZ') );
      }
    }
    return wakeUpTime;
}

const compareWakeUpTime = function(wakeUpTime,payload){
  let checkWakeupInterval = false;
    let current_timestamp = moment(payload.timestamp);
    console.log('Current Time ',current_timestamp.format('YYYY-MM-DDTHH:mm:ss.SSSSZ'));
    let wakeup_safe_interval_time = wakeUpTime.add(300, 'seconds');//5 minutes
    console.log('Future Time ',wakeup_safe_interval_time.format('YYYY-MM-DD HH:mm:ss.SSSSZ'));

    if(current_timestamp < wakeup_safe_interval_time){
      checkWakeupInterval = true;
    }
    return checkWakeupInterval;
}

const addWakeupEvent = async function(pgWrite,payload){
  console.log("WAKE");
  const checkWakeUpEvent = await pgWrite.query(
    `
    SELECT * FROM terrasmart.cloud_event_log
    WHERE name = $1::VARCHAR AND asset_id = $2::UUID AND created = $3 :: TIMESTAMP
  `,
    ["NC-WAKE", payload.asset_id, new Date(payload.timestamp)]
  );
  if (checkWakeUpEvent.rows.length === 0) {
    await cloudEventLogResults(
      pgWrite,
      payload,
      "NC-WAKE",
      "Network Controller Wake Up",
      "cloud_wakeup"
    );
    var info = {
      channel: "wakeup_event",
      asset_id: payload.asset_id,
      network_controller_id: payload.network_controller_id,
      timestamp: payload.timestamp,
      type: "elastic_search-1",
    };
    //send Info to anomalyQueue
    await queueHelper.queueDetectedAnomaly(pgWrite, info); // wakeup_event
  } else {
    console.log("NC-WAKE already exists");
  }
  return true;
}

const cloudEventLogResults = async function (
  pgWrite,
  payload,
  event_name,
  title,
  icon
) {
  return await pgWrite.query(cloudEventLog, [
    event_name,
    20,
    new Date(payload.timestamp),
    payload.asset_id,
    1, //NC Events
    title,
    icon,
  ]);
};
//This needs to be improved with already developed plugins or something better
function getSeconds(str) {
  console.log(str);
  var strAry = str.split(" ");
  var time = strAry[1].split(":");

  var days = strAry[0].replace("D", "");
  var hours = time[0];
  var minutes = time[1];
  var seconds = parseInt(time[2]);

  if (days) seconds += parseInt(days) * 86400;
  if (hours) seconds += parseInt(hours) * 3600;
  if (minutes) seconds += parseInt(minutes) * 60;

  return seconds;
}
