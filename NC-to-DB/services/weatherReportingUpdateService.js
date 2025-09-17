const db = require("../db");
// const { queueHelper } = require("../utils/helpers/QueueHelper");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { acquireLock } = require("../utils/lib/distributedLock");
const { exeQuery } = require("../utils/lib/pg");
const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const helpers = require('../utils/helpers/functions');
class WeatherReportingUpdateService {
    async handler(pbUpdate, net_ctrl_id) {
        console.log("weatherReportingUpdatesService Handler ...");
        // const snapAddr = pbUpdate.getAssetSnapAddr_asU8();

        this.weatherUpdate = pbUpdate;
        this.snapAddr = this.weatherUpdate.getSnapAddr_asU8();
        this.snapAddrStr = helpers.getSnapAddr(this.snapAddr);

        // if the asset is repeater // ignore this update
        const assetDetail = await getAssetBySnapAddr(this.snapAddrStr);
        if (assetDetail?.repeater_only) {
          console.info("In WeatherReportingUpdateService Ignoring repeater update,", this.snapAddrStr);
          return null
        }

        try {
            let weatherQuery_res = await this.weatherQuery(
                this.weatherUpdate.getAssetSnapAddr_asU8()
            );
            // console.log("query response:", weatherQuery_res.rows);

            if (weatherQuery_res.rows.length === 0) {
                //console.log("weather record NOT found, will try to create one")
                let insertWeather_res = await this.insertWeather(
                    this.snapAddrStr
                );
                console.log("query response:", insertWeather_res.rowCount);
                
                if (insertWeather_res.rows.length > 0) {
                    console.log("Succfully inserted Weather:", insertWeather_res.rows[0]);
                }

                if (insertWeather_res.rows.length === 0) {
                    console.log(
                        "weather record not inserted with snapAddrStr", this.snapAddrStr
                    );
                    return;
                }
            }

            const assetInfo = await getAssetBySnapAddr(this.snapAddrStr);
            if (!assetInfo) {
              console.warn(`WeatherReportingUpdateService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
              return;
            }
            await acquireLock(
                "locks:inwxreporting:" + net_ctrl_id,
                3000,
                // Things to do while being in locked state
                async () => {
                    let insertWeatherHist_res = await this.insertWeatherHist(net_ctrl_id);
                    console.log("query response:", insertWeatherHist_res.rowCount);

                    if (assetInfo.id === "3e3d8a04-fbb2-4bfe-aac8-87cb1efb212d") {
                        await this.sendWeatherUpdatesToElasticSearch(null, net_ctrl_id);
                    } else {
                        await this.sendWeatherUpdatesToElasticSearch(
                            assetInfo.id,
                            net_ctrl_id
                        );
                    }
                }
            );


            await updateAssetLastActivity(
              this.weatherUpdate.getWhen().toDate(),
              assetInfo.id,
              assetInfo.last_cloud_update
            );

            return true;
        } catch (err) {
            console.log("Rolling Back Database Changes..", err);
            throw new Error(
                "Operation not completed, error in weatherUpdatesService handler..!!"
            );
        }
    }

    async weatherQuery(snapAddr) {
        console.log("In weatherQuery()");
        
        return await exeQuery(db.weatherQuery, [snapAddr]).catch((err) => {
            console.log("Error in weatherQuery query :", db.weatherQuery, [snapAddr]);
            console.log("Error in weatherQuery", err);
            throw err;
        });
    }

    async insertWeather(snapAddr) {
        console.log("In insertWeather()");
        
        return await exeQuery(db.weatherInsert, [snapAddr])
        .catch((err) => {
                console.log("Error in query :", db.weatherInsert, [snapAddr]);
                console.log("Error in insertWeather()");
                throw err;
            });
    }

    async insertWeatherHist(net_ctrl_id) {
        console.log("In insertWeatherHist()");
        
        return await exeQuery(db.weatherReportingHistInsert, [
            net_ctrl_id,
            this.weatherUpdate.getWhen().toDate(),
            this.weatherUpdate.getIncreaseAvgWindReporting(),
            this.weatherUpdate.getIncreaseWindGustReporting(),
            this.weatherUpdate.getIncreaseAvgSnowReporting(),
            this.weatherUpdate.getIncreasePanelSnowReporting(),
            this.weatherUpdate.getAssetSnapAddr_asU8(),
        ])
        .catch((err) => {
                console.log("Error in query:", db.weatherReportingHistInsert, [
                    net_ctrl_id,
                    this?.weatherUpdate?.getWhen()?.toDate(),
                    this?.weatherUpdate?.getIncreaseAvgWindReporting(),
                    this?.weatherUpdate?.getIncreaseWindGustReporting(),
                    this?.weatherUpdate?.getIncreaseAvgSnowReporting(),
                    this?.weatherUpdate?.getIncreasePanelSnowReporting(),
                    this?.weatherUpdate?.getAssetSnapAddr_asU8(),
                ]);
                console.log("Error in insertWeatherHist()", err);
                throw err;
            });
    }

    async sendWeatherUpdatesToElasticSearch(asset_id, network_controller_id) {
        try {
            console.log("sendingToES...", asset_id, network_controller_id);
            let weatherJson = {};

            weatherJson.asset_id = asset_id;
            weatherJson.network_controller_id = network_controller_id;
            weatherJson.timestamp = this.weatherUpdate.getWhen().toDate();
            weatherJson.increase_avg_wind_reporting = this.weatherUpdate.getIncreaseAvgWindReporting();
            weatherJson.increase_wind_gust_reporting = this.weatherUpdate.getIncreaseWindGustReporting();
            weatherJson.increase_avg_snow_reporting = this.weatherUpdate.getIncreaseAvgSnowReporting();
            weatherJson.increase_panel_snow_reporting = this.weatherUpdate.getIncreasePanelSnowReporting();
            weatherJson.type = "elastic_search-1";
            weatherJson.channel = "weather_reporting_hist";
            console.log("payload for elasticSearch:", weatherJson);
            if (process.env.NODE_ENV !== "test") {
                await notificationHelper.sendNotification(weatherJson);

                // await queueHelper.queueDetectedAnomaly(weatherJson); //weather_reporting_hist
            } else {
                console.log("  !!! Not sending the data to ES bcz of test env !!!");
            }
            return true;
        } catch (err) {
            console.log("Error in sendWeatherUpdatesToElasticSearch()");
            throw err;
        }
    }
}

exports.weatherReportingUpdateService = new WeatherReportingUpdateService();
