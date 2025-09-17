const { exeQuery } = require("../utils/lib/pg");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const db = require("../db");
const util = require("../util");

class CellUpdatesService {
  async handler(pbUpdate, principal) {
    // Update and the principal, needed in one of the queries

    try {
      console.log("In CellUpdatesHandler ..");
      this.cellUpdate = pbUpdate;
      // get Id from the DB, donot know why not used the already provided one
      const getNetCtrlId_response = await this.getNetCtrlId(principal);
      // console.log("queryResult : ", getNetCtrlId_response.rows);

      // proceed if we get one
      if ((await getNetCtrlId_response.rows.length) !== 0) {
        const cellIdByNCId_response = await this.getCellByNCId(
          getNetCtrlId_response.rows[0].id
        );
        // console.log("queryResult : ", cellIdByNCId_response.rows);

        // If we donot have its updates in our record, insert one
        if (cellIdByNCId_response.rows.length === 0) {
          await this.insertCellTimeInfo(
            getNetCtrlId_response.rows[0].id
          );
          // console.log("queryResult : ", insertCellTimeInfo_response.rowCount);
        } else {
          // in case we have tiin our records, update
          await this.updateCellTimeInfo(
            getNetCtrlId_response.rows[0].id
          );
          // console.log("queryResult : ", updateCellTimeInfo_response.rowCount);
        }

        // Insert the update in history table
        await this.insertCellUptimeHistory(
          getNetCtrlId_response.rows[0].id
        );
        // console.log("queryResult : ", insertCellUptimeHistory_response.rowCount);

        await notificationHelper.sendCellUpdate(pbUpdate);
      }

      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in cellUpdates handler..!!"
      );
    }
  }

  async getNetCtrlId(principal) {
    return exeQuery(db.netCtrlQuery, [principal]).catch((err) => {
      console.log("Error in getNetCtrlId .. ");
      throw err;
    });
  }

  async getCellByNCId(netCtrlId) {
    console.log("In getCellByNcId()");
    console.log("query : ", db.cellByNCId, [netCtrlId]);

    return exeQuery(db.cellByNCId, [netCtrlId]).catch((err) => {
      console.log("Error in getCellByNcId .. ");
      throw err;
    });
  }

  async insertCellTimeInfo(netCtrlId) {
    console.log("insertCellInfo");
    console.log("query : ", db.CellUptimeInsert, [
      netCtrlId,
      this.cellUpdate.getRssiDbm(),
      util.uptimeStr(this.cellUpdate.getUptime()),
      this.cellUpdate.getWhen().toDate(),
    ]);

    return exeQuery(db.CellUptimeInsert, [
        netCtrlId,
        this.cellUpdate.getRssiDbm(),
        util.uptimeStr(this.cellUpdate.getUptime()),
        this.cellUpdate.getWhen().toDate(),
      ])
      .catch((err) => {
        console.log("Error in insertCellInfo.. ");
        throw err;
      });
  }

  async updateCellTimeInfo(netCtrlId) {
    console.log("updateCellTimeInfo");
    console.log("query : ", db.UpdateCellTimeInfo, [
      this.cellUpdate.getRssiDbm(),
      util.uptimeStr(this.cellUpdate.getUptime()),
      this.cellUpdate.getWhen().toDate(),
      netCtrlId,
    ]);

    return exeQuery(db.UpdateCellTimeInfo, [
        this.cellUpdate.getRssiDbm(),
        util.uptimeStr(this.cellUpdate.getUptime()),
        this.cellUpdate.getWhen().toDate(),
        netCtrlId,
      ])
      .catch((err) => {
        console.log("Error in updateCellTimeInfo.. ");
        throw err;
      });
  }

  async insertCellUptimeHistory(netCtrlId) {
    console.log("insertCellHistory");
    console.log("query : ", db.CellUptimeHist, [
      this.cellUpdate.getRssiDbm(),
      util.uptimeStr(this.cellUpdate.getUptime()),
      this.cellUpdate.getWhen().toDate(),
      netCtrlId,
    ]);

    return exeQuery(db.CellUptimeHist, [
        this.cellUpdate.getRssiDbm(),
        util.uptimeStr(this.cellUpdate.getUptime()),
        this.cellUpdate.getWhen().toDate(),
        netCtrlId,
      ])
      .catch((err) => {
        console.log("Error in insertCellHistory.. ");
        throw err;
      });
  }

}

exports.cellUpdatesService = new CellUpdatesService();
