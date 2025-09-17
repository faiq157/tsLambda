
const { isAccuWeatherEnabled } = require("../models/project.model");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { sendAccuWeatherNoStowResponse } = require("../mqtt");

class AccuWeatherUpdatesService {

  async handler(nc_id, siteId, aws_iot_principal_id, pbUpdate) {
    console.log("accuWeatherUpdatesService Handler ...", nc_id, siteId);
    this.accuWeatherUpdate = pbUpdate;

    if (siteId && await isAccuWeatherEnabled(siteId)) {
      console.log(`accuweather updates are enabled..........`)
      return notificationHelper.sendAccuWeatherStowUpdate(this.accuWeatherUpdate);
    }
    
    if (this.accuWeatherUpdate.getNeedAccuWeatherUpdate()) {
      return sendAccuWeatherNoStowResponse();
    } else {
      console.log("accuweather update acknowledgement received.");
    }
  }
}

exports.accuWeatherUpdatesService = new AccuWeatherUpdatesService();
