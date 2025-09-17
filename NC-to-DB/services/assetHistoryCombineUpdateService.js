const {prefixes} = require("../models/asset.history.model");
const {getSnapAddr, evaluateWakeupPOC} = require("../utils/helpers/functions");
const { getContext } = require("../utils/lib/context");
const { getProjectDetailsBySiteId } = require("../models/project.model");
const { getBatteryBySnapAddr } = require("../models/battery.model");
const {insertAssetLastUpdate, getAssetBySnapAddr, getOrCreateAsset} = require("../models/asset.model");
const {getHardwareRev, getFirmwareRev, getAssetConf, compareWithOldInformation} = require("../models/asset.conf.model");
const {addUpdateAssetHistoryCombine} = require("../models/asset.history.model");
const {assetStatus, assetStatusValue, assetStatusValTextMapping} = require("../utils/constants");
const moment = require("moment");
const {snappyHex} = require("../util");

class AssetHistoryCombineUpdateService {

  async combineAssetHistoryInsertion (cloudUpdate, event) {
    const { siteId, snapAddr } = getContext();
    const project = await getProjectDetailsBySiteId(siteId);
    const timeBasedHash = await this.getPayloadToInsertIntoAssetHistory(snapAddr, cloudUpdate, project, event);
    console.log("CLOUD UPDATE TIME BASED HASH: ", JSON.stringify(timeBasedHash));
    let assetSnapAddr = null;
    for (const key in timeBasedHash) {
      const payload = timeBasedHash[key];
      assetSnapAddr = payload.snap_addr;
      await addUpdateAssetHistoryCombine(payload.snap_addr, payload.timestamp, payload.data);
    }
    // If this is not an update for RC/WS, then do not push lastAssetUpdate
    if (!assetSnapAddr) {
      return;
    }

    const {bool, timestampToAdd} = this.shouldAddLastAssetUpdate(timeBasedHash);
    if (bool) {
      await insertAssetLastUpdate(assetSnapAddr, timestampToAdd);
    }
  }

  shouldAddLastAssetUpdate (timeBasedHash) {
    let bool = false;
    let timestampToAdd = null;
    for (const i of Object.entries(timeBasedHash)) {
      const histObj = i[1];
      const timestamp = i[0];
      const {data} = histObj;
      if (data?.battery || data?.asset?.uptime || data?.asset?.connected_state) {
        bool = true;
        timestampToAdd = !timestampToAdd || (new Date(timestamp) > new Date(timestampToAdd)) ? timestamp : timestampToAdd;
      }
    }
    return {bool, timestampToAdd};
  }

  findLatestTimestamp (eventsTimeArray) {
    if (eventsTimeArray.length > 0) {
      // Convert timestamps to Date objects
      const dateObjects = eventsTimeArray.map(timestamp => new Date(timestamp));
      // Find the maximum date (latest timestamp)
      const latestTimestamp = new Date(Math.max(...dateObjects));
      return latestTimestamp;
    }
  }

