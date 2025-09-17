'use strict';
const { getKeysAndValues, arrayToString } = require("../helpers/functions");

const environmentSupport = require('./environmentSupport');
const envVar = require('./envVarProvider');
const { Pool, types } = require("pg");
const myUtils = require("../../util");
const { v4: uuidv4 } = require('uuid');

// Make sure when converting Postgres timestamp it is UTC
const TIMESTAMP_OID = 1114;
const parseFn = val =>
  val === null ? null : new Date(Date.parse(`${val}+0000`));

types.setTypeParser(TIMESTAMP_OID, parseFn);

const writerPool = new Pool({
  application_name: envVar.getAppName(),
  user: process.env.DB_USER,
  host: process.env.DB_WRITE_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: environmentSupport.isLambdaFunction() ? process.env.DB_WRITE_MAX_CLIENT_COUNT_LAMBDA : process.env.DB_WRITE_MAX_CLIENT_COUNT,
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
  client._timestamp = myUtils.getUTCNow();
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
    application_name: envVar.getAppName(),
    user: process.env.DB_USER,
    host: process.env.DB_READ_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: environmentSupport.isLambdaFunction() ? process.env.DB_READ_MAX_CLIENT_COUNT_LAMBDA : process.env.DB_READ_MAX_CLIENT_COUNT,
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
    client._timestamp = myUtils.getUTCNow();
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

exports.exeQuery = async (query, params, options = {}, retryCount = 0, maxRetry = 3, backoff = 500) => {
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

exports.updateQueryHelper = (data) => {
  let valuesToSet = '';
  const values = [];
  for (const key in data) {
    if (valuesToSet) {
      valuesToSet += ', ';
    }
    valuesToSet += `${key} = $${values.length + 1}`;
    values.push(data[key]);
  }

  return {
    valuesToSet,
    values
  }
}

exports.getNetworkControllerByPrincipalId = (principalId) => {
  return this.exeQuery(
    'SELECT nc.id, nc.asset_id, nc.name, nc.last_updated, nc.fw_version, nc.commanded_state, nc.commanded_state_detail, a.site_id, a.snap_addr ' +
    'FROM terrasmart.network_controller nc ' +
    'INNER JOIN terrasmart.asset a on a.id = nc.asset_id ' +
    'WHERE aws_iot_principal_id = $1::char(64) ' +
    'LIMIT 1;',
    [principalId],
    { writer: true } // Forcing this query to be always executed on writer
  );
}

exports.getNcSnapAddrU8ByPrincipalId = async (principalId) => {
  const query = `
    SELECT
      radio.snap_addr
    FROM terrasmart.network_controller
      INNER JOIN terrasmart.asset ON network_controller.asset_id = asset.id
      INNER JOIN terrasmart.radio ON radio.asset_id = asset.id
    WHERE network_controller.aws_iot_principal_id = $1
    LIMIT 1
  `;
  return this.exeQuery(query, [principalId]);
}

module.exports.getRackAngleHistBySnapAddr = async (snapAddr, startTime, endTime) => {
  return this.exeQuery(`
    SELECT * 
      FROM terrasmart.asset_history 
    WHERE 
      snap_addr = $1::CHAR(6) AND 
      timestamp >= to_timestamp($2)::TIMESTAMP AND 
      timestamp <= to_timestamp($3)::TIMESTAMP AND
      data -> 'rack.current_angle' IS NOT NULL
      ORDER BY timestamp ASC
    `, [snapAddr, startTime / 1000, endTime / 1000]
  );
};

module.exports.getAssetHistoryBySnapAddr = async (snapAddr) => {
  return this.exeQuery(
    `SELECT snap_addr,EXTRACT(epoch FROM timestamp) AS timestamp,data
     FROM terrasmart.asset_history WHERE snap_addr = $1::CHAR(6)
    ORDER BY timestamp DESC
    LIMIT 1;
    `,
    [snapAddr]
  );
}

exports.addSnowShedding = async (
  ncSnapAddr,
  timestamp,
  depth,
  baseline,
  snowOnGroundNow,
  estimate,
  trigger,
  threshold,
  active,
  snapAddr,
  lastSnowShedding,
  state) => {
  const query = `INSERT INTO terrasmart.snow_shedding (
    snap_addr,
    timestamp,
    depth,
    baseline,
    snow_on_ground_now,
    estimate,
    trigger,
    threshold,
    active,
    asset_snap_addr,
    last_snow_shedding,
    state
    )
    VALUES ($1::VARCHAR, $2::BIGINT, $3::FLOAT, $4::FLOAT, $5::FLOAT, $6::FLOAT, $7::FLOAT, $8::FLOAT,$9::BOOLEAN,$10::VARCHAR,$11::BIGINT,$12::INT)
    ON CONFLICT (snap_addr)
      DO UPDATE SET
      timestamp = excluded.timestamp,
      depth = excluded.depth,
      baseline = excluded.baseline,
      snow_on_ground_now = excluded.snow_on_ground_now,
      estimate = excluded.estimate,
      trigger = excluded.trigger,
      threshold = excluded.threshold,
      active = excluded.active,
      asset_snap_addr = excluded.asset_snap_addr,
      last_snow_shedding = excluded.last_snow_shedding,
      state = excluded.state
      returning  *
       `;
  return this.exeQuery(query, [
    ncSnapAddr,
    timestamp,
    depth,
    baseline,
    snowOnGroundNow,
    estimate,
    trigger,
    threshold,
    active,
    snapAddr,
    lastSnowShedding,
    state]);
}

exports.addSnowSheddingReport = async (
  snapAddr,
  timestamp,
  payload) => {
  const query = `INSERT INTO terrasmart.snow_shedding_report (snap_addr, timestamp, report_detail)
    VALUES ($1::VARCHAR, $2::BIGINT, $3::JSONB)
    ON CONFLICT (snap_addr)
      DO UPDATE SET
      timestamp = excluded.timestamp,
      report_detail = excluded.report_detail
       `;

  return this.exeQuery(query, [snapAddr, timestamp, payload]);
}

exports.createAssetConf = async (snapAddr) => {
  const query = `INSERT INTO terrasmart.asset_conf 
    (snap_addr, config_label, config_timestamp)
    VALUES ($1::VARCHAR, '00-000'::text, FLOOR(EXTRACT(epoch FROM NOW())*1000)
  ) returning *`
  return this.exeQuery(query, [snapAddr]);
}

exports.insertLastAssetUpdate = async (snapAddr, timestamp) => {
  const query = `
    INSERT INTO terrasmart.asset_last_update (snap_addr, last_asset_update)
    VALUES ( $1, $2 )
    ON CONFLICT (snap_addr, last_asset_update) DO NOTHING
  `;
  return this.exeQuery(query, [snapAddr, timestamp]);
};

exports.getAssetInfoByNCId = async (networkControllerId) => {
  const query = `
    SELECT a.* 
    FROM terrasmart.network_controller nc 
    JOIN terrasmart.asset a ON nc.asset_id = a.id
    WHERE nc.id = $1;
  `;
  return this.exeQuery(query, [networkControllerId]);
}

exports.setSiteIdOfAssetBySnap = async (snapAddr, siteId) => {
  const query = `
    UPDATE terrasmart.asset
    SET site_id = $2
    WHERE snap_addr = $1;
  `;
  return this.exeQuery(query, [snapAddr, siteId]);
}

exports.getNetworkControllerById = (networkControllerId) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.network_controller WHERE id = $1::UUID ',
    [networkControllerId]
  );
}

exports.getNetworkControllerByAssetId = (assetId) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.network_controller WHERE asset_id = $1::UUID ',
    [assetId]
  );
}

exports.getNetworkControllerBySnapAddr = (snapAddr) => {
  return this.exeQuery(
    `SELECT * FROM terrasmart.network_controller nc
      inner join terrasmart.asset nca on nca.id = nc.asset_id 
      where nca.snap_addr = $1;`,
    [snapAddr]
  );
}

exports.getCloudAlertByCloudAlertID = async (alertId) => {
  const query = `
    SELECT * FROM terrasmart.cloud_alert
    WHERE id = $1;
  `;
  return this.exeQuery(query, [alertId]);
};

exports.getCloudAlertDetailByCloudAlertID = async (cloudAlertId) => {
  const query = `
    SELECT * FROM terrasmart.cloud_alert_detail 
    WHERE cloud_alert_id = $1
  `;
  return this.exeQuery(query, [cloudAlertId]);
};

exports.getProjectByNCPrincipleID = (principleID) => {
  const query = `
    SELECT p.* 
    FROM terrasmart.network_controller nc
      INNER JOIN terrasmart.asset a ON a.id = nc.asset_id AND a.parent_network_controller_id IS NULL
      INNER JOIN terrasmart.site s ON s.id = a.site_id
      INNER JOIN terrasmart.project p ON p.id = s.project_id
    WHERE nc.aws_iot_principal_id = $1`;
  return this.exeQuery(query, [principleID]);
};

/*
 * Purpose:
 * This query updates the location (latitude, longitude) and altitude for a specific project
 * in the "terrasmart.project" table. It selects the first site associated with the project
 * based on the "name" property in the "terrasmart.site_conf" table, and uses GPS data
 * linked to the site's associated network controller.
 */
exports.updateProjectGPSCoordsFromFirstNC = (pid) => {
  const query = `
    WITH first_site AS (
      SELECT DISTINCT ON (s.project_id) 
        s.id AS site_id,
        s.project_id,
        sc.name
      FROM terrasmart.site s
      LEFT JOIN terrasmart.site_conf sc ON sc.site_id = s.id
      INNER JOIN terrasmart.asset a ON a.site_id = s.id 
      WHERE s.project_id = $1 AND a.parent_network_controller_id IS NOT NULL
      ORDER BY s.project_id, sc.name ASC
      )
    UPDATE terrasmart.project AS p
    SET
      location_lat = gps.lat,
      location_lng = gps.lng,
      altitude = gps.alt
    FROM first_site fs
    INNER JOIN terrasmart.asset a ON a.site_id = fs.site_id AND a.parent_network_controller_id IS NULL
    INNER JOIN terrasmart.network_controller nc ON nc.asset_id = a.id
    INNER JOIN terrasmart.gps gps ON gps.network_controller_id = nc.id
    WHERE p.id = fs.project_id
    RETURNING p.*
  `;
  return this.exeQuery(query, [pid]);
}

