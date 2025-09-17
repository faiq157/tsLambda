const moment = require("moment");

class PbTcUpdatesFactory {
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

    getOnline() {
        return this.prop.onlineState;
    }

    getWhen() {
        return this;
    }

    toDate() {
        return moment.utc().format();
    }

    getLastReported() {
        return this;
    }

    getStatusBits() {
        return this.prop.statusBits;
    }

    getAssetStatus() {
        return this.prop.reporting;
    }

}


async function getPbTcUpdatesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbTcUpdatesFactory(data));
    }
    return factoryArr;
}

module.exports = { getPbTcUpdatesList };