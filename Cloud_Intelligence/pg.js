//const { Client, Pool } = require("pg");
const { Pool, types } = require("pg");
const getAppName = () => process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.APP_NAME || 'CloudIntelligence';
let pgConfig,
  pgMasterConfig = {};
pgConfig = {
  min: process.env.DB_READ_MIN_CLIENT_COUNT_LAMBDA || 5,
  max: process.env.DB_READ_MAX_CLIENT_COUNT_LAMBDA || 20,
  idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT || 180000, // milliseconds a client must sit idle in the pool and not be checked out
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  application_name: getAppName()
};
const { getKeysAndValues } = require("./utils");

pgMasterConfig = {
  min: process.env.DB_WRITE_MIN_CLIENT_COUNT_LAMBDA || 5,
  max: process.env.DB_WRITE_MAX_CLIENT_COUNT_LAMBDA || 20,
  idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT || 180000, // milliseconds a client must sit idle in the pool and not be checked out
  host: process.env.PGMASTERHOST,
  port: process.env.PGMASTERPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  application_name: getAppName()
};


//const pg = new Client(pgConfig);
//const pgWrite = new Client(pgMasterConfig);
// pg.connect().catch(err => {
//   console.error(err);
// });
// console.log("---", pg.host);
// pgWrite.connect().catch(err => {
//   console.error(err);
// });

// Make sure when converting Postgres timestamp it is UTC
const TIMESTAMP_OID = 1114;
const parseFn = val =>
  val === null ? null : new Date(Date.parse(`${val}+0000`));

types.setTypeParser(TIMESTAMP_OID, parseFn);

const writerPool = new Pool({
  application_name: "Cloud Intelligence",
  user: pgMasterConfig.user,
  host: pgMasterConfig.host,
  database: pgMasterConfig.database,
  password: pgMasterConfig.password,
  port: pgMasterConfig.port,
  max: process.env.DB_WRITE_MAX_CLIENT_COUNT_LAMBDA,
  idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT || 10000, // milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT || 0,    // milliseconds to wait before timing out when connecting a new client
  // statement_timeout not supported by RDS proxy
  statement_timeout: process.env.DB_STATEMENT_TIMEOUT || 0,     // number of milliseconds before a statement in query will time out, default is no timeout
  // idle_in_transaction_session_timeout not supported by RDS proxy
  idle_in_transaction_session_timeout: process.env.DB_IDLE_IN_TRANSACTION_SESSION_TIMEOUT || 0,  // number of milliseconds before terminating any session with an open idle transaction
  query_timeout: process.env.DB_QUERY_TIMEOUT || 0             // number of milliseconds before a query call will timeout, default is no timeout
});
let writerClientId = 0;
//const {Client, ...db_options} = writerPool.options;
//console.log("writerPool", db_options);
writerPool.on('error', (err, client) => {
  console.error(`[pg] [${client._id}] Unexpected error on idle client`, err);
});

writerPool.on('connect', client => {
  client._timestamp = Math.round(new Date().valueOf() / 1000);
  client._queryCounter = 0;
  client._id = ++writerClientId;
  //console.log(`[pg] [conn] [${client._id}] create at ${client._timestamp}. total:idle:waiting ${writerPool.totalCount}:${writerPool.idleCount}:${writerPool.waitingCount}`)
});

// writerPool.on('acquire', client => {
//   //console.log(`[pg] [conn] [${client._id}] acquired. total:idle:waiting ${writerPool.totalCount}:${writerPool.idleCount}:${writerPool.waitingCount}`)
// });

// writerPool.on('remove', client => {
//   //console.log(`[pg] [conn] [${client._id}] deleted. total:idle:waiting ${writerPool.totalCount}:${writerPool.idleCount}:${writerPool.waitingCount}`)
// });

