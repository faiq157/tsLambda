const db = require("../db");

const {
  getPgTimestamp,
  getOldTime,
  addTime,
} = require("../utils/libs/functions");

// Number of hours for which if there is no change in data send notifications
let hours;
const noWeatherStowHours = 8;
const weatherStowHours = 12;

class WindAlarm {
  constructor(client, wsId) {
    // pg reader instance to query for data
    this.client = client;
    // Id of Network COntroller the Weather Station is connected
    this.ncId = null;
    // Id of the Weather Station update is received from
    this.wsId = wsId;
    // Date Object of when the NC woke up
    this.ncWakeUp = null;
    // Date Object of when the NC slept
    this.ncSleep = null;
    // records from "weather_hist" table
    this.windData = null;
  }

  /**
   * https://terratrak.atlassian.net/browse/TC-1354
   * https://terratrak.atlassian.net/browse/TC-1425
   * Check for the cloud updates in last 8 hours
   * Check if the NC is sleeping, this is done by checking the "cloud_event_log" table
   * If NC is sleeping and has not woke up then return false
   * If NC has woken check in last 8 hours if same updates are received
   */
  async sendNotifications() {
    try {
      await this.isInWeatherStow();

      await this.getNC(this.wsId);

      await this.getWindData();

      await this.getNightlyStowTime();

      await this.getTrackingAfterSleepTime();

      return this.windHasSameVals();
    } catch (error) {
      console.log("sendNotifications error: ", error);
      return false;
    }
  }

  /**
   * Parses through the wind data and if two different values are found returns false.
   * It also makes sure that if NC went to sleep and then woke-up, that time is not considered,
   * as mentioned in the Jira ticket. This is done by calling the "addSleepTime" function.
   * It breaks the loop immediately and returns true if two different values are found or
   * the timestamp of the windData record is greater than the time returned by the "addSleepTime"
   */
  windHasSameVals() {
    let avg = null;
    let speed = null;
    let direction = null;
    let gust = null;

    const checkTill = this.addSleepTime();
    let result = true;
    this.windData.some((e) => {
      const timestamp = new Date(e.timestamp);
      // console.log(`Checking: ${JSON.stringify(e)} `);
      if (timestamp > checkTill) {
        if (!(timestamp < this.ncWakeUp && timestamp > this.ncSleep)) {
          // Set initial values, no need to check if this timestamp > wake-up time
          // Since we are already throwing and catching in case of NC is still sleeping
          if (avg === null && e.avg !== null) avg = e.avg;
          if (speed === null && e.speed !== null) speed = e.speed;
          if (direction === null && e.direction !== null)
            direction = e.direction;
          if (gust === null && e.gust !== null) gust = e.gust;

          // Check if any value has changed, if it has break the loop and return
          // May look complex but is pretty simple just some OR conditions
          // If anything changes the loop will break
          if (
            avg !== e.avg ||
            speed !== e.speed ||
            direction !== e.direction ||
            gust !== e.gust
          ) {
            console.log("Breaking loop(diff) at: ", e);
            result = false;
            return true;
          }
        } else {
          console.log("Skipping while in sleep: ", e);
        }
      } else {
        console.log("Breaking loop(timestamp) at: ", e);
        result = true;
        return true;
      }
    });

    return result;
  }

  /**
   * If NC had a sleep-wake cycle adds the time spent during this cycle to 8 hours,
   */
  addSleepTime() {
    let timeToMinus = hours * 3600000;
    if (this.ncSleep && this.ncWakeUp) {
      let sleep = new Date(this.ncSleep);
      sleep = sleep.getTime();

      let wakeUp = new Date(this.ncWakeUp);
      wakeUp = wakeUp.getTime();

      timeToMinus = timeToMinus + (wakeUp - sleep);
    }

    let now = new Date();
    now = now.getTime();

    const result = new Date(now - timeToMinus);
    console.log("Check till this: ", result);
    return result;
  }

  /**
   * Returns the wind data for a WS
   */
  async getWindData() {
    // get 24 hour old timestamp
    const fetchSince = getPgTimestamp(getOldTime(24));
    const query = db.getWindData;
    const result = await this.client.query(query, [this.wsId, fetchSince]);
    console.log("Querying For Wind Data: ", query, [this.wsId, fetchSince]);
    // console.log("Got wind data: ", result.rows);
    this.windData = result.rows.map((row) => ({
      avg: row.avg < 1 ? 0 : row.avg,
      speed: row.speed < 1 ? 0 : row.speed,
      gust: row.gust < 1 ? 0 : row.gust,
      direction: row.direction < 1 ? 0 : row.direction,
      timestamp: row.timestamp,
    }));
  }

