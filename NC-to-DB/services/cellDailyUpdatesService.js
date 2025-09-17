const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");
class CellDailyUpdatesService {
  async handler(pbUpdate, principal) {
    // Update and the principal, needed in one of the queries

    try {
      console.log("In CellDailyUpdatesHandler .. ");
      this.cellDailyUpdate = pbUpdate;
      // this.netCtrlId = netCtrlId;
      this.rxData =
        pbUpdate.getRxDataUsage() === "" ? 0 : pbUpdate.getRxDataUsage();
      this.txData =
        pbUpdate.getTxDataUsage() === "" ? 0 : pbUpdate.getTxDataUsage();

      // get Id from the DB, donot know why not used the already provided one
      const getNetCtrlId_response = await this.getNetCtrlId(principal);
      // console.log("query response: ", getNetCtrlId_response.rows);

      // proceed if we get one
      if ((await getNetCtrlId_response.rows.length) !== 0) {
        const cellIdByNCId_response = await this.getCellByNCId(
          getNetCtrlId_response.rows[0].id
        );
        // console.log("query response: ", cellIdByNCId_response.rows);

        // If we donot have its updates in our record, insert one
        if (cellIdByNCId_response.rows.length === 0) {
          const insertCellInfo_res = await this.insertCellInfo(
            getNetCtrlId_response.rows[0].id
          );
          console.log("query response: ", insertCellInfo_res.rowCount);
        } else {
          // in case we have tiin our records, update
          const updateCellInfo_res = await this.updateCellInfo(
            getNetCtrlId_response.rows[0].id
          );
          console.log("query response :", updateCellInfo_res.rowCount);
        }

        // Insert the update in history table
        const insertCellHistory_res = await this.insertCellHistory(
          getNetCtrlId_response.rows[0].id
        );
        console.log("query response :", insertCellHistory_res.rowCount);
        return insertCellHistory_res.rowCount;
      }
    } catch (err) {
      console.error("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in cellDailyUpdates handler..!!"
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
    return exeQuery(db.cellByNCId, [netCtrlId]).catch((err) => {
      console.log("Error in getCellByNcId .. ");
      throw err;
    });
  }

  async insertCellInfo(netCtrlId) {
    console.log("insertCellInfo");
    console.log("query :", db.CellInfoInsert, [
      netCtrlId,
      this.cellDailyUpdate.getWhen().toDate(),
      this.cellDailyUpdate.getImei(),
      this.cellDailyUpdate.getRoaming(),
      this.cellDailyUpdate.getMdn(),
      this.cellDailyUpdate.getLanIp(),
      this.cellDailyUpdate.getWanIp(),
      this.cellDailyUpdate.getLinkStatus(),
      this.txData,
      this.rxData,
    ]);

    return exeQuery(db.CellInfoInsert, [
        netCtrlId,
        this.cellDailyUpdate.getWhen().toDate(),
        this.cellDailyUpdate.getImei(),
        this.cellDailyUpdate.getRoaming(),
        this.cellDailyUpdate.getMdn(),
        this.cellDailyUpdate.getLanIp(),
        this.cellDailyUpdate.getWanIp(),
        this.cellDailyUpdate.getLinkStatus(),
        this.txData,
        this.rxData,
        this.cellDailyUpdate.getTowerId(),
      ])
      .catch((err) => {
        console.log("Error in insertCellInfo.. ");
        throw err;
      });
  }

  async updateCellInfo(netCtrlId) {
    console.log("updateCellInfo");
    console.log("query : ", db.UpdateCellInfo, [
      netCtrlId,
      this.cellDailyUpdate.getWhen().toDate(),
      this.cellDailyUpdate.getImei(),
      this.cellDailyUpdate.getRoaming(),
      this.cellDailyUpdate.getMdn(),
      this.cellDailyUpdate.getLanIp(),
      this.cellDailyUpdate.getWanIp(),
      this.cellDailyUpdate.getLinkStatus(),
      this.txData,
      this.rxData,
      this.cellDailyUpdate.getTowerId(),
    ]);

    return exeQuery(db.UpdateCellInfo, [
        netCtrlId,
        this.cellDailyUpdate.getWhen().toDate(),
        this.cellDailyUpdate.getImei(),
        this.cellDailyUpdate.getRoaming(),
        this.cellDailyUpdate.getMdn(),
        this.cellDailyUpdate.getLanIp(),
        this.cellDailyUpdate.getWanIp(),
        this.cellDailyUpdate.getLinkStatus(),
        this.txData,
        this.rxData,
        this.cellDailyUpdate.getTowerId(),
      ])
      .catch((err) => {
        console.log("Error in updateCellInfo.. ");
        throw err;
      });
  }

  async insertCellHistory(netCtrlId) {
    console.log("insertCellHistory");
    console.log("query :", db.CellHistInsert, [
      netCtrlId,
      this.cellDailyUpdate.getWhen().toDate(),
      this.cellDailyUpdate.getImei(),
      this.cellDailyUpdate.getRoaming(),
      this.cellDailyUpdate.getMdn(),
      this.cellDailyUpdate.getLanIp(),
      this.cellDailyUpdate.getWanIp(),
      this.cellDailyUpdate.getLinkStatus(),
      this.txData,
      this.rxData,
      this.cellDailyUpdate.getTowerId(),
    ]);

    return exeQuery(db.CellHistInsert, [
        netCtrlId,
        this.cellDailyUpdate.getWhen().toDate(),
        this.cellDailyUpdate.getImei(),
        this.cellDailyUpdate.getRoaming(),
        this.cellDailyUpdate.getMdn(),
        this.cellDailyUpdate.getLanIp(),
        this.cellDailyUpdate.getWanIp(),
        this.cellDailyUpdate.getLinkStatus(),
        this.txData,
        this.rxData,
        this.cellDailyUpdate.getTowerId(),
      ])
      .catch((err) => {
        console.log("Error in insertCellHistory.. ");
        throw err;
      });
  }
}

exports.cellDailyUpdatesService = new CellDailyUpdatesService();
