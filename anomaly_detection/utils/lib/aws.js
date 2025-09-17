const { SQSClient} = require("@aws-sdk/client-sqs");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const region = process.env.AWS_REGION || "us-east-2";

const fsPromis = require('fs').promises;
const testAwsConfig = async () => {
  try {
    return await fsPromis.readFile("./aws-config.json");
  } catch (error) {
    return {}; // Return an empty object in case of error
  }
};
const awsConfig = process.env.NODE_ENV == "test" ? testAwsConfig : {}

let sqs = new SQSClient({...awsConfig, apiVersion: "2012-11-05", region: region });
let sns = new SNSClient({...awsConfig, region: region});

module.exports = {
  sqs,
  sns,
  PublishCommand,
};
