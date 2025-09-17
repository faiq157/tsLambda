const pg = require('../utils/lib/pg');

const getProjectDetailsBySiteId = async (siteId) => {
  const { rows } = await pg.getProjectDetailsBySiteId(siteId);
  if (rows.length > 0) {
    const [project] = rows;
    return project;
  }

  return null;
}

const updateProjectLocationDetailByProjectId = async (projectId, country, state, timezone) => {
  const {rows} = await pg.updateProjectLocationDetailByProjectId(projectId, country, state, timezone);
  console.log("updateProjectLocationDetailByProjectId", {projectId, country, state, timezone}, rows);
  return rows?.length > 0 ? rows[0] : null;
}

const getProjectDetailsByNcId = async (ncId) => {
  const { rows } = await pg.getProjectDetailsByNcId(ncId);
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
}

const isAccuWeatherEnabled = async (siteId) => {
  if (!siteId) {
    return false;
  }

  const project = await getProjectDetailsBySiteId(siteId);
  if (project) {
    return project.enable_weather_forecast;
  }

  return false;
}

const getProjectIdByNcAssetId = async (nc_asset_id) => {
  const { rows } = await pg.getProjectIdByNcAssetId(nc_asset_id);
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
}

const updateProjectType = async (siteId, site_type) => {
  const { rowCount } = await pg.updateProjectTypeBySiteId(siteId, site_type);
  return rowCount;
}

const getProjectByNCPrincipleID = async (principleId) => {
  const {rows} = await pg.getProjectByNCPrincipleID(principleId);
  return rows?.length > 0 ? rows[0] : null;
}

const updateProjectGPSCoordsFromFirstNC = async (pid) =>  {
  const {rows} = await pg.updateProjectGPSCoordsFromFirstNC(pid);
  console.log("updateProjectGPSCoordsFromFirstNC", pid, rows);
  return rows?.length > 0 ? rows[0] : null;
}

module.exports = {
  getProjectDetailsBySiteId,
  isAccuWeatherEnabled,
  getProjectIdByNcAssetId,
  getProjectDetailsByNcId,
  updateProjectType,
  getProjectByNCPrincipleID,
  updateProjectGPSCoordsFromFirstNC,
  updateProjectLocationDetailByProjectId
};