  /**
   * Check If NC went to sleep in last 24 hours and if its sleep mode
   * if it is then exit by throwing error, if its not set the values on sleep and wake-up time
   * This data is stored in "network_controller" table, in "last_sleep_mode_update"(its a timestamp)
   * and "wake_up" (seconds for which sleep will happen) columns.
   */
  getNCSleepWakeTime(data) {
    if (!data?.sleep || !data.wake_up) {
      throw new Error("NC Sleep and wakeup time doesn't exist");
    }

    this.ncSleep = data.sleep;

    // time from DB, how long NC would sleep for (in seconds)
    const wake_up_seconds = data.wake_up * 1000;
    // converting timestamp to unix timestamp for comparison/debugging
    const sleep = data?.sleep?.getTime();

    // Timestamp of when NC would wake up
    this.ncWakeUp = new Date(sleep + wake_up_seconds);

    const now = new Date().getTime();

    // throw if NC is still in sleep mode
    // This is caught and false is sent to caller
    if (sleep + wake_up_seconds > now) throw new Error("NC is Still Asleep");
  }

  /**
   * Usually the night time stow happens 15-20 minutes before NC Sleep
   * but if the weather stow has happened then we'll not have a Night Time Stow event
   * For instances where there is not night time stow event then we'll use the NC Sleep
   * Event sleep event start time as the time which will not be checked for anomalous behaviour
   */
  async getNightlyStowTime() {
    const query = db.getNightlyStowEvents;
    // check for night time stow one hour before the sleep event has happened
    const ncStowEventTime = getPgTimestamp(getOldTime(1, this.ncSleep));
    const queryParams = [this.ncId, this.ncSleep, 5, ncStowEventTime];
    const result = await this.client.query(query, queryParams);
    console.log("Querying For Nightly Stow: ", query, queryParams);
    console.log("Got NC Stow event data: ", result.rows);
    // If there is a night time stow event then set the ncSleep to that time
    // Because we have to check between this time
    this.ncSleep =
      result.rows.length !== 0 ? result.rows[0].changed_at : this.ncSleep;
  }

  /**
   * After NC wakes up the site goes to Tracking with BackTracking mode
   * But if the weather conditions are extreme and site is in weather stow mode the
   * This event may not come.
   * We check for this event and if preset within an hour of wake-up we add the time between
   * wake-up and this mode and add it to the sleep time
   * This way the weather updates for a WS during this time will not be checked
   * We have to change the time from 8 to 12 if the site is in weather stow mode
   */
  async getTrackingAfterSleepTime() {
    const query = db.getWakeUpEvents;
    // check for Tracking with Back Tracking one hour after the wake up event has happened
    const ncWakeUpTime = new Date(addTime(1, this.ncWakeUp));
    const queryParams = [this.ncId, this.ncWakeUp, 4, ncWakeUpTime];
    const result = await this.client.query(query, queryParams);
    console.log("Querying For Tracking: ", query, queryParams);
    console.log("Got NC Wake event data: ", result.rows);
    // If there is a Tracking with Back Tracking event then set the ncWakeUp to that time
    this.ncWakeUp =
      result.rows.length !== 0 ? result.rows[0].changed_at : this.ncWakeUp;
  }

  /**
   * Checks if the asset is in weather stow currently, if it is change
   * "hours" from 8 to 12
   */
  async isInWeatherStow() {
    const query = db.isInWeatherStow;
    const result = await this.client.query(query, [this.wsId]);

    hours =
      result.rows.length && result.rows[0].commanded_state === 2
        ? weatherStowHours
        : noWeatherStowHours;
  }

  /**
   * Get the Network Controller ID from the asset_id
   */
  async getNC() {
    const query = db.getNC;
    const result = await this.client.query(query, [this.wsId]);
    console.log("Got NC ", result.rows);

    if (!result.rows.length) throw new Error("NC not found for: ", this.wsId);

    if (result.rows[0].device_type !== "Weather Station") {
      console.warn("Not a WS");
      return false;
    }

    if (result.rows[0].has_wind_sensor === false) {
      console.warn("No wind Sensor on this Weather Station")
      return false;
    }


    this.ncId = result.rows[0].nc_id;

    this.getNCSleepWakeTime(result.rows[0]);
  }
}

exports.WindAlarm = WindAlarm;
