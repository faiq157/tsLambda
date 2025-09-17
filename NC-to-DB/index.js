const awsLib = require('./utils/lib/aws');
const { createContext, destroyContext } = require('./utils/lib/context');
const networkController = require("./models/network.controller.model");
const { remoteCacheHelper } = require("./utils/cache/remoteCacheHelper");
const terrasmart_cloud_pb = require("./protobuf/terrasmart_cloud_pb");
const services = require("./processServices");
const {assetHistoryCombineUpdateService} = require("./services/assetHistoryCombineUpdateService");
// const services = require("./services");
// const { INVALID_SNAP_ADDR } = require("./utils/constants");
const helpers = require("./utils/helpers/functions");

const processEvent = async (event, context) => {

  const { principal: principalId, payload, clientId, topic } = event;
  const { awsRequestId: requestId } = context;

  try {
    console.log("event", JSON.stringify({ clientId, principalId, topic, event, requestId }));

    // TODO: REVERT THESE
    // THESE ARE ONYL FOR TESTIOT.JS FILE
    const obj = JSON.parse(Buffer.from(event.payload, "base64").toString("utf8"));
    const protobufBuf = Buffer.from(Object.values(obj.payload));
    const cloudUpdatesPb = terrasmart_cloud_pb.CloudUpdates.deserializeBinary(protobufBuf);

    const snapAddrAsU8 = cloudUpdatesPb.getNcSnapAddr_asU8();
    const ncSnapAddr = helpers.getSnapAddr(snapAddrAsU8);

    const cloudUpdatesObject = cloudUpdatesPb.toObject();
    const decodedUpdate = helpers.formatCloudUpdate(cloudUpdatesObject);

    console.log("cloudUpdates:", JSON.stringify(decodedUpdate));

    if (await remoteCacheHelper.verifyDuplicate(event)) {
      console.warn("duplicate message ignoring processing");
      return true;
    }

    // if(ncSnapAddr === INVALID_SNAP_ADDR) {
    //   console.warn("invalid nc snap address, ignoring processing");
    //   return true;
    // }

    const netCtrl = await networkController.getOrCreateNetworkController(ncSnapAddr, principalId, clientId);
    if (!netCtrl) {
      throw new Error("unable to get nc details");
    }

    console.log("nc details:", JSON.stringify(netCtrl));

    // const cloudUpdates = {
    //   nc_cloud_details: netCtrl || {},
    //   ...decodedUpdate
    // };

    await networkController.updateNetworkControllerLastActivity(netCtrl);

    event.netCtrlResults = { rows: [ netCtrl ] };

    const ncVersion = netCtrl.fw_version ? netCtrl.fw_version.trim() : '';

    await createContext({
      snapAddr: netCtrl.snap_addr,
      assetId: netCtrl.asset_id,
      siteId: netCtrl.site_id,
      ncId: netCtrl.id,
      requestId,
      principalId,
      ncVersion,
    });

    await assetHistoryCombineUpdateService.combineAssetHistoryInsertion(cloudUpdatesPb, event);
    const result = await services.handler(terrasmart_cloud_pb, event, cloudUpdatesPb);

    destroyContext();

    return result;
  } catch (err) {
    console.trace("Application ERROR:", err, payload);
    destroyContext();
    return err;
  }
};


// IOT Payload Sample
// {
//   "payload": "CgMb5AZyHQoDGaowEgwIpLivpQYQoKeH2AIdAACRQiUgWpFI",
//   "clientId": "1be406",
//   "topic": "cloud/updates",
//   "principal": "789bb1689a7beb66639b78329df7f5ef770d59893620cbe01cf7da490f59ad43"
// }

