const db = require("../db");
const { v4: uuidv4 } = require('uuid');
const helpers = require("./../utils/helpers/functions");
const { exeQuery } = require("../utils/lib/pg");
const { sns } = require("./../utils/lib/aws");
const aws = require("../utils/lib/aws");
const { acquireLock } = require("../utils/lib/distributedLock");
const {PublishCommand} = require("@aws-sdk/client-sns");

class CommandStatusUpdateService {
  
  constructor(netCtrlId, pbUpdate) {
    this.netCtrlId = netCtrlId;
    this.pbUpdate = pbUpdate;
    this.errorCodes = [3, 4, 5];

    this.when = pbUpdate.getWhen().toDate();
    this.command = pbUpdate.getCommand();
    // can be any of NEW = 0, SENT = 1, IN_PROGRESS = 2, COMPLETED = 3, FAILED = 4, UNKNOWN = 5
    this.status = pbUpdate.getStatus();
    this.errorCode = pbUpdate.getErrorCode();
    this.snapAddressStr = pbUpdate
      .getSnapAddr_asU8()
      .reduce((str, c) => str + c.toString(16).padStart(2, "0"), "");
  }

  async handler() {
    try {
      
      this.asset = await this.getAssetInfo();
      if (this.asset?.repeater_only) {
        console.info("In CommandStatusUpdateService Ignoring repeater update,", this.snapAddressStr);
        return null
      }
      return await this.performDBOperation();

    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in commandStatusUpdate handler..!!"
      );
    }
  }

  /**
   *
   * Update DB and S3 after acquiring lock
   */
  async performDBOperation() {
    try {
      await this.insertLog();

      await this.performOperationsSync();
    } catch (err) {
      if (!(err.message === "IRCError")) {
        throw err;
      }
    }
  }
  /**
   * To ensure only one instance of a lambda function is updating S3 at a time
   * Some operation are preformed by locking using redlock
   */
  async performOperationsSync() {
    const ncAsset = await exeQuery(db.getAssetNC, [this.asset.id]);

    const ncID = ncAsset.rows[0].nc_asset_id;
    try {

      await acquireLock(
        "locks:sites:nc:" + ncID,
        4000,
        // Things to do while being in locked state
        async () => {
          await this.updateStatus();
          await this.checkError();
          await this.completeCommand();
        }
      );
      
    } catch (err) {
      console.error(err);
      throw new Error("Operation not completed error performOperationsSync !!", err);
    } 

  }
  /**
   * Updates the S3 file with whats in DB for that site and sends SNS notification
   */
  async completeCommand() {
    if (this.status === 2) {
      console.log("Updating S3..!");
      await this.changeS3State();
      console.log("Sending SNS Notification..!");
      await this.sendSNSNotification();
    }
  }
  /**
   * Firmware sends error codes in case an error was encountered,
   * Function marks the command as completed and commits the database changes
   */
  async checkError() {
    const error = this.errorCode;
    console.log("Checking for error..!");
    console.log("Got this error code: ", error);
    if (this.errorCodes.includes(error)) {
      console.log("Found Error..!");
      console.log("Removing from S3..!");
      await this.changeS3State();
      console.log("Setting true for last_action_completed..!");
      await this.setLastActionCompletedToTrue(this.asset.id);
      throw new Error("IRCError");
    }
    // console.log("No Error Found..!");
    return true;
  }
  /**
   * Updates DB with what ever was received from firmware side.
   * DB columns that are updated are
   * 1) individual_rc_status
   * 2) timestamp
   * 3) error_code
   */
  async updateStatus() {
    let data = [
      this.asset.individual_rc_status < this.status
        ? this.status
        : this.asset.individual_rc_status,
      this.when,
      this.errorCode,
      this.asset.id,
    ];
    console.log("Updating status..!", data);
    const result = await exeQuery(db.updateIRCProgressStatus, data);
    console.log("Updated status..!", result.rowCount);
  }
  /**
   * This function writes to irc_logs table in DB
   * It runs every time the lambda function runs, even in case of error
   * Helps to identify and easily track back the cloud updates that we received
   */
  async insertLog() {
    console.log("Inserting log..!");
    const result = await exeQuery(db.insertIRCLog, [
      uuidv4(),
      this.errorCode,
      this.command,
      this.status,
      helpers.getPgTimestamp(),
      this.when,
      "IRC_COMMAND_STATUS_UPDATE",
      this.asset.id,
    ]);
    console.log("Inserted log..!", result.rowCount);
  }
  /**
   * From snap address get the asset's info
   */
  async getAssetInfo() {
    console.log("Getting asset information..!");
    const assetInfoRes = await exeQuery(db.assetInfoQuery, [
      this.pbUpdate.getSnapAddr_asU8(),
    ]);

    // console.log("Got asset information..! ", assetInfoRes.rows);
    console.log("Found assetId is: ", assetInfoRes.rows[0].id);

    return assetInfoRes.rows[0];
  }
  /**
   * When "status" 2 is received the column "last_action_completed" is set to true
   *
   */
  async setLastActionCompletedToTrue(assetId) {
    console.log("Updating command completion status..!");
    const query = db.setLastActionCompletedToTrue;

    const result = await exeQuery(query, [assetId]);
    console.log("Updated command completion status..!", result.rowCount);
  }
  /**
   * Update the S3 file with whatever is in DB
   *
   */
  async changeS3State() {
    const ncAsset = await exeQuery(db.getAssetNC, [this.asset.id]);

    console.log("Result changeS3State", ncAsset.rows[0]);

    const filePathData = helpers.getS3BucketAndFileName(ncAsset.rows[0]);

    console.log("File path data: ", filePathData);

    await aws.uploadS3Object(filePathData.bucket, filePathData.filePath, {
      commands: await this.getActiveCommands(),
    });
  }

  /**
   * Get the asset id's of a site where 
  error_code = 0 AND
  individual_rc_status < 4 AND
  individual_rc_cmd_state != 0
   */
  async getActiveCommands() {
    console.log("Getting updated commands..!");
    const result = await exeQuery(db.getActiveCommands, [
      this.asset.site_id,
    ]);

    result.rows.map((command) => {
      command.asset_id = command.asset_id.reduce(
        (str, c) => str + c.toString(16).padStart(2, "0"),
        ""
      );
      command.last_state = command.cmd_state;
      command.last_preset = command.param;
    });
    console.log("Got these rows!", result.rows);

    return result.rows;
  }

  /**
   * Send a SNS message which is consumed by CloudIntelligence lambda
   */
  async sendSNSNotification() {
    try {
      const assetInfo = {
        timestamp: this.when,
        command: this.command,
        status: this.status,
        snapAddr: this.snapAddressStr,
        error: this.errorCode,
        assetId: this.asset.id,
      };
      assetInfo.type = "elastic_search-1";
      assetInfo.channel = "command_status_update";

      console.log("payload to be sent to SNS : ", assetInfo);
      if (process.env.NODE_ENV !== "test") {
        let params = {
          Message: JSON.stringify(assetInfo),
          TopicArn: process.env.SNS_NOTIFICATION_ARN, //"arn:aws:sns:us-east-2:852475575129:NC-TO-CI-Dev",
        };

        // const snsRes = await sns.publish(params).promise();
        const command = new PublishCommand(params);
        const snsRes = await sns.send(command);

        console.log("snsRes: ", snsRes);
      } else {
        console.log("  !!! Not sending the data to SNS bcz of test env !!!");
      }
      return true;
    } catch (err) {
      console.log("Error in sendSNSNotification .. ", err);
      throw err;
    }
  }
}

module.exports.CommandStatusUpdateService = CommandStatusUpdateService;