const { getAWSRegion } = require("../utils/lib/envVarProvider");

module.exports = {
  graphql: {
    port: 8080,
    cookieSession: {
      keys: [
        "S4oC+NIM4Vruk8+bLsh21O/TsNG3G+ZBBwvot++8AUqEJzfb9JJHGzvy9j57OtKj",
      ],
    },
  },

  db: {
    writer: {
      host: "localhost",
      maxConnections: 1,
      maxConnectionsLambda: 1,
    },
    reader: {
      host: "localhost",
      maxConnections: 1,
      maxConnectionsLambda: 1,
    },
    port: 5432,
    user: "test",
    password: "postgres",
    database: "test",
    schema: "terrasmart",
    connectionTimeout: 0, // milliseconds to wait before timing out when connecting a new client
    idleTimeout: 0, // milliseconds a client must sit idle in the pool and not be checked out
    statementTimeout: 0, // number of milliseconds before a statement in query will time out, default is no timeout
    idleInTransactionSessionTimeout: 0, // number of milliseconds before terminating any session with an open idle transaction
    queryTimeout: 0, // number of milliseconds before a query call will timeout, default is no timeout
  },

  aws: {
    accountId: "123456789012",
    snsTopicAlerts: `arn:aws:sns:${getAWSRegion()}:123456789012:test-terratrak-nc-to-ci`,
    apiGatewayDefaultUsagePlan: "test-terratrak-cloud-api",
  },

  redis: {
    host: "localhost",
    port: "6379",
  },
};
