const pg = require("../utils/lib/pg");


const getWeatherForecastStowByNCID = async (ncID, stowType, state, active) => {
  const res = await pg.getWeatherForecastStowByNCID(ncID, stowType, state, active);
  if (res?.rows?.length > 0) {
    return res.rows[0];
  }
  return null;
}

const updateWeatherForecastStow = async (siteId, stowType, args) => {
  const {rows} = await pg.updateWeatherForecastStow(siteId, stowType, args);
  if (rows?.length > 0) {
    return rows[0];
  }
  return null;
}

module.exports = {
  getWeatherForecastStowByNCID,
  updateWeatherForecastStow
};



