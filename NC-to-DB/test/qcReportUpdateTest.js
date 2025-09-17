const testBase = require("./common/testBase");
const { site } = require("./common/testData");
const { mockSns } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const testPg = require('./common/testPg');
const { verifyDbRow } = require('./common/dbVerify');

/***
   * 1. current_state: Flat last_updated, start_time, tracking_status, user_name,user_email,label, charged, min_temperature, max_wind_gust, max_average_wind
   * 2. current_state:MIN: last_updated, user_name,user_email,label, charged, min_temperature, max_wind_gust, max_average_wind
   * 3. current_state:MAX: last_updated, start_time_qc, user_name,user_email,label, charged, min_temperature, max_wind_gust, max_average_wind
   * 4. current_state:BACK_TO_MIN: last_updated, user_name,user_email,label, charged, min_temperature, max_wind_gust, max_average_wind,max_peak_motor_inrush_current,max_peak_motor_current,max_average_motor_current
   * 5. current_state:BACK_TO_FLAT: last_updated, user_name,user_email,label, charged, min_temperature, max_wind_gust, max_average_wind,max_peak_motor_inrush_current,max_peak_motor_current,max_average_motor_current
   * 6. current_state:DONE: last_updated,end_time_qc,end_time user_name,user_email,label, charged, min_temperature, max_wind_gust, max_average_wind,max_peak_motor_inrush_current,max_peak_motor_current,max_average_motor_current
   * 7. current_state:STOP: last_updated,end_time_qc(optional if not filled),end_time user_name,user_email,label, charged, min_temperature, max_wind_gust, max_average_wind
   * 
   * 
   */
describe("qaqcReportUpdate Starts", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    //await testPg.delFasttrakHist(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const qcReportTestCases = [{
    name: "RemoteQC starts",
    snapAddr: rowbox.snap_addr_b64,
    timestamp: when,
    stage: 'FLAT',
    maxPeakMotorInrushCurrent: 0,
    maxPeakMotorCurrent: 0,
    maxAverageMotorCurrent: 0,
    statusBits: 0,
    label: 'wiki testing',
    userName: 'Waqas Iqbal',
    userEmail: 'waqas.iqbal@zigron.com',
    charged: 0,
    minTempurature: 0,
    maxWindGust: 0,
    maxAverageWind: 0,
    trackingStatus: 12,
    pv1: {
      min: 0,
      max: 0
    },
    pv2: {
      min: 0,
      max: 0
    }
  }];

  for (const testcase of qcReportTestCases) {

    it(testcase.name, async () => {
      const qaqcreport = testcase;
      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: qaqcreport.trackingStatus,
        last_updated: new Date((when.seconds - 3000) * 1000),
        start_time: new Date((when.seconds - 3000) * 1000),
        start_time_qc: null,
        end_time: null,
        end_time_qc: null,
        plus60_complete: null,
        minus60_complete: null,
        current_state: null,
        max_peak_motor_inrush_current: null,
        max_peak_motor_current: null,
        max_average_motor_current: null,
        status_bits: null,
        label: null,
        user_name: null,
        user_email: null,
        charged: null,
        min_temperature: null,
        max_wind_gust: null,
        max_average_wind: null,
        battery_start: null,
        battery_stop: null,
        last_state: null
      });

      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        snapAddr: rowbox.snap_addr,
        stage: qaqcreport.stage,
        user_name: qaqcreport.userName,
        user_email: qaqcreport.userEmail,
        type: "elastic_search-1",
        channel: "qc_update",
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        lastState: null,
        siteMode: 0
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ qaqcReportUpdate: qaqcreport });

      expect(scopeSns.isDone()).to.equal(true);
      expect(result).to.equal(true);

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: qaqcreport.trackingStatus,
        current_state: 'FLAT',
        // last_updated: new Date((when.seconds - 1500) * 1000),
        end_time: null,
        plus60_complete: null,
        minus60_complete: null,
        max_peak_motor_inrush_current: 0,
        max_peak_motor_current: 0,
        max_average_motor_current: 0,
        status_bits: 0,
        label: 'wiki testing',
        user_name: 'Waqas Iqbal',
        user_email: 'waqas.iqbal@zigron.com',
        charged: 0,
        min_temperature: 0,
        max_wind_gust: 0,
        max_average_wind: 0,
        battery_start: null,
        battery_stop: null
      });
    });
  }
});



