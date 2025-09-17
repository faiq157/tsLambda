const { RecordNotCreatedException } = require("../utils/customExceptions");
const { exeQuery } = require("../utils/lib/pg");
const { getContext } = require("../utils/lib/context");
const { getAddressApi } = require("../utils/helpers/functions");

const db = require("../db");
const {
  getProjectByNCPrincipleID,
  updateProjectGPSCoordsFromFirstNC,
  updateProjectLocationDetailByProjectId,
} = require("../models/project.model");
const {
  getNcSnapAddrU8ByPrincipalId,
} = require("../models/network.controller.model");

class GPSService {
  constructor() {
    this.pbUpdate = null;
    this.gpsUpdate = null;
    this.ncSnapAddrAsU8 = null;
  }

  async handler(pbUpdate) {
    this.pbUpdate = pbUpdate;
    this.gpsUpdate = pbUpdate.getGpsUpdates();
    this.lat = this.gpsUpdate.getLatitude();
    this.lng = this.gpsUpdate.getLongitude();
    this.alt = this.gpsUpdate.getAltitude();
    const { principalId } = getContext();
    this.ncPrincipalId = principalId;
    this.project = await getProjectByNCPrincipleID(principalId);

    try {
      await this.ensureNcSnapAddrIsPresent();

      let gpsId = await this.getGPSId();
      return await this.insertGPSHist(gpsId);
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error("Operation not completed error GPSService handler..!!");
    }
  }

  async ensureNcSnapAddrIsPresent() {
    if (this.ncSnapAddrAsU8) return;
    if (
      this.pbUpdate.getNcSnapAddr_asU8() &&
      this.pbUpdate.getNcSnapAddr_asU8().length > 0
    ) {
      this.ncSnapAddrAsU8 = this.pbUpdate.getNcSnapAddr_asU8();
      return;
    }
    if (this.ncPrincipalId) {
      this.ncSnapAddrAsU8 = await getNcSnapAddrU8ByPrincipalId(
        this.ncPrincipalId
      );
    }
    if (!this.ncSnapAddrAsU8) {
      throw new Error("No network controller snap address found");
    }
  }

  async getGPSId() {
    try {
      let res = await exeQuery(db.gpsIdQueryWhereSnapAddrMatch, [
        this.ncSnapAddrAsU8,
      ]);

      if (
        res.rows.length === 0 ||
        this.newUpdateHasNewValues(res.rows[0]) ||
        this.isMissingCoordinates(this.project)
      ) {
        console.log(
          res.rows.length === 0
            ? `No GPS info found for this principle ID: ${this.ncPrincipalId}, inserting new record.`
            : `Updating GPS Coords due to change in new values for principle ID: ${this.ncPrincipalId}`
        );
        res = await this.insertGPSInfo();
        await this.copyGPSCoordsToProjectFromFirstNC();
      }

      return res.rows[0].gps_id;
    } catch (err) {
      throw new Error("Error In get GPSId.. ", err);
    }
  }

  async copyGPSCoordsToProjectFromFirstNC() {
    if (this.project) {
      const updatedProject = await updateProjectGPSCoordsFromFirstNC(
        this.project.id
      );
      console.log("updatedProject", updatedProject);
      if (updatedProject) {
        const { country, state, timezone } = await getAddressApi({
          latitude: updatedProject.location_lat,
          longitude: updatedProject.location_lng,
        });
        console.log("getAddressApi", { country, state, timezone });
        await updateProjectLocationDetailByProjectId(
          this.project.id,
          country,
          state,
          timezone
        );
      }
    }
  }

  isMissingCoordinates(project) {
    if (!project) return false;
    const lat = project.location_lat;
    const lng = project.location_lng;
    const alt = project.altitude;
    return !lat || !lng || !alt;
  }
  newUpdateHasNewValues(dbGPS) {
    const roundToFive = (value) => Math.round(value * 1e5) / 1e5;

    // Round the values to 5 decimal places for comparison
    const dbLat = roundToFive(dbGPS.lat);
    const dbLng = roundToFive(dbGPS.lng);
    const dbAlt = roundToFive(dbGPS.alt);

    const newLat = roundToFive(this.lat);
    const newLng = roundToFive(this.lng);
    const newAlt = roundToFive(this.alt);

    // Check for changes
    if (dbLat !== newLat || dbLng !== newLng || dbAlt !== newAlt) {
      return true;
    }
    return false;
  }

  async insertGPSInfo() {
    try {
      let res = await exeQuery(db.gpsInsert, [
        this.ncSnapAddrAsU8,
        this.lat,
        this.lng,
        this.alt,
        this.gpsUpdate.getNumSats(),
        this.gpsUpdate.getQuality(),
        this.gpsUpdate.getFixTime().toDate(),
        this.gpsUpdate.getIsResponding(),
        this.gpsUpdate.getAltitudeUnits(),
        this.gpsUpdate.getIsClockQuestionable(),
        this.gpsUpdate.getWhen().toDate(),
      ]);
      return res;
    } catch (err) {
      console.log("Error in inserGPSInfo..", err);
      throw new RecordNotCreatedException("GPS record not created..!!");
    }
  }

  async insertGPSHist(gpsId) {
    try {
      let res = await exeQuery(db.gpsHistInsert, [
        this.ncSnapAddrAsU8,
        this.lat,
        this.lng,
        this.alt,
        this.gpsUpdate.getNumSats(),
        this.gpsUpdate.getQuality(),
        this.gpsUpdate.getFixTime().toDate(),
        this.gpsUpdate.getIsResponding(),
        this.gpsUpdate.getAltitudeUnits(),
        this.gpsUpdate.getIsClockQuestionable(),
        this.gpsUpdate.getWhen().toDate(),
        gpsId,
      ]);
      return res.rows[0].gps_hist_id;
    } catch (err) {
      console.log("Error in insertGPSHist", err);
      throw new RecordNotCreatedException("GPS History record not created..!!");
    }
  }
}

exports.gpsService = new GPSService();