let readerPool = null;
let readerClientId = 0;
if (process.env.DB_READ_HOST) {
  readerPool = new Pool({
    application_name: "Cloud Intelligence",
    user: pgConfig.user,
    host: pgConfig.host,
    database: pgConfig.database,
    password: pgConfig.password,
    port: pgConfig.port,
    max: process.env.DB_READ_MAX_CLIENT_COUNT_LAMBDA,
    idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT || 10,
    connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT || 0,
    // statement_timeout not supported by RDS proxy
    statement_timeout: process.env.DB_STATEMENT_TIMEOUT || 0,
    // idle_in_transaction_session_timeout not supported by RDS proxy
    idle_in_transaction_session_timeout: process.env.DB_IDLE_IN_TRANSACTION_SESSION_TIMEOUT || 0,
    query_timeout: process.env.DB_QUERY_TIMEOUT || 0
  });

  //const {Client, ...db_options} = readerPool.options;
  //console.log("readerPool", db_options);
  readerPool.on('error', (err, client) => {
    console.error(`[pg read] [${client._id}] Unexpected error on idle client`, err);
  });

  readerPool.on('connect', client => {
    client._timestamp = Math.round(new Date().valueOf() / 1000);
    client._queryCounter = 0;
    client._id = ++readerClientId;
    //console.log(`[pg read] [conn] [${client._id}] create at ${client._timestamp}. total:idle:waiting ${readerPool.totalCount}:${readerPool.idleCount}:${readerPool.waitingCount}`)
  });

  // readerPool.on('acquire', client => {
  //   //console.log(`[pg read] [conn] [${client._id}] acquired. total:idle:waiting ${readerPool.totalCount}:${readerPool.idleCount}:${readerPool.waitingCount}`)
  // });

  // readerPool.on('remove', client => {
  //   //console.log(`[pg read] [conn] [${client._id}] deleted. total:idle:waiting ${readerPool.totalCount}:${readerPool.idleCount}:${readerPool.waitingCount}`)
  // });
}

function getPool(query) {
  if (readerPool) {
    const regex = new RegExp("^[\\s]*select", "i");
    const isRead = regex.test(query);
    if (isRead)
      return readerPool;
    return writerPool;
  } else {
    return writerPool;
  }
}

async function handleQuery(query, params, options) {
  const { writer } = options;
  const pool = writer ? writerPool : getPool(query);
  //console.log('[pg] Query:', query, params);
  const client = await pool.connect().catch(err => {
    console.log(`[pg] Unable to acquire connection total:idle:waiting ${pool.totalCount}:${pool.idleCount}:${pool.waitingCount}. Query: ${query}, Error: ${err.message}`);
    throw err;
  });
  try {
    let res = await client.query(query, params);
    client._queryCounter++;
    //if (res.rows && res.rows.length === 0)
    //console.log('[pg] Empty result in Query: %s', query);
    //console.log('[pg] Rows:', res.rows);
    return res; //{query, rows, params};
  } catch (err) {
    console.log('[pg] Query Failed: %s, Error: %s', query, err.message);
    throw err;
  } finally {
    //console.log(`[pg] [conn] [${client._id}] releasing`);
    client.release();
  }
}

const exeQuery = async (query, params, options = {}, retryCount = 0, maxRetry = 3, backoff = 500) => {
  while (retryCount < maxRetry) {
    try {
      const result = await handleQuery(query, params, options);
      return result;
    } catch (err) {
      if ((retryCount < maxRetry)
        && (err.message === 'timeout exceeded when trying to connect' || err.message === 'Query read timeout' ||
          err.message === 'sorry, too many clients already' || err.message === 'Connection terminated due to connection timeout')
      ) {
        const s_time = Math.round(Math.pow(2, retryCount)) * backoff;
        console.log(`[pg] query failed. Retry after ${s_time} msec. Query: ${query} retryCount: ${retryCount} maxRetry:${maxRetry} backoff: ${backoff} Error: ${err.message}`);
        await myUtils.sleep(s_time);
        retryCount++;
      } else {
        console.log(`Query Failed After Retrying. Query: ${query} retryCount: ${retryCount} maxRetry:${maxRetry} backoff: ${backoff} Error: ${err.message}`);
        throw err;
      }
    }
  }
};

module.exports = { pgConfig, pgMasterConfig, exeQuery };

