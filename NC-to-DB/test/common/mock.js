const { aws } = require('./testData');
const { v4: uuidv4 } = require('uuid');
const nock = require('nock');
const { isEqual, matches } = require('lodash');
const { mqtt } = require('../../utils/constants');
const { site } = require('./testData');
const { AwsConfig } = require("../../utils/lib/aws");
const crypto = require('crypto');

const compareSNSPaylaod = (body, expectedBody) => {

  // match request with any body
  if (!expectedBody) {
    return true
  }

  const received = { ...body, Message: JSON.parse(body.Message) };
  const expected = { ...expectedBody, Message: JSON.parse(expectedBody.Message) }
  const result = isEqual(received, expected);
  if (!result) {
    console.error('sns body does not match with expected body', received, expected);
  }
  return result;
}

const compareMqttPayload = (body, expectedBody) => {
  // match request with any body
  if (!expectedBody) {
    return true
  }

  return matches(body, expectedBody);
};

const mockSns = (payload, requestId, messageId) => {
  requestId = requestId || uuidv4();
  messageId = messageId || uuidv4();

  const expectedBody = payload ? {
    Action: 'Publish',
    Message: JSON.stringify(payload),
    TopicArn: `arn:aws:sns:${AwsConfig.awsRegion}:${AwsConfig.awsAccountId}:${aws.snsTopic}`,
    Version: AwsConfig.snsApiVersion
  } : null;

  const resp =
    `<PublishResponse xmlns="http://sns.amazonaws.com/doc/2010-03-31/">
      <PublishResult>
        <MessageId>${messageId}</MessageId>
      </PublishResult>
      <ResponseMetadata>
        <RequestId>${requestId}</RequestId>
      </ResponseMetadata>
    </PublishResponse>`;

  return nock(`https://sns.${AwsConfig.awsRegion}.amazonaws.com:443`, { "encodedQueryParams": true })
    .post('/', body => compareSNSPaylaod(body, expectedBody))
    .reply(200, resp, {
      'x-amzn-RequestId': requestId,
      'Content-Type': 'text/xml',
      'Content-Length': (req, res, body) => body.length,
      'Date': () => `${Date.now()}`,
      'Keep-Alive': 'timeout=5',
      'Connection': 'keep-alive'
    });
}

const generateMD5 = (data) => {
  return crypto.createHash('md5').update(data, 'utf8').digest('hex');
};

const mockSqsBase = (action, expected, resp='', requestId=null) => {
  requestId = requestId || uuidv4();

  return nock(`https://sqs.${AwsConfig.awsRegion}.amazonaws.com:443`, {"encodedQueryParams":true})
  .persist()
  .post('/', (body) => {
    let result = false;
    if (body.MessageBody && expected.MessageBody) {
      body.MessageBody = JSON.parse(body.MessageBody);
      const expectedObjToCompare = {...expected, MessageBody: expected.MessageBody};
      result = isEqual(body, expectedObjToCompare);
    } else {
      result = isEqual(body, expected);
    }
    if (!result) {
      console.error('sqs body does not match with expected body', body, expected);
    }
    return result;
  })
  .reply(200, resp, {
    'x-amzn-RequestId': requestId,
    'Content-Type': 'text/xml',
    'Content-Length': (req, res, body) => body.length,
    'Date': () => `${Date.now()}`
  });
}

const mockDetectedAnomalySqs = (queueName, messageBody, requestId=null) => {
  const md5OfBody = generateMD5(JSON.stringify(messageBody));
  const expected = {
    MessageBody: messageBody,
    DelaySeconds: 0,
    QueueUrl:  `https://sqs.${AwsConfig.awsRegion}.amazonaws.com/${AwsConfig.awsAccountId}/${queueName}`,
    MessageAttributes: {Title: {DataType: 'String', StringValue: 'Notification'}}
  };
  requestId = requestId || uuidv4();
  const resp = {
    MessageId: aws.sqsMessageId,
    MD5OfMessageBody: md5OfBody,
  };
  return mockSqsBase('SendMessage', expected, resp, requestId);
}

