const testBase = require("./common/testBase");
const { site, createAssetBySnapAddr } = require("./common/testData");
const moment = require("moment");
const {AwsConfig, resetSqsUrlCache} = require("../utils/lib/aws");
const { mockSns, mockDetectedAnomalySqs, mockSqsGetQueueUrl, mockSqsPublishMsg } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const { deviceTypeIds, redisStreamErrorString } = require("../utils/constants")
const { trackingStatus, trackingModes, panelCommandState, cloudAlertEventNames, NotificationTypes, cloudAlertEventTitles, LOCAL_ERRORS } = require('../utils/constants');
const { channels } = require('../utils/helpers/NotificationHelper');
const testPg = require('./common/testPg');
const { verifyDbRow } = require('./common/dbVerify');
const { remoteCacheHelper } = require("../utils/cache/remoteCacheHelper")
const { getSnapAddr } = require("../utils/helpers/functions")
const remoteCache = require("../utils/cache/remoteCache");
const sinon = require('sinon');


describe("rackAngleUpdates", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    await testPg.deleteFasttrak(rowbox.snap_addr);
    await testPg.insertFasttrak(rowbox.snap_addr, trackingStatus.TRACKING_ONLY);// Main reason behind failure of test cases was the unavailability of fasttrak data
    await testPg.deleteAssetHistoryBySnapAddr(rowbox.snap_addr);
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  //   Sample Message
  //   {
  //     "ncSnapAddr": "0a1ba8",
  //     "rackAnglesList": [
  //       {
  //         "tcSnapAddr": "141d84",
  //         "anglesList": [
  //           {
  //             "currentAngle": 0,
  //             "requestedAngle": 0,
  //             "commandedState": 5,
  //             "trackingStatus": 5,
  //             "when": "2022-03-30T09:01:13.592Z",
  //             "commandedStateDetail": 0,
  //             "panelIndex": 16,
  //             "panelCommandState": 2,
  //             "motorCurrent": 0
  //           }
  //         ]
  //       }
  //     ],
  //   }

  const minus60TestCases = [{
    name: "minus60Complete = false, angle > -57",
    oldMinus60Complete: false,
    minus60Complete: true,
    angleUpdate: {
      currentAngle: -59.900001525878906,
      requestedAngle: -60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "minus60Complete = false, angle < -57",
    oldMinus60Complete: false,
    minus60Complete: false,
    angleUpdate: {
      currentAngle: -56.900001525878906,
      requestedAngle: -60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "minus60Complete = null, angle > -57",
    oldMinus60Complete: null,
    minus60Complete: null,
    angleUpdate: {
      currentAngle: -59.900001525878906,
      requestedAngle: -60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "plus60Complete = false, angle > 57",
    oldPlus60Complete: false,
    plus60Complete: true,
    angleUpdate: {
      currentAngle: 59.900001525878906,
      requestedAngle: 60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "plus60Complete = false, angle < 57",
    oldPlus60Complete: false,
    plus60Complete: false,
    angleUpdate: {
      currentAngle: 56.900001525878906,
      requestedAngle: 60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "plus60Complete = null, angle > 57",
    oldPlus60Complete: null,
    plus60Complete: null,
    angleUpdate: {
      currentAngle: 59.900001525878906,
      requestedAngle: 60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "do not send rack angle update to anomaly_detection if project ML is off",
    projectML: false,
    oldMinus60Complete: false,
    minus60Complete: true,
    angleUpdate: {
      currentAngle: -59.900001525878906,
      requestedAngle: -60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "send rack angle update to anomaly_detection if project ML is on",
    projectML: true,
    assetRepeaterOnly: false,
    assetActive: true,
    oldMinus60Complete: false,
    minus60Complete: true,
    angleUpdate: {
      currentAngle: -59.900001525878906,
      requestedAngle: -60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "don't send rack angle update to anomaly_detection if project ML is on but asset is repeater only ",
    projectML: true,
    assetRepeaterOnly: true,
    assetActive: true,
    oldMinus60Complete: false,
    minus60Complete: true,
    angleUpdate: {
      currentAngle: -59.900001525878906,
      requestedAngle: -60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }, {
    name: "don't send rack angle update to anomaly_detection if project ML is on but asset is inactive ",
    projectML: true,
    assetActive: false,
    oldMinus60Complete: false,
    minus60Complete: true,
    angleUpdate: {
      currentAngle: -59.900001525878906,
      requestedAngle: -60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  }];

  for (const testcase of minus60TestCases) {

    const { angleUpdate } = testcase;

    it(testcase.name, async () => {
      const { rowBoxes } = site
      // update asset repeater only status.
      await testPg.updateAsset(rowBoxes[0].asset_id,{repeater_only: testcase.assetRepeaterOnly ? true : false});

      // update asset active status.
      await testPg.updateAsset(rowBoxes[0].asset_id,{active: testcase.assetActive ? true : false});

      // update project set project ml
      await testPg.updateProjectById(site.project_id,{ml_current_angle: testcase.projectML ? true : false});

      await testPg.updateRack(rowbox.snap_addr, {
        current_angle: null,
        requested_angle: null,
        commanded_state: null,
        tracking_status: null,
        commanded_state_detail: null,
        motor_current: null,
        panel_index: null,
        panel_commanded_state: null,
        last_updated: moment(when.seconds - 10000).format()
      });

      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: angleUpdate.trackingStatus,
        last_updated: new Date((when.seconds - 1500) * 1000),
        start_time: new Date((when.seconds - 1500) * 1000),
        end_time: null,
        plus60_complete: testcase.oldPlus60Complete === undefined ? false : testcase.oldPlus60Complete,
        minus60_complete: testcase.oldMinus60Complete === undefined ? false : testcase.oldMinus60Complete,
        current_state: null,
        max_peak_motor_inrush_current: 8.5,
        max_peak_motor_current: 6.5,
        max_average_motor_current: 4.0,
      });

      const rackAngles = {
        tcSnapAddr: rowbox.snap_addr_b64,
        angles: [angleUpdate]
      }

      const expected = {
        type: 'elastic_search-1',
        channel: channels.RACK_UPDATE,
        network_controller_id: site.network_controller_id,
        snap_addr: rowbox.snap_addr,
        asset_id: rowbox.asset_id,
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        device_type: deviceTypeIds.DEVICE_TYPE_ID_RB.toLowerCase(),
        timestamp: moment.utc(when.seconds * 1000).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        current_angle: angleUpdate.currentAngle,
        requested_angle: angleUpdate.requestedAngle,
        tracking_status: angleUpdate.trackingStatus,
        commanded_state: angleUpdate.commandedState,
        commanded_state_detail: angleUpdate.commandedStateDetail,
        panel_index: angleUpdate.panelIndex,
        panel_command_state: angleUpdate.panelCommandState,
        motor_current: angleUpdate.motorCurrent
      };
      const scopeSns = mockSns(expected);
      const scopeSqs = mockDetectedAnomalySqs(AwsConfig.anomalyDetectionQueueName, {...expected, type: 'cloudwatch-es'});

      const result = await testBase.invokeLambda({ rackAngles: [rackAngles] });
      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(false);


      if (testcase.projectML && testcase.assetActive && !testcase.assetRepeaterOnly) {
        expect(scopeSqs.isDone()).to.equal(true);
      } else {
        expect(scopeSqs.isDone()).to.equal(false);
      }


      await verifyDbRow(() => testPg.getRack(rowbox.snap_addr), {
        current_angle: angleUpdate.currentAngle,
        requested_angle: angleUpdate.requestedAngle,
        commanded_state: angleUpdate.commandedState,
        tracking_status: angleUpdate.trackingStatus,
        commanded_state_detail: angleUpdate.commandedStateDetail,
        motor_current: angleUpdate.motorCurrent,
        panel_index: angleUpdate.panelIndex,
        panel_commanded_state: angleUpdate.panelCommandState
      });

      await verifyDbRow(() => testPg.getRackHist(rowbox.snap_addr), {
        snap_addr: rowbox.snap_addr,
        data: {
          "rack.current_angle": angleUpdate.currentAngle,
          "rack.requested_angle": angleUpdate.requestedAngle,
          "tracking.mode": angleUpdate.commandedState,
          "tracking.mode_detail": angleUpdate.commandedStateDetail,
          "asset.panel_index": angleUpdate.panelIndex,
          "asset.panel_commanded_state": angleUpdate.panelCommandState,
          "asset.tracking_status": angleUpdate.trackingStatus,
          "motor.current": angleUpdate.motorCurrent,
        }
      });

      await verifyDbRow(() => testPg.getAssetHistoryBySnapAddr(rowbox.snap_addr), {
        data: {
          "asset.panel_index": angleUpdate.panelIndex,
          "asset.tracking_status": angleUpdate.trackingStatus,
          "asset.panel_commanded_state": angleUpdate.panelCommandState,
          "tracking.mode": angleUpdate.commandedState,
          "tracking.mode_detail": angleUpdate.commandedStateDetail,
          "motor.current": angleUpdate.motorCurrent,
          "rack.current_angle": angleUpdate.currentAngle,
          "rack.requested_angle": angleUpdate.requestedAngle
        }
      });

      await verifyDbRow(() => testPg.getFasttrak(rowbox.snap_addr), {
        tracking_status: angleUpdate.trackingStatus,
        current_state: null,
        start_time: new Date((when.seconds - 1500) * 1000),
        end_time: null,
        plus60_complete: testcase.plus60Complete === undefined ? false : testcase.plus60Complete,
        minus60_complete: testcase.minus60Complete === undefined ? false : testcase.minus60Complete,
        max_peak_motor_inrush_current: 8.5,
        max_peak_motor_current: 6.5,
        max_average_motor_current: 4.0,
      });
    });
  }
});


describe("verify asset creation and cache", () => {

  const newAsset = createAssetBySnapAddr('aabbcc');

  beforeEach(async () => {
    await testBase.init();
    await testPg.deleteAssetLinkedEntitiesByIds(newAsset);
  });

  const date = new Date();
  const when = {
    /*
     * adding 60 seconds, because rack creation time was greater than rack
     * update time (Both rack creation and update is performed in the code)
     */
    seconds: Math.floor((date.getTime() / 1000) + 60),
    nanos: 0,
  };

  const testcase = {
    oldPlus60Complete: null,
    plus60Complete: null,
    asset: newAsset,
    angleUpdate: {
      currentAngle: 59.900001525878906,
      requestedAngle: 60,
      commandedState: trackingModes.TRAKING_WITH_BACKTRACKING,
      commandedStateDetail: 0,
      trackingStatus: trackingStatus.QC_FASTTRAK,
      when,
      panelIndex: 16,
      panelCommandState: panelCommandState.MOVE_TO_ABS,
      motorCurrent: 1.7999999523162842
    }
  };


  const { angleUpdate } = testcase;

  it("plus60Complete = null, angle > 57 when asset doesn't exist", async () => {
    await testPg.removeAssetConf(testcase.asset.snap_addr);
    await testPg.updateRack(testcase.asset.snap_addr, {
      current_angle: null,
      requested_angle: null,
      commanded_state: null,
      tracking_status: null,
      commanded_state_detail: null,
      motor_current: null,
    });

    await testPg.updateFasttrak(testcase.asset.snap_addr, {
      tracking_status: angleUpdate.trackingStatus,
      last_updated: new Date((when.seconds - 1500) * 1000),
      start_time: new Date((when.seconds - 1500) * 1000),
      end_time: null,
      plus60_complete: testcase.oldPlus60Complete === undefined ? false : testcase.oldPlus60Complete,
      minus60_complete: testcase.oldMinus60Complete === undefined ? false : testcase.oldMinus60Complete,
      current_state: null,
      max_peak_motor_inrush_current: 8.5,
      max_peak_motor_current: 6.5,
      max_average_motor_current: 4.0,
    });

    const rackAngles = {
      tcSnapAddr: testcase.asset.snap_addr_b64,
      angles: [angleUpdate]
    };

    const expectedSNSData = {
      type: 'elastic_search-1',
      channel: channels.RACK_UPDATE,
      network_controller_id: site.network_controller_id,
      snap_addr: testcase.asset.snap_addr,
      asset_id: testcase.asset.asset_id,
      nc_snap_addr: site.nc_snap_addr,
      site_id: site.site_id,
      device_type: null,
      current_angle: angleUpdate.currentAngle,
      requested_angle: angleUpdate.requestedAngle,
      tracking_status: angleUpdate.trackingStatus,
      commanded_state: angleUpdate.commandedState,
      commanded_state_detail: angleUpdate.commandedStateDetail,
      panel_index: angleUpdate.panelIndex,
      panel_command_state: angleUpdate.panelCommandState,
      motor_current: angleUpdate.motorCurrent
    };

    const expected = { timestamp: moment(when.seconds * 1000).utc(), ...expectedSNSData };
    const scopeSns = mockSns(expected);

    const result = await testBase.invokeLambda({ rackAngles: [rackAngles] });

    expect(result).to.equal(true);
    expect(scopeSns.isDone()).to.equal(false);
    const expectedCacheRes = await testPg.getAssetLinkedEntitiesIds(testcase.isNC, testcase.asset.snap_addr);
    expect(expectedCacheRes.rows.length).to.equal(1);

    const expectedRes = {
      ...expectedCacheRes.rows[0],
      snap_addr: testcase.asset.snap_addr
    };

    let cache = await remoteCacheHelper.getAssetEntitiesIds(testcase.asset.snap_addr);
    cache = {
      ...cache,
      snap_addr: getSnapAddr(cache.snap_addr.data)
    };
    expect(cache).to.deep.equal(expectedRes);
  });
});

describe("rack angle anomaly detection", () => {

  const [rowbox] = site.rowBoxes;
  const ncId = site.asset_id;

  beforeEach(async () => {
    await testBase.init();
    await testPg.deleteFasttrak(rowbox.snap_addr);
    await testPg.insertFasttrak(rowbox.snap_addr, trackingStatus.TRACKING_ONLY);// Main reason behind failure of test cases was the unavailability of fasttrak data
    await testPg.deleteAssetHistoryBySnapAddr(rowbox.snap_addr);
    await testPg.delCloudEventLog(rowbox.asset_id);
    await testPg.delCloudAlert(rowbox.asset_id);
    await testPg.delCloudAlert(ncId);
    await testPg.delCloudAlertDetail(rowbox.asset_id);
    await testPg.updateAsset(rowbox.asset_id, {
      asset_type: 0,
      repeater_only: false
    });
    resetSqsUrlCache();
  });


  const getAngleUpdObj = (currentAngle, requestedAngle, trackingMode, when) => {
    return {
      currentAngle,
      requestedAngle,
      trackingStatus: trackingStatus.TRACKING_ONLY,
      when,
      commandedState: trackingMode,
      commandedStateDetail: 0,
      panelIndex: 16,
      panelCommandState: panelCommandState.NONE,
      motorCurrent: 1.5
    }
  };

  const getRackHistObj = (currentAngle, requestedAngle, trackingMode, when, trackStatus) => {
    return {
      snap_addr: rowbox.snap_addr,
      timestamp: moment(when.seconds * 1000).format(), // converting second to millisecond accurate
      data: {
        "rack.current_angle": currentAngle,
        "rack.requested_angle": requestedAngle,
        "tracking.mode": trackingMode,
        "tracking.mode_detail": 0,
        "asset.panel_index": 16,
        "asset.panel_commanded_state": panelCommandState.NONE,
        "asset.tracking_status": trackStatus || trackingStatus.TRACKING_ONLY,
        "motor.current": 1.5
      }
    }
  };

  const getWhen = (subtractMin) => {
    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000) - (subtractMin ? subtractMin * 60 : 0),
      nanos: 0,
    };
    return when;
  };

  const projectSettings = {
    ml_current_angle: false,
    anomaly_row_not_moving: true,
    anomaly_row_not_moving_duration: 10,
    anomaly_row_not_moving_angle_threshold: 0.5,
    anomaly_row_not_following: true,
    anomaly_row_not_following_duration: 10,
    anomaly_row_not_following_clear_angle_threshold: 1,
    anomaly_row_not_following_angle_threshold: 10
  };

  const testCases = [{
    name: "Row moving normally in tracking mode",
    projectSetting: null,
    preReqRackData: [
      getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(1, 2, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(2, 3, trackingModes.TRACKING, getWhen(5)),
    alertExist: false,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3
  }, {
      name: "Row not tracking in local estop (should not generate alert)",
      projectSetting: null,
      preReqRackData: [
        getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(15)),
        getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(10), trackingStatus.LOCAL_ESTOP)
      ],
      angleUpdate: getAngleUpdObj(0, 1, trackingModes.TRACKING, getWhen(5)),
      alertExist: false,
      duration: projectSettings.anomaly_row_not_following_duration,
      expectedStreamDataLengthForNotMoving: 3,
      expectedStreamDataLengthForNotFollowing: 3
  }, {
    name: "Row not moving in tracking mode",
    projectSetting: null,
    preReqRackData: [
      getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(0, 1, trackingModes.TRACKING, getWhen(5)),
    alertExist: true,
    duration: projectSettings.anomaly_row_not_moving_duration,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_MOVING,
    expectedAlertTitle: 'Stopped Moving'
  }, {
    name: "Repeater not following target angle in tracking mode",
    projectSetting: null,
    preReqRackData: [
      getRackHistObj(1, 12, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(2, 13, trackingModes.TRACKING, getWhen(10))
    ],
    isRepeater: true,
    angleUpdate: getAngleUpdObj(2, 13, trackingModes.TRACKING, getWhen(5)),
    alertExist: false,
    duration: projectSettings.anomaly_row_not_following_duration,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3
  }, {
    name: "Row not following target angle in tracking mode",
    projectSetting: null,
    preReqRackData: [
      getRackHistObj(1, 12, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(2, 13, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(2, 13, trackingModes.TRACKING, getWhen(5)),
    alertExist: true,
    duration: projectSettings.anomaly_row_not_following_duration,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING,
    expectedAlertTitle: 'Stopped Tracking'
  }, {
    name: "Row not following with negative values",
    projectSetting: null,
    preReqRackData: [
      getRackHistObj(-1, -14, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(-2, -15, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(-2, -15, trackingModes.TRACKING, getWhen(5)),
    alertExist: true,
    duration: projectSettings.anomaly_row_not_following_duration,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING,
    expectedAlertTitle: 'Stopped Tracking'
  }, {
    name: "Row not following with negative values and first entry should not be at exact (expected start) time",
    projectSetting: null,
    preReqRackData: [
      getRackHistObj(-1, -13, trackingModes.TRACKING, getWhen(17)),
      // If we subtractMin 15 then it is exact start time, because it is 10 mins before the time of last event
      getRackHistObj(-1, -14, trackingModes.TRACKING, getWhen(16)),
      getRackHistObj(-2, -15, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(-2, -15, trackingModes.TRACKING, getWhen(5)),
    alertExist: true,
    duration: projectSettings.anomaly_row_not_following_duration,
    expectedStreamDataLengthForNotMoving: 2,
    expectedStreamDataLengthForNotFollowing: 2, // expected is 2, because other 2 entries are older than 10 mins
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING,
    expectedAlertTitle: 'Stopped Tracking'
  }, {
    name: "Row not moving & not following target angle in tracking mode",
    projectSetting: null,
    preReqRackData: [
      getRackHistObj(1, 12, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(1, 13, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(1, 14, trackingModes.TRACKING, getWhen(5)),
    alertExist: true,
    duration: projectSettings.anomaly_row_not_following_duration,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_MOVING,
    expectedAlertTitle: 'Stopped Moving'
  }, {
    name: "When Row Tracking Anomaly Toggles are disabled",
    preReqRackData: [
      getRackHistObj(1, 12, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(1, 13, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(1, 14, trackingModes.TRACKING, getWhen(5)),
    alertExist: false,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3,
    duration: 10,
    projectSetting: {
      anomaly_row_not_moving: false,
      anomaly_row_not_moving_duration: 10,
      anomaly_row_not_moving_angle_threshold: 0.5,
      anomaly_row_not_following: false,
      anomaly_row_not_following_duration: 10,
      anomaly_row_not_following_angle_threshold: 10
    }
  }, {
    name: "When Row Not Moving & Row Not Following has different settings",
    preReqRackData: [
      getRackHistObj(1, 12, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(1, 13, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(1, 14, trackingModes.TRACKING, getWhen(5)),
    alertExist: true,
    expectedStreamDataLengthForNotMoving: 2,
    expectedStreamDataLengthForNotFollowing: 3,
    projectSetting: {
      anomaly_row_not_moving: true,
      anomaly_row_not_moving_duration: 5,
      anomaly_row_not_moving_angle_threshold: 0.5,
      anomaly_row_not_following: true,
      anomaly_row_not_following_duration: 10,
      anomaly_row_not_following_angle_threshold: 10
    },
    duration: 5,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_MOVING,
    expectedAlertTitle: 'Stopped Moving'
  }, {
    name: "When Row Not Moving Alert already exist and row started tracking normally",
    preReqRackData: [
      getRackHistObj(1, 2, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(2, 3, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(3, 4, trackingModes.TRACKING, getWhen(5)),
    preTestAlertExist: true,
    alertTitle: cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE,
    alertCleared: true,
    alertExist: false,
    duration: null,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING,
    expectedAlertTitle: 'Stopped Moving'
  }, {
    name: "When Row Not Moving Alert & Alert Detail exist and row started tracking normally",
    preReqRackData: [
      getRackHistObj(1, 2, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(2, 3, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(3, 4, trackingModes.TRACKING, getWhen(5)),
    preTestAlertExist: true,
    preTestAlertDetailExist: true,
    alertTitle: cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE,
    alertCleared: true,
    alertExist: false,
    duration: null,
    expectedStreamDataLengthForNotMoving: 3,
    expectedStreamDataLengthForNotFollowing: 3,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING,
    expectedAlertTitle: 'Stopped Moving'
  }, {
    name: "when rack hist events are at same time",
    preReqRackData: [
      getRackHistObj(1, 12, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(1, 13, trackingModes.TRACKING, getWhen(15))
    ],
    angleUpdate: getAngleUpdObj(1, 14, trackingModes.TRACKING, getWhen(15)),
    alertExist: false,
    expectedStreamDataLengthForNotMoving: 1,
    expectedStreamDataLengthForNotFollowing: 1,
    duration: 15,
    projectSetting: {
      anomaly_row_not_moving: true,
      anomaly_row_not_moving_duration: 15,
      anomaly_row_not_moving_angle_threshold: 0.5,
      anomaly_row_not_following: true,
      anomaly_row_not_following_duration: 15,
      anomaly_row_not_following_angle_threshold: 10
    }
  }, {
    name: "When Row Not Moving Alert already exist and rack data shows that it was in nightly stow during the duration, but tracking anomaly is cleared recently",
    preReqRackData: [
      getRackHistObj(2, 3, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(0, 0, trackingModes.NIGHTLY_STOW, getWhen(14)),
      getRackHistObj(0, 0, trackingModes.NIGHTLY_STOW, getWhen(13)),
      getRackHistObj(0, 0, trackingModes.NIGHTLY_STOW, getWhen(11)),
      getRackHistObj(2, 3, trackingModes.TRACKING, getWhen(10)),
      getRackHistObj(3, 4, trackingModes.TRACKING, getWhen(8))
    ],
    angleUpdate: getAngleUpdObj(4, 5, trackingModes.TRACKING, getWhen(7)),
    preTestAlertExist: true,
    alertTitle: cloudAlertEventTitles.ROW_NOT_MOVING_TITLE,
    alertCleared: true,
    alertExist: false,
    duration: null,
    expectedStreamDataLengthForNotMoving: 7,
    expectedStreamDataLengthForNotFollowing: 7,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_MOVING,
    expectedAlertTitle: 'Stopped Moving'
  }, {
    /*
     * In this case, it should not clear the existing alert, because current angle did not change the clearAngleThreshold value
     */
    name: "When Row Not Following Alert already exist and target angle changes and reaches to a value where current angle and target angle matches",
    preReqRackData: [
      getRackHistObj(2, 10, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(2, 9, trackingModes.TRACKING, getWhen(14)),
      getRackHistObj(2, 8, trackingModes.TRACKING, getWhen(13)),
      getRackHistObj(2, 7, trackingModes.TRACKING, getWhen(12)),
      getRackHistObj(2, 6, trackingModes.TRACKING, getWhen(11)),
      getRackHistObj(2, 5, trackingModes.TRACKING, getWhen(10)),
      getRackHistObj(2, 4, trackingModes.TRACKING, getWhen(9)),
      getRackHistObj(2, 3, trackingModes.TRACKING, getWhen(8)),
      getRackHistObj(2, 2, trackingModes.TRACKING, getWhen(7)),
      getRackHistObj(2, 1, trackingModes.TRACKING, getWhen(6))
    ],
    projectSetting: {
      ml_current_angle: false,
      anomaly_row_not_moving: true,
      anomaly_row_not_moving_duration: 20,
      anomaly_row_not_moving_angle_threshold: 0.5,
      anomaly_row_not_following: true,
      anomaly_row_not_following_duration: 10,
      anomaly_row_not_following_clear_angle_threshold: 1,
      anomaly_row_not_following_angle_threshold: 10
    },
    angleUpdate: getAngleUpdObj(2, 0, trackingModes.TRACKING, getWhen(5)),
    preTestAlertExist: true,
    alertTitle: cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE,
    alertCleared: false,
    alertExist: true,
    duration: null,
    expectedStreamDataLengthForNotMoving: 11,
    expectedStreamDataLengthForNotFollowing: 11,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING,
    expectedAlertTitle: cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE
  }, {
    /*
     * In this case, it should not clear the existing alert, because current angle did not change the clearAngleThreshold value
     */
    name: "When Row Not Following Alert already exist and target angle changes and reaches to a value where current angle and target angle matches",
    preReqRackData: [
      getRackHistObj(4, 10, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(4, 9, trackingModes.TRACKING, getWhen(14)),
      getRackHistObj(4, 8, trackingModes.TRACKING, getWhen(13)),
      getRackHistObj(4, 7, trackingModes.TRACKING, getWhen(12)),
      getRackHistObj(4, 6, trackingModes.TRACKING, getWhen(11)),
      getRackHistObj(4, 5, trackingModes.TRACKING, getWhen(10)),
      getRackHistObj(4, 4, trackingModes.TRACKING, getWhen(9)),
      getRackHistObj(2, 3, trackingModes.TRACKING, getWhen(8)),
      getRackHistObj(2, 2, trackingModes.TRACKING, getWhen(7)),
      getRackHistObj(1, 1, trackingModes.TRACKING, getWhen(6))
    ],
    projectSetting: {
      ml_current_angle: false,
      anomaly_row_not_moving: true,
      anomaly_row_not_moving_duration: 20,
      anomaly_row_not_moving_angle_threshold: 0.5,
      anomaly_row_not_following: true,
      anomaly_row_not_following_duration: 10,
      anomaly_row_not_following_clear_angle_threshold: 1,
      anomaly_row_not_following_angle_threshold: 10
    },
    angleUpdate: getAngleUpdObj(2, 0, trackingModes.TRACKING, getWhen(5)),
    preTestAlertExist: true,
    alertTitle: cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE,
    alertCleared: true,
    alertExist: false,
    duration: null,
    expectedStreamDataLengthForNotMoving: 11,
    expectedStreamDataLengthForNotFollowing: 11,
    notificationType: NotificationTypes.ANOMALY_ROW_NOT_FOLLOWING,
    expectedAlertTitle: cloudAlertEventTitles.ROW_NOT_FOLLOWING_TITLE
  }];


  for (const testcase of testCases) {

    it(testcase.name, async () => {
      if (testcase.isRepeater) {
        await testPg.updateAsset(rowbox.asset_id, {
          repeater_only: true
        });
      }
      if (testcase.preTestAlertExist) {
        await testPg.insertCloudAlert({
          asset_id: rowbox.asset_id,
          created: moment().format(),
          type: 2,
          event_name: cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY,
          message: 'test',
          active: true,
          title: testcase.alertTitle || cloudAlertEventTitles.ROW_NOT_MOVING_TITLE,
          levelno: 20
        });
        if (testcase.preTestAlertDetailExist) {
          const {rows: cloudAlert} = await testPg.insertCloudAlert({
            asset_id: ncId,
            created: moment().format(),
            type: 2,
            event_name: cloudAlertEventNames.NC_COMMANDED_STATE,
            message: 'test',
            active: true,
            title: cloudAlertEventTitles.TRACKING_WITH_BACKTRACKING,
            levelno: 20
          });
          await testPg.insertCloudAlertDetail({
            asset_id: rowbox.asset_id,
            created: moment().format(),
            type: 2,
            event_name: cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY,
            message: 'test',
            active: true,
            title: testcase.alertTitle || cloudAlertEventTitles.ROW_NOT_MOVING_TITLE,
            cloud_alert_id: cloudAlert[0].id
          });
        }
      }
      const notificationPayload = {
        notificationType: testcase.notificationType,
        snapAddr: rowbox.snap_addr,
        params: {
          rowNo: 1,
          duration: testcase.duration,
          alertCleared: testcase.alertCleared || false
        }
      };
      await testPg.updateProjectById(site.project_id, testcase.projectSetting || projectSettings);
      await testPg.updateAsset(rowbox.asset_id,{active: true});
      for (const rec of testcase.preReqRackData) {
        await testPg.insertRackHist(rec);
      }

      // Setting last_updated to an older time, so that in lambda,
      // it can update rack entry again
      const rackOldTimestamp = moment(getWhen(20).seconds * 1000).utc().format();
      await testPg.updateRack(rowbox.snap_addr, {
        current_angle: null,
        requested_angle: null,
        commanded_state: null,
        tracking_status: null,
        commanded_state_detail: null,
        motor_current: null,
        panel_index: null,
        panel_commanded_state: null,
        last_updated: rackOldTimestamp
      });

      const angleUpdate = testcase.angleUpdate;

      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: angleUpdate.trackingStatus,
        last_updated: new Date((angleUpdate.when.seconds - 1500) * 1000),
        start_time: new Date((angleUpdate.when.seconds - 1500) * 1000),
        end_time: null,
        plus60_complete: false,
        minus60_complete: false,
        current_state: null,
        max_peak_motor_inrush_current: 8.5,
        max_peak_motor_current: 6.5,
        max_average_motor_current: 4.0,
      });

      const rackAngles = {
        tcSnapAddr: rowbox.snap_addr_b64,
        angles: [angleUpdate]
      };

      const expectedSNSData = {
        type: 'elastic_search-1',
        channel: channels.RACK_UPDATE,
        network_controller_id: site.network_controller_id,
        snap_addr: rowbox.snap_addr,
        asset_id: rowbox.asset_id,
        nc_snap_addr: site.nc_snap_addr,
        site_id: site.site_id,
        device_type: deviceTypeIds.DEVICE_TYPE_ID_RB.toLowerCase(),
        current_angle: angleUpdate.currentAngle,
        requested_angle: angleUpdate.requestedAngle,
        tracking_status: angleUpdate.trackingStatus,
        commanded_state: angleUpdate.commandedState,
        commanded_state_detail: angleUpdate.commandedStateDetail,
        panel_index: angleUpdate.panelIndex,
        panel_command_state: angleUpdate.panelCommandState,
        motor_current: angleUpdate.motorCurrent
      };

      const expected = {timestamp: moment(angleUpdate.when.seconds * 1000).utc(), ...expectedSNSData};
      const scopeSns = mockSns(expected);
      const scopeQueueURL = mockSqsGetQueueUrl(AwsConfig.notificationQueueName);
      const scopeSendMessage = mockSqsPublishMsg(notificationPayload, AwsConfig.notificationQueueName);

      const result = await testBase.invokeLambda({rackAngles: [rackAngles]});
      expect(result).to.equal(true);
      expect(scopeSns.isDone()).to.equal(false);
      expect(scopeQueueURL.isDone()).to.equal(!!((testcase.alertExist && !testcase.preTestAlertExist) || (!testcase.alertExist && testcase.preTestAlertExist)));
      expect(scopeSendMessage.isDone()).to.equal(!!((testcase.alertExist && !testcase.preTestAlertExist) || (!testcase.alertExist && testcase.preTestAlertExist)));

      const projSettings = testcase.projectSetting || projectSettings;
      const firstEventTime = new Date(angleUpdate.when.seconds * 1000);

      const startTime1 = firstEventTime.getTime() - (projSettings.anomaly_row_not_moving_duration * 60 * 1000);
      const endTime1 = firstEventTime.getTime();
      const streamDataForRowNotMoving = await remoteCache.getRackHist(rowbox.snap_addr, startTime1.toString(), endTime1.toString());

      const startTime2 = firstEventTime.getTime() - (projSettings.anomaly_row_not_following_duration * 60 * 1000);
      const endTime2 = firstEventTime.getTime();
      const streamDataForRowNotFollowing = await remoteCache.getRackHist(rowbox.snap_addr, startTime2.toString(), endTime2.toString());

      expect(streamDataForRowNotMoving.length).to.equal(testcase.expectedStreamDataLengthForNotMoving);
      expect(streamDataForRowNotFollowing.length).to.equal(testcase.expectedStreamDataLengthForNotFollowing);

      const {rows: cloudAlerts} = await testPg.getCloudAlert(rowbox.asset_id, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
      const {rows: ncCloudAlert} = await testPg.getCloudAlert(ncId, cloudAlertEventNames.NC_COMMANDED_STATE);
      const {rows: cloudAlertDetail} = await testPg.getCloudAlertDetail(rowbox.asset_id, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
      const {rows: cloudEventLogs} = await testPg.getCloudEventLog(rowbox.asset_id, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
      expect(cloudAlerts?.length == 1).to.equal(testcase.alertExist);
      expect(ncCloudAlert?.length == 0).to.equal(true);
      expect(cloudEventLogs?.length == 1).to.equal(testcase.alertExist && !testcase.preTestAlertExist);
      expect(cloudAlertDetail?.length).to.equal(0);
      if (testcase.alertExist) {
        expect(cloudAlerts[0].title).to.equal(testcase.expectedAlertTitle);
      }
    });
  }
});

describe("older event ID is not allowed in redis stream", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    resetSqsUrlCache();
  });

  const getWhen = (subtractMin) => {
    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000) - (subtractMin ? subtractMin * 60 : 0),
      nanos: 0,
    };
    return when;
  };

  const getRackHistObj = (currentAngle, requestedAngle, trackingMode, when, trackStatus) => {
    return {
      snap_addr: rowbox.snap_addr,
      timestamp: moment(when.seconds * 1000).format(), // converting second to millisecond accurate
      data: {
        "rack.current_angle": currentAngle,
        "rack.requested_angle": requestedAngle,
        "tracking.mode": trackingMode,
        "tracking.mode_detail": 0,
        "asset.panel_index": 16,
        "asset.panel_commanded_state": panelCommandState.NONE,
        "asset.tracking_status": trackStatus || trackingStatus.TRACKING_ONLY,
        "motor.current": 1.5
      }
    }
  };
  //ERR The ID specified in XADD is equal or smaller than the target stream top item
  it('event id in redis stream should be a greater value than the records already in the stream', async () => {

    const rack1 = getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(15));
    const rack2 = getRackHistObj(1, 2, trackingModes.TRACKING, getWhen(16));
    // Inserting a rack hist record in redis cache with more recent epoch time
    const resp1 = await remoteCache.insertRackHist(rack1, null, false);
    // Inserting a rack hist record with older epoch time
    const resp2 = await remoteCache.insertRackHist(rack2, null, false);
    // Older record will not be added to stream, because a more recent eventID already exists in stream
    const cacheData = await remoteCache.getRackHist(rowbox.snap_addr, getWhen(17).seconds * 1000, getWhen(14).seconds * 1000)
    console.log("RESP: ", resp1, resp2);
    console.log("CACHE DATA: ", cacheData);
    expect(resp1).to.includes(getWhen(15).seconds + '000');
    expect(resp2).to.equal(undefined);
    expect(cacheData.length).to.equal(1);
  });
});

describe("older event ID is not allowed in redis stream bulk insert", () => {

  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    resetSqsUrlCache();
  });

  const getWhen = (subtractMin) => {
    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000) - (subtractMin ? subtractMin * 60 : 0),
      nanos: 0,
    };
    return when;
  };

  const getRackHistObj = (currentAngle, requestedAngle, trackingMode, when, trackStatus) => {
    return {
      snap_addr: rowbox.snap_addr,
      timestamp: moment(when.seconds * 1000).format(), // converting second to millisecond accurate
      data: {
        "rack.current_angle": currentAngle,
        "rack.requested_angle": requestedAngle,
        "tracking.mode": trackingMode,
        "tracking.mode_detail": 0,
        "asset.panel_index": 16,
        "asset.panel_commanded_state": panelCommandState.NONE,
        "asset.tracking_status": trackStatus || trackingStatus.TRACKING_ONLY,
        "motor.current": 1.5
      }
    }
  };
  //ERR The ID specified in XADD is equal or smaller than the target stream top item (Bulk Insertion)
  it('in bulk insertion, if already existing id is greater or equal it should log array of warnings', async () => {

    const rack1 = getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(15));
    const rack2 = getRackHistObj(1, 2, trackingModes.TRACKING, getWhen(16));
    const rack3 = getRackHistObj(1, 2, trackingModes.TRACKING, getWhen(17));
    const logSpy = sinon.spy(console, 'warn');
    // Inserting a rack hist record in redis cache with more recent epoch time
    await remoteCache.insertStreamMulti(`stream:${rowbox.snap_addr}:rack_angle`, [rack1, rack2, rack3], 100);
    expect(logSpy.called).to.be.true;
    expect(logSpy.firstCall.args[0]).to.equal('Multi Insertion Warning:');
    expect(logSpy.firstCall.args[1]).to.equal(redisStreamErrorString.XADD_ID_EQUAL_OR_SMALLER);
    expect(logSpy.secondCall.args[0]).to.equal('Multi Insertion Warning:');
    expect(logSpy.secondCall.args[1]).to.equal(redisStreamErrorString.XADD_ID_EQUAL_OR_SMALLER);

  });
});

describe("when asset is in local error", () => {
  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
    await testPg.deleteFasttrak(rowbox.snap_addr);
    await testPg.insertFasttrak(rowbox.snap_addr, trackingStatus.TRACKING_ONLY);// Main reason behind failure of test cases was the unavailability of fasttrak data
    await testPg.deleteAssetHistoryBySnapAddr(rowbox.snap_addr);
    await testPg.delCloudEventLog(rowbox.asset_id);
    await testPg.delCloudAlert(rowbox.asset_id);
    await testPg.updateAsset(rowbox.asset_id, {
      asset_type: 0
    });
    resetSqsUrlCache();
  });

  const getAngleUpdObj = (currentAngle, requestedAngle, trackingMode, when) => {
    return {
      currentAngle,
      requestedAngle,
      trackingStatus: trackingStatus.TRACKING_ONLY,
      when,
      commandedState: trackingMode,
      commandedStateDetail: 0,
      panelIndex: 16,
      panelCommandState: panelCommandState.NONE,
      motorCurrent: 1.5
    }
  };

  const getRackHistObj = (currentAngle, requestedAngle, trackingMode, when, trackStatus) => {
    return {
      rack_id: rowbox.rack_id,
      snap_addr: rowbox.snap_addr,
      current_angle: currentAngle,
      requested_angle: requestedAngle,
      tracking_status: trackStatus || trackingStatus.TRACKING_ONLY,
      timestamp: moment(when.seconds * 1000).format(), // converting second to millisecond accurate
      commanded_state: trackingMode,
      commanded_state_detail: 0,
      panel_index: 16,
      panel_commanded_state: panelCommandState.NONE,
      motor_current: 1.5
    }
  };

  const getWhen = (subtractMin) => {
    const date = new Date();
    const when = {
      seconds: Math.floor(date.getTime() / 1000) - (subtractMin ? subtractMin * 60 : 0),
      nanos: 0,
    };
    return when;
  };

  const projectSettings = {
    ml_current_angle: false,
    anomaly_row_not_moving: true,
    anomaly_row_not_moving_duration: 10,
    anomaly_row_not_moving_angle_threshold: 0.5,
    anomaly_row_not_following: true,
    anomaly_row_not_following_duration: 10,
    anomaly_row_not_following_clear_angle_threshold: 1,
    anomaly_row_not_following_angle_threshold: 10
  };

  const testCases = [{
    name: "Row not moving in tracking mode",
    projectSetting: null,
    preReqRackData: [
      getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(15)),
      getRackHistObj(0, 1, trackingModes.TRACKING, getWhen(10))
    ],
    angleUpdate: getAngleUpdObj(0, 1, trackingModes.TRACKING, getWhen(5)),
    alertExist: false,
    duration: projectSettings.anomaly_row_not_moving_duration,
  }];


  for (const testcase of testCases) {

    it(testcase.name, async () => {
      await testPg.insertCloudAlert({
        asset_id: rowbox.asset_id,
        created: moment().format(),
        type: 2,
        event_name: LOCAL_ERRORS[5],
        message: 'test',
        active: true,
        title: 'Low Battery Auto Stow',
        levelno: 20
      });
      const notificationPayload = {
        notificationType: testcase.notificationType,
        snapAddr: rowbox.snap_addr,
        params: {
          rowNo: 1,
          duration: testcase.duration,
          alertCleared: testcase.alertCleared || false
        }
      };
      await testPg.updateProjectById(site.project_id, testcase.projectSetting || projectSettings);
      await testPg.updateAsset(rowbox.asset_id, {active: true});
      for (const rec of testcase.preReqRackData) {
        const upd = {
          timestamp: rec.timestamp,
          snap_addr: rowbox.snap_addr,
          data: {
            "rack.current_angle": rec.current_angle,
            "rack.requested_angle": rec.requested_angle,
            "tracking.mode": rec.commanded_state,
            "tracking.mode_detail": rec.commanded_state_detail,
            "asset.panel_index": rec.panel_index,
            "asset.panel_commanded_state": rec.panel_command_state,
            "asset.tracking_status": rec.tracking_status,
            "motor.current": rec.motor_current,
          }
        };
        await testPg.insertRackHist(upd);
      }

      // Setting last_updated to an older time, so that in lambda,
      // it can update rack entry again
      const rackOldTimestamp = moment(getWhen(20).seconds * 1000).utc().format();
      await testPg.updateRack(rowbox.snap_addr, {
        current_angle: null,
        requested_angle: null,
        commanded_state: null,
        tracking_status: null,
        commanded_state_detail: null,
        motor_current: null,
        panel_index: null,
        panel_commanded_state: null,
        last_updated: rackOldTimestamp
      });

      const angleUpdate = testcase.angleUpdate;

      await testPg.updateFasttrak(rowbox.snap_addr, {
        tracking_status: angleUpdate.trackingStatus,
        last_updated: new Date((angleUpdate.when.seconds - 1500) * 1000),
        start_time: new Date((angleUpdate.when.seconds - 1500) * 1000),
        end_time: null,
        plus60_complete: false,
        minus60_complete: false,
        current_state: null,
        max_peak_motor_inrush_current: 8.5,
        max_peak_motor_current: 6.5,
        max_average_motor_current: 4.0,
      });

      const rackAngles = {
        tcSnapAddr: rowbox.snap_addr_b64,
        angles: [angleUpdate]
      };

      const scopeQueueURL = mockSqsGetQueueUrl(AwsConfig.notificationQueueName);
      const scopeSendMessage = mockSqsPublishMsg(notificationPayload, AwsConfig.notificationQueueName);

      const result = await testBase.invokeLambda({rackAngles: [rackAngles]});
      expect(result).to.equal(true);
      expect(scopeQueueURL.isDone()).to.equal(false);
      expect(scopeSendMessage.isDone()).to.equal(false);

      const {rows: cloudAlerts} = await testPg.getCloudAlert(rowbox.asset_id, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
      const {rows: cloudEventLogs} = await testPg.getCloudEventLog(rowbox.asset_id, cloudAlertEventNames.ROW_NOT_TRACKING_ANOMALY);
      expect(cloudAlerts?.length == 1).to.equal(false);
      expect(cloudEventLogs?.length == 1).to.equal(false);
    });
  }
});
