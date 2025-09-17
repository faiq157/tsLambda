const { SNSClient } = require("@aws-sdk/client-sns");
const { SQSClient } = require("@aws-sdk/client-sqs");
// if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test") {
//   AWS.config.loadFromPath("./aws-config.json");
// }
// // AWS.config.loadFromPath("./aws-config.json");
// exports.AWS;

exports.sqs = new SQSClient({ apiVersion: "2012-11-05" });
exports.sns = new SNSClient();
// Added this to trigger deployment, delete if you see this...!!!!
