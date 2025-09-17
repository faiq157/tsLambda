process.env.NODE_ENV = "test";
process.env.IOT_PRIVATE_KEY = "\"test-key\"";
process.env.MY_AWS_IOT_PEM = "\"test-pem\"";
process.env.IOT_VERISIGN_PEM = "\"test-ca\"";

const sinon = require("sinon");
const chai = require("chai");
const { accuWeatherService } = require("../services/accuWeatherService");
const moment = require("moment");
const pg = require("pg");
const db = require("../db");
const { pgConfig, pgMasterConfig } = require("../pg");
//const { cloudAlertService } = require("../services/cloudAlertService");
const { notificationSettingService } = require("../services/notificationSettingService");
const { weatherStowService } = require("../services/weatherStowService");

const aws_integration = require("../aws_integration");
const iotPub = require("../mqtt");

const expect = chai.expect;

describe("AccuWeather Service", () => {
  let client;
  let pgWrite;
  let spies = {};
  let db_stub;
  let rClient;
  let wClient;
  const site_stow_xx_id_res = {
    id: '45f31068-b413-4486-8f01-e83fd0b36d41',
    site_id: 'ae691dfa-72bd-4e5e-8dc2-871878cadbc8', // Zig 16
    device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
    timestamp: new Date('2020-09-11T15:30:10Z'),
    active: false,
    stow_type: 'Weather_Forecast-Avg_Wind',
    state: 1,
    start_time: new Date('2020-09-11T14:30:00Z'),
    end_time: new Date('2020-09-11T16:15:00Z'),
    alarm_timestamp: new Date('2020-09-11T14:00:00Z'),
    alarm_start_time: new Date('2020-09-11T14:00:00Z'),
    alarm_end_time: new Date('2020-09-11T16:00:00Z'),
    alarm_value: 20,
    alarm_threshold: 10,
    alarm_text: null,
    hide_at_project_level: false,
    weather_forecast_override_end_time: null,
    connected: true,
    enable_weather_forecast: true,
    enable_weather_forecast_stow: true,
    enable_weather_alert_stow: true,
    aws_iot_principal_id: '6120ba8a9b8f744fced6ddceafd7c73bf5e5525b0b11e9eb1680940715378760'
  };

  const site_stow_xx_id_res1 = {
    id: '45f31068-b413-4486-8f01-e83fd0b36d42',
    site_id: 'ae691dfa-72bd-4e5e-8dc2-871878cadbc8', // Zig 16
    device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
    timestamp: new Date('2021-06-24T15:30:10Z'),
    active: false,
    stow_type: 'Weather_Forecast-Wind_Gust',
    state: 1,
    start_time: new Date('2021-06-24T14:30:00Z'),
    end_time: new Date('2021-06-24T16:15:00Z'),
    alarm_timestamp: new Date('2020-09-11T14:00:00Z'),
    alarm_start_time: new Date('2021-06-24T14:00:00Z'),
    alarm_end_time: new Date('2021-06-24T16:00:00Z'),
    alarm_value: 45,
    alarm_threshold: 40,
    alarm_text: null,
    connected: true,
    enable_weather_forecast: true,
    enable_weather_forecast_stow: true,
    enable_weather_alert_stow: true,
    aws_iot_principal_id: '6120ba8a9b8f744fced6ddceafd7c73bf5e5525b0b11e9eb1680940715378760'
  };

  const no_stow_info_res = {
    id: null,
    site_id: 'ae691dfa-72bd-4e5e-8dc2-871878cadbc8',
    timestamp: null,
    active: null,
    state: null,
    start_time: null,
    end_time: null,
    stow_type: null,
    alarm_start_time: null,
    alarm_end_time: null,
    alarm_value: null,
    alarm_threshold: null,
    alarm_text: null,
    connected: true,
    aws_iot_principal_id: '6120ba8a9b8f744fced6ddceafd7c73bf5e5525b0b11e9eb1680940715378760',
    enable_weather_forecast: true,
    enable_weather_forecast_stow: true,
    enable_weather_alert_stow: true
  };

  const nc_offline_alert = {
    rows: [
      {
        id: "45f31068",
        title: "AccuWeather Weather Stow Failed: NC is offline",
        created: "2020-09-11T10:00:00Z",
        message: "The site is in AccuWeather Weather Stow ...",
        params: '{"start_time":"2020-09-11T14:30:00Z","end_time":"2020-09-11T16:15:00Z","notification_threshold":80,"alarm_start_time":"2020-09-11T14:00:00.000Z","alarm_end_time":"2020-09-11T16:00:00.000Z","text":null}'
      }
    ]
  };

  const nc_events = [
    {
      channel: "local_weather_nc_online",
      timestamp: '2020-09-10T06:10:19.481Z',
      //asset_id: payload.asset_id,
      network_controller_id: 'e60e53ad-bd85-45ed-8e43-bbdb451ac45e',
      type: "elastic_search-1"
    },
    {
      channel: "local_weather_nc_reboot",
      timestamp: '2020-09-10T06:10:19.481Z',
      network_controller_id: 'e60e53ad-bd85-45ed-8e43-bbdb451ac45e',
      type: "elastic_search-1"
    }
  ];
  before(async () => {
    rClient = {
      connect: sinon.stub().resolves(true),
      query: sinon.stub().resolves({ rows: [] }),
      end: sinon.stub().resolves(true),
      type: "reader"
    };
    wClient = {
      connect: sinon.stub().resolves(true),
      query: sinon.stub().resolves({ rows: [] }),
      end: sinon.stub().resolves(true),
      type: "master"
    };
    // To differentiate reader and writer for testing with different stubs.
    pgMasterConfig.type = "master";
    pgConfig.type = "reader";
    db_stub = sinon.stub(pg, "Client");
    db_stub.withArgs(pgMasterConfig).returns(wClient);
    db_stub.withArgs(pgConfig).returns(rClient);
    client = new pg.Client(pgConfig);
    await client.connect();
    spies.iotPub = sinon.stub(iotPub, 'updateWeatherForecastStow').callsFake(() => {
      // need to mock out a success here, not sure what that is exactly
      return Promise.resolve(true);
    });
  });
  after(async () => {
    await client.end();
  });
  nc_events.forEach(event => {
    describe(`NC events: ${event.channel}`, () => {
      beforeEach(() => {
        sinon.resetHistory();
        pgWrite = new pg.Client(pgMasterConfig);
      });
      afterEach(async () => {
        await pgWrite.end();
      });

      it("Stow Not enabled", async () => {
        let res;
        site_stow_xx_id_res.enable_weather_forecast_stow = false;
        site_stow_xx_id_res.enable_weather_alert_stow = false;
        site_stow_xx_id_res.active = false;
        rClient.query.resolves({ rows: [site_stow_xx_id_res] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.notCalled(spies.iotPub);
      });

      it("Stow Not enabled. Pending stow info in DB", async () => {
        let res;
        site_stow_xx_id_res.enable_weather_forecast_stow = false;
        site_stow_xx_id_res.enable_weather_alert_stow = false;
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.state = 11;
        site_stow_xx_id_res1.active = false;
        site_stow_xx_id_res1.enable_weather_forecast_stow = false;
        site_stow_xx_id_res1.enable_weather_alert_stow = false;
        rClient.query.resolves({ rows: [site_stow_xx_id_res, site_stow_xx_id_res1] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
        sinon.assert.calledOnce(spies.iotPub);
        expect(spies.iotPub.getCall(0).calledWith(site_stow_xx_id_res.aws_iot_principal_id, {
          stow: false,
          stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
          start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
          end_time: moment(site_stow_xx_id_res.end_time).utc().format()
        })).to.be.true;
      });

      it("No stow info in DB", async () => {
        let res;
        rClient.query.resolves({ rows: [no_stow_info_res] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        //sinon.assert.callCount(db_stub, 1);
        //sinon.assert.callCount(rClient.connect, 1);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.notCalled(spies.iotPub);
      });

      it("Inactive stow info in DB", async () => {
        let res;
        site_stow_xx_id_res.enable_weather_forecast_stow = true;
        site_stow_xx_id_res.enable_weather_alert_stow = true;
        site_stow_xx_id_res.active = false;
        rClient.query.resolves({ rows: [site_stow_xx_id_res] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.callCount(rClient.end, 0);
        sinon.assert.notCalled(spies.iotPub);
      });

      it("Active stow info in DB. Pending false", async () => {
        let res;
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.state = 2;
        rClient.query.resolves({ rows: [site_stow_xx_id_res] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.notCalled(spies.iotPub);
      });

      it("Active pending stow info in DB. NC connected false", async () => {
        let res;
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.connected = false;
        site_stow_xx_id_res.state = 1;
        rClient.query.resolves({ rows: [site_stow_xx_id_res] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.notCalled(spies.iotPub);
      });

      it("Active pending stow info in DB. NC connected true", async () => {
        let res;
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.connected = true;
        site_stow_xx_id_res.state = 1;
        rClient.query.resolves({ rows: [site_stow_xx_id_res] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
        sinon.assert.calledOnce(spies.iotPub);
        expect(spies.iotPub.getCall(0).calledWith(site_stow_xx_id_res.aws_iot_principal_id, {
          stow: true,
          stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
          start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
          end_time: moment(site_stow_xx_id_res.end_time).utc().format()
        })).to.be.true;
      });

      it("Active multiple pending stow info in DB. NC connected true", async () => {
        let res;
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.connected = true;
        site_stow_xx_id_res.state = 1;
        site_stow_xx_id_res1.active = true;
        site_stow_xx_id_res1.connected = true;
        site_stow_xx_id_res1.state = 3;
        site_stow_xx_id_res1.enable_weather_forecast_stow = true;
        site_stow_xx_id_res1.enable_weather_alert_stow = true;
        site_stow_xx_id_res1.enable_weather_forecast = true;
        rClient.query.resolves({ rows: [site_stow_xx_id_res, site_stow_xx_id_res1] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
        sinon.assert.callCount(spies.iotPub, 2);
        expect(spies.iotPub.getCall(0).calledWith(site_stow_xx_id_res.aws_iot_principal_id, {
          stow: true,
          stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
          start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
          end_time: moment(site_stow_xx_id_res.end_time).utc().format()
        })).to.be.true;
        expect(spies.iotPub.getCall(1).calledWith(site_stow_xx_id_res1.aws_iot_principal_id, {
          stow: true,
          stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res1),
          start_time: moment(site_stow_xx_id_res1.start_time).utc().format(),
          end_time: moment(site_stow_xx_id_res1.end_time).utc().format()
        })).to.be.true;
      });

      it("Active pending stow end info in DB. NC connected true", async () => {
        let res;
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.connected = true;
        site_stow_xx_id_res.state = 11;
        rClient.query.resolves({ rows: [site_stow_xx_id_res] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
        sinon.assert.calledOnce(spies.iotPub);
        sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
          stow: false,
          stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
          start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
          end_time: moment(site_stow_xx_id_res.end_time).utc().format()
        });
      });

      it("Active pending stow info in DB. NC connected true. NC Offline Active Alert", async () => {
        let res;
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.connected = true;
        site_stow_xx_id_res.state = 1;
        rClient.query.resolves({ rows: [site_stow_xx_id_res] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 1);
        sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
        sinon.assert.calledOnce(spies.iotPub);
        expect(spies.iotPub.getCall(0).calledWith(site_stow_xx_id_res.aws_iot_principal_id, {
          stow: true,
          stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
          start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
          end_time: moment(site_stow_xx_id_res.end_time).utc().format()
        })).to.be.true;
        sinon.assert.notCalled(wClient.query);
      });
    });
  });

  const nc_response = {
    channel: 'local_weather_nc_stow_update',
    network_controller_id: 'e60e53ad-bd85-45ed-8e43-bbdb451ac45e',
    need_accu_weather_update: false,
    accu_stow: true,
    stow_type: 'avg_wind',
    stow_start_time: '2020-09-11T15:00:00Z',
    stow_end_time: '2020-09-11T16:30:00Z',
    type: "elastic_search-1"
  };

  describe(`NC Response: ${nc_response.channel}`, () => {
    before(() => {
      spies.weatherStowService = sinon.stub(weatherStowService, 'handler').resolves(true);
    });
    after(() => {
      spies.weatherStowService.resetBehavior();
    });

    beforeEach(async () => {
      await sinon.resetHistory();
      pgWrite = new pg.Client(pgMasterConfig);
    });
    afterEach(async () => {
      await pgWrite.end();
    });

    it("Start stow response is ok", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.state = 1;
      site_stow_xx_id_res.start_time = new Date('2020-09-11T14:30:00Z');
      site_stow_xx_id_res.end_time = new Date('2020-09-11T16:15:00Z');
      nc_response.accu_stow = true;
      nc_response.stow_start_time = site_stow_xx_id_res.start_time.toISOString();
      nc_response.stow_end_time = site_stow_xx_id_res.end_time.toISOString();
      rClient.query.onFirstCall().resolves({ rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.metaInfoByNCId, sinon.match.array).resolves({ rows: [site_meta_data] });
      rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
      wClient.query.withArgs(db.site_stow_update, sinon.match.array).returns({ rowCount: 1 });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_response);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoByNCId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query.firstCall, db.site_stow_update, [2, true, site_stow_xx_id_res.id]);
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.calledWith(spies.weatherStowService, rClient, wClient, sinon.match({
        channel: "weather_stow_updates", stow_type: 7,
        asset_id: site_meta_data.asset_id, asset_name: site_meta_data.name, timestamp: sinon.match.string, message_type: 'NORMAL',
        device_type_id: sinon.match.truthy
      }));
    });

    it("End stow response is ok", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.state = 11;
      site_stow_xx_id_res.start_time = new Date('2020-09-11T14:30:00Z');
      site_stow_xx_id_res.end_time = new Date('2020-09-11T16:15:00Z');
      nc_response.accu_stow = false;
      nc_response.stow_start_time = site_stow_xx_id_res.start_time.toISOString();
      nc_response.stow_end_time = site_stow_xx_id_res.end_time.toISOString();
      rClient.query.onFirstCall().resolves({ rows: [site_stow_xx_id_res] });
      wClient.query.withArgs(db.site_stow_update, sinon.match.array).returns({ rowCount: 1 });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_response);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoByNCId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query.firstCall, db.site_stow_update, [12, false, site_stow_xx_id_res.id]);
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.calledWith(spies.weatherStowService, rClient, wClient, sinon.match({
        channel: "weather_stow_updates", stow_type: 27,
        asset_id: site_meta_data.asset_id, asset_name: site_meta_data.name, timestamp: sinon.match.string, message_type: 'NORMAL',
        device_type_id: sinon.match.truthy
      }));
    });

    it("Response accu_stow mismatch", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.state = 1;
      site_stow_xx_id_res.start_time = new Date('2020-09-11T14:30:00Z');
      site_stow_xx_id_res.end_time = new Date('2020-09-11T16:15:00Z');
      nc_response.accu_stow = false;
      nc_response.stow_start_time = site_stow_xx_id_res.start_time.toISOString();
      nc_response.stow_end_time = site_stow_xx_id_res.end_time.toISOString();
      rClient.query.onFirstCall().resolves({ rows: [site_stow_xx_id_res] });
      rClient.query.onSecondCall().throws();
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_response);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.notCalled(spies.iotPub);
    });

    it("Response stow_start_time mismatch", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.state = 11;
      site_stow_xx_id_res.start_time = new Date('2020-09-11T14:30:00Z');
      site_stow_xx_id_res.end_time = new Date('2020-09-11T16:15:00Z');
      nc_response.accu_stow = false;
      nc_response.stow_start_time = moment(site_stow_xx_id_res.start_time).add(1, "minutes").utc().format();
      nc_response.stow_end_time = site_stow_xx_id_res.end_time.toISOString();
      rClient.query.onFirstCall().resolves({ rows: [site_stow_xx_id_res] });
      rClient.query.onSecondCall().throws();
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_response);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.notCalled(spies.iotPub);
    });

    it("Response stow_end_time mismatch", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.state = 1;
      site_stow_xx_id_res.start_time = new Date('2020-09-11T14:30:00Z');
      site_stow_xx_id_res.end_time = new Date('2020-09-11T16:15:00Z');
      nc_response.accu_stow = true;
      nc_response.stow_start_time = site_stow_xx_id_res.start_time.toISOString();
      nc_response.stow_end_time = moment(site_stow_xx_id_res.end_time).subtract(1, "second").utc().format();
      rClient.query.onFirstCall().resolves({ rows: [site_stow_xx_id_res] });
      rClient.query.onSecondCall().throws("Not allowed");
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_response);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.notCalled(spies.iotPub);
    });
  });

  const nc_request = {
    channel: 'local_weather_nc_stow_update',
    network_controller_id: 'e60e53ad-bd85-45ed-8e43-bbdb451ac45e',
    need_accu_weather_update: true,
    stow_type: 'alert_api',
    type: "elastic_search-1"
  };

  describe(`NC Request get site stow: ${nc_request.channel}`, () => {
    beforeEach(async () => {
      sinon.resetHistory();
      rClient.query.resetBehavior();
      //pgWrite = new pg.Client(pgMasterConfig);
    });
    afterEach(async () => {
      //await pgWrite.end();
    });

    it("Stow was active and user disable Auto-Stow/Weather-forecast functionality.", async () => {
      let res;
      site_stow_xx_id_res.enable_weather_forecast_stow = true;
      site_stow_xx_id_res.enable_weather_alert_stow = true;
      site_stow_xx_id_res.enable_weather_forecast = false;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.state = 1;
      rClient.query.resolves({ rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      expect(spies.iotPub.getCall(0).calledWith(site_stow_xx_id_res.aws_iot_principal_id, {
        stow: site_stow_xx_id_res.active,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
        end_time: moment(site_stow_xx_id_res.end_time).utc().format()
      })).to.be.true;
    });

    it("No site info in DB", async () => {
      let res;
      rClient.query.resolves({ rows: [] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.notCalled(spies.iotPub);
    });

    it("No stow info in DB", async () => {
      let res;
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      rClient.query.resolves({ rows: [no_stow_info_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, sinon.match.any, {
        stow: false,
        stow_type: accuWeatherService.getStowTypeForNC(no_stow_info_res),
        start_time: sinon.match.string,
        end_time: sinon.match.string
      });
    });

    it("Inactive stow info in DB", async () => {
      let res;
      site_stow_xx_id_res.enable_weather_forecast_stow = true;
      site_stow_xx_id_res.enable_weather_alert_stow = true;
      site_stow_xx_id_res.enable_weather_forecast = true;
      site_stow_xx_id_res.active = false;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 12;
      rClient.query.resolves({ rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: false,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
        end_time: moment(site_stow_xx_id_res.end_time).utc().format()
      });
    });

    it("Active stow start info in DB", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 2;
      rClient.query.resolves({ rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
        end_time: moment(site_stow_xx_id_res.end_time).utc().format()
      });
    });

    it("Active stow end info in DB", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 11;
      rClient.query.resolves({ rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: false,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
        end_time: moment(site_stow_xx_id_res.end_time).utc().format()
      });
    });

    it("Active stow info in DB. NC not connected", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.connected = false;
      site_stow_xx_id_res.state = 2;
      rClient.query.resolves({ rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 1);
      sinon.assert.notCalled(spies.iotPub);
    });
  });

  const stow_alarm = {
    "channel": "local_weather_stow_alarms",
    "timestamp": "2020-09-11T15:40:10Z",
    "stow_type": "Weather_Forecast-Avg_Wind",
    "start": {
      "when": "2020-09-11T14:30:00Z"
    },
    "end": {
      "when": "2020-09-11T16:15:00Z"
    },
    "alarm": {
      "timestamp": "2020-09-11T15:40:00Z",
      "prj_data": {
        "id": "97b14d97-3340-4d47-97ba-d126d1ea64ab",
        "location_lat": 40.58107,
        "location_lng": -78.073277,
        "name": "Zigron Test Site 16",
        "wind_speed_threshold": 10,
        "gust_threshold": 42,
        "snow_depth_threshold": 197,
        "enable_weather_forecast_stow": true,
        "enable_weather_alert_stow": true,
        "enable_weather_forecast_notification": true,
        "weather_forecast_stow_prior_time": 30,
        "weather_forecast_stow_after_time": 15,
        "weather_forecast_notification_threshold": 80
      },
      "stow_type": "Weather_Forecast-Avg_Wind", // "Weather_Forecast_Alert-High_Wind_Watch"
      "start": {
        "when": "2020-09-11T14:00:00Z",
        "value": 20,
        "threshold": 10
      },
      "end": {
        "when": "2020-09-11T16:00:00Z",
        "value": 7,
        "threshold": 10
      },
      hide_at_project_level: false
    },
    "next": null,
    "type": "elastic_search-1"
  };
  const site_info = {
    id: "ae691dfa-72bd-4e5e-8dc2-871878cadbc8",
    active: true,
    is_tracker: true,
    company_id: "37840ea9-4663-4dcb-b392-3d852b760dc0",
    project_id: "97b14d97-3340-4d47-97ba-d126d1ea64ab"
  };
  const site_meta_data = {
    site_id: "ae691dfa-72bd-4e5e-8dc2-871878cadbc8",
    site_name: "Zigron Test Site 16",
    location_lat: "33.6644783020020000",
    location_lng: "73.0501708984375000",
    is_notify: "true",
    project_name: "Zigron Test Project",
    project_id: "97b14d97-3340-4d47-97ba-d126d1ea64ab",
    project_location: "Pearl Heights, Business Square، Gulberg Greens Block A Gulberg Greens, Islamabad, Islamabad Capital Territory 44000, Pakistan",
    asset_id: "93911a1f-3c47-44d9-bd90-6a35dc1b060b",
    device_type: "Network Controller",
    name: "Network Controller Dev Site",
    snap_addr: Buffer.from([0x0e, 0x2b, 0xa2]),
    commanded_state: 4,
    last_sleep_mode: "2020-09-11T14:00:00Z",
    wakeup_time: "2020-09-11T14:00:00Z"
  }; last_sleep_mode_update:
  describe(`Alerts site stow: ${stow_alarm.channel}`, () => {
    before(() => {
      //client = new pg.Client(pgConfig);
      rClient.query.resetBehavior();
      rClient.query.withArgs(db.metaInfoBySiteId, sinon.match.array).resolves({ rows: [site_meta_data] });
      rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      rClient.query.resolves({ rows: [] });
    });
    beforeEach(() => {
      sinon.resetHistory();
      wClient.query.resetBehavior();
      pgWrite = new pg.Client(pgMasterConfig);
    });
    afterEach(async () => {
      await pgWrite.end();
    });

    it("Fresh alarm.", async () => {
      let res;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 12;
      site_stow_xx_id_res.active = false;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.projectSites, sinon.match.array).resolves({ rowCount: 1, rows: [{ id: 'ae691dfa-72bd-4e5e-8dc2-871878cadbc8' }] });
      wClient.query.withArgs(db.site_stow_updateFull(1), sinon.match.array).callsFake((query, values) => {
        site_stow_xx_id_res.state = values[4];
        site_stow_xx_id_res.active = values[3];
        site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
        site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
        site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
        site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
        site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
        site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
        site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
        site_stow_xx_id_res.alarm_text = null;
        return { rowCount: 1, rows: [site_stow_xx_id_res] };
      });
      spies.notificationSettingService = sinon.stub(notificationSettingService, 'getAccounts').withArgs(rClient, site_meta_data.site_id, "accuweather_stow")
        .resolves({
          emails: ['adnan.obaid@zigron.com'],
          phone_nums: ['+923335357089']
        });
      spies.sendSMS = sinon.stub(aws_integration, 'sendSMS').withArgs({ phoneNumber: '+923335357089', msgText: sinon.match.string })
        .resolves(true);
      spies.sendEmail = sinon.stub(aws_integration, 'sendEmail').withArgs(sinon.match({ emailAddrs: ['adnan.obaid@zigron.com'] }))
        .resolves(true);

      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_updateFull(1), [site_meta_data.asset_id, site_stow_xx_id_res.id, stow_alarm.timestamp,
        true, 1, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Fresh alarm. No stow info present", async () => {
      let res;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 12;
      site_stow_xx_id_res.active = false;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [no_stow_info_res] });
      wClient.query.withArgs(db.site_stow_insert, sinon.match.array).callsFake((query, values) => {
        site_stow_xx_id_res.state = values[4];
        site_stow_xx_id_res.active = values[3];
        site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
        site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
        site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
        site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
        site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
        site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
        site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
        site_stow_xx_id_res.alarm_text = null;
        return { rowCount: 1, rows: [site_stow_xx_id_res] };
      });

      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_insert, [site_meta_data.asset_id, site_meta_data.site_id, stow_alarm.timestamp,
        true, 1, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Fresh alarm. NC offline", async () => {
      let res;
      site_stow_xx_id_res.connected = false;
      site_stow_xx_id_res.state = 12;
      site_stow_xx_id_res.active = false;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      wClient.query.withArgs(db.site_stow_updateFull(1), sinon.match.array).callsFake((query, values) => {
        site_stow_xx_id_res.state = values[4];
        site_stow_xx_id_res.active = values[3];
        site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
        site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
        site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
        site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
        site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
        site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
        site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
        site_stow_xx_id_res.alarm_text = null;
        return { rowCount: 1, rows: [site_stow_xx_id_res] };
      });

      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_updateFull(1), [site_meta_data.asset_id, site_stow_xx_id_res.id, stow_alarm.timestamp,
        true, 1, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.calledWith(spies.weatherStowService, rClient, wClient, sinon.match({
        channel: "weather_stow_updates", stow_type: 7,
        asset_id: site_meta_data.asset_id, asset_name: site_meta_data.name, timestamp: sinon.match.string, message_type: 'NC_OFFLINE',
        device_type_id: sinon.match.truthy
      }));
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Fresh alarm. enable_weather_forecast_notification false", async () => {
      let res;
      stow_alarm.alarm.prj_data.enable_weather_forecast_notification = false;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 12;
      site_stow_xx_id_res.active = false;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      wClient.query.withArgs(db.site_stow_updateFull(1), sinon.match.array).callsFake((query, values) => {
        site_stow_xx_id_res.state = values[4];
        site_stow_xx_id_res.active = values[3];
        site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
        site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
        site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
        site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
        site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
        site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
        site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
        site_stow_xx_id_res.alarm_text = null;
        return { rowCount: 1, rows: [site_stow_xx_id_res] };
      });

      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_updateFull(1), [site_meta_data.asset_id, site_stow_xx_id_res.id, stow_alarm.timestamp,
        true, 1, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Update alarm. No change", async () => {
      let res;
      stow_alarm.alarm.prj_data.enable_weather_forecast_notification = true;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 2;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 0);
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Update alarm. No change. Site stow state pending", async () => {
      let res;
      stow_alarm.alarm.prj_data.enable_weather_forecast_notification = true;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 1;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 0);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Update alarm. No change. Site stow state pending, NC was previously offline", async () => {
      let res;
      stow_alarm.alarm.prj_data.enable_weather_forecast_notification = true;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 1;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves(nc_offline_alert);
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.notCalled(wClient.query);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Update alarm. End time changed", async () => {
      let res;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 2;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      site_stow_xx_id_res.hide_at_project_level = true;
      stow_alarm.alarm.hide_at_project_level = true;
      stow_alarm.end.when = moment(stow_alarm.end.when).add(80, "minutes").utc().format();
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      wClient.query.withArgs(db.site_stow_updateFull(3), sinon.match.array).callsFake((query, values) => {
        site_stow_xx_id_res.state = values[4];
        site_stow_xx_id_res.active = values[3];
        site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
        site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
        site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
        site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
        site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
        site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
        site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
        site_stow_xx_id_res.alarm_text = null;
        return { rowCount: 1, rows: [site_stow_xx_id_res] };
      });
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_updateFull(3), [site_meta_data.asset_id, site_stow_xx_id_res.id, moment(site_stow_xx_id_res.timestamp).utc().format(),
        true, 3, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      stow_alarm.end.when = moment(stow_alarm.end.when).subtract(80, "minutes").utc().format();
    });

    it("Update alarm. End time changed. NC offline Alert and NC is offline", async () => {
      let res;
      site_stow_xx_id_res.connected = false;
      site_stow_xx_id_res.state = 1;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      stow_alarm.alarm.hide_at_project_level = false;
      stow_alarm.end.when = moment(stow_alarm.end.when).add(80, "minutes").utc().format();
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves(nc_offline_alert);
      wClient.query.withArgs(db.site_stow_updateFull(1), sinon.match.array).returns({ rowCount: 1, rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_updateFull(1), [site_meta_data.asset_id, site_stow_xx_id_res.id, moment(site_stow_xx_id_res.timestamp).utc().format(),
        true, site_stow_xx_id_res.state, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.calledWith(spies.weatherStowService, rClient, wClient, sinon.match({
        channel: "weather_stow_updates", stow_type: 7,
        asset_id: site_meta_data.asset_id, asset_name: site_meta_data.name, timestamp: sinon.match.string, message_type: 'NC_OFFLINE',
        device_type_id: sinon.match.truthy
      }));
      sinon.assert.notCalled(spies.iotPub);

      stow_alarm.end.when = moment(stow_alarm.end.when).subtract(80, "minutes").utc().format();
    });

    it("Update alarm. Alarm timestamp is in past then active stow alarm timestamp", async () => {
      let res;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 2;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      stow_alarm.end.when = moment(stow_alarm.end.when).add(80, "minutes").utc().format();
      stow_alarm.alarm.timestamp = moment(site_stow_xx_id_res.alarm_timestamp).subtract(1, "seconds").utc().format();
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      wClient.query.withArgs(db.site_stow_updateFull(3), sinon.match.array).returns({ rowCount: 1, rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 0);
      sinon.assert.notCalled(spies.iotPub);
      stow_alarm.end.when = moment(stow_alarm.end.when).subtract(80, "minutes").utc().format();
      stow_alarm.alarm.timestamp = moment(site_stow_xx_id_res.alarm_timestamp).add(1, "hour").utc().format();
    });

    it("Clear alarm.", async () => {
      let res;
      stow_alarm.alarm.prj_data.enable_weather_forecast_notification = true;
      stow_alarm.clear = true;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 4;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      wClient.query.withArgs(db.site_stow_updateFull(11), sinon.match.array).callsFake((query, values) => {
        site_stow_xx_id_res.state = values[4];
        site_stow_xx_id_res.active = values[3];
        site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
        site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
        site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
        site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
        site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
        site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
        site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
        site_stow_xx_id_res.alarm_text = null;
        return { rowCount: 1, rows: [site_stow_xx_id_res] };
      });

      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_updateFull(11), [site_meta_data.asset_id, site_stow_xx_id_res.id, moment(site_stow_xx_id_res.timestamp).utc().format(),
        true, 11, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: false,
        stow_type: accuWeatherService.getStowTypeForNC(site_stow_xx_id_res),
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });
    it("Clear alarm. NC is offline", async () => {
      let res;
      stow_alarm.alarm.prj_data.enable_weather_forecast_notification = true;
      stow_alarm.clear = true;
      site_stow_xx_id_res.connected = false; // Nc is offline
      site_stow_xx_id_res.state = 4;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({
        rows: [{
          id: "45f31068", title: "AccuWeather Weather Stow: Deep Snow",
          created: "2020-09-11T10:00:00Z", message: "The site is in AccuWeather Weather Stow due to ...",
          params: '{"start_time":"2020-09-11T14:30:00Z","end_time":"2020-09-11T16:15:00Z","notification_threshold":80,"alarm_start_time":"2020-09-11T14:00:00.000Z","alarm_end_time":"2020-09-11T16:00:00.000Z","text":null}'
        }]
      });
      wClient.query.withArgs(db.site_stow_updateFull(11), sinon.match.array).callsFake((query, values) => {
        site_stow_xx_id_res.state = values[4];
        site_stow_xx_id_res.active = values[3];
        site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
        site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
        site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
        site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
        site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
        site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
        site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
        site_stow_xx_id_res.alarm_text = null;
        return { rowCount: 1, rows: [site_stow_xx_id_res] };
      });

      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_updateFull(11), [site_meta_data.asset_id, site_stow_xx_id_res.id, moment(site_stow_xx_id_res.timestamp).utc().format(),
        true, 11, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.calledWith(spies.weatherStowService, rClient, wClient, sinon.match({
        channel: "weather_stow_updates", stow_type: 7,
        asset_id: site_meta_data.asset_id, asset_name: site_meta_data.name, timestamp: sinon.match.string, message_type: 'NC_OFFLINE_EXIT',
        device_type_id: sinon.match.truthy
      }));
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });
    it("Clear alarm. NC is offline and NC_OFFLINE alert is active", async () => {
      let res;
      stow_alarm.alarm.prj_data.enable_weather_forecast_notification = true;
      stow_alarm.clear = true;
      site_stow_xx_id_res.connected = false;
      site_stow_xx_id_res.state = 1;    // NC_OFFLINE Alert active
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
      site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
      site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
      site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
      site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
      site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
      site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
      site_stow_xx_id_res.alarm_text = null;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves(nc_offline_alert);
      wClient.query.withArgs(db.site_stow_updateFull(12), sinon.match.array).callsFake((query, values) => {
        site_stow_xx_id_res.state = values[4];
        site_stow_xx_id_res.active = values[3];
        site_stow_xx_id_res.start_time = new Date(stow_alarm.start.when);
        site_stow_xx_id_res.end_time = new Date(stow_alarm.end.when);
        site_stow_xx_id_res.stow_type = stow_alarm.alarm.stow_type;
        site_stow_xx_id_res.alarm_start_time = new Date(stow_alarm.alarm.start.when);
        site_stow_xx_id_res.alarm_end_time = new Date(stow_alarm.alarm.end.when);
        site_stow_xx_id_res.alarm_value = stow_alarm.alarm.start.value;
        site_stow_xx_id_res.alarm_threshold = stow_alarm.alarm.start.threshold;
        site_stow_xx_id_res.alarm_text = null;
        return { rowCount: 1, rows: [site_stow_xx_id_res] };
      });

      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.projectSites, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_updateFull(12), [site_meta_data.asset_id, site_stow_xx_id_res.id, moment(site_stow_xx_id_res.timestamp).utc().format(),
        false, 12, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
      stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp, stow_alarm.alarm.hide_at_project_level]);
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.calledWith(spies.weatherStowService, rClient, wClient, sinon.match({
        channel: "weather_stow_updates", stow_type: 27,
        asset_id: site_meta_data.asset_id, asset_name: site_meta_data.name, timestamp: sinon.match.string, message_type: 'NORMAL',
        device_type_id: sinon.match.truthy
      }));
      sinon.assert.notCalled(spies.notificationSettingService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });
  });
});
