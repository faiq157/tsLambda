exports.getAssetInfo = () => {
  return `SELECT * FROM terrasmart.site_layout
    WHERE site_layout.asset_id = $1::UUID`;
};

exports.isLastActionCompleted = () => {
  return `SELECT * FROM terrasmart.site_layout
    WHERE site_layout.asset_id = $1::UUID
    AND last_action_completed = false`;
};
