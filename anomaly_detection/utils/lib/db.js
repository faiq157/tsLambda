'use strict';
const moment = require('moment');
const environmentSupport = require('./environmentSupport');
const envVar = require('./envVarProvider');
const { Pool, types } = require('pg');
const config = require('config');
const myUtils = require('./utils');
const { retryableException } = require('./customExceptions');
const { serializeError } = require('serialize-error');

// Make sure when converting Postgres timestamp it is UTC
const TIMESTAMP_OID = 1114;
const parseFn = (val) =>
  val === null ? null : new Date(Date.parse(`${val}+0000`));

types.setTypeParser(TIMESTAMP_OID, parseFn);

const writerPoolConfig = {
  application_name: envVar.getAppName(),
  user: config.db.user,
  host: config.db.writer.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  max: environmentSupport.isLambdaFunction()
    ? config.db.writer.maxConnectionsLambda
    : config.db.writer.maxConnections,
  idleTimeoutMillis: config.db.idleTimeout, // milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  connectionTimeoutMillis: config.db.connectionTimeout, // milliseconds to wait before timing out when connecting a new client
  statement_timeout: config.db.statementTimeout, // number of milliseconds before a statement in query will time out, default is no timeout
  idle_in_transaction_session_timeout:
    config.db.idleInTransactionSessionTimeout, // number of milliseconds before terminating any session with an open idle transaction
  query_timeout: config.db.queryTimeout, // number of milliseconds before a query call will timeout, default is no timeout
};
const writerPool = new Pool(writerPoolConfig);

let writerClientId = 0;
writerPool.on('error', (err, client) => {
  console.error(`[pg] [${client._id}] Unexpected error on idle client`, err);
});

writerPool.on('connect', (client) => {
  client._timestamp = myUtils.getUTCNow();
  client._queryCounter = 0;
  client._id = ++writerClientId;
});

let readerPool = null;
let readerClientId = 0;
if (config.db.reader.host) {
  readerPool = new Pool({
    user: config.db.user,
    host: config.db.reader.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
    max: environmentSupport.isLambdaFunction()
      ? config.db.reader.maxConnectionsLambda
      : config.db.reader.maxConnections,
    idleTimeoutMillis: config.db.idleTimeout, // milliseconds a client must sit idle in the pool and not be checked out
    // before it is disconnected from the backend and discarded
    connectionTimeoutMillis: config.db.connectionTimeout, // milliseconds to wait before timing out when connecting a new client
    statement_timeout: config.db.statementTimeout, // number of milliseconds before a statement in query will time out, default is no timeout
    idle_in_transaction_session_timeout:
      config.db.idleInTransactionSessionTimeout, // number of milliseconds before terminating any session with an open idle transaction
    query_timeout: config.db.queryTimeout, // number of milliseconds before a query call will timeout, default is no timeout
  });

  readerPool.on('error', (err, client) => {
    console.error(
      `[pg read] [${client._id}] Unexpected error on idle client`,
      err
    );
  });

  readerPool.on('connect', (client) => {
    client._timestamp = myUtils.getUTCNow();
    client._queryCounter = 0;
    client._id = ++readerClientId;
  });
}

function getPool(query) {
  if (!readerPool) {
    return writerPool;
  }

  const regex = new RegExp('^[\\s]*select', 'i');
  const isRead = regex.test(query);
  return isRead ? readerPool : writerPool;
}

async function handleQuery(query, params = null, enforcedPool = null) {
  const pool = enforcedPool || getPool(query);
  // console.log('[pg] Query:', query, params);
  const client = await pool.connect().catch((err) => {
    console.error(
      `[pg] Unable to acquire connection total:idle:waiting ${pool.totalCount}:${pool.idleCount}:${pool.waitingCount}. Query: ${query}, Error: ${err.message}`
    );
    throw err;
  });
  try {
    let res = await client.query(query, params);
    client._queryCounter++;
    return res; //{query, rows, params};
  } catch (err) {
    console.error('[pg] Query Failed: %s, Error: %s', query, err.message);
    throw err;
  } finally {
    client.release();
  }
}

exports.exeQueryWriter = async (query, params) => {
  return this.exeQuery(query, params, 0, 3, 500, writerPool);
};