  /*
   * EXAMPLE HASH WOULD LOOK LIKE THIS:
   * {
      "2023-10-11T07:16:16+00:00": {
        "snap_addr": "0ac44f",
        "timestamp": "2023-10-11T07:16:16+00:00",
        "data": {
          "battery": {
            "voltage": 13.300000190734863,
            "current": 0,
            "poc": 80,
            "poh": 100,
            "temp": 50.099998474121094,
            "heater_temp": 51.400001525878906,
            "status_bits": 0,
            "wakeup_poc": 80,
            "wakeup_poc_at": "2023-10-11T07:16:16.000Z"
          },
          "asset": {
            "connected": true,
            "status": 5,
            "status_bits": 0,
            "last_reported": "2023-10-11T07:16:16+00:00"
          }
        }
      },
      "2023-10-11T07:16:14+00:00": {
        "snap_addr": "0ac44f",
        "timestamp": "2023-10-11T07:16:14+00:00",
        "data": {
          "motor": {
            "peak_current": 0.009999999776482582,
            "peak_inrush_current": 2.9100000858306885,
            "avg_current": 1.2300000190734863,
            "ending_current": 1.1100000143051147
          },
          "panel": {
            "voltage": 21.899999618530273,
            "current": 0.07999999821186066
          },
          "panel2": {
            "voltage": 0,
            "current": 0
          }
        }
      },
      "2023-10-11T07:16:13+00:00": {
        "snap_addr": "0ac44f",
        "timestamp": "2023-10-11T07:16:13+00:00",
        "data": {
          "asset": {
            "tracking_status": 10,
            "panel_index": 16,
            "panel_commanded_state": 3,
            "temp": 80,
            "uptime": 0
          },
          "tracking": {
            "mode": 4,
            "mode_detail": 0
          },
          "motor": {
            "current": 1.7999999523162842
          },
          "rack": {
            "current_angle": -59.900001525878906,
            "requested_angle": -60
          }
        }
      },
      "2023-10-11T07:16:12+00:00": {
        "snap_addr": "0ac44f",
        "timestamp": "2023-10-11T07:16:12+00:00",
        "data": {
          "asset": {
            "tracking_status": 10,
            "panel_index": 16,
            "panel_commanded_state": 3
          },
          "tracking": {
            "mode": 4,
            "mode_detail": 0
          },
          "motor": {
            "current": 1.7999999523162842
          },
          "rack": {
            "current_angle": -59.900001525878906,
            "requested_angle": -60
          }
        }
      }
    }
   */
  async getPayloadToInsertIntoAssetHistory(ncSnapAddr, upd, project, event) {
    let finalPayload = {};
    finalPayload = await this.getBatteryUpdatePayload(finalPayload, upd, project);
    finalPayload = await this.getMotorUpdatePayload(finalPayload, upd);
    finalPayload = await this.getPanelUpdatePayload(finalPayload, upd);
    finalPayload = await this.getRackUpdatePayload(finalPayload, upd);
    finalPayload = await this.getAssetUpdatePayload(finalPayload, upd);
    finalPayload = await this.getTCUpdatePayload(finalPayload, upd);
    finalPayload = await this.getAssetRestartedPayload(finalPayload, upd);
    finalPayload = await this.getSnowSheddingPayload(finalPayload, upd);
    finalPayload = await this.getTrackingChangesPayload(ncSnapAddr, finalPayload, upd, event);
    finalPayload = await this.getConfigUpdatePayload(finalPayload, upd, event);
    finalPayload = await this.getRadioUpdatePayload(finalPayload, upd);
    finalPayload = await this.getBridgeUpdatePayload(finalPayload, upd);
    finalPayload = await this.getTCHourUpdatePayload(finalPayload, upd);
    finalPayload = await this.getTCDayUpdatePayload(finalPayload, upd);
    finalPayload = await this.getChargerUpdatePayload(finalPayload, upd);

    return finalPayload;
  }

  async getBatteryUpdatePayload(finalPayload, update, project) {
    for (const upd of update.getBatteryUpdatesList()) {
      if (upd.getVoltage() === 0 && upd.getCurrent() === 0 && upd.getCharged() === 0 && upd.getHealth() === 0 &&
        upd.getBattTemp() === 0 && upd.getHeaterTemp() === 0 && upd.getMiscStatusBits() === 0
      ) {
        console.warn("Not inserting battery history. All values are 0.");
        break;
      }
      const snap_addr = getSnapAddr(upd.getTcSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const battery = await getBatteryBySnapAddr(snap_addr);
      if (!battery) {
        console.error(`BatteryUpdateService:: Battery Info doesn't exist against Snap Address: ${snap_addr}`);
        return;
      }
      const wakeupPoc = await evaluateWakeupPOC(upd, project, battery);
      const newWakeupPoc = wakeupPoc.newWakeupPoc;
      const newWakeupPocAt = wakeupPoc.newWakeupPocAt;
      const data = {
        [prefixes.PREFIX_BATTERY]: {
          voltage: upd.getVoltage(),
          current: upd.getCurrent(),
          poc: upd.getCharged(),
          poh: upd.getHealth(),
          temp: upd.getBattTemp(),
          heater_temp: upd.getHeaterTemp(),
          status_bits: upd.getMiscStatusBits(),
          wakeup_poc: newWakeupPoc,
          wakeup_poc_at: newWakeupPocAt
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_BATTERY] = {...finalPayload[timestamp].data[prefixes.PREFIX_BATTERY], ...data[prefixes.PREFIX_BATTERY]};
        break;
      }
      const battUpd = {snap_addr, timestamp, data};
      finalPayload[battUpd.timestamp] = battUpd;
    }
    return finalPayload;
  }

  async getMotorUpdatePayload(finalPayload, update) {
    if (update.getMotorCurrentUpdate()) {
      const upd = update.getMotorCurrentUpdate();
      const snap_addr = getSnapAddr(upd.getSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_MOTOR]: {
          peak_current: upd.getPeakMotorCurrent(),
          peak_inrush_current: upd.getPeakMotorInrushCurrent(),
          avg_current: upd.getAverageMotorCurrent(),
          ending_current: upd.getEndingMotorCurrent()
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_MOTOR] = {...finalPayload[timestamp].data[prefixes.PREFIX_MOTOR], ...data[prefixes.PREFIX_MOTOR]};
        return finalPayload;
      }
      const battUpd = {snap_addr, timestamp, data};
      finalPayload[battUpd.timestamp] = battUpd;
    }
    return finalPayload;
  }

