const pg = require("../pg");

const getSiteModeInfo = async (ncId) => {
    const { rows } = await pg.getSiteModeByNCId(ncId);
    if (rows.length > 0) {
        return rows[0];
    }

    console.warn('NC by id not found', JSON.stringify({ ncId }));

    return null;
}


module.exports = {
    getSiteModeInfo
};
