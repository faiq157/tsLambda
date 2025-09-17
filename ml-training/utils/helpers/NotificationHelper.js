const { sns, PublishCommand } = require("../lib/aws");

const sendNotification = async (document) => {
  let params = {
    Message: JSON.stringify(document),
    TopicArn: process.env.SNS_NOTIFICATION_ARN
  };

  const command = new PublishCommand(params);
  return await sns.send(command);
};

module.exports = () => {
  return {
    sendNotification
  };
};
