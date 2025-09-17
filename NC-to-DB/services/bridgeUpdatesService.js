const {updateBridgeRadioInfo} = require("../models/radio.info.model");

const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");
const {getSnapAddr} = require("../utils/helpers/functions");
class BridgeUpdatesService {
  async handler(netCtrlId, pbUpdate) {
    try {
      console.log("bridgeUpdatesService Handler ..");
      this.bridgeUpdate = pbUpdate;
      this.netCtrlId = netCtrlId;
      this.snapAddr = this.bridgeUpdate.getSnapAddr_asU8();
      this.snapAddrStr = getSnapAddr(this.snapAddr);
      const radioInfo = await exeQuery(
        db.radioInfo,
        [this.bridgeUpdate.getSnapAddr_asU8()]
      );
      console.log("radioInfo ", radioInfo.rows);
      this.radioInfo = radioInfo.rows[0];
      await this.updateBridgeInfoHist(this.radioInfo.id, this.radioInfo.asset_id);
      await this.insertBridgeInfo();
      return true
    } catch (err) {
      console.error("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in bridgeUpdatesService handler..!!"
      );
    }
  }

  async insertBridgeInfo() {
    try {
      
      const res = await exeQuery(db.bridgeInfoInsert, [
        this.bridgeUpdate.getScriptVersion().toString(),
        this.bridgeUpdate.getWhen().toDate(),
        this.netCtrlId,
      ]).catch((err) => {
        console.error("Error in insertBridgeInfo() query !!");
        throw err;
      });
      
      return res;
    } catch (err) {
      console.error("Error in insertBridgeInfo() !!");
      console.log("In insertBridgeInfo:", db.bridgeInfoInsert, [
        this?.bridgeUpdate?.getScriptVersion()?.toString(),
        this?.bridgeUpdate?.getWhen()?.toDate(),
        this?.netCtrlId
      ]);
      throw err;
    }
  }

  async updateBridgeInfoHist(radioId, assetId) {
    try {
      console.log("In updateBridgeInfoHist:", db.bridgeInfoUpdate, [
        this.bridgeUpdate.getScriptVersion(),
        this.netCtrlId
      ]);

      const res = await exeQuery(db.bridgeInfoUpdate, [
        this.bridgeUpdate.getScriptVersion(),
        this.netCtrlId,
      ]).catch((err) => {
        console.error("Error in updateBridgeInfoHist() query");
        throw err;
      });

      await updateBridgeRadioInfo(radioId, assetId, this.bridgeUpdate.getScriptVersion(), this.bridgeUpdate.getFirmwareVersion(), this.snapAddrStr);
      return res;
    } catch (err) {
      console.error("Error in updateBridgeInfoHist() !!");
    }
  }
}

exports.bridgeUpdatesService = new BridgeUpdatesService();
