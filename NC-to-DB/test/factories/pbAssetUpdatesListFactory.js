const moment = require("moment");

class PbAssetUpdatesFactory {
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

    getSnapAddr_asU8() {
        return this.prop.snapAddr;
    }

    getWhen() {
        return this;
    }

    toDate() {
        return moment.utc().format();
    }

    getUnitTemperature() {
        return this.prop.unitTemperature;
    }

    getUpTime() {
        return this.prop.uptime;
    }
}

async function getPbAssetUpdatesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbAssetUpdatesFactory(data));
    }
    return factoryArr;
}
module.exports = { getPbAssetUpdatesList };
