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

exports.closeClientConnections = async () => {
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

const getSnapAddressFromAssetID = async (asset_id) => {
  const query = `SELECT snap_addr FROM terrasmart.asset WHERE id = $1`;
  const values = [asset_id];

  try {
    const res = await this.exeQuery(query, values);
    return res.rows?.length ? res.rows[0].snap_addr : null;
  } catch (err) {
    console.error(
      'postgresql.getSnapAddressFromAssetID',
      JSON.stringify({ query, values, error: serializeError(err) })
    );
    return null;
  }
};
const getAnomalyData = async (
  asset_id,
  start_date,
  end_date,
  type,
  field,
  value,
  zone_offset = 0,
  interval = 'day'
) => {
  // Convert start_date and end_date to timestamps in seconds
  const gte = moment(start_date).subtract(zone_offset, 'minutes').unix();
  const lte = moment(end_date).subtract(zone_offset, 'minutes').unix();

  const query = `
    SELECT date_trunc($1, timestamp) as timestamp, COUNT((data->>$7)::text) as ${field}
    FROM terrasmart.anomaly
    WHERE asset_id = $2 
        AND type = $3 
        AND (data->>$7)::text = $4 
        AND timestamp BETWEEN to_timestamp($5) AND to_timestamp($6)
    GROUP BY date_trunc($1, timestamp)
    ORDER BY timestamp;
  `;
  const values = [interval, asset_id, type, value, gte, lte, field];

  try {
    const res = await this.exeQuery(query, values);
    return res.rows;
  } catch (err) {
    console.error(
      'postgresql.getAnomalyData',
      JSON.stringify({ query, values, error: serializeError(err) })
    );
    return null;
  }
};

const getHistoryData = async ({
  asset_id,
  start_date,
  end_date,
  es_data, // 'poc', 'current_angle'
  q_type = 'agg',
  interval = '1m',
  // zone_offset = 0,
  size,
  order = 'desc',
}) => {
  let query;

  let field_data =
    es_data === 'poc'
      ? 'battery.poc'
      : es_data === 'current_angle'
      ? 'rack.current_angle'
      : es_data;
  const snap_addr = await getSnapAddressFromAssetID(asset_id);

  let values = [interval, snap_addr, start_date, end_date];

  if (q_type === 'agg') {
    query = `
      SELECT 
        date_bin($1, timestamp, '2021-01-01') as timestamp, 
        AVG((data->>'${field_data}')::numeric) as ${es_data}
      FROM terrasmart.asset_history
      WHERE snap_addr = $2 AND timestamp > $3 AND timestamp < $4 AND (data->>'${field_data}') IS NOT NULL
      GROUP BY timestamp
      ORDER BY timestamp ${order}
      ${size ? `LIMIT ${size}` : ''}
    `;
  } else {
    let condition = '';
    if (q_type === 'exist') {
      condition = `AND (data->>'${field_data}') IS NOT NULL`;
    } else if (q_type === 'type_match') {
      condition = `AND (data->>'type') = $5`;
      values.push(field_data);
    } else {
      return null;
    }
    query = `
          SELECT 
            date_bin($1, timestamp, '2021-01-01') as timestamp, 
            *
          FROM terrasmart.asset_history
          WHERE snap_addr = $2 AND timestamp > $3 AND timestamp < $4 AND (data->>'${field_data}') IS NOT NULL
          ${condition}
          ORDER BY timestamp ${order}
          ${size ? `LIMIT ${size}` : ''}
        `;
  }

  try {
    const res = await this.exeQuery(query, values);
    return q_type === 'agg' ? res.rows : res.rows[0];
  } catch (err) {
    console.error(
      'postgresql.getHistoryData',
      JSON.stringify({ query, values, error: serializeError(err) })
    );
    return null;
  }
};

const checkIfExists = async (doc_id) => {
  const query = `
    SELECT 1 FROM terrasmart.prediction WHERE id = $1
  `;
  const values = [doc_id];

  try {
    const res = await this.exeQuery(query, values);
    return res.rowCount > 0;
  } catch (err) {
    console.error(`postgresql.checkIfExists`, {
      query,
      values,
      error: serializeError(err),
    });
    throw err;
  }
};

const insertPredictionData = async (source_data, doc_id) => {
  //  Inserts a new row into the prediction table with the given data.
  //  If the row already exists, the data will be updated.
  const {
    asset_id,
    timestamp,
    type,
    enable,
    expiry,
    ml_data,
    nc_asset_id,
    predictions = [],
  } = source_data;

  const query = `
        INSERT INTO terrasmart.prediction (id, asset_id, timestamp, type, enable, expiry, ml_data, nc_asset_id, predictions, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

  const values = [
    doc_id,
    asset_id,
    timestamp,
    type,
    enable,
    expiry,
    ml_data,
    nc_asset_id,
    predictions,
    source_data,
  ];

  try {
    if (await checkIfExists(doc_id)) {
      await updatePredictionData(source_data, doc_id);
    } else {
      await this.exeQuery(query, values);
    }

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
    console.error(`postgresql.updatePredictionData`, {
      query,
      values,
      error: serializeError(err),
    });
    return -1;
  }
};

const getExpiredPredictions = async (date, type) => {
  // const lte = BigInt(moment(date).valueOf()); // Convert to BigInt

  const query = `
    SELECT * FROM terrasmart.prediction
    WHERE 
      expiry <= $1::timestamp AND 
      enable = true AND 
      type = $2
    ORDER BY expiry DESC
    LIMIT 40
      `;
  const values = [date, type];

  try {
    const res = await this.exeQuery(query, values);
    const hits = res.rows?.map((x) => ({
      id: x.id,
      data: { ...x.data, ...x },
    }));

    let cur_time = moment(date).utc();
    const filtered = hits.filter((x, index) => {
      const training_start_time = x.data.training_start_time || '0';
      return (
        (training_start_time === '0' ||
          cur_time.diff(training_start_time, 'days') > 0) &&
        index ===
          hits.findIndex((t) => {
            return t.data.asset_id === hits[index].data.asset_id;
          })
      );
    });

    if (hits.length !== filtered.length) {
      console.log(`Expired: ${hits.length} Filtered: ${filtered.length}`);
      for (const ex of hits) {
        if (!filtered.includes(ex)) {
          const data = { enable: false };
          console.log(`Disable extra prediction expiry: ${ex.data.expiry}`);
          await updatePredictionData(data, ex.id);
        }
      }
    }

    return filtered;
  } catch (err) {
    console.error(
      'postgresql.getExpiredPredictions',
      JSON.stringify({ query, values, error: serializeError(err) })
    );
    return null;
  }
};

const getSiteConfig = async (asset_id) => {
  try {
    let ncResults = await this.exeQuery(
      `SELECT COALESCE(nc_proj.location_lat, proj.location_lat) AS nc_lat, 
        COALESCE(nc_proj.location_lng, proj.location_lng) AS nc_lng,
        COALESCE(nc.asset_id, a.id) AS nc_asset_id
        FROM terrasmart.asset a
        LEFT JOIN terrasmart.network_controller nc ON nc.id = a.parent_network_controller_id
        LEFT JOIN terrasmart.site s ON a.site_id = s.id
        LEFT JOIN terrasmart.project proj ON s.project_id = proj.id
        LEFT JOIN terrasmart.asset AS nc_a ON nc.asset_id = nc_a.id
        LEFT JOIN terrasmart.site nc_s ON nc_a.site_id = nc_s.id
        LEFT JOIN terrasmart.project nc_proj ON nc_s.project_id = nc_proj.id
        WHERE a.id = $1::uuid
    `,
      [asset_id]
    );

    return ncResults.rows;
  } catch (err) {
    console.log(`DB: err ${err}`);
  }

  return null;
};

const getPredictionById = async (id) => {
  const query = `
    SELECT * FROM terrasmart.prediction WHERE id = $1
  `;
  const values = [id];

  try {
    const res = await this.exeQuery(query, values);
    return res.rows[0];
  } catch (err) {
    console.error(`postgresql.getPredictionById`, {
      query,
      values,
      error: serializeError(err),
    });
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
    console.error('Error closing the pool', serializeError(err));
  }
};

module.exports = {
  getAnomalyData,
  getHistoryData,
  insertPredictionData,
  updatePredictionData,
  getExpiredPredictions,
  getSiteConfig,
  getPredictionById,
  closeDBPool,
};
