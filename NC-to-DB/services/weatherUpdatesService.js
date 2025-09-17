const db = require("../db");
// const { queueHelper } = require("../utils/helpers/QueueHelper");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { exeQuery } = require("../utils/lib/pg");
const {getAssetBySnapAddr, updateAssetLastActivity} = require("../models/asset.model");
const helpers = require('../utils/helpers/functions');
const {
  RecordNotCreatedException
} = require('../utils/customExceptions');

class WeatherUpdatesService {
  async handler(pbUpdate) {
    console.log("weatherUpdatesService Handler ...");

    this.weatherUpdate = pbUpdate;

    const ts = this.weatherUpdate.getTimestamp();
    const fallback = this.weatherUpdate?.getWhen()?.toDate() ?? null;
    const TS = helpers.parseTimestampWithFallback(ts, fallback);

    this.weatherUpdate.getValidatedTimestamp = () => TS;
    this.snapAddr = this.weatherUpdate.getSnapAddr_asU8();
    this.snapAddrStr = helpers.getSnapAddr(this.snapAddr);

    // if the asset is repeater // ignore this update
    const assetDetail = await getAssetBySnapAddr(this.snapAddrStr);
    if (assetDetail?.repeater_only) {
      console.info("In WeatherUpdatesService Ignoring repeater update,", this.snapAddrStr);
      return null
    }

    try {
      let weatherQuery_res = await this.weatherQuery(
        this.weatherUpdate.getSnapAddr_asU8()
      );
      // console.log("query response:", weatherQuery_res.rows);
      let weatherId = null
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
            "weather record NOT found after we just inserted it, aborting"
          );
          return;
        }

