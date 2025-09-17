const pg = require("../pg");

const getCloudSiteModeHist = (client, networkControllerId) => {
    return pg.getCloudSiteModeHist(client, networkControllerId);

}

const getCloudSiteModeHistWithOptMode = (client, networkControllerId, cmdStateDetail) => {
    return pg.getCloudSiteModeHistWithOptMode(client, networkControllerId, cmdStateDetail);

}

const updateCloudSiteModeHist = async (client, id) => {
    const { rows, rowCount } = await pg.updateCloudSiteModeHist(
        client, id);
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