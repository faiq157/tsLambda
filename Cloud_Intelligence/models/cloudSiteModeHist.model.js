const pg = require("../pg");

const getCloudSiteModeHist = (networkControllerId) => {
    return pg.getCloudSiteModeHist(networkControllerId);

}

const getCloudSiteModeHistWithOptMode = (networkControllerId, cmdStateDetail) => {
    return pg.getCloudSiteModeHistWithOptMode(networkControllerId, cmdStateDetail);

}

const updateCloudSiteModeHist = async (id) => {
    const { rows, rowCount } = await pg.updateCloudSiteModeHist(id);
    if (rowCount > 0) {
        return rowCount;
    }

    console.warn('cloud alert hist not updated for', JSON.stringify({ id }));

    return null;
}

module.exports = {
    getCloudSiteModeHist,
    getCloudSiteModeHistWithOptMode,
    updateCloudSiteModeHist
};