exports.updateProjectLocationDetailByProjectId = (pid, country, state, timezone) => {
  const query = `
    UPDATE terrasmart.project
      SET
        country = $1,
        state = $2,
        timezone = $3
      WHERE id = $4
  `;
  return this.exeQuery(query, [country, state, timezone, pid]);
}

exports.getProjectDetailsBySiteId = (siteId) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.project p ' +
    'INNER JOIN terrasmart.site s on s.project_id = p.id ' +
    'WHERE s.id = $1::UUID;',
    [siteId]
  );
}

exports.updateNetworkControllerLastActivity = (id, interval) => {
  return this.exeQuery(
    'UPDATE terrasmart.network_controller ' +
    'SET last_updated = CURRENT_TIMESTAMP ' +
    "WHERE id = $1::UUID AND (last_updated IS NULL OR last_updated < CURRENT_TIMESTAMP - INTERVAL '1 second' * $2) " +
    "RETURNING last_updated",
    [id, interval]
  );
}

exports.updateNetworkControllerPrincipalIdByAssetId = (assetId, principalId) => {
  return this.exeQuery(
    'UPDATE terrasmart.network_controller ' +
    // presence version is set to 0 so that after restart it comes online
    'SET aws_iot_principal_id = $2::char(64), presence_version = $3::int ' +
    'WHERE asset_id = $1::UUID ',
    [assetId, principalId, 0]
  );
}

exports.addNetworkController = (principalId, assetId, clientId = '', networkControllerId = null) => {

  networkControllerId = networkControllerId || uuidv4();

  return this.exeQuery(
    'WITH inserted AS ( ' +
    'INSERT INTO terrasmart.network_controller (id, aws_iot_principal_id, asset_id, presence_client_id, last_updated) ' +
    'VALUES ($1::uuid, $2::char(64), $3::uuid, $4::varchar, CURRENT_TIMESTAMP) ' +
    'RETURNING * ' +
    ') ' +
    'SELECT inserted.*, asset.site_id, asset.snap_addr  FROM inserted INNER JOIN terrasmart.asset ON inserted.asset_id = asset.id ',
    [networkControllerId, principalId, assetId, clientId || '']
  );
}

module.exports.getRadioBySnapAddr = (snapAddr) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.radio ' +
    "WHERE snap_addr = decode($1::varchar, 'hex');",
    [snapAddr],
    { writer: true }
  );
}

module.exports.getAssetBySnapAddr = (snapAddr) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.asset ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr],
    { writer: true }
  );
}

module.exports.getRowInfoBySnapAddr = (snapAddr) => {
  return this.exeQuery(
    'SELECT i as row_id FROM terrasmart.site_layout ' +
    'INNER JOIN terrasmart.asset on asset.id = site_layout.asset_id ' +
    'WHERE asset.snap_addr = $1::char(6);',
    [snapAddr],
  );
}

module.exports.getRowController = (assetId) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.row_controller ' +
    'WHERE asset_id = $1::uuid;',
    [assetId],
    { writer: true }
  );
}

module.exports.addRowController = (assetId) => {
  return this.exeQuery(`
    INSERT INTO terrasmart.row_controller (asset_id)
    VALUES ($1::uuid)
    ON CONFLICT (asset_id) DO NOTHING
    RETURNING *
  `, [assetId]);
}

module.exports.getRackBySnapAddr = (snapAddr) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.rack ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr],
    { writer: true }
  );
}

module.exports.getRackByAssetId = (asset_id) => {
  const query = `
    SELECT rack.id 
    FROM terrasmart.rack 
      INNER JOIN terrasmart.row_controller ON rack.row_controller_id = row_controller.id
    WHERE row_controller.asset_id = $1::UUID`;
  return this.exeQuery(query, [asset_id]);
};

module.exports.updateRackInfo = (params) => {
  const query = `
    UPDATE terrasmart.rack 
    SET 
      current_angle = $1 :: DOUBLE PRECISION,
      requested_angle = $2 :: DOUBLE PRECISION,
      commanded_state = $3 :: INT,
      tracking_status = $4 :: INT,
      commanded_state_detail = $5 :: INT,
      motor_current = $6 :: FLOAT,
      last_updated = $7 :: TIMESTAMP,
      last_requested_angle = requested_angle,
      last_current_angle = current_angle,
      panel_index = $8 :: INT,
      panel_commanded_state = $9 :: INT
    WHERE snap_addr = $10 :: VARCHAR AND last_updated < $7 :: TIMESTAMP RETURNING *`;
  return this.exeQuery(query, params);
};

module.exports.updateRackAngularErr = (params) => {
  const query = `
    UPDATE terrasmart.rack 
      set 
        angular_error_hour =$1 :: DOUBLE PRECISION, 
        angular_err_last_updated = $3::TIMESTAMP
      WHERE rack.id = $2 :: UUID AND angular_err_last_updated <= $3::TIMESTAMP
      RETURNING *`;
  return this.exeQuery(query, params);
};

module.exports.addRack = (snapAddr, rowControllerId) => {
  return this.exeQuery(`
    INSERT INTO terrasmart.rack (row_controller_id, snap_addr)
    VALUES ($1::uuid, $2::char(6))
    ON CONFLICT (snap_addr) DO NOTHING
    RETURNING *
  `, [rowControllerId, snapAddr]);
}

module.exports.addCloudAlert = ({ assetId, eventName, timestamp, title, icon, userName, userEmail, params, message, type, levelNo }) => {
  const vals = [
    assetId,
    eventName || '',
    timestamp,
    title || '',
    message || '',
    icon || null,
    userName || null,
    userEmail || null,
    params || null,
    type || 2,
    levelNo || 20
  ];
  const query = `
    INSERT INTO terrasmart.cloud_alert
      (asset_id, event_name, created, title, message, active, icon, user_name, user_email, params, type, levelno)
    VALUES
      ($1, $2, $3, $4, $5, true, $6, $7, $8, $9, $10, $11)
    RETURNING *`;
  return this.exeQuery(query, vals);
};

module.exports.checkCloudAlertExist = (assetId, eventNamesArray) => {
  const eventNames = arrayToString(eventNamesArray);
  const query = `
    SELECT * FROM terrasmart.cloud_alert
    WHERE event_name IN (${eventNames}) AND asset_id = $1;
  `;
  return this.exeQuery(query, [assetId]);
};

module.exports.getCloudAlertById = (cloudAlertId) => {
  const query = `
    SELECT * FROM terrasmart.cloud_alert
    WHERE id = $1;
  `;
  return this.exeQuery(query, [cloudAlertId]);
};

module.exports.getCloudAlertDetailExcludingEventName = (cloudAlertId, excludedEventName) => {
  const query = `
    SELECT * FROM terrasmart.cloud_alert_detail
    WHERE cloud_alert_id = $1 AND event_name != $2;
  `;
  return this.exeQuery(query, [cloudAlertId, excludedEventName]);
};

module.exports.deleteCloudAlert = (assetId, eventName) => {
  const query = `DELETE FROM terrasmart.cloud_alert WHERE asset_id = $1 AND event_name = $2`;
  return this.exeQuery(query, [assetId, eventName]);
};

module.exports.deleteCloudAlertById = (cloudAlerId) => {
  const query = `DELETE FROM terrasmart.cloud_alert WHERE id = $1`;
  console.log("DELETE CLOUD ALERT BY ID QUERY: ", query, cloudAlerId)
  return this.exeQuery(query, [cloudAlerId]);
};

module.exports.getCloudAlertDetail = (assetId, eventName) => {
  const query = `SELECT * FROM terrasmart.cloud_alert_detail WHERE asset_id = $1 AND event_name = $2`;
  return this.exeQuery(query, [assetId, eventName]);
};

module.exports.deleteCloudAlertDetail = (assetId, eventName) => {
  const query = `DELETE FROM terrasmart.cloud_alert_detail WHERE asset_id = $1 AND event_name = $2 returning *`;
  return this.exeQuery(query, [assetId, eventName]);
};

module.exports.getMotorBySnapAddr = (snapAddr) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.motor ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr],
    { writer: true }
  );
}

module.exports.addMotor = (snapAddr, rowControllerId) => {
  return this.exeQuery(`
    INSERT INTO terrasmart.motor (row_controller_id, snap_addr)
    VALUES ($1::uuid, $2::char(6))
    ON CONFLICT (snap_addr) DO NOTHING
    RETURNING *
  `, [rowControllerId, snapAddr]);
}

module.exports.getAssetLinkedResourcesIds = (isNC, snapAddr) => {
  let query = `
    SELECT * FROM "terrasmart"."asset_entites_ids"
    WHERE snap_addr = $1::bytea LIMIT 1
  `;
  if (isNC) {
    query = `
      SELECT asset.id AS asset_id, battery.id AS battery_id, panel.id as panel_id, charger.id as charger_id, radio.id as radio_id
      FROM terrasmart.radio
        INNER JOIN terrasmart.asset ON terrasmart.radio.asset_id = terrasmart.asset.id
        INNER JOIN terrasmart.panel ON terrasmart.asset.id = terrasmart.panel.asset_id
        INNER JOIN terrasmart.charger ON terrasmart.asset.id = terrasmart.charger.asset_id
        INNER JOIN terrasmart.charger_battery ON terrasmart.charger.id = terrasmart.charger_battery.charger_id
        INNER JOIN terrasmart.battery ON terrasmart.charger_battery.battery_id = terrasmart.battery.id
      WHERE radio.snap_addr = $1::bytea
      LIMIT 1
    `;
  }
  return this.exeQuery(query, [snapAddr]);
};

module.exports.addAsset = (assetId, snapAddr, networkControllerId = null, deviceTypeId = null, assetType = null) => {
  return this.exeQuery(`
    INSERT INTO terrasmart.asset (id, snap_addr, parent_network_controller_id, device_type_id, asset_type, last_cloud_update)
    VALUES ($1::uuid, $2::char(6), $3::uuid, $4::uuid, $5, CURRENT_TIMESTAMP)
    ON CONFLICT (snap_addr) DO NOTHING
    RETURNING *
  `, [assetId, snapAddr, networkControllerId, deviceTypeId, assetType]);
}

module.exports.addRadio = (snapAddr, assetId) => {
  return this.exeQuery(`
    INSERT INTO terrasmart.radio (snap_addr, asset_id)
    VALUES (decode($1::char(6), 'hex'), $2::uuid)
    ON CONFLICT (snap_addr) DO NOTHING
    RETURNING *
  `, [snapAddr, assetId]);
}

