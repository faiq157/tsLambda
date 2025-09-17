const { getAWSRegion, getAWSAccountId } = require("../utils/lib/envVarProvider");

module.exports = {
  aws: {
    snsTopicAlerts: `arn:aws:sns:${getAWSRegion()}:${getAWSAccountId()}:stage-terratrak-nc-to-ci`,
    apiGatewayDefaultUsagePlan: "stage-terratrak-cloud-api",
  },
};
