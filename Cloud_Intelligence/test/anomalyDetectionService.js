process.env.NODE_ENV = "test";

const {
  anomalyDetectionService
} = require("../services/anomalyDetectionService");
const moment = require("moment");
var assert = require("assert");
const { Client } = require("pg");
const { pgConfig, pgMasterConfig } = require("../pg");
/*
describe("AnomalyDetection Service", () => {
  let payload;

  before(() => {
    payload = {
      channel: "anomaly_detection",
      asset_id: "e3de00e8-68ed-4a78-a752-982932a3b699",
      timestamp: moment.utc().format(),
      result: {
        current_value: 83,
        current_anomaly_state: "Failed",
        threshold: 83.86666666666667
      },
      detection_type: "poc_wakeup",
      last_anomaly_state: "Passed"
    };
  });
  it("Fail when adding poc_wakeup anomaly", async () => {
    const client = new Client(pgConfig);
    const pgWrite = new Client(pgMasterConfig);
    return await anomalyDetectionService
      .handler(client, pgWrite, payload)
      .then(res => {
        //assert("Asset Not Found" === res);
        return res;
      })
      .catch(err => {
        console.log("Error in test.. ", err);
        return err;
      });
  });

  before(() => {
    payload = {
      channel: "anomaly_detection",
      asset_id: "e3de00e8-68ed-4a78-a752-982932a3b699",
      timestamp: moment.utc().format(),
      result: {
        current_value: 60,
        current_anomaly_state: "Passed",
        threshold: 15
      },
      detection_type: "poc_wakeup",
      last_anomaly_state: "Failed"
    };
  });
  it("Fail when clearing poc_wakeup anomaly", async () => {
    const client = new Client(pgConfig);
    const pgWrite = new Client(pgMasterConfig);
    return await anomalyDetectionService
      .handler(client, pgWrite, payload)
      .then(res => {
        //assert("Asset Not Found" === res);
        return res;
      })
      .catch(err => {
        console.log("Error in test.. ", err);
        return err;
      });
  });

  //For row angle anomaly ____________________________-
  /*
  before(() => {
    payload = {
      channel: "anomaly_detection",
      asset_id: "e3de00e8-68ed-4a78-a752-982932a3b699",
      timestamp: moment.utc().format(),
      result: {
        current_value: 10,
        current_anomaly_state: "Failed",
        threshold: 15
      },
      detection_type: "current_angle",
      last_anomaly_state: "Passed"
    };
  });
  it("Fail when adding current_angle anomaly", async () => {
    const client = new Client(pgConfig);
    const pgWrite = new Client(pgMasterConfig);
    return await anomalyDetectionService
      .handler(client, pgWrite, payload)
      .then(res => {
        //assert("Asset Not Found" === res);
        return res;
      })
      .catch(err => {
        console.log("Error in test.. ", err);
        return err;
      });
  });

  before(() => {
    payload = {
      channel: "anomaly_detection",
      asset_id: "e3de00e8-68ed-4a78-a752-982932a3b699",
      timestamp: moment.utc().format(),
      result: {
        current_value: 83,
        current_anomaly_state: "Passed",
        threshold: 83.86666666666667
      },
      detection_type: "current_angle",
      last_anomaly_state: "Failed"
    };
  });
  it("Fail when clearing current_angle anomaly", async () => {
    const client = new Client(pgConfig);
    const pgWrite = new Client(pgMasterConfig);
    return await anomalyDetectionService
      .handler(client, pgWrite, payload)
      .then(res => {
        //assert("Asset Not Found" === res);
        return res;
      })
      .catch(err => {
        console.log("Error in test.. ", err);
        return err;
      });
  });*/
// });
