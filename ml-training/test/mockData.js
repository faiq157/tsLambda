const moment = require("moment");
const { getAWSAccountId } = require("../utils/lib/envVarProvider");

const event = {
  version: "0",
  id: "87fd546e-1333-4854-bb6d-0810660b5d71",
  "detail-type": "Scheduled Event",
  source: "aws.events",
  account: getAWSAccountId(),
  time: "2024-06-26T04:00:00Z",
  region: "us-west-1",
  resources: [`arn:aws:events:us-west-1:${getAWSAccountId()}:rule/dev-terratrak-hourly-ml-training`],
  detail: {},
};

const context = {
  functionVersion: "$LATEST",
  functionName: "dev-terratrak-ml-training",
  memoryLimitInMB: "128",
  logGroupName: "/aws/lambda/dev-terratrak-ml-training",
  logStreamName: "2024/06/14/[$LATEST]d5a6565622314f5285f90b69b79f7de5",
  clientContext: undefined,
  identity: undefined,
  invokedFunctionArn: `arn:aws:lambda:us-west-1:${getAWSAccountId()}:function:dev-terratrak-ml-training`,
  awsRequestId: "ceefd757-0eb5-46c5-8a4f-e8a5611f87b9",
  getRemainingTimeInMillis: () => 300000,
};

const expired_prediction_poc = [
  {
    id: 59,
    data: {
      type: "poc",
      enable: true,
      expiry: moment().subtract(1, "days").toISOString(),
      nc_lat: 33.611366271972656,
      nc_lng: 73.17098236083984,
      ml_data: [1, 0],
      asset_id: "90d6b37f-ad86-4fb3-8496-c8fd2ff327b6",
      predicted: false,
      timestamp: moment().subtract(7, "days").toISOString(),
      anomaly_cnt: 0,
      matched_cnt: 0,
      nc_asset_id: "17e039fa-f60f-4a21-80c3-6ed6931c128a",
      predictions: [],
      selected_day: moment().subtract(2, "days").toISOString(),
      wakeup_event: moment().add(1, "days").toISOString(),
      wakeup_expiry: moment().add(1, "days").toISOString(),
      nighttime_stow: "0",
      grp_matched_cnt: 0,
      pred_expiry_days: 14,
      event_expiry_mins: 60,
      training_threshold: 10,
      training_start_time: "0",
      anomaly_percent_threshold: 15,
      min_matched_for_selection: 3,
    },
  },
];

const expired_prediction_ca = [
  {
    id: 60,
    data: {
      type: "current_angle",
      enable: true,
      expiry: moment().subtract(1, "days").toISOString(),
      nc_lat: 33.611366271972656,
      nc_lng: 73.17098236083984,
      ml_data: [1, 0],
      asset_id: "90d6b37f-ad86-4fb3-8496-c8fd2ff327b6",
      // asset_id: "87fd546e-1333-4854-bb6d-0810660b5d71",
      predicted: false,
      timestamp: moment().subtract(7, "days").toISOString(),
      anomaly_cnt: 0,
      matched_cnt: 0,
      nc_asset_id: "17e039fa-f60f-4a21-80c3-6ed6931c128a",
      predictions: [],
      selected_day: moment().subtract(2, "days").toISOString(),
      wakeup_event: moment().add(1, "days").toISOString(),
      wakeup_expiry: moment().add(1, "days").toISOString(),
      nighttime_stow: "0",
      grp_matched_cnt: 0,
      pred_expiry_days: 14,
      event_expiry_mins: 60,
      training_threshold: 10,
      training_start_time: "0",
      anomaly_percent_threshold: 15,
      min_matched_for_selection: 3,
    },
  },
];

const getHistoryData_poc = (value = 90) => {
  const data = [];

  for (let i = 0; i < 8; i++) {
    const timestamp = moment().subtract(i, "days").toISOString();
    for (let j = 0; j < i + 2; j++) data.push({ timestamp, poc: value + j });
  }

  return data;
};

const getHistoryData_ca = (value = 90) => {
  const data = [];

  for (let i = 0; i < 30; i++) {
    const startOfDay = moment().subtract(i, "days").startOf("day");
    for (let j = 0; j < 36; j++) {
      const timestamp = startOfDay
        .clone()
        .add(j * 40, "minutes")
        .toISOString();
      data.push({ timestamp, current_angle: value + Math.random() * 20 }); // Adding variability
    }
  }

  return data;
};

// Given the updated function, the historical data is generated for every 40 minutes interval, creating 36 data points per day. Despite having high selections of matched data, the predictions may not be returned due to several reasons:

// Threshold for min_matched_for_selection: If the number of matched days does not meet the threshold defined by min_matched_for_selection, the function will not return predictions.
// Anomaly Count: If the anomaly count is not zero or below a certain threshold, the function may not return predictions.
// Date Comparisons: The selected prediction date may fail the comparison checks, such as being too far back in time compared to the latest date.
// Variability in Data: Even with added variability, the data may not sufficiently trigger the logic for prediction.

const history_poc = getHistoryData_poc(90);
const history_ca = getHistoryData_ca(90);

const anomaly_data = [];

const prediction_result_poc = {
  predicted: true,
  anomaly_cnt: 0,
  matched_cnt: 7,
  grp_matched_cnt: 7,
  predictions: [92, 94],
  min_matched_for_selection: 3,
  // selected_day: moment().subtract(2, "days").toISOString(),
  ml_data: [1, 0],
  asset_id: "90d6b37f-ad86-4fb3-8496-c8fd2ff327b6",
  type: "poc",
  enable: true,
  training_start_time: "0",
  // expiry: moment().add(14, "days").toISOString(),
  // timestamp: moment().subtract(1, "days").toISOString(),
};

const prediction_result_ca = {
  predicted: true,
  anomaly_cnt: 0,
  matched_cnt: 7,
  grp_matched_cnt: 7,
  predictions: [null, null],
  min_matched_for_selection: 3,
  // selected_day: moment().subtract(2, "days").toISOString(),
  ml_data: [1, 0],
  asset_id: "90d6b37f-ad86-4fb3-8496-c8fd2ff327b6",
  type: "current_angle",
  enable: true,
  training_start_time: "0",
  // expiry: moment().add(14, "days").toISOString(),
  // timestamp: moment().subtract(1, "days").toISOString(),
};

module.exports = {
  event,
  context,
  expired_prediction_poc,
  expired_prediction_ca,
  history_poc,
  history_ca,
  anomaly_data,
  prediction_result_poc,
  prediction_result_ca,
};
