require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';
const helper = require('../../utils/helpers/functions');
const { AwsConfig } = require('../../utils/lib/aws');

helper.readFileAsync = (filename) => {
  return fs.readFile(__dirname + '/../' + filename);
};

const remoteCacheClient = require('../../utils/cache/remoteCacheClient');
const inMemoryCache = require('./inMemoryCache');
const distributedLockImpl = require('../../utils/lib/distributedLockImpl');
const inMemoryLock = require('./inMemoryLock');

// override remote redis lock with a local implementation
// for testing purposes
distributedLockImpl.getInstance = inMemoryLock.getInstance;

// use an in memory copy of cache instead of a remote redis instance
remoteCacheClient.getCacheClient = inMemoryCache.getCacheClient;
remoteCacheClient.getPublisherClient = inMemoryCache.getCacheClient;
remoteCacheClient.getSubscriberClient = inMemoryCache.getCacheClient;

// const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');
const protobuf = require("protobufjs");
const { handler } = require("../../index");
const { site, aws } = require('./testData');
const nock = require('nock');
const fs = require('fs').promises;
const testPg = require('../common/testPg');

const { getChargerByAssetId } = require('../../models/charger.model');
const { getBatteryBySnapAddr } = require('../../models/battery.model');

// const { getEncodedPayload } = require('./cloudUpdateGenerator');

const encodePayload = async (cloudUpdate) => {
  return new Promise((resolve, reject) => {
    protobuf.load("./protobuf/terrasmart_cloud.proto", (err, root) => {
      if (err) {
        return reject(err);
      }

      const CloudUpdates = root.lookupType("terrasmart.cloud.CloudUpdates");

      const errMsg = CloudUpdates.verify(cloudUpdate);
      if (errMsg) {
        return reject(errMsg);
      }

      const message = CloudUpdates.create(cloudUpdate);
      const buffer = CloudUpdates.encode(message).finish();
      // const hex = buffer.toString('hex');

      // const decoded = CloudUpdates.decode(buffer);
      // console.info(CloudUpdates.toObject(decoded));
      const str = buffer.toString('base64');
      resolve(str);
    });
  })
}

const invokeLambda = async (cloudUpdates, params = null, sqs=false) => {
  try {
    if (!params) {
      params = site;
    }

    const payload = await encodePayload({
      ncSnapAddr: params.nc_snap_addr_b64,
      ...cloudUpdates
    });
    // const payload = await getEncodedPayload({ 
    //   ncSnapAddr: params.nc_snap_addr,
    //   ...cloudUpdates 
    // });
    // console.log('payload.. ', payload);
    const event = {
      payload,
      topic: "cloud-dev/updates",
      clientId: params.nc_snap_addr,
      principal: params.aws_iot_principal_id
    };

    const context = {
      awsRequestId: uuidv4()
    }

    if(sqs) {
      const sqsEvent = {
        messageId: aws.sqsMessageId,
        body: JSON.stringify(event),
        receiptHandle: aws.sqsReceiptHandle,
        attributes: {
          ApproximateReceiveCount: "1",
          SentTimestamp: "1688984347631",
          SenderId: 'AROA4M64A7NMRDOLVRJRW:2rJXDrhB',
          ApproximateFirstReceiveTimestamp: '1688984347633'
        },
        messageAttributes : {},
        md5OfBody: "5403fc9bd648bc198777fb18b54749c0",
        eventSource: 'aws:sqs',
        eventSourceARN: `arn:aws:sqs:${AwsConfig.awsRegion}:${AwsConfig.awsAccountId}:${aws.lambdaTriggerQueueName}`,
        awsRegion: AwsConfig.awsRegion
      } 
      const result = await handler({ Records: [ sqsEvent ]}, context);
      console.info("lambda invoke result", result);
      return result;
    } else {
      const result = await handler(event, context);
      console.info("lambda invoke result", result);
      return result;  
    }
  } catch (err) {
    console.error("lambda invoke error", err);
    return err;
  }
}

const removeAsset = async (snapAddr, assetId) => {
  await testPg.removePanel(snapAddr);
  await testPg.removeRadioInfo(snapAddr);

  const battery = await getBatteryBySnapAddr(snapAddr);

  const charger = await getChargerByAssetId(assetId);

  if (battery && charger) {
    await testPg.removeChargerBatteryLink(charger.id, battery.id);
  }

  if (charger) {
    await testPg.removeCharger(assetId);
  }

  if (battery) {
    await testPg.removeBattery(snapAddr);
  }

  await testPg.removeRowController(assetId);
  await testPg.removeRack(snapAddr);
  await testPg.removeMotor(snapAddr);

  await testPg.removeAsset(snapAddr);

  await testPg.removeAssetConf(snapAddr);
}

const removeNetworkController = async (snapAddr, assetId) => {

  await testPg.removeNetworkControllerByAssetId(assetId);

  await removeAsset(snapAddr, assetId);
}

const init = async () => {
  // reseting cache
  inMemoryCache.getCacheClient().flushallAsync();
  nock.cleanAll();
}

module.exports = {
  init,
  invokeLambda,
  removeAsset,
  removeNetworkController
}
