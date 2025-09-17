const pg = require("../pg");

const getCloudAlertSiteModeHist = (client, networkControllerId) => {
    return pg.getCloudAlertSiteModeHist(client, networkControllerId);
}

const getCloudAlertSiteModeHistWithOptMode = (client, networkControllerId, cmdStateDetail) => {
    return pg.getCloudAlertSiteModeHistWithOptMode(client, networkControllerId, cmdStateDetail);
}

const updateCloudAlertSiteModeHist = async (client, id) => {
    const { rows, rowCount } = await pg.updateCloudAlertSiteModeHist(
        client, id);
    if (rowCount > 0) {
        return rowCount;
    }

    console.warn('cloud alert hist not updated for', JSON.stringify({ id }));

    return null;
}

module.exports = {
    getCloudAlertSiteModeHist,
    getCloudAlertSiteModeHistWithOptMode,
    updateCloudAlertSiteModeHist
};