process.env.NODE_ENV = "test";
const sinon = require("sinon");
const chai = require("chai");
const pg = require("pg");
const db = require("../db");
const { pgConfig, pgMasterConfig } = require("../pg");
const { notificationSettingService } = require("../services/notificationSettingService");
const { weatherStowService } = require("../services/weatherStowService");
const aws_integration = require("../aws_integration");


const expect = chai.expect;
describe("Weather Stow Service", () => {
    let client;
    let pgWrite;
    let spies = {};
    let db_stub;
    let rClient;
    let wClient;
    let assetInfoByNCAssetID = [{
        site_id:	'0f4892b4-8136-4c6a-bfe7-3a38d3b8fc2c', // Zig 14 on test
        site_name: "Zigron Site 14",
        location_lat: "33.6643981933594",
        location_lng: "73.0522994995117",
        is_notify: true,
        wind_speed_threshold: 10,
        gust_threshold: 10,
        snow_depth_threshold: 196.8503937,
        panel_snow_depth_threshold: 196.8503937,
        weather_forecast_stow_after_time: 30,
        enable_weather_forecast_notification: true,
        asset_status_bits: 0,
        device_type: 'Network Controller',
        project_location: null,
        network_controller_id: '6bb3ced8-b9f1-455b-bc6e-aa4f9168b8ee',
        name: 'Network Controller ZC',
        asset_name: 'Network Controller ZC',
        network_controller_name: 'Network Controller ZC',
        network_controller_asset_id: '0384195d-d0bc-403e-9272-b5bd63dbe683',
        snap_addr: Buffer.from("0e2bf9", "hex"),
        fw_version: '0.7.5.1',
        project_name: 'Zigron Test Project',
        project_id: '97b14d97-3340-4d47-97ba-d126d1ea64ab'
      }];
    let assetInfoByID = [{
        site_id:	'0f4892b4-8136-4c6a-bfe7-3a38d3b8fc2c', // Zig 14 on test
        site_name: "Zigron Site 14",
        location_lat: "33.6643981933594",
        location_lng: "73.0522994995117",
        is_notify: true,
        wind_speed_threshold: 10,
        gust_threshold: 10,
        snow_depth_threshold: 196.8503937,
        panel_snow_depth_threshold: 196.8503937,
        weather_forecast_stow_after_time: 30,
        enable_weather_forecast_notification: true,
        wind_reporting_close_percentage: 50,
        snow_reporting_close_percentage: 50,
        asset_name: 'Weather Station1',
        snap_addr: Buffer.from("13b537", "hex"),
        asset_status_bits: 0,
        device_type: 'Weather Station',
        project_location: null,
        network_controller_id: '6bb3ced8-b9f1-455b-bc6e-aa4f9168b8ee',
        network_controller_name: 'Network Controller ZC',
        network_controller_asset_id: '0384195d-d0bc-403e-9272-b5bd63dbe683',
        fw_version: '0.7.5.1',
        project_name: 'Zigron Test Project',
        project_id: '97b14d97-3340-4d47-97ba-d126d1ea64ab'
        }];
        const site_info = {
          id: "0f4892b4-8136-4c6a-bfe7-3a38d3b8fc2c",
          active: true,
          is_tracker: true,
          company_id: "37840ea9-4663-4dcb-b392-3d852b760dc0",
          project_id: "97b14d97-3340-4d47-97ba-d126d1ea64ab"
        };

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
            spies.notificationService_getAccounts = sinon.stub(notificationSettingService, 'getAccounts');
            spies.sendSMS = sinon.stub(aws_integration, 'sendSMS');
            spies.sendEmail = sinon.stub(aws_integration, 'sendEmail');
            spies.sendSMS.withArgs({ phoneNumber: '+923451000620', msgText: sinon.match.string })
              .resolves(true);
            spies.sendEmail.withArgs(sinon.match({ emailAddrs: ['waqas.iqbal@zigron.com'] }))
              .resolves(true);
            // To differentiate reader and writer for testing with different stubs.
            pgMasterConfig.type = "master";
            pgConfig.type = "reader";
            db_stub = sinon.stub(pg, "Client");
            db_stub.withArgs(pgMasterConfig).returns(wClient);
            db_stub.withArgs(pgConfig).returns(rClient);
            client = new pg.Client(pgConfig);
            await client.connect();
            pgWrite = new pg.Client(pgMasterConfig);
            await pgWrite.connect();
            
          });
          after(async () => {
            await pgWrite.end();
            await client.end();
          });
          const nc_wind_gust_request = {
            asset_id: "a62e4e3c-e4ab-4e10-940c-1b27def2fd38",
            asset_name: null,
            device_type_id: "14182d37-accb-4752-8558-ea874bee2e24",
            timestamp: "2021-03-15T06:34:48.819Z",
            stow_type: 1,
            stow_value: 10,
            stow_threshold: 10,
            type: "elastic_search-1",
            channel: "weather_stow_updates"
          };
          describe(`Get site stow due to High Wind Gust By Weather Station: ${nc_wind_gust_request.stow_type}`, () => {
            beforeEach(async () => {
              sinon.resetHistory();
              rClient.query.resetBehavior();
              wClient.query.resetBehavior();
              
            });
            afterEach(async () => {
              
            });
        
            it("When Already Have Active Alert", async () => {
                let res;
                rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
                rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
                rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '14182d37-accb-4752-8558-ea874bee2e24',device_type: 'Weather Station',reported_type:2}] });
                rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: [{id: '141111'}]});
  
                try {
                  res = await weatherStowService.handler(client, pgWrite, nc_wind_gust_request);
                } catch (err) {
                  console.log("Error in test.. ", err);
                  return Promise.reject(new Error(err));
                }
                expect(res).to.equal(true);
                //sinon.assert.callCount(rClient.query, 3);
                sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
                sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
                sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
                sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
              });

              it("When Have No Active Alert", async () => {
                let res;
                rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
                rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
                rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '14182d37-accb-4752-8558-ea874bee2e24',device_type: 'Weather Station',reported_type:2}] });
                rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: []});
                wClient.query.withArgs(db.addCloudAlertParamsByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
                wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
                rClient.query.withArgs(db.getAssetIdsWithActiveAlertsQuery, sinon.match.array).resolves({rows: [{id: 'a71904c4-0b4e-4d1b-b222-0565bf122a2b', asset_id: '8dcfafd2-5240-4f24-9532-77899e30f772', created: '2021-03-15 11:12:44.655',type:2,event_name:'ASSET-UNDER_MANUAL_CONTROL',message:null,active:true,last_updated:null,title:'Row Box 2 (Row 2 | R2 | 13b4c3): Manual Row Control Start (Preset: Max)',icon:'setting_gray',user_name:'Sundus',user_email:'sundus.nisar@zigron.com',linked_asset_id:null }]});
               //todo: need to handle class level objects which are called with this keywork
                //todo: need to handle class level objects which are called with this keywork
                spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "ws_stow_wind_gust").
                  resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });
              // spies.sendSMS = sinon.stub(aws_integration, 'sendSMS').withArgs({ phoneNumber: '+923451000620', msgText: sinon.match.string })
              //     .resolves(true);
              // spies.sendEmail = sinon.stub(aws_integration, 'sendEmail').withArgs(sinon.match({ emailAddrs: ['waqas.iqbal@zigron.com'] }))
              //     .resolves(true);

                try {
                  res = await weatherStowService.handler(client, pgWrite, nc_wind_gust_request);
                } catch (err) {
                  console.log("Error in test.. ", err);
                  return Promise.reject(new Error(err));
                }
                expect(res).to.equal(true);
                //sinon.assert.callCount(rClient.query, 4);
                sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
                sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
                sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
                sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
                sinon.assert.calledWith(rClient.query, db.getAssetIdsWithActiveAlertsQuery, sinon.match.array);

                //sinon.assert.callCount(rClient.query, 4);
                sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.array);
                sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
                //todo: need to handle class level objects which are called with this keywork
                 sinon.assert.calledOnce(spies.notificationService_getAccounts);
                // sinon.assert.calledOnce(spies.sendSMS);
                // sinon.assert.calledOnce(spies.sendEmail);
              });
        });
        const nc_avg_wind_request = {
          asset_id: "a62e4e3c-e4ab-4e10-940c-1b27def2fd38",
          asset_name: null,
          device_type_id: "14182d37-accb-4752-8558-ea874bee2e24",
          timestamp: "2021-03-15T06:34:48.819Z",
          stow_type: 2,
          stow_value: 10,
          stow_threshold: 10,
          type: "elastic_search-1",
          channel: "weather_stow_updates"
        };
        describe(`Get site stow due to High Average Wind By Weather Station: ${nc_avg_wind_request.stow_type}`, () => {
          beforeEach(async () => {
            sinon.resetHistory();
            rClient.query.resetBehavior();
            wClient.query.resetBehavior();
            spies.notificationService_getAccounts.resetBehavior();
          });
          afterEach(async () => {
            
          });
      
          it("When Already Have Active Alert", async () => {
              let res;
              rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
              rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
              rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '14182d37-accb-4752-8558-ea874bee2e24',device_type: 'Weather Station',reported_type:2}] });
              rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: [{id: '141111'}]});

              try {
                res = await weatherStowService.handler(client, pgWrite, nc_avg_wind_request);
              } catch (err) {
                console.log("Error in test.. ", err);
                return Promise.reject(new Error(err));
              }
              expect(res).to.equal(true);
              //sinon.assert.callCount(rClient.query, 3);
              sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
              sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
              sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
              sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
            });

            it("When Have No Active Alert", async () => {
              let res;
              rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
              rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
              rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '14182d37-accb-4752-8558-ea874bee2e24',device_type: 'Weather Station',reported_type:2}] });
              rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: []});
              wClient.query.withArgs(db.addCloudAlertParamsByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
              wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
              rClient.query.withArgs(db.getAssetIdsWithActiveAlertsQuery, sinon.match.array).resolves({rows: [{id: 'a71904c4-0b4e-4d1b-b222-0565bf122a2b', asset_id: '8dcfafd2-5240-4f24-9532-77899e30f772', created: '2021-03-15 11:12:44.655',type:2,event_name:'ASSET-UNDER_MANUAL_CONTROL',message:null,active:true,last_updated:null,title:'Row Box 2 (Row 2 | R2 | 13b4c3): Manual Row Control Start (Preset: Max)',icon:'setting_gray',user_name:'Sundus',user_email:'sundus.nisar@zigron.com',linked_asset_id:null }]});
             //todo: need to handle class level objects which are called with this keywork
              spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "ws_stow_wind_speed").
                resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });
              // spies.sendSMS = sinon.stub(aws_integration, 'sendSMS').withArgs({ phoneNumber: '+923451000620', msgText: sinon.match.string })
              //     .resolves(true);
              // spies.sendEmail = sinon.stub(aws_integration, 'sendEmail').withArgs(sinon.match({ emailAddrs: ['waqas.iqbal@zigron.com'] }))
              //     .resolves(true);
              
              try {
                res = await weatherStowService.handler(client, pgWrite, nc_avg_wind_request);
              } catch (err) {
                console.log("Error in test.. ", err);
                return Promise.reject(new Error(err));
              }
              expect(res).to.equal(true);
              //sinon.assert.callCount(rClient.query, 4);
              sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
              sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
              sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
              sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
              sinon.assert.calledWith(rClient.query, db.getAssetIdsWithActiveAlertsQuery, sinon.match.array);

              //sinon.assert.callCount(rClient.query, 4);
              sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.array);
              sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
              //todo: need to handle class level objects which are called with this keywork
              // sinon.assert.calledOnce(spies.notificationService_getAccounts);
              // sinon.assert.calledOnce(spies.sendSMS);
              // sinon.assert.calledOnce(spies.sendEmail);
            });
      });
      const nc_snow_depth_request = {
        asset_id: "a62e4e3c-e4ab-4e10-940c-1b27def2fd38",
        asset_name: null,
        device_type_id: "14182d37-accb-4752-8558-ea874bee2e24",
        timestamp: "2021-03-15T06:34:48.819Z",
        stow_type: 3,
        stow_value: 10,
        stow_threshold: 10,
        type: "elastic_search-1",
        channel: "weather_stow_updates"
      };
      describe(`Get site stow due to Snow Depth By Weather Station: ${nc_snow_depth_request.stow_type}`, () => {
        beforeEach(async () => {
          sinon.resetHistory();
          rClient.query.resetBehavior();
          wClient.query.resetBehavior();
          spies.notificationService_getAccounts.resetBehavior();

        });
        afterEach(async () => {
          
        });
    
        it("When Already Have Active Alert", async () => {
            let res;
            rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
            rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
            rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '14182d37-accb-4752-8558-ea874bee2e24',device_type: 'Weather Station',reported_type:2}] });
            rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: [{id: '141111'}]});

            try {
              res = await weatherStowService.handler(client, pgWrite, nc_snow_depth_request);
            } catch (err) {
              console.log("Error in test.. ", err);
              return Promise.reject(new Error(err));
            }
            expect(res).to.equal(true);
            //sinon.assert.callCount(rClient.query, 3);
            sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
          });

          it("When Have No Active Alert", async () => {
            let res;
            rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
            rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
            rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '14182d37-accb-4752-8558-ea874bee2e24',device_type: 'Weather Station',reported_type:2}] });
            rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: []});
            wClient.query.withArgs(db.addCloudAlertParamsByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
            wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
            rClient.query.withArgs(db.getAssetIdsWithActiveAlertsQuery, sinon.match.array).resolves({rows: [{id: 'a71904c4-0b4e-4d1b-b222-0565bf122a2b', asset_id: '8dcfafd2-5240-4f24-9532-77899e30f772', created: '2021-03-15 11:12:44.655',type:2,event_name:'ASSET-UNDER_MANUAL_CONTROL',message:null,active:true,last_updated:null,title:'Row Box 2 (Row 2 | R2 | 13b4c3): Manual Row Control Start (Preset: Max)',icon:'setting_gray',user_name:'Sundus',user_email:'sundus.nisar@zigron.com',linked_asset_id:null }]});
           //todo: need to handle class level objects which are called with this keywork
            //todo: need to handle class level objects which are called with this keywork
            spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "ws_stow_snow_depth").
               resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });
              // spies.sendSMS = sinon.stub(aws_integration, 'sendSMS').withArgs({ phoneNumber: '+923451000620', msgText: sinon.match.string })
              //     .resolves(true);
              // spies.sendEmail = sinon.stub(aws_integration, 'sendEmail').withArgs(sinon.match({ emailAddrs: ['waqas.iqbal@zigron.com'] }))
              //     .resolves(true);
              
            try {
              res = await weatherStowService.handler(client, pgWrite, nc_snow_depth_request);
            } catch (err) {
              console.log("Error in test.. ", err);
              return Promise.reject(new Error(err));
            }
            expect(res).to.equal(true);
            //sinon.assert.callCount(rClient.query, 4);
            sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getAssetIdsWithActiveAlertsQuery, sinon.match.array);

            //sinon.assert.callCount(rClient.query, 4);
            sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.array);
            sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
            //todo: need to handle class level objects which are called with this keywork
            // sinon.assert.calledOnce(spies.notificationService_getAccounts);
            // sinon.assert.calledOnce(spies.sendSMS);
            // sinon.assert.calledOnce(spies.sendEmail);
          });
    });
    const nc_deep_panel_snow_request = {
      asset_id: "8dcfafd2-5240-4f24-9532-77899e30f772",
      asset_name: null,
      device_type_id: "1d6e2838-8ac9-42f2-8418-778a95a27e75",
      timestamp: "2021-03-15T06:34:48.819Z",
      stow_type: 4,
      stow_value: 10,
      stow_threshold: 10,
      type: "elastic_search-1",
      channel: "weather_stow_updates"
    };
    describe(`Get site stow due to Deep Panel Snow By Row Box: ${nc_deep_panel_snow_request.stow_type}`, () => {
      beforeEach(async () => {
        sinon.resetHistory();
        rClient.query.resetBehavior();
        wClient.query.resetBehavior();
        spies.notificationService_getAccounts.resetBehavior();

      });
      afterEach(async () => {

      });

      it("When Already Have Active Alert", async () => {
        assetInfoByID.asset_id = '8dcfafd2-5240-4f24-9532-77899e30f772';
        assetInfoByID.snap_addr = Buffer.from("13b4c3", "hex");//'\x13b4c3';
          let res;
          rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
          rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
          rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '1d6e2838-8ac9-42f2-8418-778a95a27e75',device_type: 'Row Controller',reported_type:0}] });
          rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: [{id: '141111'}]});
          rClient.query.withArgs(db.siteLayoutInfoByAssetId, sinon.match.array).resolves({rows: [{name: 'Row 2', i: 2, shorthand_name: 'R2'}]});

          try {
            res = await weatherStowService.handler(client, pgWrite, nc_deep_panel_snow_request);
          } catch (err) {
            console.log("Error in test.. ", err);
            return Promise.reject(new Error(err));
          }
          expect(res).to.equal(true);
          //sinon.assert.callCount(rClient.query, 3);
          sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
        });

        it("When Have No Active Alert", async () => {
          let res;
          rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
          rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
          rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '1d6e2838-8ac9-42f2-8418-778a95a27e75',device_type: 'Row Controller',reported_type:0}] });
          rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: []});
          wClient.query.withArgs(db.addCloudAlertParamsByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
          wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
          rClient.query.withArgs(db.getAssetIdsWithActiveAlertsQuery, sinon.match.array).resolves({rows: [{id: 'a71904c4-0b4e-4d1b-b222-0565bf122a2b', asset_id: '8dcfafd2-5240-4f24-9532-77899e30f772', created: '2021-03-15 11:12:44.655',type:2,event_name:'ASSET-UNDER_MANUAL_CONTROL',message:null,active:true,last_updated:null,title:'Row Box 2 (Row 2 | R2 | 13b4c3): Manual Row Control Start (Preset: Max)',icon:'setting_gray',user_name:'Sundus',user_email:'sundus.nisar@zigron.com',linked_asset_id:null }]});
          rClient.query.withArgs(db.siteLayoutInfoByAssetId, sinon.match.array).resolves({rows: [{name: 'Row 2', i: 2, shorthand_name: 'R2'}]});
          //todo: need to handle class level objects which are called with this keywork
         //todo: need to handle class level objects which are called with this keywork
          spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "ws_stow_panel_snow_depth").
            resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });
              // spies.sendSMS = sinon.stub(aws_integration, 'sendSMS').withArgs({ phoneNumber: '+923451000620', msgText: sinon.match.string })
              //     .resolves(true);
              // spies.sendEmail = sinon.stub(aws_integration, 'sendEmail').withArgs(sinon.match({ emailAddrs: ['waqas.iqbal@zigron.com'] }))
              //     .resolves(true);

          try {
            res = await weatherStowService.handler(client, pgWrite, nc_deep_panel_snow_request);
          } catch (err) {
            console.log("Error in test.. ", err);
            return Promise.reject(new Error(err));
          }
          expect(res).to.equal(true);
          //sinon.assert.callCount(rClient.query, 4);
          sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getAssetIdsWithActiveAlertsQuery, sinon.match.array);

          //sinon.assert.callCount(rClient.query, 4);
          sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.array);
          sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
          //todo: need to handle class level objects which are called with this keywork
          // sinon.assert.calledOnce(spies.notificationService_getAccounts);
          // sinon.assert.calledOnce(spies.sendSMS);
          // sinon.assert.calledOnce(spies.sendEmail);
        });
  });

  const nc_accuWeather_alert_request = {
    asset_id: "0384195d-d0bc-403e-9272-b5bd63dbe683",
    asset_name: null,
    device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
    timestamp: "2021-06-08T06:34:48.819Z",
    stow_type: 9,
    stow_value: 0,
    stow_threshold: 0,
    message_type: 'NC_OFFLINE_EXIT',
    type: "elastic_search-1",
    channel: "weather_stow_updates"
  };
  describe(`Get site stow due to AccuWeather Alert By Network Controller: ${nc_accuWeather_alert_request.stow_type}`, () => {
    beforeEach( function() {
      sinon.resetHistory();
      rClient.query.resetBehavior();
      wClient.query.resetBehavior();
      spies.notificationService_getAccounts.resetBehavior();

    });
    afterEach(function () {

    });

    it("When Already Have Active Alert. Message type is NC_OFFLINE_EXIT", async () => {
      let res;
      const site_stow_nc_asset_id_query = weatherStowService.getStowInfoQueryForStowType(nc_accuWeather_alert_request.stow_type);
      rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
      rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
      rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
      rClient.query.withArgs(sinon.match(site_stow_nc_asset_id_query), sinon.match.array).resolves({rows: [{id: '776cb420-b536-4a83-aeec-86a97cca76ab', site_id: '0f4892b4-8136-4c6a-bfe7-3a38d3b8fc2c', timestamp: '2021-06-08 02:00:31.000',
        active: true, state: 2, start_time: '2021-06-08 01:30:00', end_time: '2021-06-08 12:30:00', stow_type: 'Weather_Forecast_Alert-Severe_Thunderstorm_Warning',
        alarm_start_time: '2021-06-08 02:00:00', alarm_end_time: '2021-06-08 12:00:00', alarm_value: 0, alarm_threshold: 0,
        alarm_text: "The National Weather Service in State College PA has issued a\n\n* Severe Thunderstorm Warning for...\n Northwestern Huntingdon County in central Pennsylvania...\n Eastern Blair County in central Pennsylvania...\n\n* Until 645 PM EDT.\n\n* At 547 PM EDT, severe thunderstorms were located along a line\n extending from Tipton to near Canoe Creek State Park to Royer to\n near Roaring Spring to near Claysburg, moving northeast at 20 mph.\n\n HAZARD...70 mph wind gusts and quarter size hail.\n\n SOURCE...Radar indicated.\n\n IMPACT...Hail damage to vehicles is expected. Expect considerable\n tree damage. Wind damage is also likely to mobile homes,\n roofs, and outbuildings.\n\n* Severe thunderstorms will be near...\n Tipton and Bellwood around 550 PM EDT.\n Tyrone, Birmingham, Canoe Creek State Park and Sinking Valley\n around 600 PM EDT.\n Bald Eagle, Spruce Creek and Warriors Mark around 610 PM EDT.\n Franklinville and Williamsburg around 620 PM EDT.\n\nOther locations impacted by these severe thunderstorms include\nPetersburg, Marklesburg, Alexandria, McConnellstown, Delgrosso's\nAmusement Park, Juniata College and Altoona-Blair County Airport.\n\nThis includes Interstate 99 from mile markers 39 to 55.\n\nPRECAUTIONARY/PREPAREDNESS ACTIONS...\n\nFor your protection move to an interior room on the lowest floor of a\nbuilding.\n\n&&", "LanguageCode": "en", "Summary": "Severe Thunderstorm Warning in effect until 6:45 PM EDT. Source: U.S. National Weather Service" } ], "HaveReadyStatements": true, "MobileLink": "http://www.accuweather.com/en/us/petersburg-pa/16669/weather-warnings/2097814?lang=en-us", "Link": "http://www.accuweather.com/en/us/petersburg-pa/16669/weather-warnings/2097814?lang=en-us" }, { "CountryCode": "US", "AlertID": 2272041, "Description": { "Localized": "Severe Thunderstorm Watch", "English": "Severe Thunderstorm Watch" }, "Category": "SEVERE", "Priority": 45, "Type": "SVA", "TypeID": "US101", "Class": null, "Level": null, "Color": { "Name": "Yellow", "Red": 255, "Green": 255, "Blue": 0, "Hex": "#FFFF00" }, "Source": "U.S. National Weather Service", "SourceId": 2, "Disclaimer": null, "Area": [ { "Name": "Huntingdon", "StartTime": "2021-07-07T15:30:00-04:00", "EpochStartTime": 1625686200, "EndTime": "2021-07-07T23:00:00-04:00", "EpochEndTime": 1625713200, "LastAction": { "Localized": "Continue", "English": "Continue" }, "Text": "PA\n. PENNSYLVANIA COUNTIES INCLUDED ARE\n\nBLAIR CAMBRIA CAMERON\nCENTRE CLARION CLEARFIELD\nCLINTON ELK FOREST\nHUNTINGDON JEFFERSON MCKEAN\nMERCER MIFFLIN POTTER\nSNYDER UNION VENANGO\nWARREN", "LanguageCode": "en", "Summary": "Severe Thunderstorm Watch in effect until 11:00 PM EDT. Source: U.S. National Weather Service" } ], "HaveReadyStatements": true, "MobileLink": "http://www.accuweather.com/en/us/petersburg-pa/16669/weather-warnings/2097814?lang=en-us", "Link": "http://www.accuweather.com/en/us/petersburg-pa/16669/weather-warnings/2097814?lang=en-us" }, { "CountryCode": "US", "AlertID": 2272351, "Description": { "Localized": "Special Weather Statement", "English": "Special Weather Statement" }, "Category": "NON-PRECIPITATION", "Priority": 129, "Type": "AWXSPS", "TypeID": "US119", "Class": null, "Level": null, "Color": { "Name": "Moccasin", "Red": 255, "Green": 228, "Blue": 181, "Hex": "#FFE4B5" }, "Source": "U.S. National Weather Service", "SourceId": 2, "Disclaimer": null, "Area": [ { "Name": "Huntingdon", "StartTime": "2021-07-07T18:22:00-04:00", "EpochStartTime": 1625696520, "EndTime": "2021-07-07T18:45:00-04:00", "EpochEndTime": 1625697900, "LastAction": { "Localized": "New", "English": "New" }, "Text": "...STRONG THUNDERSTORMS WILL AFFECT PARTS OF PERRY...JUNIATA...\nHUNTINGDON...MIFFLIN...SNYDER...AND SOUTHERN CENTRE COUNTIES UNTIL\n645 PM EDT...\n\nAt 621 PM EDT, Doppler radar indicated strong thunderstorms along a\nline extending from Mcalevys Fort to near Newport. Movement was\nnortheast at 15 mph.\n\nPea size hail and wind gusts of 50 to 55 mph are possible.\n\nLocations impacted include...\nLewistown, Boalsburg, Burnham, Belleville, Milroy, Highland Park,\nYeagertown, Mcalisterville, McClure, Beaver Springs, Reedsville,\nRichfield, Juniata Terrace, Mexico, Mount Pleasant Mills, Alfarata,\nReeds Gap State Park, Mcalevys Fort, Belltown and Seven Mountains.\n\nPRECAUTIONARY/PREPAREDNESS ACTIONS...\n\nThese storms may intensify, so be certain to monitor local radio\nstations and available television stations for additional information\nand possible warnings from the National Weather Service.\n\n&&\n\nLAT...LON 4081 7778 4071 7693 4051 7717 4059 7792\nTIME...MOT...LOC 2221Z 209DEG 13KT 4063 7783 4056 7717",
        alarm_timestamp: '2021-06-08 02:00:00', connected: true, aws_iot_principal_id: 'ca2f283ae77cd3c4641468dc0368352bcccfccdc0f5621652fbfa0789b571cfc'}] });
      rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: [{id: '141111', event_name: 'Weather_Stow_AccuWeather-Alert', created: '2021-06-08 02:00:31.000', title: 'AccuWeather Weather Stow: Severe Thunderstorm Warning' }]});
      wClient.query.withArgs(db.updateActiveAlertParams, sinon.match.array).resolves({ rowCount: 1 });
      wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});

      try {
        res = await weatherStowService.handler(client, pgWrite, nc_accuWeather_alert_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, site_stow_nc_asset_id_query, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
      sinon.assert.callCount(wClient.query, 2);
      sinon.assert.calledWith(wClient.query, db.updateActiveAlertParams, sinon.match.array.contains(['2021-06-08 02:00:31.000',
        '141111']).and(sinon.match.some(sinon.match('The site failed to exit AccuWeather Weather Stow for'))));
      sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
    });
    it("When Have No Active Alert. Message type is NC_OFFLINE", async () => {
      let res;
      nc_accuWeather_alert_request.message_type = 'NC_OFFLINE';
      rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
      rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
      rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
      rClient.query.withArgs(weatherStowService.getStowInfoQueryForStowType(nc_accuWeather_alert_request.stow_type), sinon.match.array).resolves({rows: [{id: '776cb420-b536-4a83-aeec-86a97cca76ab', site_id: '0f4892b4-8136-4c6a-bfe7-3a38d3b8fc2c', timestamp: '2021-06-08 02:00:31.000',
        active: true, state: 2, start_time: '2021-06-08 01:30:00', end_time: '2021-06-08 12:30:00', stow_type: 'Weather_Forecast-Wind_Gust',
        alarm_start_time: '2021-06-08 02:00:00', alarm_end_time: '2021-06-08 12:00:00', alarm_value: 35, alarm_threshold: 30, alarm_text: null,
        alarm_timestamp: '2021-06-08 02:00:00', connected: true, aws_iot_principal_id: 'ca2f283ae77cd3c4641468dc0368352bcccfccdc0f5621652fbfa0789b571cfc'}] });
      rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: []});
      wClient.query.withArgs(db.addCloudAlertParamsByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
      wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
      // addCloudAlertDetails, addCloudEventLogDetails
      wClient.query.withArgs(sinon.match.string, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
      rClient.query.withArgs(db.getAssetIdsWithActiveAlertsQuery, sinon.match.array).resolves({rows: [{id: 'a71904c4-0b4e-4d1b-b222-0565bf122a2b', asset_id: '8dcfafd2-5240-4f24-9532-77899e30f772', created: '2021-03-15 11:12:44.655',type:2,event_name:'ASSET-UNDER_MANUAL_CONTROL',message:null,active:true,last_updated:null,title:'Row Box 2 (Row 2 | R2 | 13b4c3): Manual Row Control Start (Preset: Max)',icon:'setting_gray',user_name:'Sundus',user_email:'sundus.nisar@zigron.com',linked_asset_id:null }]});
      //rClient.query.withArgs(db.siteLayoutInfoByAssetId, sinon.match.array).resolves({rows: [{name: 'Row 2', i: 2, shorthand_name: 'R2'}]});
      spies.notificationService_getAccounts.withArgs(rClient,assetInfoByNCAssetID[0].site_id, "accuweather_stow").
        resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'], my_test: "adn-getaccounts" });

      try {
        res = await weatherStowService.handler(client, pgWrite, nc_accuWeather_alert_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 6);
      sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, weatherStowService.getStowInfoQueryForStowType(nc_accuWeather_alert_request.stow_type), sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getAssetIdsWithActiveAlertsQuery, sinon.match.array);
      //sinon.assert.calledWith(rClient.query, db.siteLayoutInfoByAssetId, sinon.match.array);
      sinon.assert.callCount(wClient.query, 4);
      sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.array);
      sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
      sinon.assert.calledOnce(spies.notificationService_getAccounts);
      sinon.assert.calledOnce(spies.sendSMS);
      sinon.assert.calledOnce(spies.sendEmail);

      //sinon.assert.callCount(rClient.query, 4);
      //sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.array);
      sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.some(sinon.match('The site failed to enter AccuWeather Weather Stow for')));
      sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
      //todo: need to handle class level objects which are called with this keywork
      // sinon.assert.calledOnce(spies.notificationService_getAccounts);
      // sinon.assert.calledOnce(spies.sendSMS);
      // sinon.assert.calledOnce(spies.sendEmail);
    });
    it("When Have No Active Alert. Message type is NORMAL", async () => {
      let res;
      nc_accuWeather_alert_request.message_type = 'NORMAL';
      rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
      rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
      rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
      rClient.query.withArgs(weatherStowService.getStowInfoQueryForStowType(nc_accuWeather_alert_request.stow_type), sinon.match.array).resolves({rows: [{id: '776cb420-b536-4a83-aeec-86a97cca76ab', site_id: '0f4892b4-8136-4c6a-bfe7-3a38d3b8fc2c', timestamp: '2021-06-08 02:00:31.000',
        active: true, state: 2, start_time: '2021-06-08 01:30:00', end_time: '2021-06-08 12:30:00', stow_type: 'Weather_Forecast-Wind_Gust',
        alarm_start_time: '2021-06-08 02:00:00', alarm_end_time: '2021-06-08 12:00:00', alarm_value: 35, alarm_threshold: 30, alarm_text: null,
        alarm_timestamp: '2021-06-08 02:00:00', connected: true, aws_iot_principal_id: 'ca2f283ae77cd3c4641468dc0368352bcccfccdc0f5621652fbfa0789b571cfc'}] });
      rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: []});
      wClient.query.withArgs(db.addCloudAlertParamsByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
      wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
      // addCloudAlertDetails, addCloudEventLogDetails
      wClient.query.withArgs(sinon.match.string, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
      rClient.query.withArgs(db.getAssetIdsWithActiveAlertsQuery, sinon.match.array).resolves({rows: [{id: 'a71904c4-0b4e-4d1b-b222-0565bf122a2b', asset_id: '8dcfafd2-5240-4f24-9532-77899e30f772', created: '2021-03-15 11:12:44.655',type:2,event_name:'ASSET-UNDER_MANUAL_CONTROL',message:null,active:true,last_updated:null,title:'Row Box 2 (Row 2 | R2 | 13b4c3): Manual Row Control Start (Preset: Max)',icon:'setting_gray',user_name:'Sundus',user_email:'sundus.nisar@zigron.com',linked_asset_id:null }]});
      //rClient.query.withArgs(db.siteLayoutInfoByAssetId, sinon.match.array).resolves({rows: [{name: 'Row 2', i: 2, shorthand_name: 'R2'}]});
      spies.notificationService_getAccounts.withArgs(rClient,assetInfoByNCAssetID[0].site_id, "accuweather_stow").
      resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'], my_test: "adn-getaccounts" });

      try {
        res = await weatherStowService.handler(client, pgWrite, nc_accuWeather_alert_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 6);
      sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, weatherStowService.getStowInfoQueryForStowType(nc_accuWeather_alert_request.stow_type), sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getAssetIdsWithActiveAlertsQuery, sinon.match.array);
      //sinon.assert.calledWith(rClient.query, db.siteLayoutInfoByAssetId, sinon.match.array);
      sinon.assert.callCount(wClient.query, 4);
      sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.array);
      sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
      sinon.assert.calledOnce(spies.notificationService_getAccounts);
      sinon.assert.calledOnce(spies.sendSMS);
      sinon.assert.calledOnce(spies.sendEmail);

      //sinon.assert.callCount(rClient.query, 4);
      //sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.array);
      sinon.assert.calledWith(wClient.query, db.addCloudAlertParamsByReturnId, sinon.match.some(sinon.match('The site is in AccuWeather Weather Stow due to')));
      sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
      //todo: need to handle class level objects which are called with this keywork
      // sinon.assert.calledOnce(spies.notificationService_getAccounts);
      // sinon.assert.calledOnce(spies.sendSMS);
      // sinon.assert.calledOnce(spies.sendEmail);
    });
  });

  const nc_stop_wind_gust_request = {
    asset_id: "0384195d-d0bc-403e-9272-b5bd63dbe683",
    asset_name: null,
    device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
    timestamp: "2021-03-15T06:34:48.819Z",
    stow_type: 21,
    stow_value: 1,
    stow_threshold: 10,
    type: "elastic_search-1",
    channel: "weather_stow_updates"
  };
  describe(`Stop site stow due to High Wind Gust By Network Controller: ${nc_stop_wind_gust_request.stow_type}`, () => {
    beforeEach(async () => {
      sinon.resetHistory();
      rClient.query.resetBehavior();
      wClient.query.resetBehavior();
      spies.notificationService_getAccounts.resetBehavior();
    });
    afterEach(async () => {
      
    });
    it("When Have No Active Alert", async () => {
      let res;
       rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
       rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
       rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
       rClient.query.withArgs(db.getcloudAlertQueryByNCId, sinon.match.array).resolves({rows: []});
      
      try {
        res = await weatherStowService.handler(client, pgWrite, nc_stop_wind_gust_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      //sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getcloudAlertQueryByNCId, sinon.match.array);
      
    });
     it("When Have Active Alert", async () => {
        let res;
        rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
        rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
        rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '1d6e2838-8ac9-42f2-8418-778a95a27e75',device_type: 'Row Controller',reported_type:0}] });
        rClient.query.withArgs(db.getcloudAlertQueryByNCId, sinon.match.array).resolves({rows: [{id: '141111'}]});
        rClient.query.withArgs(db.siteLayoutInfoByAssetId, sinon.match.array).resolves({rows: [{name: null, i: 3, shorthand_name: null}]});
        wClient.query.withArgs(db.removeCloudAlertDetail, sinon.match.array).resolves({rowCount:2});
        wClient.query.withArgs(db.removeCloudAlert, sinon.match.array).resolves({rowCount:2});
        wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
        spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "ws_stow_wind_gust").
          resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });

        try {
          res = await weatherStowService.handler(client, pgWrite, nc_stop_wind_gust_request);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        //sinon.assert.callCount(rClient.query, 3);
        sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.getcloudAlertQueryByNCId, sinon.match.array);
        sinon.assert.calledWith(wClient.query, db.removeCloudAlertDetail, sinon.match.array);
        sinon.assert.calledWith(wClient.query, db.removeCloudAlert, sinon.match.array);
        sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
      });
  });
    const nc_stop_avg_wind_request = {
      asset_id: "0384195d-d0bc-403e-9272-b5bd63dbe683",
      asset_name: null,
      device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
      timestamp: "2021-03-15T06:34:48.819Z",
      stow_type: 22,
      stow_value: 1,
      stow_threshold: 10,
      type: "elastic_search-1",
      channel: "weather_stow_updates"
    };
    describe(`Stop site stow due to High Average Wind By Network Controller: ${nc_stop_avg_wind_request.stow_type}`, () => {
      beforeEach(async () => {
        sinon.resetHistory();
        rClient.query.resetBehavior();
        wClient.query.resetBehavior();
        spies.notificationService_getAccounts.resetBehavior();
      });
      afterEach(async () => {
        
      });
      it("When Have No Active Alert", async () => {
        let res;
         rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
         rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
         rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
         rClient.query.withArgs(db.getcloudAlertQueryByNCId, sinon.match.array).resolves({rows: []});
        
        try {
          res = await weatherStowService.handler(client, pgWrite, nc_stop_avg_wind_request);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        //sinon.assert.callCount(rClient.query, 3);
        sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.getcloudAlertQueryByNCId, sinon.match.array);
        
      });
      it("When Have Active Alert", async () => {
        let res;
        rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
        rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
        rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '1d6e2838-8ac9-42f2-8418-778a95a27e75',device_type: 'Row Controller',reported_type:0}] });
        rClient.query.withArgs(db.getcloudAlertQueryByNCId, sinon.match.array).resolves({rows: [{id: '141111'}]});
        rClient.query.withArgs(db.siteLayoutInfoByAssetId, sinon.match.array).resolves({rows: [{name: null, i: 3, shorthand_name: null}]});
        wClient.query.withArgs(db.removeCloudAlertDetail, sinon.match.array).resolves({rowCount:2});
        wClient.query.withArgs(db.removeCloudAlert, sinon.match.array).resolves({rowCount:2});
        wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
        spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "ws_stow_wind_speed").
          resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });

        try {
          res = await weatherStowService.handler(client, pgWrite, nc_stop_avg_wind_request);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        //sinon.assert.callCount(rClient.query, 3);
        sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.getcloudAlertQueryByNCId, sinon.match.array);
        sinon.assert.calledWith(wClient.query, db.removeCloudAlertDetail, sinon.match.array);
        sinon.assert.calledWith(wClient.query, db.removeCloudAlert, sinon.match.array);
        sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
      }); 
    });
      const nc_stop_snow_depth_request = {
        asset_id: "0384195d-d0bc-403e-9272-b5bd63dbe683",
        asset_name: null,
        device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
        timestamp: "2021-03-15T06:34:48.819Z",
        stow_type: 23,
        stow_value: 1,
        stow_threshold: 10,
        type: "elastic_search-1",
        channel: "weather_stow_updates"
      };
      describe(`Stop site stow due to Snow Depth By Network Controller: ${nc_stop_snow_depth_request.stow_type}`, () => {
        beforeEach(async () => {
          sinon.resetHistory();
          rClient.query.resetBehavior();
          wClient.query.resetBehavior();
          spies.notificationService_getAccounts.resetBehavior();

        });
        afterEach(async () => {
          
        });
        it("When Have No Active Alert", async () => {
          let res;
           rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
           rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
           rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
           rClient.query.withArgs(db.getcloudAlertQueryByNCId, sinon.match.array).resolves({rows: []});
          
          try {
            res = await weatherStowService.handler(client, pgWrite, nc_stop_snow_depth_request);
          } catch (err) {
            console.log("Error in test.. ", err);
            return Promise.reject(new Error(err));
          }
          expect(res).to.equal(true);
          //sinon.assert.callCount(rClient.query, 3);
          sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getcloudAlertQueryByNCId, sinon.match.array);
          
        });  
        it("When Have Active Alert", async () => {
          let res;
          rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
          rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
          rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '1d6e2838-8ac9-42f2-8418-778a95a27e75',device_type: 'Row Controller',reported_type:0}] });
          rClient.query.withArgs(db.getcloudAlertQueryByNCId, sinon.match.array).resolves({rows: [{id: '141111'}]});
          rClient.query.withArgs(db.siteLayoutInfoByAssetId, sinon.match.array).resolves({rows: [{name: null, i: 3, shorthand_name: null}]});
          wClient.query.withArgs(db.removeCloudAlertDetail, sinon.match.array).resolves({rowCount:2});
          wClient.query.withArgs(db.removeCloudAlert, sinon.match.array).resolves({rowCount:2});
          wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
          spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "ws_stow_snow_depth").
            resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });

          try {
            res = await weatherStowService.handler(client, pgWrite, nc_stop_snow_depth_request);
          } catch (err) {
            console.log("Error in test.. ", err);
            return Promise.reject(new Error(err));
          }
          expect(res).to.equal(true);
          //sinon.assert.callCount(rClient.query, 3);
          sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
          sinon.assert.calledWith(rClient.query, db.getcloudAlertQueryByNCId, sinon.match.array);
          sinon.assert.calledWith(wClient.query, db.removeCloudAlertDetail, sinon.match.array);
          sinon.assert.calledWith(wClient.query, db.removeCloudAlert, sinon.match.array);
          sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
        });
      });
        const nc_stop_deep_panel_snow_request = {
          asset_id: "0384195d-d0bc-403e-9272-b5bd63dbe683",
          asset_name: null,
          device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
          timestamp: "2021-03-15T06:34:48.819Z",
          stow_type: 24,
          stow_value: 1,
          stow_threshold: 10,
          type: "elastic_search-1",
          channel: "weather_stow_updates"
        };
        describe(`Stop site stow due to Deep Panel Snow By Network Controller: ${nc_stop_deep_panel_snow_request.stow_type}`, () => {
          beforeEach(async () => {
            sinon.resetHistory();
            rClient.query.resetBehavior();
            wClient.query.resetBehavior();
            spies.notificationService_getAccounts.resetBehavior();

          });
          afterEach(async () => {
            
          });
          it("When Have No Active Alert", async () => {
            let res;
             rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
             rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
             rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
             rClient.query.withArgs(db.getcloudAlertQueryByNCId, sinon.match.array).resolves({rows: []});
            
            try {
              res = await weatherStowService.handler(client, pgWrite, nc_stop_deep_panel_snow_request);
            } catch (err) {
              console.log("Error in test.. ", err);
              return Promise.reject(new Error(err));
            }
            expect(res).to.equal(true);
            //sinon.assert.callCount(rClient.query, 3);
            sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getcloudAlertQueryByNCId, sinon.match.array);
            
          });  
          it("When Have Active Alert", async () => {
            let res;
            rClient.query.withArgs(db.siteInfoByAssetId, sinon.match.array).resolves({ rows: assetInfoByID });
            rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
            rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '1d6e2838-8ac9-42f2-8418-778a95a27e75',device_type: 'Row Controller',reported_type:0}] });
            rClient.query.withArgs(db.getcloudAlertQueryByNCId, sinon.match.array).resolves({rows: [{id: '141111'}]});
            rClient.query.withArgs(db.siteLayoutInfoByAssetId, sinon.match.array).resolves({rows: [{name: null, i: 3, shorthand_name: null}]});
            wClient.query.withArgs(db.removeCloudAlertDetail, sinon.match.array).resolves({rowCount:2});
            wClient.query.withArgs(db.removeCloudAlert, sinon.match.array).resolves({rowCount:2});
            wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
            spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "ws_stow_panel_snow_depth").
              resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });

            try {
              res = await weatherStowService.handler(client, pgWrite, nc_stop_deep_panel_snow_request);
            } catch (err) {
              console.log("Error in test.. ", err);
              return Promise.reject(new Error(err));
            }
            expect(res).to.equal(true);
            //sinon.assert.callCount(rClient.query, 3);
            sinon.assert.calledWith(rClient.query, db.siteInfoByAssetId, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
            sinon.assert.calledWith(rClient.query, db.getcloudAlertQueryByNCId, sinon.match.array);
            sinon.assert.calledWith(wClient.query, db.removeCloudAlertDetail, sinon.match.array);
            sinon.assert.calledWith(wClient.query, db.removeCloudAlert, sinon.match.array);
            sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
          });
        });
  const nc_stop_accuWeather_snow_depth_request = {
    asset_id: "0384195d-d0bc-403e-9272-b5bd63dbe683",
    asset_name: null,
    device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
    timestamp: "2021-03-15T06:34:48.819Z",
    stow_type: 28,
    stow_value: 0,
    stow_threshold: 0,
    type: "elastic_search-1",
    channel: "weather_stow_updates"
  };

  describe(`Stop site stow due to AccuWeather Snow Depth By Network Controller: ${nc_stop_accuWeather_snow_depth_request.stow_type}`, () => {
    beforeEach(async () => {
      sinon.resetHistory();
      rClient.query.resetBehavior();
      wClient.query.resetBehavior();
      spies.notificationService_getAccounts.resetBehavior();
    });
    afterEach(async () => {

    });
    it("When Have No Active Alert", async () => {
      let res;
      rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
      rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
      rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
      rClient.query.withArgs(weatherStowService.getStowInfoQueryForStowType(nc_stop_accuWeather_snow_depth_request.stow_type), sinon.match.array).resolves({rows: [{id: '776cb420-b536-4a83-aeec-86a97cca76ab', site_id: '0f4892b4-8136-4c6a-bfe7-3a38d3b8fc2c', timestamp: '2021-06-08 02:00:31.000',
        active: true, state: 11, start_time: '2021-06-08 01:30:00', end_time: '2021-06-08 12:30:00', stow_type: 'Weather_Forecast-Deep_Snow',
        alarm_start_time: '2021-06-08 02:00:00', alarm_end_time: '2021-06-08 12:00:00', alarm_value: 35, alarm_threshold: 30, alarm_text: null,
        alarm_timestamp: '2021-06-08 02:00:00', connected: true, aws_iot_principal_id: 'ca2f283ae77cd3c4641468dc0368352bcccfccdc0f5621652fbfa0789b571cfc'}] });
      rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: []});

      try {
        res = await weatherStowService.handler(client, pgWrite, nc_stop_accuWeather_snow_depth_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, weatherStowService.getStowInfoQueryForStowType(nc_stop_accuWeather_snow_depth_request.stow_type), sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
      sinon.assert.notCalled(wClient.query);

    });
    it("When Have Active Alert", async () => {
      let res;
      rClient.query.withArgs(db.siteInfoByNCAssetId, sinon.match.array).resolves({ rows: assetInfoByNCAssetID });
      rClient.query.withArgs(db.getProjectSitesQuery, sinon.match.array).resolves({ rows: [site_info] });
      rClient.query.withArgs(db.deviceTypeInfoQuery, sinon.match.array).resolves({rows: [{id: '9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4',device_type: 'Network Controller',reported_type:1}] });
      rClient.query.withArgs(weatherStowService.getStowInfoQueryForStowType(nc_stop_accuWeather_snow_depth_request.stow_type), sinon.match.array).resolves({rows: [{id: '776cb420-b536-4a83-aeec-86a97cca76ab', site_id: '0f4892b4-8136-4c6a-bfe7-3a38d3b8fc2c', timestamp: '2021-06-08 02:00:31.000',
        active: true, state: 11, start_time: '2021-06-08 01:30:00', end_time: '2021-06-08 12:30:00', stow_type: 'Weather_Forecast-Deep_Snow',
        alarm_start_time: '2021-06-08 02:00:00', alarm_end_time: '2021-06-08 12:00:00', alarm_value: 35, alarm_threshold: 30, alarm_text: null,
        alarm_timestamp: '2021-06-08 02:00:00', connected: true, aws_iot_principal_id: 'ca2f283ae77cd3c4641468dc0368352bcccfccdc0f5621652fbfa0789b571cfc'}] });
      rClient.query.withArgs(db.getLastCloudAlertQuery, sinon.match.array).resolves({rows: [{id: '141111'}]});
      wClient.query.withArgs(db.removeCloudAlertDetail, sinon.match.array).resolves({rowCount:2});
      wClient.query.withArgs(db.removeCloudAlert, sinon.match.array).resolves({rowCount:2});
      wClient.query.withArgs(db.addCloudEventLogByReturnId, sinon.match.array).resolves({rowCount: 1,rows: [{id: '12134b5vy-5240-4f24-9532-77899e30f772'}]});
      spies.notificationService_getAccounts.withArgs(rClient,assetInfoByID[0].site_id, "accuweather_stow").
        resolves({ emails: ['waqas.iqbal@zigron.com'], phone_nums: ['+923451000620'] });

      try {
        res = await weatherStowService.handler(client, pgWrite, nc_stop_accuWeather_snow_depth_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 5);
      sinon.assert.calledWith(rClient.query, db.siteInfoByNCAssetId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getProjectSitesQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.deviceTypeInfoQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.getLastCloudAlertQuery, sinon.match.array);
      sinon.assert.calledWith(rClient.query, weatherStowService.getStowInfoQueryForStowType(nc_stop_accuWeather_snow_depth_request.stow_type), sinon.match.array);
      sinon.assert.callCount(wClient.query, 3);
      sinon.assert.calledWith(wClient.query, db.removeCloudAlertDetail, sinon.match.array);
      sinon.assert.calledWith(wClient.query, db.removeCloudAlert, sinon.match.array);
      sinon.assert.calledWith(wClient.query, db.addCloudEventLogByReturnId, sinon.match.array);
      sinon.assert.calledOnce(spies.notificationService_getAccounts);
      sinon.assert.calledOnce(spies.sendSMS);
      sinon.assert.calledOnce(spies.sendEmail);

    });
  });
});






