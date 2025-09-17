const { getSnapAddr } = require("../utils/helpers/functions");
const { acquireLock } = require("../utils/lib/distributedLock");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { updateFasttrakReportOnDoneState,
  updateFasttrakReportOnMaxState, addFasttrakHist, updateFasttrakReportOnStopStateModeQC,
  updateFasttrakReport, updateFasttrakReportOnStopState, updateFasttrakReportOnFlat,
  resetFasttrakReportOnFlat
} = require("../models/fasttrak.model");
const { trackingStatus } = require('../utils/constants');
const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");
const { getAssetBySnapAddr } = require("../models/asset.model");
class QaQcReportUpdateService {
  async handler(pbUpdate) {
    try {
      console.log("QAQCReportUpdate Handler ..");
      this.reportUpdate = pbUpdate;
      this.reportUpdate.snapAddr = getSnapAddr(this.reportUpdate.getSnapAddr_asU8());

      const assetInfo = await getAssetBySnapAddr(this.reportUpdate.snapAddr); 
      if (assetInfo?.repeater_only) {
        console.info("In QaQcReportUpdateService Ignoring repeater update,", this.reportUpdate.snapAddr);
        return null
      }

      let result = null;
      await acquireLock(
        "locks:qaqcreport:" + this.reportUpdate.snapAddr,
        3000,
        // Things to do while being in locked state
        async () => {
          if (this.reportUpdate.getSiteMode() === 8) {
            console.log("Site mode is Remote QC");
            if (this.reportUpdate.getStage() === 'FLAT') {
              console.log("Stage is FLAT"); // Log stage
              //reset fasttrak report
              //get project in construction status
              let projectConstructionStatus = await this.getAssetProjectConstructionStatus();
              // if report not reset then reset it
              await resetFasttrakReportOnFlat(
                this.reportUpdate.snapAddr, trackingStatus.REMOTE_QC,
                this.reportUpdate.getTimestamp().toDate(), projectConstructionStatus);

              //update report on rest states with motor currents & other information
              result = await updateFasttrakReportOnFlat(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

            } else if (this.reportUpdate.getStage() === 'DONE') {
              console.log("Stage is DONE"); // Log stage
              //update report on done state mark angle compete status for both +60 and -60

              result = await updateFasttrakReportOnDoneState(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

            } else if (this.reportUpdate.getStage() === 'MAX') {
              console.log("Stage is MAX"); // Log stage
              //update report on max state this will be after warmup time
              //& we start reporting start_time_qc

              result = await updateFasttrakReportOnMaxState(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

            } else if (this.reportUpdate.getStage() === 'STOP') {
              console.log("Stage is STOP"); // Log stage
              //update report on rest states with motor currents & other information
              result = await updateFasttrakReportOnStopStateModeQC(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

              // add fasttrak report history
              await addFasttrakHist(this.reportUpdate.snapAddr);

            } else {
              console.log("Stage is UNKNOWN"); // Log unknown stage
              //update report on rest states with motor currents & other information
              result = await updateFasttrakReport(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

            }

          } else {
            console.log("Site mode is not Remote QC"); // Log site mode
            if (this.reportUpdate.getStage() === 'DONE') {
              console.log("Stage is DONE"); // Log stage
              //update report on done state mark angle compete status for both +60 and -60

              result = await updateFasttrakReportOnDoneState(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

            } else if (this.reportUpdate.getStage() === 'MAX') {
              console.log("Stage is MAX"); // Log stage
              //update report on max state this will be after warmup time
              //& we start reporting start_time_qc

              result = await updateFasttrakReportOnMaxState(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

            } else if (this.reportUpdate.getStage() === 'STOP') {
              console.log("Stage is STOP"); // Log stage
              //update report on rest states with motor currents & other information
              result = await updateFasttrakReportOnStopState(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

              // add fasttrak report history
              await addFasttrakHist(this.reportUpdate.snapAddr);  
            } else {
              console.log("Stage is UNKNOWN"); // Log unknown stage
              //update report on rest states with motor currents & other information
              result = await updateFasttrakReport(this.reportUpdate.getTimestamp().toDate(), this.reportUpdate.getStage(),
                this.reportUpdate.getMaxPeakMotorInrushCurrent(), this.reportUpdate.getMaxPeakMotorCurrent(),
                this.reportUpdate.getMaxAverageMotorCurrent(), this.reportUpdate.getStatusBits(),
                this.reportUpdate.getLabel(), this.reportUpdate.getUserName(), this.reportUpdate.getUserEmail(),
                this.reportUpdate.getCharged(), this.reportUpdate.getMinTemperature(), this.reportUpdate.getMaxWindGust(),
                this.reportUpdate.getMaxAverageWind(), this.reportUpdate.getPv1(), this.reportUpdate.getPv2(), this.reportUpdate.snapAddr);

            }
          }

        }
      );
      await this.sendToElasticSearch(result);
      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in QAQCReportUpdateService handler..!!"
      );
    }
  }


  async getAssetProjectConstructionStatus() {
    try {
      let projectConstructionStatus = false;
      const projectRes = await exeQuery(db.getProjectConstructionStatus, [this.reportUpdate.snapAddr]);
      if (projectRes.rows.length !== 0) {
        projectConstructionStatus = projectRes.rows[0].is_in_construction
      }
      return projectConstructionStatus;
    } catch (error) {
      console.error("Error in getAssetProjectConstructionStatus: ", error);
    }
  }

  async sendToElasticSearch(dbResult) {
    try {
      let qcInfo = {};
      qcInfo.timestamp = this.reportUpdate.getTimestamp().toDate();
      qcInfo.snapAddr = this.reportUpdate.snapAddr;
      qcInfo.stage = this.reportUpdate.getStage();
      qcInfo.user_name = this.reportUpdate.getUserName();
      qcInfo.user_email = this.reportUpdate.getUserEmail();
      qcInfo.siteMode = this.reportUpdate.getSiteMode();
      qcInfo.type = "elastic_search-1";
      qcInfo.channel = "qc_update";
      if (dbResult.length !== 0) {
        qcInfo.lastState = dbResult[0].last_state;
      }

      console.log("payload to be sent to ElasticSearch : ", qcInfo);
      // if (process.env.NODE_ENV !== "test") {
      await notificationHelper.sendNotification(qcInfo);
      // } else {
      //   console.log("  !!! Not sending the data to ES bcz of test env !!!");
      // }
      return true;
    } catch (err) {
      console.log("Error in sendToElasticSearch .. ", err);
      throw err;
    }
  }
}

exports.qaqcReportUpdateService = new QaQcReportUpdateService();