describe("qaqcReportUpdate Move to Min", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    //await testPg.delFasttrakHist(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const qcReportTestCases = [
    {
      name: "RemoteQC Move To Min From Flat",
      snapAddr: rowbox.snap_addr_b64,
      timestamp: when,
      stage: 'MIN',
      maxPeakMotorInrushCurrent: 0,
      maxPeakMotorCurrent: 0,
      maxAverageMotorCurrent: 0,
      statusBits: 0,
      label: 'wiki testing',
      userName: 'Waqas Iqbal',
      userEmail: 'waqas.iqbal@zigron.com',
      charged: 96,
      minTempurature: 0,
      maxWindGust: 20,
      maxAverageWind: 15,
      trackingStatus: 12,
      pv1: {
        min: 0,
        max: 0
      },
      pv2: {
        min: 0,
        max: 0
      }
    }];

  for (const testcase of qcReportTestCases) {

    it(testcase.name, async () => {
      const qaqcreport = testcase;
      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: qaqcreport.trackingStatus,
        last_updated: new Date((when.seconds - 2500) * 1000),
        start_time_qc: null,
        end_time: null,
        end_time_qc: null,
        plus60_complete: null,
        minus60_complete: null,
        last_state: "FLAT"
      });

      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        snapAddr: rowbox.snap_addr,
        stage: qaqcreport.stage,
        user_name: qaqcreport.userName,
        user_email: qaqcreport.userEmail,
        type: "elastic_search-1",
        channel: "qc_update",
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        lastState: "FLAT",
        siteMode: 0
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ qaqcReportUpdate: qaqcreport });

      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(true);

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: qaqcreport.trackingStatus,
        current_state: 'MIN',
        end_time: null,
        plus60_complete: null,
        minus60_complete: null,
        max_peak_motor_inrush_current: 0,
        max_peak_motor_current: 0,
        max_average_motor_current: 0,
        status_bits: 0,
        label: 'wiki testing',
        user_name: 'Waqas Iqbal',
        user_email: 'waqas.iqbal@zigron.com',
        charged: 96,
        min_temperature: 0,
        max_wind_gust: 20,
        max_average_wind: 15,
        battery_start: null,
        battery_stop: null
      });
    });
  }
});

describe("qaqcReportUpdate Move from Min to Max", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    //await testPg.delFasttrakHist(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const qcReportTestCases = [
    {
      name: "RemoteQC Move To Max From Min",
      snapAddr: rowbox.snap_addr_b64,
      timestamp: when,
      stage: 'MAX',
      maxPeakMotorInrushCurrent: 0,
      maxPeakMotorCurrent: 0,
      maxAverageMotorCurrent: 0,
      statusBits: 0,
      label: 'wiki testing',
      userName: 'Waqas Iqbal',
      userEmail: 'waqas.iqbal@zigron.com',
      charged: 90,
      minTempurature: 0,
      maxWindGust: 21,
      maxAverageWind: 16,
      trackingStatus: 12,
      pv1: {
        min: 0,
        max: 0
      },
      pv2: {
        min: 0,
        max: 0
      }
    }];

  for (const testcase of qcReportTestCases) {

    it(testcase.name, async () => {
      const qaqcreport = testcase;
      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: qaqcreport.trackingStatus,
        last_updated: new Date((when.seconds - 2000) * 1000),
        start_time_qc: null,
        end_time: null,
        end_time_qc: null,
        plus60_complete: null,
        minus60_complete: null,
        last_state: "MIN"
      });

      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        snapAddr: rowbox.snap_addr,
        stage: qaqcreport.stage,
        user_name: qaqcreport.userName,
        user_email: qaqcreport.userEmail,
        type: "elastic_search-1",
        channel: "qc_update",
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        lastState: "MIN",
        siteMode: 0
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ qaqcReportUpdate: qaqcreport });


      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(true);

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: qaqcreport.trackingStatus,
        current_state: 'MAX',
        start_time_qc: new Date((when.seconds) * 1000),
        end_time: null,
        plus60_complete: null,
        minus60_complete: null,
        max_peak_motor_inrush_current: 0,
        max_peak_motor_current: 0,
        max_average_motor_current: 0,
        status_bits: 0,
        label: 'wiki testing',
        user_name: 'Waqas Iqbal',
        user_email: 'waqas.iqbal@zigron.com',
        charged: 90,
        min_temperature: 0,
        max_wind_gust: 21,
        max_average_wind: 16,
        battery_start: 90,
        battery_stop: null
      });
    });
  }
});


