const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");
class ClearLogEntriesService {

  constructor() {
    this.logEntry = null;
  }

  async handler(netCtrlId, pbUpdate) {
    try {
      console.log("In ClearLogEntries Handler ..");
      this.logEntry = pbUpdate;
      
      const eventLogUpdate_response = await this.eventLogUpdate(netCtrlId);
      console.log("query response : ", eventLogUpdate_response.rowCount);

      return eventLogUpdate_response.rowCount;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in clearLogEntries handler..!!"
      );
    }
  }

  async eventLogUpdate(net_ctrl_id) {
    console.log("eventLogUpdate");
    console.log("query :", db.eventLogUpdate, [
      this.logEntry.getCleared().toDate(),
      this.logEntry.getCreated().toDate(),
      net_ctrl_id,
    ]);

    return exeQuery(db.eventLogUpdate, [
        this.logEntry.getCleared().toDate(),
        this.logEntry.getCreated().toDate(),
        net_ctrl_id,
      ])
      .catch((err) => {
        console.log("Error in eventLog..");
        throw err;
      });
  }
}

exports.clearLogEntriesService = new ClearLogEntriesService();
