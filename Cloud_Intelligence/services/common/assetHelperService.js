const db = require("../../db");

class AssetHelperService {

    async checkIsActive(client, asset_id) {
        console.log(db.checkActiveAssetQuery, [asset_id]);
        const getActiveAsset = await client.query(db.checkActiveAssetQuery, [asset_id]);
        console.log(getActiveAsset.rows);
        if (getActiveAsset.rows.length === 0) {
            return false;
        } else {
            return true;
        }
    }
}




exports.assetHelperService = new AssetHelperService();