  async getPanelUpdatePayload(finalPayload, update) {
    for (const upd of update.getPanelUpdateList()) {
      const snap_addr = getSnapAddr(upd.getTcSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_PANEL]: {
          voltage: upd.getSolarVoltage(),
          current: upd.getSolarCurrent()
        },
        [prefixes.PREFIX_PANEL2]: {
          voltage: upd.getExternalInput2Voltage(),
          current: upd.getExternalInput2Current()
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_PANEL] = {...finalPayload[timestamp].data[prefixes.PREFIX_PANEL], ...data[prefixes.PREFIX_PANEL]};
        finalPayload[timestamp].data[prefixes.PREFIX_PANEL2] = {...finalPayload[timestamp].data[prefixes.PREFIX_PANEL2], ...data[prefixes.PREFIX_PANEL2]};
        break;
      }
      const battUpd = {snap_addr, timestamp, data};
      finalPayload[battUpd.timestamp] = battUpd;
    }
    return finalPayload;
  }

  async getRackUpdatePayload(finalPayload, update) {
    for (const upd of update.getRackAnglesList()) {
      const snap_addr = getSnapAddr(upd.getTcSnapAddr_asU8());
      for (let angleUpd of upd.getAnglesList()) {
        const timestamp = moment(angleUpd.getWhen().toDate()).format();
        const data = {
          [prefixes.PREFIX_ASSET]: {
            tracking_status: angleUpd.getTrackingStatus(),
            panel_index: angleUpd.getPanelIndex(),
            panel_commanded_state: angleUpd.getPanelCommandState()
          },
          [prefixes.PREFIX_TRACKING]: {
            mode: angleUpd.getCommandedState(),
            mode_detail: angleUpd.getCommandedStateDetail()
          },
          [prefixes.PREFIX_MOTOR]: {
            current: angleUpd.getMotorCurrent()
          },
          [prefixes.PREFIX_RACK]: {
            current_angle: angleUpd.getCurrentAngle(),
            requested_angle: angleUpd.getRequestedAngle()
          }
        };
        if (finalPayload[timestamp]) {
          finalPayload[timestamp].data[prefixes.PREFIX_ASSET] = {...finalPayload[timestamp].data[prefixes.PREFIX_ASSET], ...data[prefixes.PREFIX_ASSET]};
          finalPayload[timestamp].data[prefixes.PREFIX_TRACKING] = {...finalPayload[timestamp].data[prefixes.PREFIX_TRACKING], ...data[prefixes.PREFIX_TRACKING]};
          finalPayload[timestamp].data[prefixes.PREFIX_MOTOR] = {...finalPayload[timestamp].data[prefixes.PREFIX_MOTOR], ...data[prefixes.PREFIX_MOTOR]};
          finalPayload[timestamp].data[prefixes.PREFIX_RACK] = {...finalPayload[timestamp].data[prefixes.PREFIX_RACK], ...data[prefixes.PREFIX_RACK]};
          break;
        }
        const rackUpd = {snap_addr, timestamp, data};
        finalPayload[timestamp] = rackUpd;
      }
    }
    return finalPayload;
  }

  async getAssetUpdatePayload(finalPayload, update) {
    for (const upd of update.getAssetUpdatesList()) {
      const snap_addr = getSnapAddr(upd.getSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_ASSET]: {
          temp: upd.getUnitTemperature(),
          uptime: upd.getUpTime()
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_ASSET] = {...finalPayload[timestamp].data[prefixes.PREFIX_ASSET], ...data[prefixes.PREFIX_ASSET]};
        break;
      }
      const assetUpd = {snap_addr, timestamp, data};
      finalPayload[timestamp] = assetUpd;
    }
    return finalPayload;
  }

  async getAssetRestartedPayload(finalPayload, update) {
    if (update.getAssetRestarted()) {
      const upd = update.getAssetRestarted();
      const snap_addr = getSnapAddr(upd.getSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_ASSET]: {
          uptime: upd.getUpTime(),
          connected_status: 'Asset Restarted'
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_ASSET] = {...finalPayload[timestamp].data[prefixes.PREFIX_ASSET], ...data[prefixes.PREFIX_ASSET]};
        return finalPayload;
      }
      const assetUpd = {snap_addr, timestamp, data};
      finalPayload[timestamp] = assetUpd;
    }
    return finalPayload;
  }

  async getTCUpdatePayload(finalPayload, update) {
    for (const upd of update.getTcUpdatesList()) {
      const snap_addr = getSnapAddr(upd.getTcSnapAddr_asU8());
      const asset = getAssetBySnapAddr(snap_addr);
      const timestamp = moment(upd.getWhen().toDate()).format();

      const {status, connection, lastStatus} = this.evaluateAssetStatus(upd, asset.last_reporting_status);
      const data = {
        [prefixes.PREFIX_ASSET]: {
          connected_state: status,
          status_bits: upd.getStatusBits(),
          [connection]: moment(upd.getLastReported().toDate()).format() // key name would be last_connected or last_disconnected
        }
      };
      if (lastStatus) {
        data[prefixes.PREFIX_ASSET].last_status = lastStatus; // FCS Stop or FCS Start or Unknown Stop or Unknown Start
      }
      if (upd.getAssetStatus() != assetStatusValue.UNKNOWN) {
        data[prefixes.PREFIX_ASSET] = {
          ...data[prefixes.PREFIX_ASSET],
          connected: upd.getAssetStatus() != assetStatusValue.OFFLINE,
          status: upd.getAssetStatus()
        };
        if (upd.getLastReported() != null) {
          data[prefixes.PREFIX_ASSET]['last_reported'] = moment(upd.getLastReported().toDate()).format();
        }
      }
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_ASSET] = {...finalPayload[timestamp].data[prefixes.PREFIX_ASSET], ...data[prefixes.PREFIX_ASSET]};
        break;
      }
      const tcUpd = {snap_addr, timestamp, data};
      finalPayload[tcUpd.timestamp] = tcUpd;
    }
    return finalPayload;
  }

  async getSnowSheddingPayload(finalPayload, update) {
    if (update.getSnowSheddingUpdate()) {
      const upd = update.getSnowSheddingUpdate();
      const assetSnapAddr = getSnapAddr(upd.getSnapAddr_asU8());
      const { snapAddr } = getContext();
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_SNOW_SHEDDING]: {
          depth: upd.getDepth() / 0.0254,
          baseline: upd.getBaseline() / 0.0254,
          snow_on_ground_now: upd.getSnowOnGroundNow() / 0.0254,
          estimate: upd.getEstimate() / 0.0254,
          trigger: upd.getTrigger() / 0.0254,
          threshold: upd.getThreshold() / 0.0254,
          active: upd.getActive(),
          last_snow_shedding: Math.floor(new Date(upd.getTimestamp().toDate()).getTime() / 1000),
          state: upd.getState(),
          asset_snap_addr: assetSnapAddr,
        }
      }
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_SNOW_SHEDDING] = {...finalPayload[timestamp].data[prefixes.PREFIX_SNOW_SHEDDING], ...data[prefixes.PREFIX_SNOW_SHEDDING]};
        return finalPayload;
      }
      const snowShedding = {snap_addr: snapAddr, timestamp, data};
      finalPayload[timestamp] = snowShedding;
    }
    return finalPayload;
  }

  async getTrackingChangesPayload(ncSnapAddr, finalPayload, update, event) {
    const netCtrlResults = event.netCtrlResults;
    const { commanded_state, commanded_state_detail } = netCtrlResults.rows[0];
    for (const upd of update.getTrackingChangesList()) {
      const snap_addr = ncSnapAddr;
      const timestamp = moment(upd.getStateChangedAt().toDate()).format();
      if (upd.getUpdatedState() == commanded_state && commanded_state_detail == upd.getCommandedPreset()) {
        console.log("Both 'Commanded State' & 'Commanded State Detail' are matching with the previous state.");
      }
      const data = {
        [prefixes.PREFIX_TRACKING]: {
          mode: upd.getUpdatedState(),
          mode_detail: upd.getCommandedPreset()
        }
      };
      if (upd.getUserName()) {
        data[prefixes.PREFIX_TRACKING].user_name = upd.getUserName();
      }
      if (upd.getUserEmail()) {
        data[prefixes.PREFIX_TRACKING].user_email = upd.getUserEmail();
      }
      if (upd.getSource()) {
        data[prefixes.PREFIX_TRACKING].source = upd.getSource();
      }
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_TRACKING] = {...finalPayload[timestamp].data[prefixes.PREFIX_TRACKING], ...data[prefixes.PREFIX_TRACKING]};
        break;
      }
      const trackingUpdate = {snap_addr, timestamp, data};
      finalPayload[timestamp] = trackingUpdate;
    }
    return finalPayload;
  }

  async getConfigUpdatePayload(finalPayload, update, event) {
    const netCtrlResults = event.netCtrlResults;
    const { id: net_ctrl_id } = netCtrlResults.rows[0];
    for (const upd of update.getConfigUpdatesList()) {
      const timestamp = moment(upd.getWhen().toDate()).format();
      const snap_addr = getSnapAddr(upd.getSnapAddr_asU8());
      const assetInfo = await getOrCreateAsset(snap_addr, net_ctrl_id);
      let getHardwareRev_res = await getHardwareRev(upd);
      let getFirmwareRev_res = await getFirmwareRev(upd);
      const assetConf = await getAssetConf(upd);
      const isAssetHardwareRevChanged = (getHardwareRev_res?.rows[0]?.id === assetInfo?.hardware_rev_id) ? false : true
      const isAssetFirmwareRevChanged = (getFirmwareRev_res?.rows[0]?.id === assetInfo?.firmware_rev_id) ? false : true
      const data = {};
      if (isAssetHardwareRevChanged || isAssetFirmwareRevChanged || this.isAnyRevVersionChanged(upd, assetInfo)) {
        data[prefixes.PREFIX_ASSET] = {
          stm_rev: upd.getStmRev(),
          radio_rev: upd.getRadioRev(),
          script_rev: upd.getScriptRev(),
          battery_rev: upd.getBatteryRev(),
          nc_mac: upd.getMacAddress(),
          battery_flash_rev: upd.getBatteryFlashRev(),
          config_version: upd.getConfigLabel()
        };
        if (isAssetFirmwareRevChanged) {
          data[prefixes.PREFIX_ASSET].firmware_rev = (parseFloat(upd.getFirmwareRev(), 10) / 10).toFixed(1);
          data[prefixes.PREFIX_ASSET].raw_firmware_rev = parseInt(upd.getFirmwareRev(), 10);
          data[prefixes.PREFIX_ASSET].firmware_rev_id = getFirmwareRev_res?.rows[0]?.id;
        }
        if (isAssetHardwareRevChanged) {
          data[prefixes.PREFIX_ASSET].hardware_rev = (parseFloat(upd.getHardwareRev(), 10) / 10).toFixed(1);
          data[prefixes.PREFIX_ASSET].raw_hardware_rev = parseInt(upd.getHardwareRev(), 10);
          data[prefixes.PREFIX_ASSET].hardware_rev_id = getHardwareRev_res?.rows[0]?.id;
        }
      }
      if (!compareWithOldInformation(assetConf, upd)) {
        data[prefixes.PREFIX_ASSET_CONF] = {
          config_label: upd.getConfigLabel(),
          config_timestamp: upd.getConfigTimestamp().toString(),
          model_device: upd.getModelDevice(),
          location_lat: upd.getLocationLat(),
          location_lng: upd.getLocationLng(),
          location_text: upd.getLocationText(),
          hardware_rev: upd.getHardwareRev(),
          firmware_rev: upd.getFirmwareRev(),
          site_name: upd.getSiteName(),
          panel_horizontal_cal_angle: upd.getPanelHorizontalCalAngle(),
          panel_min_cal_angle: upd.getPanelMinCalAngle(),
          panel_max_cal_angle: upd.getPanelMaxCalAngle(),
          config_flags: upd.getConfigFlags(),
          segments_0_panel_array_width: upd.getSegments0PanelArrayWidth(),
          segments_0_spacing_to_east: upd.getSegments0SpacingToEast(),
          segments_0_spacing_to_west: upd.getSegments0SpacingToWest(),
          segments_0_delta_height_east: upd.getSegments0DeltaHeightEast(),
          segments_0_delta_height_west: upd.getSegments0DeltaHeightWest(),
          segments_1_panel_array_width: upd.getSegments1PanelArrayWidth(),
          segments_1_spacing_to_east: upd.getSegments1SpacingToEast(),
          segments_1_spacing_to_west: upd.getSegments1SpacingToWest(),
          segments_1_delta_height_east: upd.getSegments1DeltaHeightEast(),
          segments_1_delta_height_west: upd.getSegments1DeltaHeightWest(),
          preset_angles_0_preset_angle: upd.getPresetAngles0PresetAngle(),
          preset_angles_0_nearest_enabled: upd.getPresetAngles0NearestEnabled(),
          preset_angles_1_preset_angle: upd.getPresetAngles1PresetAngle(),
          preset_angles_1_nearest_enabled: upd.getPresetAngles1NearestEnabled(),
          preset_angles_2_preset_angle: upd.getPresetAngles2PresetAngle(),
          preset_angles_2_nearest_enabled: upd.getPresetAngles2NearestEnabled(),
          preset_angles_3_preset_angle: upd.getPresetAngles3PresetAngle(),
          preset_angles_3_nearest_enabled: upd.getPresetAngles3NearestEnabled(),
          preset_angles_4_preset_angle: upd.getPresetAngles4PresetAngle(),
          preset_angles_4_nearest_enabled: upd.getPresetAngles4NearestEnabled(),
          preset_angles_5_preset_angle: upd.getPresetAngles5PresetAngle(),
          preset_angles_5_nearest_enabled: upd.getPresetAngles5NearestEnabled(),
          preset_angles_6_preset_angle: upd.getPresetAngles6PresetAngle(),
          preset_angles_6_nearest_enabled: upd.getPresetAngles6NearestEnabled(),
          preset_angles_7_preset_angle: upd.getPresetAngles7PresetAngle(),
          preset_angles_7_nearest_enabled: upd.getPresetAngles7NearestEnabled(),
          preset_angles_8_preset_angle: upd.getPresetAngles8PresetAngle(),
          preset_angles_8_nearest_enabled: upd.getPresetAngles8NearestEnabled(),
          preset_angles_9_preset_angle: upd.getPresetAngles9PresetAngle(),
          preset_angles_9_nearest_enabled: upd.getPresetAngles9NearestEnabled(),
          preset_angles_10_preset_angle: upd.getPresetAngles10PresetAngle(),
          preset_angles_10_nearest_enabled: upd.getPresetAngles10NearestEnabled(),
          preset_angles_11_preset_angle: upd.getPresetAngles11PresetAngle(),
          preset_angles_11_nearest_enabled: upd.getPresetAngles11NearestEnabled(),
          preset_angles_12_preset_angle: upd.getPresetAngles12PresetAngle(),
          preset_angles_12_nearest_enabled: upd.getPresetAngles12NearestEnabled(),
          preset_angles_13_preset_angle: upd.getPresetAngles13PresetAngle(),
          preset_angles_13_nearest_enabled: upd.getPresetAngles13NearestEnabled(),
          preset_angles_14_preset_angle: upd.getPresetAngles14PresetAngle(),
          preset_angles_14_nearest_enabled: upd.getPresetAngles14NearestEnabled(),
          preset_angles_15_preset_angle: upd.getPresetAngles15PresetAngle(),
          preset_angles_15_nearest_enabled: upd.getPresetAngles15NearestEnabled(),
          swoc_required_duration: upd.getSwocRequiredDuration(),
          swoc_threshold: upd.getSwocThreshold(),
          encoded_hard_limit_register: upd.getEncodedHardLimitRegister(),
          encoded_soft_limit_register: upd.getEncodedSoftLimitRegister(),
          snow_sensor_height: upd.getSnowSensorHeight(),
          wind_dir_offset: upd.getWindDirOffset(),
          tracking_min_angle: upd.getTrackingMinAngle(),
          tracking_max_angle: upd.getTrackingMaxAngle(),
          dynamic_min_angle: upd.getDynamicMinAngle(),
          dynamic_max_angle: upd.getDynamicMaxAngle(),
          simulation_flags: upd.getSimulationFlags(),
          heater_k: upd.getHeaterK(),
          preheating_battery_threshold: upd.getPreheatingBatteryThreshold(),
          preheating_temperature_threshold: upd.getPreheatingTemperatureThreshold(),
          snow_shedding_deadband_angle: upd.getSnowSheddingDeadbandAngle(),
          snow_shedding_duration: upd.getSnowSheddingDuration(),
          autoshed_temperature_threshold: upd.getAutoshedTemperatureThreshold(),
          autoshed_minutes_threshold: upd.getAutoshedMinutesThreshold(),
          autoshed_battery_threshold: upd.getAutoshedBatteryThreshold(),
          lbas_entry_threshold: upd.getLbasEntryThreshold(),
          lbas_exit_threshold: upd.getLbasExitThreshold()
        }
      }
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_ASSET_CONF] = {...finalPayload[timestamp].data[prefixes.PREFIX_ASSET_CONF], ...data[prefixes.PREFIX_ASSET_CONF]};
        finalPayload[timestamp].data[prefixes.PREFIX_ASSET] = {...finalPayload[timestamp].data[prefixes.PREFIX_ASSET], ...data[prefixes.PREFIX_ASSET]};
        break;
      }
      const configUpdate = {snap_addr, timestamp, data};
      finalPayload[timestamp] = configUpdate;
    }
    return finalPayload;
  }

  async getRadioUpdatePayload (finalPayload, update) {
    for (const upd of update.getAssetRadioUpdatesList()) {
      const snap_addr = getSnapAddr(upd.getSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_RADIO]: {
          'polls_sent': upd.getRadioPollsSent(),
          'polls_recv': upd.getRadioPollResponses(),
          'link_quality': upd.getRadioLinkQuality(),
          'mesh_depth': upd.getRadioMeshDepth(),
          'firmware_rev': upd.getRadioFirmware(), // Previously this property was used as firmware_version
          'script_crc': snappyHex(upd.getRadioScriptCrc()),
          'script_rev': upd.getRadioScriptVersion(), // Previously this property was used as script_version
          'is_a_repeater': upd.getIsARepeater(),
          'channel': upd.getRadioChannel(),
          'network_id': snappyHex(upd.getRadioNetworkId()) // Previously this property was used as nid (radio_conf table)
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_RADIO] = {...finalPayload[timestamp].data[prefixes.PREFIX_RADIO], ...data[prefixes.PREFIX_RADIO]};
        break;
      }
      const radioUpd = {snap_addr, timestamp, data};
      finalPayload[radioUpd.timestamp] = radioUpd;
    }
    return finalPayload;
  }

  async getBridgeUpdatePayload (finalPayload, update) {
    if (update.getBridgeUpdates()) {
      const upd = update.getBridgeUpdates();
      const snap_addr = getSnapAddr(upd.getSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_RADIO]: {
          'firmware_rev': upd.getFirmwareVersion(),
          'script_rev': upd.getScriptVersion()
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_RADIO] = {...finalPayload[timestamp].data[prefixes.PREFIX_RADIO], ...data[prefixes.PREFIX_RADIO]};
        return finalPayload;
      }
      const radioUpd = {snap_addr, timestamp, data};
      finalPayload[radioUpd.timestamp] = radioUpd;
    }
    return finalPayload;
  }

  async getTCHourUpdatePayload (finalPayload, update) {
    for (const upd of update.getTcHourUpdatesList()) {
      const snap_addr = getSnapAddr(upd.getTcUpdate().getTcSnapAddr_asU8());
      const timestamp = moment(upd.getTcUpdate().getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_RADIO]: {
          'polls_sent': upd.getTcUpdate().getPollsSent(),
          'polls_recv': upd.getTcUpdate().getPollsReceived(),
          'link_quality': upd.getTcUpdate().getLinkQuality(),
          'mesh_depth': upd.getTcUpdate().getMeshDepth()
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_RADIO] = {...finalPayload[timestamp].data[prefixes.PREFIX_RADIO], ...data[prefixes.PREFIX_RADIO]};
        break;
      }
      const radioUpd = {snap_addr, timestamp, data};
      finalPayload[radioUpd.timestamp] = radioUpd;
    }
    return finalPayload;
  }

  async getTCDayUpdatePayload (finalPayload, update) {
    for (const upd of update.getTcDayUpdatesList()) {
      const snap_addr = getSnapAddr(upd.getTcSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_RADIO]: {
          'polls_sent': upd.getPollsSent(),
          'polls_recv': upd.getPollsReceived(),
          'link_quality': upd.getLinkQuality(),
          'mesh_depth': upd.getMeshDepth()
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_RADIO] = {...finalPayload[timestamp].data[prefixes.PREFIX_RADIO], ...data[prefixes.PREFIX_RADIO]};
        break;
      }
      const radioUpd = {snap_addr, timestamp, data};
      finalPayload[radioUpd.timestamp] = radioUpd;
    }
    return finalPayload;
  }

  async getChargerUpdatePayload (finalPayload, update) {
    for (const upd of update.getChargerUpdatesList()) {
      const snap_addr = getSnapAddr(upd.getSnapAddr_asU8());
      const timestamp = moment(upd.getWhen().toDate()).format();
      const data = {
        [prefixes.PREFIX_CHARGER]: {
          'voltage': upd.getVoltage(),
          'current': upd.getCurrent()
        }
      };
      if (finalPayload[timestamp]) {
        finalPayload[timestamp].data[prefixes.PREFIX_CHARGER] = {...finalPayload[timestamp].data[prefixes.PREFIX_CHARGER], ...data[prefixes.PREFIX_CHARGER]};
        break;
      }
      const radioUpd = {snap_addr, timestamp, data};
      finalPayload[radioUpd.timestamp] = radioUpd;
    }
    return finalPayload;
  }

  evaluateAssetStatus (upd, lastState) {
    let status = assetStatusValTextMapping[upd.getAssetStatus()] || assetStatusValTextMapping.NO_STATUS_MATCH;
    console.log("status : ", status);
    if (status === assetStatus.UNKNOWN && lastState === assetStatus.UNKNOWN) {
      console.log('Dummy Update Ignore History');
      return false;
    }

    const disconnectedStatuses = ['OFFLINE', 'UNKNOWN'];
    const connection = disconnectedStatuses.includes(status) ? 'last_disconnected' : 'last_connected';
    console.log("connection : ", connection);

    let lastStatus = null;
    if (lastState){
      if (lastState !== status) {
        if (lastState == 'FCS') {lastStatus = `FCS Stop`;}
        if (lastState === "UNKNOWN") lastStatus = "Unknown Stop";
        if ((lastState === "ONLINE" || lastState === "OFFLINE") && status === "FCS") {lastStatus = "FCS Start";}
        if ((lastState === "ONLINE" || lastState === "OFFLINE") && status === "UNKNOWN") {lastStatus = "Unknown Start";}
      }
    }

    console.log("Last Status:  ", lastStatus);
    return {
      status,
      connection,
      lastStatus
    };
  }


  isAnyRevVersionChanged(confUpd, assetInfoRes) {
    return (
      (confUpd.getConfigLabel() && confUpd.getConfigLabel() != assetInfoRes.config_version) ||
      (confUpd.getRadioRev() && confUpd.getRadioRev() != assetInfoRes.radio_rev) ||
      (confUpd.getScriptRev() && confUpd.getScriptRev() != assetInfoRes.script_rev) ||
      (confUpd.getBatteryRev() && confUpd.getBatteryRev() != assetInfoRes.battery_rev) ||
      (confUpd.getBatteryFlashRev() && confUpd.getBatteryFlashRev() != assetInfoRes.battery_flash_rev)
    ) ? true : false;
  }

}

exports.assetHistoryCombineUpdateService = new AssetHistoryCombineUpdateService();