module.exports.getSiteInfoByAssetId = (assetId) => {
const query = `
  SELECT
  site_conf.site_id as "site_id",
  site_conf.name as site_name,
  site_conf.wind_speed_threshold,
  site_conf.gust_threshold,
  site_conf.snow_depth_threshold,
  site_conf.panel_snow_depth_threshold,
  site_conf.wind_reporting_close_percentage,
  site_conf.snow_reporting_close_percentage,
  project.weather_forecast_stow_after_time,
  project.enable_weather_forecast_notification,
  ch_asset.name as asset_name,
  ch_asset.repeater_only,
  ch_asset.snap_addr as snap_addr,
  ch_asset.status_bits as asset_status_bits,
  ch_asset.last_reporting_status,
  ch_asset.asset_type,
  project.address as project_location,
  project.location_lat,
  project.location_lng,
  project.is_notify,
  network_controller.id as network_controller_id,
  network_controller.name as network_controller_name,
  network_controller.asset_id as network_controller_asset_id,
network_controller.fw_version as fw_version,
project.name as project_name,
project.id as project_id
  FROM terrasmart.asset as ch_asset
  LEFT JOIN terrasmart.network_controller on network_controller.id = ch_asset.parent_network_controller_id
  LEFT JOIN terrasmart.site_conf on site_conf.site_id = ch_asset.site_id
  LEFT JOIN terrasmart.site on site.id=ch_asset.site_id
  LEFT JOIN terrasmart.project on project.id=site.project_id
  WHERE ch_asset.id = $1 :: UUID;
`;

return exeQuery(query, [assetId])
}

module.exports.getSiteInfoByNCAssetId = (ncAssetId) => {
const query = `
SELECT
site_conf.site_id as "site_id",
site_conf.name as site_name,
site_conf.wind_speed_threshold,
site_conf.gust_threshold,
site_conf.snow_depth_threshold,
site_conf.panel_snow_depth_threshold,
project.weather_forecast_stow_after_time,
project.enable_weather_forecast_notification,
asset.status_bits as asset_status_bits,
asset.asset_type,
project.id as project_id,
project.name as project_name,
project.address as project_location,
project.location_lat,
project.location_lng,
project.is_notify,
network_controller.id as network_controller_id,
network_controller.name as name,
network_controller.name as asset_name,
network_controller.name as network_controller_name,
network_controller.asset_id as network_controller_asset_id,
network_controller.fw_version as fw_version,
asset.snap_addr as snap_addr
FROM terrasmart.asset
LEFT JOIN terrasmart.network_controller on network_controller.asset_id = asset.id
LEFT JOIN terrasmart.site_conf on site_conf.site_id = asset.site_id
LEFT JOIN terrasmart.site on site.id = site_conf.site_id
LEFT JOIN terrasmart.project on project.id = site.project_id
WHERE asset.id = $1 :: UUID;
`;

return exeQuery(query, [ncAssetId])
}

module.exports.getSiteByProjectID = (projectId) => {
  const query = `SELECT * FROM terrasmart.site WHERE site.project_id = $1::UUID`;
  return exeQuery(query, [projectId])
}

module.exports.getAssetInfoDetailed = (assetId) => {
  const query = `
SELECT 
asset.id as "asset_id",
device_type.device_type as device_type,
asset.name as name,
asset.parent_network_controller_id as network_controller_id,
asset.repeater_only,
asset.snap_addr as snap_addr,
site_layout.i as row_id,
site_layout.name as row_name,
site_layout.shorthand_name as shorthand_name
FROM terrasmart.asset
  inner join terrasmart.radio on radio.asset_id = asset.id
  inner join terrasmart.device_type on asset.device_type_id = terrasmart.device_type.id 
  left join terrasmart.site_layout on asset.id = site_layout.asset_id
  WHERE asset.id = $1 :: UUID
  `;

  return exeQuery(query, [assetId])
}

