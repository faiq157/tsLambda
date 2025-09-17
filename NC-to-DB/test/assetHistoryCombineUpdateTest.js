process.env.NODE_ENV = "test";

const moment = require("moment");
const chai = require("chai");
const { expect } = chai;
const {snappyHex} = require("../util");
const {trackingModes, trackingStatus, panelCommandState, assetStatusValue} = require("../utils/constants")
const {getSnapAddrB64, site} = require("./common/testData");
const testBase = require("./common/testBase");
const testPg = require("./common/testPg");
const sinon = require("sinon");
const processService = require("../processServices");

describe("asset combine Updates", () => {
  const rowBox = site.rowBoxes[0];
  let sandbox;
  beforeEach(async () => {
    await testBase.init();
    await testPg.updateProjectById(site.project_id, {timezone: 'Asia/Karachi'});
    await testPg.deleteAssetHistoryBySnapAddr(rowBox.snap_addr);
    await testPg.deleteAssetLastUpdateBySnapAddr(rowBox.snap_addr);
    sandbox = sinon.stub(processService, 'handler').callsFake(() => true);
  });

  afterEach(function () {
    sandbox.restore();
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };
  const when1 = {
    seconds: Math.floor((date.getTime() - 2000) / 1000),
    nanos: 0,
  };
  const when2 = {
    seconds: Math.floor((date.getTime() - 3000) / 1000),
    nanos: 0,
  };
  const when3 = {
    seconds: Math.floor((date.getTime() - 4000) / 1000),
    nanos: 0,
  };


  it ("when there is a combined cloud update and all the events are at same timestamp", async () => {
    const cloudUpdate = {
      batteryUpdates: [{
        when,
        "voltage": 13.300000190734863,
        "current": 0,
        "charged": 80,
        "health": 100,
        "battTemp": 50.099998474121094,
        "heaterTemp": 51.400001525878906,
        "miscStatusBits": 0,
        "tcSnapAddr": rowBox.snap_addr_b64      // This snap address is from project with timezone "Asia/Karachi" i.e. GMT+5
      }],
      motorCurrentUpdate: {
        "snapAddr": rowBox.snap_addr_b64,
        when,
        "peakMotorInrushCurrent": 2.9100000858306885,
        "peakMotorCurrent": 0.009999999776482582,
        "averageMotorCurrent": 1.2300000190734863,
        "endingMotorCurrent": 1.1100000143051147,
        "currentAngle": -6.900000095367432,
        "trackingStatus": 3
      },
      panelUpdate: [{
        "tcSnapAddr": rowBox.snap_addr_b64,
        "solarVoltage": 21.899999618530273,
        "solarCurrent": 0.07999999821186066,
        when,
        "externalInput2Voltage": 0,
        "externalInput2Current": 0
      }],
      rackAngles: [{
        tcSnapAddr: rowBox.snap_addr_b64,
        angles: [{
          currentAngle: -59.900001525878906,
          requestedAngle: -60,
          commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
          commandedStateDetail: 0,
          trackingStatus: trackingStatus.QC_FASTTRAK,
          when,
          panelIndex: 16,
          panelCommandState: panelCommandState.MOVE_TO_ABS,
          motorCurrent: 1.7999999523162842
        }]
      }],
      assetUpdates: [{
        snapAddr: rowBox.snap_addr_b64,
        when,
        unitTemperature: 80,
        upTime: 100
      }],
      tcUpdates: [{
        tcSnapAddr: rowBox.snap_addr_b64,
        when,
        statusBits: 0,
        assetStatus: assetStatusValue.FASTTRAK_BLUE,
        lastReported: when
      }],
      assetRestarted: {
        snapAddr:"1d1f22",
        when,
        upTime:42
      },
      snowSheddingUpdate: {
        when,
        snapAddr: rowBox.snap_addr_b64, // This should be a weather station, but for testcase, we are just using rowBox Snap addr
        timestamp: when,
        depth: 0.6000000238418579,
        baseline: 0.5,
        snowOnGroundNow: 0.5,
        estimate: 0.10000000149011612,
        trigger: 0.5,
        threshold: 0.10000000149011612,
        active: true,
        state: 2
      },
      trackingChanges: [{
        updatedState: trackingModes.SNOW_SHEDDING,
        stateChangedAt: when,
        commandedPreset: 0,
        userName: 'test',
        userEmail: 'test@test.com',
        source: 'CLOUD'
      }],
      assetRadioUpdates: [{
        when,
        "radioMacAddr": "001c2c2ad613b566",
        "radioChannel": "5",
        "radioNetworkId": "-16657",
        "radioFirmware": "1",
        "radioScriptVersion": "30",
        "radioScriptCrc": "18687",
        "radioLinkQuality": "48",
        "radioMeshDepth": "2",
        "radioPollsSent": "16",
        "radioPollResponses": "15",
        "isARepeater": false
      }],
      chargerUpdates: [{
        "snapAddr": rowBox.snap_addr_b64,
        when,
        "voltage": 10,
        "current": 10
      }]
    };
    const expectedResp = {
      "asset.connected": true,
      "asset.connected_state": "FASTTRAK",
      "asset.connected_status": "Asset Restarted",
      "asset.last_connected": moment(when.seconds * 1000).format(),
      "asset.last_reported": moment(when.seconds * 1000).format(),
      // "asset.last_status": null,
      "asset.panel_commanded_state": 3,
      "asset.panel_index": 16,
      "asset.status": 5,
      "asset.status_bits": 0,
      "asset.temp": 80,
      "asset.tracking_status": 10,
      "asset.uptime": 42,
      "battery.current": 0,
      "battery.heater_temp": 51.400001525878906,
      "battery.poc": 80,
      "battery.poh": 100,
      "battery.status_bits": 0,
      "battery.temp": 50.099998474121094,
      "battery.voltage": 13.300000190734863,
      "battery.wakeup_poc": 80,
      "battery.wakeup_poc_at": moment(when.seconds * 1000).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      "charger.voltage": 10,
      "charger.current": 10,
      "motor.avg_current": 1.2300000190734863,
      "motor.ending_current": 1.1100000143051147,
      "motor.current": 1.7999999523162842,
      "motor.peak_current": 0.009999999776482582,
      "motor.peak_inrush_current": 2.9100000858306885,
      "panel.current": 0.07999999821186066,
      "panel.voltage": 21.899999618530273,
      "panel2.current": 0,
      "panel2.voltage": 0,
      "rack.current_angle": -59.900001525878906,
      "rack.requested_angle": -60,
      "radio.polls_sent": "16",
      "radio.polls_recv": "15",
      "radio.firmware_rev": "1",
      "radio.script_rev": "30",
      "radio.mesh_depth": "2",
      "radio.link_quality": "48",
      "radio.channel": "5",
      "radio.network_id": snappyHex("-16657"),
      "radio.is_a_repeater": false,
      "radio.script_crc": snappyHex("18687"),
      "snow_shedding.asset_snap_addr": rowBox.snap_addr,
      "snow_shedding.depth": 0.6000000238418579 / 0.0254,
      "snow_shedding.baseline": 0.5 / 0.0254,
      "snow_shedding.snow_on_ground_now": 0.5 / 0.0254,
      "snow_shedding.estimate": 0.10000000149011612 / 0.0254,
      "snow_shedding.trigger": 0.5 / 0.0254,
      "snow_shedding.threshold": 0.10000000149011612 / 0.0254,
      "snow_shedding.active": true,
      "snow_shedding.last_snow_shedding": when.seconds,
      "snow_shedding.state": 2,
      "tracking.mode": trackingModes.SNOW_SHEDDING,
      "tracking.mode_detail": 0,
      "tracking.user_name": 'test',
      "tracking.user_email": 'test@test.com',
      "tracking.source": 'CLOUD'
    };

    const result = await testBase.invokeLambda(cloudUpdate);
    expect(result).to.equal(true);

    const r = await testPg.getAssetLastUpdate(rowBox.snap_addr);
    const assetLastUpdate = r.rows[0];
    expect(moment(assetLastUpdate.last_asset_update).format()).to.equal(moment(when.seconds * 1000).format());

    const {rows} = await testPg.getAllAssetHistoryBySnapAddr(rowBox.snap_addr);
    expect(rows.length).to.equal(1);
    const assetHist = rows[0];
    expect(assetHist.snap_addr).to.equal(rowBox.snap_addr);
    expect(parseInt(assetHist.timestamp)).to.equal(when.seconds);
    expect(assetHist.data).to.deep.include(expectedResp);
    expect(Object.keys(assetHist.data).length).to.equal(Object.keys(expectedResp).length);
  });



  it ("when there is a combined cloud update and the events are at different timestamp", async () => {
    const cloudUpdate = {
      batteryUpdates: [{
        when,
        "voltage": 13.300000190734863,
        "current": 0,
        "charged": 80,
        "health": 100,
        "battTemp": 50.099998474121094,
        "heaterTemp": 51.400001525878906,
        "miscStatusBits": 0,
        "tcSnapAddr": getSnapAddrB64(rowBox.snap_addr)      // This snap address is from project with timezone "Asia/Karachi" i.e. GMT+5
      }],
      motorCurrentUpdate: {
        "snapAddr": rowBox.snap_addr_b64,
        when: when1,
        "peakMotorInrushCurrent": 2.9100000858306885,
        "peakMotorCurrent": 0.009999999776482582,
        "averageMotorCurrent": 1.2300000190734863,
        "endingMotorCurrent": 1.1100000143051147,
        "currentAngle": -6.900000095367432,
        "trackingStatus": 3
      },
      panelUpdate: [{
        "tcSnapAddr": rowBox.snap_addr_b64,
        "solarVoltage": 21.899999618530273,
        "solarCurrent": 0.07999999821186066,
        when: when1,
        "externalInput2Voltage": 0,
        "externalInput2Current": 0
      }],
      rackAngles: [{
        tcSnapAddr: rowBox.snap_addr_b64,
        angles: [{
          currentAngle: -59.900001525878906,
          requestedAngle: -60,
          commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
          commandedStateDetail: 0,
          trackingStatus: trackingStatus.QC_FASTTRAK,
          when: when2,
          panelIndex: 16,
          panelCommandState: panelCommandState.MOVE_TO_ABS,
          motorCurrent: 1.7999999523162842
        }, {
          currentAngle: -59.900001525878906,
          requestedAngle: -60,
          commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
          commandedStateDetail: 0,
          trackingStatus: trackingStatus.QC_FASTTRAK,
          when: when3,
          panelIndex: 16,
          panelCommandState: panelCommandState.MOVE_TO_ABS,
          motorCurrent: 1.7999999523162842
        }]
      }],
      assetUpdates: [{
        snapAddr: rowBox.snap_addr_b64,
        when: when2,
        unitTemperature: 80,
        upTime: 100
      }],
      tcUpdates: [{
        tcSnapAddr: rowBox.snap_addr_b64,
        when,
        statusBits: 0,
        assetStatus: assetStatusValue.FASTTRAK_BLUE,
        lastReported: when
      }],
      assetRestarted: {
        snapAddr:"1d1f22",
        when: when1,
        upTime:42
      }
    };
    const expectedObj1 = {
      snap_addr: rowBox.snap_addr,
      timestamp: when.seconds.toString(),
      data: {
        'asset.connected': true,
        'asset.connected_state': 'FASTTRAK',
        'asset.last_connected': moment(when.seconds * 1000).format(),
        // 'asset.last_status': null,
        'asset.status_bits': 0,
        'battery.poc': 80,
        'battery.poh': 100,
        'asset.status': 5,
        'battery.temp': 50.099998474121094,
        'battery.current': 0,
        'battery.voltage': 13.300000190734863,
        'battery.wakeup_poc': 80,
        'asset.last_reported': moment(when.seconds * 1000).format(),
        'battery.heater_temp': 51.400001525878906,
        'battery.status_bits': 0,
        'battery.wakeup_poc_at': moment(when.seconds * 1000).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      }
    };
    const expectedObj2 = {
      snap_addr: rowBox.snap_addr,
      timestamp: when1.seconds.toString(),
      data: {
        'asset.uptime': 42,
        'asset.connected_status': 'Asset Restarted',
        'panel.current': 0.07999999821186066,
        'panel.voltage': 21.899999618530273,
        'panel2.current': 0,
        'panel2.voltage': 0,
        'motor.avg_current': 1.2300000190734863,
        'motor.peak_current': 0.009999999776482582,
        'motor.ending_current': 1.1100000143051147,
        'motor.peak_inrush_current': 2.9100000858306885
      }
    };
    const expectedObj3 = {
      snap_addr: rowBox.snap_addr,
      timestamp: when2.seconds.toString(),
      data: {
        'asset.temp': 80,
        'asset.uptime': 100,
        'asset.panel_commanded_state': 3,
        'asset.panel_index': 16,
        'asset.tracking_status': 10,
        'motor.current': 1.7999999523162842,
        'tracking.mode': 4,
        'rack.current_angle': -59.900001525878906,
        'rack.requested_angle': -60,
        'tracking.mode_detail': 0
      }
    };
    const expectedObj4 = {
      snap_addr: rowBox.snap_addr,
      timestamp: when3.seconds.toString(),
      data: {
        "asset.panel_commanded_state": 3,
        "asset.panel_index": 16,
        "asset.tracking_status": 10,
        'motor.current': 1.7999999523162842,
        'tracking.mode': 4,
        'rack.current_angle': -59.900001525878906,
        'rack.requested_angle': -60,
        'tracking.mode_detail': 0
      }
    };
    const result = await testBase.invokeLambda(cloudUpdate);
    expect(result).to.equal(true);

    const r = await testPg.getAssetLastUpdate(rowBox.snap_addr);
    const assetLastUpdate = r.rows[0];
    expect(moment(assetLastUpdate.last_asset_update).format()).to.equal(moment(when.seconds * 1000).format());

    const {rows} = await testPg.getAllAssetHistoryBySnapAddr(rowBox.snap_addr);
    expect(rows.length).to.equal(4);
    const r1 = rows[0];
    const r2 = rows[1];
    const r3 = rows[2];
    const r4 = rows[3];
    expect(r1).to.deep.include(expectedObj1);
    expect(Object.keys(r1.data).length).to.equal(Object.keys(expectedObj1.data).length);
    expect(r2).to.deep.include(expectedObj2);
    expect(Object.keys(r2.data).length).to.equal(Object.keys(expectedObj2.data).length);
    expect(r3).to.deep.include(expectedObj3);
    expect(Object.keys(r3.data).length).to.equal(Object.keys(expectedObj3.data).length);
    expect(r4).to.deep.include(expectedObj4);
    expect(Object.keys(r4.data).length).to.equal(Object.keys(expectedObj4.data).length);
  });
});
