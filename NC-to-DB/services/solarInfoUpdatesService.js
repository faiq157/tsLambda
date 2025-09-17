// const { queueHelper } = require("../utils/helpers/QueueHelper");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");

class SolarInfoUpdatesService {
  async handler(netCtrlResults, pbUpdate) {
    console.log("In SolarInfoUpdatesService Handler ..");
    this.solarInfoUpdate = pbUpdate;
    
    try {
      let net_ctrl_id = netCtrlResults.rows[0].id;
      let when = this.solarInfoUpdate.getWhen().toDate();
      let sunrise = this.solarInfoUpdate.getSunrise().toDate();
      let sunset = this.solarInfoUpdate.getSunset().toDate();
      let wakeup_time = this.solarInfoUpdate.getWakeupTime();

      const ncUpdateResult = await exeQuery(
        db.updateSolarInfoQuery,
        [when, wakeup_time, sunrise, sunset, net_ctrl_id]
      );

      console.log("SLEEPMODE data result: ", ncUpdateResult.rowCount);
      //add network controller history
      console.log(
        db.addSolarInfoHistQuery,[when, wakeup_time, sunrise, sunset, when, net_ctrl_id]
      );
      const ncConHistInsertResult = await exeQuery(
        db.addSolarInfoHistQuery,
        [when, wakeup_time, sunrise, sunset, when, net_ctrl_id]
      );
      console.log("NCC HIST ADD ", ncConHistInsertResult.rowCount);
      //Send SleepEvent To ES
      let sleepEventParams = {};
      sleepEventParams.wake_up_time = wakeup_time;
      sleepEventParams.timestamp = when;
      sleepEventParams.network_controller_id = net_ctrl_id;
      sleepEventParams.asset_id = netCtrlResults.rows[0].asset_id;
      sleepEventParams.name = netCtrlResults.rows[0].name;
      sleepEventParams.type = "elastic_search-1";
      sleepEventParams.channel = "network_controller_sleep_event";
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(sleepEventParams);
        // await queueHelper.queueDetectedAnomaly(sleepEventParams); // network_controller_sleep_event
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }

      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in sleepModeData handler..!!"
      );
    }
  }
}

exports.solarInfoUpdatesService = new SolarInfoUpdatesService();
