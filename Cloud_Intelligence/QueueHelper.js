const { PublishCommand } = require("@aws-sdk/client-sns");
const { SendMessageCommand } = require("@aws-sdk/client-sqs");
const { getProjectDetailsByNcId, getProjectDetailsBySiteId } = require('./models/project.model')
const { getAssetById } = require('./models/asset.model')
const { assetTypes } = require('./utils/constants');
const { sqs, sns } = require("./aws");

const queueNotification = async document => {
  var params = {
    DelaySeconds: 0,
    MessageAttributes: {
      Title: {
        DataType: "String",
        StringValue: "Notification"
      }
    },
    MessageBody: JSON.stringify(document),
    QueueUrl: process.env.SQS_NOTIFICATION_URL
  };
  return await sendMessage(params);
};

const verifyAssetMlEnabled = async (params) => {
  const { asset_id, channel } = params

  if (!asset_id) {
    console.warn(`recieved asset_id ${asset_id} in queueDetectedAnomaly/verifyAssetMlEnabled`);
    return false
  }
  if (!channel) {
    console.warn(`recieved channel ${channel} in queueDetectedAnomaly/verifyAssetMlEnabled`);
    return false
  }

  let projectDetail

  const asset = await getAssetById(asset_id);

  if (!asset) {
    return false 
  }

  const { site_id, active, asset_type, parent_network_controller_id, repeater_only } = asset

  if(asset_type === assetTypes.ASSET_TYPE_NC && !site_id) {
    console.warn(`nc not attached to any site queueDetectedAnomaly/verifyAssetMlEnabled`);
    return false
  }

  if(asset_type !== assetTypes.ASSET_TYPE_NC && !parent_network_controller_id) {
    console.warn(`asset_type : ${asset.asset_type} and parent_network_controller_id : ${parent_network_controller_id} queueDetectedAnomaly/verifyAssetMlEnabled`);
    return false
  }

  // get project detail with respect to asset type 
  if (asset_type === assetTypes.ASSET_TYPE_NC) {
    projectDetail = await getProjectDetailsBySiteId(site_id);
  }
  else{
    projectDetail = await getProjectDetailsByNcId(parent_network_controller_id);
  }

  if (!projectDetail) {
    console.warn(`project detail not found. queueDetectedAnomaly/verifyAssetMlEnabled`);
    return false
  }

  switch (channel) {
    case 'wakeup_event':
    case 'tracking_command_hist':{
      //( Project ML Enabled Angle or Battery AM or Battery PM)
      return (projectDetail.ml_current_angle || projectDetail.ml_battery_am || projectDetail.ml_battery_pm)
    }
    case 'rack_hist':{

      if (!active) { // asset active 
        return false;
      }
    
      // return false if asset is node RB 
      if(asset_type !== assetTypes.ASSET_TYPE_RB){
        return false;
      }

      // return false if repeater_only is true
      if (repeater_only) {
        return false;
      }

      // if Angle ML is ON
      return projectDetail.ml_current_angle 

    }

    case 'battery_hist':{
      // Fetch Project
      // if asset is active and (Batter AM or Battery PM is enabled) 
      if (!active) { // asset active 
        return false
      }

      return (projectDetail.ml_battery_am || projectDetail.ml_battery_pm)
    }

  }
  return false;
}

const queueDetectedAnomaly = async (document) => {

  const valResponse = await verifyAssetMlEnabled(document);
  if(!valResponse){
    return false
  }

  const params = {
    DelaySeconds: 0,
    MessageAttributes: {
      Title: {
        DataType: "String",
        StringValue: "Notification"
      }
    },
    MessageBody: JSON.stringify(document),
    QueueUrl: process.env.SQS_ERROR_DETECTION_URL
  };
  return await sendMessage(params);
};

const queueDelayMessage = async document => {
  var params = {
    DelaySeconds: document.delaySeconds,
    MessageAttributes: {
      DataType: "String",
      StringValue: "Notification"
    },

    MessageBody: JSON.stringify(document),
    QueueUrl: process.env.SQS_DELAY_MESSAGE_URL
  };
  return await sendMessage(params);
};

const queueRetryES = async document => {
  var params = {
    DelaySeconds: 15,
    //MessageAttributes: {
    //  DataType: "String",
    //  StringValue: "Retry"
    //},
    MessageBody: JSON.stringify(document),
    QueueUrl: process.env.SQS_RETRY_ES_URL
  };
  return await sendMessage(params);
};

const testSns = async document => {
  console.log("sending...: ", JSON.stringify(document));
  let params = {
    Message: JSON.stringify(document),
    TopicArn: "arn:aws:sns:us-east-2:852475575129:NC-TO-CI"
  };
  const command = new PublishCommand(params);
  const publishTextPromise = await sns.send(command);
  // var publishTextPromise = await sns.publish(params).promise();
  console.log("publishTextPromise:", publishTextPromise);
};

async function sendMessage(params) {
  try {
    const command = new SendMessageCommand(params);
    return await sqs.send(command);
    // return await sqs.sendMessage(params).promise();
  } catch (err) {
    console.log("SQS sendMessage ERROR/Error..", err);
    return err;
  }
}

exports.queueNotification = queueNotification;
exports.queueDetectedAnomaly = queueDetectedAnomaly;
exports.queueDelayMessage = queueDelayMessage;
exports.testSns = testSns;
exports.queueRetryES = queueRetryES;