// SQS Payload Sample
// {
//   "Records": [
//     {
//       "messageId": "1ac216c9-b448-48a7-bf16-fd0cd3dc3d66",
//       "receiptHandle": "AQEBJBx+I+mEsLbqLQmDBh6XIxhskIoShNXmO1pN6Or3tbPbSG+fK7BBZPwIZ3jtUTqgqH1MdhitsyOSjc9yi+WQL8ocbskZlQR5eIsL2lYTnvodVsL3J8YB+Lqs7zDYMloFlt0E/sn5z1jPyv8MS7eqZX31lCFAee9cfQK7PdrfDjPtE55KUWJibux7KhbYKoFi8uDHJUOJIBS2Y/jUMzJ6B6nPwAt/PKuA7qKX/PRVcwxjGwiF/X6TSA2MvD+HGmDLwC6l7ekMvpk/j0L+zcmwnfuCnLe7xa9YNdnfpgrYfQfLySbDgk6BRrkvzhleB/D5jx/s8hPEKgn34A/68OROjIskfQrzXuRsZXyUYfx2aRtMA84M1ZtdcpjksP06PUKrheXjqFuPWKVBQ+yp2gq3gqAkns36z/sNh0CNF1bN9xY=",
//       "body": "{\"payload\":\"CgMOKsYqLAoDE7S4EiUVmpnZwB0AACDCIAYoATIMCJq2r6UGEOCunOgBQARIBV0AACDC6gEaCgMTtLgSDAiatq+lBhDIgtTpAT2amdnAQAE=\",\"topic\":\"cloud/updates\",\"principal\":\"17ee88d97ed69b3e128e18893f73f8372927e4f220014ab6223ae3e1508e6405\"}",
//       "attributes": {
//         "ApproximateReceiveCount": "1",
//         "SentTimestamp": "1688984347631",
//         "SenderId": "AROA4M64A7NMRDOLVRJRW:2rJXDrhB",
//         "ApproximateFirstReceiveTimestamp": "1688984347633"
//       },
//       "messageAttributes": {},
//       "md5OfBody": "5403fc9bd648bc198777fb18b54749c0",
//       "eventSource": "aws:sqs",
//       "eventSourceARN": "arn:aws:sqs:us-west-1:852475575129:dev-terratrak-cloud-updates",
//       "awsRegion": "us-west-1"
//     }
//   ]
// }
const handler = async (event, context) => {
  const { Records: records } = event;
  if(records) {
    const { eventSourceARN } = records[0];

    console.log('triggerd by', JSON.stringify({ records:records.length, trigger: 'sqs', arn: eventSourceARN }));

    const results = [];
    const entries = [];

    for(const record of records) {
      const { body, messageId, attributes, receiptHandle } = record;

      // console.log('sqs', JSON.stringify({ messageId, attributes }));

      try {
        if(attributes.ApproximateReceiveCount < 2) {
          const eventSqs = JSON.parse(body);
          const result = await processEvent(eventSqs, { awsRequestId : `${context.awsRequestId}-${messageId}` }); // Making sure context is unique for each message in sqs
          results.push(result);
        } else {
          console.warn('ignoring duplicate processing of message from queue', record);
        }
      } catch (ex) {
        results.push(ex);
      }

      entries.push({ messageId, receiptHandle });
    }

    await awsLib.removMessagesFromSQS(eventSourceARN, entries);

    return results;
  } else {
    console.log('triggerd by', JSON.stringify({ records: 1, tirgger: 'iot' }));
    return processEvent(event, context);
  }
}

// const getServiceName = (key) => {
//   const k = key.replace('get','').replace('List','');
//   return k.charAt(0).toLowerCase() + k.slice(1);
// }

// const processServices = async (cloudUpdatesPb) => {
//   const ignoreList = {
//     getNcSnapAddr: true,
//     getNcSnapAddr_asB64: true,
//     getNcSnapAddr_asU8: true,
//     getJsPbMessageId: true,
//     getExtension: true,
//   };

//   const pt = Object.getPrototypeOf(cloudUpdatesPb)
//   for (const key in pt) {
//     if(!key.startsWith('get') || ignoreList[key]) {
//       continue;
//     }

//     const update = cloudUpdatesPb[key]();
//     if(!update || (Array.isArray(update) && update.length === 0)) {
//       continue;
//     }

//     const serviceName = getServiceName(key);
//     console.log(key, serviceName);

//     if(Array.isArray(update)) {
//       for(const u of update) {
//         await processService(serviceName, u);
//       }
//     } else {
//       await processService(serviceName, update);
//     }
//   }
// }

// const processService = async (serviceName, update) => {
//   if(!services[serviceName]) {
//     console.error('service handler does not exist', JSON.stringify({serviceName}))
//     return;
//   }

//   ///
//   return services[serviceName].handler(update);
// }

module.exports = { handler };