module.exports.getAssetInfoBySnapAddr = (
  client,
  snapAddr
) => {
  const query = `
  SELECT child_asset.id as asset_id,child_asset.name as asset_name,child_asset.status_bits,site_conf.site_id,
  site_conf.name as site_name, site_conf.location_lat,site_conf.location_lng,project.is_notify,
  project.id as project_id,project.name as project_name, project.address as project_location,
  site_layout.name as row_name, site_layout.i as row_id,site_layout.shorthand_name,
  network_controller.id as nc_id, network_controller.asset_id as nc_asset_id
  FROM terrasmart.asset as child_asset
  LEFT JOIN terrasmart.network_controller on network_controller.id = child_asset.parent_network_controller_id
  LEFT JOIN terrasmart.site_conf on site_conf.site_id = child_asset.site_id
  LEFT JOIN terrasmart.site on site.id = child_asset.site_id
  LEFT JOIN terrasmart.project on project.id = site.project_id
  LEFT JOIN terrasmart.site_layout on site_layout.asset_id = child_asset.id
  WHERE child_asset.snap_addr = $1 :: VARCHAR`;
  return client.query(query, [snapAddr]);
}
module.exports.getSiteModeByNCId = (
  client,
  ncId
) => {
  const query = `
  SELECT commanded_state, commanded_state_detail, commanded_state_changed_at,
  last_commanded_state, last_commanded_state_detail, last_commanded_state_changed_at
  FROM terrasmart.network_controller
  WHERE id = $1::UUID`;
  return client.query(query, [ncId]);

}
module.exports.getAssetInfoById = (
  snapAddr
) => {
  const query = `select * from terrasmart.asset where id = $1::uuid`;
  return exeQuery(query, [snapAddr]);
}
module.exports.getAssetAndSiteLayoutByAssetId = (
  assetId
) => {
  const query = `SELECT a.name AS asset_name, a.snap_addr, a.id as "assetId", s.link_row_type as "linkRowType",
  s.link_row_ref as "linkRowRef", s.i as row_id, s.name as row_name, s.shorthand_name, s.device_type
  FROM terrasmart.asset a
  INNER JOIN terrasmart.site_layout s ON a.id = s.asset_id
  WHERE a.id = $1`;
  return exeQuery(query, [assetId]);
}

module.exports.getLastBatteryUpdate = (assetId) => {
  const query = `
  SELECT battery.last_pct_charged as poc
  FROM terrasmart.battery
    INNER JOIN terrasmart.charger_battery on charger_battery.battery_id = battery.id
    INNER JOIN terrasmart.charger on charger.id = charger_battery.charger_id
  WHERE charger.asset_id = $1 :: UUID
  `;

  return exeQuery(query, [assetId])
}

module.exports.getSiteInfoById = (siteId) => {
  const query = `SELECT * FROM terrasmart.site WHERE id = $1::UUID;`
  return exeQuery(query, [siteId]);
}

module.exports.getProjectUsers = (projectId, notificationType) => {
  const emailKey = `${notificationType}_email`;
  const smsKey = `${notificationType}_sms`;

  const query = `
    SELECT
      users.last_login,
      users.email_addr,
      users.sms_num,
      r.level,
      jsonb_build_object(
        '${emailKey}', notification_settings->>'${emailKey}',
        '${smsKey}', notification_settings->>'${smsKey}',
        'sms_enabled', notification_settings->>'sms_enabled',
        'email_enabled', notification_settings->>'email_enabled'
      ) AS notification_settings,
      jsonb_build_object(
        'project_notification', notification_schedules->'project_notification',
        '${notificationType}', notification_schedules->'${notificationType}'
      ) AS notification_schedules,
      project.sms_notify AS site_sms,
      project.email_notify AS site_email,
      project.is_in_construction,
      users.super,
      users.timezone AS user_timezone,
      users.notification_status_email AS user_notification_status_email,
      users.notification_status_sms AS user_notification_status_sms
    FROM terrasmart.users
    INNER JOIN terrasmart.projects_users up ON up.user_id = users.user_id
    INNER JOIN terrasmart.roles r ON r.id = up.role_id
    INNER JOIN terrasmart.user_project_notifications upn ON upn.user_id = up.user_id AND upn.project_id = up.project_id
    INNER JOIN terrasmart.project ON project.id = up.project_id
    WHERE up.project_id = $1::UUID
    AND users.last_login IS NOT NULL;
  `;

  return exeQuery(query, [projectId]);
};


