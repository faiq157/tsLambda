const pg = require("../utils/lib/pg");

const addSnowShedding = async (
  ncSnapAddr,
  timestamp,
  depth,
  baseline,
  snowOnGroundNow,
  estimate,
  trigger,
  threshold,
  active,
  snapAddr,
  lastSnowShedding,
  state
) => {

  const { rows, rowCount } = await pg.addSnowShedding(
    ncSnapAddr,
    timestamp,
    depth,
    baseline,
    snowOnGroundNow,
    estimate,
    trigger,
    threshold,
    active,
    snapAddr,
    lastSnowShedding,
    state);

  console.log('snow shedding updated', rowCount);

  return (rowCount) ? rows[0] : null;
}

const addSnowSheddingReport = async (snapAddr, timestamp, payload) => {
  try {
    await pg.addSnowSheddingReport(snapAddr, timestamp, JSON.stringify(payload));
  } catch (error) {
    console.error(`Failed to update Snow Shedding Report. Error: ${error?.message}`, error);
    console.error(`Parameters - snapAddr: ${snapAddr}, timestamp: ${timestamp}, payload: ${JSON.stringify(payload)}`);
  }
};


module.exports = {
  addSnowShedding,
  addSnowSheddingReport
};