exports.exeQuery = async (
  query,
  params,
  retryCount = 0,
  maxRetry = 3,
  backoff = 500,
  pool
) => {
  while (retryCount < maxRetry) {
    try {
      return handleQuery(query, params, pool);
    } catch (err) {
      retryCount++;
      if (
        retryCount < maxRetry &&
        (err.message === 'timeout exceeded when trying to connect' ||
          err.message === 'Query read timeout' ||
          err.message === 'sorry, too many clients already' ||
          err.message === 'Connection terminated due to connection timeout')
      ) {
        const s_time = Math.round(Math.pow(2, retryCount)) * backoff;
        console.log(
          `[pg] query failed. Retry after ${s_time} msec. Query: ${query} retryCount: ${retryCount} maxRetry:${maxRetry} backoff: ${backoff} Error: ${err.message}`
        );
        await myUtils.sleep(s_time);
      } else {
        console.error(
          `Query Failed After Retrying. Query: ${query} retryCount: ${retryCount} maxRetry:${maxRetry} backoff: ${backoff} Error: ${err.message}`
        );
        if (
          err.message === 'timeout exceeded when trying to connect' ||
          err.message === 'Query read timeout' ||
          err.message === 'sorry, too many clients already' ||
          err.message === 'Connection terminated due to connection timeout'
        ) {
          throw new retryableException(err.message);
        } else {
          throw err;
        }
      }
    }
  }
};

const closeClientConnections = async () => {
  console.log(
    'COUNTS: ',
    writerPool.idleCount,
    writerPool.totalCount,
    writerPool.waitingCount
  );
  if (writerPool)
    await writerPool.end().then(() => console.log('WRITER POOL ENDED'));
  if (readerPool)
    await readerPool.end().then(() => console.log('READER POOL ENDED'));
};

const getHistoryData = async ({
  snap_addr,
  start_date,
  end_date,
  es_data, // 'poc', 'current_angle'
  q_type = 'agg',
  interval = 'minute',
  zone_offset = 0,
  size = 1,
  order = 'desc',
}) => {
  const gte = moment(start_date).subtract(zone_offset, 'minutes').unix();
  const lte = moment(end_date).subtract(zone_offset, 'minutes').unix();
  let query;

  let values = [interval, snap_addr, gte, lte];

  if (q_type === 'agg') {
    query = `
          SELECT 
            date_trunc($1, timestamp) as timestamp, 
            AVG((data->>'${es_data}')::numeric) as ${es_data}
          FROM terrasmart.asset_history
          WHERE 
            snap_addr = $2 AND 
            timestamp BETWEEN to_timestamp($3) AND to_timestamp($4)
          GROUP BY timestamp
          ORDER BY timestamp ${order}
          LIMIT ${size}
        `;
  } else {
    let condition = '';
    if (q_type === 'exist') {
      condition = `AND (data->>'${es_data}') IS NOT NULL`;
    } else if (q_type === 'type_match') {
      condition = `AND (data->>'type') = $4`;
      values.push(es_data);
    } else {
      return null;
    }
    query = `
          SELECT *
          FROM terrasmart.asset_history
          WHERE 
            snap_addr = $1 AND 
            timestamp BETWEEN to_timestamp($2) AND to_timestamp($3) 
            ${condition}
          ORDER BY timestamp ${order}
          LIMIT ${size}
        `;
    values.shift(); // remove the first element i.e. time interval
  }

  try {
    const res = await this.exeQuery(query, values);
    return q_type === 'agg' ? res.rows : res.rows[0];
  } catch (err) {
    console.error('postgresql.getHistoryData', serializeError(err));
    return null;
  }
};