describe("qaqcReportUpdate Move from Max to Min", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    //await testPg.delFasttrakHist(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const qcReportTestCases = [
    {
      name: "RemoteQC Move Back To Min From Max",
      snapAddr: rowbox.snap_addr_b64,
      timestamp: when,
      stage: 'BACK_TO_MIN',
      maxPeakMotorInrushCurrent: 1.6,
      maxPeakMotorCurrent: 1.5,
      maxAverageMotorCurrent: 1.2,
      statusBits: 0,
      label: 'wiki testing',
      userName: 'Waqas Iqbal',
      userEmail: 'waqas.iqbal@zigron.com',
      charged: 85,
      minTempurature: 0,
      maxWindGust: 21.5,
      maxAverageWind: 16.5,
      trackingStatus: 12,
      pv1: {
        min: 0,
        max: 0
      },
      pv2: {
        min: 0,
        max: 0
      }
    }];

  for (const testcase of qcReportTestCases) {

    it(testcase.name, async () => {
      const qaqcreport = testcase;
      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: qaqcreport.trackingStatus,
        last_updated: new Date((when.seconds - 1500) * 1000),
        end_time: null,
        end_time_qc: null,
        minus60_complete: null,
        last_state: "MAX"
      });

      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        snapAddr: rowbox.snap_addr,
        stage: qaqcreport.stage,
        user_name: qaqcreport.userName,
        user_email: qaqcreport.userEmail,
        type: "elastic_search-1",
        channel: "qc_update",
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        lastState: "MAX",
        siteMode: 0
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ qaqcReportUpdate: qaqcreport });

      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(true);

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: qaqcreport.trackingStatus,
        current_state: 'BACK_TO_MIN',
        end_time_qc: null,
        end_time: null,
        plus60_complete: null,
        minus60_complete: null,
        max_peak_motor_inrush_current: 1.600000023841858,
        max_peak_motor_current: 1.5,
        max_average_motor_current: 1.2000000476837158,
        status_bits: 0,
        label: 'wiki testing',
        user_name: 'Waqas Iqbal',
        user_email: 'waqas.iqbal@zigron.com',
        charged: 85,
        min_temperature: 0,
        max_wind_gust: 21.5,
        max_average_wind: 16.5,
        battery_start: 90,
        battery_stop: null
      });
    });
  }
});


describe("qaqcReportUpdate Move from Min to Flat", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    //await testPg.delFasttrakHist(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const qcReportTestCases = [
    {
      name: "RemoteQC Move Back To Flat From Min",
      snapAddr: rowbox.snap_addr_b64,
      timestamp: when,
      stage: 'BACK_TO_FLAT',
      maxPeakMotorInrushCurrent: 1.6,
      maxPeakMotorCurrent: 1.5,
      maxAverageMotorCurrent: 1.2,
      statusBits: 0,
      label: 'wiki testing',
      userName: 'Waqas Iqbal',
      userEmail: 'waqas.iqbal@zigron.com',
      charged: 90,
      minTempurature: 0,
      maxWindGust: 21.5,
      maxAverageWind: 16.5,
      trackingStatus: 12,
      pv1: {
        min: 0,
        max: 0
      },
      pv2: {
        min: 0,
        max: 0
      }
    }];

  for (const testcase of qcReportTestCases) {

    it(testcase.name, async () => {
      const qaqcreport = testcase;
      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: qaqcreport.trackingStatus,
        last_updated: new Date((when.seconds - 1500) * 1000),
        current_state: 'BACK_TO_MIN',
        plus60_complete: null,
        charged: 90,
        end_time: null,
        end_time_qc: null,
        minus60_complete: null,
        battery_start: 90,
        last_state: "MAX"
      });
      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        snapAddr: rowbox.snap_addr,
        stage: qaqcreport.stage,
        user_name: qaqcreport.userName,
        user_email: qaqcreport.userEmail,
        type: "elastic_search-1",
        channel: "qc_update",
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        lastState: "BACK_TO_MIN",
        siteMode: 0
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ qaqcReportUpdate: qaqcreport });

      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(true);

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: qaqcreport.trackingStatus,
        current_state: 'BACK_TO_FLAT',
        end_time_qc: null,
        end_time: null,
        plus60_complete: null,
        minus60_complete: null,
        max_peak_motor_inrush_current: 1.600000023841858,
        max_peak_motor_current: 1.5,
        max_average_motor_current: 1.2000000476837158,
        status_bits: 0,
        label: 'wiki testing',
        user_name: 'Waqas Iqbal',
        user_email: 'waqas.iqbal@zigron.com',
        charged: 90,
        min_temperature: 0,
        max_wind_gust: 21.5,
        max_average_wind: 16.5,
        battery_start: 90,
        battery_stop: null
      });
    });
  }
});


