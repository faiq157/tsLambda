const { publishToSNS, publishToSNSTest } = require("../lib/aws");
const util = require("../../util");
const { getContext } = require("../lib/context");
const flatten = require('flat');

const channels = {
  TRACKING_MODE_CHANGE: 'tracking_command_hist',
  LOCAL_WEATHER_STOW_UPDATE: 'local_weather_nc_stow_update',
  CELL_UPDATE: 'cell_update',
  COMMAND_STATUS_UPDATE: 'command_status_update',
  ASSET_MOTOR_RUNTIME_DAY: 'asset_motor_runtime_day',
  ASSET_MOTOR_RUNTIME_HOUR: 'asset_motor_runtime_hour',
  IRRADIANCE_HISTORY: 'irradiance_hist',
  BATTERY_UPDATE: 'battery_hist',
  RACK_UPDATE: 'rack_hist',
  RADIO_UPDATE: 'radio_hist',
  INCREASE_WEATHER_REPORTING_UPDATE: 'increase_weather_reporting_update',
  SNOW_SHEDDING_UPDATE: 'snow_shedding',
  SNOW_SHEDDING_REPORT: 'snow_shedding_report'

}

class NotificationHelper {

  async sendTestNotification(msg) {
    return publishToSNSTest(msg);
  }

  isCloudInteligencePublishRequired(channel) {
    switch (channel) {
      case "asset_panel_external_input_power_day":
      case "asset_panel_external_input_power_hour":
      case "asset_update":
      case channels.CELL_UPDATE:
      case "asset_solar_panel_hist":
      case "motor_hist":
      case "angular_error_power_hour":
      case "asset_battery_power_day":
      case "asset_motor_power_day":
      case "asset_panel_power_day":
      case "asset_battery_power_hour":
      case "asset_motor_power_hour":
      case "asset_panel_power_hour":
      case "radio_hist":
      case "rack_hist":
      case channels.IRRADIANCE_HISTORY:
      case channels.ASSET_MOTOR_RUNTIME_DAY:
      case channels.ASSET_MOTOR_RUNTIME_HOUR:
        return false;
      default:
        return true;
    }
  }

  createMessagePayload(channel, assetSnapAddr, assetId) {

    const { ncId, snapAddr, siteId } = getContext();
    return {
      type: 'elastic_search-1',
      channel,
      network_controller_id: ncId,
      snap_addr: assetSnapAddr,
      asset_id: assetId,
      nc_snap_addr: snapAddr,
      site_id: siteId
    };
  }

  sendNotification(msg) {

    if (msg && msg.type === 'elastic_search-1') {
      const { snapAddr, siteId } = getContext();

      if (!msg.nc_snap_addr) {
        msg.nc_snap_addr = snapAddr;
      }

      if (!msg.site_id) {
        msg.site_id = siteId;
      }
    }
    if (!this.isCloudInteligencePublishRequired(msg.channel)) {
      // We are capturing all data to ELK in Cloudwatch Logs for bulk write to ELK
      msg.type = "cloudwatch-es";
      //! NOTE: Should we remove this log from CloudWatch ?
      // console.log(JSON.stringify(msg));
      return;
    }

    return publishToSNS(msg);
  }

  async sendTrackingModeChangeToELK(trackingChangesUpdate, trackingMode, trackingModeDetail) {
    const { snapAddr, assetId } = getContext();
    const userName = trackingChangesUpdate.getUserName()
    const userEmail = trackingChangesUpdate.getUserEmail()
    const source = trackingChangesUpdate.getSource()

    const trackingModeChange = this.createMessagePayload(channels.TRACKING_MODE_CHANGE, snapAddr, assetId);

    trackingModeChange.timestamp = trackingChangesUpdate.getStateChangedAt().toDate();
    trackingModeChange.commanded_state = trackingMode || trackingChangesUpdate.getUpdatedState();
    trackingModeChange.commanded_state_detail = trackingModeDetail || trackingChangesUpdate.getCommandedPreset();

    if (userName && userEmail) {
      trackingModeChange.user_name = userName
      trackingModeChange.user_email = userEmail
    }

    if (source) {
      trackingModeChange.source = source
    }

    return this.sendNotification(trackingModeChange);
  }