module.exports.getProjectSuperUsers = (projectId, notificationType) => {
  const emailKey = `${notificationType}_email`;
  const smsKey = `${notificationType}_sms`;

  const query = `
    SELECT
      users.last_login,
      users.email_addr,
      users.sms_num,
      r.level,
      jsonb_build_object(
        '${emailKey}', notification_settings->>'${emailKey}',
        '${smsKey}', notification_settings->>'${smsKey}',
        'sms_enabled', notification_settings->>'sms_enabled',
        'email_enabled', notification_settings->>'email_enabled'
      ) AS notification_settings,
      jsonb_build_object(
        'project_notification', notification_schedules->'project_notification',
        '${notificationType}', notification_schedules->'${notificationType}'
      ) AS notification_schedules,
      project.sms_notify AS site_sms,
      project.email_notify AS site_email,
      project.is_in_construction,
      users.super,
      users.timezone AS user_timezone,
      users.notification_status_email AS user_notification_status_email,
      users.notification_status_sms AS user_notification_status_sms
    FROM terrasmart.users
    INNER JOIN terrasmart.projects_users up ON up.user_id = users.user_id
    INNER JOIN terrasmart.roles r ON r.id = up.role_id
    INNER JOIN terrasmart.user_project_notifications upn ON upn.user_id = up.user_id AND upn.project_id = up.project_id
    INNER JOIN terrasmart.project ON project.id = up.project_id
    WHERE up.project_id = $1::UUID
    AND users.last_login IS NOT NULL
    AND r.level IN (1, 2);
  `;

  return exeQuery(query, [projectId]);
};

module.exports.getCloudAlertById = (alertId) => {
  const query = `SELECT * FROM terrasmart.cloud_alert WHERE id = $1::UUID`;
  return exeQuery(query, [alertId])
}

module.exports.getActiveAlert = (
  client,
  snapAddr,
  eventName
) => {
  const query = `
  SELECT cloud_alert.* FROM terrasmart.cloud_alert
                INNER JOIN terrasmart.asset on asset.id = cloud_alert.asset_id
                WHERE asset.snap_addr = $1 :: VARCHAR AND event_name = $2 :: VARCHAR AND cloud_alert.active = true`;
  return client.query(query, [snapAddr, eventName]);
}
module.exports.getCloudEventByNameAndTime = (client, assetId, eventName, timestamp) => {

  const query = `
  SELECT * FROM terrasmart.cloud_event_log 
  WHERE asset_id = $1::UUID AND name = $2::VARCHAR AND created >= $3::TIMESTAMP
  `;
  console.log(query, [
    assetId,
    eventName,
    timestamp,
  ]);
  return client.query(query, [
    assetId,
    eventName,
    timestamp,
  ]);

}

module.exports.getCloudAlertSiteModeHist = (
  client,
  networkControllerId
) => {
  const query = `
  SELECT cloud_alert_site_mode_hist.*,users.display_name AS user_name, users.email_addr AS user_email
         FROM terrasmart.cloud_alert_site_mode_hist
        INNER JOIN terrasmart.users on users.user_id = cloud_alert_site_mode_hist.user_id
        WHERE network_controller_id = $1::UUID
        AND is_changed = false
        AND tracking_enable = true
        AND backtracking_enable = true
        AND "timestamp" > NOW() - INTERVAL '30 seconds'`;
  return client.query(query, [networkControllerId]);
}

module.exports.getCloudAlertSiteModeHistWithOptMode = (
  client,
  networkControllerId,
  cmdStateDetail
) => {
  const query = `
  SELECT cloud_alert_site_mode_hist.*,users.display_name AS user_name, users.email_addr AS user_email
         FROM terrasmart.cloud_alert_site_mode_hist
        INNER JOIN terrasmart.users on users.user_id = cloud_alert_site_mode_hist.user_id
        WHERE network_controller_id = $1::UUID
        AND operational_mode = $2::INT
        AND is_changed = false
        AND tracking_enable = false
        AND backtracking_enable = false
        AND "timestamp" > NOW() - INTERVAL '30 seconds'`;
  return client.query(query, [networkControllerId, cmdStateDetail]);
}

module.exports.updateCloudAlertSiteModeHist = (client, id) => {
  const query = `UPDATE terrasmart.cloud_alert_site_mode_hist SET is_changed = true WHERE id = $1::UUID`
  return client.query(query, [id]);
}