describe("qaqcReportUpdate Done For 1P System", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    //await testPg.delFasttrakHist(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const qcReportTestCases = [
    {
      name: "RemoteQC Done",
      snapAddr: rowbox.snap_addr_b64,
      timestamp: when,
      stage: 'DONE',
      maxPeakMotorInrushCurrent: 1.6,
      maxPeakMotorCurrent: 1.5,
      maxAverageMotorCurrent: 1.2,
      statusBits: 0,
      label: 'wiki testing',
      userName: 'Waqas Iqbal',
      userEmail: 'waqas.iqbal@zigron.com',
      charged: 85,
      minTempurature: 0,
      maxWindGust: 21.5,
      maxAverageWind: 16.5,
      trackingStatus: 12,
      pv1: {
        min: 0,
        max: 0
      },
      pv2: {
        min: 0,
        max: 0
      }
    }];

  for (const testcase of qcReportTestCases) {

    it(testcase.name, async () => {
      const qaqcreport = testcase;
      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: qaqcreport.trackingStatus,
        last_updated: new Date((when.seconds - 1000) * 1000),
        current_state: 'BACK_TO_FLAT',
        end_time: null,
        end_time_qc: null,
        minus60_complete: false,
        last_state: "BACK_TO_MIN"
      });

      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        snapAddr: rowbox.snap_addr,
        stage: qaqcreport.stage,
        user_name: qaqcreport.userName,
        user_email: qaqcreport.userEmail,
        type: "elastic_search-1",
        channel: "qc_update",
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        lastState: "BACK_TO_FLAT",
        siteMode: 0
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ qaqcReportUpdate: qaqcreport });

      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(true);

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: qaqcreport.trackingStatus,
        current_state: 'DONE',
        end_time_qc: new Date((when.seconds) * 1000),
        plus60_complete: true,
        minus60_complete: true,
        max_peak_motor_inrush_current: 1.600000023841858,
        max_peak_motor_current: 1.5,
        max_average_motor_current: 1.2000000476837158,
        status_bits: 0,
        label: 'wiki testing',
        user_name: 'Waqas Iqbal',
        user_email: 'waqas.iqbal@zigron.com',
        charged: 85,
        min_temperature: 0,
        max_wind_gust: 21.5,
        max_average_wind: 16.5,
        battery_start: 90,
        battery_stop: 85
      });
    });
  }
});

