// const AWS = require("aws-sdk");
const https = require('https');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const {Upload} = require("@aws-sdk/lib-storage");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SQSClient,
   GetQueueUrlCommand,
    SendMessageCommand,
     DeleteMessageCommand,
      DeleteMessageBatchCommand
   } = require("@aws-sdk/client-sqs");

// const s3 = new AWS.S3();
const { getAWSRegion, getNodeEnv, getAWSAccountId } = require('./envVarProvider');

// when there are burst requests to SNS custom agent will allow more requests
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 256,
  timeout: 4000
});

const AwsConfig = {
  awsRegion: getAWSRegion(),
  awsAccountId: getAWSAccountId(),
  sqsApiVersion: '2012-11-05',
  snsApiVersion: '2010-03-31',
  notificationQueueName: getNotificationQueueName(),
  anomalyDetectionQueueName: 'TerraTrak_Anomay_Detection'
};

function getNotificationQueueName() {
  const nodeEnv = getNodeEnv();
  if (nodeEnv === 'production') {
    return 'notifications_prod';
  } else if (nodeEnv === 'staging') {
    return 'stage-terratrak-notifications';
  } else {
    return 'dev-terratrak-notifications';
  }
}
// AWS.config.update({ region: AwsConfig.awsRegion });

const s3 = new S3Client({region: AwsConfig.awsRegion});
const sns = new SNSClient({region: AwsConfig.awsRegion, apiVersion: AwsConfig.snsApiVersion, httpOptions: { agent } });
const sqs = new SQSClient({region: AwsConfig.awsRegion, apiVersion: AwsConfig.sqsApiVersion });

// exports.AWS = AWS;
exports.sqs = sqs;
exports.sns = sns;
exports.AwsConfig = AwsConfig;

let sqsUrlCache = {}

exports.uploadS3Object = async (bucket, key, file) => {
  console.log("Updating S3 contents: ", file, key, bucket);
  // await s3
  //   .upload({
  //     Bucket: bucket,
  //     Key: key,
  //     Body: JSON.stringify(file),
  //   })
  //   .promise();
    try {
      const parallelUploads3 = new Upload({
        client: s3,
        params: {
          Bucket: bucket,
          Key: key,
          Body: JSON.stringify(file)
        }
      });
    
      parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });
    
      await parallelUploads3.done();
    } catch (e) {
      console.log(e);
    }
};

exports.getS3Object = async (bucket, key) => {
  try {
    // const obj = await s3
    //   .getObject({
    //     Bucket: bucket,
    //     Key: key,
    //   })
    //   .promise();
      const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          });
      const obj = await s3.send(command);

    return JSON.parse(obj.Body.toString());
  } catch (error) {
    return null;
  }
  
};

exports.publishToSNS = async (payload) => {
  const params = {
    TopicArn: process.env.SNS_NOTIFICATION_ARN, //"arn:aws:sns:us-east-2:852475575129:NC-TO-CI-Dev",
    Message: JSON.stringify(payload)
  };

  // if (process.env.NODE_ENV === "test") {
  //   console.warn("  !!! Not sending the data to ES bcz of test env !!!", params);
  //   return {
  //     MessageId: 'test'
  //   }
  // }

  // console.log('sns payload', params);
  const startTime = Date.now();
  // const snsRes = await sns.publish(params).promise();
  const command = new PublishCommand(params);
  const snsRes = await sns.send(command);
  console.log("SNSPublishRes: ", JSON.stringify({ messageId: snsRes.MessageId, delay: Date.now() - startTime }));
  return snsRes;
}

exports.publishToSNSTest = async (payload) => {
  const params = {
    TopicArn: `arn:aws:sns:us-east-2:${getAWSAccountId()}:NC-TO-CI-Dev`,
    Message: JSON.stringify(payload)
  };

  if (process.env.NODE_ENV === "staging") {
    // const snsRes = await sns.publish(params).promise();
    const command = new PublishCommand(params);
    const snsRes = await sns.send(command);
    console.log("SNSPublishRes: ", snsRes.MessageId);
    return snsRes;
  } else {
    console.warn(`{"SNSPublishRes": "Not published to SNS due to incompatible environemnt"}`)
    return true;
  }
}

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_GetQueueUrl.html
const convertSQSNameToUrl = async (queueName) => {

  if(!sqsUrlCache[queueName]) {
    // const response = await sqs.getQueueUrl({ QueueName: queueName }).promise();
    const command = new GetQueueUrlCommand({ QueueName: queueName });
    const response = await sqs.send(command);
    sqsUrlCache[queueName] = response.QueueUrl;

    console.log('sqs url cached', JSON.stringify({ name: queueName, url: response.QueueUrl }));
  }

  return sqsUrlCache[queueName];
}

exports.resetSqsUrlCache = () => {
  sqsUrlCache = {};
}

exports.addMessageToNotificationSqs = async (body) => {
  const queueUrl = await convertSQSNameToUrl(AwsConfig.notificationQueueName);
  const params = {
    DelaySeconds: 0,
    MessageBody: JSON.stringify(body),
    QueueUrl: queueUrl
  };
  return addMessageToSqs(params);
};

const addMessageToSqs = async (params) => {
  try {
    // return sqs.sendMessage(params).promise();
    const command = new SendMessageCommand(params);
    return await sqs.send(command);
  } catch (err) {
    console.log("addMessageToSqs Error..", err);
    return err;
  }
};

const convertSQSArnToUrl = async (sqsArn) => {
  // arn:aws:sqs:region:account-id:queue-name
  // arn:aws:sqs:us-west-1:852475575129:dev-terratrak-cloud-updates
  const queueName = sqsArn.split(':').slice(-1)[0];

  return convertSQSNameToUrl(queueName);
}

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessage.html
exports.removMessageFromSQS = async (sqsArn, receiptHandle) => {
  const queueUrl = await convertSQSArnToUrl(sqsArn);

  // return sqs.deleteMessage({
  //   QueueUrl: queueUrl,
  //   ReceiptHandle: receiptHandle
  // }).promise();
  const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle
    });
  return await sqs.send(command);
}

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessageBatch.html
exports.removMessagesFromSQS = async (sqsArn, messages) => {
  const queueUrl = await convertSQSArnToUrl(sqsArn);

  const entries = [];

  for(const msg of messages) {
    entries.push({
      Id: msg.messageId,
      ReceiptHandle: msg.receiptHandle
    })
  }
  
  // const result = await sqs.deleteMessageBatch({
  //   QueueUrl: queueUrl,
  //   Entries: entries
  // }).promise();
    const command = new DeleteMessageBatchCommand({
    QueueUrl: queueUrl,
    Entries: entries
  });
  const result = await sqs.send(command);

  const { Failed: failed } = result;

  // console.log(`sqs, remove message batch`, result);

  if(failed && failed.length > 0) {
    console.error(`sqs, unable to remove ${failed.length} messages`, failed);
  }

  return result;
}
