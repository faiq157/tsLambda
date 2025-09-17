const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { exeQuery } = require("../utils/lib/pg");
const { getSnapAddr } = require("../utils/helpers/functions");
const { getAssetBySnapAddr } = require("../models/asset.model");
// const db = require("../db");

class VegetationUpdateService {
  async handler(pbUpdate, nc_id, ncSnapAddr) {
    try {
      console.log("In VegetationUpdateService Handler ..");
      this.vegetationUpdate = pbUpdate;
      this.nc_id = nc_id;

      this.snapAddr = this.vegetationUpdate.getAssetSnapAddr_asU8();
      if (this.snapAddr) {
        this.snapAddrStr = this.snapAddr.reduce(
          (str, c) => str + c.toString(16).padStart(2, "0"),
          ""
        );
      }

      const assetInfo = await getAssetBySnapAddr(this.snapAddrStr); 
      if (assetInfo?.repeater_only) {
        console.info("In VegetationUpdateService Ignoring repeater update,", this.snapAddrStr);
        return null
      }

      this.when = this.vegetationUpdate.getWhen().toDate();
      this.modeStatus = this.vegetationUpdate.getVegetationModeStatus();
      this.temperature_threshold = this.vegetationUpdate.getTemperatureThreshold();
      let days_history = this.vegetationUpdate.getDaysHistoryList();
      let snap_addresses = this.vegetationUpdate.getAssetSnapAddressesList_asU8();
      let newalyAdded_snap_addresses = this.vegetationUpdate.getAssetSnapAddressesList_asU8();
      let is_startup_update = this.vegetationUpdate.getIsStartupUpdate();
      this.who = this.vegetationUpdate.getWho();
      console.log("who: ", this.who);
      let active_snap_addrs = [];
      for (let snapadr of snap_addresses) {
        console.log("active snap_addr: ", snapadr);
        if (snapadr) {
          console.log("active snap_addr: ", getSnapAddr(snapadr));
          active_snap_addrs.push(getSnapAddr(snapadr));
        }
      }
      let new_snap_addrs = [];
      for (let snapadr of newalyAdded_snap_addresses) {
        console.log("new snap_addr: ", snapadr);
        if (snapadr) {
          console.log("new snap_addr: ", getSnapAddr(snapadr));
          new_snap_addrs.push(getSnapAddr(snapadr));
        }
      }
      console.log("is_starup: ", is_startup_update);
      console.log(`daysHist: `, days_history);
      let daysHist = [];
      for (let hist of days_history) {
        daysHist.push(hist);
      }
      this.daysHist = daysHist;
      let history_exists = true;
      //check if we need to add new alert & history or not
      if (new_snap_addrs.length !== 0) {
        this.snapAddrStr = new_snap_addrs[0];
        //check if is_startup_update is true then check if we have already have an active alert
        //check if already have active vegetation alert or not

        const activeAlert = await exeQuery(`
          SELECT * FROM terrasmart.weather WHERE weather.asset_id in (
            SELECT id from terrasmart.asset 
              WHERE asset.parent_network_controller_id = $1::UUID
            ) AND weather.is_active_vegetation_alert = true;
            `, [this.nc_id]);
        console.log("WX with active alert: ", activeAlert);
        if (activeAlert.length === 0) {
          //check which asset have active alert set snapAddr for that 
          history_exists = false;
        }

      }

      if (this.modeStatus === true && history_exists === true) {
        await this.insertVegetationkHistory();

        console.log(`UPDATE terrasmart.weather set is_active_vegetation_alert = true
        WHERE weather.asset_id in 
        (SELECT id FROM terrasmart.asset WHERE snap_addr in (${active_snap_addrs.length == 0 ? "'" + this.snapAddrStr + "'" : this.getActiveAssetsSnapAddrStr(active_snap_addrs)}));
        ;`);

        const updateVegetationStatus = await exeQuery(`UPDATE terrasmart.weather set is_active_vegetation_alert = true
        WHERE weather.asset_id in 
        (SELECT id FROM terrasmart.asset WHERE snap_addr in (${active_snap_addrs.length == 0 ? "'" + this.snapAddrStr + "'" : this.getActiveAssetsSnapAddrStr(active_snap_addrs)}));
        ;`);
        console.log("updateVegetationStatus: ", updateVegetationStatus);
      } else if (this.modeStatus === false) {
        console.log(`
          UPDATE terrasmart.weather SET is_active_vegetation_alert = false
          WHERE weather.asset_id in (
          SELECT id from terrasmart.asset 
            WHERE asset.parent_network_controller_id = $1::UUID
          ) AND weather.is_active_vegetation_alert = true;
          `, [this.nc_id]);
        const removeVegetationAlertStatus = await exeQuery(`UPDATE terrasmart.weather SET is_active_vegetation_alert = false
        WHERE weather.asset_id in (
        SELECT id from terrasmart.asset 
          WHERE asset.parent_network_controller_id = $1::UUID
        ) AND weather.is_active_vegetation_alert = true;`, [this.nc_id]);
        console.log("removeVegetationAlertStatus: ", removeVegetationAlertStatus);
      }
      await this.sendToElasticSearch(ncSnapAddr);
      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in VegetationUpdateService handler..!!"
      );
    }
  }

  getActiveAssetsSnapAddrStr(active_snap_addrs) {
    let query = ``;
    let counter = 1;
    active_snap_addrs.forEach(element => {
      if (counter < active_snap_addrs.length) {
        query += `'${element}',`;
      } else {
        query += `'${element}'`;
      }
      counter++;
    });
    console.log("activeAssetQuery ", query);
    return query;
  }

  async insertVegetationkHistory() {
    console.log("In insertVegetationkHistory()");
    if (this.snapAddrStr !== null && this.snapAddrStr !== '' && this.snapAddrStr !== undefined) {
      console.log("query :", `INSERT INTO terrasmart.vegetation_alert_hist (snap_addr, timestamp, vegetation_mode_status, temperature_threshold,days_history )
      VALUES ('${this.snapAddrStr}'::VARCHAR,
              ${new Date(this.when).getTime()} :: BIGINT,
              ${this.modeStatus} :: BOOLEAN,
              ${this.temperature_threshold} :: INT,
              Array [${this.daysHist}] :: INTEGER[])`
      );

      return await exeQuery(`INSERT INTO terrasmart.vegetation_alert_hist (snap_addr, timestamp, vegetation_mode_status, temperature_threshold,days_history )
        VALUES ('${this.snapAddrStr}'::VARCHAR,
                ${new Date(this.when).getTime()} :: BIGINT,
                ${this.modeStatus} :: BOOLEAN,
                ${this.temperature_threshold} :: INT,
                Array [${this.daysHist}] :: INTEGER[])`)
        .catch((err) => {
          console.log("Error in insertVegetationkHistory .. ");
          throw err;
        });
    } else {
      console.log(`Snap address not exist`);
    }

  }

  async sendToElasticSearch(ncSnapAddr) {
    try {
      console.log("Sending to SNS...")
      let info = {};
      info.snap_addr = this.modeStatus === false ? getSnapAddr(ncSnapAddr) : this.snapAddrStr;
      info.timestamp = this.when;
      info.modeStatus = this.modeStatus;
      info.temperature_threshold = this.temperature_threshold;
      info.daysHist = this.daysHist;
      info.nc_id = this.nc_id;
      info.who = this.who;
      info.type = "elastic_search-1";
      info.channel = "vegetation_update";

      console.log("payload to be sent to ElasticSearch : ", info);
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(info);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.log("Error in sendToElasticSearch .. ", err);
      throw err;
    }
  }

}

exports.vegetationUpdateService = new VegetationUpdateService();
