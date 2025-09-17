const { SQSClient} = require("@aws-sdk/client-sqs");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const fsPromis = require('fs').promises;
const region = process.env.AWS_REGION || 'us-east-2';
let awsConfig = {};

if (process.env.NODE_ENV == "test") {
  const testAwsConfig = (async () => await fsPromis.readFile("./aws-config.json"))();
   awsConfig = testAwsConfig;
}

let sqs = new SQSClient({...awsConfig, apiVersion: "2012-11-05", region: region });
let sns = new SNSClient({...awsConfig, region: region});

module.exports = {
  sqs,
  sns,
  PublishCommand,
};

