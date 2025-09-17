const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { terratrakSourceEmail, terratrakStage} = require("./utils/constants")

const ses = new SESClient({ region: "us-east-1" });
const sns = new SNSClient({ apiVersion: "2010-03-31" });

const getSourceEmail = () => {
  switch (process.env.NODE_ENV) {
    case terratrakStage.DEVELOPMENT:
      return terratrakSourceEmail.DEVELOPMENT
    case terratrakStage.STAGING:
      return terratrakSourceEmail.STAGING
    case terratrakStage.PRODUCTION:
      return terratrakSourceEmail.PRODUCTION
    default:
      return terratrakSourceEmail.PRODUCTION
  }
}

exports.sendEmail = async (document) => {
  let params = {
    Destination: {
      ToAddresses: document.emailAddrs,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: document.msgbody,
        },
        Text: {
          Charset: "UTF-8",
          Data: "This is the message body in text format.",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: document.msgSubject,
      },
    },
    ReturnPath: getSourceEmail() || terratrakSourceEmail.PRODUCTION,
    Source: getSourceEmail() || terratrakSourceEmail.PRODUCTION,
  };
  try {
    console.log("Sending EMail");
    const command = new SendEmailCommand(params);
    const res = await ses.send(command);
    // let res = await ses.sendEmail(params).promise();
    console.log("EMAILRES ", res);
    return true;
  } catch (err) {
    console.log("Email Sending Error:", err, err.stack);
    return err;
  }
  // ses.sendEmail(params, (err, data) => {
  //   if (err) {
  //     console.log("Email Sending Error: ", err, err.stack);
  //   } else {
  //     console.log("Notification Queue ID: ", document.msgSubject, " ", data);
  //   }
  // });
};

exports.sendSMS = async (document) => {
  // Create publish parameters
  params = {
    Message: document.msgText /* required */,
    PhoneNumber: document.phoneNumber,
  };

  if (document.phoneNumber.toString().startsWith("+92")) {
    console.log("SENDING SMS TO PK NUMBER...");
    console.log(document);
    if (document.phoneNumber.toString() === "+9234510006201") {
      console.log("Sending to ", document.phoneNumber);
      const command = new PublishCommand(params);
      const res = await sns.send(command);
      // let res = await sns.publish(params).promise();
      console.log("SMSRES", res, document);
    }
  } else {
    // Create promise and SNS service object
    const command = new PublishCommand(params);
    const res = await sns.send(command);
    // let res = await sns.publish(params).promise();
    console.log("SMSRES", res);

    // Handle promise's fulfilled/rejected states
    /*publishTextPromise
      .then(function(data) {
        console.log("MessageID is " + data.MessageId);
      })
      .catch(function(err) {
        console.error(err, err.stack);
      });*/
  }

  return true;
};
