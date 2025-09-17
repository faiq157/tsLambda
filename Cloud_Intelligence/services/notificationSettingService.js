const moment = require("moment-timezone");
const {
  userNotificationScheduleWorkHours,
  userNotificationSchedulesType,
} = require("../utils/constants");
const { parseBoolean } = require("../utils");
const { getProjectSuperUsers, getProjectUsers, getSiteInfoById } = require("../pg");

class NotificationSettingService {

  checkIsCurrentTimeUserWorkingHours(userProject) { // return boolean
    if (userProject?.user_timezone) {
      const officeTimezone = userProject.user_timezone;
      const currentTime = moment.tz(new Date(), officeTimezone);
      const officeHoursStart = moment.tz(userNotificationScheduleWorkHours.START, 'HH:mm', officeTimezone);
      const officeHoursEnd = moment.tz(userNotificationScheduleWorkHours.END, 'HH:mm', officeTimezone);
      return currentTime.isBetween(officeHoursStart, officeHoursEnd);
    }
    return true;
  }


  convertJsonToObject(inputJson) {
    try {
      const parsedJson = inputJson;
      const resultObject = {};

      for (const key in parsedJson) {
        resultObject[key] = parsedJson[key]?.schedule_type;
      }

      return resultObject;
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      return null;
    }
  }

  checkScheduledNotification(userProject, notification_type){

    // first of all we check that the
    if (!userProject?.notification_schedules) {
      console.log("ERROR: invalid userProject.notification_schedules: ", JSON.stringify(userProject));
      return true
    }

    const notificationType = notification_type

    const userNotificationSchedule = this.convertJsonToObject(userProject?.notification_schedules)

    if (!userNotificationSchedule[notificationType]) {
      console.log(`WARNING: schedule not found for notificationType: ${notificationType}, userNotificationSchedule: ${JSON.stringify(userNotificationSchedule)}`);
      return true
    }

    // check if the system level(project level) notifiactions are set all days(aka 27/7) then return true
    if (userNotificationSchedule?.project_notification === userNotificationSchedulesType.all_days) {

      // if project level notfications are set to all_days 24/7 then we will check the notification level schedule
      if (userNotificationSchedule[notificationType]  === userNotificationSchedulesType.all_days) {
        return true
      }
      else if(userNotificationSchedule[notificationType] === userNotificationSchedulesType.work_days) {
        return this.checkIsCurrentTimeUserWorkingHours(userProject)
      }

    }
    else if(userNotificationSchedule?.project_notification === userNotificationSchedulesType.work_days) {
      return this.checkIsCurrentTimeUserWorkingHours(userProject)
    }

    return true
  }

  async getAccounts(siteId, notification_type, isSuper = null) {
    try {
      console.log(
        `Notification query request sitetId:${siteId} notification_type:${notification_type}`
      );
      //if no siteId
      if (siteId === null || siteId === undefined) return { emails: [], phone_nums: [] };
      const site_info_res = await getSiteInfoById(siteId);
      const site_info = site_info_res.rows[0];
      let site_users_info = isSuper
        ? await getProjectSuperUsers(site_info.project_id, notification_type)
        : await getProjectUsers(site_info.project_id, notification_type);   

      let emails = [];
      let phone_nums = [];
      let adminEmails = [];
      let adminPhoneNums = [];

      site_users_info.rows.forEach(async (data) => {
        data = { ...data, ...data.notification_settings };
        if (data.is_in_construction === true && data.super === false) return true;
        if (site_info.active === false) return true;
        if (!this.checkScheduledNotification(data, notification_type)) return true;

        const notificationSetting = this.checkNotification(data, notification_type);

        if (data.site_email === true && data.email_addr !== null) {
          if (notificationSetting.email_enabled && data.user_notification_status_email) {
            emails.push(data.email_addr);
            if ([1,2].includes(data.level)) { // To check if role is either Super admin or admin
              adminEmails.push(data.email_addr);
            }
          }
        }
        if (data.site_sms === true && data.sms_num !== null) {
          if (notificationSetting.sms_enabled  && data.user_notification_status_sms) {
            phone_nums.push(data.sms_num);
            if ([1,2].includes(data.level)) { // To check if role is either Super admin or admin
              adminPhoneNums.push(data.sms_num);
            }
          }
        }
      });
      const finalphonenums = phone_nums.filter(
        (data) => data && data !== "null" && data.trim() !== ""
      );
      const finalAdminPhoneNums = adminPhoneNums.filter(
        (data) => data && data !== "null" && data.trim() !== ""
      );
      console.log("Final Emails - Final Admin Emails", emails, adminEmails);
      console.log("Final Phone Nums - Final Admin Phone Nums", finalphonenums, finalAdminPhoneNums);

      return { emails: emails, phone_nums: finalphonenums, admin_emails: adminEmails, admin_phone_nums: finalAdminPhoneNums };
    } catch (err) {
      console.error(err);
      throw new Error(
        "Operation not completed error getEmailIds handler..!!",
        err
      );
    }
  }

  checkNotification(info, notification_type) {
    let email_enabled = false;
    let sms_enabled = false;

    if (parseBoolean(info[notification_type + "_email"]) == true) email_enabled = true;
    if (parseBoolean(info[notification_type + "_sms"]) == true) sms_enabled = true;
    
    // sms_enabled & email_enabled is a notification setting on project level for this user
    if (parseBoolean(info["sms_enabled"]) == false) sms_enabled = false;
    if (parseBoolean(info["email_enabled"]) == false) email_enabled = false;

    return { email_enabled: email_enabled, sms_enabled: sms_enabled };
  }
}

exports.notificationSettingService = new NotificationSettingService();
