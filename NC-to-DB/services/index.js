const { cloudAccuWeatherUpdate } = require("./accuWeatherUpdatesService");
// const { activeAlertsService } = require("./activeAlertsService");
// const { alertUpdatesService } = require("./alertUpdatesService");
const { assetPresetChangedService } = require("./assetPresetChangedService");
const { assetRadioUpdatesService } = require("./assetRadioUpdatesService");
const { assetRestartedService } = require("./assetRestartedService");
const { assetUpdatesService } = require("./assetUpdatesService");
const { batteryUpdatesService } = require("./batteryUpdatesService");
const { bridgeUpdatesService } = require("./bridgeUpdatesService");
const { cellDailyUpdatesService } = require("./cellDailyUpdatesService");
const { cellUpdatesService } = require("./cellUpdatesService");
const { chargerUpdatesService } = require("./chargerUpdatesService");
const { clearLogEntriesService } = require("./clearLogEntriesService");
const { CommandStatusUpdateService } = require("./commandStatusUpdateService");
const { configUpdatesService } = require("./configUpdatesService");
const { configuredVersionsService } = require("./configuredVersionsService");
const { gpsService } = require("./gpsService");
const { irradianceUpdateService } = require("./IrradianceUpdateService");
const { logEntriesService } = require("./logEntriesService");
const { motorCurrentUpdateService } = require("./motorCurrentUpdateService");
const { panelServiceN } = require("./panelServiceN");
const { rackAngleService } = require("./rackAngleService");
const { siteConfigUpdatesService } = require("./siteConfigUpdatesService");
// const { sleepModeDataService } = require("./sleepModeDataService");
const { solarInfoUpdatesService } = require("./solarInfoUpdatesService");
const { startupDataService } = require("./startupDataService");
const { tcDayUpdatesService } = require("./tcDayUpdatesService");
const { tcHourUpdatesService } = require("./tcHourUpdatesService");
const { tcUpdatesService } = require("./tcUpdatesService");
const { trackingChangesService } = require("./trackingChangesService");
const { vegetationUpdateService } = require("./vegetationUpdateService");
// const { weatherConfigUpdatesService } = require("./weatherConfigUpdatesService");
const { weatherReportingUpdateService } = require("./weatherReportingUpdateService");
const { weatherStowUpdatesService } = require("./weatherStowUpdatesService");
const { weatherUpdatesService } = require("./weatherUpdatesService");
const { increaseWeatherReportingUpdateService } = require("./IncreaseWeatherReportingUpdateService");



module.exports = {
  cloudAccuWeatherUpdate,
  // activeAlertsService,
  // alertUpdatesService,
  assetPresetChangedService,
  assetRadioUpdatesService,
  assetRestartedService,
  assetUpdatesService,
  batteryUpdatesService,
  bridgeUpdatesService,
  cellDailyUpdatesService,
  cellUpdatesService,
  chargerUpdatesService,
  clearLogEntriesService,
  CommandStatusUpdateService,
  configUpdatesService,
  configuredVersionsService,
  gpsService,
  irradianceUpdateService,
  logEntriesService,
  motorCurrentUpdateService,
  panelServiceN,
  rackAngleService,
  siteConfigUpdatesService,
  // sleepModeDataService,
  solarInfoUpdatesService,
  startupDataService,
  tcDayUpdatesService,
  tcHourUpdatesService,
  tcUpdatesService,
  trackingChangesService,
  vegetationUpdateService,
  // weatherConfigUpdatesService,
  weatherReportingUpdateService,
  weatherStowUpdatesService,
  weatherUpdatesService,
  increaseWeatherReportingUpdateService
};
