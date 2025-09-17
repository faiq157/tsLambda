const chai = require("chai");
const { expect } = chai;
const sinon = require("sinon");
const db = require("../utils/lib/db");
const loader = require("../index");
const moment = require("moment");
const {
  event,
  context,
  expired_prediction_poc,
  history_poc,
  expired_prediction_ca,
  history_ca,
  anomaly_data,
  prediction_result_poc,
  prediction_result_ca
} = require("./mockData");

describe("Machine Learning", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(async () => {
    await db.closeDBPool();
  });

  it("should correctly predict poc ml_training", async () => {
    const getExpiredPredictionsStub = sandbox.stub(db, "getExpiredPredictions");
    getExpiredPredictionsStub.resolves(expired_prediction_poc);

    const getHistoryDataStub = sandbox.stub(db, "getHistoryData");
    getHistoryDataStub.resolves(history_poc);

    const getAnomalyDataStub = sandbox.stub(db, "getAnomalyData");
    getAnomalyDataStub.resolves(anomaly_data);

    await loader.handler(event, context, false);

    const predictions = await db.getPredictionById(
      expired_prediction_poc[0].id
    );
    const res = {
      predictions: predictions.data.predictions,
      matched_cnt: predictions.data.matched_cnt,
      grp_matched_cnt: predictions.data.grp_matched_cnt,
      anomaly_cnt: predictions.data.anomaly_cnt,
      min_matched_for_selection: +predictions.data.min_matched_for_selection,
      predicted: predictions.data.predicted,
      ml_data: predictions.ml_data,
      asset_id: predictions.data.asset_id,
      type: predictions.data.type,
      enable: !predictions.data.enable,
      training_start_time: predictions.data.training_start_time,
    };

    // expect res to match prediction_result
    expect(res).to.deep.equal(prediction_result_poc);

    // predictions.expiry should be 14 days ahead
    expect(
      moment(predictions.expiry).diff(moment().add(14, "days"), "day")
    ).to.equal(0);
  });

  it("should correctly predict ca ml_training", async () => {
    const getExpiredPredictionsStub = sandbox.stub(db, "getExpiredPredictions");
    getExpiredPredictionsStub.resolves(expired_prediction_ca);

    const getHistoryDataStub = sandbox.stub(db, "getHistoryData");
    getHistoryDataStub.resolves(history_ca);

    const getAnomalyDataStub = sandbox.stub(db, "getAnomalyData");
    getAnomalyDataStub.resolves(anomaly_data);

    await loader.handler(event, context, false);

    const predictions = await db.getPredictionById(expired_prediction_ca[0].id);
    const res = {
      predictions: predictions.data.predictions,
      matched_cnt: predictions.data.matched_cnt,
      grp_matched_cnt: predictions.data.grp_matched_cnt,
      anomaly_cnt: predictions.data.anomaly_cnt,
      min_matched_for_selection: +predictions.data.min_matched_for_selection,
      predicted: predictions.data.predicted,
      ml_data: predictions.ml_data,
      asset_id: predictions.data.asset_id,
      type: predictions.data.type,
      enable: !predictions.data.enable,
      training_start_time: predictions.data.training_start_time,
    };

    // expect res to match prediction_result
    expect(res).to.deep.equal(prediction_result_ca);

    // predictions.expiry should be 14 days ahead
    expect(
      moment(predictions.expiry).diff(moment().add(14, "days"), "day")
    ).to.equal(0);
  });
});
