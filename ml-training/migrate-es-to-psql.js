// Versions used for this script at that time
// "@elastic/elasticsearch": "7.6.0",
// "aws-elasticsearch-connector": "^9.0.3",

const { Pool } = require("pg");
const { Client } = require("@elastic/elasticsearch");
const AWS = require("aws-sdk");
const createAwsElasticsearchConnector = require("aws-elasticsearch-connector");
const winston = require("winston");
require("dotenv").config();

const ELASTICSEARCH_DOMAIN = process.env.ELASTICSEARCH_URL;
const PREDICTION_INDEX = "ts-prediction*";
const ANOMALY_INDEX = "ts-anomaly*";
const BATCH_SIZE = 10000;

const awsConfig = new AWS.Config({ region: process.env.AWS_REGION });

const openSearchClient = new Client({
  ...createAwsElasticsearchConnector(awsConfig),
  node: `https://${ELASTICSEARCH_DOMAIN}/`,
  headers: { host: ELASTICSEARCH_DOMAIN },
  suggestCompression: true,
});

const pgClient = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_WRITE_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Set up winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] - ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `${process.env.AWS_REGION}-migration.log`,
      dirname: ".reports",
    }),
  ],
});

async function retryOperation(operation, retries = 3, delay = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw lastError;
      }
      console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function fetchDataFromOpenSearch(index, scrollId = null) {
  return retryOperation(async () => {
    try {
      const searchParams = scrollId
        ? { scroll_id: scrollId, scroll: "1m" }
        : {
            index,
            size: BATCH_SIZE,
            scroll: "1m",
            body: {
              query: {
                bool: {
                  must: [
                    { terms: { type: ["current_angle", "poc"] } },
                    { exists: { field: "timestamp" } },
                  ],
                },
              },
              sort: [{ timestamp: { order: "asc" } }],
            },
          };

      const { body } = scrollId
        ? await openSearchClient.scroll(searchParams)
        : await openSearchClient.search(searchParams);

      const records = body.hits.hits.map((hit) => hit._source);
      const newScrollId = body._scroll_id;
      const hasMore = body.hits.hits.length > 0;

      return { records, newScrollId, hasMore };
    } catch (error) {
      console.error("Error fetching data from OpenSearch:", error);
      throw error;
    }
  });
}

async function insertPredictionDataToPostgres(data, totalRecords) {
  const client = await pgClient.connect();
  const batchSize = BATCH_SIZE / 2;

  try {
    await client.query("BEGIN");
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];

      batch.forEach((record, index) => {
        const {
          asset_id,
          nc_asset_id,
          timestamp,
          expiry,
          type,
          enable,
          ml_data,
          predictions = [],
        } = record;

        values.push(
          asset_id,
          nc_asset_id,
          timestamp,
          expiry,
          type,
          enable,
          ml_data,
          predictions,
          record
        );

        const offset = index * 9;
        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
            offset + 5
          }, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`
        );
      });

      const query = `
        INSERT INTO terrasmart.prediction (asset_id, nc_asset_id, timestamp, expiry, type, enable, ml_data, predictions, data)
        VALUES ${placeholders.join(", ")}
      `;

      await retryOperation(async () => await client.query(query, values));

      logger.info(
        `Inserted records ${i + 1} to ${Math.min(
          i + batchSize,
          data.length
        )} of ${data.length} (Total records: ${totalRecords})`
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error inserting prediction data to Postgres:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function insertAnomalyDataToPostgres(data, totalRecords) {
  const client = await pgClient.connect();
  const batchSize = BATCH_SIZE / 2;

  try {
    await client.query("BEGIN");
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];

      batch.forEach((record, index) => {
        const { asset_id, timestamp, type, test, state, notified } = record;

        values.push(asset_id, timestamp, type, test, state, notified, record);

        const offset = index * 7;
        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
            offset + 5
          }, $${offset + 6}, $${offset + 7})`
        );
      });

      const query = `
        INSERT INTO terrasmart.anomaly (asset_id, timestamp, type, test, state, notified, data)
        VALUES ${placeholders.join(", ")}
      `;

      await retryOperation(async () => await client.query(query, values));

      logger.info(
        `Inserted records ${i + 1} to ${Math.min(
          i + batchSize,
          data.length
        )} of ${data.length} (Total records: ${totalRecords})`
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error inserting anomaly data to Postgres:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function migrateIndexData(
  index,
  tableName,
  insertFunction,
  recordsToSkip = 0
) {
  let scrollId = null;
  let hasMore = true;
  let totalRecordsFetched = 0;
  let totalRecordsInserted = 0;

  while (hasMore) {
    const {
      records,
      newScrollId,
      hasMore: moreRecords,
    } = await fetchDataFromOpenSearch(index, scrollId);
    totalRecordsFetched += records.length;
    logger.info(
      `Fetched ${records.length} records from OpenSearch index ${index} (Total records fetched: ${totalRecordsFetched})`
    );

    if (totalRecordsInserted >= recordsToSkip) {
      await insertFunction(records, totalRecordsFetched);
    } else {
      logger.info(
        `Skipping insert of ${
          records.length
        } records from OpenSearch index ${index} (Total records already inserted: ${
          totalRecordsInserted + records.length
        })`
      );
    }
    totalRecordsInserted += records.length;
    scrollId = newScrollId;
    hasMore = moreRecords;
  }

  logger.info(
    `Data migration completed successfully for index ${index}. Total records inserted: ${totalRecordsInserted}`
  );
}

// eslint-disable-next-line no-unused-vars
async function migrateData() {
  const startTime = new Date();
  try {
    logger.info("Migrating prediction data...");
    await migrateIndexData(
      PREDICTION_INDEX,
      "prediction",
      insertPredictionDataToPostgres,
      SKIP_PREDICTION_RECORDS
    );

    logger.info("Migrating anomaly data...");
    await migrateIndexData(
      ANOMALY_INDEX,
      "anomaly",
      insertAnomalyDataToPostgres,
      SKIP_ANOMALY_RECORDS
    );
  } catch (error) {
    logger.error("Error during migration:", error);
    console.error("Error during migration:", error);
  } finally {
    await pgClient.end();
    await openSearchClient.close();
  }

  const endTime = new Date();
  const executionTime = endTime - startTime;
  const minutes = Math.floor(executionTime / 60000);
  const seconds = ((executionTime % 60000) / 1000).toFixed(0);

  logger.info(`Migration Script executed for ${minutes}m ${seconds}s`);
}

//! IF DATA MIGRATION FAILED DUE TO SOME ERROR FROM OPENSEARCH READ TIMEOUT,
//! THEN USE THESE VARIABLES TO RETRY DATA MIGRATION WHILE SKIPPING ALREADY INSERTED RECORDS
const SKIP_PREDICTION_RECORDS = 0;
const SKIP_ANOMALY_RECORDS = 0;

// migrateData();
