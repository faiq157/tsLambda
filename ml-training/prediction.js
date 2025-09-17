/**
 * Created by Zigron on 6/25/2019.
 */
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const tzlookup = require('tz-lookup');
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

// Returns array with number of seconds passed with refernece to start_ts
function ts_to_fs(ts, start_ts, zone_offset = 0) {
    let ts_secs = [];
    //let start moment("start_ts", "M/D/YYYY H:mm").unix();
    let start = moment(start_ts).subtract(zone_offset, 'minutes').unix();
    let idx = 0;

    //console.log(`ts_to_fs: start ${start}`);
    while (idx < ts.length) {
        ts_secs[idx] = moment(ts[idx]).unix() - start;
        //console.log(`${idx} ${ts_secs[idx]/(24*60*60)}`);
        idx++;
    }
    return ts_secs;
}

// Returns x for y, p1 = (x1, y1), p2 = (x2, y2)
function next_point(x1, y1, x2, y2, y) {
    //  y - y1 = m(x - x1)
    //  m = (y2 - y1) / (x2 - x1)
    //  x = x1 + (y - y1) / m
    //console.log(`${y}: (${x1},${y1}) (${x2},${y2})`);
    return (x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
}

function resample_uniform(value, ts, start_date, end_date) {
    let uniform_ts = [];
    let resample = [];
    let resample_idx = 0;
    let sample_idx = 0;
    let sample_idx_nxt = 0;
    let ts_secs = ts_to_fs(ts, start_date);
    ts_secs = ts_secs.reverse();
    const secs_in_a_day = 60 * ca_const.TS_PERIOD * ca_const.DAY_ENTRY_CNT;

    // Check of complete days skip at start or end
    if (ts_secs[0] > secs_in_a_day) {
        // Complete day skip at start
        start_date = moment(start_date).utc().add(Math.floor(ts_secs[0] / secs_in_a_day), 'days').format();
        console.log(`${ts_secs[0] / secs_in_a_day} days skipped at start. New start date ${start_date}`);
        ts_secs = ts_to_fs(ts, start_date);
    }
    let ts_end_date =  moment(start_date).add(Math.ceil(ts_secs[ts_secs.length - 1] / secs_in_a_day), 'days').utc();
    let duration = moment.duration(moment(end_date).diff(moment(ts_end_date))).asDays();
    if (duration > 0) {
        end_date = moment(ts_end_date).utc().format();
        console.log(`${duration} days skipped at end. New end date ${end_date}`);
    }

    let resample_len = (moment(end_date).unix() - moment(start_date).unix()) / (60 * ca_const.TS_PERIOD);
    let m_date = moment(start_date);

    //console.log(`ts_secs[0]: ${ts_secs[0]} to ts_secs[${ts_secs.length - 1}]: ${ts_secs[ts_secs.length - 1]}`);
    if (ts_secs[0] > 0) {
        // We want 1st value at time 0 seconds
        // As values are repeated for each day. We picks last entry of day and make it last entry of previous day by subtraction seconds in a day,
        // In this way it becomes previous point that is p1 and ts_secs[0] as p2
        // Find last entry of 1st day
        let l_idx = ts_secs.findIndex((x) => x > secs_in_a_day);
        //console.log(`l_idx: ${l_idx}`);
        if (l_idx > 1) {
            l_idx--;
            //console.log(`prev[${l_idx}]=${ts_secs[l_idx]}. nxt[${0}]=${ts_secs[0]}. Secs  `);
            //console.log(`x1[${l_idx}]=(${value[l_idx]},${ts_secs[l_idx] - (60 * ca_const.TS_PERIOD * ca_const.DAY_ENTRY_CNT)}) x2[0]=(${value[0]},${ts_secs[0]})`);
            resample[resample_idx] = next_point(value[l_idx], ts_secs[l_idx] - secs_in_a_day, value[0], ts_secs[0], 0);
        } else {
            resample[resample_idx] = value[0];
        }
    } else {
        resample[resample_idx] = value[0];
    }

    uniform_ts[resample_idx] = start_date;
    //console.log(`${resample_idx} ${uniform_ts[resample_idx]} = ${resample[resample_idx]}`);
    resample_idx++;
    while ((resample_idx < resample_len) && (sample_idx_nxt < (ts.length - 1))) {
        while ((sample_idx_nxt < (ts.length - 1)) && (ts_secs[sample_idx_nxt] < (resample_idx * 60 * ca_const.TS_PERIOD))) sample_idx_nxt++;
        //console.log(`sample_idx_nxt[${sample_idx_nxt}]=${value[sample_idx_nxt]}. Secs: ${ts_secs[sample_idx_nxt]} vs resample_idx[${resample_idx}]: ${resample_idx * 60 * ca_const.TS_PERIOD}`);

        while ((resample_idx < resample_len) && (ts_secs[sample_idx_nxt] >= (resample_idx * 60 * ca_const.TS_PERIOD))) {
            if (ts_secs[sample_idx_nxt] == (resample_idx * 60 * ca_const.TS_PERIOD)) {
                resample[resample_idx] = value[sample_idx_nxt];
            } else {
                if (sample_idx == sample_idx_nxt) {
                    resample[resample_idx] = next_point(resample[resample_idx - 1], ((resample_idx - 1) * 60 * ca_const.TS_PERIOD), value[sample_idx], ts_secs[sample_idx],
                        resample_idx * 60 * ca_const.TS_PERIOD);
                } else {
                    if (sample_idx_nxt - sample_idx > 1) {
                        sample_idx = sample_idx_nxt - 1;
                        resample[resample_idx] = next_point(value[sample_idx], ts_secs[sample_idx], value[sample_idx_nxt], ts_secs[sample_idx_nxt],
                          resample_idx * 60 * ca_const.TS_PERIOD);
                    } else {
                        resample[resample_idx] = next_point(value[sample_idx], ts_secs[sample_idx], value[sample_idx_nxt], ts_secs[sample_idx_nxt],
                          resample_idx * 60 * ca_const.TS_PERIOD);
                    }
                }
            }
            uniform_ts[resample_idx] = m_date.add(ca_const.TS_PERIOD, 'minutes').utc().format();
            //console.log(`${resample_idx}: Secs ${resample_idx * 60 * ca_const.TS_PERIOD} ${uniform_ts[resample_idx]} = ${resample[resample_idx]}`);
            resample_idx++;
        }
        sample_idx = sample_idx_nxt;
    }

    // check that resample_idx == resample_len else fill the last day completely.
    if (resample_idx < resample_len) {
        // console.log(`resample_idx ${resample_idx} < resample_len ${resample_len}`);
        // Pick first entry of the last day and treat it as next point p2
        sample_idx_nxt = resample_len - ca_const.DAY_ENTRY_CNT;
        while (resample_idx < resample_len) {
            resample[resample_idx] = next_point(resample[resample_idx - 1], ((resample_idx - 1) * 60 * ca_const.TS_PERIOD),
                resample[sample_idx_nxt], ((sample_idx_nxt + 1) * 60 * ca_const.TS_PERIOD), resample_idx * 60 * ca_const.TS_PERIOD);
            uniform_ts[resample_idx] = m_date.add(ca_const.TS_PERIOD, 'minutes').utc().format();
            // console.log(`${resample_idx}: Secs ${resample_idx * 60 * ca_const.TS_PERIOD} ${uniform_ts[resample_idx]} = ${resample[resample_idx]}`);
            resample_idx++;
        }
    }
    return { uniform_value: resample, uniform_ts: uniform_ts };
}

function resample_min_max_per_day(value, ts, start_date, end_date, zone_offset = 0) {
    let resample_ts = [];
    let resample = [];
    let resample_idx = 0;
    let sample_idx = 0;
    let sample_idx_nxt = 0;
    let ts_secs = ts_to_fs(ts, start_date, zone_offset);
    ts_secs = ts_secs.reverse();

    // Check for complete days skip at start or end
    if (ts_secs[0] > (24 * 60 * 60)) {
        // Complete day skip at start
        start_date = moment(start_date).utc().add(Math.floor(ts_secs[0] / (24 * 60 * 60)), 'days').format();
        console.log(`${ts_secs[0] / (24 * 60 * 60)} days skipped at start. New start date ${start_date}`);
        ts_secs = ts_to_fs(ts, start_date, zone_offset);
    }
    let ts_end_date =  moment(start_date).add(Math.ceil(ts_secs[ts_secs.length - 1] / (24 * 60 * 60)), 'days').utc();
    let duration = moment.duration(moment(end_date).diff(moment(ts_end_date))).asDays();
    if (duration > 0) {
        end_date = moment(ts_end_date).utc().format();
        console.log(`${duration} days skipped at end. New end date ${end_date}`);
    }

    let resample_len = moment(end_date).diff(moment(start_date), 'days');
    let m_date = moment(start_date).subtract(1, 'day');
    console.log(`resample_len ${resample_len} days. ts_secs[0]: ${ts_secs[0]} to ts_secs[${ts_secs.length - 1}]: ${ts_secs[ts_secs.length - 1]}`);

    while ((resample_idx < resample_len) && (sample_idx_nxt < (ts.length - 1))) {
        while ((sample_idx_nxt < (ts.length - 1)) && (ts_secs[sample_idx_nxt] < ((resample_idx + 1) * 24 * 60 * 60))) sample_idx_nxt++;
        //console.log(`${resample_idx}: sample_idx_nxt[${sample_idx_nxt}]=${ts[sample_idx_nxt]}`);

        if (sample_idx != sample_idx_nxt) {
            const d_history = value.slice(sample_idx, sample_idx_nxt - 1);
            //console.log(`${resample_idx}: sample_idx_nxt[${sample_idx_nxt-1}]=${ts[sample_idx_nxt-1]}`);
            resample.push({min: Math.min(...d_history), max: Math.max(...d_history)});
        } else {
            // Complete day history data missing
            resample.push({min: 0, max: 0});
        }
        resample_ts[resample_idx] = m_date.add(1, 'day').utc().format();
        if (resample_idx == 0) console.log(`\t TS \t Min \t Max`);
        console.log(`${resample_ts[resample_idx]} ${resample[resample_idx].min} ${resample[resample_idx].max}`);
        resample_idx++;
        sample_idx = sample_idx_nxt;
    }
    return { trans_value: resample, trans_ts: resample_ts };
}

function day_compared_with_next_days_cross(predictions, s_day, e_day, threshold, time_window, cmp_day_cnt, hist_data, hist_ts, stat) {
    let c_entry = {};
    let d_data, d_max, d_min;
    let i, ith_h;

    for (i = 0, ith_h = s_day - 1; i < cmp_day_cnt - 1; i++, ith_h++) {
        // i is current day
        //console.log("\n-----------------------\n");
        // Check the range of value for each day history data
        d_data = hist_data.slice(ith_h * ca_const.DAY_ENTRY_CNT, (ith_h + 1) * ca_const.DAY_ENTRY_CNT);
        d_max = Math.max(...d_data);
        d_min = Math.min(...d_data);
        //console.log(`${i}: max: ${d_max} min: ${d_min}`);
        stat.d_range[i] = d_max - d_min;

        // Check any anomaly detected for each day
        // Compare with each next day
        for (let j = i + 1, jth_h = ith_h + 1; j < cmp_day_cnt; j++, jth_h++) {
            // j is next day
            let anomily_cnt = 0;
            let r_anomily_cnt = 0;
            let rVal;
            //console.log(`M[${i+1}:${j+1}]: ${hist_ts[(ith_h) * ca_const.DAY_ENTRY_CNT]} with ${hist_ts[(jth_h) * ca_const.DAY_ENTRY_CNT]}`);
            for (let k = jth_h * ca_const.DAY_ENTRY_CNT; k < (jth_h + 1) * ca_const.DAY_ENTRY_CNT; k++) {
                c_entry.ts = hist_ts[k];
                c_entry.value = hist_data[k];
                rVal = chk_current_angle_anomaly(c_entry, predictions[i], threshold, time_window);
                if (rVal.success == false) {
                    //console.log(`FAILED day idx[${i}]: ${hist_ts[k]} ${hist_data[k]}`);
                    anomily_cnt += 1;
                }
            }
            if (anomily_cnt > 0) {
                //console.log(`Mismatch ${anomily_cnt}`);
            } else {
                //console.log(`\t reverseM[${i + 1}:${j + 1}]: ${hist_ts[jth_h * ca_const.DAY_ENTRY_CNT]} with ${hist_ts[ith_h * ca_const.DAY_ENTRY_CNT]}`);
                for (let k = ith_h * ca_const.DAY_ENTRY_CNT; k < (ith_h + 1) * ca_const.DAY_ENTRY_CNT; k++) {
                    c_entry.ts = hist_ts[k];
                    c_entry.value = hist_data[k];
                    rVal = chk_current_angle_anomaly(c_entry, predictions[j], threshold, time_window);
                    if (rVal.success == false) {
                        //console.log(`FAILED day idx[${i}]: ${hist_ts[k]} ${hist_data[k]}`);
                        r_anomily_cnt += 1;
                    }
                }
                if (r_anomily_cnt != anomily_cnt) {
                    //console.log(`xMismatch ${r_anomily_cnt}`);
                    stat.xMismatch[i]++;
                    stat.xMismatch[j]++;
                    stat.xMismatch_D[i][j] = stat.d_of_m[j];
                    stat.xMismatch_D[j][i] = stat.d_of_m[i];
                } else {
                    //console.log("M OK");
                    stat.matched[i]++;
                    stat.matched[j]++;
                    stat.matched_D[i][j] = stat.d_of_m[j];
                    stat.matched_D[j][i] = stat.d_of_m[i];
                }
            }
        }
    }

    d_data = hist_data.slice(ith_h * ca_const.DAY_ENTRY_CNT, (ith_h + 1) * ca_const.DAY_ENTRY_CNT);
    d_max = Math.max(...d_data);
    d_min = Math.min(...d_data);
    //console.log(`${i}: max: ${d_max} min: ${d_min}`);
    stat.d_range[i] = d_max - d_min;

    //console.log("\n-----------------------\n");
}

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
            // if (result.success == false)
                // console.log(`Failed: time window [${past_idx}] ${predicted[past_idx]}[p] to [${future_idx}] ${predicted[future_idx]}[p]`);
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

function pick_selected_day(cmp_day_cnt, max_matched_passed, start_D, net_end_D) {
    // Pick last day from the list.
    // If last day is equal to net_end_day then pick second last from the list
    let selected = max_matched_passed.lastIndexOf(1);
    if (selected + start_D == net_end_D) {
        const second_last = max_matched_passed.lastIndexOf(1, max_matched_passed.length - 2);
        if (second_last != -1)
            selected = second_last;
    }
    console.log(`Selected ${selected}`);
    selected += (start_D - 1);  // convert to absolute index
    return selected;
}

function nxt_candidate(nxt_candidate_count, grp_anomaly_cnt, max_matched, grp_matched_cnt) {
    // Save count for next expiry date
    const old_min = Math.min(nxt_candidate_count.matched_cnt, nxt_candidate_count.grp_matched_cnt);
    const new_min = Math.min(max_matched, grp_matched_cnt);
    if (old_min < new_min) {
        nxt_candidate_count.anomaly_cnt = grp_anomaly_cnt;
        nxt_candidate_count.matched_cnt = max_matched;
        nxt_candidate_count.grp_matched_cnt = grp_matched_cnt;
    } else if (old_min == new_min) {
        if (Math.max(nxt_candidate_count.matched_cnt, nxt_candidate_count.grp_matched_cnt) < Math.max(max_matched, grp_matched_cnt)) {
            nxt_candidate_count.anomaly_cnt = grp_anomaly_cnt;
            nxt_candidate_count.matched_cnt = max_matched;
            nxt_candidate_count.grp_matched_cnt = grp_matched_cnt;
        }
    }
}

function select_prediction_ca(threshold, time_window, hist_data, hist_ts, anomalies, expired_pred) {
    let selected = -1;
    let second_selected = {
        selected: -1,
        exact_grp_matched: 0
    };
    let predictions = [];
    let end_D;      // Group end day
    let start_D;    // Group start day
    let net_end_D;  // Net end day
    let max_matched;
    let cmp_day_cnt;
    let result = {
        anomaly_cnt: 0,
        matched_cnt: 0,
        grp_matched_cnt: 0,
        threshold: threshold,
        time_window: time_window,
        ts_period: ca_const.TS_PERIOD,
        min_matched_for_selection: ca_const.MIN_MATCHED_FOR_SELECTION,
        pred_expiry_days: ca_const.PRED_EXPIRY,
        max_days_to_cmp: ca_const.MAX_DAYS_TO_CMP
    };
    let nxt_candidate_count = {
        anomaly_cnt: 0,
        matched_cnt: 0,
        grp_matched_cnt: 0
    };
    let stat = {
        matched: [],
        d_range:  [],
        xMismatch: [],
        xMismatch_D: [],
        matched_D: [],
        d_of_m: [],
        d_anomaly: [],
        adjusted: []
    };

    end_D = Math.floor(hist_data.length / ca_const.DAY_ENTRY_CNT);
    net_end_D = end_D;
    start_D = (end_D > ca_const.MAX_DAYS_TO_CMP) ? (end_D - ca_const.MAX_DAYS_TO_CMP + 1) : 1;
    cmp_day_cnt = end_D - start_D + 1;  // Number of days in a group to compare
    stat.adjusted = Array(cmp_day_cnt).fill(0);
    stat.matched = Array(cmp_day_cnt).fill(0);
    stat.d_range = Array(cmp_day_cnt).fill(0);
    stat.xMismatch = Array(cmp_day_cnt).fill(0);
    stat.matched_D = [...Array(cmp_day_cnt)].map(()=>Array(cmp_day_cnt).fill(0));
    stat.xMismatch_D = [...Array(cmp_day_cnt)].map(()=>Array(cmp_day_cnt).fill(0));
    stat.d_of_m = Array(cmp_day_cnt).fill(0);
    stat.d_anomaly = Array(cmp_day_cnt).fill(0);
    // console.log(`Time window points: ${time_window} threshold: ${threshold} hist data len: ${hist_data.length} days: ${end_D}`);

    // This loop may run multiple times in group of 14 days picking latest 14 days and then shifting the 14 days group to 7 days back in history
    // For example. History start day = 1st Mar and end day = 21st Mar. Then 1st group will be 8th Mar to 21st Mar and 2nd group will be 1st Mar to 14th Mar
    const cond = true; // lint issue fixed
    while (cond) {
        // console.log(`Comparing Day ${start_D} to ${end_D}`);
        // TODO: Following check is redundant, see end_D initialization
        if (end_D * ca_const.DAY_ENTRY_CNT > hist_data.length) {
            // console.log(`Hist data less then end Day[${end_d}] ${end_d * ca_const.DAY_ENTRY_CNT}`);
            end_D = Math.floor(hist_data.length / ca_const.DAY_ENTRY_CNT);
            // console.log(`End day changed to ${end_d}`);
        }
        cmp_day_cnt = end_D - start_D + 1;
        // Pick day of the month
        for (let d=0; d < cmp_day_cnt; d++) {
            let m_utc = moment(hist_ts[(start_D - 1 + d) * ca_const.DAY_ENTRY_CNT]).utc();
            let idx = anomalies.ts.indexOf(m_utc.format());
            stat.d_of_m[d] = m_utc.date();
            stat.d_anomaly[d] = (idx == -1) ? 0 : anomalies.count[idx];
        }
        for (let r = 0; r < cmp_day_cnt; r++) {
            stat.adjusted[r] = 0;
            stat.matched[r] = 0;
            stat.d_range[r] = 0;
            stat.xMismatch[r] = 0;
            for (let c = 0; c < cmp_day_cnt; c++) {
                stat.xMismatch_D[r][c] = 0;
                stat.matched_D[r][c] = 0;
                if (r == c)
                    stat.matched_D[r][c] = stat.d_of_m[r];
            }
        }

        predictions.length = 0;
        for (let i = 0; i < cmp_day_cnt; i++) {
            predictions.push(hist_data.slice((start_D - 1 + i) * ca_const.DAY_ENTRY_CNT, (start_D + i) * ca_const.DAY_ENTRY_CNT));
        }

        day_compared_with_next_days_cross(predictions, start_D, end_D, threshold, time_window, cmp_day_cnt, hist_data, hist_ts, stat);

        max_matched = Math.max( ...stat.matched ) | 0;
        console.log(`Comparing Day ${start_D} to ${end_D}`);
        console.log(`Day of month: ${stat.d_of_m}`);
        console.log(`Adjusted: ${stat.adjusted}`);
        console.log(`Total Matched: ${stat.matched}`);
        console.log(`Total xMismatched: ${stat.xMismatch}`);
        console.log(`Anomalies: ${stat.d_anomaly}`);
        console.log(`Value range: ${stat.d_range}`);
        console.log(`Matched Days:`);
        for (let r = 0; r < cmp_day_cnt; r++) {
            console.log(`[${stat.d_of_m[r]}]: ${stat.matched_D[r].filter(v => v != 0)}`);
        }
        console.log("xMismatched Days:");
        for (let r = 0; r < cmp_day_cnt; r++) {
            console.log(`[${stat.d_of_m[r]}]: ${stat.xMismatch_D[r].filter(v => v != 0)}`);
        }

        let failed = Array(cmp_day_cnt).fill(0);
        let max_loop = cmp_day_cnt;
        let grp_matched_cnt = 0;
        do {
            if (max_matched < 2) break;
            console.log(`Checking max_matched ${max_matched}`);
            let max_matched_passed = Array(cmp_day_cnt).fill(0);
            //console.log("MM_passed ",max_matched_passed);
            for (let k = cmp_day_cnt - 1; k >= 0; k--) {
                // Pick the day that has matched days == max_matched
                if ((failed[k] == 0) && (stat.matched[k] == max_matched)) {
                    grp_matched_cnt = 0;
                    max_matched_passed[k] = 1;
                    // Count number of days that includes all days in k
                    for (let j = 0; j < cmp_day_cnt; j++) {
                        if (stat.matched[j] >= max_matched) {
                            // Check if stat.matched_D[j] contains all elements of stat.matched_D[k]
                            if(stat.matched_D[k].every(val => stat.matched_D[j].includes(val))) {
                                grp_matched_cnt++;
                                // Set 1 if fully stat.matched else if > then set to 2, so that it isn't chosen as selected
                                max_matched_passed[j] = (stat.matched[j] == max_matched) ? 1 : 2;
                            }
                        }
                    }
                    console.log(`idx: ${k} grp_matched_cnt: ${grp_matched_cnt} max_matched_passed: ${max_matched_passed}`);
                    break;
                }
            }

            // Check for value range
            let grp_max_range = 0;
            for (let k = 0; k < cmp_day_cnt; k++) {
                if (max_matched_passed[k] == 1) {
                    if (grp_max_range < stat.d_range[k]) grp_max_range = stat.d_range[k];
                }
            }
            // Check for anomalies
            let grp_anomaly_cnt = 0;
            for (let k = 0; k < cmp_day_cnt; k++) {
                if (max_matched_passed[k] == 1) {
                    grp_anomaly_cnt += stat.d_anomaly[k];
                }
            }

            // Make selection
            // This outer loop may run multiple times in group of 14 days.
            // There may be 2 selections from each group,
            //  - selected (exact_grp_matched == max_matched) and break the loop
            //  - second_selected (grp_matched_cnt >= ca_const.MIN_MATCHED_FOR_SELECTION) && exact_grp_matched > second_selected.exact_grp_matched
            // If there is no 'selected' in all groups then chose 'second_selected'. The group with grp_matched_cnt greater then threshold
            // and highest exact_grp_matched.

            max_matched++; // Incremented to count self.
            //if (grp_max_range > threshold && grp_anomaly_cnt == 0) {
            if (grp_max_range > threshold) {
                const exact_grp_matched = max_matched_passed.reduce((result, x) => x == 1 ? ++result : result, 0);
                if (exact_grp_matched == max_matched) {
                    selected = pick_selected_day(cmp_day_cnt, max_matched_passed, start_D, net_end_D);
                    result.anomaly_cnt = grp_anomaly_cnt;
                    result.matched_cnt = max_matched;
                    result.grp_matched_cnt = grp_matched_cnt;
                    break;  // Selected
                } else if (grp_matched_cnt >= ca_const.MIN_MATCHED_FOR_SELECTION && exact_grp_matched > second_selected.exact_grp_matched) {
                    second_selected.selected = pick_selected_day(cmp_day_cnt, max_matched_passed, start_D, net_end_D);
                    second_selected.exact_grp_matched = grp_matched_cnt;
                    result.anomaly_cnt = grp_anomaly_cnt;
                    result.matched_cnt = max_matched;
                    result.grp_matched_cnt = grp_matched_cnt;
                }
            }

            nxt_candidate(nxt_candidate_count, grp_anomaly_cnt, max_matched, grp_matched_cnt);
            // Pick next max_matched
            // Mark all days with same set of matched days as failed
            console.log(`Failed day: ${failed}`);
            max_matched = 0;
            for (let k = 0; k < cmp_day_cnt; k++) {
                if (max_matched_passed[k] == 1)
                    failed[k] = 1;

                if ((failed[k] == 0) && (stat.matched[k] > max_matched)) {
                    max_matched = stat.matched[k];
                    console.log(`${k}: nxt max_matched ${max_matched}`);
                }
            }
            console.log(`-Failed day: ${failed}`);
        } while (--max_loop);

        //console.log(`results: ${JSON.stringify(result)}`);
        if ((selected != -1) || (start_D == 1)) break;
        end_D = start_D + ca_const.D_IN_WEEK - 1;
        if (end_D < ca_const.MAX_DAYS_TO_CMP) end_D = ca_const.MAX_DAYS_TO_CMP;
        start_D = (end_D > ca_const.MAX_DAYS_TO_CMP) ? end_D - ca_const.MAX_DAYS_TO_CMP : 1;
    }

    if (selected == -1) selected = second_selected.selected;
    if (selected != -1) {
        // If selected day is same or before as in the expired prediction then fail it
        result.selected_day = hist_ts[selected * ca_const.DAY_ENTRY_CNT];
        if ((expired_pred !== undefined) && ('selected_day' in expired_pred) && (moment(result.selected_day).isSameOrBefore(moment(expired_pred.selected_day)))) {
            console.log(`Mark selected prediction ${result.selected_day} as fail. Selected day <= Selected day in expired prediction ${expired_pred.selected_day}`);
            selected = second_selected.selected; // Select second selected
        }

        if (selected != -1) {
            // Also fail if selected day is ca_const.MAX_DAYS_TO_CMP(14) days behind the training data end.
            const end_date = hist_ts[net_end_D * ca_const.DAY_ENTRY_CNT];
            result.selected_day = hist_ts[selected * ca_const.DAY_ENTRY_CNT];
            if (moment.duration(moment(end_date).diff(moment(result.selected_day))).asDays() > ca_const.MAX_DAYS_TO_CMP) {
                console.log(`Mark selected prediction ${result.selected_day} as fail. Selected day is more then ${ca_const.MAX_DAYS_TO_CMP} days behind training date ${end_date}`);
            } else {
                result.predicted = true;
                result.selected_day = hist_ts[selected * ca_const.DAY_ENTRY_CNT];
                //result.predictions = predictions[selected];
                result.predictions = hist_data.slice(selected * ca_const.DAY_ENTRY_CNT, (selected + 1) * ca_const.DAY_ENTRY_CNT);
            }
        }
    }
    if (selected == -1) {
        result.predicted = false;
        // Report first loop counts
        result.anomaly_cnt = nxt_candidate_count.anomaly_cnt;
        result.matched_cnt = nxt_candidate_count.matched_cnt;
        result.grp_matched_cnt = nxt_candidate_count.grp_matched_cnt;
    }
    return result;
}

async function save_prediction(asset_id, type, prediction, old_data, training_date, pred_id) {
    try {
        if (prediction === undefined) {
            prediction = {
                predictions: [],
                predicted: false
            };

            switch (type) {
                case "poc":
                case "battery_am":
                case "battery_pm":
                    prediction.wakeup_event = '0';
                    prediction.nighttime_stow = '0';
                    prediction.ml_data = type == 'poc' ? [1, 1] : (type == 'battery_am') ? [1, 0] : [0, 1];
                    type = 'poc';
                break;
                case "current_angle":
                break;
            }
        }
        const p_data = {
            ...prediction,
            "asset_id" : asset_id,
            "type" : type,
            "enable" : true,
            "training_start_time"  : "0"
        };
        if (training_date === undefined) {
            training_date = moment().utc().format();
            p_data.expiry = training_date;
        } else {
            let pred_expiry;
            switch (type) {
                case "poc":
                    pred_expiry = poc_const.PRED_EXPIRY;
                break;
                case "current_angle":
                    pred_expiry = ca_const.PRED_EXPIRY;
                break;
            }
            // If selected day and training date difference is more then half of pred_expiry then reduce expiry accordingly
            if (('selected_day' in prediction) && (moment(prediction.selected_day).isValid())) {
                if (moment.duration(moment(training_date).diff(moment(prediction.selected_day))).asDays() > (pred_expiry/2))
                    pred_expiry /= 2;
            }
            p_data.expiry = moment(training_date).utc().add(pred_expiry, 'days').format();
        }
        p_data.timestamp = training_date;
        let ncResults = await db.getSiteConfig(asset_id);
        if (ncResults && ncResults.length) {
            p_data.nc_asset_id = ncResults[0].nc_asset_id;
            p_data.nc_lat = ncResults[0].nc_lat;
            p_data.nc_lng = ncResults[0].nc_lng;
        } else if (old_data != undefined) {
            p_data.nc_asset_id = old_data.nc_asset_id;
            p_data.nc_lat = old_data.nc_lat;
            p_data.nc_lng = old_data.nc_lng;
        } else {
            console.log(`No nc info for asset ${asset_id}`)
        }
        console.log(`Save prediction [DB]: ${JSON.stringify(p_data, null, 2)}`);
        let result = await db.insertPredictionData(p_data, pred_id);

        return (result == 0) ? p_data : null;
    }
    catch (err) {
        console.log("ERR: ", err);
        return null;
    }
}

async function train_current_angle_model(asset_id, start_date, end_date, expired_pred, pred_id) {
    let r_val = 0;
    let p_result = {};

    let es_result = await db.getHistoryData({asset_id, start_date, end_date, es_data: 'current_angle', q_type: 'agg'});

    // console.log(`Get training data: ${JSON.stringify(es_result, null, 2)}`);
    if (es_result == null) {
        console.log(`Get training data failed`);
        r_val = -1;
    } else {
        console.log(`Found ${es_result.length} entries for training from ${start_date} to ${end_date}`);
        let training_data = es_result.map(a => a.current_angle);
        let training_ts = es_result.map(a => a.timestamp);
        console.log(`Training data[${training_data.length}]: ${training_data}`);
        console.log(`Training TS[${training_ts.length}]: ${training_ts}`);
        // Convert to uniform sampling rate
        let { uniform_value, uniform_ts } = resample_uniform(training_data, training_ts, start_date, end_date);
        console.log(`Uniform training data[${uniform_value.length}]: ${uniform_value}`);
        console.log(`Uniform training TS[${uniform_ts.length}]: ${uniform_ts}`);

        let anomaly_data = {};

        es_result = await db.getAnomalyData(asset_id, start_date, end_date, 'current_angle', 'state', 0);
        // console.log('[DB] Get anomaly data_CA: ', db_debug);

        if (es_result === null || es_result?.length == 0) {
            console.log(`Get anomaly data failed`);
            anomaly_data.ts = [];
            anomaly_data.count = [];
        } else {
            anomaly_data.ts = es_result.map(a => moment(a?.timestamp).utc().format());
            anomaly_data.count = es_result.map(a => a?.current_angle);
            console.log(`Anomalies: ${JSON.stringify(anomaly_data, null, 2)}`);
        }

        console.log(`Data set for Select_prediction: from ${uniform_ts[0]} to ${uniform_ts[uniform_ts.length-1]}`);
        p_result = select_prediction_ca(ca_const.THRESHOLD, ca_const.TIME_WINDOW, uniform_value, uniform_ts, anomaly_data, expired_pred);
        console.log('Prediction Result : ', p_result)
        if (p_result.predicted == false) {
            console.log(`Failed to select prediction`);
            r_val = -2;
        }
        else {
            console.log(`Selected Prediction: TS ${p_result.selected_day} Len: ${p_result.predictions.length} Matched: ${p_result.matched_cnt}`
                + ` Grp_matched: ${p_result.grp_matched_cnt} Anomaly: ${p_result.anomaly_cnt}`);
            if ((es_result = await save_prediction(asset_id, "current_angle", p_result, expired_pred, end_date, pred_id)) == null) {
                console.log(`Failed to save prediction`);
                r_val = -3;
            } else {
                p_result.expiry = es_result.expiry;
            }
        }
    }
    p_result.rval = r_val;
    return p_result;
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

function select_prediction_POC(threshold, h_data, h_ts, anomalies) {
    let max_matched;
    let cmp_day_cnt;
    let result = {
        predicted: false,
        anomaly_cnt: 0,
        matched_cnt: 0,
        grp_matched_cnt: 0,
        predictions: [0, 0],
        wakeup_event: '0',
        nighttime_stow: '0',
        training_threshold: threshold,
        anomaly_percent_threshold: poc_const.PERCENT_THRESHOLD,
        min_matched_for_selection: poc_const.MIN_MATCHED_FOR_SELECTION,
        pred_expiry_days: poc_const.PRED_EXPIRY,
        event_expiry_mins: poc_const.WAKEUP_EXPIRY
    };
    let  matched = [];
    let d_anomaly = [];
    let matched_D = [];
    let d_of_m = [];

    cmp_day_cnt = h_ts.length;  // Number of days in a group to compare
    matched = Array(cmp_day_cnt).fill(0);
    matched_D = [...Array(cmp_day_cnt)].map(()=>Array(cmp_day_cnt).fill(0));
    d_of_m = Array(cmp_day_cnt).fill(0);
    d_anomaly = Array(cmp_day_cnt).fill(0);
    //console.log(`threshold: ${threshold} hist data len: ${h_data.length} days: ${cmp_day_cnt}`);

    // Pick day of the month and anomaly count
    for (let d = 0; d < cmp_day_cnt; d++) {
        let m_utc = moment(h_ts[d]).utc();
        let idx = anomalies.ts.indexOf(m_utc.format());
        d_of_m[d] = m_utc.date();
        d_anomaly[d] = (idx == -1) ? 0 : anomalies.count[idx];
    }
    //console.log(`Comparing Day ${d_of_m[0]} to ${d_of_m[cmp_day_cnt - 1]}`);

    // Init globals
    for (let r = 0; r < cmp_day_cnt; r++) {
        matched[r] = 0;
        for (let c = 0; c < cmp_day_cnt; c++) {
            matched_D[r][c] = 0;
            if (r == c)
                matched_D[r][c] = d_of_m[r];
        }
    }

    // Compare each day with each other day
    let c_max_hi, c_max_lo, c_min_hi, c_min_lo;
    let i;

    for (i = 0; i < cmp_day_cnt; i++) {
        //console.log("\n-----------------------\n");

        // Set hi and lo as percentage of passed threshold
        //c_max_hi = h_data[i].max + h_data[i].max * threshold / 100;
        //c_max_lo = h_data[i].max - h_data[i].max * threshold / 100;
        //c_min_hi = h_data[i].min + h_data[i].min * threshold / 100;
        //c_min_lo = h_data[i].min - h_data[i].min * threshold / 100;

        // Set hi and lo by adding passed threshold
        c_max_hi = h_data[i].max + threshold;
        c_max_lo = h_data[i].max - threshold;
        c_min_hi = h_data[i].min + threshold;
        c_min_lo = h_data[i].min - threshold;
        //console.log(`Cur max[${h_data[i].max}](${c_max_hi} - ${c_max_lo}) min[${h_data[i].min}](${c_min_hi} - ${c_min_lo})`);
        for (let j = 0; j < cmp_day_cnt; j++) {
            if ((h_data[j].max > c_max_hi) || (h_data[j].max < c_max_lo) || (h_data[j].min > c_min_hi) || (h_data[j].min < c_min_lo)) {
                //console.log(`${d_of_m[j]} Mismatch max[${h_data[j].max}] min[${h_data[j].min}]`);
            } else {
                //console.log(`${d_of_m[j]} OK`);
                matched[i]++;
                matched_D[i][j] = d_of_m[j];
            }
        }
    }

    max_matched = Math.max( ...matched ) | 0;
    console.log(`Comparing Day ${d_of_m[0]} to ${d_of_m[cmp_day_cnt - 1]}`);
    console.log(`Day of month: ${d_of_m}`);
    console.log(`Total Matched: ${matched}`);
    console.log(`Anomalies: ${d_anomaly}`);
    console.log(`Matched Days:`);
    for (let r = 0; r < cmp_day_cnt; r++) {
        console.log(`[${d_of_m[r]}]: ${matched_D[r].filter(v => v != 0)}`);
    }

    if (max_matched >= poc_const.MIN_MATCHED_FOR_SELECTION) {
        // Pick average as predicted
        for (let k = cmp_day_cnt - 1; k >= 0; k--) {
            if (matched[k] == max_matched) {
                result.anomaly_cnt += d_anomaly[k];
                if (result.grp_matched_cnt == 0) result.selected_day = h_ts[k];
                if (result.grp_matched_cnt < poc_const.MIN_MATCHED_FOR_SELECTION) {
                    result.predictions[0] += h_data[k].min;
                    result.predictions[1] += h_data[k].max;
                }
                result.grp_matched_cnt++;
            }
        }
        const divisor = (result.grp_matched_cnt < poc_const.MIN_MATCHED_FOR_SELECTION) ? result.grp_matched_cnt : poc_const.MIN_MATCHED_FOR_SELECTION;
        result.predictions[0] =  Math.round(result.predictions[0] / divisor);
        result.predictions[1] =  Math.round(result.predictions[1] / divisor);
        result.predicted = true;
    }
    result.matched_cnt = max_matched;

    //console.log(`results: ${JSON.stringify(result)}`);
    return result;
}

async function train_battery_POC_model(asset_id, start_date, end_date, expired_pred, pred_id) {
    let r_val = 0;
    let p_result = {};
    let zone_offset;

    // Time zone handling
    const site_tz = tzlookup(expired_pred.nc_lat || 0, expired_pred.nc_lng || 0);
    zone_offset = momentTimezone.tz.zone(site_tz).parse(momentTimezone(start_date));
    console.log(`[${expired_pred.nc_lat}, ${expired_pred.nc_lng}] Site TZ: ${site_tz} Abbr: ${ momentTimezone.tz.zone(site_tz).abbr(momentTimezone(start_date))} offset: ${zone_offset}`);
    try {
        let es_result = await db.getHistoryData({asset_id, start_date, end_date, es_data: 'poc', q_type: 'agg', zone_offset});
        // console.log('[DB] Get training data: ', es_result);

        if ((es_result == null) || (es_result.length == 0)) {
            console.log(`Get training data ${(es_result == null) ? 'failed' : 'No data'}`);
            r_val = -1;
        } else {
            console.log(`Found ${es_result.length} entries for training from ${start_date} to ${end_date}`);
            let training_data = es_result.map(a => a.poc);
            let training_ts = es_result.map(a => a.timestamp);
            console.log(`Training data: len: ${training_data.length} from ${training_ts[0]} to ${training_ts[training_ts.length-1]}`);

            // Transform data to required
            let { trans_value, trans_ts } = resample_min_max_per_day(training_data, training_ts, start_date, end_date, zone_offset);
            //console.log(`Transformed training data: ${trans_value.length} TS: ${trans_ts.length}\n`);

            let anomaly_data = { ts: [], count: [] };

            es_result = await db.getAnomalyData(asset_id, start_date, end_date, 'poc', 'state', 0, zone_offset);
            // console.log('[DB] Get anomaly data_POC: ', db_debug);

            if (es_result === null || es_result?.length == 0) {
                console.log(`Get anomaly data failed`);
                anomaly_data.ts = [];
                anomaly_data.count = [];
            } else {
                anomaly_data.ts = es_result.map(a => moment(a?.timestamp).add(zone_offset, 'minutes').utc().format());
                // anomaly_data.count = es_result.map(a => a.state.value);
                anomaly_data.count = es_result.map(a => a?.poc);
                //console.log(`Anomalies: ${JSON.stringify(anomaly_data, null, 2)}`);
            }
            //console.log(`Data set for Select_prediction: from ${trans_ts[0]} to ${trans_ts[trans_ts.length-1]}`);
            p_result = select_prediction_POC(poc_const.TRAINING_THRESHOLD, trans_value, trans_ts, anomaly_data);
            if (p_result.predicted == false) {
                console.log(`Failed to select prediction`);
                r_val = -2;
            } else {
                if ((expired_pred != undefined) && (expired_pred.wakeup_event != undefined)) {
                    p_result.wakeup_event = expired_pred.wakeup_event;
                    p_result.wakeup_expiry = expired_pred.wakeup_expiry;
                    p_result.nighttime_stow = expired_pred.nighttime_stow;
                    p_result.nighttime_stow_expiry = expired_pred.nighttime_stow_expiry;
                    p_result.ml_data = expired_pred.ml_data;
                }

                console.log(`Selected Prediction: TS ${p_result.selected_day} Matched: ${p_result.matched_cnt} Grp_matched: ${p_result.grp_matched_cnt} Anomaly: ${p_result.anomaly_cnt}`);
                if ((es_result = await save_prediction(asset_id, "poc", p_result, expired_pred, end_date, pred_id)) == null) {
                    console.log(`Failed to save prediction`);
                    r_val = -3;
                } else {
                    p_result.expiry = es_result.expiry;
                }
            }
        }
    }
    catch (err) {
        console.log("ERR: ", err);
        r_val = -4;
    }

    p_result.rval = r_val;
    return p_result;
}

module.exports = () => {
    return {
        ca_const,
        poc_const,
        train_current_angle_model,
        chk_current_angle_anomaly,
        train_battery_POC_model,
        chk_poc_anomaly
    };
};
