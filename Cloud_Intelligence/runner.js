require('dotenv').config();
const loader = require("./index");

function getCurrentTimestamp() {
  const currentDate = new Date();
  const currentTimestamp = currentDate.toISOString();

  return currentTimestamp;
}

const weather_forecast = {
  channel: 'local_weather_hourly_alarms',
  timestamp: '2021-07-26T17:59:43Z',
  prj_data: {
    id: '673de108-169d-4fe8-b1db-1f85d2c37fff',
    name: 'NC_Project',
    location_lat: 33.6643981933594,
    location_lng: 73.0522994995117,
    wind_speed_threshold: 19,
    gust_threshold: 40,
    snow_depth_threshold: 47,
    enable_weather_forecast_stow: true,
    enable_weather_alert_stow: true,
    enable_weather_forecast_notification: true,
    weather_forecast_stow_prior_time: 5,
    weather_forecast_stow_after_time: 3,
    weather_forecast_notification_threshold: 100,
    enable_weather_forecast: true
  },
  stow_type: 'Weather_Forecast-Deep_Snow',
  start: { when: '2021-07-26T06:00:00Z', value: 53, threshold: 47 },
  end: { when: '2021-07-27T15:20:00Z', value: 17, threshold: 47 },
  next: null,
  type: 'elastic_search-1',
  hide_at_project_level: true,
  site_data: { id: '1e137ebc-9394-4ed0-9365-23c9875d25ed' }
};
const weather_alert_forecast = {
  channel: 'local_weather_alerts_alarms',
  timestamp: "2021-07-30T12:16:12Z",
  prj_data: {
    id: "673de108-169d-4fe8-b1db-1f85d2c37fff",
    location_lat: 33.6643981933594,
    location_lng: 73.0522994995117,
    name: "NC_Project",
    wind_speed_threshold: 15,
    gust_threshold: 40,
    snow_depth_threshold: 50,
    enable_weather_forecast: true,
    enable_weather_forecast_stow: true,
    enable_weather_alert_stow: true,
    enable_weather_forecast_notification: true,
    weather_forecast_stow_prior_time: 5,
    weather_forecast_stow_after_time: 10,
    weather_forecast_notification_threshold: 100
  },
  stow_type: "Weather_Forecast_Alert-High_Wind_Warn",
  start: {
    when: "2021-07-30T12:00:00Z"
  },
  end: {
    when: "2021-07-30T20:00:00Z"
  },
  next: null,
  text: "...HIGH WIND WATCH IN EFFECT FROM SUNDAY MORNING THROUGH SUNDAY\nAFTERNOON...\n\n* WHAT...West winds 30 to 40 mph with gusts up to 60 mph\n possible.\n\n* WHERE...Portions of central, north central and west central\n Montana.\n\n* WHEN...From Sunday morning through Sunday afternoon.\n\n* IMPACTS...Travel will be difficult for high profile vehicles and\n those pulling trailers. A few local power outages are possible.\n\nPRECAUTIONARY/PREPAREDNESS ACTIONS...\n\nMonitor the latest forecasts and warnings for updates on this\nsituation. Fasten loose objects or shelter objects in a safe\nlocation prior to the onset of winds.\n\n&&",
  type: 'elastic_search-1',
  hide_at_project_level: false,
  site_data: { id: '1e137ebc-9394-4ed0-9365-23c9875d25ed' }
};

