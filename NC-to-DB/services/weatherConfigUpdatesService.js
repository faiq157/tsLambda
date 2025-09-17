const db = require("../db");
const { queueHelper } = require("../utils/helpers/QueueHelper");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { exeQuery } = require("../utils/lib/pg");

class WeatherConfigUpdatesService {
  async handler(netCtrlId, ncSnapAddr, netCtrlResults, pbUpdate) {
    console.log("weatherConfigUpdatesService Handler ..");
    this.weatherConfigUpdate = pbUpdate;
    
    try {
      console.log(
        "SNAPADDR ",
        this.weatherConfigUpdate
          .getNcSnapAddr_asU8()
          .reduce((str, c) => str + c.toString(16).padStart(2, "0"), "")
      );
      console.log("ncSnapAddr : ", ncSnapAddr);
      console.log("netCtrlId : ", netCtrlId);

      if (netCtrlId) {
        const assetInfo_res = await this.assetInfo(
          netCtrlResults.rows[0].asset_id
        );
        // console.log("query response: ", assetInfo_res.rows);
        if (assetInfo_res.rows.length !== 0) {
          const updateThreshold_res = await this.updateThresholds(
            assetInfo_res.rows[0].id
          );
          console.log("query response: ", updateThreshold_res.rowCount);
          this.sendWeatherUpdatesConfigToElasticSearch(
            netCtrlResults.rows[0].asset_id
          );
        } else {
          //if no row found print errors
          console.log("No Site configuration found in database");
        }
      } else {
        console.log("No Network Controller found in database");
      }
      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in weatherConfigUpdatesService handler..!!"
      );
    }
  }

  async assetInfo(asset_id) {
    console.log("In assetInfo()");
    console.log(" query : ", db.getSiteConfByAssetIdQuery, [asset_id]);

    return await exeQuery(db.getSiteConfByAssetIdQuery, [asset_id]).catch((err) => {
      console.log("error in assetInfo()");
      throw err;
    });
  }

  async updateThresholds(assetInfo_id) {
    console.log("In updateThresholds()");
    console.log(
      "query:",
      db.updateWeatherConfigUpdateQuery,
      [
        this.weatherConfigUpdate.getWindSpeedThreshold(),
        this.weatherConfigUpdate.getWindGustThreshold(),
        this.weatherConfigUpdate.getSnowDepthThreshold() / 0.0254,
        this.weatherConfigUpdate.getPanelSnowDepthThreshold() / 0.0254,
        assetInfo_id,
      ]
    );
    //update values in existing row
    return await exeQuery(
      db.updateWeatherConfigUpdateQuery,
      [
        this.weatherConfigUpdate.getWindSpeedThreshold(),
        this.weatherConfigUpdate.getWindGustThreshold(),
        this.weatherConfigUpdate.getSnowDepthThreshold() / 0.0254,
        this.weatherConfigUpdate.getPanelSnowDepthThreshold() / 0.0254,
        assetInfo_id,
      ]
    );
  }

  async sendWeatherUpdatesConfigToElasticSearch(asset_id) {
    try {
      let weatherconfigUpdateParams = {};
      weatherconfigUpdateParams.wind_speed_threshold = this.weatherConfigUpdate.getWindSpeedThreshold();
      weatherconfigUpdateParams.gust_threshold = this.weatherConfigUpdate.getWindGustThreshold();
      weatherconfigUpdateParams.snow_depth_threshold =
        this.weatherConfigUpdate.getSnowDepthThreshold() / 0.0254;
      weatherconfigUpdateParams.panel_snow_depth_threshold =
        this.weatherConfigUpdate.getPanelSnowDepthThreshold() / 0.0254;
      weatherconfigUpdateParams.asset_id = asset_id;
      weatherconfigUpdateParams.type = "elastic_search-1";
      weatherconfigUpdateParams.channel = "weather_config_update";

      console.log(
        "weatherconfigUpdateParams for ElasticSearch: ",
        weatherconfigUpdateParams
      );
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(weatherconfigUpdateParams);
        await queueHelper.queueNotification(weatherconfigUpdateParams);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
    } catch (err) {
      console.log("error in sendWeatherUpdatesConfigToElasticSearch()");
      throw err;
    }
  }
}

exports.weatherConfigUpdatesService = new WeatherConfigUpdatesService();