module.exports.getCloudSiteModeHist = (
  client,
  networkControllerId
) => {
  const query = `
  SELECT cloud_site_mode_hist.*,users.display_name AS user_name, users.email_addr AS user_email
         FROM terrasmart.cloud_site_mode_hist
        INNER JOIN terrasmart.users on users.user_id = cloud_site_mode_hist.user_id
        WHERE network_controller_id = $1::UUID
        AND is_changed = false
        AND tracking_enable = true
        AND backtracking_enable = true
        AND "timestamp" > NOW() - INTERVAL '30 seconds'`;
  return client.query(query, [networkControllerId]);
}

module.exports.getActiveWeatherForecastStowBySiteId = async (client, siteId, stowType, active) => {
  const query = `
    select * from terrasmart.weather_forecast_stow
    where site_id = $1 and stow_type = $2 and active = $3
  `;
  return client.query(query, [siteId, stowType, active])
};

module.exports.getWeatherCurrentConditionsByProjectID = (client, project_id) => {
  const query = `SELECT * FROM terrasmart.weather_current_conditions WHERE project_id = $1::uuid order by timestamp desc limit 1`;
  return client.query(query, [project_id]);
};

module.exports.updateWeatherForecastStow = async (pgWrite, siteId, stowType, args) => {
  let { query, values } = getKeysAndValues(args, "update");
  values = [...values, siteId, stowType];
  const q = `UPDATE terrasmart.weather_forecast_stow SET ${query} WHERE site_id=$${values.length -1} AND stow_type = $${values.length} RETURNING *`;
  return pgWrite.query(q, values);
};

module.exports.getCloudSiteModeHistWithOptMode = (
  client,
  networkControllerId,
  cmdStateDetail
) => {
  const query = `
  SELECT cloud_site_mode_hist.*,users.display_name AS user_name, users.email_addr AS user_email
         FROM terrasmart.cloud_site_mode_hist
        INNER JOIN terrasmart.users on users.user_id = cloud_site_mode_hist.user_id
        WHERE network_controller_id = $1::UUID
        AND is_changed = false
        AND tracking_enable = false
        AND backtracking_enable = false
        AND operational_mode = $2::INT
        AND "timestamp" > NOW() - INTERVAL '30 seconds'`;
  return client.query(query, [networkControllerId, cmdStateDetail]);
}

module.exports.updateCloudSiteModeHist = (client, id) => {
  const query = `UPDATE terrasmart.cloud_site_mode_hist SET is_changed = true WHERE id = $1::UUID`
  return client.query(query, [id]);
}
module.exports.addCloudEventLogWithUserInfo = (
  client,
  assetId,
  eventName,
  timestamp,
  title,
  icon,
  userName,
  email,
  levelNo,
) => {
  const query = `
  WITH cloud_event_log_insert AS (
    INSERT INTO terrasmart.cloud_event_log (name,message,levelno,created,asset_id,type,title,icon,user_name,user_email)
    VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: INT, $4 :: TIMESTAMP,$5 :: UUID, $6::INT,$7::VARCHAR,$8::VARCHAR,$9::VARCHAR,$10::VARCHAR)
    RETURNING id AS id
  )
  SELECT id FROM cloud_event_log_insert`;
  return client.query(query, [
    eventName,
    null,
    levelNo,
    timestamp,
    assetId,
    1,
    title,
    icon,
    userName,
    email
  ]);
}

module.exports.addCloudEventLog = (
  assetId,
  eventName,
  timestamp,
  title,
  icon,
  params,
  levelNo = 20
) => {
  const query = `
  WITH cloud_event_log_insert AS (
  INSERT INTO terrasmart.cloud_event_log (name, levelno, created, asset_id, type, title, icon, params)
  VALUES ($1 :: VARCHAR, $2 :: INT, $3 :: TIMESTAMP,$4 :: UUID, $5::INT,$6::VARCHAR,$7::VARCHAR,$8::JSON)
  RETURNING id AS id
  )
  SELECT id FROM cloud_event_log_insert`;
  return exeQuery(query, [
    eventName,
    levelNo,
    timestamp,
    assetId,
    2, //Individual Asset Events,
    title,
    icon,
    params ? JSON.stringify(params) : null
  ]);
}