const weather_snow_stow = {
  channel: 'local_weather_stow_alarms',
  timestamp: '2021-07-26T17:59:44Z',
  start: { when: '2021-07-26T05:55:00Z' },
  end: { when: '2021-07-27T11:23:00Z' },
  alarm: {
    timestamp: '2021-07-26T20:59:43Z',
    prj_data: {
      id: '673de108-169d-4fe8-b1db-1f85d2c37fff',
      name: 'NC_Project',
      location_lat: 33.6643981933594,
      location_lng: 73.0522994995117,
      wind_speed_threshold: 19,
      gust_threshold: 40,
      snow_depth_threshold: 47,
      enable_weather_forecast_stow: true,
      enable_weather_alert_stow: true,
      enable_weather_forecast_notification: true,
      weather_forecast_stow_prior_time: 5,
      weather_forecast_stow_after_time: 3,
      weather_forecast_notification_threshold: 100,
      enable_weather_forecast: true
    },
    stow_type: 'Weather_Forecast-Deep_Snow',
    start: { when: '2021-07-26T06:00:00Z', value: 53, threshold: 47 },
    end: { when: '2021-07-27T11:20:00Z', value: 17, threshold: 47 },
    next: null,
    hide_at_project_level: true
  },
  next: null,
  type: 'elastic_search-1',
  site_data: { id: '5dfe0df4-78a4-4522-b555-3d26798f6f54' }
};
const weather_stow_alarm = {
  "channel": "local_weather_stow_alarms",
  "timestamp": "2021-07-14T18:16:14Z",
  "start": {
    "when": "2021-07-08T11:55:00Z"
  },
  "end": {
    "when": "2021-07-15T19:10:00Z"
  },
  "alarm": {
    "timestamp": "2021-07-14T18:16:12Z",
    "prj_data": {
      "id": "673de108-169d-4fe8-b1db-1f85d2c37fff",
      "location_lat": 33.6643981933594,
      "location_lng": 73.0522994995117,
      "name": "NC_Project",
      "wind_speed_threshold": 15,
      "gust_threshold": 40,
      "snow_depth_threshold": 50,
      "enable_weather_forecast": true,
      "enable_weather_forecast_stow": true,
      "enable_weather_alert_stow": true,
      "enable_weather_forecast_notification": true,
      "weather_forecast_stow_prior_time": 5,
      "weather_forecast_stow_after_time": 10,
      "weather_forecast_notification_threshold": 100,
      "active": true,
      "state": 12
    },
    "stow_type": "Weather_Forecast_Alert-High_Wind_Warn",
    "start": {
      "when": "2021-07-08T12:00:00Z"
    },
    "end": {
      "when": "2021-07-14T20:00:00Z"
    },
    "next": null,
    "text": "...HIGH WIND WATCH IN EFFECT FROM SUNDAY MORNING THROUGH SUNDAY\nAFTERNOON...\n\n* WHAT...West winds 30 to 40 mph with gusts up to 60 mph\n possible.\n\n* WHERE...Portions of central, north central and west central\n Montana.\n\n* WHEN...From Sunday morning through Sunday afternoon.\n\n* IMPACTS...Travel will be difficult for high profile vehicles and\n those pulling trailers. A few local power outages are possible.\n\nPRECAUTIONARY/PREPAREDNESS ACTIONS...\n\nMonitor the latest forecasts and warnings for updates on this\nsituation. Fasten loose objects or shelter objects in a safe\nlocation prior to the onset of winds.\n\n&&",
    hide_at_project_level: false
  },
  "next": null,
  "type": "elastic_search-1",
  "site_data": {
    "id": "5dfe0df4-78a4-4522-b555-3d26798f6f54"
  }
};

const nc_state = {
  asset_id: '0384195d-d0bc-403e-9272-b5bd63dbe683',
  timestamp: '2021-10-06T06:40:31.605Z',
  commanded_state: 4,
  commanded_state_detail: 0,
  network_controller_id: '6bb3ced8-b9f1-455b-bc6e-aa4f9168b8ee',
  type: 'elastic_search-1',
  channel: 'tracking_command_hist'
}

