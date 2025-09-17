const db = require("../db");
const { queueHelper } = require("../utils/helpers/QueueHelper");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { exeQuery } = require("../utils/lib/pg");
const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const helpers = require('../utils/helpers/functions');

    // HIGH_WIND_GUST = 1
    // HIGH_AVG_WIND = 2
    // DEEP_SNOW = 3
    // DEEP_PANEL_SNOW = 4
    // LACK_WEATHER_INFO = 5
    // ACCU_WEATHER_WIND_GUST = 6
    // ACCU_WEATHER_AVG_WIND = 7
    // ACCU_WEATHER_DEEP_SNOW = 8
    // ACCU_WEATHER_ALERT_API = 9
    // TOO_COLD_TO_MOVE = 10
    // STOP_HIGH_WIND_GUST = 21
    // STOP_HIGH_AVG_WIND = 22
    // STOP_STOW_DEEP_SNOW = 23
    // STOP_STOW_DEEP_PANEL_SNOW = 24
    // STOP_STOW_LACK_WEATHER_INFO = 25
    // STOP_STOW_ACCU_WEATHER_WIND_GUST = 26
    // STOP_STOW_ACCU_WEATHER_AVG_WIND = 27
    // STOP_STOW_ACCU_WEATHER_DEEP_SNOW = 28
    // STOP_STOW_ACCU_WEATHER_ALERT_API= 29
    // STOP_TOO_COLD_TO_MOVE = 30