module.exports.getPanelBySnapAddr = (snapAddr) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.panel ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr],
    { writer: true }
  );
}

module.exports.addPanel = (snapAddr, assetId) => {
  return this.exeQuery(`
    INSERT INTO terrasmart.panel (snap_addr, asset_id)
    VALUES ($1::char(6), $2::uuid)
    ON CONFLICT (snap_addr) DO NOTHING
    RETURNING *
  `, [snapAddr, assetId]);
}

module.exports.getChargerByAssetId = (assetId) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.charger ' +
    'WHERE asset_id = $1::uuid;',
    [assetId],
    { writer: true }
  );
}

module.exports.addCharger = (assetId, snapAddr) => {
  return this.exeQuery(`
    INSERT INTO terrasmart.charger (asset_id, snap_addr)
    VALUES ($1::uuid, $2)
    ON CONFLICT (asset_id) DO NOTHING 
    RETURNING *
  `, [assetId, snapAddr]);
}

module.exports.addChargerInfo = (assetId, voltage, current) => {
  const query = `
    INSERT INTO terrasmart.charger (asset_id,voltage,current)
    VALUES ($1 ::UUID, $2 :: FLOAT, $3 :: FLOAT)
    RETURNING *
  `;
  return this.exeQuery(query, [assetId, voltage, current]);
};

module.exports.updateBatteryInfo = (args) => {
  const query = `
    UPDATE terrasmart.battery 
    SET 
      last_pct_charged = pct_charged, 
      voltage = $1 :: FLOAT, 
      current = $2 :: FLOAT, 
      pct_charged = $3 ::FLOAT,
      pct_health = $4 ::FLOAT, 
      temperature = $5 :: FLOAT, 
      heater_temperature = $6 :: FLOAT,
      misc_status_bit = $7 :: INTEGER, 
      last_updated = $9 :: TIMESTAMP,
      wakeup_poc = $10, 
      wakeup_poc_at = $11
    WHERE id = $8 :: UUID and last_updated <= $9::TIMESTAMP
    RETURNING *`;
  return this.exeQuery(query, [
    args.voltage,
    args.current,
    args.poc,
    args.poh,
    args.battery_temperature,
    args.heater_temperature,
    args.misc_status_bits,
    args.battery_id,
    args.timestamp,
    args.wakeup_poc,
    args.wakeup_poc_at
  ]);
}

module.exports.getBatteryBySnapAddr = (snapAddr) => {
  return this.exeQuery(
    'SELECT * FROM terrasmart.battery ' +
    'WHERE snap_addr = $1::char(6);',
    [snapAddr],
    { writer: true }
  );
}

module.exports.getBatteryByAssetId = (assetId) => {
  const query = `
    SELECT b.*
    FROM terrasmart.battery b
      INNER JOIN terrasmart.charger_battery cb ON cb.battery_id = b.id
      INNER JOIN terrasmart.charger c ON c.id = cb.charger_id
    WHERE c.asset_id = $1
  `;
  return this.exeQuery(query, [assetId]);
}

module.exports.addBattery = (snapAddr) => {
  const query = `
    INSERT INTO terrasmart.battery (snap_addr)
    VALUES ($1::char(6))
    ON CONFLICT (snap_addr) DO NOTHING
    RETURNING *`;
  return this.exeQuery(query, [snapAddr]);
}

module.exports.linkChargerAndBattery = (chargerId, batteryId) => {
  return this.exeQuery(`
    INSERT INTO terrasmart.charger_battery (charger_id, battery_id)
    VALUES ($1::uuid, $2::uuid)
    ON CONFLICT DO NOTHING
    RETURNING *
  `, [chargerId, batteryId]);
}

module.exports.getChargerAndBatteryLinkInfo = (chargerId, batteryId) => {
  return this.exeQuery(`
    SELECT * 
    FROM terrasmart.charger_battery 
    WHERE charger_id = $1 
    AND battery_id = $2
  `, [chargerId, batteryId]);
}


module.exports.getWeatherForecastStowByNCID = (ncID, stow_type, state, active) => {
  return this.exeQuery(`
    SELECT wfs.*, nca.id as nc_asset_id
    FROM terrasmart.weather_forecast_stow wfs
      INNER JOIN terrasmart.network_controller nc ON nc.id = $1
      INNER JOIN terrasmart.asset nca ON nca.id = nc.asset_id 
    WHERE wfs.stow_type = $2
      AND wfs.state = $3
      AND wfs.active = $4
      AND wfs.site_id = nca.site_id 
  `, [ncID, stow_type, state, active]);
};

module.exports.updateWeatherForecastStow = async (siteId, stowType, args) => {
  let { query, values } = getKeysAndValues(args, "update");
  values = [...values, siteId, stowType];
  const q = `UPDATE terrasmart.weather_forecast_stow SET ${query} WHERE site_id=$${values.length -1} AND stow_type = $${values.length} RETURNING *`;
  return this.exeQuery(q, values);
};

// commanded_state_source
module.exports.updateTrackingMode = (networkControllerId, changedAt, trackingMode, trackingModeDetail, userName, userEmail, source) => {
  return this.exeQuery(
    'UPDATE terrasmart.network_controller SET commanded_state = $2 :: INT, commanded_state_detail = $3 :: INT, commanded_state_changed_at = $4 :: TIMESTAMP ' +
    `, commanded_state_user_name = $5 :: varchar(255), commanded_state_user_email = $6 :: varchar(255) ` +
    `, commanded_state_source = $7 :: varchar(255) ` +
    'WHERE network_controller.id = $1 :: UUID AND (commanded_state_changed_at IS NULL OR commanded_state_changed_at <= $4 :: TIMESTAMP) ',
    [networkControllerId, trackingMode, trackingModeDetail, changedAt, userName, userEmail, source]
  );
}

module.exports.addTrackingModeHisotry = (networkControllerId, changedAt, trackingMode, trackingModeDetail) => {
  return this.exeQuery(
    'INSERT INTO terrasmart.tracking_command_hist(network_controller_id, changed_at, commanded_state, commanded_state_detail) ' +
    'VALUES ($1::uuid, $2::timestamp, $3::int, $4::int) ',
    [networkControllerId, changedAt, trackingMode, trackingModeDetail]
  );
}

module.exports.updateEStopEngageAt = (networkControllerId, estopEngagedAt) => {
  return this.exeQuery(
    'UPDATE terrasmart.network_controller SET last_estop_engage_at = $2 :: TIMESTAMP ' +
    'WHERE network_controller.id = $1 :: UUID AND (last_estop_engage_at IS NULL OR $2 > last_estop_engage_at :: TIMESTAMP) ' +
    'RETURNING last_estop_engage_at ',
    [networkControllerId, estopEngagedAt]
  );
}

module.exports.updateEStopDisengageAt = (networkControllerId, estopDisengagedAt) => {
  return this.exeQuery(
    'UPDATE terrasmart.network_controller SET last_estop_disengage_at = $2 :: TIMESTAMP ' +
    'WHERE network_controller.id = $1 :: UUID AND (last_estop_disengage_at IS NULL OR $2 > last_estop_disengage_at :: TIMESTAMP) ' +
    'RETURNING last_estop_disengage_at ',
    [networkControllerId, estopDisengagedAt]
  );
}

module.exports.addMotorRuntimeHour = (
  motorId,
  totalHour,
  hour,
  day,
  collected_at
) => {
  return this.exeQuery(
    "INSERT INTO terrasmart.motor_runtime_hour (motor_id, total_hour, hour, day, collected_at)" +
    "VALUES ($1::uuid, $2::double precision, $3::int, $4::date, $5::timestamp)",
    [motorId, totalHour, hour, day, collected_at]
  );
};

module.exports.addMotorRuntimeDay = (motorId, totalDay, day, collected_at) => {
  return this.exeQuery(
    "INSERT INTO terrasmart.motor_runtime_day (motor_id, total_day, day, collected_at)" +
    "VALUES ($1::uuid, $2::double precision, $3::date, $4::timestamp)",
    [motorId, totalDay, day, collected_at]
  );
};

module.exports.updateAssetLastActivity = (
  assetId,
  interval,
  assetTimestamp
) => {
  return this.exeQuery(
    `UPDATE terrasmart.asset
    SET last_asset_update = $3,
    last_cloud_update = $3
    WHERE id = $1::UUID AND (last_cloud_update IS NULL OR last_cloud_update < $3::TIMESTAMP - INTERVAL '1 second' * $2)
    RETURNING last_cloud_update`,
    [assetId, interval, assetTimestamp]
  );
};

module.exports.panelVoltageCurrentUpdate = (params) => {
  const query = `
    UPDATE terrasmart.panel 
      set 
        voltage = $1 :: FLOAT, 
        current = $2 :: FLOAT, 
        external_voltage = $3:: FLOAT, 
        external_current = $4:: FLOAT 
    WHERE panel.snap_addr = $5::VARCHAR
    RETURNING *`;
  return this.exeQuery(query, params);
};

module.exports.panelVoltageCurrentUpdateNew = (params) => {
  const query = `
    UPDATE terrasmart.panel 
      set 
        current = $1 :: FLOAT, 
        voltage = $2 :: FLOAT, 
        external_current = $3 :: FLOAT, 
        external_voltage = $4 :: FLOAT
    WHERE (current != 0  OR voltage != 0 OR external_current != 0 OR external_voltage != 0)
      AND (current IS NOT NULL  OR voltage IS NOT NULL OR external_current IS NOT NULL OR external_voltage IS NOT NULL)
      AND snap_addr = $5::VARCHAR
      RETURNING *`;
  return this.exeQuery(query, params);
};

module.exports.assetStatusUpdate = async (ignoreConnected, params, isCurrentStatusUnknownAndNewStatusOffline) => {
  const query = `
    with assetInfo as (
      UPDATE terrasmart.asset
        SET 
          last_reporting_status = reporting, 
          status_bits = $1::INT, 
          reporting = $2::VARCHAR,
          last_asset_update = $3::TIMESTAMP,
          last_cloud_update = $4::TIMESTAMP,
          ${ignoreConnected ? '' : 'connected = $6::BOOLEAN,'}
          last_status_bits = status_bits
        WHERE 
          snap_addr = $5::VARCHAR 
          ${isCurrentStatusUnknownAndNewStatusOffline ? " " : " AND (last_asset_update < $3::TIMESTAMP OR last_asset_update IS NULL) "} 
        returning *
      ) SELECT * from assetInfo
    `;
  // console.log(query, params);
  return this.exeQuery(query, params);
};

