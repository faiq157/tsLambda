const pg = require('../pg');

const getProjectDetailsByNcId = async (ncId) => {
  const { rows } = await pg.getProjectDetailsByNcId(ncId);
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
}

const getProjectDetailsBySiteId = async (siteId) => {
  const { rows } = await pg.getProjectDetailsBySiteId(siteId);
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
}

module.exports = {
  getProjectDetailsByNcId,
  getProjectDetailsBySiteId
};