const mockSqsPublishMsg = (expected, queueName, requestId=null) => {
  const md5OfBody = generateMD5(JSON.stringify(expected));
  expected = {
    MessageBody: expected,
    DelaySeconds: 0,
    QueueUrl:  `https://sqs.${AwsConfig.awsRegion}.amazonaws.com/${AwsConfig.awsAccountId}/${queueName}`
  };
  requestId = requestId || uuidv4();
  const resp = {
    MessageId: aws.sqsMessageId,
    MD5OfMessageBody: md5OfBody,
  };
  return mockSqsBase('SendMessage', expected, resp, requestId);
};

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_GetQueueUrl.html
  const mockSqsGetQueueUrl = (queueName, requestId=null) => {
    requestId = requestId || uuidv4();
    const resp = `{"QueueUrl":"https://sqs.${AwsConfig.awsRegion}.amazonaws.com/${AwsConfig.awsAccountId}/${queueName}"}`;
    return mockSqsBase(null, { QueueName: queueName }, resp, requestId);
  };


// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessage.html
const mockSqsDeleteMessage = (queueName, requestId=null) => {
  requestId = requestId || uuidv4();

  const queueUrl = `https://sqs.${AwsConfig.awsRegion}.amazonaws.com/${AwsConfig.awsAccountId}/${queueName}`;

  const resp =
    `<?xml version="1.0" encoding="UTF-8"?>
    <DeleteMessageResponse xmlns="http://queue.amazonaws.com/doc/${AwsConfig.sqsApiVersion}/">
      <ResponseMetadata>
        <RequestId>${requestId}</RequestId>
      </ResponseMetadata>
    </DeleteMessageResponse>`;

  return mockSqsBase('DeleteMessage', { QueueUrl: queueUrl, ReceiptHandle: aws.sqsReceiptHandle }, resp, requestId);
}

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessageBatch.html
const mockSqsDeleteMessageBatch = (queueName, requestId=null) => {
  requestId = requestId || uuidv4();

  const queueUrl = `https://sqs.${AwsConfig.awsRegion}.amazonaws.com/${AwsConfig.awsAccountId}/${queueName}`;

  const resp = {
    DeleteMessageBatchResult: {
      DeleteMessageBatchResultEntry: [
        {
          Id: aws.sqsMessageId,
        },
      ],
    },
    ResponseMetadata: {
      RequestId: requestId,
    }
  };

  const body = {
    QueueUrl: queueUrl,
    Entries: [{
      Id: aws.sqsMessageId,
      ReceiptHandle: aws.sqsReceiptHandle
    }]
  };

  return mockSqsBase('DeleteMessageBatch', body, resp, requestId);
};


const mockMqtt = (payload, principalId, requestId) => {
  requestId = requestId || uuidv4();
  principalId = principalId || site.aws_iot_principal_id;

  return nock(`https://${mqtt.accountPrefix}-ats.iot.${AwsConfig.awsRegion}.amazonaws.com:8443`, { "encodedQueryParams": true })
    .post(`${mqtt.ncTopic}/${principalId}`, body => compareMqttPayload(body, payload))
    .query({ "qos": "1" })
    .reply(200, JSON.stringify({
      message: 'OK',
      traceId: requestId
    }), {
      'content-type': 'application/json',
      'content-length': (req, res, body) => body.length,
      'Date': () => `${Date.now()}`, // 'Tue, 01 Feb 2022 05:14:40 GMT'
      'x-amzn-RequestId': requestId,
      'connection': 'keep-alive'
    });
};

module.exports = {
  mockSns,
  mockMqtt,
  mockDetectedAnomalySqs,
  mockSqsGetQueueUrl,
  mockSqsDeleteMessage,
  mockSqsDeleteMessageBatch,
  mockSqsPublishMsg
}
