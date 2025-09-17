const db = require("../db");
const { getPgTimestamp, getOldTime } = require("../utils/libs/functions");
const { pgConfig } = require("../pg");

const client = new Client(pgConfig);

// Number of hours for which if there is no change in data send notifications
const hours = 8;

class StowEvents {
  constructor(client, ncId) {
    // pg reader instance to query for data
    this.client = client;
    // Id of Network COntroller the Weather Station is connected
    this.ncId = ncId;
    this.stowData = null;
  }

  getStowTime() {}

  async getStowEvents() {
    const query = db.getStowEvents;
    const result = await this.client.query(query, [this.ncId, this.ncSleep]);
    console.log("Got NC WakeUp data: ", result.rows);

    if (!result.rows.length) throw new Error("NC is Still Asleep");

    return result.rows.length ? new Date(result.rows[0].created) : null;
  }
}

const o = new StowEvents(client, "f53bfad9-d31f-46bf-b9e6-9fd66c42ee22");
