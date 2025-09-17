const moment = require("moment");

class PbPanelUpdatesFactory {
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

  getTcSnapAddr_asU8() {
    return this.prop.tcSnapAddr;
  }
  getSolarVoltage() {
    return this.prop.solarVoltage;
  }
  getSolarCurrent() {
    return this.prop.solarCurrent;
  }
  getWhen() {
    return this;
  }
  toDate() {
    return moment.utc().format();
  }
}

async function getPbPanelUpdatesList(obj) {
  let factoryArr = [];
  for (let data of obj) {
    factoryArr.push(new PbPanelUpdatesFactory(data));
  }
  return factoryArr;
}
module.exports = { getPbPanelUpdatesList };
