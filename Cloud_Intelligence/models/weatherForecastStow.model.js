const { getActiveWeatherForecastStowBySiteId, updateWeatherForecastStow, getWeatherCurrentConditionsByProjectID } = require('../pg')


class WeatherForecastStowModel {

  async getActiveWeatherForecastStowBySiteId (pgClinet, siteId, stowType, active) {
    const { rows } = await getActiveWeatherForecastStowBySiteId(pgClinet, siteId, stowType, active);
    if (rows?.length > 0) {
      return rows[0];
    }
    return null;
  }

  async updateWeatherForecastStow (pgWrite, siteId, stowType, args) {
    const {rows} = await updateWeatherForecastStow(pgWrite, siteId, stowType, args);
    if (rows?.length > 0) {
      return rows[0];
    }
    return null;
  }

  async getWeatherCurrentConditionsByProjectID(pgClient, projectId) {
    const { rows } = await getWeatherCurrentConditionsByProjectID(pgClient, projectId);
    if (rows?.length > 0) {
      return rows[0];
    }
    return null;
  }
  
}

exports.WeatherForecastStowModel = new WeatherForecastStowModel();
