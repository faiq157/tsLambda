//NC-to-DB lambda in develop branch
const {
  assetRadioUpdatesService,
} = require("./services/assetRadioUpdatesService");
const { assetRestartedService } = require("./services/assetRestartedService");
const { assetUpdatesService } = require("./services/assetUpdatesService");
const { batteryUpdatesService } = require("./services/batteryUpdatesService");
const { firmwareUpgradeReportUpdateService } = require("./services/FirmwareUpgradeReportUpdateService");
const { ncParametersUpdate } = require("./services/ncParametersUpdate");
const {
  cellDailyUpdatesService,
} = require("./services/cellDailyUpdatesService");
const { cellUpdatesService } = require("./services/cellUpdatesService");
const { chargerUpdatesService } = require("./services/chargerUpdatesService");
const {
  clearLogEntriesService,
} = require("./services/clearLogEntriesService");
const { configUpdatesService } = require("./services/configUpdatesService");
const { gpsService } = require("./services/gpsService");
const { logEntriesService } = require("./services/logEntriesService");
const { panelServiceN } = require("./services/panelServiceN");
const { rackAngleService } = require("./services/rackAngleService");
const {
  siteConfigUpdatesService,
} = require("./services/siteConfigUpdatesService");
const {
  solarInfoUpdatesService,
} = require("./services/solarInfoUpdatesService");
const { startupDataService } = require("./services/startupDataService");
const { tcDayUpdatesService } = require("./services/tcDayUpdatesService");
const { tcHourUpdatesService } = require("./services/tcHourUpdatesService");
const { tcUpdatesService } = require("./services/tcUpdatesService");
const {
  trackingChangesService,
} = require("./services/trackingChangesService");
const {
  weatherStowUpdatesService,
} = require("./services/weatherStowUpdatesService");
const { weatherUpdatesService } = require("./services/weatherUpdatesService");
const {
  weatherReportingUpdateService,
} = require("./services/weatherReportingUpdateService");
const { bridgeUpdatesService } = require("./services/bridgeUpdatesService");
const {
  CommandStatusUpdateService,
} = require("./services/commandStatusUpdateService");
const {
  motorCurrentUpdateService,
} = require("./services/motorCurrentUpdateService");
const {
  assetPresetChangedService,
} = require("./services/assetPresetChangedService");
const {
  configuredVersionsService
} = require("./services/configuredVersionsService");
const {
  vegetationUpdateService
} = require("./services/vegetationUpdateService");

const { irradianceUpdateService } = require("./services/IrradianceUpdateService");

const { accuWeatherUpdatesService } = require("./services/accuWeatherUpdatesService");

const { qaqcReportUpdateService } = require("./services/qaqcReportUpdateService")

const { increaseWeatherReportingUpdateService } = require("./services/IncreaseWeatherReportingUpdateService");
const { toggleFastTrakUpdateService } = require("./services/toggleFastTrakUpdate");
const { snowSheddingUpdateService } = require("./services/snowSheddingUpdateService");
const { snowSheddingReportUpdateService } = require("./services/snowSheddingReportUpdateService");

