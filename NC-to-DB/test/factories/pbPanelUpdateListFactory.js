const moment = require("moment");

class PbPanelUpdateListFactory {
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

async function getPanelUpdateList(obj) {
  let factoryArr = [];
  for (let data of obj) {
    factoryArr.push(new PbPanelUpdateListFactory(data));
  }
  return factoryArr;
}
module.exports = { getPanelUpdateList, PbPanelUpdateListFactory };
