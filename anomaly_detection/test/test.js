const chai = require("chai");
const { expect } = chai;
const sinon = require("sinon");
const db = require("../utils/lib/db");
const loader = require("../index");
const moment = require("moment");
const { event_ca, event_poc, context } = require("./mockData");

// Example of Row Tracking

// {
//     "state": 1,         // Anomaly test result. 0 = anomaly, 1 = no anomaly
//     "asset_id": "a96300c9-61ca-4bdb-b933-5d84e3ed97d5",
//     "timestamp": "2021-10-14T06:31:03.288Z",    // Real-time data TS
//     "type": "current_angle",
//     "value": -7.5,
//     "@timestamp": "2021-10-14T06:31:03.114",    // Anomaly test execution time
//     "prediction_used": "2021-10-11T04:00:48Z",
//     "notified": 1                               // notified = state. Present if Notified to Cloud
// }

// Example of Battery POC

// {
//     "state": 1,       // Anomaly test result. 0 = anomaly, 1 = no anomaly, 2 = anomaly and expired, 3 = no anomaly and expired
//     "type": "poc",
//     "test": "Max",    // Max = Battery PM, Min = Battery AM
//     "asset_id": "cf86716f-0320-49b6-bf0e-9aed47b7a133",
//     "timestamp": "2021-10-13T12:36:45.882Z",    // Real-time data TS
//     "expiry": "2021-10-13T13:36:38Z",           // Expiry for this test
//     "value": 100,
//     "@timestamp": "2021-10-13T12:36:47.760",    // Anomaly test execution time
//     "prediction_used": "2021-10-09T07:40:48Z"
//   },

describe("Anomaly Detection", () => {
  let sandbox;

  beforeEach(() => (sandbox = sinon.createSandbox()));
  afterEach(() => sandbox.restore());
  after(async () => await db.closeDBPool());

  it("should detect anomaly for current_angle", async () => {
    const getExpiredPredictionsStub = sandbox.stub(db, "getMultiData");
    getExpiredPredictionsStub.resolves({
      prediction: {
        predictions: Array(144)
          .fill(40)
          .map((_, i) => Math.floor(Math.random() * 100)), // Generate an array of 144 random values between 0 and 20
        timestamp: moment().toISOString(),
        training_start_time: moment().subtract(7, "days").toISOString(), // 7 days ago
        wakeup_expiry: moment().add(60, "minutes").toISOString(), // 60 minutes from now
        wakeup_event: moment().subtract(1, "days").toISOString(), // 1 day ago
        ml_data: [1, 1],
        nighttime_stow: moment().subtract(2, "days").toISOString(), // 2 days ago
        nighttime_stow_expiry: moment().add(2, "days").toISOString(), // 2 days from now
        enable: true,
        predicted: true,
        // selected_day: moment().toISOString(), // Uncomment if needed
      },
      lastAnomaly: {},
      last_mode: {
        "asset.panel_commanded_state": 5,
        "asset.panel_index": 0,
        "asset.tracking_status": 2,
        "motor.avg_current": 0,
        "motor.current": 0,
        "motor.ending_current": 0,
        "motor.peak_current": 0,
        "motor.peak_inrush_current": 0,
        "rack.current_angle": 0,
        "rack.requested_angle": 0,
        timestamp: "2024-06-05T10:37:06.000Z",
        "tracking.mode": 2,
        "tracking.mode_detail": 10,
      },
    });

    await loader.handler(event_ca, context, false);

    const data = JSON.parse(event_ca.Records[0].body);

    const anomalies = await db.getAnomalies(
      data.asset_id,
      "current_angle",
      data.timestamp
    );

    const anomaly = anomalies[0];

    expect(anomaly.state === 1);
    expect(anomaly.type === "current_angle");
    expect(anomaly.timestamp === data.timestamp);
  });

  it("should detect anomaly for battery", async () => {
    const getMultiDataStub = sandbox.stub(db, "getMultiData");
    getMultiDataStub.resolves({
      prediction: {
        rval: 0,
        type: "poc",
        enable: true,
        expiry: moment().add(60, "minutes").toISOString(),
        nc_lat: 33.611366271972656,
        nc_lng: 73.17098236083984,
        ml_data: [1, 0],
        asset_id: "90d6b37f-ad86-4fb3-8496-c8fd2ff327b6",
        predicted: true,
        timestamp: moment().toISOString(),
        anomaly_cnt: 0,
        matched_cnt: 7,
        nc_asset_id: "17e039fa-f60f-4a21-80c3-6ed6931c128a",
        predictions: [92, 94],
        selected_day: moment().toISOString(),
        wakeup_event: moment().toISOString(),
        wakeup_expiry: moment().add(60, "minutes").toISOString(),
        nighttime_stow: "0",
        grp_matched_cnt: 7,
        pred_expiry_days: 14,
        event_expiry_mins: 60,
        training_threshold: 10,
        training_start_time: "0",
        anomaly_percent_threshold: 15,
        min_matched_for_selection: 3,
      },
      lastAnomaly: {},
      last_mode: {},
    });

    await loader.handler(event_poc, context, false);

    const data = JSON.parse(event_poc.Records[0].body);

    const anomalies = await db.getAnomalies(
      data.asset_id,
      "poc",
      data.timestamp
    );

    const anomaly = anomalies[0];

    expect(anomaly?.test === "Min");
    expect(anomaly.state === 2 || anomaly.state === 3);
    expect(anomaly.data.value === data.poc);
  });
});
