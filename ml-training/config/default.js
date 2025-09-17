const { getAWSRegion, getAWSAccountId } = require("../utils/lib/envVarProvider");

module.exports = {
  db: {
    writer: {
      host: "127.0.0.1",
      maxConnections: 25,
      maxConnectionsLambda: 5,
    },
    reader: {
      host: "",
      maxConnections: 100,
      maxConnectionsLambda: 5,
    },
    port: 5432,
    user: "",
    password: "",
    database: "terrasmart",
    schema: "terrasmart",
    connectionTimeout: 10000, // milliseconds to wait before timing out when connecting a new client
    idleTimeout: 180000, // milliseconds a client must sit idle in the pool and not be checked out
    statementTimeout: 0, // number of milliseconds before a statement in query will time out, default is no timeout
    idleInTransactionSessionTimeout: 0, // number of milliseconds before terminating any session with an open idle transaction
    queryTimeout: 600000, // number of milliseconds before a query call will timeout, default is no timeout
  },

  redis: {
    host: "127.0.0.1",
    port: "6379",
    reconnect_interval: 1000,
  },

  aws: {
    accountId: getAWSAccountId(),
    snsTopicAlerts: `arn:aws:sns:${getAWSRegion()}:${getAWSAccountId()}:dev-terratrak-nc-to-ci`,
    region: getAWSRegion(),
    sqsApiVersion: "2012-11-05",
    snsApiVersion: "2010-03-31",
    apiGatewayDefaultUsagePlan: "dev-terratrak-cloud-api",
  },
};
