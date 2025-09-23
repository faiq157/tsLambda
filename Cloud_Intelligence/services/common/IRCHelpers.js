const { getAssetInfo, isLastActionCompleted } = require("./IRCHelpers.db");
const { exeQuery } = require("../../pg");

/**
 * Returns true if the last command issued to asset was start IRC, and not stop IRC
 * @param {Object} client PG client to query the database
 * @param {String} assetId Asset ID of the asset, for which the status is to be found
 */
exports.checkIsInIRC = async (assetId) => {
  let res = await exeQuery(getAssetInfo(), [assetId]);

  console.log("RES checkIsInIRC: ", res);
  let returnVal = null;

  if (res.rows.length) {
    const asset = res.rows[0];
    if (asset.individual_rc_cmd_state !== 0) {
      returnVal = true;
    } else {
      returnVal = false;
    }
  } else {
    returnVal = false;
  }
  console.log(`checkIsInIRC returning ${returnVal} ..!`);

  return returnVal;
};

/**
 * Checks weather the asset is
 * @param {Object} client PG client to query the database
 * @param {String} assetId Asset ID of the asset, for which the status is to be found
 */
exports.getCommandInfo = async (assetId) => {
  let res = await exeQuery(isLastActionCompleted(), [assetId]);
  // console.log("RESULT: ", res);

  if (res.rows.length > 0) {
    const asset = res.rows[0];

    const state = asset.individual_rc_cmd_state;
    const param = asset.individual_rc_param;
    const previous_state = asset.individual_rc_previous_state;
    const previous_param = asset.individual_rc_previous_param;
    const username = asset.username;
    const email = asset.email;

    const status = getStatusStr(state, param);
    const lastStatus = getStatusStr(previous_state, previous_param);

    return {
      status,
      username,
      email,
      lastStatus: state === 0 && lastStatus === null ? "" : lastStatus,
    };
  }
  return null;
};

function getStatusStr(rc_cmd_state, rc_param) {
  console.log("getUnderManualCommandStatus ", rc_cmd_state, rc_param);
  let status = null;
  if (rc_cmd_state === 5) {
    if (rc_param === 0) status = "Preset: Stow";
    if (rc_param === 1) status = "Preset: Flat";
    if (rc_param === 6) status = "Preset: Min";
    if (rc_param === 7) status = "Preset: Max";
  } else if (rc_cmd_state === 3) {
    status = `${rc_param}&deg;`;
  } else if (rc_cmd_state === 1) {
    status = "Virtual EStop";
  }
  console.log("getUnderManualCommandStatus response is: ", status);

  return status;
}