module.exports.addCloudEventLogDetail = (
  client,
  assetId,
  eventName,
  timestamp,
  title,
  icon,
  type,
  levelno,
  logId,
  params
) => {
  const query = `
  INSERT INTO terrasmart.cloud_event_log_detail (name,levelno,created,asset_id,type,title,icon,cloud_event_log_id,params)
  VALUES ($1 :: VARCHAR, $2 :: INT, $3 :: TIMESTAMP,$4 :: UUID, $5::INT,$6::VARCHAR,$7::VARCHAR,$8::UUID,$9::JSON)
  `;
  console.log(query, [
    eventName,
    levelno,
    timestamp,
    assetId,
    type, //Individual Asset Events,
    title,
    icon,
    logId,
    params ? JSON.stringify(params) : null
  ]);
  return client.query(query, [
    eventName,
    levelno,
    timestamp,
    assetId,
    type, //Individual Asset Events,
    title,
    icon,
    logId,
    params ? JSON.stringify(params) : null
  ]);
}
module.exports.addFullCloudEventLog = (
  assetId,
  levelno,
  timestamp,
  eventName,
  eventMessage,
  eventTitle,
  eventIcon,
  eventType,
  userName,
  userEmail,
  params
) => {
  const query = `
  INSERT INTO terrasmart.cloud_event_log (name,message,levelno,created,asset_id,type,title,icon,user_name,user_email,params)
  VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: INT, $4 :: TIMESTAMP,$5 :: UUID, $6::INT,$7::VARCHAR,$8::VARCHAR,$9::VARCHAR,$10::VARCHAR,$11::JSON)
  `;
  return exeQuery(query, [eventName, eventMessage, levelno, timestamp, assetId, eventType, eventTitle, eventIcon, userName, userEmail, params ? JSON.stringify(params) : null]);
}

module.exports.addCloudAlertWithUserInfo = (
  assetId,
  eventName,
  timestamp,
  title,
  icon,
  userName,
  email,
  message,
  params,
  levelNo
) => {
  const query = `
  WITH cloud_alert_insert AS (
    INSERT INTO terrasmart.cloud_alert(event_name, message, created, asset_id, 
    type, active, title, icon, user_name, user_email, params, levelno)
    VALUES ($1 :: VARCHAR, $2 :: TEXT, $3 :: TIMESTAMP,$4 :: UUID, $5 :: INT, $6 :: Boolean,$7 :: VARCHAR,$8::VARCHAR,$9::VARCHAR,$10::VARCHAR, $11::JSON, $12::INT)
    RETURNING id AS id
  )
SELECT id FROM cloud_alert_insert`;
  return exeQuery(query, [
    eventName,
    message,
    timestamp,
    assetId,
    2,
    true,
    title,
    icon,
    userName,
    email,
    params ? JSON.stringify(params) : null,
    levelNo
  ]);
}
module.exports.getCloudAlert = (client, assetId, eventName) => {
  const query = `
  SELECT cloud_alert.* FROM terrasmart.cloud_alert
  WHERE asset_id = $1 :: UUID AND event_name = $2 :: VARCHAR AND cloud_alert.active = true`;
  return client.query(query, [assetId, eventName]);
}
module.exports.getActiveAlertsForAllAssets = (client, nc_asset_id) => {
  const query = ` SELECT cloud_alert.id,
  cloud_alert.asset_id,
  cloud_alert.created,
  cloud_alert.type,
  cloud_alert.event_name,
  cloud_alert.message,
  cloud_alert.active,
  cloud_alert.last_updated,
  cloud_alert.title,
  cloud_alert.icon,
  cloud_alert.user_name,
  cloud_alert.user_email,
  cloud_alert.linked_asset_id,
  cloud_alert.params::TEXT
FROM terrasmart.cloud_alert
WHERE 
cloud_alert.active = true AND (cloud_alert.asset_id in (
        SELECT asset.id as asset_id FROM terrasmart.asset
        INNER JOIN terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
        WHERE network_controller.asset_id = $1 :: UUID  AND asset.active = true
        )
    OR cloud_alert.asset_id = $1 :: UUID)
    AND event_name != 'NC-COMMANDED-STATE' 
    AND cloud_alert.event_name NOT ILIKE 'Weather_Stow_%'
    AND cloud_alert.event_name != 'Increased_Weather_Reporting_Avg_Wind'
    AND cloud_alert.event_name != 'Increased_Weather_Reporting_Wind_Gust'
    AND cloud_alert.event_name != 'Increased_Weather_Reporting_Deep_Snow'
    AND cloud_alert.event_name != 'Increased_Weather_Reporting_Deep_Panel_Snow'
    AND cloud_alert.event_name != 'ML_ISSUE-POC'
    AND cloud_alert.event_name != 'ML_ISSUE-CURRENT_ANGLE'
    AND cloud_alert.event_name != 'NC-BATTERY_WARNING'
    AND cloud_alert.event_name != 'ASSET-BATTERY_WARNING'
    AND cloud_alert.event_name NOT ILIKE 'Weather_Forecast%'
    AND cloud_alert.event_name != 'VEGETATION-ALERT'
    AND cloud_alert.event_name != 'SNOW_SHEDDING_DELAY'
    ORDER BY cloud_alert.created DESC;`;
  return client.query(query, [nc_asset_id]);
}

