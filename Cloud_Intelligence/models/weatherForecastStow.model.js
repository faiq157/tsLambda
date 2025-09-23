const { getActiveWeatherForecastStowBySiteId, updateWeatherForecastStow, getWeatherCurrentConditionsByProjectID } = require('../pg')


class WeatherForecastStowModel {

  async getActiveWeatherForecastStowBySiteId (siteId, stowType, active) {
    const { rows } = await getActiveWeatherForecastStowBySiteId(siteId, stowType, active);
    if (rows?.length > 0) {
      return rows[0];
    }
    return null;
  }

  async updateWeatherForecastStow (siteId, stowType, args) {
    const {rows} = await updateWeatherForecastStow(siteId, stowType, args);
    if (rows?.length > 0) {
      return rows[0];
    }
    return null;
  }

  async getWeatherCurrentConditionsByProjectID(projectId) {
    const { rows } = await getWeatherCurrentConditionsByProjectID(projectId);
    if (rows?.length > 0) {
      return rows[0];
    }
    return null;
  }
  
}

exports.WeatherForecastStowModel = new WeatherForecastStowModel();
