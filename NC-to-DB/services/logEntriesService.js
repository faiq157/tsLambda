const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");
class LogEntriesService {
  async handler(netCtrlId, pbUpdate) {
    console.log("LogEntries Handler ..");
    this.logEntry = pbUpdate;
    
    try {
      
      const insertEventLog_res = await this.insertEventLog(netCtrlId);

      return insertEventLog_res.rowCount;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in logEntries handler..!!"
      );
    }
  }

  async insertEventLog(net_ctrl_id) {
    console.log("In insertEventLog()");
    
    return exeQuery(db.eventLogInsert, [
      this.logEntry.getLogger(),
      this.logEntry.getMessage(),
      this.logEntry.getLevelno(),
      this.logEntry.getCreated().toDate(),
      this.logEntry.getType(),
      net_ctrl_id,
    ])
    .catch((err) => {
      console.log("Error in insertEventLog .. ");
        console.log("Error in insertEventLog query :", db.eventLogInsert, [
          this.logEntry.getLogger(),
          this.logEntry.getMessage(),
          this.logEntry.getLevelno(),
          this.logEntry.getCreated().toDate(),
          this.logEntry.getType(),
          net_ctrl_id,
        ]);
        throw err;
      });
  }
}

exports.logEntriesService = new LogEntriesService();
