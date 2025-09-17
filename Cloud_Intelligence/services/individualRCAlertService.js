const db = require("../db");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");


const s3 = new S3Client();

class IndividualRCAlertService {
  async handler(client, pgWrite, payload) {
    this.client = client;
    this.pgWrite = pgWrite;
    this.payload = payload;
    console.log("Updating status on angle change..!", payload);

    try {
      // if (payload.current_angle === payload.requested_angle) {
      const query = db.getIndividualRCActiveAction;
      let result = await client.query(query, [payload.asset_id]);
      result = result.rows[0];
      if (result && result.last_action_completed === false) {
        result = await pgWrite.query(db.updateIndividualRCCompletionStatus, [
          payload.asset_id,
        ]);
      }
      // }
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed IndividualRCAlertService error handler..!!",
        err
      );
    }
  }

  async updateCommandStatus(args, client, pgWrite) {
    console.log("Manual Control stopped with args: ", args);
    try {
      console.log("Finding asset..!");
      const asset = await this.getAssetDetails(args.assetId, client);
      console.log("Got this asset: ", asset);

      if (asset && asset.commanded_state === 0) {
        console.log("Asset found..!");
        // const fileData = this.getS3BucketAndFileName(asset);

        // const file = await this.getS3Object(fileData.bucket, fileData.filePath);

        // console.log("Got content in file", file);

        // await this.removeS3Object(args, client, file, asset);

        // if (file) {
        const result = await pgWrite.query(
          db.updateIndividualRCCompletionStatus,
          [args.timestamp, args.assetId]
        );
        console.log("Updating DB got this: ", result);
        // }
      } else {
        console.log("No asset found with active action nothing done..!");
      }
    } catch (err) {
      console.error(err);
      await client.end();
      await pgWrite.end();
      throw new Error("Error in updateCommandStatus..!!", err);
    }
  }

  async removeS3Object(args, client, file, asset) {
    console.log("Inside removeS3Object..!", args, file, asset);
    const currentStatus = await this.getCurrentStatus(args, client, asset);
    console.log("currentStatus: ", currentStatus);
    const fileData = this.getS3BucketAndFileName(asset);
    if (currentStatus.reporting === "ONLINE" && file) {
      console.log("INSIDE");
      file.commands = file.commands.filter(function (command) {
        return command.asset_id !== asset.snapAddress;
      });
    }
    if (file) {
      console.log("Uploading new file: ", file);
      await this.uploadS3Object(fileData.bucket, fileData.filePath, file);
    } else {
      console.log("File is null, not uploading..!");
    }
  }

  async uploadS3Object(bucket, key, file) {
    await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(file),
      })
      .promise();
  }

  async getCurrentStatus(args, client, asset) {
    const query = db.getCurrentStatus;

    const result = await client.query(query, [args.assetId]);

    return result.rows[0];
  }

  async getAssetDetails(assetId, client) {
    const query = db.getAssetDetails;
    let result = await client.query(query, [assetId]);

    console.log("Result is: ", result.rows);

    if (result.rows.length) {
      result = result.rows[0];
      const response = {
        ncAssetId: result.nc_asset_id,
        principalId: result.principal_id,
        rowId: result.row_id,
        name: result.name,
        commanded_state: result.commanded_state,
        snapAddress: result.snap_addr.reduce(
          (str, c) => str + c.toString(16).padStart(2, "0"),
          ""
        ),
      };

      return response;
    } else {
      return null;
    }
  }

  async getS3Object(bucket, key) {
    try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        });
        const obj = await s3.send(command);

      return JSON.parse(obj.Body.toString());
    } catch (error) {
      return null;
    }
  }

  getS3BucketAndFileName(asset) {
    const fileName = "row-cmds-" + asset.ncAssetId + ".json";
    const filePath = process.env.INDIVIDUAL_RC_CMD_FOLDER + "/" + fileName;
    const bucket = "ts-row-controller-commands";

    return { filePath, bucket };
  }

  async updatePresetActions(client, pgWrite, args) {
    console.log("updatePresetActions called with: ", args);
    let result = await client.query(db.getAssetCommand, [args.asset_id]);

    console.log("Got following data after querying DB: ", result.rows);

    if (result.rows.length) {
      result = result.rows[0];
      if (
        (result.individual_rc_cmd_state === 5 &&
          args.panel_index === result.individual_rc_param) ||
        (result.individual_rc_cmd_state === 1 && args.panel_command_state === 1)
      ) {
        console.log("Marking status as completed..!");
        result = await pgWrite.query(db.updateIndividualRCCompletionStatus, [
          args.asset_id,
        ]);
      }
    }
  }
}
exports.individualRCAlertService = new IndividualRCAlertService();
