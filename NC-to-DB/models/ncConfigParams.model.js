const pg = require('../utils/lib/pg');

const insertOnDuplicateUpdateNcConfigParams = async (ncSnapAddr, params) => {
  try {
    // Ensure `data` is stored as a valid JSONB object
    if (params.data && typeof params.data !== "object") {
      console.error("Invalid data format, expected an object:", params.data);
      return null;
    }

    const { rows } = await pg.insertOnDuplicateUpdateNcConfigParams(ncSnapAddr, {
      ...params,
      data: params.data, // Convert to JSON string if necessary
    });

    if (rows?.length > 0) {
      return rows[0];
    }

    console.warn("Unable to update nc_config_params", ncSnapAddr, params);
    return null;
  } catch (error) {
    console.error("Error updating nc_config_params:", error);
    return null;
  }
};



module.exports = {
  insertOnDuplicateUpdateNcConfigParams
}