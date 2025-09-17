
const getNodeEnv = () => process.env.NODE_ENV;
// const getEnvName = () => process.env.ENV_NAME || process.env.NODE_ENV;
const getAWSRegion = () => process.env.AWS_REGION || 'us-east-2';
const getAppName = () => process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.APP_NAME || 'DefaultApp';
const getAWSAccountId = () => process.env.ENV_AWS_ACCOUNT_ID;

module.exports = {
  getNodeEnv,
  // getEnvName,
  getAWSRegion,
  getAppName,
  getAWSAccountId
};
