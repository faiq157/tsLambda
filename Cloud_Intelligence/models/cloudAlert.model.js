const pg = require("../pg");

const getActiveAlert = async (client, snapAddr, eventName) => {
    const { rows } = await pg.getActiveAlert(client, snapAddr, eventName);
    if (rows.length > 0) {
        return rows[0];
    }

    console.warn('cloud alert not found', JSON.stringify({ snapAddr }));

    return null;
}
const getActiveAlertByAssetId = async (client, assetId, eventName) => {
    const { rows } = await pg.getCloudAlert(client, assetId, eventName);
    if (rows.length > 0) {
        return rows[0];
    }

    console.warn('cloud alert not found', JSON.stringify({ assetId }));

    return null;
}

const addCloudAlertWithUserInfo = async (
    assetId, eventName, timestamp, title, icon, userName, email, message= null, params, levelNo = 20
) => {
    const { rows } = await pg.addCloudAlertWithUserInfo(assetId, eventName, timestamp, title, icon, userName, email, message, params, levelNo);
    if (rows.length > 0) {
        return rows[0];
    }

    console.warn('cloud alert not added for ', JSON.stringify({ assetId }));

    return null;
}

const addCloudAlert = async (assetId, eventName, timestamp, title, icon, message, type = 2, levelno = 20, params = null) => {
    const { rowCount } = await pg.addCloudAlert(assetId, eventName, timestamp, title, icon, message, type, levelno, params);
    if (rowCount > 0) {
        return rowCount;
    }

    console.warn('cloud alert not added for', JSON.stringify({ assetId }));

    return null;
}
const removeCloudAlert = async (
    client, alertId
) => {
    //remove detail
    const detailRemoveRes = await pg.removeCloudAlertDetail(client, alertId)
    console.log("DetailRemoveRes ", detailRemoveRes);
    const res = await pg.removeCloudAlert(client, alertId);
    return res;
}

const getActiveAlertsForAllAssets = (client, ncAssetId) => {
    return pg.getActiveAlertsForAllAssets(client, ncAssetId);

}



const getAlertSiteModeByUser = async (client, snapAddr, eventName) => {
    const { rows } = await pg.getActiveAlert(client, snapAddr, eventName);
    if (rows.length > 0) {
        return rows[0];
    }

    console.warn('cloud alert not found', JSON.stringify({ snapAddr }));

    return null;
}

module.exports = {
    getActiveAlert,
    addCloudAlertWithUserInfo,
    addCloudAlert,
    getActiveAlertByAssetId,
    removeCloudAlert,
    getActiveAlertsForAllAssets
};
