/**
 * Created by Zigron on 6/25/2019.
 */
const moment = require('moment');
const db = require('./utils/lib/db');

const ca_const = {
    DAY_ENTRY_CNT: 144, // (24 * 60) / 10
    D_IN_WEEK: 7,
    MINS_IDX_MAX: (((24 * 60) / 10) - 1),
    MIN_MATCHED_FOR_SELECTION: 6,
    MAX_DAYS_TO_CMP: 14,
    TS_PERIOD: 10,
    PRED_EXPIRY: 14,
    THRESHOLD: 15.0,
    TIME_WINDOW: 3
};

const poc_const = {
    MIN_MATCHED_FOR_SELECTION: 3,
    PRED_EXPIRY: 14,        // Expiry in days
    WAKEUP_EXPIRY: 60,      // Expiry in mins
    TRAINING_THRESHOLD: 10,
    PERCENT_THRESHOLD: 15
};

function chk_current_angle_anomaly(current, predicted, v_threshold = ca_const.THRESHOLD, time_window = ca_const.TIME_WINDOW) {

    const c_date = moment(current.ts).utc();
    const mins = c_date.hours() * 60 + c_date.minutes();
    const mins_idx = Math.floor(mins/ca_const.TS_PERIOD);
    let future_idx = mins_idx;
    let past_idx = mins_idx;
    let past_cnt = 0;
    let future_cnt = 0;
    const s_predicted = predicted[mins_idx];
    let result = {
        success: false
    };

    //console.log(`Predictions : ${predicted.length} mins: ${mins} mins_idx: ${mins_idx}`);
    // console.log("Comparing: idx ", mins_idx, " [", c_date.format(), "] value: ", current.value, " with ", s_predicted);
    //console.log(`Comparing: [${c_date}] value: ${current.value} with ${s_predicted}`);

    let diff = s_predicted - current.value;
    if (Math.abs(diff) <= v_threshold) {
        result.success = true;
    } else {
        // console.log(`Diff[${mins_idx}]: ${s_predicted}[p] - ${current.value}[c] = ${diff}`);
        let last_diff = diff;
        for (; future_cnt < time_window; future_cnt++) {
            future_idx++;
            if (future_idx > ca_const.MINS_IDX_MAX) future_idx = 0;
            diff = predicted[future_idx] - current.value;
            // If signs of diff and last_diff are not same then the shift in consecutive predicted values is more then v_threshold.
            if ((Math.abs(diff) < v_threshold) || ((last_diff > 0) != (diff > 0))) {
                future_cnt++;
                // console.log(`Passed: T[+${future_cnt}]: predicted[${future_idx}] ${predicted[future_idx]}. Diff ${diff} last_diff ${last_diff}`);
                result.success = true;
                break;
            }
            last_diff = diff;
            //console.log(`future[${future_idx}]: ${predicted[future_idx]}`);
        }
        if (result.success == false) {
            last_diff = s_predicted - current.value;
            for (; past_cnt < time_window; past_cnt++) {
                past_idx--;
                if (past_idx < 0) past_idx = ca_const.MINS_IDX_MAX;
                diff = predicted[past_idx] - current.value;
                if ((Math.abs(diff) < v_threshold) || ((last_diff > 0) != (diff > 0))) {
                    past_cnt++;
                    // console.log(`Passed: T[-${past_cnt}]: predicted[${past_idx}] ${predicted[past_idx]}. Diff ${diff} last_diff ${last_diff}`);
                    result.success = true;
                    break;
                }
                last_diff = diff;
                //console.log(`past[${past_idx}]: ${predicted[past_idx]}`);
            }
            if (result.success == false)
                console.log(`Failed: time window [${past_idx}] ${predicted[past_idx]}[p] to [${future_idx}] ${predicted[future_idx]}[p]`);
        }
    }
    // Floor c_date to TS_PERIOD
    c_date.subtract(c_date.minute() % ca_const.TS_PERIOD, 'minutes');
    result.current_value = current.value;
    result.current_ts = current.ts;
    result.p_start_time = c_date.subtract(past_cnt*ca_const.TS_PERIOD, 'minutes').format();
    result.p_end_time = c_date.add((past_cnt + future_cnt)*ca_const.TS_PERIOD, 'minutes').format();
    result.p_start_value = predicted[past_idx];
    result.p_end_value = predicted[future_idx];
    result.threshold = v_threshold;
    return result;
}

function poc_threshold(predicted, percent_thresold) {
    return Math.round(predicted - predicted * percent_thresold / 100);
}

function chk_poc_anomaly(current, predicted, test_point, threshold = poc_const.PERCENT_THRESHOLD) {
    const idx = test_point - 1;
    let result = {
        success: true,
        current_value: current.value,
        current_ts: current.ts,
        threshold: poc_threshold(predicted[idx], threshold)
    };

    if ((test_point == 1) || (test_point == 2)) {
        if (current.value < result.threshold)
            result.success = false;
    } else {
        result.success = -1;
    }

    return result;
}

const set_event_for_poc = async (nc_asset_id, ts, event) => {
    console.log(`${event} poc: ${nc_asset_id} ${ts}`);

    // TODO: Fix for nc_asset_id
    let pred_result = await db.getHistoryData({asset_id: nc_asset_id, 
        start_date: moment().subtract(poc_const.PRED_EXPIRY, 'days').format(), end_date: moment().format(), 
        es_data: 'poc', q_type: 'type_match', asset_id_key: 'nc_asset_id.keyword', size: 1000});
    
    console.log('pred_result_SET_EVENT_FOR_POC', pred_result)

    if (pred_result != null && pred_result.length) {
        pred_result = pred_result.filter(p => p.enable);
        console.log(`Found ${pred_result.length} for poc ${event} event`);
        for (let i = 0; i < pred_result.length; i++) {
            let update = {};
            if (event == 'wakeup') {
                if (pred_result[i].ml_data[0] == 0){
                    continue;   // battery_am poc not enabled
                }
                update = {
                    wakeup_event: moment(ts).utc().format(),
                    wakeup_expiry: moment(ts).utc().add(poc_const.WAKEUP_EXPIRY, 'minutes').format(),
                    nighttime_stow: '0'
                };
            } else {
                if (pred_result[i].ml_data[1] == 0){
                    continue;    // battery_pm poc not enabled
                }
                if ((pred_result[i].wakeup_expiry != '0') && (moment(ts).utc().isSameOrBefore(pred_result[i].wakeup_expiry))) {
                    console.log(`Ignore nighttime_stow. ${moment(ts).utc().format()} isBefore ${pred_result[i].wakeup_expiry}`);
                    continue;
                }
                update = {
                    nighttime_stow: moment(ts).utc().format(),
                    nighttime_stow_expiry: moment(ts).utc().add(poc_const.WAKEUP_EXPIRY, 'minutes').format()
                };
            }

            console.log(`Set poc ${event} for ${pred_result[i].asset_id}, update: ${JSON.stringify(update)}`);
            const result = await db.updatePredictionData({...pred_result[i], ...update}, pred_result[i].id);
            if (result != 0) {
                console.log(`Failed to set ${event} for poc ${result}`);
            }
        }
    }
};

module.exports = () => {
    return {
        ca_const,
        chk_current_angle_anomaly,
        chk_poc_anomaly,
        set_event_for_poc
    };
};