module.exports.getProjectDetailsBySiteId = (siteId) => {
  const query = `SELECT 
    p.*
  FROM terrasmart.site s 
    LEFT JOIN terrasmart.project p ON p.id = s.project_id
  WHERE s.id = $1::UUID;`;
  return exeQuery(query, [siteId]);
};

module.exports.getProjectDetailsByNcId = (ncId) => {
  const query = `SELECT 
    nc.asset_id AS nc_asset_id, 
    a1.site_id, 
    s.project_id,
    p.*
  FROM terrasmart.network_controller nc
    LEFT JOIN terrasmart.asset a1 ON a1.id=nc.asset_id
    LEFT JOIN terrasmart.site s ON s.id=a1.site_id
    LEFT JOIN terrasmart.project p ON p.id=s.project_id
  WHERE nc.id = $1::UUID;`;
  return exeQuery(query, [ncId]);
};


module.exports.getNewBatteryAlert = async (payload, batteryInfo) => {
  const query = `SELECT * FROM terrasmart.cloud_alert
   WHERE asset_id = $1 :: UUID AND (event_name = $2 :: VARCHAR OR event_name = $3 :: VARCHAR) AND active = true
   ORDER BY created DESC limit 1`;

  return exeQuery(query, [
    payload.asset_id,
    batteryInfo.device_type === "Network Controller"
      ? "NC-BATTERY_WARNING"
      : "ASSET-BATTERY_WARNING",
    batteryInfo.device_type === "Network Controller"
      ? "NC-BATTERY_FAULT"
      : "ASSET-BATTERY_FAULT",
  ]);
};

module.exports.addCloudAlert = (
  assetId,
  eventName,
  timestamp,
  title,
  icon,
  message,
  type,
  levelno,
  params
) => {
  const query = `
    INSERT INTO terrasmart.cloud_alert(event_name, created, asset_id, type, active, title, icon, message, levelno, params)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

  return exeQuery(query, [
    eventName,
    timestamp,
    assetId,
    type,
    true,
    title,
    icon,
    message,
    levelno,
    params ? JSON.stringify(params) : null
  ]);
};

module.exports.getCloudAlertDetailByAlertId = (cloudAlertId) => {
  const query = `SELECT * FROM terrasmart.cloud_alert_detail WHERE cloud_alert_id = $1::UUID`
  return exeQuery(query, [cloudAlertId])
}

module.exports.removeCloudAlertDetail = (client, alertId) => {
  const query = `
      Delete from terrasmart.cloud_alert_detail
      WHERE cloud_alert_detail.cloud_alert_id = $1::UUID`;

  return client.query(query, [alertId]);
};

module.exports.removeCloudAlert = (client, alertId) => {
  const query = `DELETE FROM terrasmart.cloud_alert WHERE id = $1::UUID`;
  return client.query(query, [alertId]);
};
