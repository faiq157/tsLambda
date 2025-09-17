const testBase = require("./common/testBase");
const testPg = require("./common/testPg");
const { site, createConfigUpdate, firmware, hardware } = require("./common/testData");
const chai = require("chai");
const {
  verifyAsset,
  verifyAssetConfig,
  verifyRowControllerConfigHistory,
  verifyDbRow
} = require("./common/dbVerify");
const { getDeviceTypeIdFromAssetType, assetTypes } = require("../utils/constants");
const pg = require("../utils/lib/pg");

const { expect } = chai;

const getRandomNumberInRange = (min, max) => {
  // Generate a random number between min (inclusive) and max (inclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


describe("ConfigUpdates ", () => {

  beforeEach(async () => {
    await testBase.init();
  });

  const dataObj = {
    firmwareRev: 35,
    stmRev: '3.5',
    radioRev: '2.8.3',
    scriptRev: '1.8',
    batteryRev: '2.3',
    batteryFlashRev: '2.1'
  };

  const ncData = {
    ...dataObj,
    macAddress: '00:11:22:33:44:55'
  };
  const ncExpectedData = {
    ...dataObj,
    macAddress: '00:11:22:33:44:55'
  };

  const assetData = {
    ...dataObj,
    macAddress: undefined
  };

  const assetExpectedData = {
    ...dataObj,
    mac_address: undefined
  };

  const configUpdatesTestCases = [{
    name: "Row",
    asset: site.rowBoxes[0],
    data: assetData,
    expectedData: assetExpectedData
  }, {
    name: "Weather Station",
    asset: site.weatherStations[0],
    data: assetData,
    expectedData: assetExpectedData
  }, {
    name: "Network Controller",
    asset: site,
    data: ncData,
    expectedData: ncExpectedData
  }, {
    name: "Row",
    asset: site.rowBoxes[1],
    newAsset: true,
    data: assetData,
    expectedData: assetExpectedData
  }, {
    name: "When only stmRev",
    asset: site.rowBoxes[0],
    data: {
      stmRev: '3.1',
      batteryRev: '',
      scriptRev: '',
      radioRev: ''
    },
    expectedData: {
      batteryRev: null,
      scriptRev: null,
      radioRev: null,
      stmRev: '3.1'
    }
  }, {
    name: "When only radioRev",
    asset: site.rowBoxes[0],
    db: {
      stmRev: '3.1'
    },
    data: {
      radioRev: '2.8.3',
      batteryRev: '',
      scriptRev: '',
      stmRev: ''
    },
    expectedData: {
      batteryRev: null,
      scriptRev: null,
      stmRev: '3.1',
      radioRev: '2.8.3'
    }
  }, {
    name: "When only scriptRev",
    asset: site.rowBoxes[0],
    db: {
      stmRev: '3.1',
      radioRev: '2.8.3'
    },
    data: {
      scriptRev: '1.8',
      batteryRev: '',
      radioRev: '',
      stmRev: ''
    },
    expectedData: {
      batteryRev: null,
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8'
    }
  }, {
    name: "When only batteryRev",
    asset: site.rowBoxes[0],
    db: {
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8'
    },
    data: {
      batteryRev: '2.2',
      scriptRev: '',
      radioRev: '',
      stmRev: ''
    },
    expectedData: {
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8',
      batteryRev: '2.2'
    }
  }, {
    name: "When only batteryFlashRev",
    asset: site.rowBoxes[0],
    db: {
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8',
      batteryRev: '2.2'
    },
    data: {
      batteryFlashRev: '2.0',
      batteryRev: '',
      scriptRev: '',
      radioRev: '',
      stmRev: ''
    },
    expectedData: {
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8',
      batteryRev: '2.2',
      batteryFlashRev: '2.0'
    }
  }, {
    name: "When only configVersion is changed",
    asset: site.rowBoxes[0],
    db: {
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8',
      batteryRev: '2.2',
      batteryFlashRev: '2.0'
    },
    data: {
      configLabel: 'Factory A',
      batteryFlashRev: '',
      batteryRev: '',
      scriptRev: '',
      radioRev: '',
      stmRev: ''
    },
    expectedData: {
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8',
      batteryRev: '2.2',
      batteryFlashRev: '2.0',
      configLabel: 'Factory A'
    }
  }];

  for (const testcase of configUpdatesTestCases) {
    it(testcase.name, async () => {
      const { asset, data, db, expectedData } = testcase;

      await testPg.delRowControllerConfigHistory(asset.asset_id);
      await testPg.removeAssetHistoryBySnapAddr(asset.snap_addr);
      await testPg.removeAssetConfig(asset.snap_addr);

      if (testcase.newAsset) {
        await testBase.removeAsset(asset.snap_addr, asset.asset_id);
      } else {
        await testPg.updateAsset(asset.asset_id, {
          location_lat: null,
          location_lng: null,
          location_text: null,
          raw_hardware_rev: null,
          raw_firmware_rev: null,
          hardware_rev_id: null,
          firmware_rev_id: null,
          has_weather_sensor: null,
          device_type_id: null,
          asset_type: null,
          stm_rev: db?.stmRev || null,
          radio_rev: db?.radioRev || null,
          script_rev: db?.scriptRev || null,
          battery_rev: db?.batteryRev || null,
          battery_flash_rev: db?.batteryFlashRev || null,
          nc_mac: null,
          config_version: db?.configLabel || null
        });
      }

      const configUpdate = {
        ...createConfigUpdate(asset),
        ...data
      }

      const configUpdates = [configUpdate];
      const result = await testBase.invokeLambda({
        configUpdates
      });

      expect(result).to.equal(true);

      await verifyAsset({
        location_lat: configUpdate.locationLat,
        location_lng: configUpdate.locationLng,
        location_text: configUpdate.locationText,
        raw_hardware_rev: parseInt(configUpdate.hardwareRev),
        raw_firmware_rev: parseInt(configUpdate.firmwareRev),
        hardware_rev_id: hardware[configUpdate.hardwareRev],
        firmware_rev_id: firmware[configUpdate.firmwareRev],
        has_weather_sensor: asset.assetType === assetTypes.ASSET_TYPE_WS,
        device_type_id: getDeviceTypeIdFromAssetType(asset.assetType).toLowerCase(),
        asset_type: asset.assetType,
        stm_rev: expectedData.stmRev,
        radio_rev: expectedData.radioRev,
        script_rev: expectedData.scriptRev,
        battery_rev: expectedData.batteryRev,
        battery_flash_rev: expectedData.batteryFlashRev,
        nc_mac: expectedData.macAddress,
        config_version: expectedData.configLabel || configUpdate.configLabel
      }, asset);

      const {rows: assetHist} = await testPg.getAssetHistoryBySnapAddr(asset.snap_addr);
      expect(assetHist[0].data).to.includes({
        "asset.raw_hardware_rev": parseInt(configUpdate.hardwareRev),
        "asset.raw_firmware_rev": parseInt(configUpdate.firmwareRev),
        "asset.stm_rev": data.stmRev,
        "asset.radio_rev": data.radioRev,
        "asset.script_rev": data.scriptRev,
        "asset.battery_rev": data.batteryRev,
        "asset.battery_flash_rev": data.batteryFlashRev || ''
      });

      await verifyAssetConfig({
        config_label: configUpdate.configLabel,
        config_timestamp: configUpdate.configTimestamp
      }, asset);
      // if (asset.assetType !== assetTypes.ASSET_TYPE_NC) {
      await verifyRowControllerConfigHistory({
        config_label: configUpdate.configLabel,
        config_timestamp: configUpdate.configTimestamp
      }, asset);
      // }
    });
  }
});

describe("ConfigUpdates test for firmware values should not update on falsy values", () => {

  beforeEach(async () => {
    await testBase.init();
  });

  const configUpdatesTestCases = [{
    name: "Network Controller",
    asset: site,
    data: {
      stmRev: null,
      radioRev: '',
      scriptRev: '',
      batteryRev: null,
      batteryFlashRev: null,
      macAddress: ''
    },

    verificationData: {
      stm_rev: '3.0',
      radio_rev: 'RF220-2.8.1',
      script_rev: '1.7',
      battery_rev: '2.2',
      battery_flash_rev: '2.0',
      nc_mac: '00:11:22:33:44:55'
    }
  }];

  for (const testcase of configUpdatesTestCases) {
    it(testcase.name, async () => {
      const { asset, data, verificationData } = testcase;
      await testPg.updateAsset(asset.asset_id, {
        stm_rev: verificationData.stm_rev,
        radio_rev: verificationData.radio_rev,
        script_rev: verificationData.script_rev,
        battery_rev: verificationData.battery_rev,
        battery_flash_rev: verificationData.battery_flash_rev,
        nc_mac: verificationData.nc_mac,
      });

      const configUpdate = {
        ...createConfigUpdate(asset),
        ...data
      }

      const configUpdates = [configUpdate];
      const result = await testBase.invokeLambda({
        configUpdates
      });

      expect(result).to.equal(true);

      await verifyDbRow(() => pg.getAssetBySnapAddr(asset.snap_addr), verificationData);
    });
  }
});


describe("ConfigUpdates test for firmware values should not update on same values ", () => {

  beforeEach(async () => {
    await testBase.init();
  });

  const configUpdatesTestCases = [{
    name: "When only configVersion is changed",
    asset: site.rowBoxes[0],
    db: {
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8',
      batteryRev: '2.2',
      batteryFlashRev: '2.0'
    },
    data: {
      configLabel: 'Factory A',
      batteryFlashRev: '',
      batteryRev: '',
      scriptRev: '',
      radioRev: '',
      stmRev: '',
      segments0PanelArrayWidth: 0,
      segments0SpacingToEast: 0,
      segments0SpacingToWest: 0,
      segments0DeltaHeightEast: 0,
      segments0DeltaHeightWest: 0,
      segments1PanelArrayWidth: 0,
      segments1SpacingToEast: 0,
      segments1SpacingToWest: 0,
      segments1DeltaHeightEast: 0,
      segments1DeltaHeightWest: 0,
      presetAngles0PresetAngle: 0,
      presetAngles0NearestEnabled: false,
      presetAngles1PresetAngle: 0,
      presetAngles1NearestEnabled: false,
      presetAngles2PresetAngle: 0,
      presetAngles2NearestEnabled: false,
      presetAngles3PresetAngle: 0,
      presetAngles3NearestEnabled: false,
      presetAngles4PresetAngle: 0,
      presetAngles4NearestEnabled: false,
      presetAngles5PresetAngle: 0,
      presetAngles5NearestEnabled: false,
      presetAngles6PresetAngle: 0,
      presetAngles6NearestEnabled: false,
      presetAngles7PresetAngle: 0,
      presetAngles7NearestEnabled: false,
      presetAngles8PresetAngle: 0,
      presetAngles8NearestEnabled: false,
      presetAngles9PresetAngle: 0,
      presetAngles9NearestEnabled: false,
      presetAngles10PresetAngle: 0,
      presetAngles10NearestEnabled: false,
      presetAngles11PresetAngle: 0,
      presetAngles11NearestEnabled: false,
      presetAngles12PresetAngle: 0,
      presetAngles12NearestEnabled: false,
      presetAngles13PresetAngle: 0,
      presetAngles13NearestEnabled: false,
      presetAngles14PresetAngle: 0,
      presetAngles14NearestEnabled: false,
      presetAngles15PresetAngle: 0,
      presetAngles15NearestEnabled: false,
      tracking_min_angle: 0,
      tracking_max_angle: 60,
      dynamic_min_angle: 0,
      dynamic_max_angle: 60,
      simulation_flags: 1,
      heater_k: 5,
      preheating_battery_threshold: 10,
      preheating_temperature_threshold: 5,
      snow_shedding_deadband_angle: 40,
      snow_shedding_duration: 10,
      autoshed_temperature_threshold: 10,
      autoshed_minutes_threshold: 10,
      autoshed_battery_threshold: 10,
      lbas_entry_threshold: 10,
      lbas_exit_threshold: 10,
      median_filter_length: 10,
      wxDataRecordFrequency: 60, // secs
    },
    expectedData: {
      stmRev: '3.1',
      radioRev: '2.8.3',
      scriptRev: '1.8',
      batteryRev: '2.2',
      batteryFlashRev: '2.0',
      configLabel: 'Factory A'
    }
  }];

  for (const testcase of configUpdatesTestCases) {
    it(testcase.name, async () => {
      const { asset, data, db, expectedData } = testcase;

      await testPg.delRowControllerConfigHistory(asset.asset_id);
      await testPg.removeAssetHistoryBySnapAddr(asset.snap_addr);
      await testPg.removeAssetConfig(asset.snap_addr);
      if (testcase.newAsset) {
        await testBase.removeAsset(asset.snap_addr, asset.asset_id);
      } else {
        await testPg.updateAsset(asset.asset_id, {
          location_lat: null,
          location_lng: null,
          location_text: null,
          raw_hardware_rev: null,
          raw_firmware_rev: null,
          hardware_rev_id: null,
          firmware_rev_id: null,
          has_weather_sensor: null,
          device_type_id: null,
          asset_type: null,
          stm_rev: db?.stmRev || null,
          radio_rev: db?.radioRev || null,
          script_rev: db?.scriptRev || null,
          battery_rev: db?.batteryRev || null,
          battery_flash_rev: db?.batteryFlashRev || null,
          nc_mac: null,
          config_version: db?.configLabel || null
        });
      }

      // adding a random wxDataRecordFrequency so that we can verify that after test complition  
      data.wxDataRecordFrequency  = getRandomNumberInRange(1,60)

      const configUpdate = {
        ...createConfigUpdate(asset),
        ...data
      }
      let tempConfig = configUpdate;
      tempConfig.segments0PanelArrayWidth = data.segments0PanelArrayWidth;
      tempConfig.segments0SpacingToEast = data.segments0SpacingToEast;
      tempConfig.segments0SpacingToWest = data.segments0SpacingToWest;
      tempConfig.segments0DeltaHeightEast = data.segments0DeltaHeightEast;
      tempConfig.segments0DeltaHeightWest = data.segments0DeltaHeightWest;
      tempConfig.segments1PanelArrayWidth = data.segments1PanelArrayWidth;
      tempConfig.segments1SpacingToEast = data.segments1SpacingToEast;
      tempConfig.segments1SpacingToWest = data.segments1SpacingToWest;
      tempConfig.segments1DeltaHeightEast = data.segments1DeltaHeightEast;
      tempConfig.segments1DeltaHeightWest = data.segments1DeltaHeightWest;
      tempConfig.presetAngles0PresetAngle = data.presetAngles0PresetAngle;
      tempConfig.presetAngles0NearestEnabled = data.presetAngles0NearestEnabled;
      tempConfig.presetAngles1PresetAngle = data.presetAngles1PresetAngle;
      tempConfig.presetAngles1NearestEnabled = data.presetAngles1NearestEnabled;
      tempConfig.presetAngles2PresetAngle = data.presetAngles2PresetAngle;
      tempConfig.presetAngles2NearestEnabled = data.presetAngles2NearestEnabled;
      tempConfig.presetAngles3PresetAngle = data.presetAngles3PresetAngle;
      tempConfig.presetAngles3NearestEnabled = data.presetAngles3NearestEnabled;
      tempConfig.presetAngles4PresetAngle = data.presetAngles4PresetAngle;
      tempConfig.presetAngles4NearestEnabled = data.presetAngles4NearestEnabled;
      tempConfig.presetAngles5PresetAngle = data.presetAngles5PresetAngle;
      tempConfig.presetAngles5NearestEnabled = data.presetAngles5NearestEnabled;
      tempConfig.presetAngles6PresetAngle = data.presetAngles6PresetAngle;
      tempConfig.presetAngles6NearestEnabled = data.presetAngles6NearestEnabled;
      tempConfig.presetAngles7PresetAngle = data.presetAngles7PresetAngle;
      tempConfig.presetAngles7NearestEnabled = data.presetAngles7NearestEnabled;
      tempConfig.presetAngles8PresetAngle = data.presetAngles8PresetAngle;
      tempConfig.presetAngles8NearestEnabled = data.presetAngles8NearestEnabled;
      tempConfig.presetAngles9PresetAngle = data.presetAngles9PresetAngle;
      tempConfig.presetAngles9NearestEnabled = data.presetAngles9NearestEnabled;
      tempConfig.presetAngles10PresetAngle = data.presetAngles10PresetAngle;
      tempConfig.presetAngles10NearestEnabled = data.presetAngles10NearestEnabled;
      tempConfig.presetAngles11PresetAngle = data.presetAngles11PresetAngle;
      tempConfig.presetAngles11NearestEnabled = data.presetAngles11NearestEnabled;
      tempConfig.presetAngles12PresetAngle = data.presetAngles12PresetAngle;
      tempConfig.presetAngles12NearestEnabled = data.presetAngles12NearestEnabled;
      tempConfig.presetAngles13PresetAngle = data.presetAngles13PresetAngle;
      tempConfig.presetAngles13NearestEnabled = data.presetAngles13NearestEnabled;
      tempConfig.presetAngles14PresetAngle = data.presetAngles14PresetAngle;
      tempConfig.presetAngles14NearestEnabled = data.presetAngles14NearestEnabled;
      tempConfig.presetAngles15PresetAngle = data.presetAngles15PresetAngle;
      tempConfig.presetAngles15NearestEnabled = data.presetAngles15NearestEnabled;
      tempConfig.tracking_min_angle = data.tracking_min_angle;
      tempConfig.tracking_max_angle = data.tracking_max_angle;
      tempConfig.dynamic_min_angle = data.dynamic_min_angle;
      tempConfig.dynamic_max_angle = data.dynamic_max_angle;
      tempConfig.simulation_flags = data.simulation_flags;
      tempConfig.heater_k = data.heater_k;
      tempConfig.preheating_battery_threshold = data.preheating_battery_threshold;
      tempConfig.preheating_temperature_threshold = data.preheating_temperature_threshold;
      tempConfig.snow_shedding_deadband_angle = data.snow_shedding_deadband_angle;
      tempConfig.snow_shedding_duration = data.snow_shedding_duration;
      tempConfig.auto_shedding_temperature_threshold = data.auto_shedding_temperature_threshold;
      tempConfig.auto_shedding_countdown_minutes = data.auto_shedding_countdown_minutes;
      tempConfig.auto_shedding_battery_threshold = data.auto_shedding_battery_threshold;
      tempConfig.low_battery_auto_stow_threshold = data.low_battery_auto_stow_threshold;
      tempConfig.low_battery_auto_stow_exit_threshold = data.low_battery_auto_stow_exit_threshold;
      tempConfig.median_filter_length = data.median_filter_length;
      await testPg.updateAssetConf(tempConfig);

      const configUpdates = [configUpdate];

      console.log("INPUT: ", configUpdates);
      const result = await testBase.invokeLambda({
        configUpdates
      });
      expect(result).to.equal(true);

      await verifyAsset({
        location_lat: configUpdate.locationLat,
        location_lng: configUpdate.locationLng,
        location_text: configUpdate.locationText,
        raw_hardware_rev: parseInt(configUpdate.hardwareRev),
        raw_firmware_rev: parseInt(configUpdate.firmwareRev),
        hardware_rev_id: hardware[configUpdate.hardwareRev],
        firmware_rev_id: firmware[configUpdate.firmwareRev],
        has_weather_sensor: asset.assetType === assetTypes.ASSET_TYPE_WS,
        device_type_id: getDeviceTypeIdFromAssetType(asset.assetType).toLowerCase(),
        asset_type: asset.assetType,
        stm_rev: expectedData.stmRev,
        radio_rev: expectedData.radioRev,
        script_rev: expectedData.scriptRev,
        battery_rev: expectedData.batteryRev,
        battery_flash_rev: expectedData.batteryFlashRev,
        nc_mac: expectedData.macAddress,
        config_version: expectedData.configLabel || configUpdate.configLabel
      }, asset);

      const {rows: assetHist} = await testPg.getAssetHistoryBySnapAddr(asset.snap_addr);
      expect(assetHist[0].data).to.includes({
        "asset.raw_hardware_rev": parseInt(configUpdate.hardwareRev),
        "asset.raw_firmware_rev": parseInt(configUpdate.firmwareRev),
        "asset.stm_rev": data.stmRev,
        "asset.radio_rev": data.radioRev,
        "asset.script_rev": data.scriptRev,
        "asset.battery_rev": data.batteryRev,
        "asset.battery_flash_rev": data.batteryFlashRev || ''
      });
      await verifyAssetConfig({
        config_label: configUpdate.configLabel,
        config_timestamp: configUpdate.configTimestamp
      }, asset);

      const { rows: assetConfig } = await testPg.getAssetConfig(asset.snap_addr);
      const { rows: rowControllerConfig} = await testPg.getRowControllerConfig(asset.asset_id);
      
      expect(assetConfig[0].wx_data_record_frequency).to.be.equal(data.wxDataRecordFrequency)
      expect(rowControllerConfig[0].wx_data_record_frequency).to.be.equal(data.wxDataRecordFrequency)
    
    });
  }
});
