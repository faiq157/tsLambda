const { sqs } = require("../lib/aws");
const { getProjectDetailsByNcId, getProjectDetailsBySiteId } = require('../../models/project.model');
const { assetTypes } = require('../constants');
const { getAssetById } = require('../../models/asset.model');
const { SendMessageCommand } = require("@aws-sdk/client-sqs");

class QueueHelper {
  async queueNotification(document) {
    const params = {
      DelaySeconds: 0,
      MessageAttributes: {
        Title: {
          DataType: "String",
          StringValue: "Notification",
        }
      },
      MessageBody: JSON.stringify(document),
      QueueUrl: process.env.SQS_NOTIFICATION_URL, //"https://sqs.us-east-2.amazonaws.com/852475575129/Terra_track_emails",
    };
    return this.sendMessage(params);
  }

  async verifyAssetMlEnabled ( params) {
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

  async queueDetectedAnomaly(document) {
    const valResponse = await this.verifyAssetMlEnabled(document)
    if (!valResponse) {
      return false;
    }

    const params = {
      DelaySeconds: 0,
      MessageAttributes: {
        Title: {
          DataType: "String",
          StringValue: "Notification",
        },
      },
      MessageBody: JSON.stringify(document),
      QueueUrl: process.env.SQS_ERROR_DETECTION_URL, //"https://sqs.us-east-2.amazonaws.com/852475575129/anomaly_detection-dev"
    };
    return this.sendMessage(params);
  }

  async sendMessage(params) {
    try {
      const command = new SendMessageCommand(params);
      return await sqs.send(command);
      // return sqs.sendMessage(params).promise();
    } catch (err) {
      console.log("SQS sendMessage Error..", err);
      return err;
    }
  }
}

exports.queueHelper = new QueueHelper();
