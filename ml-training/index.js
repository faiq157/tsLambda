const moment = require('moment');
const pred  = require('./prediction')();
const db = require('./utils/lib/db');
const notificationHelper = require("./utils/helpers/NotificationHelper")();

const CA_CONST = pred.ca_const;
const POC_CONST = pred.poc_const;

let lambda_timeout = 0;

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

const new_expiry_date = (type, start_date, training_result) => {
  let min_matched_const;
  let min_matched;
  switch (type) {
    case 'current_angle':
      min_matched_const = CA_CONST.MIN_MATCHED_FOR_SELECTION;
      min_matched = Math.min(training_result.matched_cnt, training_result.grp_matched_cnt);
      break;

    case 'poc':
      min_matched_const = POC_CONST.MIN_MATCHED_FOR_SELECTION;
      min_matched = training_result.matched_cnt;
      break;
  }
  let extend_expiry = (min_matched < min_matched_const) ? (min_matched_const - min_matched) : min_matched_const;
  if (extend_expiry < 1 || extend_expiry > min_matched_const)
    extend_expiry = 1;
  return moment(start_date).utc().add(extend_expiry, 'day').format();
};

async function retrain_expired_trainings(type, context, start_date = moment().utc().format()) {
  let in_training = -1;
  let training_result = {
    rval: -1
  };
  let update = {};

  console.log(`[${lambda_timeout - context.getRemainingTimeInMillis()}]Start Time: ${moment.utc().valueOf()}`);
  // Get expired predictions
  
  const expired_pred = await db.getExpiredPredictions(start_date, type);
  console.log(`Found ${expired_pred.length} expired predictions for ${type}`, expired_pred.map(el => el.id));

  if (expired_pred.length < 1) {
    return ;
  }

  for (let i = 0; i < expired_pred.length; i++) {
    try {
      if (context.getRemainingTimeInMillis() < 2 * 60 * 1000) {
        console.log(`${type}[${lambda_timeout - context.getRemainingTimeInMillis()}]Execution time left is < 2 mins. Processed ${i}`);
        return -1;
      }

      console.log(`${type}[${lambda_timeout - context.getRemainingTimeInMillis()}]Time:  ${moment.utc().valueOf()}. Start training for ${expired_pred[i].data.asset_id}`);

      update = { ...expired_pred[i].data, training_start_time: start_date };
      console.log(`Update ES Data ${expired_pred[i].id}`, update);

      const updated_pred_db = await db.updatePredictionData(update, expired_pred[i].id);
      console.log('[DB] updated_pred ', updated_pred_db);
      
      in_training = i;
      training_result.rval = -1;
      switch (type) {
        case 'current_angle':
          training_result = await current_angle_training(expired_pred[i].data.asset_id, expired_pred[i].data, expired_pred[i].id);
          break;

        case 'poc':
          training_result = await battery_POC_training(expired_pred[i].data.asset_id, expired_pred[i].data, expired_pred[i].id);
          break;
      }

      console.log(`${type} Training: ${training_result.rval} matched_cnt: ${training_result.matched_cnt} grp_matched_cnt: ${training_result.grp_matched_cnt} anomaly_cnt ${training_result.anomaly_cnt}`);

      if (training_result.rval < 0) {
        const new_expiry = new_expiry_date(type, start_date, training_result);
        console.log(`${type} New expiry date ${new_expiry}`);

        // Notify to cloud.
        let params = {
          channel: "machine_learning",
          asset_id: expired_pred[i].data.asset_id,
          timestamp: start_date,
          ml_type: type,
          next_due_date: new_expiry,
          success: false
        };
        await sendNotification(params);

        // Save expired prediction as fresh so that within CA_CONST.PRED_EXPIRY period there exists atleast one prediction
        if ((moment(new_expiry).utc().diff(expired_pred[i].data.timestamp, 'days') >= CA_CONST.PRED_EXPIRY) ||
            ("predicted" in expired_pred[i].data && expired_pred[i].data.predicted == true)) {
          console.log(`${type} Diff in TS[${expired_pred[i].data.timestamp}] and Expiry[${new_expiry}] >= ${CA_CONST.PRED_EXPIRY}`);
          const orig_expiry = expired_pred[i].data.expiry;
          expired_pred[i].data.training_start_time = "0";
          expired_pred[i].data.predicted = false;  // Disabled anomaly detection till prediction is successful on next due date.
          expired_pred[i].data.predictions = [];
          expired_pred[i].data.selected_day = 0;
          expired_pred[i].data.timestamp = start_date;
          expired_pred[i].data.expiry = new_expiry;
          expired_pred[i].data.anomaly_cnt = training_result.anomaly_cnt;
          expired_pred[i].data.grp_matched_cnt = training_result.grp_matched_cnt;
          expired_pred[i].data.matched_cnt = training_result.matched_cnt;
          console.log(`${type} Save expired prediction as fresh ${JSON.stringify(expired_pred[i].data)}`);

          const result = await db.insertPredictionData(expired_pred[i].data, expired_pred[i].id);

          expired_pred[i].data.expiry = orig_expiry; // restore original expiry
          if (result != 0)
            console.log(`${type} Save prediction failed ${result}`);
          else
            training_result.rval = 0; // To disable expired prediction
        } else {
          expired_pred[i].data.expiry = new_expiry;
        }
      } else if (expired_pred[i].data.predicted == false) {
        // Notify to cloud expired prediction wasn't successful and now this prediction is successful .
        let params = {
          channel: "machine_learning",
          asset_id: expired_pred[i].data.asset_id,
          timestamp: start_date,
          ml_type: type,
          next_due_date: training_result.expiry,
          success: true
        };
        await sendNotification(params);
      }

      update = {
        ...expired_pred[i].data,
        ...training_result,
        training_start_time: "0",
        enable: (training_result.rval < 0) ? true: false,
      };

      if (training_result.rval < 0){
        update.anomaly_cnt = training_result.anomaly_cnt;
        update.grp_matched_cnt = training_result.grp_matched_cnt;
        update.matched_cnt = training_result.matched_cnt;
      }

      const updated_pred_db_2 = await db.updatePredictionData(update, expired_pred[i].id);
      console.log('[DB] updated_pred_2 ', updated_pred_db_2);

      in_training = -1;
    } catch (err) {
      console.error("${type} ERROR: ", err);
      if (in_training != -1) {
        update = {
          ... expired_pred[in_training].data,
          training_start_time: "0", 
          enable: (training_result.rval < 0) ? true: false 
        };

        const updated_pred_db_3 = await db.updatePredictionData(update, expired_pred[in_training].id);
        console.log('[DB] updated_pred_3 ', updated_pred_db_3);
      }
      in_training = -1;
    }

    console.log(`${type} [${lambda_timeout - context.getRemainingTimeInMillis()}] End: ${moment.utc().valueOf()}`);
  }

  return 0;
}

