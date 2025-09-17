const testBase = require("./common/testBase");
const testPg = require('./common/testPg');
const { site } = require('./common/testData');
const { mockSns, mockMqtt } = require('./common/mock');
const { channels } = require('../utils/helpers/NotificationHelper');
const { verifyNetworkController, verifyTrackingModeHistory, verifyTrackingModeAssetHisotry } = require('./common/dbVerify');
const { trackingModes, hasModeDetail, manualModeDetail, wheatherStowDetail } = require('../utils/constants');
const chai = require('chai');
const { expect } = chai;

// // const sinon = require('sinon');
// // const nock = require('nock');
// // nock.recorder.rec();

describe("TrackingModeUpdates", function () {

  // Sample Message in Json
  // {
  //   "ncSnapAddr": "19b155",
  //   "trackingChangesList": [
  //     {
  //       "updatedState": 4,
  //       "stateChangedAt": "2022-02-09T01:58:05.300Z",
  //       "commandedPreset": 0
  //     }
  //   ]
  // }

  beforeEach(async () => {
    await testBase.init();
    await testPg.removeAssetHistoryBySnapAddr(site.nc_snap_addr);
    await testPg.removetrackingCommandHist(site.network_controller_id);
  });

  const trackingModeTestCases = [{
    name: 'TRACKING when db time is not null',
    trackingMode: trackingModes.TRACKING,
    detail: 0,
    dbTime: new Date(Date.now() - 60 * 1000),
    outOfOrder: false
  }, {
    name: 'TRACKING when db time is null',
    trackingMode: trackingModes.TRACKING,
    detail: 0,
    dbTime: null,
    outOfOrder: false
  }, {
    name: 'TRACKING when out of order processing',
    trackingMode: trackingModes.TRACKING,
    detail: 0,
    dbTime: new Date(Date.now() + 600 * 1000),
    outOfOrder: true
  }, {
    name: 'WEATHER_STOW when db time is not null',
    trackingMode: trackingModes.WEATHER_STOW,
    detail: wheatherStowDetail.HIGH_WIND_GUST,
    dbTime: new Date(Date.now() - 60 * 1000),
    outOfOrder: false
  }, {
    name: 'WEATHER_STOW when db time is null',
    trackingMode: trackingModes.WEATHER_STOW,
    detail: wheatherStowDetail.HIGH_WIND_GUST,
    dbTime: null,
    outOfOrder: false
  }, {
    name: 'WEATHER_STOW when out of order processing',
    trackingMode: trackingModes.WEATHER_STOW,
    detail: wheatherStowDetail.HIGH_WIND_GUST,
    dbTime: new Date(Date.now() + 600 * 1000),
    outOfOrder: true
  }, {
    name: 'REMOTE QC when db time is not null',
    trackingMode: trackingModes.REMOTE_QC,
    detail: 0,
    dbTime: new Date(Date.now() - 60 * 1000),
    outOfOrder: false
  }, {
    name: 'REMOTE QC when db time is null',
    trackingMode: trackingModes.REMOTE_QC,
    detail: 0,
    dbTime: null,
    outOfOrder: false
  }, {
    name: 'REMOTE QC when out of order processing',
    trackingMode: trackingModes.REMOTE_QC,
    detail: 0,
    dbTime: new Date(Date.now() + 600 * 1000),
    outOfOrder: true
  }, {
    name: 'FLAT MAINTENANCE when db time is not null',
    trackingMode: trackingModes.FLAT_MAINTENANCE,
    detail: 0,
    dbTime: new Date(Date.now() - 60 * 1000),
    outOfOrder: false
  }, {
    name: 'FLAT MAINTENANCE when db time is null',
    trackingMode: trackingModes.FLAT_MAINTENANCE,
    detail: 0,
    dbTime: null,
    outOfOrder: false
  }, {
    name: 'FLAT MAINTENANCE when out of order processing',
    trackingMode: trackingModes.FLAT_MAINTENANCE,
    detail: 0,
    dbTime: new Date(Date.now() + 600 * 1000),
    outOfOrder: true
  }, {
    name: 'SNOW SHEDDING when db time is null',
    trackingMode: trackingModes.SNOW_SHEDDING,
    detail: 0,
    dbTime: null,
    outOfOrder: false
  }, {
    name: 'SNOW SHEDDING when out of order processing',
    trackingMode: trackingModes.SNOW_SHEDDING,
    detail: 0,
    dbTime: new Date(Date.now() + 600 * 1000),
    outOfOrder: true
  }];

  for (const testcase of trackingModeTestCases) {
    it(testcase.name, async () => {
      await testPg.updateNetworkController(site.network_controller_id, {
        last_updated: null,
        commanded_state: null,
        commanded_state_detail: null,
        commanded_state_changed_at: testcase.dbTime,
        last_estop_engage_at: null,
        last_estop_disengage_at: null
      });

      const date = new Date();
      const when = {
        seconds: Math.floor(date.getTime() / 1000),
        nanos: 0
      }
      const trackingChange = {
        updatedState: testcase.trackingMode,
        stateChangedAt: when,
        commandedPreset: testcase.detail
      };

      const trackingModeSNSPaylaod = {
        nc_snap_addr: site.nc_snap_addr,
        snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        asset_id: site.asset_id,
        timestamp: new Date(when.seconds * 1000),
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: trackingChange.commandedPreset,
        network_controller_id: site.network_controller_id,
        type: 'elastic_search-1',
        channel: channels.TRACKING_MODE_CHANGE
      }

      const trackingChanges = [trackingChange];

      const scopeSns = mockSns(trackingModeSNSPaylaod);
      const scopeMqtt = mockMqtt(null);

      const result = await testBase.invokeLambda({
        trackingChanges
      });

      expect(result).to.equal(true);

      scopeSns.done();
      expect(scopeMqtt.isDone()).to.equal(false);

      await verifyNetworkController({
        last_updated: null,
        commanded_state: testcase.outOfOrder ? null : trackingChange.updatedState,
        commanded_state_detail: testcase.outOfOrder ? null : trackingChange.commandedPreset,
        commanded_state_changed_at: testcase.outOfOrder ? testcase.dbTime : new Date(when.seconds * 1000),
        last_estop_engage_at: null,
        last_estop_disengage_at: null
      });

      await verifyTrackingModeHistory({
        changed_at: new Date(when.seconds * 1000),
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: hasModeDetail(testcase.trackingMode) ? trackingChange.commandedPreset : null,
      });

      await verifyTrackingModeAssetHisotry(testcase, when.seconds);
    });
  }

  const  assetHistoryTestCases = [{
    name: 'asset history should not be inserted as networkController current mode == new mode',
    trackingMode: trackingModes.TRACKING,
    detail: 0,
    network_controller: {
      commanded_state: trackingModes.TRACKING,
      commanded_state_detail: 0
    }
  }, {
    name: 'asset history should be inserted as NetworkController current mode != new mode',
    trackingMode: trackingModes.TRACKING,
    detail: 0,
    network_controller: {
      commanded_state: trackingModes.REMOTE_QC,
      commanded_state_detail: 0
    }
  }, {
    name: 'asset history should be inserted as NetworkController current mode detail != new mode detail',
    trackingMode: trackingModes.MANUAL_STOW,
    detail: manualModeDetail.STOW_NIGHT,
    network_controller: {
      commanded_state: trackingModes.MANUAL_STOW,
      commanded_state_detail: manualModeDetail.FLAT
    }
  }, {
    name: 'asset history should not be inserted NetworkController current mode and detail both are same',
    trackingMode: trackingModes.MANUAL_STOW,
    detail: manualModeDetail.FLAT,
    network_controller: {
      commanded_state: trackingModes.MANUAL_STOW,
      commanded_state_detail: manualModeDetail.FLAT
    },
  },
  {
    name: 'asset history should be inserted as NetworkController current mode detail != new mode detail, New Firmware (Mode change by user from cloud)',
    trackingMode: trackingModes.MANUAL_STOW,
    detail: manualModeDetail.STOW_NIGHT,
    network_controller: {
      commanded_state: trackingModes.MANUAL_STOW,
      commanded_state_detail: manualModeDetail.FLAT
    },
    modeChangeByUser: true,
    userDetails: {
      userEmail: 'testUser@gmail.com',
      userName: 'testUser'
    }
  },
  {
    name: 'asset history should be inserted as NetworkController current mode detail != new mode detail, New Firmware (Mode change by user from cloud)',
    trackingMode: trackingModes.MANUAL_STOW,
    detail: manualModeDetail.STOW_NIGHT,
    network_controller: {
      commanded_state: trackingModes.MANUAL_STOW,
      commanded_state_detail: manualModeDetail.FLAT
    },
    modeChangeBy: 'CLOUD',
    userDetails: {
      userEmail: 'testUser@gmail.com',
      userName: 'testUser'
    }
  },
  {
    name: 'asset history should be inserted as NetworkController current mode detail != new mode detail, New Firmware (Mode change by NC/SLUI)',
    trackingMode: trackingModes.MANUAL_STOW,
    detail: manualModeDetail.STOW_NIGHT,
    network_controller: {
      commanded_state: trackingModes.MANUAL_STOW,
      commanded_state_detail: manualModeDetail.FLAT
    },
    modeChangeBy: 'SLUI',
    userDetails: {
      userEmail: 'admin@terratrak.com',
      userName: 'admin'
    }
  },
  {
    name: 'asset history should be inserted as NetworkController current mode detail != new mode detail, New Firmware (Mode change by MODBUS)',
    trackingMode: trackingModes.MANUAL_STOW,
    detail: manualModeDetail.STOW_NIGHT,
    network_controller: {
      commanded_state: trackingModes.MANUAL_STOW,
      commanded_state_detail: manualModeDetail.FLAT
    },
    modeChangeBy: 'MODBUS',
    userDetails: {
      userEmail: 'admin@terratrak.com',
      userName: 'admin'
    }
  }
];

  for (const testcase of assetHistoryTestCases) {
    const { name, network_controller } = testcase;
    it(name, async () => {

      await testPg.updateNetworkController(site.network_controller_id, {
        last_updated: null,
        commanded_state: network_controller ? network_controller.commanded_state : null,
        commanded_state_detail: network_controller ? network_controller.commanded_state_detail : null,
        commanded_state_changed_at: null,
        last_estop_engage_at: null,
        last_estop_disengage_at: null
      });

      const date = new Date();
      const when = {
        seconds: Math.floor(date.getTime() / 1000),
        nanos: 0
      }
      const trackingChange = {
        updatedState: testcase.trackingMode,
        stateChangedAt: when,
        commandedPreset: testcase.detail
      };

      const trackingModeSNSPaylaod = {
        nc_snap_addr: site.nc_snap_addr,
        snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        asset_id: site.asset_id,
        timestamp: new Date(when.seconds * 1000),
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: trackingChange.commandedPreset,
        network_controller_id: site.network_controller_id,
        type: 'elastic_search-1',
        channel: channels.TRACKING_MODE_CHANGE
      }

      if (testcase.modeChangeByUser || testcase.modeChangeByNc) {
        const user = testcase.userDetails
        trackingChange['userName'] = user.userName
        trackingChange['userEmail'] = user.userEmail
        trackingModeSNSPaylaod['user_name'] =user.userName
        trackingModeSNSPaylaod['user_email'] = user.userEmail
      }

      if (testcase.modeChangeBy) {
        const user = testcase.userDetails
        trackingChange['userName'] = user.userName
        trackingChange['userEmail'] = user.userEmail
        trackingModeSNSPaylaod['user_name'] =user.userName
        trackingModeSNSPaylaod['user_email'] = user.userEmail

        trackingChange['source'] = testcase.modeChangeBy
        trackingModeSNSPaylaod['source'] = testcase.modeChangeBy
        testcase.source = testcase.modeChangeBy;
      }
      else {
        trackingChange['source'] = "CLOUD"
        trackingModeSNSPaylaod['source'] = "CLOUD"
        testcase.source = 'CLOUD';
      }

      const trackingChanges = [trackingChange];

      const scopeSns = mockSns(trackingModeSNSPaylaod);
      const scopeMqtt = mockMqtt(null);

      const result = await testBase.invokeLambda({
        trackingChanges
      });

      expect(result).to.equal(true);

      scopeSns.done();
      expect(scopeMqtt.isDone()).to.equal(false);

      if (testcase.trackingMode != network_controller.commanded_state || testcase.detail != network_controller.commanded_state_detail) {
        await verifyTrackingModeAssetHisotry(testcase, when.seconds);
      } else {
        // history should not be inserted when mode and mode details are equal
        await verifyTrackingModeAssetHisotry(null);
      }
    });
  }

  const engageTestCases = [{
    name: 'when db time is not null',
    dbTime: new Date(Date.now() - 60 * 1000),
    outOfOrder: false
  }, {
    name: 'when db time is null',
    dbTime: null,
    outOfOrder: false
  }, {
    name: 'when out of order processing',
    dbTime: new Date(Date.now() + 600 * 1000),
    outOfOrder: true
  }];

  for (const testcase of engageTestCases) {
    it(`estop engage ${testcase.name}`, async () => {
      await testPg.updateNetworkController(site.network_controller_id, {
        last_updated: null,
        commanded_state: trackingModes.TRACKING,
        commanded_state_detail: 0,
        commanded_state_changed_at: null,
        last_estop_engage_at: testcase.dbTime,
        last_estop_disengage_at: null
      });

      const date = new Date();
      const when = {
        seconds: Math.floor(date.getTime() / 1000),
        nanos: 0
      }
      const trackingChange = {
        updatedState: trackingModes.ESTOP_ENGAGE,
        stateChangedAt: when,
        commandedPreset: 0
      };

      const trackingModeSNSPaylaod = {
        nc_snap_addr: site.nc_snap_addr,
        snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        asset_id: site.asset_id,
        timestamp: new Date(when.seconds * 1000),
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: trackingChange.commandedPreset,
        network_controller_id: site.network_controller_id,
        type: 'elastic_search-1',
        channel: channels.TRACKING_MODE_CHANGE
      }

      const trackingChanges = [trackingChange];

      const scopeSns = mockSns(trackingModeSNSPaylaod);
      const scopeMqtt = mockMqtt(null);

      const result = await testBase.invokeLambda({
        trackingChanges
      });

      expect(result).to.equal(true);

      scopeSns.done();
      expect(scopeMqtt.isDone()).to.equal(false);

      await verifyNetworkController({
        last_updated: null,
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: trackingChange.commandedPreset,
        commanded_state_changed_at: new Date(when.seconds * 1000),
        last_estop_engage_at: testcase.outOfOrder ? testcase.dbTime : new Date(when.seconds * 1000),
        last_estop_disengage_at: null
      });

      await verifyTrackingModeHistory({
        changed_at: new Date(when.seconds * 1000),
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: null
      })
    });
  }

  const disengageTestCases = [{
    name: 'when db time is not null',
    dbTime: new Date(Date.now() - 60 * 1000),
    outOfOrder: false
  }, {
    name: 'when db time is null',
    dbTime: null,
    outOfOrder: false
  }, {
    name: 'when out of order processing',
    dbTime: new Date(Date.now() + 600 * 1000),
    outOfOrder: true
  }];

  for (const testcase of disengageTestCases) {
    it(`estop disengage ${testcase.name}`, async () => {
      await testPg.updateNetworkController(site.network_controller_id, {
        last_updated: null,
        commanded_state: trackingModes.ESTOP_ENGAGE,
        commanded_state_detail: 0,
        commanded_state_changed_at: null,
        last_estop_engage_at: null,
        last_estop_disengage_at: testcase.dbTime
      });

      const date = new Date();
      const when = {
        seconds: Math.floor(date.getTime() / 1000),
        nanos: 0
      }
      const trackingChange = {
        updatedState: trackingModes.TRACKING,
        stateChangedAt: when,
        commandedPreset: 0
      };

      const trackingModeSNSPaylaod = {
        nc_snap_addr: site.nc_snap_addr,
        snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        asset_id: site.asset_id,
        timestamp: new Date(when.seconds * 1000),
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: trackingChange.commandedPreset,
        network_controller_id: site.network_controller_id,
        type: 'elastic_search-1',
        channel: channels.TRACKING_MODE_CHANGE
      }

      const trackingChanges = [trackingChange];

      const scopeSns = mockSns(trackingModeSNSPaylaod);
      const scopeMqtt = mockMqtt(null);

      const result = await testBase.invokeLambda({
        trackingChanges
      });

      expect(result).to.equal(true);

      scopeSns.done();
      expect(scopeMqtt.isDone()).to.equal(false);

      await verifyNetworkController({
        last_updated: null,
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: trackingChange.commandedPreset,
        commanded_state_changed_at: new Date(when.seconds * 1000),
        last_estop_engage_at: null,
        last_estop_disengage_at: testcase.outOfOrder ? testcase.dbTime : new Date(when.seconds * 1000)
      });

      await verifyTrackingModeHistory({
        changed_at: new Date(when.seconds * 1000),
        commanded_state: trackingChange.updatedState,
        commanded_state_detail: null
      })
    });
  }

})