const snow_shedding_report = {
  "type": "elastic_search-1",
  "channel": "snow_shedding_report",
  "network_controller_id": "da6b4184-9495-4126-a5eb-16b721a298d1",
  "snap_addr": "0e2bf9",
  "asset_id": "00000000-0000-0000-0000-0000000e2bf9",
  "nc_snap_addr": "0e2bf9",
  "site_id": "aff8886f-c20a-4d28-82b6-509069ce1710",
  "timestamp": "2023-01-04T08:20:34.620Z",
  "reportDetail": "{\"snow_shedding_report.failed\":[{\"snap_address\":\"13b4aa\",\"row_id\":5}],\"snow_shedding_report.unresponsive\":[{\"snap_address\":\"13b4b8\",\"row_id\":4},{\"snap_address\":\"13b4c3\",\"row_id\":6}]}"
}
const snow_shedding_report_1 = {
  type: "elastic_search-1",
  channel: "snow_shedding_report",
  network_controller_id: "e177ebd3-a357-4ff7-9149-248b11bc52ec",
  snap_addr: "0a1ba4",
  asset_id: "481ee11b-45c3-476e-9b1f-1f1430b95b9f",
  nc_snap_addr: "0a1ba4",
  site_id: "07c843f4-0a19-4274-aa54-72f3242c53fd",
  timestamp: "2023-01-24T10:48:07.000Z",
  reportDetail: "{\"snow_shedding_report.delayed\":true,\"snow_shedding_report.completed\":[{\"snap_address\":\"0ac44f\",\"row_id\":null}],\"snow_shedding_report.retried\":[{\"snap_address\":\"0ac44f\",\"row_id\":null}],\"snow_shedding_report.retried_frequency\":[0],\"snow_shedding_report.failed\":[{\"snap_address\":\"0ac44f\",\"row_id\":null}],\"snow_shedding_report.unresponsive\":[{\"snap_address\":\"0ac44f\",\"row_id\":null}]}",
}

const snow_shedding = {
  "type": "elastic_search-1", "channel": "snow_shedding", "network_controller_id": "91ce1290-a774-4bde-aa9d-4338c5ac6b49", "snap_addr": "13b51e", "asset_id": "00000000-0000-0000-0000-00000013b51e", "nc_snap_addr": "19b155", "site_id": "46897a78-f4e5-4c94-8eb1-abb88a1048e8", "timestamp": "2023-01-19T07:59:29.995Z", "snow_shedding.depth": 8.26771627730272, "snow_shedding.baseline": 0.39370077860167646, "snow_shedding.snow_on_ground_now": 0.39370077860167646, "snow_shedding.estimate": 0, "snow_shedding.trigger": 4.330708637950927, "snow_shedding.threshold": 3.937007932681737, "snow_shedding.active": false, "snow_shedding.last_snow_shedding": "1674040980", "snow_shedding.state": 2, "nc_asset_id": "481ee11b-45c3-476e-9b1f-1f1430b95b9f"
};
const machine_learning = {
  channel: 'machine_learning',
  asset_id: '00000000-0000-0000-0000-00000013b4b8',
  timestamp: '2023-03-09T07:50:47Z',
  ml_type: 'poc',
  next_due_date: '2023-03-13T07:50:47Z',
  success: true,
  type: 'elastic_search-1'
}

const weather_stow = {
  asset_id: '432fe7dc-fae8-49f2-b1d0-16cdc84bda1d',
  asset_name: 'Inverter 1: WX 1',
  device_type_id: '14182d37-accb-4752-8558-ea874bee2e24',
  timestamp: '2023-04-03T20:29:42.120Z',
  stow_type: 2,
  stow_value: 12.899999618530273,
  stow_threshold: 10,
  stow_lower_threshold: 0,
  type: 'elastic_search-1',
  channel: 'weather_stow_updates'
}

const weather_stow_clear = {
  asset_id: '68e3ef6e-2e8b-42ed-b93b-5c81c0135a68', //NC asset id
  asset_name: 'Network Controller',
  device_type_id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',
  timestamp: '2023-04-03T20:30:42.120Z',
  stow_type: 22,
  stow_value: 0,
  stow_threshold: 10,
  stow_lower_threshold: 0,
  type: 'elastic_search-1',
  channel: 'weather_stow_updates'
}

const assetConnectionHist = {
  asset_id: '00000000-0000-0000-0000-0000001bebe7',
  connected_state: 'QC FASTTRAK',
  last_connected: '2023-07-06T05:47:27.271Z',
  last_disconnected: null,
  last_cloud_update: null,
  last_asset_update: getCurrentTimestamp(),
  created: getCurrentTimestamp(),
  snap_addr: '1bebe7',
  channel: 'asset_connection_hist',
  timestamp: '2023-07-06T05:47:27.271Z',
  last_asset_updated: getCurrentTimestamp(),
  type: 'elastic_search-1',
  nc_snap_addr: "",
  site_id :"2c910382-2614-43e0-8a2a-123ed3535d92",
  status_bits: "",
}