class WeatherStowUpdatesService {
  async handler(netCtrlId, pbUpdate) {
    console.log("weatherStowUpdatesService Handler ..");
    this.weatherStowUpdate = pbUpdate;
    this.snapAddr = this.weatherStowUpdate.getSnapAddr_asU8();
    this.snapAddrStr = helpers.getSnapAddr(this.snapAddr);

    // if the asset is repeater // ignore this update
    const assetDetail = await getAssetBySnapAddr(this.snapAddrStr);
    if (assetDetail?.repeater_only) {
      console.info("In WeatherStowUpdatesService Ignoring repeater update,", this.snapAddrStr);
      return null
    }

    try {
      let stow_value = this.weatherStowUpdate.getValue();
      let stow_threshold = this.weatherStowUpdate.getThreshold();
      let stow_lower_threshold = this.weatherStowUpdate.getLowerThreshold();
      if (
        this.weatherStowUpdate.getStowType() === 3 ||
        this.weatherStowUpdate.getStowType() === 4
      ) {
        stow_value = this.weatherStowUpdate.getValue() / 0.0254;
        stow_threshold = this.weatherStowUpdate.getThreshold() / 0.0254;
      }

      const assetInfo = await getAssetBySnapAddr(this.snapAddrStr);
      if (!assetInfo) {
        console.warn(`WeatherStowUpdateService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
        return;
      }

      if ((this.weatherStowUpdate.getStowType() < 5 || this.weatherStowUpdate.getStowType() > 9) && this.weatherStowUpdate.getStowType() < 21) {
        let weatherQuery_res = await this.weatherQuery(
          this.weatherStowUpdate.getSnapAddr_asU8()
        );
        let weatherId = null;
        // console.log("query response: ", weatherQuery_res.rows);

        if (weatherQuery_res.rows.length === 0) {
          console.log("weather record NOT found, will try to create one");
          const results = await this.insertWeather(this.snapAddrStr);
          console.log("Added new weather record: ", results.rowCount);

          if (results.rows.length === 0) {
            console.log(
              "weather record NOT inserted using snapAddr", this.snapAddrStr
            );
            return;
          }

          console.log("Successfully inserted Weather:", results.rows[0]);
          weatherId = results.rows[0].id;
        } else {
          weatherId = weatherQuery_res.rows[0].weather_id;
        }

        let updateWeatherStowHist_res = await this.updateWeatherStowHist(
          weatherId,
          stow_value,
          stow_threshold,
          stow_lower_threshold
        );
        console.log("query response: ", updateWeatherStowHist_res.rowCount);
        await this.sendStowUpdatesToElasticSearch(
          assetInfo,
          stow_value,
          stow_threshold,
          stow_lower_threshold
        );
      } else {
        const addInfoInNCWxHist = await exeQuery(
          db.addWeatherStowInfoQuery,
          [
            netCtrlId,
            this.weatherStowUpdate.getWhen().toDate(),
            this.weatherStowUpdate.getStowType(),
            stow_value,
            stow_threshold,
          ]
        );
        console.log("addInfoInNCWxHist ", addInfoInNCWxHist.rowCount);
        await this.sendStowUpdatesToElasticSearch(
          assetInfo,
          stow_value,
          stow_threshold
        );
      }

      await updateAssetLastActivity(
        this.weatherStowUpdate.getWhen().toDate(),
        assetInfo.id,
        assetInfo.last_cloud_update
      );

      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in weatherStowUpdatesService handler..!!"
      );
    }
  }

  async weatherQuery(snapAddr) {
    console.log("In weatherQuery()");
    console.log("query :", db.weatherQuery, [snapAddr]);

    return exeQuery(db.weatherQuery, [snapAddr]).catch((err) => {
      console.log("Error in weatherQuery");
      throw err;
    });
  }

  async insertWeather(snapAddr) {
    console.log("In insertWeather()");
    console.log("query :", db.weatherInsert, [snapAddr]);

    return exeQuery(db.weatherInsert, [snapAddr])
      .catch((err) => {
        console.log("Error in insertWeather()");
        throw err;
      });
  }

  async updateWeatherStowHist(weather_id, stow_value, stow_threshold, stow_lower_threshold) {
    console.log("In updateWeatherStowHist()");
    console.log("query: ", db.weatherStowUpdateInsert, [
      weather_id,
      this.weatherStowUpdate.getWhen().toDate(),
      this.weatherStowUpdate.getStowType(),
      stow_value,
      stow_threshold,
      stow_lower_threshold
    ]);

    return exeQuery(db.weatherStowUpdateInsert, [
      weather_id,
      this.weatherStowUpdate.getWhen().toDate(),
      this.weatherStowUpdate.getStowType(),
      stow_value,
      stow_threshold,
      stow_lower_threshold
    ])
      .catch((err) => {
        console.log("Error in weatherStowHist()");
        throw err;
      });
  }

  async assetInfo(snapAddr) {
    console.log("In assetInfo()");
    console.log("query:", db.assetInfoQuery, [snapAddr]);

    return exeQuery(db.assetInfoQuery, [snapAddr]).catch((err) => {
      console.log("Error in assetInfo()");
      throw err;
    });
  }

  async sendStowUpdatesToElasticSearch(data, stow_value, stow_threshold, stow_lower_threshold) {
    try {
      let weatherJson = {};

      weatherJson.asset_id = data.id;
      weatherJson.asset_name = data.name;
      weatherJson.device_type_id = data.device_type_id;
      weatherJson.timestamp = this.weatherStowUpdate.getWhen().toDate();
      weatherJson.stow_type = this.weatherStowUpdate.getStowType();
      weatherJson.stow_value = stow_value;
      weatherJson.stow_threshold = stow_threshold;
      weatherJson.stow_lower_threshold = stow_lower_threshold;
      weatherJson.type = "elastic_search-1";
      weatherJson.channel = "weather_stow_updates";

      console.log("Payload for elastisSearch: ", weatherJson);

      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(weatherJson);
        await queueHelper.queueNotification(weatherJson);
      } else {
        console.log("  !!! Not sending the data to ES bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.log("Error in sendStowUpdatesToElasticSearch()");
      throw err;
    }
  }
}

exports.weatherStowUpdatesService = new WeatherStowUpdatesService();