let handler = async (pb, event, cloudUpdatesPb) => {
  try {
    const netCtrlResults = event.netCtrlResults;
    const { asset_id: nc_asset_id, id: net_ctrl_id, commanded_state, site_id, commanded_state_detail } = netCtrlResults.rows[0];
    //console.log("NC_ID: ", net_ctrl_id);
    //console.log("NC_NAME: ", netCtrlResults.rows[0].name);
    //event.timestamp = moment.utc().format();
    // console.log("NC connection update");

    // console.log(cloudUpdatesPb)
    // console.log(cloudUpdatesPb.getTcDayUpdatesList())

    // GPSUpdates service
    if (cloudUpdatesPb.getGpsUpdates()) {
      await gpsService
        .handler(cloudUpdatesPb)
        .then((res) => {
          console.log("response from GPSUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in gpsUpdates Service module .. ", err);
          // return err;
        });
    }
    for (let update of cloudUpdatesPb.getTrackingChangesList()) {
      console.log("getTrackingChangesList ", net_ctrl_id, nc_asset_id, commanded_state, commanded_state_detail);
      await trackingChangesService
        .handler(net_ctrl_id, update, commanded_state, commanded_state_detail)
        .then((res) => {
          console.log("Response from trackingChangesService :", res);
        })
        .catch((err) => {
          console.trace("Error in getTrackingChangesListTest.. ", err);
          // throw err;
        });
    }

    for (let tcInstantUpdate of cloudUpdatesPb.getTcUpdatesList()) {
      console.log("getTcUpdatesList ", net_ctrl_id);
      let ncSnapAddr_asU8 = cloudUpdatesPb.getNcSnapAddr_asU8();

      await tcUpdatesService
        .handler(net_ctrl_id, ncSnapAddr_asU8, tcInstantUpdate)
        .then((res) => {
          console.log("response from tcUpdatesService :", res);
        })
        .catch((err) => {
          console.error("Failure in tcUpdatesService module ..", err);
          // throw err;
        });
    }

    for (let update of cloudUpdatesPb.getTcHourUpdatesList()) {
      console.log("getTcHourUpdatesList ", net_ctrl_id);
      let ncSnapAddr_asU8 = cloudUpdatesPb.getNcSnapAddr_asU8();
      await tcHourUpdatesService
        .handler(pb, net_ctrl_id, ncSnapAddr_asU8, update)
        .then((res) => {
          console.log("response from tcHourUpdatesService :", res);
        })
        .catch((err) => {
          console.error("Failure in tcHourUpdates module ..", err);
          // throw err;
        });
    }

    // tcDayUpdates service
    for (let update of cloudUpdatesPb.getTcDayUpdatesList()) {
      console.log("getTcDayUpdatesList ", net_ctrl_id);
      let ncSnapAddr_asU8 = cloudUpdatesPb.getNcSnapAddr_asU8();
      await tcDayUpdatesService
        .handler(pb, net_ctrl_id, ncSnapAddr_asU8, update)
        .then((res) => {
          console.log("response from tcDayUpdatesService :", res);
        })
        .catch((err) => {
          console.error("Failure in tcDayUpdates module ..", err);
          // throw err;
        });
    }

    // rackAngle service
    for (let update of cloudUpdatesPb.getRackAnglesList()) {
      console.log("getRackAnglesList: ", net_ctrl_id);
      let ncSnapAddr_asU8 = cloudUpdatesPb.getNcSnapAddr_asU8();
      await rackAngleService
        .handler(net_ctrl_id, ncSnapAddr_asU8, update)
        .then(() => {
          console.log("response from rackAngleService :");
        })
        .catch((err) => {
          console.error("Failure in rackAngles module ..", err);
          // throw err;
        });
    }

    // panelUpdates service
    for (let panelUpdate of cloudUpdatesPb.getPanelUpdateList()) {
      console.log("getPanelUpdateList ", net_ctrl_id);

      await panelServiceN
        .handler(panelUpdate)
        .then((res) => {
          console.log("response from panelService :", res);
        })
        .catch((err) => {
          console.error("Failure in panelService module ..", err);
        });
    }

    // weatherReporting service
    if (cloudUpdatesPb.getWeatherReportingUpdate()) {
      console.log("getWeatherReportingUpdate ", net_ctrl_id);
      await weatherReportingUpdateService
        .handler(
          cloudUpdatesPb.getWeatherReportingUpdate(),
          net_ctrl_id
        )
        .then((res) => {
          console.log("response from getWeatherReportingUpdate Service :", res);
        })
        .catch((err) => {
          console.error(
            "Failure in getWeatherReportingUpdate Service module ..",
            err
          );
          // throw err;
        });
    }

    // logEntries service
    for (let logEntry of cloudUpdatesPb.getLogEntriesList()) {
      console.log("getLogEntriesList ", net_ctrl_id);
      await logEntriesService
        .handler(net_ctrl_id, logEntry)
        .then((res) => {
          console.log("response from logEntries Service :", res);
        })
        .catch((err) => {
          console.error("Failure in logEntries Service module ..", err);
          // throw err;
        });
    }

    // clearLogEntries service
    for (let update of cloudUpdatesPb.getClearLogEntriesList()) {
      await clearLogEntriesService
        .handler(net_ctrl_id, update)
        .then((res) => {
          console.log("response from clearLogEntries Service :", res);
        })
        .catch((err) => {
          console.error("Failure in clearLogEntries Service module ..", err);
          // throw err;
        });
    }
    /*
        // alertUpdates service
        for (let update of cloudUpdatesPb.getAlertUpdatesList()) {
          await alertUpdatesService
            .handler(net_ctrl_id, update)
            .then((res) => {
              console.log("response from alertUpdates Service :", res);
            })
            .catch((err) => {
              console.error("Failure in alertUpdates Service module ..", err);
              // throw err;
            });
        }

        // activeAlerts service
        let activeAlerts = cloudUpdatesPb.getActiveAlertsList();
        if (activeAlerts.length) {
          console.log("About to call activeAlertsService .. ");
          await activeAlertsService
            .handler(net_ctrl_id, activeAlerts)
            .then((res) => {
              console.log("response from activeAlertsService : ", res);
              return res;
            })
            .catch((err) => {
              console.error("Failure in activeAlerts module .. ", err);
              // throw err;
            });
        }
    */
    for (let update of cloudUpdatesPb.getBatteryUpdatesList()) {
      console.log("batteryHist ", net_ctrl_id);
      await batteryUpdatesService
        .handler(update)
        .then((res) => {
          console.log("response from batteryUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in batteryUpdates Service module ..", err);
          // throw err;
        });
    }

    // weatherUpdates service
    for (let update of cloudUpdatesPb.getWeatherUpdatesList()) {
      console.log("getWeatherUpdatesList ", net_ctrl_id);
      await weatherUpdatesService
        .handler(update, event)
        .then((res) => {
          console.log("response from weatherUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in weatherUpdates Service module ..", err);
          // throw err;
        });
    }

    // weatherStowUpdates service
    if (cloudUpdatesPb.getWeatherStowUpdates()) {
      console.log("getWeatherStowUpdatesList ", net_ctrl_id);
      await weatherStowUpdatesService
        .handler(net_ctrl_id, cloudUpdatesPb.getWeatherStowUpdates())
        .then((res) => {
          console.log("response from weatherStowUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in weatherStowUpdates Service module ..", err);
          // throw err;
        });
    }
    if (cloudUpdatesPb.getAssetPresetChanged()) {
      console.log("getAssetPresetChanged ", net_ctrl_id);
      await assetPresetChangedService
        .handler(cloudUpdatesPb.getAssetPresetChanged())
        .then((res) => {
          console.log("response from getAssetPresetChanged Service :", res);
        })
        .catch((err) => {
          console.error(
            "Failure in getAssetPresetChanged Service module .. ",
            err
          );
          // return err;
        });
    }
    // startupDataUpdate service
    for (let startupDataUpdate of cloudUpdatesPb.getStartUpDataList()) {
      console.log("getStartUpDataList ", net_ctrl_id);
      await startupDataService
        .handler(netCtrlResults, startupDataUpdate)
        .then((res) => {
          console.log("response from startupData Service :", res);
        })
        .catch((err) => {
          console.error("Failure in startupData Service module ..", err);
          // throw err;
        });
    }

    //siteConfigUpdates service
    if (cloudUpdatesPb.getSiteConfigUpdates()) {
      console.log("getSiteConfigUpdates ", net_ctrl_id);
      await siteConfigUpdatesService
        .handler(
          net_ctrl_id,
          netCtrlResults.rows[0].asset_id,
          cloudUpdatesPb.getSiteConfigUpdates()
        )
        .then((res) => {
          console.log("response from siteConfigUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in siteConfigUpdates Service module .. ", err);
          // return err ;
        });
    }

    // configUpdates service
    for (let configUpdate of cloudUpdatesPb.getConfigUpdatesList()) {
      console.log("getConfigUpdatesList ", net_ctrl_id);
      await configUpdatesService
        .handler(configUpdate, net_ctrl_id)
        .then((res) => {
          console.log("response from configUpdates Service :", res);
        })
        .catch((err) => {
          console.log("Failure in configUpdates Service module ..", err);
          // throw err;
        });
    }

    // assetsUpdates service
    for (let update of cloudUpdatesPb.getAssetUpdatesList()) {
      const ncSnapAddr = cloudUpdatesPb.getNcSnapAddr_asU8();
      await assetUpdatesService
        .handler(net_ctrl_id, ncSnapAddr, update)
        .then((res) => {
          console.log("response from assetUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in assetUpdates Service module ..", err);
          // throw err;
        });
    }

    // cellUpdates service
    if (cloudUpdatesPb.getCellUpdates()) {
      console.log("getCellUpdates ", net_ctrl_id);
      await cellUpdatesService
        .handler(cloudUpdatesPb.getCellUpdates(), event.principal)
        .then((res) => {
          console.log("response from cellUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in cellUpdates Service module ..", err);
          // throw err;
        });
    }

    // cellDailyUpdates service
    if (cloudUpdatesPb.getCellDailyUpdates()) {
      console.log("getCellDailyUpdates ", net_ctrl_id);
      await cellDailyUpdatesService
        .handler(
          cloudUpdatesPb.getCellDailyUpdates(),
          event.principal
        )
        .then((res) => {
          console.log("response from cellDailyUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in cellDailyUpdates Service module ..", err);
          // throw err;
        });
    }

    // assetRadioUpdates service
    for (let update of cloudUpdatesPb.getAssetRadioUpdatesList()) {
      console.log("getAssetRadioUpdatesList ", net_ctrl_id);
      let ncSnapAddr_asU8 = cloudUpdatesPb.getNcSnapAddr_asU8();
      await assetRadioUpdatesService
        .handler(net_ctrl_id, ncSnapAddr_asU8, update)
        .then((res) => {
          console.log("response from assetRadioUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in assetRadioUpdates Service module ..", err);
          // throw err;
        });
    }

    // assetRestarted service
    if (cloudUpdatesPb.getAssetRestarted()) {
      console.log("getAssetRestarted ", net_ctrl_id);
      await assetRestartedService
        .handler(cloudUpdatesPb.getAssetRestarted())
        .then((res) => {
          console.log("response from assetRestarted Service :", res);
        })
        .catch((err) => {
          console.error("Failure in assetRestarted Service module ..", err);
          // throw err;
        });
    }

    // chargerUpdates service
    for (let update of cloudUpdatesPb.getChargerUpdatesList()) {
      console.log("chargerUpdate ", net_ctrl_id);
      await chargerUpdatesService
        .handler(update)
        .then((res) => {
          console.log("response from chargerUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in chargerUpdates Service module ..", err);
          // throw err;
        });
    }

    // solarInfoUpdates service
    if (cloudUpdatesPb.getSolarInfoUpdates()) {
      console.log("getSolarInfoUpdates ", net_ctrl_id);
      await solarInfoUpdatesService
        .handler(
          netCtrlResults,
          cloudUpdatesPb.getSolarInfoUpdates()
        )
        .then((res) => {
          console.log("response from solarInfoUpdates Service :", res);
        })
        .catch((err) => {
          console.error("Failure in solarInfoUpdates Service module .. ", err);
          // return err;
        });
    }
    // BridgeUpdate service
    if (cloudUpdatesPb.getBridgeUpdates()) {
      console.log("getBridgeUpdates ", net_ctrl_id);
      await bridgeUpdatesService
        .handler(net_ctrl_id, cloudUpdatesPb.getBridgeUpdates())
        .then((res) => {
          console.log("response from getBridgeUpdates Service :", res.rowCount);
        })
        .catch((err) => {
          console.error("Failure in getBridgeUpdates Service module .. ", err);
          // return err;
        });
    }
    if (cloudUpdatesPb.getCommandStatus()) {
      console.log("getCommandStatus ", net_ctrl_id);
      let handlerClass = new CommandStatusUpdateService(
        net_ctrl_id,
        cloudUpdatesPb.getCommandStatus()
      );
      await handlerClass
        .handler()
        .then((res) => {
          console.log("response from getCommandStatus Service :", res);
        })
        .catch((err) => {
          console.error("Failure in getCommandStatus Service module .. ", err);
          // return err;
        });
    }

    if (cloudUpdatesPb.getMotorCurrentUpdate()) {
      console.log("getMotorCurrentUpdate ", net_ctrl_id);
      await motorCurrentUpdateService
        .handler(cloudUpdatesPb.getMotorCurrentUpdate())
        .then((res) => {
          console.log("response from getMotorCurrentUpdate Service :", res);
        })
        .catch((err) => {
          console.error(
            "Failure in getMotorCurrentUpdate Service module .. ",
            err
          );
          // return err;
        });
    }
    if (cloudUpdatesPb.getVegetationUpdate()) {
      console.log("getVegetationUpdate ", net_ctrl_id);
      await vegetationUpdateService.handler(cloudUpdatesPb.getVegetationUpdate(), net_ctrl_id, cloudUpdatesPb.getNcSnapAddr_asU8())
        .then((res) => {
          console.log("response from getVegetationUpdate Service :", res);
        })
        .catch((err) => {
          console.error(
            "Failure in getVegetationUpdate Service module .. ",
            err
          );
          // return err;
        });
    }
    if (cloudUpdatesPb.getConfiguredVersions()) {
      console.log("getConfiguredVersions ", net_ctrl_id);
      await configuredVersionsService
        .handler(cloudUpdatesPb.getConfiguredVersions(), net_ctrl_id)
        .then((res) => {
          console.log("response from getConfiguredVersions Service :", res);
        })
        .catch((err) => {
          console.error(
            "Failure in getConfiguredVersions Service module .. ",
            err
          );
          // return err;
        });
    }
    if (cloudUpdatesPb.getCloudAccuWeatherUpdate()) {
      console.log("getCloudAccuWeatherUpdate ", net_ctrl_id, site_id);
      await accuWeatherUpdatesService
        .handler(net_ctrl_id, site_id, event.principal, cloudUpdatesPb.getCloudAccuWeatherUpdate())
        .then((res) => {
          console.log("response from accuWeatherUpdatesService :", res);
        })
        .catch((err) => {
          console.error("Failure in accuWeatherUpdatesService .. ", err);
          // return err;
        });
    }

    if (cloudUpdatesPb.getIrradianceUpdate()) {
      await irradianceUpdateService.handler(net_ctrl_id, nc_asset_id, cloudUpdatesPb.getNcSnapAddr_asU8(), cloudUpdatesPb.getIrradianceUpdate())
        .catch((err) => {
          console.error("Failure in getIrradianceUpdate .. ", err);
          // return err;
        });
    }

    if (cloudUpdatesPb.getQaqcReportUpdate()) {
      await qaqcReportUpdateService.handler(cloudUpdatesPb.getQaqcReportUpdate())
        .catch((err) => {
          console.error("Failure in getQaqcReportUpdate() .. ", err);
          // return err;
        });
    }

    if (cloudUpdatesPb.getToggleFastTrakUpdate()) {
      await toggleFastTrakUpdateService.handler(cloudUpdatesPb.getToggleFastTrakUpdate())
        .catch((err) => {
          console.error("Failure in getToggleFastTrakUpdate() .. ", err);
          // return err;
        });
    }

    if (cloudUpdatesPb.getIncreaseWeatherReporting()) {
      await increaseWeatherReportingUpdateService.handler(
        net_ctrl_id, cloudUpdatesPb.getIncreaseWeatherReporting())
        .catch((err) => {
          console.error("Failure in cloudUpdatesPb.getIncreaseWeatherReporting(() .. ", err);
          // return err;
        });
    }

    if (cloudUpdatesPb.getSnowSheddingUpdate()) {
      console.log("getSnowSheddingUpdate ", net_ctrl_id);
      await snowSheddingUpdateService.handler(
        cloudUpdatesPb.getSnowSheddingUpdate())
        .catch((err) => {
          console.error("Failure in cloudUpdatesPb.getSnowSheddingUpdate() .. ", err);
          // return err;
        });
    }

    if (cloudUpdatesPb.getSnowSheddingReportUpdate()) {
      console.log("getSnowSheddingReportUpdate ", net_ctrl_id);
      await snowSheddingReportUpdateService.handler(
        cloudUpdatesPb.getSnowSheddingReportUpdate())
        .catch((err) => {
          console.error("Failure in cloudUpdatesPb.getSnowSheddingReportUpdate() .. ", err);
          // return err;
        });
    }

    // firmware upgrade service
    if (cloudUpdatesPb.getFirmwareUpgradeReportUpdate()) {
      await firmwareUpgradeReportUpdateService
        .handler(cloudUpdatesPb.getFirmwareUpgradeReportUpdate())
        .then((res) => {
          console.log("response from FirmwareUpgradeReportUpdate Service :", res);
        })
        .catch((err) => {
          console.error("Failure in FirmwareUpgradeReportUpdate Service module .. ", err);
          // return err;
        });
    }

    // NCParametersUpdate service
    if (cloudUpdatesPb.getNcParamsUpdate()) {
      await ncParametersUpdate
        .handler(cloudUpdatesPb.getNcParamsUpdate())
        .then((res) => {
          console.log("response from cloudUpdatesPb getNCParametersUpdate :", res);
        })
        .catch((err) => {
          console.error("Failure in cloudUpdatesPb.getNCParametersUpdate Service module .. ", err);
        });
    }

    //await pg.end();
  } catch (err) {
    console.error("Application ERROR:", err);
    //await pg.end();
    return true;
  }
  return true;
};

module.exports = { handler };
