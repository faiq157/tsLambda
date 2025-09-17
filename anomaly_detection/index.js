const moment = require('moment');
const db = require('./utils/lib/db');
const pred  = require('./prediction')();
const notificationHelper = require("./utils/helpers/NotificationHelper")();

const CA_CONST = pred.ca_const;

async function sendNotification(params) {
  params.type = "elastic_search-1";
  console.log(`Send notification ${JSON.stringify(params,null,2)}`);
  try {
    await notificationHelper.sendNotification(params);
    return true;
  } catch (err) {
    console.log("Error in sendNotification..!!", err);
    return err;
  }
}

async function anomaly_detection(type, payload, c_entry) {
  const { asset_id, snap_addr } = payload;
  const p_startDate = moment().utc().subtract(1, 'months').format();
  const p_endDate = moment().utc().format();
  let a_result = {
    success: -1
  };
  let a_data = {
    state: 0
  };
  let test_point = 0;
  let update_pred = 0;
  let update = {};
  let prediction = [];
  let pred_result;
  let lastAnomaly = {};
  let notify = true;
  let lastMode = {};

  //console.log(`Check ${type} predictions from ${p_startDate} to ${p_endDate}`);
  const multi_result = await db.getMultiData({asset_id, snap_addr, start_date: p_startDate, end_date: p_endDate, type, c_entry});
  console.log('Elastic Search Data Multiple, ', multi_result)
  
  if (multi_result) {
    pred_result = multi_result.prediction;
    lastAnomaly = multi_result.lastAnomaly;
    lastMode = multi_result.last_mode;
    if (lastAnomaly) {
      console.log(`${type}[${asset_id}]: Last Anomaly result: ${JSON.stringify(lastAnomaly)} `);
      if (lastAnomaly.hasOwnProperty('notified') && lastAnomaly.notified < 0) {
        console.log("Reset lastAnomaly notified < 0");
        lastAnomaly = {};
      }
    }

    if (lastMode)
      console.log(`${type}[${asset_id}]: lastMode: ${JSON.stringify(lastMode)} `);
  }

  if (pred_result && pred_result?.enable == true && pred_result?.predicted == true) {
    prediction = pred_result.predictions;
    console.log(`${type}[${asset_id}]: Using ${pred_result.timestamp} predictions, Selected day ${pred_result.selected_day}. Count ${prediction.length}`);
    console.log(`${type}[${asset_id}]: c_entry ${JSON.stringify(c_entry)}`);
    switch (type) {
      case 'poc':
        if (pred_result.training_start_time != 0) {
          console.log(`${type}[${asset_id}]:Training in progress`);
          return; // Wait for prediction training to finish
        }

        console.log(`${type}[${asset_id}]: ml_data ${pred_result.ml_data} wakeup_event ${pred_result.wakeup_event} nighttime_stow ${pred_result.nighttime_stow}`);
        if (pred_result.ml_data[0] && pred_result.wakeup_event != '0') {
          test_point = 1;
          a_data.expiry = pred_result.wakeup_expiry;
          if (moment(c_entry.ts).isAfter(pred_result.wakeup_expiry)) {
            notify = false;
            a_data.state = 2;
          }
          update_pred = 1;
          a_data.test = 'Min';
          if (lastAnomaly.hasOwnProperty('min'))
            lastAnomaly = { ...lastAnomaly.min };
          else
            lastAnomaly = null;
          update = {wakeup_event: '0'};
        } else if (pred_result.ml_data[1] && pred_result.nighttime_stow != '0') {
          if (moment(c_entry.ts).isAfter(pred_result.nighttime_stow)) {
            test_point = 2;
            a_data.expiry = pred_result.nighttime_stow_expiry;
            if (moment(c_entry.ts).isAfter(pred_result.nighttime_stow_expiry)) {
              notify = false;
              a_data.state = 2;
            }
            update_pred = 1;
            a_data.test = 'Max';
            if (lastAnomaly.hasOwnProperty('max'))
              lastAnomaly = { ...lastAnomaly.max };
            else
              lastAnomaly = null;
            update = {nighttime_stow: '0'};
          }
        }
        console.log(`[${asset_id}]: test_point ${test_point} update_pred: ${update_pred}`);

        if (test_point != 0) {
          a_result = pred.chk_poc_anomaly(c_entry, prediction, test_point);
        }
        break;

      case 'current_angle':
        if (!lastAnomaly.hasOwnProperty('state'))
          lastAnomaly = null;
        test_point = 1;
        a_result = pred.chk_current_angle_anomaly(c_entry, prediction, CA_CONST.THRESHOLD, CA_CONST.TIME_WINDOW);
        // Notify only if Tracking/Backtracking
        if (c_entry.tracking_status != 2 && c_entry.tracking_status != 3) {
          notify = false;
        } else {
          if (lastMode && lastMode.timestamp) {
            // Get mode change
            const mode_change_time = moment(lastMode.timestamp).utc().add(1, 's').format();
            //console.log(`LMC: ${lastMode.timestamp} -> ${mode_change_date}`);
            const mc_result = await db.getHistoryData({snap_addr, start_date: mode_change_time, es_data: type, q_type: 'exist', interval: '1s', size: 1, order: 'asc'});
            console.log(`${type}[${asset_id}]: Last mode change ${JSON.stringify(mc_result)}`);
            if (mc_result == null) {
              notify = false;
            } else {
              const mode_change_dur = moment.duration(moment(c_entry.ts).diff(mc_result.timestamp)).asMinutes();
              if (mc_result && mode_change_dur < 15) {
                notify = false;
                console.log(`${type}[${asset_id}]: Don't notify. mode change time ${c_entry.ts} - ${mc_result.timestamp} = ${mode_change_dur} < 15`)
              }
            }
          }
        }
        break;
    }

    if (test_point != 0) {
      console.log(`${type}[${asset_id}]: lastAnomaly[${lastAnomaly ? lastAnomaly.state : 'null'}] ${lastAnomaly ? lastAnomaly.timestamp : ''} ${lastAnomaly ? lastAnomaly.value : ''}`);
      if (a_result.success === true) {
        console.log(`${type}[${asset_id}] PASSED`);
        a_data.state += 1;
      } else if (a_result.success === false) {
        console.log(`${type}[${asset_id}] FAILED`);
        a_data.state += 0;
      }
      a_data = {
        ...a_data,
        asset_id: asset_id,
        timestamp: c_entry.ts,
        type: type,
        value: c_entry.value,
        "@timestamp": moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSS'),
        prediction_used: pred_result.timestamp
      };

      // Notify for Alerts/events notification
      if (notify == true && (!lastAnomaly || lastAnomaly.state != a_data.state)) {
        const { current_ts, success, ...otherProps } = a_result;
        let params = {
          channel: "anomaly_detection",
          asset_id,
          timestamp: current_ts,
          last_anomaly_state: lastAnomaly ? ((lastAnomaly.state == 1) ? 'Passed' : 'Failed') : null,
          prediction_used: a_data.prediction_used,
          result: {
            current_anomaly_state: success == false ? 'Failed' : "Passed",
            ...otherProps
          }
        };
        if (type == 'current_angle') {
          params.detection_type = type;
        } else if (type == 'poc') {
          if (a_data.test == 'Min') {
            params.detection_type = 'poc_wakeup';
          } else {
            params.detection_type = 'poc_nighttime_stow';
          }
        }
        a_data.notified = a_data.state;
        await sendNotification(params);
      }
      // Save Anomaly results
      console.log(`Save anomaly result ${JSON.stringify(a_data)}`)
      const result = await db.insertAnomalyData(a_data);
      if (result != 0)
        console.log(`${type}[${asset_id}] Failed to save anomaly result`);
    }

    if (update_pred) {
      let { id } = pred_result;
      console.log(`${type}[${asset_id}] Update prediction ${JSON.stringify(update)}`);
      const update_prediction = await db.updatePredictionData({ ...pred_result, ...update }, id);
      if (update_prediction != 0) {
        console.log(`${type}[${asset_id}] Prediction update failed`);
      }
    }
  } else {
    if (pred_result)
      console.log(`${type}[${asset_id}] Found predictions not`, pred_result.enable == false ? 'enabled' : 'predicted');
    else
      console.log(`${type}[${asset_id}] Predictions not found`);
  }
}