const local_weather_nc_stow_update = {
  "type": "elastic_search-1",
  "channel": "local_weather_nc_stow_update",
  "network_controller_id": "b607e7cd-b19c-4bc0-8b20-e1713225ac66",
  "snap_addr": "15c564",
  "asset_id": "ce837d20-1130-4bcf-aaed-424520b87a57",
  "nc_snap_addr": "15c564",
  "site_id": "d2b0ec43-aa11-4f63-b214-66440fa7b336",
  "timestamp": "2023-08-02T10:09:21.751Z",
  "need_accu_weather_update": true,
  "accu_stow": false,
  "stow_type": "deep_snow",
  "stow_start_time": "2023-08-02T10:09:21z",
  "stow_end_time": "2023-08-02T10:07:05z",
  "error_code": 0
}


var event = {
  Records: [
    // {
    //   messageId: "fab1be02-bea2-4c10-a756-48e17555903e",
    //   receiptHandle:
    //     "AQEBPppJVgl3rXkQ6tbbLSeopsVj2CTEU+eOxyd+FjCIcNHEMabXShmnM3M8FKX/wlAiDyLISRfrZ2EDDYAC9LNvP85xsdlMOFwyKsAMq0IfUdqDVg/e6Hk9skR/jSU9fMQ+bqWlssq7u65Q9AAHY8vXmZQ/AuxjtQdUhZ2ns7CBIRYgAYtuoGnXIo9YAIPencHBr6cPVhPcFjpuuoS/T7Boveo8Mhx6Yl9wBya9sabhiMtWAm9gpqWuu7v7FXxU1jTh83kGn9kLfqk1ACluYvaPoiGiJFGyY/T6SLrEx32axU7L4cVa5bXDsKA/vRoTbtzHIAnddRbaSF+eRyHy0KZ99gTzURYXtoASKSh7dtQPStw24kG9LcKs/MbDYdV0u0QiKnHM5lNmQSezgvh9yoGWwQ==",
    //   body:
        // '{"asset_id":"00000000-0000-0000-0000-0000001bebe7","snap_addr":"1bebe7","timestamp":"2023-11-16T18:53:06.408Z","current":0.019999999552965164,"voltage":13.899999618530273,"poc":26,"poh":100,"battery_temperature":66.5,"heater_temperature":68.30000305175781,"type":"elastic_search-1","channel":"battery_hist"}',
    //   attributes: [Object],
    //   messageAttributes: [Object],
    //   md5OfBody: "68fe91bdd6a7cd49dd9f0f4d199e7e82",
    //   md5OfMessageAttributes: "4d69588e1ac83d4e8b64ad791a9ba975",
    //   eventSource: "aws:sqs",
    //   eventSourceARN: "arn:aws:sqs:us-east-2:852475575129:Terra_track_emails",
    //   awsRegion: "us-east-2"
    // },
    {
      messageId: "fab1be02-bea2-4c10-a756-48e17555903e",
      receiptHandle:
        "AQEBPppJVgl3rXkQ6tbbLSeopsVj2CTEU+eOxyd+FjCIcNHEMabXShmnM3M8FKX/wlAiDyLISRfrZ2EDDYAC9LNvP85xsdlMOFwyKsAMq0IfUdqDVg/e6Hk9skR/jSU9fMQ+bqWlssq7u65Q9AAHY8vXmZQ/AuxjtQdUhZ2ns7CBIRYgAYtuoGnXIo9YAIPencHBr6cPVhPcFjpuuoS/T7Boveo8Mhx6Yl9wBya9sabhiMtWAm9gpqWuu7v7FXxU1jTh83kGn9kLfqk1ACluYvaPoiGiJFGyY/T6SLrEx32axU7L4cVa5bXDsKA/vRoTbtzHIAnddRbaSF+eRyHy0KZ99gTzURYXtoASKSh7dtQPStw24kG9LcKs/MbDYdV0u0QiKnHM5lNmQSezgvh9yoGWwQ==",
      Sns: {
        Message: '{"wake_up_time":"11286","timestamp":"2025-09-25T06:44:42.320Z","network_controller_id":"da74ab50-58b3-4b80-8a1d-c2789e4efea8","asset_id":"23d41cbb-08ad-4a72-9011-9a3c1a233b6c","name":"Mars Hill NC","type":"elastic_search-1","channel":"network_controller_sleep_event","nc_snap_addr":"1be440","site_id":"fa28b5e0-ec4c-42b2-916e-ccaec5d2f3c7"}'
        // '{"fwVersion":"2.5.1","nccbUptime":"274D 06:42:12","linuxUptime":"0D 00:00:54","applicationUptime":"0D 00:00:15","timestamp":"2025-09-24T20:36:33.120Z","network_controller_id":"79c66c4d-64f0-4999-a0e4-0168acae6c60","asset_id":"00000000-0000-0000-0000-0000001d50e0","name":"Canandaigua West NC","type":"elastic_search-1","channel":"network_controller_reboot_event","nc_snap_addr":"1d50e0","site_id":"b26e0795-7063-43d9-8adb-18ae12f7d2e1"}'
        // '{"channel":"local_weather_nc_online","timestamp":"2025-09-25T01:18:17.350Z","network_controller_id":"2eeb9f8a-efce-4493-b457-920535cc855e","type":"elastic_search-1"}'
        // '{"asset_id":"00000000-0000-0000-0000-000000260eb6","timestamp":"2025-09-25T01:03:07.490Z","reporting_NC":"7e30d570-ef66-450b-b75b-4bc584dbe433","registered_NC":"ab9648b6-b7e3-48f6-9d2d-c802ceb522b2","snap_addr":"260eb6","channel":"asset_wrong_reporting","type":"elastic_search-1","nc_snap_addr":"243702","site_id":"a68ccd12-1985-4ef9-bb54-1bbc883d6a46"}'
        // '{"asset_id":"00000000-0000-0000-0000-00000026057a","device_type":"1d6e2838-8ac9-42f2-8418-778a95a27e75","timestamp":"2025-09-25T06:39:23.904Z","panel_index":16,"panel_command_state":6,"type":"elastic_search-1","channel":"asset_preset_update","nc_snap_addr":"1d51e5","site_id":"89de5d4c-2c7b-443b-9c23-2ce566367955"}'
        // '{"timestamp":"2025-09-25T07:25:19.565Z","snapAddr":"13b4b8","stage":"FLAT","user_name":"Saad Saud","user_email":"saad.saud@zigron.com","siteMode":4,"type":"elastic_search-1","channel":"qc_update","nc_snap_addr":"19b09d","site_id":"86bf0d49-2df5-4dbe-82a1-0cafbe53ac31"}'
        // '{"timestamp":"2025-09-25T06:48:49.865Z","snapAddr":"","reportingType":1,"reportingFlag":0,"reportingValue":0,"reportingThreshold":15,"closePercentage":75,"network_controller_id":"910a93c2-b56d-4964-a143-0b36fefdf213","type":"elastic_search-1","channel":"increase_weather_reporting_update","nc_snap_addr":"209ca2","site_id":"2bbaa107-cd60-4fc6-b07a-6683d687fa87"}'
        // '{"type":"elastic_search-1","channel":"snow_shedding","network_controller_id":"910a93c2-b56d-4964-a143-0b36fefdf213","snap_addr":"209ca2","asset_id":"00000000-0000-0000-0000-000000209ca2","nc_snap_addr":"209ca2","site_id":"2bbaa107-cd60-4fc6-b07a-6683d687fa87","timestamp":"2025-09-25T07:22:31.690Z","nc_asset_id":"00000000-0000-0000-0000-000000209ca2","snow_shedding.depth":0,"snow_shedding.baseline":0,"snow_shedding.snow_on_ground_now":0,"snow_shedding.estimate":0,"snow_shedding.trigger":3.937007932681737,"snow_shedding.threshold":3.937007932681737,"snow_shedding.active":false,"snow_shedding.last_snow_shedding":946684800,"snow_shedding.state":1}'
        // '{"snap_addr": "13b51c","timestamp": "2021-07-06T11:10:33.908Z","nc_id": "6bb3ced8-b9f1-455b-bc6e-aa4f9168b8ee","modeStatus": true,"temperature_threshold":50,"daysHist":[50,45,60],"type": "elastic_search-1", "channel": "vegetation_update"}'
        // '{"channel":"battery_hist","asset_id":"00000000-0000-0000-0000-0000001bebe7","snap_addr":"1bebe7","timestamp":"2023-11-16T18:53:06.408Z","current":0.019999999552965164,"voltage":13.899999618530273,"poc":20,"poh":100,"battery_temperature":66.5,"heater_temperature":68.30000305175781,"type":"elastic_search-1","channel":"battery_hist"}',
          //"{'snap_addr': '13b51c','timestamp': '2021-07-06T11:10:33.908Z','nc_id': '8ea65d78-6e75-4b22-be07-16b81e72be0b','modeStatus': true,'temperature_threshold':50,'daysHist':[50,45,60],'type': 'elastic_search-1', 'channel': 'vegetation_update'}"
          // '{"snap_addr": "13b51c","timestamp": "2021-07-06T11:10:33.908Z","nc_id": "6bb3ced8-b9f1-455b-bc6e-aa4f9168b8ee","modeStatus": true,"temperature_threshold":50,"daysHist":[50,45,60],"type": "elastic_search-1", "channel": "vegetation_update"}'
          //'{"asset_id": "a218963f-36bf-4668-8ad9-9c74e7ba9ab1","timestamp": "2021-06-01T06:58:33.908Z","commanded_state": 6, "commanded_state_detail": 6,"network_controller_id": "8ea65d78-6e75-4b22-be07-16b81e72be0b","type": "elastic_search-1", "channel": "tracking_command_hist"}'
          // '{"channel":"asset_status_bits_update","status_bits": 128,"timestamp": "2023-11-16T18:00:00.370Z","asset_id": "00000000-0000-0000-0000-0000001bebe7","snap_addr": "1bebe7","type": "elastic_search-1"}'
          // '{"type": "elastic_search-1", "channel": "machine_learning", "asset_id": "00000000-0000-0000-0000-0000001bebe7", "timestamp": "2023-11-16T18:00:47Z", "ml_type": "poc", "next_due_date": "2020-06-15T04:00:47Z", "success": false }',
          // '{"type": "elastic_search-1", "channel": "anomaly_detection", "asset_id": "00000000-0000-0000-0000-0000001bebe7", "timestamp": "2020-04-10T12:45:00Z","last_anomaly_state": "Failed","prediction_used": "2020-04-05T00:00:00Z", "result": {"current_anomaly_state": "Passed", "current_value": 5, "p_start_time": "2020-04-10T14:05:00Z", "p_end_time": "2020-04-10T16:05:00Z","p_start_value": -55.5092452233579,"p_end_value": -55.5092452233579, "threshold": 15 }, "detection_type": "current_angle"}',
          // '{"asset_id": "93911a1f-3c47-44d9-bd90-6a35dc1b060b", "timestamp": "2020-05-06T12:05:56.196Z", "commanded_state": 4, "commanded_state_detail": 0,"network_controller_id": "e60e53ad-bd85-45ed-8e43-bbdb451ac45e", "type": "elastic_search-1", "channel": "tracking_command_hist" }',
          //JSON.stringify(weather_stow_alarm)
          // JSON.stringify(assetConnectionHist)
          // JSON.stringify(local_weather_nc_stow_update)
        //'{"asset_id":"2850554a-f7ab-4b0e-b564-165131ef4f55","asset_name":null,"device_type_id":"9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4","timestamp":"2021-07-26T18:30:15.664Z","stow_type":8,"stow_value":0,"stow_threshold":0,"type":"elastic_search-1","channel":"weather_stow_updates"}'
      },
      attributes: [Object],
      messageAttributes: [Object],
      md5OfBody: "68fe91bdd6a7cd49dd9f0f4d199e7e82",
      md5OfMessageAttributes: "4d69588e1ac83d4e8b64ad791a9ba975",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-2:852475575129:Terra_track_emails",
      awsRegion: "us-east-2",
    },
    /*{
      messageId: "fab1be02-bea2-4c10-a756-48e17555903e",
      receiptHandle:
        "AQEBPppJVgl3rXkQ6tbbLSeopsVj2CTEU+eOxyd+FjCIcNHEMabXShmnM3M8FKX/wlAiDyLISRfrZ2EDDYAC9LNvP85xsdlMOFwyKsAMq0IfUdqDVg/e6Hk9skR/jSU9fMQ+bqWlssq7u65Q9AAHY8vXmZQ/AuxjtQdUhZ2ns7CBIRYgAYtuoGnXIo9YAIPencHBr6cPVhPcFjpuuoS/T7Boveo8Mhx6Yl9wBya9sabhiMtWAm9gpqWuu7v7FXxU1jTh83kGn9kLfqk1ACluYvaPoiGiJFGyY/T6SLrEx32axU7L4cVa5bXDsKA/vRoTbtzHIAnddRbaSF+eRyHy0KZ99gTzURYXtoASKSh7dtQPStw24kG9LcKs/MbDYdV0u0QiKnHM5lNmQSezgvh9yoGWwQ==",
      Sns: {
        Message:
          '{"asset_id":"816fced4-c75f-4933-92bf-8290fb57202c","timestamp":"2020-01-20T10:21:35.195Z","wind_speed":10,"wind_direction":10,"snow_depth":0,"temperature":10,"peak_wind_speed":10,"average_wind_speed":10,"type":"elastic_search-1","channel":"weather_hist"}'
      },
      attributes: [Object],
      messageAttributes: [Object],
      md5OfBody: "68fe91bdd6a7cd49dd9f0f4d199e7e82",
      md5OfMessageAttributes: "4d69588e1ac83d4e8b64ad791a9ba975",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-2:852475575129:Terra_track_emails",
      awsRegion: "us-east-2"
    }*/
  ],
};
// event = {
//   Records: [
//     {
//       messageId: "f07d2b8d-63dd-473f-bf26-1089f4ee3868",
//       receiptHandle:
//         "AQEB6wcZO2cNVXzCZ+Q0kOPLoVqrfzWzMnUNa5L2U6wtoOdo9wDsb3UKZj4hCRlJfgnUJcFLrxS5MYp47wMXLuadvWfu0+YCbqjMvqmEyZrsMcHWQ4aMCv2XBq3P0+dXCzWlbbW2VgA4KH5SaUVBXTvGoqgbwFr4fvLH398MtA2UU87rSLbqHNhM1Hil3Cmc+mQmkeH7ZwUxEhTDCOYOhBEW5rHqCcAtME4fjHUeBONUQqbqlx4B081j2wZ59pyAXKkNAK1hjx6EK+V9BchGyUZqekrCPb3pJMVwhZGH6UlNNQdPurGTwaJMzWBuFy9ihESS1iVD36NlqQ5kowE7q+KTEX5UxKVSz05qH1pq3UH2fJS04e/4y8II79BWTw81xlWul/uE1nWVRPiWKXO1bppj1W9yrkBJtkrqAVcfsxhwcnE=",
//       body:
//         '{"asset_temp":77.5,"timestamp":"2019-10-29T06:11:34.388Z","asset_id":"02846a55-d9ee-4387-8db2-92845d57983b","type":"elastic_search-1","channel":"asset_update"}',
//       attributes: [Object],
//       messageAttributes: [Object],
//       md5OfMessageAttributes: "4d69588e1ac83d4e8b64ad791a9ba975",
//       md5OfBody: "b0d219e64115f149667f20db38c795ca",
//       eventSource: "aws:sqs",
//       eventSourceARN:
//         "arn:aws:sqs:us-east-2:852475575129:TerraTrak_Anomay_Detection",
//       awsRegion: "us-east-2"
//     }
//   ]
// };
loader.handler(event, null, (err, resp) => {
  console.log("Err:", err);
  console.log("Resp:", resp);
});
