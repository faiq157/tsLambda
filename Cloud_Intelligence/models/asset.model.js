const pg = require("../pg");

const getAssetBySnapAddr = async (client, snapAddr) => {
    const { rows } = await pg.getAssetInfoBySnapAddr(client, snapAddr);
    if (rows.length > 0) {
        return rows[0];
    }

    console.warn('asset by snap addr not found', JSON.stringify({ snapAddr }));

    return null;
}

const getAssetById = async (assetId) => {
    const { rows } = await pg.getAssetInfoById(assetId);
    if (rows.length > 0) {
        return rows[0];
    }

    console.warn('asset by id not found', JSON.stringify({ assetId }));

    return null;
}

const getAssetAndSiteLayoutByAssetId = async (assetId) => {
    console.log("Getting linked row info")
    const { rows } = await pg.getAssetAndSiteLayoutByAssetId(assetId);
    if (rows.length > 0) {
        console.log(`Linked row response ${JSON.stringify(rows[0])}` )
        return rows[0];
    }

    console.warn('asset by id not found', JSON.stringify({ assetId }));

    return {};
}


module.exports = {
    getAssetBySnapAddr,
    getAssetById,
    getAssetAndSiteLayoutByAssetId
};