async function processData(payload) {
  let test_data = {};
  let type;

  console.log("Process Data => Payload: ", payload)
  switch (payload.channel) {
    case 'rack_hist':
      type = 'current_angle';
      test_data.ts = payload.timestamp;
      test_data.value = payload[type];
      test_data.tracking_status = payload.tracking_status;
      await anomaly_detection(type, payload, test_data,);
      break;
    case 'battery_hist':
      type = 'poc';
      test_data.ts = payload.timestamp;
      test_data.value = payload[type];
      await anomaly_detection(type, payload, test_data);
      break;
    case 'wakeup_event':
      await pred.set_event_for_poc(payload.asset_id, payload.timestamp, 'wakeup');
      break;
    case 'tracking_command_hist':
      if (payload.commanded_state == 5)
        await pred.set_event_for_poc(payload.asset_id, payload.timestamp, 'nighttime_stow');
      break;
  }
}

exports.handler = async function(event, context, autoclosePool = true) {
  console.log("Event: ", event)
  console.log("Context: ", context);
  event.Records.sort((a, b) => {
    const a_jsonData = JSON.parse(a.body);
    const b_jsonData = JSON.parse(b.body);
    return (moment(a_jsonData.timestamp).isBefore(moment(b_jsonData.timestamp))) ? -1 : 1;
  });
  if (event.Records.length > 1)
    console.log(`Warning: Records.length[${event.Records.length}] > 1`);
  console.log(`Records [${event.Records?.length}]: `, event.Records);
  try {
    await Promise.all(event.Records.map(async (record) => {
      const message = record.body;
      console.log("Message:", message);
      const jsonData = JSON.parse(message);
      await processData(jsonData);
    }))
  } catch (e) {
    console.log("Error in handler: ", e);
  } finally {
    // if (autoclosePool) await db.closeClientConnections();
    // console.log("Database pool closed.");
    console.log('Finally Block Executed.')
  }
};
