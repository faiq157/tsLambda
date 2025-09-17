const { getAWSAccountId } = require("../utils/lib/envVarProvider");

const event_ca = {
  Records: [
    {
      messageId: "94da8387-e06d-492c-9ad0-febb2dceeb17",
      receiptHandle:
        "AQEBmFU6B7SgcQtFoNiyZIYLgO2jk27KwDmO2OHFi9acfVq8hy/SzqsvexUm/smb5qmg3OytoeYshGdEQoBPeKuWl+3QivhMW231NkkG5H07x1DflgaO8aqnuWrxB4zH4wptaM3poV/AtzmLsFC081LsdJ8U5PiFBmfgVH6gDOiTYecKRmlpL/+3oqn1/L0HIj04tW+qMVG8OxhF2RkhgL6u9C4W6pwqNJGsKVHVjpqRwQB6NO/PMKwi58rQNos0SDJU4tOP9c6OjhvLdZ/lNoNry+Yyu95p7kSa70Kim7G/NT84zjob8ojlgYxJtoxj6ka0A2eHOQLGiRSj3YwuX6mBOdXEC9JhkHCtzSDQTVKjpBFF5nQUcOZ15oINY+SNGMZDpj9azReCJEWHEJB3UfKTZ0J+XFTjQQ9zZZqRkyzwL1E=",
      body: '{"type":"cloudwatch-es","channel":"rack_hist","network_controller_id":"66576c52-1b9b-4569-952f-5293453de68a","snap_addr":"1bec17","asset_id":"00000000-0000-0000-0000-0000001bec17","nc_snap_addr":"0e2ac6","site_id":"2c910382-2614-43e0-8a2a-123ed3535d92","device_type":"1d6e2838-8ac9-42f2-8418-778a95a27e75","timestamp":"2024-06-25T11:28:07.975Z","current_angle":10,"requested_angle":50,"tracking_status":2,"commanded_state":4,"commanded_state_detail":0,"panel_index":16,"panel_command_state":3,"motor_current":0}',
      md5OfMessageAttributes: "4d69588e1ac83d4e8b64ad791a9ba975",
      md5OfBody: "63c4346280546f26dabd8cfe2cb2f324",
      eventSource: "aws:sqs",
      eventSourceARN: `arn:aws:sqs:us-west-1:${getAWSAccountId()}:dev-terratrak-anomaly-detection`,
      awsRegion: "us-west-1",
    },
  ],
};

const event_poc = {
  Records: [
    {
      messageId: "94da8387-e06d-492c-9ad0-febb2dceeb17",
      receiptHandle:
        "AQEBmFU6B7SgcQtFoNiyZIYLgO2jk27KwDmO2OHFi9acfVq8hy/SzqsvexUm/smb5qmg3OytoeYshGdEQoBPeKuWl+3QivhMW231NkkG5H07x1DflgaO8aqnuWrxB4zH4wptaM3poV/AtzmLsFC081LsdJ8U5PiFBmfgVH6gDOiTYecKRmlpL/+3oqn1/L0HIj04tW+qMVG8OxhF2RkhgL6u9C4W6pwqNJGsKVHVjpqRwQB6NO/PMKwi58rQNos0SDJU4tOP9c6OjhvLdZ/lNoNry+Yyu95p7kSa70Kim7G/NT84zjob8ojlgYxJtoxj6ka0A2eHOQLGiRSj3YwuX6mBOdXEC9JhkHCtzSDQTVKjpBFF5nQUcOZ15oINY+SNGMZDpj9azReCJEWHEJB3UfKTZ0J+XFTjQQ9zZZqRkyzwL1E=",
      body: '{"asset_id": "90d6b37f-ad86-4fb3-8496-c8fd2ff327b6","snap_addr": "1bec17","device_type": "1d6e2838-8ac9-42f2-8418-778a95a27e75","timestamp": "2024-06-25T11:28:07.975Z","voltage": 13.800000190734863,"current": 0.019999999552965164,"poc": 100,"poh": 100,"battery_temperature": 85.30000305175781,"heater_temperature": 84.5,"misc_status_bits": 0,"channel": "battery_hist","type": "elastic_search-1"}',
      md5OfMessageAttributes: "4d69588e1ac83d4e8b64ad791a9ba975",
      md5OfBody: "63c4346280546f26dabd8cfe2cb2f324",
      eventSource: "aws:sqs",
      eventSourceARN: `arn:aws:sqs:us-west-1:${getAWSAccountId()}:dev-terratrak-anomaly-detection`,
      awsRegion: "us-west-1",
    },
  ],
};

const context = {
  functionVersion: "$LATEST",
  functionName: "dev-terratrak-anomaly-detection",
  memoryLimitInMB: "128",
  logGroupName: "/aws/lambda/dev-terratrak-anomaly-detection",
  logStreamName: "2024/06/25/[$LATEST]55a6b39b56194cc88ffdf6207cd7a7ed",
  clientContext: undefined,
  identity: undefined,
  invokedFunctionArn: `arn:aws:lambda:us-west-1:${getAWSAccountId()}:function:dev-terratrak-anomaly-detection`,
  awsRequestId: "3052f0c3-7326-5ae5-a0b6-ae37df252920",
};

module.exports = {
  event_ca,
  event_poc,
  context,
};
