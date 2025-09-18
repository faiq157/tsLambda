const db = require("../db");
const { getPgTimestamp, getOldTime } = require("../utils/libs/functions");
const { exeQuery } = require("../pg");

// Number of hours for which if there is no change in data send notifications
const hours = 8;

class StowEvents {
  constructor(ncId) {
    // Id of Network Controller the Weather Station is connected
    this.ncId = ncId;
    this.stowData = null;
  }

  getStowTime() {}

  async getStowEvents() {
    const query = db.getStowEvents;
    const result = await exeQuery(query, [this.ncId, this.ncSleep]);
    console.log("Got NC WakeUp data: ", result.rows);

    if (!result.rows.length) throw new Error("NC is Still Asleep");

    return result.rows.length ? new Date(result.rows[0].created) : null;
  }
}

const o = new StowEvents("f53bfad9-d31f-46bf-b9e6-9fd66c42ee22");