  async sendAccuWeatherStowUpdate(accuWeatherUpdate) {
    const { snapAddr, assetId } = getContext();
    const localWeatherStowUpdate = this.createMessagePayload(channels.LOCAL_WEATHER_STOW_UPDATE, snapAddr, assetId);

    localWeatherStowUpdate.timestamp = accuWeatherUpdate.getWhen().toDate();
    localWeatherStowUpdate.need_accu_weather_update = accuWeatherUpdate.getNeedAccuWeatherUpdate();
    localWeatherStowUpdate.accu_stow = accuWeatherUpdate.getAccuStow();
    localWeatherStowUpdate.stow_type = accuWeatherUpdate.getStowType();
    localWeatherStowUpdate.stow_start_time = accuWeatherUpdate.getStowStartTime();
    localWeatherStowUpdate.stow_end_time = accuWeatherUpdate.getStowEndTime();
    localWeatherStowUpdate.error_code = accuWeatherUpdate.getErrorCodes();

    return this.sendNotification(localWeatherStowUpdate);
  }
  async sendSnowSheddingUpdate(snowSheddingUpdate, lastSnowShedding, asset_id) {
    const snowSheddingUpdateInfo = this.createMessagePayload(channels.SNOW_SHEDDING_UPDATE, snowSheddingUpdate.snapAddr, asset_id);
    const { assetId } = getContext();
    snowSheddingUpdateInfo.timestamp = snowSheddingUpdate.getWhen().toDate();
    let payload = flatten({
      'nc_asset_id': assetId,
      'snow_shedding.depth': snowSheddingUpdate.getDepth() / 0.0254,
      'snow_shedding.baseline': snowSheddingUpdate.getBaseline() / 0.0254,
      'snow_shedding.snow_on_ground_now': snowSheddingUpdate.getSnowOnGroundNow() / 0.0254,
      'snow_shedding.estimate': snowSheddingUpdate.getEstimate() / 0.0254,
      'snow_shedding.trigger': snowSheddingUpdate.getTrigger() / 0.0254,
      'snow_shedding.threshold': snowSheddingUpdate.getThreshold() / 0.0254,
      'snow_shedding.active': snowSheddingUpdate.getActive(),
      'snow_shedding.last_snow_shedding': lastSnowShedding,
      'snow_shedding.state': snowSheddingUpdate.getState()
    });
    return this.sendNotification({ ...snowSheddingUpdateInfo, ...payload });
  }

  async sendSnowSheddingReportUpdate(timestamp, reportDetail) {
    const { snapAddr, assetId } = getContext();
    const update = this.createMessagePayload(channels.SNOW_SHEDDING_REPORT, snapAddr, assetId);
    update.timestamp = timestamp;
    update.reportDetail = JSON.stringify(reportDetail);

    return this.sendNotification(update);
  }

  async sendCellUpdate(cellUpdate) {
    const { snapAddr, assetId } = getContext();
    const update = this.createMessagePayload(channels.CELL_UPDATE, snapAddr, assetId);

    update.timestamp = cellUpdate.getWhen().toDate();
    update.rssi_dbm = cellUpdate.getRssiDbm();
    update.up_time = util.uptimeStr(cellUpdate.getUptime());

    return this.sendNotification(update);
  }

  async sendMotorRuntimeDayToElasticSearch(
    accumUpdate,
    motorId,
    assetId,
    tcDayUpdate,
    tcSnapAddress
  ) {
    const motorRuntimeDayInfo = this.createMessagePayload(
      channels.ASSET_MOTOR_RUNTIME_DAY,
      tcSnapAddress,
      assetId
    );

    motorRuntimeDayInfo.motor_id = motorId;
    motorRuntimeDayInfo.total_day = accumUpdate.getValue();
    motorRuntimeDayInfo.day = tcDayUpdate.getWhen().toDate();
    motorRuntimeDayInfo.timestamp = tcDayUpdate.getWhen().toDate();
    return this.sendNotification(motorRuntimeDayInfo);
  }

  async sendMotorRuntimeHourToElasticSearch(
    accumUpdate,
    motorId,
    assetId,
    tcHourUpdate,
    tcSnapAddress
  ) {
    const motorRuntimeHourInfo = this.createMessagePayload(
      channels.ASSET_MOTOR_RUNTIME_HOUR,
      tcSnapAddress,
      assetId
    );

    motorRuntimeHourInfo.motor_id = motorId;
    motorRuntimeHourInfo.total_hour = accumUpdate.getValue();
    motorRuntimeHourInfo.hour = tcHourUpdate.getHour();
    motorRuntimeHourInfo.day = tcHourUpdate.getDay().toDate();
    motorRuntimeHourInfo.timestamp = tcHourUpdate
      .getTcUpdate()
      .getWhen()
      .toDate();
    return this.sendNotification(motorRuntimeHourInfo);
  }

