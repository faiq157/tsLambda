const pg = require("../pg");

const getCloudAlertSiteModeHist = (networkControllerId) => {
    return pg.getCloudAlertSiteModeHist(networkControllerId);
}

const getCloudAlertSiteModeHistWithOptMode = (networkControllerId, cmdStateDetail) => {
    return pg.getCloudAlertSiteModeHistWithOptMode(networkControllerId, cmdStateDetail);
}

const updateCloudAlertSiteModeHist = async (id) => {
    const { rows, rowCount } = await pg.updateCloudAlertSiteModeHist(id);
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