/*process.env.NODE_ENV = "test";

const sinon = require("sinon");
const chai = require("chai");
const moment = require("moment");
const pg = require("pg");
const db = require("../db");
const { pgConfig, pgMasterConfig } = require("../pg");
const { notificationService } = require("../services/notificationService");
const weatherStowService = require("../services/weatherStowService");
const aws_integration = require("../aws_integration");


const expect = chai.expect;

describe("Weather Stow Service", () => {
  let client;
  let pgWrite;
  let spies = {};
  let db_stub;
  let rClient;
  let wClient;
  const nc_events = {
      asset_id: "0384195d-d0bc-403e-9272-b5bd63dbe683",
      asset_name: null,
      device_type_id: "9c0720c1-c980-4bc4-b837-f6d5bf9c7bd4",
      timestamp: "2021-03-15T06:34:48.819Z",
      stow_type: 22,
      stow_value: 0,
      stow_threshold: 0,
      type: "elastic_search-1",
      channel: "weather_stow_updates"
    };
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
    
  });
  after(async () => {
    await client.end();
  });
  nc_events.forEach (event => {
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
        site_stow_xx_id_res.active = false;
        rClient.query.resolves({rows: [site_stow_xx_id_res]});
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
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.state = 11;
        rClient.query.resolves({rows: [site_stow_xx_id_res]});
        rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 2);
        sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
        sinon.assert.calledOnce(spies.iotPub);
        expect(spies.iotPub.getCall(0).calledWith(site_stow_xx_id_res.aws_iot_principal_id, {
          stow: false,
          stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
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
        site_stow_xx_id_res.active = false;
        rClient.query.resolves({rows: [site_stow_xx_id_res]});
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
        rClient.query.resolves({rows: [site_stow_xx_id_res]});
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
        rClient.query.resolves({rows: [site_stow_xx_id_res]});
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
        rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
        rClient.query.resolves({rows: [site_stow_xx_id_res]});
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 2);
        sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
        sinon.assert.calledOnce(spies.iotPub);
        expect(spies.iotPub.getCall(0).calledWith(site_stow_xx_id_res.aws_iot_principal_id, {
          stow: true,
          stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
          start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
          end_time: moment(site_stow_xx_id_res.end_time).utc().format()
        })).to.be.true;
      });

      it("Active pending stow end info in DB. NC connected true", async () => {
        let res;
        site_stow_xx_id_res.active = true;
        site_stow_xx_id_res.connected = true;
        site_stow_xx_id_res.state = 11;
        rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
        rClient.query.resolves({rows: [site_stow_xx_id_res]});
        try {
          res = await accuWeatherService.handler(client, pgWrite, event);
        } catch (err) {
          console.log("Error in test.. ", err);
          return Promise.reject(new Error(err));
        }
        expect(res).to.equal(true);
        sinon.assert.callCount(rClient.query, 2);
        sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
        sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
        sinon.assert.calledOnce(spies.iotPub);
        sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
          stow: false,
          stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
          start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
          end_time: moment(site_stow_xx_id_res.end_time).utc().format()
        });
      });
    });
  });

  const nc_response = {
    channel: 'local_weather_nc_stow_update',
    network_controller_id: 'e60e53ad-bd85-45ed-8e43-bbdb451ac45e',
    need_accu_weather_update: false,
    accu_stow: true,
    stow_type: 'wind',
    stow_start_time: '2020-09-11T15:00:00Z',
    stow_end_time: '2020-09-11T16:30:00Z',
    type: "elastic_search-1"
  };

  describe(`NC Response: ${nc_response.channel}`, () => {
    before(() => {
      spies.weather_stow_updates = sinon.stub(weather_stow_updates, 'handleWeatherStowUpdates').resolves(true);
    });
    after(() => {
      spies.weather_stow_updates.resetBehavior();
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
      rClient.query.withArgs(db.metaInfoBySiteId, sinon.match.array).resolves({ rows: [site_meta_data] });
      wClient.query.withArgs(db.site_stow_update, sinon.match.array).returns({ rowCount: 1 });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_response);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 2);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query.firstCall, db.site_stow_update, [2, true, site_stow_xx_id_res.id]);
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.calledWith(spies.weather_stow_updates, rClient, wClient, { channel: "weather_stow_updates", stow_type: 6,
        asset_id: site_meta_data.asset_id, asset_name: site_meta_data.name, timestamp: sinon.match.string, acw_nc_reponse_stow_state: sinon.match.bool });
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
      sinon.assert.callCount(rClient.query, 2);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query.firstCall, db.site_stow_update, [12, false, site_stow_xx_id_res.id]);
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.calledWith(spies.weather_stow_updates, rClient, wClient, { channel: "weather_stow_updates", stow_type: 6,
        asset_id: site_meta_data.asset_id, asset_name: site_meta_data.name, timestamp: sinon.match.string, acw_nc_reponse_stow_state: sinon.match.bool });
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

    it("Stow Not enabled.", async () => {
      let res;
      site_stow_xx_id_res.enable_weather_forecast_stow = true;
      site_stow_xx_id_res.enable_weather_forecast = false;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.state = 1;
      rClient.query.resolves({rows: [site_stow_xx_id_res]});
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 2);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      expect(spies.iotPub.getCall(0).calledWith(site_stow_xx_id_res.aws_iot_principal_id, {
        stow: false,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
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
      sinon.assert.callCount(rClient.query, 2);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, sinon.match.any, {
        stow: false,
        stow_type: "wind",
        start_time: sinon.match.string,
        end_time: sinon.match.string
      });
    });

    it("Inactive stow info in DB", async () => {
      let res;
      site_stow_xx_id_res.enable_weather_forecast_stow = true;
      site_stow_xx_id_res.enable_weather_forecast = true;
      site_stow_xx_id_res.active = false;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 12;
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      rClient.query.resolves({ rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 2);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: false,
        stow_type: "wind",
        start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
        end_time: moment(site_stow_xx_id_res.end_time).utc().format()
      });
    });

    it("Active stow start info in DB", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 2;
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      rClient.query.resolves({ rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 2);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
        start_time: moment(site_stow_xx_id_res.start_time).utc().format(),
        end_time: moment(site_stow_xx_id_res.end_time).utc().format()
      });
    });

    it("Active stow end info in DB", async () => {
      let res;
      site_stow_xx_id_res.active = true;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 11;
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      rClient.query.resolves({ rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, nc_request);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      expect(res).to.equal(true);
      sinon.assert.callCount(rClient.query, 2);
      sinon.assert.calledWith(rClient.query, db.site_stow_nc_id, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: false,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
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
    "stow_type": "Weather_Forecast_Avg_Wind",
    "start": {
      "when": "2020-09-11T14:30:00Z"
    },
    "end": {
      "when": "2020-09-11T16:15:00Z"
    },
    "alarm": {
      "channel": "local_weather_hourly_alarms",
      "timestamp": "2020-09-11T15:40:00Z",
      "site_data": {
        "channel": "check_weather_alarms",
        "id": "ae691dfa-72bd-4e5e-8dc2-871878cadbc8",
        "location_lat": 40.58107,
        "location_lng": -78.073277,
        "name": "Zigron Test Site 16",
        "wind_speed_threshold": 10,
        "gust_threshold": 42,
        "snow_depth_threshold": 197,
        "panel_snow_depth_threshold": 196.85,
        "enable_weather_forecast_stow": true,
        "enable_weather_forecast_notification": true,
        "weather_forecast_stow_prior_time": 30,
        "weather_forecast_stow_after_time": 15,
        "weather_forecast_notification_threshold": 80
      },
      "stow_type": "Weather_Forecast_Avg_Wind", // "WEATHER_FORECAST_ALERT-HIGH_WIND_WATCH"
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
    },
    "next": null,
    "type": "elastic_search-1"
  };
  const site_meta_data = {
    site_id: "ae691dfa-72bd-4e5e-8dc2-871878cadbc8",
    site_name: "Zigron Test Site 16",
    location_lat: "33.6644783020020000",
    location_lng: "73.0501708984375000",
    is_notify: "true",
    asset_id: "93911a1f-3c47-44d9-bd90-6a35dc1b060b",
    device_type: "Network Controller",
    name: "Network Controller Dev Site",
    snap_addr: Buffer.from([0x0e, 0x2b, 0xa2]),
    project_location: null
  };
  describe(`Alerts site stow: ${stow_alarm.channel}`, () => {
    before (() => {
      //client = new pg.Client(pgConfig);
      rClient.query.resetBehavior();
      rClient.query.withArgs(db.metaInfoBySiteId, sinon.match.array).resolves({ rows: [site_meta_data] });
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
      wClient.query.withArgs(db.site_stow_upsert, sinon.match.array).callsFake((query, values) => {
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
      spies.notificationService = sinon.stub(notificationService, 'getAccounts').withArgs(rClient,site_meta_data.site_id, "accuweather_stow")
        .resolves({ emails: ['adnan.obaid@zigron.com'],
          phone_nums: ['+923335357089'] });
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
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_upsert, [site_meta_data.asset_id, site_meta_data.site_id, stow_alarm.timestamp,
        true, 1, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
        stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.calledOnce(spies.notificationService);
      sinon.assert.calledOnce(spies.sendSMS);
      sinon.assert.calledOnce(spies.sendEmail);
    });

    it("Fresh alarm. No stow info present", async () => {
      let res;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 12;
      site_stow_xx_id_res.active = false;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [no_stow_info_res] });
      wClient.query.withArgs(db.site_stow_upsert, sinon.match.array).callsFake((query, values) => {
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
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_upsert, [site_meta_data.asset_id, site_meta_data.site_id, stow_alarm.timestamp,
        true, 1, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
        stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.calledOnce(spies.notificationService);
      sinon.assert.calledOnce(spies.sendSMS);
      sinon.assert.calledOnce(spies.sendEmail);
    });

    it("Fresh alarm. NC offline", async () => {
      let res;
      site_stow_xx_id_res.connected = false;
      site_stow_xx_id_res.state = 12;
      site_stow_xx_id_res.active = false;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      wClient.query.withArgs(db.site_stow_upsert, sinon.match.array).callsFake((query, values) => {
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
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 3);
      sinon.assert.calledWith(wClient.query, db.site_stow_upsert, [site_meta_data.asset_id, site_meta_data.site_id, stow_alarm.timestamp,
        true, 1, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
        stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp]);
      sinon.assert.calledWith(wClient.query, db.addFullCloudAlertQuery, sinon.match.array.contains(["Weather_Stow_AccuWeather", `AccuWeather Weather Stow Failed: NC is offline`]));
      sinon.assert.calledWith(wClient.query, db.addFullCloudEventLogQuery, sinon.match.array.contains(["Weather_Stow_AccuWeather", `AccuWeather Weather Stow Failed: NC is offline`]));
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.calledOnce(spies.notificationService);
      sinon.assert.calledOnce(spies.sendSMS);
      sinon.assert.calledOnce(spies.sendEmail);
    });

    it("Fresh alarm. enable_weather_forecast_notification false", async () => {
      let res;
      stow_alarm.alarm.site_data.enable_weather_forecast_notification = false;
      site_stow_xx_id_res.connected = true;
      site_stow_xx_id_res.state = 12;
      site_stow_xx_id_res.active = false;
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      wClient.query.withArgs(db.site_stow_upsert, sinon.match.array).callsFake((query, values) => {
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
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_upsert, [site_meta_data.asset_id, site_meta_data.site_id, stow_alarm.timestamp,
        true, 1, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
        stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Update alarm. No change", async () => {
      let res;
      stow_alarm.alarm.site_data.enable_weather_forecast_notification = true;
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
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 0);
      sinon.assert.notCalled(spies.iotPub);
      sinon.assert.notCalled(spies.notificationService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Update alarm. No change. Site stow state pending", async () => {
      let res;
      stow_alarm.alarm.site_data.enable_weather_forecast_notification = true;
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
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 0);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationService);
      sinon.assert.notCalled(spies.sendSMS);
      sinon.assert.notCalled(spies.sendEmail);
    });

    it("Update alarm. No change. Site stow state pending, NC was previously offline", async () => {
      let res;
      stow_alarm.alarm.site_data.enable_weather_forecast_notification = true;
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
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [{id: "45f31068", title: "NC is offline"}] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.removeCloudAlert, ["45f31068"]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.notCalled(spies.notificationService);
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
      stow_alarm.end.when = moment(stow_alarm.end.when).add(80, "minutes").utc().format();
      rClient.query.withArgs(db.site_stow_site_id, sinon.match.array).resolves({ rowCount: 1, rows: [site_stow_xx_id_res] });
      rClient.query.withArgs(db.checkCloudAlert, sinon.match.array).resolves({ rows: [] });
      wClient.query.withArgs(db.site_stow_upsert, sinon.match.array).returns({ rowCount: 1, rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_upsert, [site_meta_data.asset_id, site_meta_data.site_id, moment(site_stow_xx_id_res.timestamp).utc().format(),
        true, 3, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
        stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: true,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
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
      wClient.query.withArgs(db.site_stow_upsert, sinon.match.array).returns({ rowCount: 1, rows: [site_stow_xx_id_res] });
      try {
        res = await accuWeatherService.handler(client, pgWrite, stow_alarm);
      } catch (err) {
        console.log("Error in test.. ", err);
        return Promise.reject(new Error(err));
      }
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 0);
      sinon.assert.notCalled(spies.iotPub);
      stow_alarm.end.when = moment(stow_alarm.end.when).subtract(80, "minutes").utc().format();
      stow_alarm.alarm.timestamp = moment(site_stow_xx_id_res.alarm_timestamp).add(1, "hour").utc().format();
    });

    it("Clear alarm.", async () => {
      let res;
      stow_alarm.alarm.site_data.enable_weather_forecast_notification = true;
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
      wClient.query.withArgs(db.site_stow_upsert, sinon.match.array).callsFake((query, values) => {
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
      sinon.assert.callCount(rClient.query, 3);
      sinon.assert.calledWith(rClient.query, db.metaInfoBySiteId, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.checkCloudAlert, sinon.match.array);
      sinon.assert.calledWith(rClient.query, db.site_stow_site_id, sinon.match.array);
      sinon.assert.callCount(wClient.query, 1);
      sinon.assert.calledWith(wClient.query, db.site_stow_upsert, [site_meta_data.asset_id, site_meta_data.site_id, moment(site_stow_xx_id_res.timestamp).utc().format(),
        true, 11, stow_alarm.alarm.stow_type, stow_alarm.start.when, stow_alarm.end.when, stow_alarm.alarm.start.when, stow_alarm.alarm.end.when,
        stow_alarm.alarm.start.value, stow_alarm.alarm.start.threshold, null, stow_alarm.alarm.timestamp]);
      sinon.assert.calledOnce(spies.iotPub);
      sinon.assert.calledWith(spies.iotPub, site_stow_xx_id_res.aws_iot_principal_id, {
        stow: false,
        stow_type: site_stow_xx_id_res.stow_type.toLowerCase().indexOf("snow") >= 0 ? "snow" : "wind",
        start_time: site_stow_xx_id_res.start_time,
        end_time: site_stow_xx_id_res.end_time
      });
      sinon.assert.calledOnce(spies.notificationService);
      sinon.assert.calledOnce(spies.sendSMS);
      sinon.assert.calledOnce(spies.sendEmail);
    });
  });
});
*/