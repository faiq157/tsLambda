const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const networkController = require("../models/network.controller.model");
const { trackingModes, hasModeDetail, StowStates, StowTypes, manualModeDetail, wheatherStowDetail, TimelineEvents } = require("../utils/constants");
const {getWeatherForecastStowByNCID} = require("../models/weatherForecast.model");
const {getCloudAlertByEventNameAndTitleLike, removeCloudAlertById} = require("../models/cloudAlert.model");

class TrackingChangesService {

  async handler(netCtrlId, pbUpdate, oldTrackingMode) {

    console.log("trackingChangesUpdate Handler ..");

    const changedAt = pbUpdate.getStateChangedAt().toDate();
    let trackingMode = pbUpdate.getUpdatedState();
    let trackingModeDetail = pbUpdate.getCommandedPreset();
    const hasDetail = hasModeDetail(trackingMode);


    const userName = pbUpdate.getUserName()
    const userEmail = pbUpdate.getUserEmail()
    const source = pbUpdate.getSource()

    try {

      const activeHailForecastStow = await getWeatherForecastStowByNCID(netCtrlId, StowTypes.HAIL_STOW, StowStates.STARTED, true);

      if (activeHailForecastStow && this.isHailStowCase(trackingMode, trackingModeDetail)) {
        console.log("HailStow - IS HAIL STOW CASE, WITH USER NAME", {userName, trackingMode, trackingModeDetail})
        trackingModeDetail = (trackingModeDetail === manualModeDetail.MAXIMUM_ANGLE)
          ? manualModeDetail.HAIL_STOW_MAX_ANGLE
          : manualModeDetail.HAIL_STOW_MIN_ANGLE

      }

      // if local weather station event
      // remove site from hail stow,
      if ( trackingModes.ESTOP_ENGAGE === trackingMode ||
        (trackingModes.WEATHER_STOW === trackingMode &&
        [
          wheatherStowDetail.ACCU_WEATHER_WIND_GUST,
          wheatherStowDetail.ACCU_WEATHER_AVG_WIND,
          wheatherStowDetail.TOO_COLD_TO_MOVE,
        ].includes(trackingModeDetail))) {

          if (activeHailForecastStow) {
            // mark hail weather forecase stow inactive
            // get active hail cloud alert
            // and clear hail alert if exist
            const activeHailAlert = await getCloudAlertByEventNameAndTitleLike(activeHailForecastStow?.nc_asset_id, TimelineEvents.NC_COMMANDED_STATE, 'hail')
            if (activeHailAlert?.id) {
              // remove hail cloud alert
              console.log("HailStowService - Removed hail cloud alert ", JSON.stringify(activeHailAlert));
              await removeCloudAlertById(activeHailAlert.id)
            }
          }

      }
    } catch (error) {
      console.log("ERROR, in processing hail stow case", error);
    }

    await networkController.addTrackingModeHistory(
      netCtrlId,
      changedAt,
      trackingMode,
      hasDetail ? trackingModeDetail : null
    );


    if (trackingMode != oldTrackingMode) {
      console.log(`commanded stage changed from ${oldTrackingMode} -> ${trackingMode}`);

      if (trackingMode === trackingModes.ESTOP_ENGAGE) {
        await networkController.updateEStopEngageAt(netCtrlId, changedAt);
      }

      if (oldTrackingMode === trackingModes.ESTOP_ENGAGE) {
        await networkController.updateEStopDisengageAt(netCtrlId, changedAt);
      }
    }

    await networkController.updateTrackingMode(
      netCtrlId,
      changedAt,
      trackingMode,
      trackingModeDetail,
      userName,
      userEmail,
      source
    );

    await notificationHelper.sendTrackingModeChangeToELK(pbUpdate, trackingMode, trackingModeDetail);
  }

  isHailStowCase (trackingMode, trackingModeDetail) {
    console.log("isHailStowCase: ", trackingMode, trackingModeDetail);
    console.log("IS MANUAL MODE: ", trackingMode === trackingModes.MANUAL_STOW);
    console.log("IS MANUAL MIN MAX MODE: ", [manualModeDetail.MAXIMUM_ANGLE, manualModeDetail.MINIMUM_ANGLE].includes(trackingModeDetail));
    return (
      trackingMode === trackingModes.MANUAL_STOW &&
      [manualModeDetail.MAXIMUM_ANGLE, manualModeDetail.MINIMUM_ANGLE].includes(trackingModeDetail)
    )
  }
}

exports.trackingChangesService = new TrackingChangesService();
