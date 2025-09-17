const db = require("../db");
const { SiteStowTiltType } = require("../utils/constants");
const { exeQuery } = require("../utils/lib/pg");
// const { updateProjectType } = require("../models/project.model");
class SiteConfigUpdatesService {
  async handler(net_ctrl_id, assetId, pbUpdate) {
    // Update and the principal, needed in one of the queries
    try {
      console.log("In siteConfigUpdatesHandler .. ");
      this.siteConfigUpdate = pbUpdate;
      // let when = this.siteConfigUpdate.getWhen().toDate();
      // let site_name = this.siteConfigUpdate.getSiteName();
      let site_contact = this.siteConfigUpdate.getSiteContact();
      let site_organization = this.siteConfigUpdate.getSiteOrganization();
      let gps_lat = this.siteConfigUpdate.getGpsLat();
      let gps_lng = this.siteConfigUpdate.getGpsLng();
      let gps_alt = this.siteConfigUpdate.getGpsAlt();
      let enable_nightly_shutdown = this.siteConfigUpdate.getEnableNightlyShutdown();
      let power_off = this.siteConfigUpdate.getPowerOff();
      let power_on = this.siteConfigUpdate.getPowerOn();
      let enable_low_power_shutdown = this.siteConfigUpdate.getEnableLowPowerShutdown();
      let cell_modem_warning_voltage = this.siteConfigUpdate.getCellModemWarningVoltage();
      let cell_modem_cutoff_voltage = this.siteConfigUpdate.getCellModemCutoffVoltage();
      let cell_modem_cuton_voltage = this.siteConfigUpdate.getCellModemCutonVoltage();
      let gateway_warning_voltage = this.siteConfigUpdate.getGatewayWarningVoltage();
      let gateway_cutoff_voltage = this.siteConfigUpdate.getGatewayCutoffVoltage();
      let wind_speed_threshold = this.siteConfigUpdate.getWindSpeedThreshold();
      let wind_gust_threshold = this.siteConfigUpdate.getWindGustThreshold();
      let snow_depth_threshold = this.siteConfigUpdate.getSnowDepthThreshold();
      let panel_snow_depth_threshold = this.siteConfigUpdate.getPanelSnowDepthThreshold();
      let enable_wind_speed_stow = this.siteConfigUpdate.getEnableWindSpeedStow();
      let enable_wind_gust_stow = this.siteConfigUpdate.getEnableWindGustStow();
      let enable_snow_depth_stow = this.siteConfigUpdate.getEnableSnowDepthStow();
      let enable_panel_snow_depth_stow = this.siteConfigUpdate.getEnablePanelSnowDepthStow();
      let minimum_stations_required = this.siteConfigUpdate.getMinimumStationsRequired();
      let wind_speed_duration_required = this.siteConfigUpdate.getWindSpeedDurationRequired();
      let resume_tracking_after_wind_timeout = this.siteConfigUpdate.getResumeTrackingAfterWindTimeout();
      let resume_tracking_after_snow_timeout = this.siteConfigUpdate.getResumeTrackingAfterSnowTimeout();
      let resume_tracking_after_panel_snow_timeout = this.siteConfigUpdate.getResumeTrackingAfterPanelSnowTimeout();
      let enable_snow_depth_averaging = this.siteConfigUpdate.getEnableSnowDepthAveraging();
      let enable_panel_snow_depth_averaging = this.siteConfigUpdate.getEnablePanelSnowDepthAveraging();

      let wind_reporting_close_percentage = this.siteConfigUpdate.getWindReportingClosePercentage();
      let wind_reporting_close_interval = this.siteConfigUpdate.getWindReportingCloseInterval();
      let wind_reporting_over_interval = this.siteConfigUpdate.getWindReportingOverInterval();
      let snow_reporting_close_percentage = this.siteConfigUpdate.getSnowReportingClosePercentage();
      let snow_reporting_close_interval = this.siteConfigUpdate.getSnowReportingCloseInterval();
      let snow_reporting_over_interval = this.siteConfigUpdate.getSnowReportingOverInterval();

      let enter_diffuse_mode_duration = this.siteConfigUpdate.getEnterDiffuseModeDuration();
      let exit_diffuse_mode_duration = this.siteConfigUpdate.getExitDiffuseModeDuration();
      let enable_diffuse_mode = this.siteConfigUpdate.getEnableDiffuseMode();

      let enable_too_cold_to_move_stow = this.siteConfigUpdate.getEnableTooColdToMoveStow();
      let too_cold_to_move_stow_temp_threshold = this.siteConfigUpdate.getTooColdToMoveStowTempThreshold();
      let too_cold_to_move_stow_temp_low_threshold = this.siteConfigUpdate.getTooColdToMoveStowTempLowThreshold();
      let resume_tracking_after_too_cold_to_move_timeout = this.siteConfigUpdate.getResumeTrackingAfterTooColdToMoveTimeout();
      let enable_specfile_from_slui = this.siteConfigUpdate.getEnableSpecfileFromSlui();
      let site_type = this.siteConfigUpdate.getSiteType();
      let StowLogic = this.siteConfigUpdate.getStowLogic();
      let enable_snow_shedding = this.siteConfigUpdate.getEnableSnowShedding();
      let snow_shedding_threshold = this.siteConfigUpdate.getSnowSheddingThreshold();
      let snow_shedding_duration = this.siteConfigUpdate.getSnowSheddingDuration();
      let median_filter_length = this.siteConfigUpdate.getMedianFilterLength();

      if (net_ctrl_id) {
        const assetInfoByNCIdResult = await exeQuery(
          db.getSiteConfByAssetIdQuery,
          [assetId]
        )
          .catch((err) => {
            console.log("Error in assetInfoByNCIdResult query .. ", err);
          });

        if (assetInfoByNCIdResult.rows.length !== 0) {
          //update site_type in project
          if (site_type === '1P') {
            site_type = '1P';
          } else {
            site_type = '2P';
          }

          if (StowLogic) {
            StowLogic = (StowLogic === 'LOW_TILT') ? SiteStowTiltType['low_tilt'] : SiteStowTiltType['high_tilt'];
          } else {
            StowLogic = (site_type === '1P') ? SiteStowTiltType['low_tilt'] : SiteStowTiltType['high_tilt'];
          }                

          // await updateProjectType(assetInfoByNCIdResult.rows[0].site_id, site_type);
          console.log(
            db.updateSiteConfQuery,
            [
              site_contact,
              site_organization,
              gps_lat,
              gps_lng,
              gps_alt,
              enable_nightly_shutdown,
              power_off,
              power_on,
              enable_low_power_shutdown,
              cell_modem_warning_voltage,
              cell_modem_cutoff_voltage,
              cell_modem_cuton_voltage,
              gateway_warning_voltage,
              gateway_cutoff_voltage,
              wind_speed_threshold,
              wind_gust_threshold,
              snow_depth_threshold / 0.0254,
              panel_snow_depth_threshold / 0.0254,
              enable_wind_speed_stow,
              enable_wind_gust_stow,
              enable_snow_depth_stow,
              enable_panel_snow_depth_stow,
              minimum_stations_required,
              wind_speed_duration_required,
              resume_tracking_after_wind_timeout,
              resume_tracking_after_snow_timeout,
              resume_tracking_after_panel_snow_timeout,
              enable_snow_depth_averaging,
              enable_panel_snow_depth_averaging,
              wind_reporting_close_percentage,
              wind_reporting_close_interval,
              wind_reporting_over_interval,
              snow_reporting_close_percentage,
              snow_reporting_close_interval,
              snow_reporting_over_interval,
              enter_diffuse_mode_duration,
              exit_diffuse_mode_duration,
              enable_diffuse_mode,
              enable_too_cold_to_move_stow,
              too_cold_to_move_stow_temp_threshold,
              too_cold_to_move_stow_temp_low_threshold,
              resume_tracking_after_too_cold_to_move_timeout,
              enable_specfile_from_slui,
              site_type,
              enable_snow_shedding,
              snow_shedding_threshold,
              snow_shedding_duration,
              median_filter_length,
              StowLogic,
              assetInfoByNCIdResult.rows[0].id,
            ]
          );

          //update values in existing row
          const thresholdValuesUpdateResult = await exeQuery(
            db.updateSiteConfQuery,
            [
              site_contact,
              site_organization,
              gps_lat,
              gps_lng,
              gps_alt,
              enable_nightly_shutdown,
              power_off,
              power_on,
              enable_low_power_shutdown,
              cell_modem_warning_voltage,
              cell_modem_cutoff_voltage,
              cell_modem_cuton_voltage,
              gateway_warning_voltage,
              gateway_cutoff_voltage,
              wind_speed_threshold,
              wind_gust_threshold,
              snow_depth_threshold / 0.0254,
              panel_snow_depth_threshold / 0.0254,
              enable_wind_speed_stow,
              enable_wind_gust_stow,
              enable_snow_depth_stow,
              enable_panel_snow_depth_stow,
              minimum_stations_required,
              wind_speed_duration_required,
              resume_tracking_after_wind_timeout,
              resume_tracking_after_snow_timeout,
              resume_tracking_after_panel_snow_timeout,
              enable_snow_depth_averaging,
              enable_panel_snow_depth_averaging,
              wind_reporting_close_percentage,
              wind_reporting_close_interval,
              wind_reporting_over_interval,
              snow_reporting_close_percentage,
              snow_reporting_close_interval,
              snow_reporting_over_interval,
              enter_diffuse_mode_duration,
              exit_diffuse_mode_duration,
              enable_diffuse_mode,
              enable_too_cold_to_move_stow,
              too_cold_to_move_stow_temp_threshold,
              too_cold_to_move_stow_temp_low_threshold,
              resume_tracking_after_too_cold_to_move_timeout,
              enable_specfile_from_slui,
              site_type,
              enable_snow_shedding,
              snow_shedding_threshold,
              snow_shedding_duration,
              median_filter_length,
              StowLogic,
              assetInfoByNCIdResult.rows[0].id,
            ]
          );
          console.log(
            "query thresholdValuesUpdateResult response: ",
            thresholdValuesUpdateResult.rowCount
          );
        } else {
          //if no row found print errors
          console.log("No Site configuration found in database");
        }
      } else {
        console.log("No Network Controller found in database");
      }

      return true;
    } catch (err) {
      console.error("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in siteConfigUpdates handler..!!"
      );
    }
  }
}

exports.siteConfigUpdatesService = new SiteConfigUpdatesService();
