const aws_integration = require("../aws_integration");
const moment = require("moment-timezone");
const tzlookup = require("tz-lookup");
const db = require("../db");
const { exeQuery } = require("../pg");
var Handlebars = require("handlebars");
const utils = require("../utils");
const { getS3EmailAssetsUrl } = require("../utils/libs/functions");
const { cloudAlertService } = require("./cloudAlertService");
const { notificationSettingService } = require("./notificationSettingService");
const { notificationService } = require("../services/common/notificationService");
class VegetationAlertService {
  async handler(payload) {
    console.log("VegetationAlertService handler!!!");
    this.payload = payload;
    try {
      return await this.processEvent();
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error VegetationAlertService handler..!!",
        err
      );
    }
  }
  async processEvent() {
    try {
      await this.getAssetInfo();
      //check active scenario or inactive scenario
      if (this.payload.modeStatus === true) {
        //checkActiveAlert already exists or not
        let activeAlert = await this.getActiveAlertByNCId();

        if (activeAlert.length === 0) {
          //add new alert
          await this.addCloudAlert();
          await this.addCloudEventLog(true);

        } else {
          console.log('Active alert already exists');
        }
      } else {
        //get snap address from last active vegetation alert
        let getActiveAlertByNC = await this.getActiveAlertByNCId();
        if (getActiveAlertByNC.length !== 0) {
          let userInfo = {
            user_name: getActiveAlertByNC[0].user_name,
            user_email: getActiveAlertByNC[0].user_email
          };
          if (this.payload.who !== null || this.payload.who !== '' || this.payload.who !== undefined) {
            if (this.payload.who === 'NC_SLUI') {
              userInfo = {
                user_name: "Network Controller",
                user_email: "SLUI"
              };
            } else if (this.payload.who === 'NC_low_temperature') {
              userInfo = {
                user_name: "Network Controller",
                user_email: "Low Temperature"
              };
            }
          }
          this.payload.snap_addr = getActiveAlertByNC[0].snap_addr;
          await this.addCloudEventLog(false, userInfo);
          await this.addVegetationAlertHist();
          await this.clearCloudAlert(getActiveAlertByNC[0].id);

        } else {
          await this.addVegetationAlertHist();
          console.log("No Active Alert exists")
        }
      }
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error processEvent handler..!!",
        err
      );
    }
  }

  async getAssetInfo() {
    console.log('getAssetInfo');
    try {

      console.log(this.getAssetAndSiteInfoQuery(), [this.payload.snap_addr]);
      const deviceType = await this.getDeviceType();
      let assetInfoRes = null;
      if (deviceType === "Network Controller") {
        assetInfoRes = await exeQuery(this.getNCAndSiteInfoQuery(), [this.payload.nc_id]);
      } else {
        assetInfoRes = await exeQuery(this.getAssetAndSiteInfoQuery(), [this.payload.snap_addr]);
      }
      if (assetInfoRes && assetInfoRes.rows.length > 0) {
        let data = assetInfoRes.rows[0];
        this.payload.asset_id = data.asset_id
        this.network_controller_id = data.network_controller_id;
        this.network_controller_name = data.network_controller_name;
        this.is_notify = data.is_notify;
        this.site_id = data.site_id;
        this.site_name = data.site_name;
        this.location_lat = data.location_lat;
        this.location_lng = data.location_lng;
        this.project_location = data.project_location;
        this.project_name = data.project_name;
        this.project_id = data.project_id;
        this.device_type = deviceType;
        this.payload.asset_name = data.asset_name;
        this.asset_name = await this.getAssetName();
        this.snap_addr = this.payload.snap_addr;
        this.multipleSites = await notificationService.checkProjectSites(this.project_id);


        console.log(`ASSETINFO: [asset_id:${this.payload.asset_id}] [nc_id: ${this.network_controller_id}] [nc_name: ${this.network_controller_name}] [is_notify: ${this.is_notify}] [snap_addr: ${this.snap_addr}] [asset_name: ${this.asset_name}]`);
      }
      return assetInfoRes.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getAssetInfo..!!",
        err
      );
    }
  }


  async getDeviceType() {
    console.log('getDeviceType')
    try {
      let deviceType = null;
      console.log(db.deviceTypeInfoQueryBySnapAddr, [this.payload.snap_addr]);
      const getDeviceTypeInfoRes = await exeQuery(db.deviceTypeInfoQueryBySnapAddr, [this.payload.snap_addr])
      if (getDeviceTypeInfoRes.rows.length > 0) {
        deviceType = getDeviceTypeInfoRes.rows[0].device_type;
      }
      console.log(deviceType);
      return deviceType;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getDeviceType..!!",
        err
      );
    }
  }

  async getAssetName() {
    console.log(`getAssetName`);
    try {
      let assetName = this.payload.asset_name !== null ?
        this.payload.asset_name : (this.device_type !== null ? this.device_type : "ASSET");

      if (this.device_type === "Row Controller") {
        //get SiteLayOutInfo

        this.shorthand_name = null;
        this.row_id = "";
        this.row_name = null;

        const siteLayoutInfo = await this.getSiteLayoutInfo();
        if (siteLayoutInfo.length !== 0) {
          this.shorthand_name = siteLayoutInfo[0].shorthand_name;
          this.row_id = siteLayoutInfo[0].i;
          this.row_name = siteLayoutInfo[0].name;
        }
        //Row Name Format "Row Box <row_id> (<row_name> | <shorthand_name> | <snap_addr>)"
        assetName = "Row Box " + this.row_id + " (" + (this.row_name !== null ? this.row_name + " | " : "") +
          (this.shorthand_name !== null ? this.shorthand_name + " | " : "") + this.snap_addr + ")";
      }
      console.log(assetName);
      return assetName;
    } catch (err) {
      throw new Error(
        "Operation not completed error getAssetName..!!",
        err
      );
    }
  }

  async getSiteLayoutInfo() {
    console.log('getSiteLayoutInfo');
    try {
      //get site_layout info
      let siteLayoutInfoRes = await exeQuery(
        db.siteLayoutInfoByAssetId,
        [this.payload.asset_id]
      );
      console.log(siteLayoutInfoRes.rows);
      return siteLayoutInfoRes.rows;
    } catch (err) {
      throw new Error(
        "Operation not completed error getSiteLayoutInfo..!!",
        err
      );
    }
  }

  getAssetAndSiteInfoQuery() {
    console.log('getAssetAndSiteInfoQuery');
    return db.siteInfoByAssetSnapAddr;
  }

  getNCAndSiteInfoQuery() {
    console.log('getNCAndSiteInfoQuery');
    return db.vegetationAlertSiteInfoByNCId;
  }

  async clearCloudAlert(alertId) {
    try {
      console.log("Delete Cloud Alert: ", alertId);
      await cloudAlertService.clearAlertDetail(alertId);
      return await exeQuery(db.removeCloudAlert, [alertId], { writer: true });
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error clearCloudAlert..!!",
        err
      );
    }

  }

  async addVegetationAlertHist() {
    try {
      const query = `
       INSERT INTO terrasmart.vegetation_alert_hist (snap_addr, timestamp, vegetation_mode_status, temperature_threshold,days_history )
       VALUES ($1::VARCHAR, $2::BIGINT, $3::BOOLEAN, $4::INT, $5::INTEGER[])
       `;
      const params = [
        this.snap_addr,
        new Date(this.payload.timestamp).getTime(),
        this.payload.modeStatus,
        this.payload.temperature_threshold,
        this.payload.daysHist
      ];
      console.log('addVegetationAlertHist', query, params);
      const addAlertHistRes = await exeQuery(query, params, { writer: true });
      console.log('addAlertHistRes ', addAlertHistRes);
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error addVegetationAlertHist..!!",
        err
      );
    }
  }
  async addCloudAlert() {
    // console.log(`addCloudAlert `);
    try {
      const params = [
        this.getEventName(true),
        this.getEventMessage(true),
        this.payload.timestamp,
        this.payload.asset_id,
        2,
        true,
        this.getEventTitle(true),
        this.getEventIcon(true),
        20
      ];
      console.log(db.addCloudAlertByReturnId, params);
      let addcloudAlertResult = await exeQuery(db.addCloudAlertByReturnId, params, { writer: true });
      console.log('addcloudAlertResult ', addcloudAlertResult);
      return addcloudAlertResult;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error addCloudAlert..!!",
        err
      );
    }
  }

  async addCloudEventLog(active, userInfo = null) {
    console.log(`addCloudEventLog(${active})`);
    try {
      if (userInfo !== null) {
        const params = [
          this.getEventName(active),
          this.getEventMessage(active),
          20,
          new Date(this.payload.timestamp),
          this.payload.asset_id,
          2,
          this.getEventTitle(active),
          this.getEventIcon(active),
          userInfo.user_name,
          userInfo.user_email,
          null
        ];
        console.log(db.addCloudEventLogWithUserInfoByReturnId, params);
        let addcloudEventLogResult = await exeQuery(db.addCloudEventLogWithUserInfoByReturnId, params, { writer: true });
        console.log(`addcloudEventLogResult ${addcloudEventLogResult.rows}`);
      } else {
        const params = [
          this.getEventName(active),
          this.getEventMessage(active),
          20,
          new Date(this.payload.timestamp),
          this.payload.asset_id,
          2,
          this.getEventTitle(active),
          this.getEventIcon(active),
        ];
        console.log(db.addCloudEventLogByReturnId, params);
        let addcloudEventLogResult = await exeQuery(db.addCloudEventLogByReturnId, params, { writer: true });
        console.log(`addcloudEventLogResult ${addcloudEventLogResult.rows}`);

      }
      //sendNotification
      if (this.is_notify) {
        await this.processNotification(active, userInfo);
      }

      return true;

    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error addCloudEventLog..!!",
        err
      );
    }
  }


  async getActiveAlert() {
    try {
      console.log("getActiveAlert ");
      console.log(db.getLastCloudAlertQuery,
        [this.getAlertCheckEventName(), this.payload.asset_id]);
      const alertRes = await exeQuery(db.getLastCloudAlertQuery,
        [this.getAlertCheckEventName(), this.payload.asset_id]);
      // console.log(`alertRes `, alertRes)
      return alertRes.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getActiveAlert...!", err
      );
    }
  }
  async getActiveAlertByNCId() {
    try {
      console.log("getActiveAlertByNCId ", this.payload.nc_id);
      console.log(db.cloudAlertQueryByNCId,
        [this.getAlertCheckEventName(true), this.payload.nc_id]);
      const alertRes = await exeQuery(db.cloudAlertQueryByNCId,
        [this.getAlertCheckEventName(true), this.payload.nc_id, this.payload.timestamp]);
      // console.log('alertRes ', alertRes)
      return alertRes.rows;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getActiveAlertByNCId...!", err
      );
    }
  }


  getEventMessage(active) {
    console.log(`getEventMessage ${active}`);
    if (active) {
      return `${this.asset_name} is receiving readings from its snow sensor which indicate vegetation is interfering with its operation. Please clear the vegetation from around the snow sensor pad and then click the Reset Vegetation Alert button to clear this alert and return the snow sensor to normal operation.
        Vegetation Alert triggers when a snow sensor records a snow value greater than the snow stow threshold and the daily average temperature and the history of the past 4 days temperature is greater than ${this.payload.temperature_threshold}&deg.`;
    } else {
      return null;
    }
  }

  getNotificationMessage(active, userInfo, is_sms = false) {
    console.log(`getNotificationMessage ${active}`);
    if (active) {
      if (is_sms) {
        return `${this.asset_name} is receiving readings from its snow sensor which indicate vegetation is interfering with its operation. Vegetation Alert triggers when a snow sensor records a snow value greater than the snow stow threshold and the daily average temperature and the history of the past 4 days temperature is greater than ${this.payload.temperature_threshold}°.`;

      } else {
        return [`${this.asset_name} is receiving readings from its snow sensor which indicate vegetation is interfering with its operation.`,
        `Vegetation Alert triggers when a snow sensor records a snow value greater than the snow stow threshold and the daily average temperature and the history of the past 4 days temperature is greater than ${this.payload.temperature_threshold}°.`];

      }
    } else {
      if (is_sms) {
        if (userInfo !== null) {
          if (userInfo.user_email !== null) {
            return `Vegetaiton Alert Cleared by ${userInfo.user_name} (${userInfo.user_email})`;
          } else {
            return `Vegetaiton Alert Cleared by Network Controller`;
          }
        } else {
          return `Vegetaiton Alert Cleared by Network Controller`;
        }
      } else {
        if (userInfo !== null) {
          if (userInfo.user_email !== null) {
            return [`Vegetaiton Alert Cleared by ${userInfo.user_name} (${userInfo.user_email})`];
          } else {
            return [`Vegetaiton Alert Cleared by Network Controller`];
          }
        } else {
          return [`Vegetaiton Alert Cleared by Network Controller`];
        }
      }
    }
  }
  getEventTitle(active) {
    console.log(`getEventTitle(${active})`);
    if (active) {
      return `Vegetation Alert`;
    } else {
      return `Vegetaiton Alert Cleared`; //need to add user information here
    }
  }

  getEventIcon(active) {
    console.log(`getEventIcon(${active})`);
    if (active) {
      return 'vegetation_alert';
    } else {
      return 'vegetation_clear_alert';
    }
  }

  getAlertCheckEventName() {
    console.log(`getAlertCheckEventName()`);
    return 'VEGETATION-ALERT';
  }

  getEventName(active) {
    console.log(`getEventName()`);
    if (active) {
      return 'VEGETATION-ALERT';
    } else {
      return 'VEGETATION-ALERT-CLEAR'
    }
  }

  getEventNotificationType() {
    console.log(`getEventNotificationType()`);
    return 'vegetation_alert';
  }

  getEventNotificationText(active) {
    console.log(`getEventNotificationText(${active})`);
    if (active) {
      return `${(this.device_type !== null ? this.device_type : "Asset")} | Vegetation Alert`;
    } else {
      return `${(this.device_type !== null ? this.device_type : "Asset")} | Vegetation Alert Cleared`;
    }
  }

  async getNotificationSettings() {
    console.log(`getNotificationSettings()`)
    try {
      var userAccounts = await notificationSettingService.getAccounts(
        this.site_id,
        this.getEventNotificationType()
      );
      console.log(`----`, userAccounts);
      return userAccounts;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getNotificationSettings...!", err
      );
    }
  }
  async processNotification(active, userInfo) {
    let notificationSettings = await this.getNotificationSettings()
    try {
      if (notificationSettings.phone_nums) {
        //sendSmsNotifications
        await this.sendSmsNotifications(active, notificationSettings, userInfo)
      }
      if (notificationSettings.emails) {
        //sendEmailNotifications
        console.log("notificationSettings ", notificationSettings);
        await this.sendEmailNotifications(active, notificationSettings, userInfo)
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error processNotification...!", err
      );
    }
  }

  getEventTime() {
    let time_zone = "America/New_York";
    if (this.location_lat !== "" && this.location_lng !== "")
      time_zone = tzlookup(this.location_lat, this.location_lng);

    let timestamp = moment
      .tz(this.payload.timestamp, time_zone)
      .format("MM/DD/YYYY hh:mmA ");
    //console.log("TIME: ", timestamp);
    return timestamp;
  }

  async sendSmsNotifications(active, notificationSettings, userInfo) {
    try {
      console.log("Sending SMS to ", active, notificationSettings.phone_nums);
      notificationSettings.phone_nums.forEach(async (data) => {
        let params = {};
        params.phoneNumber = data;
        params.msgText = (this.multipleSites ? this.project_name + " | " : "") + `${this.site_name}\n${this.getEventNotificationText(active)}\n${this.getEventTime()}: ${this.getNotificationMessage(active, userInfo, true)}`;
        console.log(params);
        await aws_integration.sendSMS(params);
      });
      return true;
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error sendSmsNotifications...!", err
      );
    }
  }

  async sendEmailNotifications(active, notificationSettings, userInfo) {
    try {
      console.log("EMAILADDRS ", notificationSettings.emails);
      let msgs = this.getNotificationMessage(active, userInfo);
      var emailData = {
        is_multiSites: this.multipleSites,
        site_name: this.site_name,
        status_text: this.getEventNotificationText(active),
        body_text: msgs[0],
        asset_name: this.asset_name,
        timestamp: this.getEventTime(),
        project_name: this.project_name,
        project_location: this.project_location,
        s3_asset_url: getS3EmailAssetsUrl(),
        icon_url: `${getS3EmailAssetsUrl()}${this.getEventIcon(active)}_48x48.png`,
        url: process.env.CLOUDUI_URL + ("/home/projects/" + this.site_id + "/overview"),
        current_time: new Date(),
      };
      if (active) {
        emailData.detail = msgs[1];
      }
      console.log(emailData);
      var templateHtml = Handlebars.compile(
        active ? utils.emailTempVegetationNotifications.toString() : utils.emailTempWeatherNotifications.toString()
      );
      var bodyHtml = templateHtml(emailData);
      let params = {};
      params.msgbody = bodyHtml;
      params.msgSubject = this.getEventEmailSubject(active);

      notificationSettings.emails.forEach(async (data) => {
        params.emailAddrs = [data];
        await aws_integration.sendEmail(params);
      });
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error sendEmailNotifications...!", err
      );
    }
  }

  getEventEmailSubject(active) {
    console.log(`getEventEmailSubject`);
    let subject =
      (this.multipleSites ? this.project_name + " | " : "") +
      `${this.site_name} | ${this.getEventNotificationText(active)}`;
    console.log(subject);
    return subject;
  }

}
exports.vegetationAlertService = new VegetationAlertService();