  async sendIrradianceHistoryToElasticSearch(accumUpdate, assetId, assetSnapAddr, projId) {
    const irradianceHistoryInfo = this.createMessagePayload(
      channels.IRRADIANCE_HISTORY,
      assetSnapAddr,
      assetId
    );

    irradianceHistoryInfo.timestamp = accumUpdate.getWhen().toDate();
    irradianceHistoryInfo.site_ghi = accumUpdate.getSiteGhi();
    irradianceHistoryInfo.site_poa = accumUpdate.getSitePoa();
    irradianceHistoryInfo.project_id = projId;

    return this.sendNotification(irradianceHistoryInfo);
  }

  async sendBatteryUpdatesToElasticSearch(battUpdate, assetSnapAddr, assetId, deviceTypeId) {
    const batteryUpdateInfo = this.createMessagePayload(
      channels.BATTERY_UPDATE,
      assetSnapAddr,
      assetId
    );

    batteryUpdateInfo.device_type = deviceTypeId;
    batteryUpdateInfo.timestamp = battUpdate.getWhen().toDate();
    batteryUpdateInfo.voltage = battUpdate.getVoltage();
    batteryUpdateInfo.current = battUpdate.getCurrent();
    batteryUpdateInfo.poc = battUpdate.getCharged();
    batteryUpdateInfo.poh = battUpdate.getHealth();
    batteryUpdateInfo.battery_temperature = battUpdate.getBattTemp();
    batteryUpdateInfo.heater_temperature = battUpdate.getHeaterTemp();
    batteryUpdateInfo.misc_status_bits = battUpdate.getMiscStatusBits();

    return this.sendNotification(batteryUpdateInfo);
  }

  async sendRackUpdatesToElasticSearch(rackUpdate, assetSnapAddr, assetId, deviceTypeId) {
    const rackUpdateInfo = this.createMessagePayload(
      channels.RACK_UPDATE,
      assetSnapAddr,
      assetId
    );

    rackUpdateInfo.device_type = deviceTypeId;
    rackUpdateInfo.timestamp = rackUpdate.getWhen().toDate();
    rackUpdateInfo.current_angle = rackUpdate.getCurrentAngle();
    rackUpdateInfo.requested_angle = rackUpdate.getRequestedAngle();
    rackUpdateInfo.tracking_status = rackUpdate.getTrackingStatus();
    rackUpdateInfo.commanded_state = rackUpdate.getCommandedState();
    rackUpdateInfo.commanded_state_detail = rackUpdate.getCommandedStateDetail();
    rackUpdateInfo.panel_index = rackUpdate.getPanelIndex();
    rackUpdateInfo.panel_command_state = rackUpdate.getPanelCommandState();
    rackUpdateInfo.motor_current = rackUpdate.getMotorCurrent();

    await this.sendNotification(rackUpdateInfo);

    return rackUpdateInfo
  }


  async sendRadioUpdatesToElasticSearch(radioUpdate, radioId, assetSnapAddr, assetId, deviceTypeId) {
    const radioUpdateInfo = this.createMessagePayload(
      channels.RADIO_UPDATE,
      assetSnapAddr,
      assetId
    );

    radioUpdateInfo.device_type = deviceTypeId;
    radioUpdateInfo.timestamp = radioUpdate.getWhen().toDate();
    radioUpdateInfo.radio_id = radioId;
    radioUpdateInfo.polls_sent = radioUpdate.getRadioPollsSent();
    radioUpdateInfo.polls_recv = radioUpdate.getRadioPollResponses();
    radioUpdateInfo.link_quality = util.linkQualitydBmToPercent(radioUpdate.getRadioLinkQuality());
    radioUpdateInfo.mesh_depth = radioUpdate.getRadioMeshDepth();
    radioUpdateInfo.is_a_repeater = radioUpdate.getIsARepeater();

    return this.sendNotification(radioUpdateInfo);
  }

}

exports.notificationHelper = new NotificationHelper();
exports.channels = channels;
