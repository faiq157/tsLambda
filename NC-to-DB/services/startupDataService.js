// const { queueHelper } = require("../utils/helpers/QueueHelper");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");

class StartupDataService {
  async handler(netCtrlResults, pbUpdate) {
    try {
      console.log("In startUpDataService Handler ..");
      this.startupUpdate = pbUpdate;
      
      const updateNc_res = await this.updateNc(netCtrlResults.rows[0].id);
      console.log("query response", updateNc_res.rowCount);

      const insertConnHist_res = await this.insertConnHist(
        netCtrlResults.rows[0].id
      );
      console.log("query response", insertConnHist_res.rowCount);

      await this.sendToElasticSearch(netCtrlResults);

      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in startupData handler..!!"
      );
    }
  }

  async updateNc(net_ctrl_id) {
    console.log("In updateNc()");
    
    return await exeQuery(
        db.updateStartupInfoQuery,[
          this.startupUpdate.getFwVersion(),
          this.startupUpdate.getNccbUptime(),
          this.startupUpdate.getLinuxUptime(),
          this.startupUpdate.getApplicationUptime(),
          this.startupUpdate.getWhen().toDate(),
          net_ctrl_id,
        ]
        )
        .catch((err) => {
          console.log("Error in updateNc .. ", err);
          console.log(
            "query : "+ db.updateStartupInfoQuery,
            [
              this.startupUpdate.getFwVersion(),
              this.startupUpdate.getNccbUptime(),
              this.startupUpdate.getLinuxUptime(),
              this.startupUpdate.getApplicationUptime(),
              this.startupUpdate.getWhen().toDate(),
              net_ctrl_id,
            ]
          );
        throw err;
      });
  }

  async insertConnHist(net_ctrl_id) {
    console.log("In insertConnHist()");
    console.log(
      "query : "+ db.addStartupInfoHistQuery,[
        this.startupUpdate.getFwVersion(),
        this.startupUpdate.getNccbUptime(),
        this.startupUpdate.getLinuxUptime(),
        this.startupUpdate.getApplicationUptime(),
        this.startupUpdate.getWhen().toDate(),
        net_ctrl_id,
      ]
    );

    return await exeQuery(
        db.addStartupInfoHistQuery,
        [
          this.startupUpdate.getFwVersion(),
          this.startupUpdate.getNccbUptime(),
          this.startupUpdate.getLinuxUptime(),
          this.startupUpdate.getApplicationUptime(),
          this.startupUpdate.getWhen().toDate(),
          net_ctrl_id,
        ]
      )
      .catch((err) => {
        console.log("Error in insertConnHist .. ");
        throw err;
      });
  }

  async sendToElasticSearch(netCtrlResults) {
    try {
      //Send NCReboot event To CI
      var ncRebootEventParams = {};
      ncRebootEventParams.fwVersion = this.startupUpdate.getFwVersion();
      ncRebootEventParams.nccbUptime = this.startupUpdate.getNccbUptime();
      ncRebootEventParams.linuxUptime = this.startupUpdate.getLinuxUptime();
      ncRebootEventParams.applicationUptime = this.startupUpdate.getApplicationUptime();
      ncRebootEventParams.timestamp = this.startupUpdate.getWhen().toDate();
      ncRebootEventParams.network_controller_id = netCtrlResults.rows[0].id;
      ncRebootEventParams.asset_id = netCtrlResults.rows[0].asset_id;
      ncRebootEventParams.name = netCtrlResults.rows[0].name;
      ncRebootEventParams.type = "elastic_search-1";
      ncRebootEventParams.channel = "network_controller_reboot_event";

      console.log("payload for ElasticSearch : ", ncRebootEventParams);

      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(ncRebootEventParams);
        // await queueHelper.queueDetectedAnomaly(ncRebootEventParams); //network_controller_reboot_event
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.log("Error in sendToElasticSearch .. ");
      throw err;
    }
  }
}

exports.startupDataService = new StartupDataService();
