const testBase = require("./common/testBase");
const moment = require("moment");
const { site } = require("./common/testData");
const { mockSns, mockSqsGetQueueUrl, mockSqsPublishMsg } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const { trackingModes, assetStatusValue, assetStatus, cloudAlertEventNames } = require('../utils/constants');
const testPg = require('./common/testPg');
const pg = require('../utils/lib/pg');
// const { channels } = require('../utils/helpers/NotificationHelper');
const { verifyDbRow } = require('./common/dbVerify');
const { AwsConfig } = require("../utils/lib/aws");


describe("tcUpdates", () => {

  const [rowbox] = site.rowBoxes;
  const ncID = site.network_controller_id;
  const notificationPayload = {
    notificationType: 'mobile_qc' ,
    snapAddr: rowbox.snap_addr,
    eventTitle: `Mobile Fasttrak CONNECT`
  };

  beforeEach(async () => {
    await testBase.init();
    await testPg.updateAsset(rowbox.asset_id, {last_status_bits: 0});
    await testPg.delCloudAlert(rowbox.asset_id);
    await testPg.deleteAssetHistoryBySnapAddr(rowbox.snap_addr);
  });

  describe("Remote QC Fail on Fault Status Bits", () => {
    const testCases = [{
      name: "'Remote QC' when lastStatusBit is set to 1, i.e. NC_OFFLINE",
      removeFasttrak: true,
      assetStatus: assetStatusValue.REMOTE_QC,
      assetStatusStr: assetStatus.REMOTE_QC,
      commandedState: trackingModes.REMOTE_QC,
      trackingStatus: 12,
      statusBits: 0,
      lastStatusBits: 1,
      hasChargerFault: false
    }, {
      name: "'Remote QC' when lastStatusBit is set to 1, i.e. OVER_CURRENT",
      removeFasttrak: true,
      assetStatus: assetStatusValue.REMOTE_QC,
      assetStatusStr: assetStatus.REMOTE_QC,
      commandedState: trackingModes.REMOTE_QC,
      trackingStatus: 12,
      statusBits: 0,
      lastStatusBits: 2,
      hasChargerFault: false
    }, {
      name: "'Remote QC' when lastStatusBit is set to 1, i.e. CHARGER_FAULT",
      removeFasttrak: true,
      assetStatus: assetStatusValue.REMOTE_QC,
      assetStatusStr: assetStatus.REMOTE_QC,
      commandedState: trackingModes.REMOTE_QC,
      trackingStatus: 12,
      statusBits: 0,
      lastStatusBits: 8,
      hasChargerFault: true
    }];

    for (const testcase of testCases) {

      it(testcase.name, async () => {

        await testPg.updateAsset(rowbox.asset_id, {
          reporting: assetStatus.ONLINE,
          // setting status_bits as lastStatusBits, because in tcUpdateService, db query will assign status_bit value to last_status_bit
          ...(testcase.lastStatusBits ? { status_bits: testcase.lastStatusBits } : {})
        });
        if (testcase.commandedState) {
          await testPg.updateNetworkController(ncID, {commanded_state: testcase.commandedState});
        }

        await testPg.delFasttrak(rowbox.snap_addr);

        const date = new Date();
        const when = {
          seconds: Math.floor(date.getTime() / 1000),
          nanos: 0,
        };

        const tcUpdate = {
          tcSnapAddr: rowbox.snap_addr_b64,
          when,
          statusBits: testcase.statusBits,
          assetStatus: testcase.assetStatus,
          lastReported: when
        }

        const snsPayloadConnectionHist = {
          type: 'elastic_search-1',
          channel: 'asset_connection_hist',
          snap_addr: rowbox.snap_addr,
          asset_id: rowbox.asset_id,
          nc_snap_addr: site.nc_snap_addr,
          site_id: site.site_id,
          connected_state: testcase.assetStatusStr,
          last_asset_updated: new Date(when.seconds * 1000),
          timestamp: new Date(when.seconds * 1000),
        }

        const snsPayloadStatusBits = {
          type: 'elastic_search-1',
          channel: 'asset_status_bits_update',
          snap_addr: rowbox.snap_addr,
          asset_id: rowbox.asset_id,
          nc_snap_addr: site.nc_snap_addr,
          site_id: site.site_id,
          status_bits: testcase.statusBits,
          timestamp: new Date(when.seconds * 1000),
        }

        const scopeSnsConnectionHist = mockSns(snsPayloadConnectionHist);
        const scopeSnsStatusBits = mockSns(snsPayloadStatusBits);

        const result = await testBase.invokeLambda({ tcUpdates: [tcUpdate] });

        expect(result).to.equal(true);

        scopeSnsConnectionHist.done();
        testcase.assetStatus != assetStatusValue.UNKNOWN && scopeSnsStatusBits.done()

        await verifyDbRow(() => pg.getAssetBySnapAddr(rowbox.snap_addr), {
          reporting: testcase.assetStatusStr,
        })


        await verifyDbRow(() => testPg.getAssetHistoryBySnapAddr(rowbox.snap_addr), {
          data: {
            "asset.connected": (testcase.assetStatus != assetStatusValue.OFFLINE),
            "asset.connected_state": testcase.assetStatusStr,
            "asset.last_connected": moment(when.seconds * 1000).format(),
            "asset.last_reported": moment(when.seconds * 1000).format(),
            "asset.status": testcase.assetStatus,
            "asset.status_bits": testcase.statusBits
          }
        });

        const fasttrakResp = await testPg.getFasttrak(rowbox.snap_addr);
        expect(fasttrakResp.rows.length).to.equal(testcase.hasChargerFault ? 1 : 0);
      });
    }
  });




  describe("QC / Fasttrak Started", () => {
    const testCases = [{
      name: "'Remote QC' When Fasttrak Row Doesn't Exists and Site Mode is Remote QC",
      removeFasttrak: true,
      assetStatus: assetStatusValue.REMOTE_QC,
      assetStatusStr: assetStatus.REMOTE_QC,
      commandedState: trackingModes.REMOTE_QC,
      trackingStatus: 12,
      statusBits: 0,
      lastStatusBits: 0
    }, {
      name: "'Remote QC' When Fasttrak Row Doesn't Exists",
      removeFasttrak: true,
      assetStatus: assetStatusValue.REMOTE_QC,
      assetStatusStr: assetStatus.REMOTE_QC,
      trackingStatus: 12,
      statusBits: 0
    }, {
      name: "'Remote QC' When Fasttrak Row Exists",
      removeFasttrak: false,
      assetStatus: assetStatusValue.REMOTE_QC,
      assetStatusStr: assetStatus.REMOTE_QC,
      trackingStatus: 12,
      statusBits: 0
    }, {
      name: "'Red Fasttrak' When Fasttrak Row Doesn't Exists",
      removeFasttrak: true,
      lastAssetStatus: assetStatus.ONLINE,
      assetStatus: assetStatusValue.FASTTRAK_RED,
      assetStatusStr: assetStatus.QC_FASTTRAK,
      trackingStatus: 10,
      statusBits: 0
    }, {
      name: "'Red Fasttrak' When Fasttrak Row Exists",
      removeFasttrak: false,
      assetStatus: assetStatusValue.FASTTRAK_RED,
      assetStatusStr: assetStatus.QC_FASTTRAK,
      trackingStatus: 10,
      statusBits: 0
    }, {
      name: "'Blue Fasttrak' When Fasttrak Row Doesn't Exists",
      removeFasttrak: true,
      assetStatus: assetStatusValue.FASTTRAK_BLUE,
      assetStatusStr: assetStatus.FASTTRAK,
      trackingStatus: 8,
      statusBits: 0
    }, {
      name: "'Blue Fasttrak' When Fasttrak Row Exists",
      removeFasttrak: false,
      assetStatus: assetStatusValue.FASTTRAK_BLUE,
      assetStatusStr: assetStatus.FASTTRAK,
      trackingStatus: 8,
      statusBits: 0
    }, {
      name: "When asset is in UNKNOWN state",
      removeFasttrak: false,
      assetStatus: assetStatusValue.UNKNOWN,
      assetStatusStr: assetStatus.UNKNOWN,
      trackingStatus: 8,
      statusBits: 0
    }];

    for (const testcase of testCases) {

      it(testcase.name, async () => {

        await testPg.updateAsset(rowbox.asset_id, {
          reporting: assetStatus.ONLINE,
          ...(testcase.lastStatusBits ? { status_bits: testcase.lastStatusBits } : {})  // setting status_bits as lastStatusBits, because in tcUpdateService, db query will assign status_bit value to last_status_bit
        });
        if (testcase.commandedState) {
          await testPg.updateNetworkController(ncID, {commanded_state: testcase.commandedState});
        }

        if (testcase.removeFasttrak) {
          await testPg.delFasttrak(rowbox.snap_addr);
        } else {
          await testPg.updateFasttrak(rowbox.asset_id, {
            tracking_status: null,
            last_updated: null,
            start_time: null,
            start_time_qc: null,
            end_time: null,
            end_time_qc: null,
            plus60_complete: null,
            minus60_complete: null,
            current_state: null,
            max_peak_motor_inrush_current: null,
            max_peak_motor_current: null,
            max_average_motor_current: null,
            label: null,
            user_name: null,
            user_email: null,
            charged: null,
            min_temperature: null,
            max_wind_gust: null,
            max_average_wind: null,
            battery_start: null,
            battery_stop: null
          });
        }

        const date = new Date();
        const when = {
          seconds: Math.floor(date.getTime() / 1000),
          nanos: 0,
        };

        const tcUpdate = {
          tcSnapAddr: rowbox.snap_addr_b64,
          when,
          statusBits: testcase.statusBits,
          assetStatus: testcase.assetStatus,
          lastReported: when
        }

        const snsPayloadConnectionHist = {
          type: 'elastic_search-1',
          channel: 'asset_connection_hist',
          snap_addr: rowbox.snap_addr,
          asset_id: rowbox.asset_id,
          nc_snap_addr: site.nc_snap_addr,
          site_id: site.site_id,
          connected_state: testcase.assetStatusStr,
          last_asset_updated: new Date(when.seconds * 1000),
          timestamp: new Date(when.seconds * 1000),
        }

        const snsPayloadStatusBits = {
          type: 'elastic_search-1',
          channel: 'asset_status_bits_update',
          snap_addr: rowbox.snap_addr,
          asset_id: rowbox.asset_id,
          nc_snap_addr: site.nc_snap_addr,
          site_id: site.site_id,
          status_bits: testcase.statusBits,
          timestamp: new Date(when.seconds * 1000),
        }

        const scopeSnsConnectionHist = mockSns(snsPayloadConnectionHist);
        const scopeSnsStatusBits = mockSns(snsPayloadStatusBits);

        const result = await testBase.invokeLambda({ tcUpdates: [tcUpdate] });

        expect(result).to.equal(true);

        scopeSnsConnectionHist.done();
        testcase.assetStatus != assetStatusValue.UNKNOWN && scopeSnsStatusBits.done()

        await verifyDbRow(() => pg.getAssetBySnapAddr(rowbox.snap_addr), {
          reporting: testcase.assetStatusStr,
        })


        if (testcase.assetStatus == assetStatusValue.UNKNOWN) {
          await verifyDbRow(() => testPg.getAssetHistoryBySnapAddr(rowbox.snap_addr), {
            data: {
              "asset.connected_state": testcase.assetStatusStr,
              "asset.status_bits": testcase.statusBits,
              "asset.last_disconnected": moment(when.seconds * 1000).format()
            }
          });
          return;
        } else {
          await verifyDbRow(() => testPg.getAssetHistoryBySnapAddr(rowbox.snap_addr), {
            data: {
              "asset.connected": (testcase.assetStatus != assetStatusValue.OFFLINE),
              "asset.connected_state": testcase.assetStatusStr,
              "asset.last_connected": moment(when.seconds * 1000).format(),
              "asset.last_reported": moment(when.seconds * 1000).format(),
              "asset.status": testcase.assetStatus,
              "asset.status_bits": testcase.statusBits
            }
          });
        }



        await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
          tracking_status: testcase.trackingStatus,
          current_state: null,
          start_time: new Date(when.seconds * 1000),
          end_time: null,
          plus60_complete: null,
          minus60_complete: null,
          max_peak_motor_inrush_current: 0.0,
          max_peak_motor_current: 0.0,
          max_average_motor_current: 0.0,
        })
      });
    }
  });

  describe("QC / Fasttrak Stopped", () => {
    const testCases = [{
      name: "Remote QC",
      assetStatus: assetStatusValue.REMOTE_QC,
      assetStatusStr: assetStatus.REMOTE_QC,
      trackingStatus: 12,
      statusBits: 0
    }, {
      name: "Red Fasttrak",
      lastAssetStatus: assetStatus.ONLINE,
      assetStatus: assetStatusValue.FASTTRAK_RED,
      assetStatusStr: assetStatus.QC_FASTTRAK,
      trackingStatus: 10,
      statusBits: 0
    }, {
      name: "Blue Fasttrak",
      assetStatus: assetStatusValue.FASTTRAK_BLUE,
      assetStatusStr: assetStatus.FASTTRAK,
      trackingStatus: 8,
      statusBits: 0
    }];

    for (const testcase of testCases) {

      it(testcase.name, async () => {

        const date = new Date();
        const when = {
          seconds: Math.floor(date.getTime() / 1000),
          nanos: 0,
        };

        await testPg.updateAsset(rowbox.asset_id, {
          reporting: testcase.assetStatusStr
        });

        await testPg.updateFasttrak(rowbox.snap_addr, {
          tracking_status: testcase.trackingStatus,
          last_updated: new Date((when.seconds - 1500) * 1000),
          start_time: new Date((when.seconds - 1500) * 1000),
          end_time: null,
          plus60_complete: true,
          minus60_complete: true,
          current_state: (testcase.assetStatus === assetStatusValue.REMOTE_QC) ? "DONE" : null,
          max_peak_motor_inrush_current: 8.5,
          max_peak_motor_current: 6.5,
          max_average_motor_current: 4.0,
        });

        const tcUpdate = {
          tcSnapAddr: rowbox.snap_addr_b64,
          when,
          statusBits: testcase.statusBits,
          assetStatus: testcase.assetStatus,
          lastReported: when
        }

        const snsPayloadConnectionHist = {
          type: 'elastic_search-1',
          channel: 'asset_connection_hist',
          snap_addr: rowbox.snap_addr,
          asset_id: rowbox.asset_id,
          nc_snap_addr: site.nc_snap_addr,
          site_id: site.site_id,
          connected_state: testcase.assetStatusStr,
          last_asset_updated: new Date(when.seconds * 1000),
          timestamp: new Date(when.seconds * 1000),
        }

        const snsPayloadStatusBits = {
          type: 'elastic_search-1',
          channel: 'asset_status_bits_update',
          snap_addr: rowbox.snap_addr,
          asset_id: rowbox.asset_id,
          nc_snap_addr: site.nc_snap_addr,
          site_id: site.site_id,
          status_bits: testcase.statusBits,
          timestamp: new Date(when.seconds * 1000),
        }

        const scopeSnsConnectionHist = mockSns(snsPayloadConnectionHist);
        const scopeSnsStatusBits = mockSns(snsPayloadStatusBits);

        const result = await testBase.invokeLambda({ tcUpdates: [tcUpdate] });

        expect(result).to.equal(true);

        scopeSnsConnectionHist.done();
        scopeSnsStatusBits.done()

        await verifyDbRow(() => pg.getAssetBySnapAddr(rowbox.snap_addr), {
          reporting: testcase.assetStatusStr,
        })

        await verifyDbRow(() => testPg.getAssetHistoryBySnapAddr(rowbox.snap_addr), {
          data: {
            "asset.connected": (testcase.assetStatus != assetStatusValue.OFFLINE),
            "asset.connected_state": testcase.assetStatusStr,
            "asset.last_connected": moment(when.seconds * 1000).format(),
            "asset.last_reported": moment(when.seconds * 1000).format(),
            "asset.status": testcase.assetStatus,
            "asset.status_bits": testcase.statusBits
          }
        });

        const fasttrack = await testPg.getFasttrak(rowbox.snap_addr);
        console.log("Actual vs expected", fasttrack.rows[0], {
          tracking_status: testcase.trackingStatus,
          current_state: (testcase.assetStatus === assetStatusValue.REMOTE_QC) ? "DONE" : null,
          start_time: new Date((when.seconds - 1500) * 1000),
          end_time: new Date(when.seconds * 1000),
          plus60_complete: true,
          minus60_complete: true,
          max_peak_motor_inrush_current: 8.5,
          max_peak_motor_current: 6.5,
          max_average_motor_current: 4.0,
        });
        await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
          tracking_status: testcase.trackingStatus,
          current_state: (testcase.assetStatus === assetStatusValue.REMOTE_QC) ? "DONE" : null,
          start_time: new Date((when.seconds - 1500) * 1000),
          end_time: null,
          plus60_complete: true,
          minus60_complete: true,
          max_peak_motor_inrush_current: 8.5,
          max_peak_motor_current: 6.5,
          max_average_motor_current: 4.0,
        })
      });
    }
  });

  describe("Handle asset history on Unknown status", () => {
    const testCases = [{
      name: "Unknown Case",
      assetStatus: assetStatusValue.UNKNOWN,
      assetStatusStr: assetStatus.UNKNOWN,
      trackingStatus: 0,
      statusBits: 0
    }];

    for (const testcase of testCases) {

      it(testcase.name, async () => {

        const date = new Date();
        const when = {
          seconds: Math.floor(date.getTime() / 1000),
          nanos: 0,
        };

        await testPg.updateAsset(rowbox.asset_id, {
          reporting: testcase.assetStatusStr
        });


        const tcUpdate = {
          tcSnapAddr: rowbox.snap_addr_b64,
          when,
          statusBits: testcase.statusBits,
          assetStatus: assetStatusValue.UNKNOWN,
          lastReported: when
        }

        const snsPayloadConnectionHist = {
          type: 'elastic_search-1',
          channel: 'asset_connection_hist',
          snap_addr: rowbox.snap_addr,
          asset_id: rowbox.asset_id,
          nc_snap_addr: site.nc_snap_addr,
          site_id: site.site_id,
          connected_state: assetStatus.ONLINE,
          status_bits: testcase.statusBits,
          last_connected: new Date(when.seconds * 1000),
          last_cloud_update: null,
          last_asset_update: new Date(when.seconds * 1000),
          last_asset_updated: new Date(when.seconds * 1000),
          timestamp: new Date(when.seconds * 1000),
        }

        const scopeSnsConnectionHist = mockSns(snsPayloadConnectionHist);

        const result = await testBase.invokeLambda({ tcUpdates: [tcUpdate] });

        expect(result).to.equal(true);

        expect(scopeSnsConnectionHist.isDone()).to.equal(false);

        await verifyDbRow(() => pg.getAssetBySnapAddr(rowbox.snap_addr), {
          reporting: assetStatus.UNKNOWN,
          last_reporting_status: assetStatus.UNKNOWN
        });

      });
    }
  });
  describe("Mobile qc sync issue", () => {
    const testCases = [{
      name: "MQC Connected",
      assetStatus: assetStatusValue.MOBILE_QC,
      assetStatusStr: assetStatus.MOBILE_QC,
      last_reporting_status: assetStatus.ONLINE,
      statusBits: 1048576,
      mobileQCConnected : true
     },
     {
       name: "MQC Dissconnected",
       assetStatus: assetStatusValue.ONLINE,
       assetStatusStr: assetStatus.ONLINE,
       last_reporting_status: assetStatus.MOBILE_QC,
       statusBits: 0,
       mobileQCConnected : false
     }];

    for (const testcase of testCases) {

      it(testcase.name, async () => {

        await testPg.updateAsset(rowbox.asset_id, {
          reporting: testcase.assetStatusStr,
          last_reporting_status: testcase.last_reporting_status,
          status_bits: testcase.statusBits
        });

        const date = new Date();
        const when = {
          seconds: Math.floor(date.getTime() / 1000),
          nanos: 0,
        };

        const tcUpdate = {
          tcSnapAddr: rowbox.snap_addr_b64,
          when,
          statusBits: testcase.statusBits,
          assetStatus: testcase.assetStatus,
          lastReported: when
        }


        const scopeQueueURL = mockSqsGetQueueUrl(AwsConfig.notificationQueueName);
        const scopeSendMessage = mockSqsPublishMsg(notificationPayload, AwsConfig.notificationQueueName);
        const result = await testBase.invokeLambda({ tcUpdates: [tcUpdate] });

        expect(result).to.equal(true);
        scopeQueueURL.isDone()
        scopeSendMessage.isDone()

        if(testcase.mobileQCConnected){
          const response=  await pg.checkCloudAlertExist(rowbox.asset_id ,[cloudAlertEventNames.MOBILE_FASTTRAK]);
          expect(response?.rows.length).to.be.greaterThan(0);
       } else {
        const response=  await pg.checkCloudAlertExist(rowbox.asset_id ,[cloudAlertEventNames.MOBILE_FASTTRAK]);
          expect(response?.rows.length).to.be.equal(0);
       }

      });
    }
  });

  describe("Row Lock Status", () => {
    const testCases = [
      { name: "Row is locked", statusBits: 8388608, shouldBeLocked: true },
      { name: "Row is unlocked", statusBits: 0, shouldBeLocked: false },
    ];

    for (const testcase of testCases) {
      it(testcase.name, async () => {
        const date = new Date();
        const when = { seconds: Math.floor(date.getTime() / 1000), nanos: 0 };

        const tcUpdate = {
          tcSnapAddr: rowbox.snap_addr_b64,
          when,
          statusBits: testcase.statusBits,
          lastReported: when,
        };

        const scopeQueueURL = mockSqsGetQueueUrl(AwsConfig.notificationQueueName);
        const scopeSendMessage = mockSqsPublishMsg(notificationPayload, AwsConfig.notificationQueueName);
        const result = await testBase.invokeLambda({ tcUpdates: [tcUpdate] });

        expect(result).to.equal(true);
        scopeQueueURL.isDone();
        scopeSendMessage.isDone();

        const res = await pg.getAssetBySnapAddr(rowbox.snap_addr);
        const asset = res.rows[0];
        expect(asset.status_bits).to.equal(testcase.statusBits);
        expect(asset.is_row_locked).to.equal(testcase.shouldBeLocked);
      });
    }
  });
});