describe("qaqcReportUpdate Done", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    //await testPg.delFasttrakHist(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const qcReportTestCases = [
    {
      name: "RemoteQC Done",
      snapAddr: rowbox.snap_addr_b64,
      timestamp: when,
      stage: 'DONE',
      maxPeakMotorInrushCurrent: 1.6,
      maxPeakMotorCurrent: 1.5,
      maxAverageMotorCurrent: 1.2,
      statusBits: 0,
      label: 'wiki testing',
      userName: 'Waqas Iqbal',
      userEmail: 'waqas.iqbal@zigron.com',
      charged: 85,
      minTempurature: 0,
      maxWindGust: 21.5,
      maxAverageWind: 16.5,
      trackingStatus: 12,
      pv1: {
        min: 0,
        max: 0
      },
      pv2: {
        min: 0,
        max: 0
      }
    }];

  for (const testcase of qcReportTestCases) {

    it(testcase.name, async () => {
      const qaqcreport = testcase;
      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: qaqcreport.trackingStatus,
        last_updated: new Date((when.seconds - 1000) * 1000),
        current_state: 'BACK_TO_MIN',
        end_time: null,
        end_time_qc: null,
        minus60_complete: false,
        last_state: "MAX"
      });

      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        snapAddr: rowbox.snap_addr,
        stage: qaqcreport.stage,
        user_name: qaqcreport.userName,
        user_email: qaqcreport.userEmail,
        type: "elastic_search-1",
        channel: "qc_update",
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        lastState: "BACK_TO_MIN",
        siteMode: 0
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ qaqcReportUpdate: qaqcreport });

      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(true);

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: qaqcreport.trackingStatus,
        current_state: 'DONE',
        end_time_qc: new Date((when.seconds) * 1000),
        plus60_complete: true,
        minus60_complete: true,
        max_peak_motor_inrush_current: 1.600000023841858,
        max_peak_motor_current: 1.5,
        max_average_motor_current: 1.2000000476837158,
        status_bits: 0,
        label: 'wiki testing',
        user_name: 'Waqas Iqbal',
        user_email: 'waqas.iqbal@zigron.com',
        charged: 85,
        min_temperature: 0,
        max_wind_gust: 21.5,
        max_average_wind: 16.5,
        battery_start: 90,
        battery_stop: 85
      });
    });
  }
});

describe("qaqcReportUpdate STOP", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    //await testPg.delFasttrakHist(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const qcReportTestCases = [
    {
      name: "RemoteQC STOP WHEN ALREADY DONE",
      snapAddr: rowbox.snap_addr_b64,
      timestamp: when,
      stage: 'STOP',
      maxPeakMotorInrushCurrent: 1.6,
      maxPeakMotorCurrent: 1.5,
      maxAverageMotorCurrent: 1.2,
      statusBits: 0,
      label: 'wiki testing',
      userName: 'Waqas Iqbal',
      userEmail: 'waqas.iqbal@zigron.com',
      charged: 85,
      minTempurature: 0,
      maxWindGust: 21.5,
      maxAverageWind: 16.5,
      trackingStatus: 12,
      pv1: {
        min: 0,
        max: 0
      },
      pv2: {
        min: 0,
        max: 0
      }
    }];

  for (const testcase of qcReportTestCases) {

    it(testcase.name, async () => {
      const qaqcreport = testcase;
      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: qaqcreport.trackingStatus,
        last_updated: new Date((when.seconds - 1000) * 1000),
        end_time: null,
        end_time_qc: null,
        // minus60_complete: null,
        last_state: "DONE"
      });

      const payload = {
        timestamp: new Date((when.seconds) * 1000),
        snapAddr: rowbox.snap_addr,
        stage: qaqcreport.stage,
        user_name: qaqcreport.userName,
        user_email: qaqcreport.userEmail,
        type: "elastic_search-1",
        channel: "qc_update",
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        lastState: "DONE",
        siteMode: 0
      }
      const scopeSns = mockSns(payload);
      const result = await testBase.invokeLambda({ qaqcReportUpdate: qaqcreport });

      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(true);

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: qaqcreport.trackingStatus,
        current_state: 'STOP',
        end_time_qc: new Date((when.seconds) * 1000),
        plus60_complete: true,
        minus60_complete: true,
        max_peak_motor_inrush_current: 1.600000023841858,
        max_peak_motor_current: 1.5,
        max_average_motor_current: 1.2000000476837158,
        status_bits: 0,
        label: 'wiki testing',
        user_name: 'Waqas Iqbal',
        user_email: 'waqas.iqbal@zigron.com',
        charged: 85,
        min_temperature: 0,
        max_wind_gust: 21.5,
        max_average_wind: 16.5,
        battery_start: 90,
        battery_stop: 85
      });
    });
  }
});