module.exports.updateHardwareAndFirmwareRaw = (
  args,
  reportedModel,
  assetId
) => {
  const { valuesToSet, values } = this.updateQueryHelper(args);
  return this.exeQuery(
    `UPDATE terrasmart.asset
     SET ${valuesToSet}` +
    ` , model_id = (
          SELECT model.id 
          FROM terrasmart.model
          WHERE terrasmart.model.reported_model = $${values.length + 1}::INT
        )
    WHERE asset.id = $${values.length + 2}::UUID RETURNING id `,
    [...values, reportedModel, assetId]
  );
};

module.exports.getProjectIdByNcAssetId = nc_asset_id => {
  const query = `
    SELECT 
    	s.project_id
    FROM terrasmart.asset a
      LEFT JOIN terrasmart.site s ON s.id = a.site_id
    WHERE a.id = $1::UUID
  `;
  return this.exeQuery(query, [nc_asset_id]);
};

module.exports.getProjectDetailsByNcId = ncId => {
  const query = `  SELECT 
    nc.asset_id AS nc_asset_id, 
    a1.site_id, 
    s.project_id,
    p.*
  FROM terrasmart.network_controller nc
    LEFT JOIN terrasmart.asset a1 ON a1.id=nc.asset_id
    LEFT JOIN terrasmart.site s ON s.id=a1.site_id
    LEFT JOIN terrasmart.project p ON p.id=s.project_id
  WHERE nc.id = $1::UUID;
  `;
  return this.exeQuery(query, [ncId]);
};

module.exports.getAssetInfoById = (
  snapAddr
) => {
  const query = `select * from terrasmart.asset
    where id = $1::uuid`;
  return this.exeQuery(query, [snapAddr]);
}

module.exports.updateProjectTypeBySiteId = (siteId, site_type) => {
  const query = `
  UPDATE terrasmart.project SET site_type = $1::VARCHAR
  WHERE project.id = (
    SELECT site.project_id FROM terrasmart.site WHERE site.id = $2::UUID
     )
  `;
  return this.exeQuery(query, [site_type, siteId]);
}

module.exports.upsertIrradianceByProjID = args => {
  const query = `
    INSERT INTO terrasmart.weather_irradiance (
      project_id, 
      timestamp, 
      ghi,
      poa,
      snap_addr
    )
    VALUES ($5::UUID, $1, $2, $3, $4)
    ON CONFLICT (project_id)
      DO UPDATE SET
        timestamp = excluded.timestamp,
        ghi = excluded.ghi,
        poa = excluded.poa,
        snap_addr = excluded.snap_addr
  `;
  return this.exeQuery(query, args);
};



module.exports.addIrradianceHistory = args => {
  const query = `
    INSERT INTO terrasmart.irradiance_hist (
      project_id, 
      timestamp, 
      site_ghi,
      site_poa,
      snap_addr
    )
    VALUES ($5::UUID, $1, $2, $3, $4)
  `;
  return this.exeQuery(query, args);
};


