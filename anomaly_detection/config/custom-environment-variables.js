module.exports = {
  db: {
    writer: {
      host: "DB_WRITE_HOST",
      maxConnections: "DB_WRITE_MAX_CLIENT_COUNT",
      maxConnectionsLambda: "DB_WRITE_MAX_CLIENT_COUNT_LAMBDA",
    },
    reader: {
      host: "DB_READ_HOST",
      maxConnections: "DB_READ_MAX_CLIENT_COUNT",
      maxConnectionsLambda: "DB_READ_MAX_CLIENT_COUNT_LAMBDA",
    },
    port: "DB_PORT",
    user: "DB_USER",
    password: "DB_PASSWORD",
    database: "DB_DATABASE",
    schema: "DB_SCHEMA",
    connectionTimeout: "DB_CONN_TIMEOUT",
    idleTimeout: "DB_POOL_IDLE_TIMEOUT",
    statementTimeout: "DB_STATEMENT_TIMEOUT",
    idleInTransactionSessionTimeout: "DB_IDLE_IN_TRANSACTION_SESSION_TIMEOUT",
    queryTimeout: "DB_QUERY_TIMEOUT",
  },

  redis: {
    host: "CACHEHOST",
    port: "CACHEPORT",
  },
};
