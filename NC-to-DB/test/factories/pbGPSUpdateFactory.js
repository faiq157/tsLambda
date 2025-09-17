const moment = require("moment");

class PbGPSUpdateFactory {
  constructor(obj) {
    this.prop = obj;
  }

  getProp(prop) {
    return this.prop[prop];
  }

  setProp(prop, val) {
    this.prop[prop] = val;
    return this.prop[prop];
  }

  getNcSnapAddr_asU8() {
    return this.prop.ncSnapAddr;
  }
  getGpsUpdates() {
    return this;
  }
  getLatitude() {
    return this.prop.lat;
  }
  getLongitude() {
    return this.prop.lng;
  }
  getAltitude() {
    return this.prop.alt;
  }
  getNumSats() {
    return this.prop.sats;
  }
  getQuality() {
    return this.prop.quality;
  }
  getFixTime() {
    return this;
  }
  getIsResponding() {
    return this.prop.isResponding;
  }
  getAltitudeUnits() {
    return this.prop.altUnits;
  }
  getIsClockQuestionable() {
    return this.prop.isClockQuestionable;
  }
  getWhen() {
    return this;
  }
  toDate() {
    return moment.utc().format();
  }
}

module.exports = { PbGPSUpdateFactory };
