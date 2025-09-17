const pg = require("../utils/lib/pg");

const getSitesByProjectId = async (project_id) => {
  const { rows } = await pg.getSitesByProjectId(project_id);
  if (rows && rows.length > 0) {
    return rows;
  }

  return [];
}

const removeScheduledFirmwareUpgrade = async (siteId) => {
  const res = await pg.removeScheduledFirmwareUpgrade(siteId);
  if (res?.rows && res?.rows?.length > 0) {
    return res?.rows[0];
  }
  return null;
}

const getSiteByNcSnapAddr = async (snapAddr) => {
  const res = await pg.getSiteByNcSnapAddr(snapAddr);
  if (res?.rows && res?.rows?.length > 0) {
    return res?.rows[0];
  }
  return null;
}

module.exports = {
  getSitesByProjectId,
  removeScheduledFirmwareUpgrade,
  getSiteByNcSnapAddr
};



