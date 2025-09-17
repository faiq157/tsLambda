const { getAWSRegion, getAWSAccountId } = require("../utils/lib/envVarProvider");

module.exports = {
  aws: {
    // TODO: Change when shift production to terraform prod-terratrak-nc-to-ci
    snsTopicAlerts: `arn:aws:sns:${getAWSRegion()}:${getAWSAccountId()}:NC-TO-CI-PRODUCTION`,
    apiGatewayDefaultUsagePlan: "cloud-api",
  },
};
