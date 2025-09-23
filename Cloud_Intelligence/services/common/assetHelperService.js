const db = require("../../db");
const { exeQuery } = require("../../pg");

class AssetHelperService {

    async checkIsActive(asset_id) {
        console.log(db.checkActiveAssetQuery, [asset_id]);
        const getActiveAsset = await exeQuery(db.checkActiveAssetQuery, [asset_id]);
        console.log(getActiveAsset.rows);
        if (getActiveAsset.rows.length === 0) {
            return false;
        } else {
            return true;
        }
    }
}




exports.assetHelperService = new AssetHelperService();