async function processData(payload, context) {
  console.log("Start Training: ", payload);
  await retrain_expired_trainings('current_angle', context);
  await retrain_expired_trainings('poc', context);
}

async function current_angle_training(asset_id, expired_pred, pred_id) {
  let loop = 1;
  let cur_utc = moment().utc();
  let end_date;
  let start_date;
  let training = {};

  do {
    end_date = cur_utc.format();
    start_date = cur_utc.startOf('day').subtract(21, 'day').format();
    console.log(`Current angle training asset ${asset_id} data from ${start_date} to ${end_date}`);
    training = await pred.train_current_angle_model(asset_id, start_date, end_date, expired_pred, pred_id);
    console.log(`Training result: ${JSON.stringify(training)}`);
    cur_utc.add(7, 'day');
  } while (training.rval < 0 && --loop > 0);

  return training;
}

async function battery_POC_training(asset_id, expired_pred, pred_id) {
  let loop = 1;
  let cur_utc = moment().utc();
  let end_date;
  let start_date;
  let training = {};

  do {
    end_date = cur_utc.format();
    start_date = cur_utc.startOf('day').subtract(7, 'day').format();
    console.log(`POC training asset ${asset_id} data from ${start_date} to ${end_date}`);
    training = await pred.train_battery_POC_model(asset_id, start_date, end_date, expired_pred, pred_id);
    console.log(`Training result: ${JSON.stringify(training)}`);
    cur_utc.subtract(7, 'day');
  } while (training.rval < 0 && --loop > 0);

  return training;
}

exports.handler = async function(event, context) {
  console.log("Event: ", event);
  console.log("Context: ", context);
  //var jsonData = JSON.parse(event);
  //processData(jsonData);
  lambda_timeout = context.getRemainingTimeInMillis();

  console.log("getRemainingTimeInMillis:", lambda_timeout);

  try {
    await processData(event, context);
  } catch (error) {
    console.error('Error processing data:', error);
  } finally {
    // Close the database pool before exiting the handler
    // if (autoClosePool) {
      // await db.closeDBPool();
      // console.log("Database pool closed.");
    // }

    console.log('Finally block executed');
  }
};
