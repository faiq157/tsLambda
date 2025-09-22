const { exeQuery } = require("../pg");

const cloudEventLogQuery = `
          INSERT INTO terrasmart.cloud_event_log (name,message,levelno,created,asset_id,type,title,icon)
          VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: INT, $4 :: TIMESTAMP,$5 :: UUID, $6::INT,$7::VARCHAR,$8::VARCHAR)
          `;

exports.handleUpdate = async function(payload) {
  if (payload) {
    // await pgWrite.connect();
    const checkEventLog = await exeQuery(
      `SELECT * FROM terrasmart.cloud_event_log WHERE asset_id = $1::UUID AND created = $2::TIMESTAMP 
      AND name = $3::VARCHAR`,
      [payload.asset_id, payload.timestamp, "NC-SLEEP"]
    );
    if (checkEventLog.rows.length === 0) {
      const ncSleepEventLog = await exeQuery(cloudEventLogQuery, [
        "NC-SLEEP",
        "To conserve power, the network controller goes to sleep at night.",
        20,
        new Date(payload.timestamp),
        payload.asset_id,
        1,
        "Network Controller Sleep Mode",
        "cloud_sleep"
      ], { writer: true });
      console.log("ncSleepEventLog ", ncSleepEventLog);
    }
  }
  return true;
};
