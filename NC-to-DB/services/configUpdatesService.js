const asset = require('../models/asset.model');
const { getAssetConf, compareWithOldInformation, updateAssetConf, insertFirmwareRev,
  getFirmwareRev, insertHardwareRev, getHardwareRev } = require('../models/asset.conf.model');
const { getRowController, addRowControllerConf } = require('../models/row.controller.model');
const { getAssetTypeFromDeviceModel, getDeviceTypeIdFromAssetType } = require('../utils/constants');
const helpers = require('../utils/helpers/functions');

class ConfigUpdatesService {
  async handler(pbUpdate, net_ctrl_id) {
    console.log("In ConfigUpdatesHandler .. ");
    this.configUpdate = pbUpdate;
    // Getting asset Data
    const assetInfoRes = await asset.getOrCreateAsset(helpers.getSnapAddr(this.configUpdate.getSnapAddr_asU8()), net_ctrl_id)
    //  console.log("assetInfoRes : ", assetInfoRes);

    //--- Hardware rev
    let getHardwareRev_res = await this.getHardwareRev();
    //  console.log("query result getHardwareRev_res(1) : ", getHardwareRev_res.rows);

    if (getHardwareRev_res.rows.length === 0) {
      let displayRev = (parseFloat(this.configUpdate.getHardwareRev(), 10) / 10).toFixed(1);
      getHardwareRev_res = await this.insertHardwareRev(displayRev);
      // console.log("queryResult :", getHardwareRev_res.rows);
    }

    //Checking if asset hardware rev changed
    const isAssetHardwareRevChanged = (getHardwareRev_res?.rows[0]?.id === assetInfoRes?.hardware_rev_id) ? false : true


    //--- Firmware rev
    let getFirmwareRev_res = await this.getFirmwareRev();
    console.log("queryResult :", getFirmwareRev_res.rows);

    if (getFirmwareRev_res.rows.length === 0) {
      let display_rev = (parseFloat(this.configUpdate.getFirmwareRev(), 10) / 10).toFixed(1);
      getFirmwareRev_res = await this.insertFirmwareRev(display_rev);
      console.log("query response : ", getFirmwareRev_res.rowCount, getFirmwareRev_res.rows);
    }

    //--- AssetHistory
    //Checking if asset firmware rev changed
    const isAssetFirmwareRevChanged = (getFirmwareRev_res?.rows[0]?.id === assetInfoRes?.firmware_rev_id) ? false : true
    const { modelNum, deviceType, hasWeatherSensor } = getAssetTypeFromDeviceModel(this.configUpdate.getModelDevice())
    let params = {};
    if (isAssetHardwareRevChanged && isAssetFirmwareRevChanged) {

      params = {
        device_type_id: deviceType != null ? getDeviceTypeIdFromAssetType(deviceType) : null,
        location_lat: this.configUpdate.getLocationLat(),
        location_lng: this.configUpdate.getLocationLng(),
        location_text: this.configUpdate.getLocationText(),
        raw_hardware_rev: parseInt(this.configUpdate.getHardwareRev(), 10),
        raw_firmware_rev: parseInt(this.configUpdate.getFirmwareRev(), 10),
        hardware_rev_id: getHardwareRev_res?.rows[0]?.id,
        firmware_rev_id: getFirmwareRev_res?.rows[0]?.id,
        has_weather_sensor: hasWeatherSensor
      };
    } else if (!isAssetHardwareRevChanged && isAssetFirmwareRevChanged) {

      params = {
        device_type_id: deviceType != null ? getDeviceTypeIdFromAssetType(deviceType) : null,
        location_lat: this.configUpdate.getLocationLat(),
        location_lng: this.configUpdate.getLocationLng(),
        location_text: this.configUpdate.getLocationText(),
        raw_firmware_rev: parseInt(this.configUpdate.getFirmwareRev(), 10),
        hardware_rev_id: getHardwareRev_res?.rows[0]?.id,
        firmware_rev_id: getFirmwareRev_res?.rows[0]?.id,
        has_weather_sensor: hasWeatherSensor
      };
    } else if (isAssetHardwareRevChanged && !isAssetFirmwareRevChanged) {

      params = {
        device_type_id: deviceType != null ? getDeviceTypeIdFromAssetType(deviceType) : null,
        location_lat: this.configUpdate.getLocationLat(),
        location_lng: this.configUpdate.getLocationLng(),
        location_text: this.configUpdate.getLocationText(),
        raw_hardware_rev: parseInt(this.configUpdate.getHardwareRev(), 10),
        hardware_rev_id: getHardwareRev_res?.rows[0]?.id,
        firmware_rev_id: getFirmwareRev_res?.rows[0]?.id,
        has_weather_sensor: hasWeatherSensor
      };
    } else {

      params = {
        device_type_id: deviceType != null ? getDeviceTypeIdFromAssetType(deviceType) : null,
        location_lat: this.configUpdate.getLocationLat(),
        location_lng: this.configUpdate.getLocationLng(),
        location_text: this.configUpdate.getLocationText(),
        firmware_rev_id: getFirmwareRev_res?.rows[0]?.id,
        hardware_rev_id: getHardwareRev_res?.rows[0]?.id,
        has_weather_sensor: hasWeatherSensor
      };
    }
    await asset.updateHardwareAndFirmwareRaw(params, modelNum, assetInfoRes.id)

    //update asset conf
    const updateAssetConfRes = await this.addOrUpdateAssetConf(assetInfoRes.id);
    console.log("AddOrUpdateAssetConf", updateAssetConfRes);



    await asset.updateAssetLastActivity(
      this.configUpdate.getWhen().toDate(),
      assetInfoRes.id,
      assetInfoRes.last_cloud_update)

    // Updating asset firmware versions
    console.log("updating asset firmware versions")
    return asset.updateAssetFirmwareVersions(
      assetInfoRes.id,
      deviceType,
      this.configUpdate.getStmRev(),
      this.configUpdate.getRadioRev(),
      this.configUpdate.getScriptRev(),
      this.configUpdate.getBatteryRev(),
      this.configUpdate.getMacAddress(),
      this.configUpdate.getBatteryFlashRev(),
      this.configUpdate.getConfigLabel()
    )
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

  async getHardwareRev() {
    // console.log("In getHardwareRev()");
    return getHardwareRev(this.configUpdate);
  }

  async insertHardwareRev(display_rev) {
    // console.log("In InsertHardwareRev()");
    return insertHardwareRev(display_rev, this.configUpdate);
  }

  async getFirmwareRev() {
    // console.log("In getFirmwareRev()");
    return getFirmwareRev(this.configUpdate);
  }

  async insertFirmwareRev(display_rev) {
    // console.log("In insertFirmwareRev()");
    return insertFirmwareRev(display_rev, this.configUpdate);
  }

  async addOrUpdateAssetConf(assetId) {
    const assetConf = await getAssetConf(this.configUpdate)

    //compare values
    if (!compareWithOldInformation(assetConf, this.configUpdate)) {
      //update assetConf
      await updateAssetConf(this.configUpdate);
      //add row controller config
      await this.addRowConfig(assetId);
    } else {
      console.log(`Ignore update due to same information...`);
    }
  }


  async addRowConfig(assetId) {
    const rowController = await getRowController(assetId);
    if (rowController) {
      const result = await addRowControllerConf(rowController.id, this.configUpdate);
      return result;
    } else {
      return null;
    }
  }
}

exports.configUpdatesService = new ConfigUpdatesService();
