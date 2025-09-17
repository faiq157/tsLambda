const pg = require('../utils/lib/pg');

const upsertIrradianceByProjID = async (args) => {
  const { rowCount } = await pg.upsertIrradianceByProjID(args);

  if(rowCount === 0) {
    console.warn("GHI and POA values not updated in weather_irradiance");
  }
  return rowCount;
}

const addIrradianceHistory = async (args) => {
  const { rowCount } = await pg.addIrradianceHistory(args);

  if (rowCount === 0) {
    console.warn("GHI and POA values not inserted in irradiance_hist");
  }
  return rowCount;
}

module.exports = {
  upsertIrradianceByProjID,
  addIrradianceHistory
}