const insertAnomalyData = async (source_data) => {
  const { asset_id, timestamp, type, test, state, notified } = source_data;
  const query = `
    INSERT INTO terrasmart.anomaly (asset_id, timestamp, type, test, state, notified, data)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
  const values = [
    asset_id,
    timestamp,
    type,
    test,
    state,
    notified,
    source_data,
  ];

  try {
    await this.exeQuery(query, values);
    return 0;
  } catch (err) {
    console.error(`[${source_data.asset_id}] ERR: `, serializeError(err));
    return -1;
  }
};

const updatePredictionData = async (source, doc_id) => {
  let source_data = source;

  if (source?.data) {
    source_data = source.data;
  }

  const {
    asset_id,
    timestamp,
    type,
    enable,
    expiry,
    ml_data,
    nc_asset_id,
    predictions,
  } = source_data;

  const fields = [];
  const values = [doc_id];
  let valueIndex = 2; // Starting index for the value placeholders in the query

  if (asset_id) {
    fields.push(`asset_id = $${valueIndex}`);
    values.push(asset_id);
    valueIndex++;
  }
  if (timestamp) {
    fields.push(`timestamp = $${valueIndex}`);
    values.push(timestamp);
    valueIndex++;
  }
  if (type) {
    fields.push(`type = $${valueIndex}`);
    values.push(type);
    valueIndex++;
  }
  if (enable !== undefined) {
    fields.push(`enable = $${valueIndex}`);
    values.push(enable);
    valueIndex++;
  }
  if (expiry) {
    fields.push(`expiry = $${valueIndex}`);
    values.push(expiry);
    valueIndex++;
  }
  if (ml_data) {
    fields.push(`ml_data = $${valueIndex}`);
    values.push(ml_data);
    valueIndex++;
  }
  if (predictions) {
    fields.push(`predictions = $${valueIndex}`);
    values.push(predictions);
    valueIndex++;
  }
  if (nc_asset_id) {
    fields.push(`nc_asset_id = $${valueIndex}`);
    values.push(nc_asset_id);
    valueIndex++;
  }
  if (Object.keys(source_data).length > 0) {
    fields.push(`data = data || $${valueIndex}`);
    values.push(JSON.stringify(source_data));
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const query = `
    UPDATE terrasmart.prediction
    SET ${fields.join(', ')}
    WHERE id = $1
  `;

  try {
    await this.exeQuery(query, values);
    return 0;
  } catch (err) {
    console.error(`postgresql.updatePredictionData`, serializeError(err));
    return -1;
  }
};

const getAnomalies = async (asset_id, type, timestamp) => {
  try {
    const query = `
      SELECT * FROM terrasmart.anomaly
      WHERE asset_id = $1 AND type = $2 AND timestamp = $3
    `;
    const values = [asset_id, type, timestamp];
    const res = await this.exeQuery(query, values);
    return res.rows;
  } catch (err) {
    console.error(`postgresql.getAnomalies`, serializeError(err));
    return null;
  }
};

const getMultiData = async ({
  asset_id,
  snap_addr,
  start_date,
  end_date,
  type,
  c_entry,
}) => {
  try {
    const c_entry_ts = new Date(c_entry.ts);
    let result = {
      prediction: null,
      lastAnomaly: {},
      last_mode: {},
    };

    if (type === 'poc') {
      const queryMaxAnomaly = `
              SELECT * FROM terrasmart.anomaly
              WHERE asset_id = $1 AND type = $2 AND test = 'Max' AND state <= 1 AND notified IS NOT NULL AND timestamp < $3
              ORDER BY timestamp DESC LIMIT 1;
          `;
      const queryMinAnomaly = `
              SELECT * FROM terrasmart.anomaly
              WHERE asset_id = $1 AND type = $2 AND test = 'Min' AND state <= 1 AND notified IS NOT NULL AND timestamp < $3
              ORDER BY timestamp DESC LIMIT 1;
          `;
      const queryPrediction = `
              SELECT * FROM terrasmart.prediction
              WHERE asset_id = $1 AND type = $2 AND timestamp BETWEEN $3 AND $4
              ORDER BY timestamp DESC LIMIT 1;
          `;

      const maxAnomaly = await this.exeQuery(queryMaxAnomaly, [
        asset_id,
        type,
        c_entry_ts,
      ]);
      const minAnomaly = await this.exeQuery(queryMinAnomaly, [
        asset_id,
        type,
        c_entry_ts,
      ]);
      const prediction = await this.exeQuery(queryPrediction, [
        asset_id,
        type,
        start_date,
        end_date,
      ]);

      if (prediction.rows.length > 0) {
        result.prediction = {
          ...prediction.rows[0].data,
          id: prediction.rows[0].id,
          enable: prediction.rows[0].enable,
          expiry: prediction.rows[0].expiry,
          timestamp: prediction.rows[0].timestamp,
          type: prediction.rows[0].type,
          asset_id: prediction.rows[0].asset_id,
        };
      }
      if (maxAnomaly.rows.length > 0) {
        result.lastAnomaly.max = {
          ...maxAnomaly.rows[0].data,
          id: maxAnomaly.rows[0].id,
          asset_id: maxAnomaly.rows[0].asset_id,
          timestamp: maxAnomaly.rows[0].timestamp,
          type: maxAnomaly.rows[0].type,
          test: maxAnomaly.rows[0].test,
          state: maxAnomaly.rows[0].state,
          notified: maxAnomaly.rows[0].notified,
        };
      }
      if (minAnomaly.rows.length > 0) {
        result.lastAnomaly.min = {
          ...minAnomaly.rows[0].data,
          id: minAnomaly.rows[0].id,
          asset_id: minAnomaly.rows[0].asset_id,
          timestamp: minAnomaly.rows[0].timestamp,
          type: minAnomaly.rows[0].type,
          test: minAnomaly.rows[0].test,
          state: minAnomaly.rows[0].state,
          notified: minAnomaly.rows[0].notified,
        };
      }
    } else {
      const queryAnomaly = `
              SELECT * FROM terrasmart.anomaly
              WHERE asset_id = $1 AND type = $2 AND notified IS NOT NULL AND timestamp < $3
              ORDER BY timestamp DESC LIMIT 1;
          `;
      const queryPrediction = `
              SELECT * FROM terrasmart.prediction
              WHERE asset_id = $1 AND type = $2 AND timestamp BETWEEN $3 AND $4
              ORDER BY timestamp DESC LIMIT 1;
          `;
      const queryModeChange = `
              SELECT * 
              FROM terrasmart.asset_history
              WHERE snap_addr = $1 
              AND timestamp < $2 
              AND (data->>'tracking.mode')::integer = $3
              ORDER BY timestamp DESC 
              LIMIT 1;
           `;

      const anomaly = await this.exeQuery(queryAnomaly, [
        asset_id,
        type,
        c_entry_ts,
      ]);
      const prediction = await this.exeQuery(queryPrediction, [
        asset_id,
        type,
        start_date,
        end_date,
      ]);
      const modeChange = await this.exeQuery(queryModeChange, [
        snap_addr,
        c_entry_ts,
        c_entry.tracking_status,
      ]);

      if (prediction.rows.length > 0) {
        result.prediction = {
          ...prediction.rows[0].data,
          id: prediction.rows[0].id,
          enable: prediction.rows[0].enable,
          expiry: prediction.rows[0].expiry,
          timestamp: prediction.rows[0].timestamp,
          type: prediction.rows[0].type,
          asset_id: prediction.rows[0].asset_id,
        };
      }
      if (anomaly.rows.length > 0) {
        result.lastAnomaly = {
          ...anomaly.rows[0].data,
          id: anomaly.rows[0].id,
          asset_id: anomaly.rows[0].asset_id,
          timestamp: anomaly.rows[0].timestamp,
          type: anomaly.rows[0].type,
          test: anomaly.rows[0].test,
          state: anomaly.rows[0].state,
          notified: anomaly.rows[0].notified,
        };
      }
      if (modeChange.rows.length > 0) {
        result.last_mode = {
          ...modeChange.rows[0].data,
          timestamp: modeChange.rows[0].timestamp,
        };
      }
    }

    return result;
  } catch (err) {
    console.log(`postgresql.getMultiData`, serializeError(err));
    return null;
  }
};

const closeDBPool = async () => {
  try {
    await writerPool.end();
    if (readerPool) {
      await readerPool.end();
    }
  } catch (err) {
    console.log('Error closing the pool', serializeError(err));
  }
};

module.exports = {
  getHistoryData,
  insertAnomalyData,
  updatePredictionData,
  getMultiData,
  getAnomalies,
  closeDBPool,
  closeClientConnections,
};
