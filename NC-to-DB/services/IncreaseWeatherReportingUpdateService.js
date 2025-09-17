const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { getSnapAddr } = require("../utils/helpers/functions");


class IncreaseWeatherReportingUpdateService {
    async handler(netCtrlId, pbUpdate) {
        console.log("IncreaseWeatherReportingUpdateService Handler ..", netCtrlId);
        this.weatherReportingUpdate = pbUpdate;

        try {
            let reportingType = this.weatherReportingUpdate.getReportingType();
            let reportingFlag = this.weatherReportingUpdate.getReportingFlag();
            let reportingValue = this.weatherReportingUpdate.getReportingValue();
            let reportingThreshold = this.weatherReportingUpdate.getReportingThreshold();
            if (reportingType === 3) {
                reportingValue = reportingValue / 0.0254;
                reportingThreshold = reportingThreshold / 0.0254;
            }

            let closePercentage = this.weatherReportingUpdate.getClosePercentage();
            let snapAddr = null;
            if (this.weatherReportingUpdate.getSnapAddr_asU8() !== null &&
                this.weatherReportingUpdate.getSnapAddr_asU8() !== "" &&
                this.weatherReportingUpdate.getSnapAddr_asU8() !== undefined) {
                snapAddr = getSnapAddr(this.weatherReportingUpdate.getSnapAddr_asU8());
            }
            let timestamp = this.weatherReportingUpdate.getWhen().toDate();

            await this.sendToSNS(reportingType, reportingFlag, reportingValue, reportingThreshold, closePercentage, snapAddr, netCtrlId, timestamp);

            return true;
        } catch (err) {
            console.log("Rolling Back Database Changes..", err);
            throw new Error(
                "Operation not completed, error in IncreaseWeatherReportingUpdateService handler..!!"
            );
        }
    }

    async sendToSNS(reportingType, reportingFlag, reportingValue, reportingThreshold, closePercentage, snapAddr, netCtrlId, timestamp) {
        try {
            let weatherJson = {};

            weatherJson.timestamp = timestamp;
            weatherJson.snapAddr = snapAddr;
            weatherJson.reportingType = reportingType;
            weatherJson.reportingFlag = reportingFlag;
            weatherJson.reportingValue = reportingValue;
            weatherJson.reportingThreshold = reportingThreshold;
            weatherJson.closePercentage = closePercentage;
            weatherJson.network_controller_id = netCtrlId;
            weatherJson.type = "elastic_search-1";
            weatherJson.channel = "increase_weather_reporting_update";

            console.log("Payload for sns: ", weatherJson);

            // if (process.env.NODE_ENV !== "test") {
            await notificationHelper.sendNotification(weatherJson);
            // } else {
            //     console.log("  !!! Not sending the data to ES bcz of test env !!!");
            // }
            return true;
        } catch (err) {
            console.log("Error in sendStowUpdatesToElasticSearch()");
            throw err;
        }
    }
}

exports.increaseWeatherReportingUpdateService = new IncreaseWeatherReportingUpdateService();