module.exports.updateFasttrakReportOnDoneState = (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr
) => {

  const query = `
  UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP,end_time_qc= $1::TIMESTAMP,
  current_state = $2::VARCHAR, max_peak_motor_inrush_current = $3::FLOAT, max_peak_motor_current = $4::FLOAT,
  max_average_motor_current = $5::FLOAT, plus60_complete = true, status_bits = $6::INTEGER, label = $7::VARCHAR,
  user_name = $8::VARCHAR, user_email = $9::VARCHAR, minus60_complete = true, charged = $10::FLOAT, min_temperature = $11::FLOAT,
  max_wind_gust = $12::FLOAT, max_average_wind = $13::FLOAT, battery_stop = $10::FLOAT, last_state = current_state,
  pv1_min = $14::FLOAT, pv1_max = $15::FLOAT, pv2_min = $16::FLOAT, pv2_max = $17::FLOAT 
  WHERE snap_addr = $18::VARCHAR AND last_updated < $1::TIMESTAMP
  RETURNING *
  `;
  // console.log(query,
  //   [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
  //     label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
  return this.exeQuery(
    query,
    [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
      label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
}

exports.removeScheduledFirmwareUpgrade = async (site_id) => {

  let query = `delete from terrasmart.firmware_upgrade_scheduled
    where site_id = $1::uuid RETURNING *`;

  return this.exeQuery(query, [site_id]);
}

exports.getSiteByNcSnapAddr = async (snapAddr) => {

  const query = `SELECT distinct s.*
    	FROM terrasmart.asset a
    	LEFT JOIN terrasmart.network_controller nc ON nc.id = a.parent_network_controller_id
    	LEFT JOIN terrasmart.asset nca ON nca.id = nc.asset_id
    	LEFT JOIN terrasmart.site s ON s.id = nca.site_id
    WHERE nca.snap_addr = $1;`;

  return this.exeQuery(query, [snapAddr]);
}

module.exports.updateFasttrakReportOnMaxState = (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr
) => {

  const query = `
  UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP, start_time_qc = $1::TIMESTAMP,
  current_state = $2::VARCHAR, max_peak_motor_inrush_current = $3::FLOAT, max_peak_motor_current = $4::FLOAT,
  max_average_motor_current = $5::FLOAT,status_bits = $6::INTEGER, label = $7::VARCHAR,
  user_name = $8::VARCHAR, user_email = $9::VARCHAR, charged = $10::FLOAT, min_temperature = $11::FLOAT,
  max_wind_gust = $12::FLOAT, max_average_wind = $13::FLOAT, battery_start = $10::FLOAT, last_state = current_state,
  pv1_min = $14::FLOAT, pv1_max = $15::FLOAT, pv2_min = $16::FLOAT, pv2_max = $17::FLOAT 
  WHERE snap_addr = $18::VARCHAR AND last_updated < $1::TIMESTAMP
  RETURNING *`;
  // console.log(
  //   query,
  //   [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
  //     label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
  return this.exeQuery(
    query,
    [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
      label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
}
module.exports.updateFasttrakReportOnFLat = (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr
) => {

  const query = `
  UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP, current_state = $2::VARCHAR,
  max_peak_motor_inrush_current = $3::FLOAT, max_peak_motor_current = $4::FLOAT,
  max_average_motor_current = $5::FLOAT,status_bits = $6::INTEGER, 
  label = CASE WHEN label IS NULL THEN $7::VARCHAR ELSE label END,
  user_name = $8::VARCHAR, user_email = $9::VARCHAR, charged = $10::FLOAT, min_temperature = $11::FLOAT, 
  max_wind_gust = $12::FLOAT, max_average_wind = $13::FLOAT, last_state = current_state, pv1_min = $14::FLOAT, pv1_max = $15::FLOAT,
  pv2_min = $16::FLOAT, pv2_max = $17::FLOAT 
  WHERE snap_addr = $18 :: VARCHAR AND end_time IS NULL
  RETURNING *`;
  // console.log(
  //   query,
  //   [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
  //     label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
  return this.exeQuery(
    query,
    [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
      label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
}
module.exports.updateFasttrakReport = (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr
) => {

  const query = `
  UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP, current_state = $2::VARCHAR,
  max_peak_motor_inrush_current = $3::FLOAT, max_peak_motor_current = $4::FLOAT,
  max_average_motor_current = $5::FLOAT,status_bits = $6::INTEGER, 
  label = CASE WHEN label IS NULL THEN $7::VARCHAR ELSE label END,
  user_name = $8::VARCHAR, user_email = $9::VARCHAR, charged = $10::FLOAT, min_temperature = $11::FLOAT, 
  max_wind_gust = $12::FLOAT, max_average_wind = $13::FLOAT, last_state = current_state, 
  pv1_min = $14::FLOAT, pv1_max = $15::FLOAT, pv2_min = $16::FLOAT, pv2_max = $17::FLOAT 
  WHERE snap_addr = $18::VARCHAR AND last_updated < $1::TIMESTAMP AND end_time IS NULL
  RETURNING *`;
  // console.log(query,
  //   [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
  //     label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
  return this.exeQuery(
    query,
    [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
      label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
}
module.exports.updateFasttrakReportOnStopStateModeQC = (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr
) => {

  const query = `
  UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP, 
  end_time_qc = (
    CASE 
      WHEN end_time_qc IS NULL THEN $1::TIMESTAMP
      ELSE end_time_qc
    END
  ),
  end_time = $1::TIMESTAMP,current_state = $2::VARCHAR, max_peak_motor_inrush_current = $3::FLOAT,
   max_peak_motor_current = $4::FLOAT, max_average_motor_current = $5::FLOAT,status_bits = $6::INTEGER, 
  label = CASE WHEN label IS NULL THEN $7::VARCHAR ELSE label END,
  user_name = $8::VARCHAR, user_email = $9::VARCHAR, charged = $10::FLOAT, min_temperature = $11::FLOAT,
  max_wind_gust = $12::FLOAT, max_average_wind = $13::FLOAT, battery_stop = (
    CASE 
     WHEN battery_stop IS NULL THEN $10::FLOAT
     ELSE battery_stop
    END
     ), last_state = current_state,pv1_min = $14::FLOAT, pv1_max = $15::FLOAT, pv2_min = $16::FLOAT, pv2_max = $17::FLOAT 
  WHERE snap_addr = $18::VARCHAR AND last_updated < $1::TIMESTAMP AND end_time IS NULL
  RETURNING *`;
  // console.log(query,
  //   [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
  //     label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
  return this.exeQuery(
    query,
    [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
      label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
}


module.exports.updateFasttrakReportOnStopState = (
  timestamp,
  stage,
  maxPeakMotorInrushCurrent,
  maxPeakMotorCurrent,
  maxAverageMotorCurrent,
  statusBits,
  label,
  userName,
  userEmail,
  charged,
  minTemperature,
  maxWindGust,
  maxAverageWind,
  pv1,
  pv2,
  snapAddr
) => {

  const query = `
  UPDATE terrasmart.fasttrak set tracking_status = 12, last_updated = $1::TIMESTAMP, 
  end_time_qc = (
    CASE 
      WHEN end_time_qc IS NULL THEN $1::TIMESTAMP
      ELSE end_time_qc
    END
  ),
  end_time = $1:: timestamp, current_state = $2::VARCHAR, max_peak_motor_inrush_current = $3::FLOAT, max_peak_motor_current = $4::FLOAT,
  max_average_motor_current = $5::FLOAT,status_bits = $6::INTEGER, 
  label = CASE WHEN label IS NULL THEN $7::VARCHAR ELSE label END,
  user_name = $8::VARCHAR, user_email = $9::VARCHAR, charged = $10::FLOAT, min_temperature = $11::FLOAT,
  max_wind_gust = $12::FLOAT, max_average_wind = $13::FLOAT, battery_stop = (
    CASE 
     WHEN battery_stop IS NULL THEN $10::FLOAT
     ELSE battery_stop
    END
     ), last_state = current_state,pv1_min = $14::FLOAT, pv1_max = $15::FLOAT, pv2_min = $16::FLOAT, pv2_max = $17::FLOAT 
  WHERE snap_addr = $18::VARCHAR AND last_updated < $1::TIMESTAMP AND end_time IS NULL
  RETURNING *`;
  // console.log(
  //   query,
  //   [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
  //     label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
  return this.exeQuery(
    query,
    [timestamp, stage, maxPeakMotorInrushCurrent, maxPeakMotorCurrent, maxAverageMotorCurrent, statusBits,
      label, userName, userEmail, charged, minTemperature, maxWindGust, maxAverageWind, pv1?.getMin(), pv1?.getMax(), pv2?.getMin(), pv2?.getMax(), snapAddr]);
}


module.exports.addFasttrakReport = (
  snapAddr,
  trackingStatus,
  timestamp,
  isInConstruction
) => {
  const query = `INSERT INTO terrasmart.fasttrak (snap_addr,tracking_status,last_updated,start_time,end_time,is_in_construction)
  VALUES ($1::VARCHAR, $2::INT, $3::TIMESTAMP, $3::TIMESTAMP,NULL,$4::BOOLEAN)
  ON CONFLICT(snap_addr) DO UPDATE
  SET tracking_status = excluded.tracking_status,
      last_updated = excluded.last_updated,
      start_time = excluded.start_time,
      end_time = NULL,
      end_time_qc = NULL,
      max_peak_motor_inrush_current = 0,
      max_peak_motor_current = 0,
      max_average_motor_current = 0,
      plus60_complete = NULL,
      minus60_complete = NULL,
      current_state = NULL,
      start_time_qc = NULL,
      is_in_construction = excluded.is_in_construction,
      status_bits = NULL,
      label = NULL,
      user_name = NULL,
      user_email = NULL,
      charged = NULL,
      min_temperature = NULL,
      max_wind_gust = NULL,
      max_average_wind = NULL,
      battery_start = NULL,
      battery_stop = NULL,
      last_state = NULL,
      pv1_min = NULL,
      pv1_max = NULL,
      pv2_min = NULL,
      pv2_max = NULL
      `;
  // console.log(query, [snapAddr, trackingStatus, timestamp, isInConstruction]);
  return this.exeQuery(query, [snapAddr, trackingStatus, timestamp, isInConstruction]);
}

module.exports.resetFasttrakReportOnFlat = (snapAddr,
  trackingStatus,
  timestamp,
  isInConstruction) => {
  const query = `UPDATE terrasmart.fasttrak
    SET tracking_status = $2::INT,
        last_updated = $3::TIMESTAMP,
        start_time = $3::TIMESTAMP,
        end_time = NULL,
        end_time_qc = NULL,
        max_peak_motor_inrush_current = 0,
        max_peak_motor_current = 0,
        max_average_motor_current = 0,
        plus60_complete = NULL,
        minus60_complete = NULL,
        current_state = NULL,
        start_time_qc = NULL,
        is_in_construction = $4::BOOLEAN,
        status_bits = NULL,
        label = NULL,
        user_name = NULL,
        user_email = NULL,
        charged = NULL,
        min_temperature = NULL,
        max_wind_gust = NULL,
        max_average_wind = NULL,
        battery_start = NULL,
        battery_stop = NULL,
        last_state = NULL,
        pv1_min = NULL,
        pv1_max = NULL,
        pv2_min = NULL,
        pv2_max = NULL
        WHERE snap_addr = $1::VARCHAR AND end_time IS NOT NULL
        `;
  // console.log(query, [snapAddr, trackingStatus, timestamp, isInConstruction]);
  return this.exeQuery(query, [snapAddr, trackingStatus, timestamp, isInConstruction]);
}

module.exports.addFasttrakHist = (
  snapAddr
) => {
  const query = `INSERT INTO terrasmart.fasttrak_hist (SELECT * FROM terrasmart.fasttrak where fasttrak.snap_addr = $1::VARCHAR)`;
  return this.exeQuery(query, [snapAddr]);
}

module.exports.getFasttrakByAssetSnapAddr = (snapAddr) => {
  const query = `SELECT * FROM terrasmart.fasttrak where fasttrak.snap_addr = $1::VARCHAR`;
  return this.exeQuery(query, [snapAddr]);
}

module.exports.updateFasttrakEndTime = (
  snapAddr,
  timestamp
) => {
  const query = `UPDATE terrasmart.fasttrak set end_time = $2::TIMESTAMP
  WHERE snap_addr = $1::VARCHAR`;
  return this.exeQuery(query, [snapAddr, timestamp]);
}

module.exports.updateFasttrakCompletedStatus = (anlgeType, status, timestamp, snapAddr) => {
  const query = status === false ?
    `UPDATE terrasmart.fasttrak 
  SET ${anlgeType === 60 ? 'plus60' : 'minus60'}_complete = ${status},
   last_updated = $1::TIMESTAMP,
   start_time_qc = (
     CASE 
      WHEN start_time_qc IS NULL THEN $1::TIMESTAMP
      ELSE start_time_qc
     END
      )
  WHERE snap_addr = $2::VARCHAR AND last_updated < $1::TIMESTAMP`:
    `UPDATE terrasmart.fasttrak 
     SET ${anlgeType === 60 ? 'plus60' : 'minus60'}_complete = ${status},
     last_updated = $1::TIMESTAMP,
     end_time_qc = (
      CASE
       WHEN ${anlgeType === 60 ? 'minus60' : 'plus60'}_complete = true THEN $1::TIMESTAMP
       ELSE end_time_qc
      END
     )
     WHERE snap_addr = $2::VARCHAR AND ${anlgeType === 60 ? 'plus60' : 'minus60'}_complete = false AND last_updated < $1::TIMESTAMP`;

  return this.exeQuery(query, [timestamp, snapAddr]);

}

module.exports.updateFasttrakCurrentReport = (currentType, currentValue, snapAddr) => {

  const query = `
  UPDATE terrasmart.fasttrak SET max_${currentType} = $1:: FLOAT 
  WHERE max_${currentType} < $1:: FLOAT
    AND snap_addr= $2:: VARCHAR
    AND (plus60_complete IS NOT NULL OR minus60_complete IS NOT NULL)
    AND end_time IS NULL`;

  return this.exeQuery(query, [currentValue, snapAddr]);
}


module.exports.getAssetConf = (snapAddr) => {
  const query = `
SELECT snap_addr, config_label, config_timestamp::bigint, model_device,
location_lat, location_lng, location_text, hardware_rev,
firmware_rev, site_name, panel_horizontal_cal_angle, panel_min_cal_angle,
panel_max_cal_angle, config_flags, segments_0_panel_array_width, segments_0_spacing_to_east,
segments_0_spacing_to_west, segments_0_delta_height_east, segments_0_delta_height_west,
segments_1_panel_array_width, segments_1_spacing_to_east, segments_1_spacing_to_west,
segments_1_delta_height_east, segments_1_delta_height_west, preset_angles_0_preset_angle,
preset_angles_0_nearest_enabled, preset_angles_1_preset_angle, preset_angles_1_nearest_enabled,
preset_angles_2_preset_angle, preset_angles_2_nearest_enabled, preset_angles_3_preset_angle,
preset_angles_3_nearest_enabled, preset_angles_4_preset_angle,
preset_angles_4_nearest_enabled, preset_angles_5_preset_angle,
preset_angles_5_nearest_enabled, preset_angles_6_preset_angle,
preset_angles_6_nearest_enabled, preset_angles_7_preset_angle,
preset_angles_7_nearest_enabled, preset_angles_8_preset_angle,
preset_angles_8_nearest_enabled, preset_angles_9_preset_angle,
preset_angles_9_nearest_enabled, preset_angles_10_preset_angle,
preset_angles_10_nearest_enabled, preset_angles_11_preset_angle,
preset_angles_11_nearest_enabled, preset_angles_12_preset_angle,
preset_angles_12_nearest_enabled, preset_angles_13_preset_angle,
preset_angles_13_nearest_enabled, preset_angles_14_preset_angle,
preset_angles_14_nearest_enabled, preset_angles_15_preset_angle,
preset_angles_15_nearest_enabled, swoc_required_duration,
swoc_threshold, encoded_hard_limit_register,
encoded_soft_limit_register, snow_sensor_height, wind_dir_offset
 FROM terrasmart.asset_conf
WHERE snap_addr = $1::VARCHAR`;
  // console.log(query, [snapAddr]);
  return this.exeQuery(query, [snapAddr]);
}

module.exports.insertOnDuplicateUpdateNcConfigParams = (ncSnapAddr, params) => {
  const query = `
    INSERT INTO terrasmart.nc_config_params (
        nc_snap_addr,
        data,
        updated_at
    ) VALUES (
        $1, -- nc_snap_addr
        $2, -- data (JSONB)
        $3  -- updated_at
    )
    ON CONFLICT (nc_snap_addr) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = EXCLUDED.updated_at
    RETURNING *;
  `;

  return this.exeQuery(query, [
    ncSnapAddr, 
    JSON.stringify(params.data), // Ensure `data` is stored as JSONB
    params.updated_at
  ]);
};

module.exports.updateAssetConf = (
  snapAddr, config_label, config_timestamp, timestamp, model_device, location_lat, location_lng, location_text,
  hardware_rev, firmware_rev, site_name, panel_horizontal_cal_angle, panel_min_cal_angle, panel_max_cal_angle, config_flags,
  segments_0_panel_array_width, segments_0_spacing_to_east, segments_0_spacing_to_west, segments_0_delta_height_east,
  segments_0_delta_height_west, segments_1_panel_array_width, segments_1_spacing_to_east, segments_1_spacing_to_west,
  segments_1_delta_height_east, segments_1_delta_height_west, preset_angles_0_preset_angle, preset_angles_0_nearest_enabled,
  preset_angles_1_preset_angle, preset_angles_1_nearest_enabled, preset_angles_2_preset_angle, preset_angles_2_nearest_enabled,
  preset_angles_3_preset_angle, preset_angles_3_nearest_enabled, preset_angles_4_preset_angle, preset_angles_4_nearest_enabled,
  preset_angles_5_preset_angle, preset_angles_5_nearest_enabled, preset_angles_6_preset_angle, preset_angles_6_nearest_enabled,
  preset_angles_7_preset_angle, preset_angles_7_nearest_enabled, preset_angles_8_preset_angle, preset_angles_8_nearest_enabled,
  preset_angles_9_preset_angle, preset_angles_9_nearest_enabled, preset_angles_10_preset_angle, preset_angles_10_nearest_enabled,
  preset_angles_11_preset_angle, preset_angles_11_nearest_enabled, preset_angles_12_preset_angle, preset_angles_12_nearest_enabled,
  preset_angles_13_preset_angle, preset_angles_13_nearest_enabled, preset_angles_14_preset_angle, preset_angles_14_nearest_enabled,
  preset_angles_15_preset_angle, preset_angles_15_nearest_enabled, swoc_required_duration, swoc_threshold, encoded_hard_limit_register,
  encoded_soft_limit_register, snow_sensor_height, wind_dir_offset, tracking_min_angle, tracking_max_angle,
  dynamic_min_angle, dynamic_max_angle, simulation_flags, heater_k, preheating_battery_threshold,
  preheating_temperature_threshold, snow_shedding_deadband_angle, snow_shedding_duration,
  autoshed_temperature_threshold, autoshed_minutes_threshold, autoshed_battery_threshold, lbas_entry_threshold, lbas_exit_threshold, median_filter_length, wx_data_record_frequency, snow_sensor_type,
  avg_wind_speed_correction_factor, peak_wind_speed_correction_factor
) => {
  const query = `INSERT INTO terrasmart.asset_conf 
  (snap_addr,config_label,config_timestamp,timestamp,model_device,location_lat,location_lng,location_text,
  hardware_rev,firmware_rev,site_name,panel_horizontal_cal_angle,panel_min_cal_angle,panel_max_cal_angle,config_flags,
  segments_0_panel_array_width,segments_0_spacing_to_east,segments_0_spacing_to_west,segments_0_delta_height_east,
  segments_0_delta_height_west,segments_1_panel_array_width,segments_1_spacing_to_east,segments_1_spacing_to_west,segments_1_delta_height_east,segments_1_delta_height_west,
  preset_angles_0_preset_angle,preset_angles_0_nearest_enabled,preset_angles_1_preset_angle,preset_angles_1_nearest_enabled,
  preset_angles_2_preset_angle,preset_angles_2_nearest_enabled,preset_angles_3_preset_angle,preset_angles_3_nearest_enabled,
  preset_angles_4_preset_angle,preset_angles_4_nearest_enabled,preset_angles_5_preset_angle,preset_angles_5_nearest_enabled,
  preset_angles_6_preset_angle,preset_angles_6_nearest_enabled,preset_angles_7_preset_angle,preset_angles_7_nearest_enabled,
  preset_angles_8_preset_angle,preset_angles_8_nearest_enabled,preset_angles_9_preset_angle,preset_angles_9_nearest_enabled,
  preset_angles_10_preset_angle,preset_angles_10_nearest_enabled,preset_angles_11_preset_angle,preset_angles_11_nearest_enabled,
  preset_angles_12_preset_angle,preset_angles_12_nearest_enabled,preset_angles_13_preset_angle,preset_angles_13_nearest_enabled,
  preset_angles_14_preset_angle,preset_angles_14_nearest_enabled,preset_angles_15_preset_angle,preset_angles_15_nearest_enabled,
  swoc_required_duration, swoc_threshold, encoded_hard_limit_register, encoded_soft_limit_register,snow_sensor_height,wind_dir_offset,
  tracking_min_angle, tracking_max_angle, dynamic_min_angle, dynamic_max_angle, simulation_flags, heater_k, preheating_battery_threshold,
  preheating_temperature_threshold, snow_shedding_deadband_angle, snow_shedding_duration,
  autoshed_temperature_threshold, autoshed_minutes_threshold, autoshed_battery_threshold, lbas_entry_threshold, lbas_exit_threshold, median_filter_length, wx_data_record_frequency, snow_sensor_type,
  avg_wind_speed_correction_factor, peak_wind_speed_correction_factor)
VALUES ($1::VARCHAR,$2::text,$3::text,$4::timestamp,$5::INT,$6::FLOAT,$7::FLOAT,$8::text,
   $9::INT,$10::INT,$11::VARCHAR,$12::INT,$13::INT,$14::INT,$15::INT,
   $16::INT,$17::INT,$18::INT,$19::INT, 
   $20::INT,$21::INT,$22::INT,$23::INT,$24::INT,$25::INT,
   $26::INT,$27::BOOLEAN,$28::INT,$29::BOOLEAN,
   $30::INT,$31::BOOLEAN,$32::INT,$33::BOOLEAN,
   $34::INT,$35::BOOLEAN,$36::INT,$37::BOOLEAN,
   $38::INT,$39::BOOLEAN,$40::INT,$41::BOOLEAN,
   $42::INT,$43::BOOLEAN,$44::INT,$45::BOOLEAN,
   $46::INT,$47::BOOLEAN,$48::INT,$49::BOOLEAN,
   $50::INT,$51::BOOLEAN,$52::INT,$53::BOOLEAN,
   $54::INT,$55::BOOLEAN,$56::INT,$57::BOOLEAN,
   $58::FLOAT,$59::FLOAT,$60::INT,$61::INT, 
   $62::FLOAT,$63::FLOAT,$64::INT,$65::INT,
   $66::INT, $67::INT, $68::INT, $69::FLOAT,
   $70::INT, $71::FLOAT, $72::FLOAT, $73::INT,
   $74::FLOAT, $75::INT,$76::INT,$77::INT,$78::INT,$79::INT, $80::INT, $81::INT,
   $82::NUMERIC, $83::NUMERIC)
   
   ON CONFLICT (snap_addr) DO UPDATE 
    SET config_label = excluded.config_label,
    config_timestamp = excluded.config_timestamp,
    timestamp = excluded.timestamp,
    model_device = excluded.model_device,
    location_lat = excluded.location_lat,
    location_lng = excluded.location_lng,
    location_text = excluded.location_text,
    hardware_rev = excluded.hardware_rev,
    firmware_rev = excluded.firmware_rev,
    site_name = excluded.site_name,
    panel_horizontal_cal_angle = excluded.panel_horizontal_cal_angle,
    panel_min_cal_angle = excluded.panel_min_cal_angle,
    panel_max_cal_angle = excluded.panel_max_cal_angle,
    config_flags = excluded.config_flags,
    segments_0_panel_array_width = excluded.segments_0_panel_array_width,
    segments_0_spacing_to_east = excluded.segments_0_spacing_to_east,
    segments_0_spacing_to_west = excluded.segments_0_spacing_to_west,
    segments_0_delta_height_east = excluded.segments_0_delta_height_east,
    segments_0_delta_height_west = excluded.segments_0_delta_height_west,
    segments_1_panel_array_width = excluded.segments_1_panel_array_width,
    segments_1_spacing_to_east = excluded.segments_1_spacing_to_east,
    segments_1_spacing_to_west = excluded.segments_1_spacing_to_west,
    segments_1_delta_height_east = excluded.segments_1_delta_height_east,
    segments_1_delta_height_west = excluded.segments_1_delta_height_west,
    preset_angles_0_preset_angle = excluded.preset_angles_0_preset_angle,
    preset_angles_0_nearest_enabled = excluded.preset_angles_0_nearest_enabled,
    preset_angles_1_preset_angle = excluded.preset_angles_1_preset_angle,
    preset_angles_1_nearest_enabled = excluded.preset_angles_1_nearest_enabled,
    preset_angles_2_preset_angle = excluded.preset_angles_2_preset_angle,
    preset_angles_2_nearest_enabled = excluded.preset_angles_2_nearest_enabled,
    preset_angles_3_preset_angle = excluded.preset_angles_3_preset_angle,
    preset_angles_3_nearest_enabled = excluded.preset_angles_3_nearest_enabled,
    preset_angles_4_preset_angle = excluded.preset_angles_4_preset_angle,
    preset_angles_4_nearest_enabled = excluded.preset_angles_4_nearest_enabled,
    preset_angles_5_preset_angle = excluded.preset_angles_5_preset_angle,
    preset_angles_5_nearest_enabled = excluded.preset_angles_5_nearest_enabled,
    preset_angles_6_preset_angle = excluded.preset_angles_6_preset_angle,
    preset_angles_6_nearest_enabled = excluded.preset_angles_6_nearest_enabled,
    preset_angles_7_preset_angle = excluded.preset_angles_7_preset_angle,
    preset_angles_7_nearest_enabled = excluded.preset_angles_7_nearest_enabled,
    preset_angles_8_preset_angle = excluded.preset_angles_8_preset_angle,
    preset_angles_8_nearest_enabled = excluded.preset_angles_8_nearest_enabled,
    preset_angles_9_preset_angle = excluded.preset_angles_9_preset_angle,
    preset_angles_9_nearest_enabled = excluded.preset_angles_9_nearest_enabled,
    preset_angles_10_preset_angle = excluded.preset_angles_10_preset_angle,
    preset_angles_10_nearest_enabled = excluded.preset_angles_10_nearest_enabled,
    preset_angles_11_preset_angle = excluded.preset_angles_11_preset_angle,
    preset_angles_11_nearest_enabled = excluded.preset_angles_11_nearest_enabled,
    preset_angles_12_preset_angle = excluded.preset_angles_12_preset_angle,
    preset_angles_12_nearest_enabled = excluded.preset_angles_12_nearest_enabled,
    preset_angles_13_preset_angle = excluded.preset_angles_13_preset_angle,
    preset_angles_13_nearest_enabled = excluded.preset_angles_13_nearest_enabled,
    preset_angles_14_preset_angle = excluded.preset_angles_14_preset_angle,
    preset_angles_14_nearest_enabled = excluded.preset_angles_14_nearest_enabled,
    preset_angles_15_preset_angle = excluded.preset_angles_15_preset_angle,
    preset_angles_15_nearest_enabled = excluded.preset_angles_15_nearest_enabled,
    swoc_required_duration = excluded.swoc_required_duration,
    swoc_threshold = excluded.swoc_threshold,
    encoded_hard_limit_register = excluded.encoded_hard_limit_register,
    encoded_soft_limit_register = excluded.encoded_soft_limit_register,
    snow_sensor_height = excluded.snow_sensor_height,
    wind_dir_offset = excluded.wind_dir_offset,
    tracking_min_angle = excluded.tracking_min_angle,
    tracking_max_angle = excluded.tracking_max_angle,
    dynamic_min_angle = excluded.dynamic_min_angle,
    dynamic_max_angle = excluded.dynamic_max_angle, 
    simulation_flags = excluded.simulation_flags, 
    heater_k = excluded.heater_k, 
    preheating_battery_threshold = excluded.preheating_battery_threshold,
    preheating_temperature_threshold = excluded.preheating_temperature_threshold,
    snow_shedding_deadband_angle = excluded.snow_shedding_deadband_angle,
    snow_shedding_duration = excluded.snow_shedding_duration,
    autoshed_temperature_threshold = excluded.autoshed_temperature_threshold,
    autoshed_minutes_threshold = excluded.autoshed_minutes_threshold,
    autoshed_battery_threshold = excluded.autoshed_battery_threshold,
    lbas_entry_threshold = excluded.lbas_entry_threshold,
    lbas_exit_threshold = excluded.lbas_exit_threshold,
    median_filter_length = excluded.median_filter_length,
    wx_data_record_frequency = excluded.wx_data_record_frequency,
    snow_sensor_type = excluded.snow_sensor_type,
    avg_wind_speed_correction_factor = excluded.avg_wind_speed_correction_factor,
    peak_wind_speed_correction_factor = excluded.peak_wind_speed_correction_factor`;

  return this.exeQuery(query, [snapAddr, config_label, config_timestamp, timestamp, model_device, location_lat, location_lng, location_text,
    hardware_rev, firmware_rev, site_name, panel_horizontal_cal_angle, panel_min_cal_angle, panel_max_cal_angle, config_flags,
    segments_0_panel_array_width, segments_0_spacing_to_east, segments_0_spacing_to_west, segments_0_delta_height_east,
    segments_0_delta_height_west, segments_1_panel_array_width, segments_1_spacing_to_east, segments_1_spacing_to_west, segments_1_delta_height_east, segments_1_delta_height_west,
    preset_angles_0_preset_angle, preset_angles_0_nearest_enabled, preset_angles_1_preset_angle, preset_angles_1_nearest_enabled,
    preset_angles_2_preset_angle, preset_angles_2_nearest_enabled, preset_angles_3_preset_angle, preset_angles_3_nearest_enabled,
    preset_angles_4_preset_angle, preset_angles_4_nearest_enabled, preset_angles_5_preset_angle, preset_angles_5_nearest_enabled,
    preset_angles_6_preset_angle, preset_angles_6_nearest_enabled, preset_angles_7_preset_angle, preset_angles_7_nearest_enabled,
    preset_angles_8_preset_angle, preset_angles_8_nearest_enabled, preset_angles_9_preset_angle, preset_angles_9_nearest_enabled,
    preset_angles_10_preset_angle, preset_angles_10_nearest_enabled, preset_angles_11_preset_angle, preset_angles_11_nearest_enabled,
    preset_angles_12_preset_angle, preset_angles_12_nearest_enabled, preset_angles_13_preset_angle, preset_angles_13_nearest_enabled,
    preset_angles_14_preset_angle, preset_angles_14_nearest_enabled, preset_angles_15_preset_angle, preset_angles_15_nearest_enabled,
    swoc_required_duration, swoc_threshold, encoded_hard_limit_register, encoded_soft_limit_register, snow_sensor_height, wind_dir_offset,
    tracking_min_angle, tracking_max_angle, dynamic_min_angle, dynamic_max_angle, simulation_flags, heater_k, preheating_battery_threshold,
    preheating_temperature_threshold, snow_shedding_deadband_angle, snow_shedding_duration,
    autoshed_temperature_threshold, autoshed_minutes_threshold, autoshed_battery_threshold, lbas_entry_threshold, lbas_exit_threshold, median_filter_length, wx_data_record_frequency, snow_sensor_type,
    avg_wind_speed_correction_factor, peak_wind_speed_correction_factor]);
}

module.exports.addRowControllerConf = (
  row_controller_id, config_label, config_timestamp, timestamp, model_device, location_lat, location_lng, location_text,
  hardware_rev, firmware_rev, site_name, panel_horizontal_cal_angle, panel_min_cal_angle, panel_max_cal_angle, config_flags,
  segments_0_panel_array_width, segments_0_spacing_to_east, segments_0_spacing_to_west, segments_0_delta_height_east,
  segments_0_delta_height_west, segments_1_panel_array_width, segments_1_spacing_to_east, segments_1_spacing_to_west,
  segments_1_delta_height_east, segments_1_delta_height_west, preset_angles_0_preset_angle, preset_angles_0_nearest_enabled,
  preset_angles_1_preset_angle, preset_angles_1_nearest_enabled, preset_angles_2_preset_angle, preset_angles_2_nearest_enabled,
  preset_angles_3_preset_angle, preset_angles_3_nearest_enabled, preset_angles_4_preset_angle, preset_angles_4_nearest_enabled,
  preset_angles_5_preset_angle, preset_angles_5_nearest_enabled, preset_angles_6_preset_angle, preset_angles_6_nearest_enabled,
  preset_angles_7_preset_angle, preset_angles_7_nearest_enabled, preset_angles_8_preset_angle, preset_angles_8_nearest_enabled,
  preset_angles_9_preset_angle, preset_angles_9_nearest_enabled, preset_angles_10_preset_angle, preset_angles_10_nearest_enabled,
  preset_angles_11_preset_angle, preset_angles_11_nearest_enabled, preset_angles_12_preset_angle, preset_angles_12_nearest_enabled,
  preset_angles_13_preset_angle, preset_angles_13_nearest_enabled, preset_angles_14_preset_angle, preset_angles_14_nearest_enabled,
  preset_angles_15_preset_angle, preset_angles_15_nearest_enabled, swoc_required_duration, swoc_threshold, encoded_hard_limit_register,
  encoded_soft_limit_register, snow_sensor_height, wind_dir_offset, tracking_min_angle, tracking_max_angle,
  dynamic_min_angle, dynamic_max_angle, simulation_flags, heater_k, preheating_battery_threshold,
  preheating_temperature_threshold, snow_shedding_deadband_angle, snow_shedding_duration,
  autoshed_temperature_threshold, autoshed_minutes_threshold, autoshed_battery_threshold, lbas_entry_threshold,
  lbas_exit_threshold, median_filter_length, wx_data_record_frequency, avg_wind_speed_correction_factor, peak_wind_speed_correction_factor
) => {
  const query = `INSERT INTO terrasmart.row_controller_conf 
  (row_controller_id, config_label, config_timestamp, timestamp, model_device, location_lat, location_lng, location_text,
    hardware_rev, firmware_rev, site_name, panel_horizontal_cal_angle, panel_min_cal_angle, panel_max_cal_angle, config_flags,
    segments_0_panel_array_width, segments_0_spacing_to_east, segments_0_spacing_to_west, segments_0_delta_height_east,
    segments_0_delta_height_west, segments_1_panel_array_width, segments_1_spacing_to_east, segments_1_spacing_to_west, segments_1_delta_height_east, segments_1_delta_height_west,
    preset_angles_0_preset_angle, preset_angles_0_nearest_enabled, preset_angles_1_preset_angle, preset_angles_1_nearest_enabled,
    preset_angles_2_preset_angle, preset_angles_2_nearest_enabled, preset_angles_3_preset_angle, preset_angles_3_nearest_enabled,
    preset_angles_4_preset_angle, preset_angles_4_nearest_enabled, preset_angles_5_preset_angle, preset_angles_5_nearest_enabled,
    preset_angles_6_preset_angle, preset_angles_6_nearest_enabled, preset_angles_7_preset_angle, preset_angles_7_nearest_enabled,
    preset_angles_8_preset_angle, preset_angles_8_nearest_enabled, preset_angles_9_preset_angle, preset_angles_9_nearest_enabled,
    preset_angles_10_preset_angle, preset_angles_10_nearest_enabled, preset_angles_11_preset_angle, preset_angles_11_nearest_enabled,
    preset_angles_12_preset_angle, preset_angles_12_nearest_enabled, preset_angles_13_preset_angle, preset_angles_13_nearest_enabled,
    preset_angles_14_preset_angle, preset_angles_14_nearest_enabled, preset_angles_15_preset_angle, preset_angles_15_nearest_enabled,
    swoc_required_duration, swoc_threshold, encoded_hard_limit_register, encoded_soft_limit_register, snow_sensor_height, wind_dir_offset,
    tracking_min_angle, tracking_max_angle, dynamic_min_angle, dynamic_max_angle, simulation_flags, heater_k, preheating_battery_threshold,
    preheating_temperature_threshold, snow_shedding_deadband_angle, snow_shedding_duration,
    autoshed_temperature_threshold, autoshed_minutes_threshold, autoshed_battery_threshold, lbas_entry_threshold, lbas_exit_threshold,
    wx_data_record_frequency, avg_wind_speed_correction_factor, peak_wind_speed_correction_factor)
  VALUES ($1::uuid,$2::text,$3::text,$4::timestamp,$5::INT,$6::FLOAT,$7::FLOAT,$8::text,
     $9::INT,$10::INT,$11::VARCHAR,$12::INT,$13::INT,$14::INT,$15::INT,
     $16::INT,$17::INT,$18::INT,$19::INT, 
     $20::INT,$21::INT,$22::INT,$23::INT,$24::INT,$25::INT,
     $26::INT,$27::BOOLEAN,$28::INT,$29::BOOLEAN,
     $30::INT,$31::BOOLEAN,$32::INT,$33::BOOLEAN,
     $34::INT,$35::BOOLEAN,$36::INT,$37::BOOLEAN,
     $38::INT,$39::BOOLEAN,$40::INT,$41::BOOLEAN,
     $42::INT,$43::BOOLEAN,$44::INT,$45::BOOLEAN,
     $46::INT,$47::BOOLEAN,$48::INT,$49::BOOLEAN,
     $50::INT,$51::BOOLEAN,$52::INT,$53::BOOLEAN,
     $54::INT,$55::BOOLEAN,$56::INT,$57::BOOLEAN,
     $58::FLOAT,$59::FLOAT,$60::INT,$61::INT, $62::FLOAT,
     $63::FLOAT, $64::INT, $65::INT, $66::INT, $67::INT,
     $68::INT, $69::FLOAT, $70::INT, $71::FLOAT,
     $72::FLOAT, $73::INT, $74::FLOAT, $75::INT,
     $76::INT, $77::INT, $78::INT, $79::INT,
     $80::FLOAT, $81::FLOAT)
`;

  return this.exeQuery(query, [
    row_controller_id, config_label, config_timestamp, timestamp, model_device, location_lat, location_lng, location_text,
    hardware_rev, firmware_rev, site_name, panel_horizontal_cal_angle, panel_min_cal_angle, panel_max_cal_angle, config_flags,
    segments_0_panel_array_width, segments_0_spacing_to_east, segments_0_spacing_to_west, segments_0_delta_height_east,
    segments_0_delta_height_west, segments_1_panel_array_width, segments_1_spacing_to_east, segments_1_spacing_to_west, segments_1_delta_height_east, segments_1_delta_height_west,
    preset_angles_0_preset_angle, preset_angles_0_nearest_enabled, preset_angles_1_preset_angle, preset_angles_1_nearest_enabled,
    preset_angles_2_preset_angle, preset_angles_2_nearest_enabled, preset_angles_3_preset_angle, preset_angles_3_nearest_enabled,
    preset_angles_4_preset_angle, preset_angles_4_nearest_enabled, preset_angles_5_preset_angle, preset_angles_5_nearest_enabled,
    preset_angles_6_preset_angle, preset_angles_6_nearest_enabled, preset_angles_7_preset_angle, preset_angles_7_nearest_enabled,
    preset_angles_8_preset_angle, preset_angles_8_nearest_enabled, preset_angles_9_preset_angle, preset_angles_9_nearest_enabled,
    preset_angles_10_preset_angle, preset_angles_10_nearest_enabled, preset_angles_11_preset_angle, preset_angles_11_nearest_enabled,
    preset_angles_12_preset_angle, preset_angles_12_nearest_enabled, preset_angles_13_preset_angle, preset_angles_13_nearest_enabled,
    preset_angles_14_preset_angle, preset_angles_14_nearest_enabled, preset_angles_15_preset_angle, preset_angles_15_nearest_enabled,
    swoc_required_duration, swoc_threshold, encoded_hard_limit_register, encoded_soft_limit_register, snow_sensor_height, wind_dir_offset,
    tracking_min_angle, tracking_max_angle, dynamic_min_angle, dynamic_max_angle, simulation_flags, heater_k, preheating_battery_threshold,
    preheating_temperature_threshold, snow_shedding_deadband_angle, snow_shedding_duration,
    autoshed_temperature_threshold, autoshed_minutes_threshold, autoshed_battery_threshold, lbas_entry_threshold, lbas_exit_threshold,
    wx_data_record_frequency, avg_wind_speed_correction_factor, peak_wind_speed_correction_factor
  ]);
};


exports.getCloudAlertByEventNameAndTitleLike = async (assetId, eventName, title) => {
  const query = `
    SELECT * FROM terrasmart.cloud_alert
    WHERE event_name = $2 AND asset_id = $1 AND title ILIKE '%' || $3 || '%';
  `;
  return this.exeQuery(query, [assetId, eventName, title]);
};

exports.insertFirmwareRev = (
  displayVer,
  released,
  reportedVer
) => {
  const query = `WITH
  firmware_rev_insert AS (
      INSERT INTO terrasmart.firmware_rev (display_ver, released, reported_ver) 
      VALUES ($1 :: VARCHAR, $2:: TIMESTAMP, $3 :: INT)
      RETURNING id AS id
    )
  SELECT id FROM firmware_rev_insert`;
  return this.exeQuery(query, [
    displayVer,
    released,
    reportedVer]);
}

exports.getFirmwareRev = (reportedVer) => {
  const query = `SELECT firmware_rev.id 
 FROM terrasmart.firmware_rev
 WHERE terrasmart.firmware_rev.reported_ver = $1::INT`;
  return this.exeQuery(query, [reportedVer]);
}

exports.getAssetHardwareRev = (hardwareRevId, snapAddr) => {
  const query = `SELECT * FROM terrasmart.asset
  INNER JOIN terrasmart.radio on radio.asset_id = asset."id" 
WHERE asset.hardware_rev_id = $1 :: uuid
AND radio.snap_addr = $2 :: bytea`;
  return this.exeQuery(query, [hardwareRevId, snapAddr]);
}

exports.InsertHardwareRev = (displayRev, released, reportedRev) => {
  const query = `WITH
  hardware_rev_insert AS (
      INSERT INTO terrasmart.hardware_rev (display_rev, released, reported_rev) 
      VALUES ($1 :: VARCHAR, $2:: TIMESTAMP, $3 :: INT)
      RETURNING id AS id
    )
  SELECT id FROM hardware_rev_insert
  `;
  return this.exeQuery(query, [displayRev, released, reportedRev]);
}

exports.getHardwareRev = (hardwareRev) => {
  const query = `SELECT hardware_rev.id 
  FROM terrasmart.hardware_rev
  WHERE terrasmart.hardware_rev.reported_rev = $1::INT`;
  return this.exeQuery(query, [hardwareRev]);
}

exports.addUpdateAssetHistory = (snapAddr, timestamp, payload) => {
  const query = `INSERT INTO terrasmart.asset_history (snap_addr, timestamp, data) 
    VALUES ($1::VARCHAR, $2::TIMESTAMP, $3::JSONB)
    ON CONFLICT (snap_addr, timestamp) DO UPDATE 
      SET data = terrasmart.asset_history.data::jsonb || EXCLUDED.data::jsonb;`;
  console.log(query, [snapAddr, timestamp, payload]);
  return this.exeQuery(query, [snapAddr, timestamp, payload]);
}

exports.updateAssetGeneric = (data, assetId) => {
  const { query, values } = getKeysAndValues(data, "update");
  const q = `UPDATE terrasmart.asset SET ${query} WHERE id= $${values.length + 1}`;
  return this.exeQuery(q, [...values, assetId]);
};

exports.updateBatteryGeneric = (data, snapAddr) => {
  const { query, values } = getKeysAndValues(data, "update");
  const q = `
    UPDATE terrasmart.battery 
    SET
      ${query} 
    WHERE id = $${values.length + 1} RETURNING *`;
  return this.exeQuery(q, [...values, snapAddr]);
};

exports.getAssetLayoutBySnapAddr = (snapAddr) => {
  const query = `select 
    sl.i as row_no,
    sl.shorthand_name,
    sl.name as row_name
  from terrasmart.asset A
  LEFT JOIN terrasmart.network_controller nc ON nc.id = a.parent_network_controller_id
  OR nc.asset_id = a.id
  LEFT JOIN terrasmart.asset nc_asset ON nc_asset.id = nc.asset_id
  LEFT JOIN terrasmart.site s ON s.id = nc_asset.site_id
  LEFT JOIN terrasmart.project p ON p.id = s.project_id
  LEFT JOIN terrasmart.site_layout sl ON sl.site_id = nc_asset.site_id and sl.asset_id = A.id
  LEFT JOIN terrasmart.site_conf sc ON sc.site_id = nc_asset.site_id
  WHERE a.snap_addr = $1::char(6)`;
  return this.exeQuery(query, [snapAddr]);
}


exports.updateMotorGeneric = (data, snapAddr) => {
  const { query, values } = getKeysAndValues(data, "update");
  const q = `
    UPDATE terrasmart.motor 
    SET
      ${query} 
    WHERE snap_addr = $${values.length + 1} RETURNING *`;
  return this.exeQuery(q, [...values, snapAddr]);
};

exports.updateChargerGeneric = (data, chargerId) => {
  const { query, values } = getKeysAndValues(data, "update");
  const q = `
    UPDATE terrasmart.charger 
    SET
      ${query} 
    WHERE id = $${values.length + 1} RETURNING *`;
  return this.exeQuery(q, [...values, chargerId]);
};

exports.updateRadioInfo = (params) => {
  const query = `UPDATE terrasmart.radio 
    SET 
      link_quality = $1 :: INTEGER, 
      mesh_depth = $2::INTEGER, 
      script_version = $3::VARCHAR,
      script_crc = $4::VARCHAR, 
      firmware_version = $5::VARCHAR, 
      polls_sent = $6::INT, 
      polls_recv = $7 ::INT,
      mac_addr = $8 ::VARCHAR, 
      is_a_repeater = $9 :: BOOLEAN, 
      last_updated = $11::TIMESTAMP 
    WHERE id = $10::UUID and last_updated <= $11::TIMESTAMP
    RETURNING *`;
  return this.exeQuery(query, params);
};


exports.updateRadioGeneric = (data, radioId) => {
  const { query, values } = getKeysAndValues(data, "update");
  const q = `UPDATE terrasmart.radio SET ${query} WHERE id= $${values.length + 1} RETURNING *`;
  return this.exeQuery(q, [...values, radioId]);
};

module.exports.addCloudEventLog = ({ assetId, name, timestamp, title, icon, userName, userEmail, params, message, type, levelNo }) => {
  const vals = [
    assetId,
    name || '',
    timestamp,
    title || '',
    message || '',
    icon || null,
    userName || null,
    userEmail || null,
    params || null,
    type || 2,
    levelNo || 20
  ];
  const query = `
    INSERT INTO terrasmart.cloud_event_log
      (asset_id, name, created, title, message, icon, user_name, user_email, params, type, levelno)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`;
  return this.exeQuery(query, vals);
};

module.exports.getAssetAndSiteLayoutByAssetId = (
  assetId
) => {
  const query = `SELECT a.name AS asset_name, a.snap_addr, a.id as "assetId", s.link_row_type as "linkRowType",
  s.link_row_ref as "linkRowRef", s.i as row_id, s.name as row_name, s.shorthand_name, s.device_type
  FROM terrasmart.asset a
  INNER JOIN terrasmart.site_layout s ON a.id = s.asset_id
  WHERE a.id = $1`;
  return this.exeQuery(query, [assetId]);
}
exports.getSitesByProjectId = async (project_id) => {
  const query = `
    SELECT 
        s.id AS site_id,
        sc.name AS site_name
     FROM terrasmart.site s
        INNER JOIN terrasmart.site_conf sc ON sc.site_id = s.id
     WHERE s.project_id = $1
  `;
  return this.exeQuery(query, [project_id]);
};