        weatherId = insertWeather_res.rows[0].id
        
      }
      else {
        weatherId =weatherQuery_res.rows[0].weather_id
      }

      let insertWeatherHist_res = await this.insertWeatherHist(weatherId);
      console.log("query response:", insertWeatherHist_res.rowCount);

      const updateWeatherInfo_res = await this.updateWeatherInfo(weatherId);
      console.log("updateWeatherInfo Query response : ", updateWeatherInfo_res.rowCount);

      const assetInfo = await getAssetBySnapAddr(this.snapAddrStr);
      if (!assetInfo) {
        console.warn(`WeatherStowUpdateService:: Asset Info doesn't exist against Snap Address: ${this.snapAddrStr}`);
        return;
      }
      await this.sendWeatherUpdatesToElasticSearch(assetInfo);

      await updateAssetLastActivity(
        this.weatherUpdate.getValidatedTimestamp(),
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
    console.log("query :", db.weatherQuery, [snapAddr]);

    return await exeQuery(db.weatherQuery, [snapAddr]).catch((err) => {
      console.log("Error in weatherQuery");
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

  async insertWeatherHist(weather_id) {
    console.log("In insertWeatherHist()");
    console.log("query:", db.weatherHistInsert, [
      weather_id,
      this.weatherUpdate.getValidatedTimestamp(),
      this.weatherUpdate.getWindSpeed(),
      this.weatherUpdate.getWindDirection(),
      this.weatherUpdate.getAverageWindSpeed(),
      this.weatherUpdate.getPeakWindSpeed(),
      this.weatherUpdate.getTemperature(),
      this.weatherUpdate.getSnowDepth() / 0.0254,
      this.weatherUpdate.getIncreaseAvgWindReporting(),
      this.weatherUpdate.getIncreaseWindGustReporting(),
      this.weatherUpdate.getDataType(),
      this.weatherUpdate.getWhen().toDate(),
    ]);

    return await exeQuery(db.weatherHistInsert, [
      weather_id,
      this.weatherUpdate.getValidatedTimestamp(),
      this.weatherUpdate.getWindSpeed(),
      this.weatherUpdate.getWindDirection(),
      this.weatherUpdate.getAverageWindSpeed(),
      this.weatherUpdate.getPeakWindSpeed(),
      this.weatherUpdate.getTemperature(),
      this.weatherUpdate.getSnowDepth() / 0.0254,
      this.weatherUpdate.getIncreaseAvgWindReporting(),
      this.weatherUpdate.getIncreaseWindGustReporting(),
      this.weatherUpdate.getDataType(),
      this.weatherUpdate.getWhen().toDate(),
    ])
      .catch((err) => {
        console.log("Error in insertWeatherHist()");
        throw err;
      });
  }

  async updateWeatherInfo(weather_id) {
    console.log(
      "UpdateWeatherInfo Query: ", db.weatherUpdate,
      [
        weather_id,
        this.weatherUpdate.getValidatedTimestamp(),
        this.weatherUpdate.getWindSpeed(),
        this.weatherUpdate.getWindDirection(),
        this.weatherUpdate.getAverageWindSpeed(),
        this.weatherUpdate.getPeakWindSpeed(),
        this.weatherUpdate.getTemperature(),
        this.weatherUpdate.getSnowDepth() / 0.0254,
        this.weatherUpdate.getIncreaseAvgWindReporting(),
        this.weatherUpdate.getIncreaseWindGustReporting(),
        this.weatherUpdate.getDataType(),
        this.weatherUpdate.getWhen().toDate(),
      ]
    );

    const result = await exeQuery(db.weatherUpdate, [
      weather_id,
      this.weatherUpdate.getValidatedTimestamp(),
      this.weatherUpdate.getWindSpeed(),
      this.weatherUpdate.getWindDirection(),
      this.weatherUpdate.getAverageWindSpeed(),
      this.weatherUpdate.getPeakWindSpeed(),
      this.weatherUpdate.getTemperature(),
      this.weatherUpdate.getSnowDepth() / 0.0254,
      this.weatherUpdate.getIncreaseAvgWindReporting(),
      this.weatherUpdate.getIncreaseWindGustReporting(),
      this.weatherUpdate.getDataType(),
      this.weatherUpdate.getWhen().toDate(),
    ])
      .catch((err) => {
        console.log("Error in updateWeatherInfo :", err);
        throw new RecordNotCreatedException("weatherInfo not updated..!!");
      });
    console.log("Weather info updated ", result.rowCount);
    return result;
  }

  async sendWeatherUpdatesToElasticSearch(data) {
    try {
      let weatherJson = {};

      weatherJson.asset_id = data.id;
      weatherJson.device_type_id = data.device_type_id;
      weatherJson.timestamp = this.weatherUpdate.getValidatedTimestamp();
      weatherJson.data_type = this.weatherUpdate.getDataType();
      weatherJson.wind_speed = this.weatherUpdate.getWindSpeed();
      weatherJson.wind_direction = this.weatherUpdate.getWindDirection();
      weatherJson.snow_depth = this.weatherUpdate.getSnowDepth() / 0.0254;
      weatherJson.temperature = this.weatherUpdate.getTemperature();
      weatherJson.peak_wind_speed = this.weatherUpdate.getPeakWindSpeed();
      weatherJson.average_wind_speed = this.weatherUpdate.getAverageWindSpeed();
      weatherJson.increase_avg_wind_reporting = this.weatherUpdate.getIncreaseAvgWindReporting();
      weatherJson.increase_wind_gust_reporting = this.weatherUpdate.getIncreaseWindGustReporting();
      weatherJson.nc_reported_at = this.weatherUpdate.getWhen().toDate();
      weatherJson.type = "elastic_search-1";
      weatherJson.channel = "weather_hist";
      console.log("payload for elasticSearch:", weatherJson);
      if (process.env.NODE_ENV !== "test") {
        await notificationHelper.sendNotification(weatherJson);

        // await queueHelper.queueDetectedAnomaly(weatherJson); // weather_hist
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

exports.weatherUpdatesService = new WeatherUpdatesService();
