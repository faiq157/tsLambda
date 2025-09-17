const db = require("./db");

exports.esHelper = (payload) => {
  let info = payload;
  info.timestamp = payload.last_asset_updated;
  return info;
}
exports.getFirmwareVersion = async (client, payload) => {
  let result = { fwVersion: null, nc_asset_id: null };
  try {
    console.log("Getting info for Asset ...")
    console.log(db.ncInfoByAssetId, [payload.asset_id]);
    let res = await client.query(db.ncInfoByAssetId, [payload.asset_id]);
    console.log("Res ", res.rows);
    if (res.rows.length > 0) {
      fwVersion = parseFirmwareVersion(res.rows[0].fw_version);
      if (fwVersion === null) {
        console.log("Getting info for NC ...")
        console.log(db.ncInfoByNCAssetId, [payload.asset_id]);
        res = await client.query(db.ncInfoByNCAssetId, [payload.asset_id]);
        if (res.rows.length > 0) {
          result.fwVersion = parseFirmwareVersion(res.rows[0].fw_version);
          result.nc_asset_id = res.rows[0].network_controller_asset_id;
        }
        console.log("Res ", res.rows);
      } else {
        result.fwVersion = parseFirmwareVersion(res.rows[0].fw_version);
        result.nc_asset_id = res.rows[0].network_controller_asset_id;
      }
    } else {
      console.log("Getting info for NC1 ...")
      console.log(db.ncInfoByNCAssetId, [payload.asset_id]);
      res = await client.query(db.ncInfoByNCAssetId, [payload.asset_id]);
      if (res.rows.length > 0) {
        result.fwVersion = parseFirmwareVersion(res.rows[0].fw_version);
        result.nc_asset_id = res.rows[0].network_controller_asset_id;
      }
      console.log("Res ", res.rows);
    }
  } catch (err) {
    console.log("Error in Helper ", err);
  }
  console.log("result ", result);
  return result;
};


function parseFirmwareVersion(firmwareVersion) {
  if (firmwareVersion !== null && firmwareVersion !== undefined) {
    firmwareVersion = firmwareVersion.toString().split("-");
    return firmwareVersion[0];
  } else {
    return firmwareVersion;
  }
}