const moment = require("moment");

class PbCellDailyUpdatesFactory {
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

    getWhen() {
        return this;
    }

    toDate() {
        return moment.utc().format();
    }

    getLinkStatus() {
        return this.prop.linkStatus;
    }

    getWanIp() {
        return this.prop.wanIp;
    }

    getTowerId() {
        return this.prop.towerId;
    }

    getRxDataUsage() {
        return this.prop.rxDataUsage;
    }

    getTxDataUsage() {
        return this.prop.txDataUsage;
    }

    getMdn() {
        return this.prop.mdn;
    }

    getImei() {
        return this.prop.imei;
    }

    getRoaming() {
        return this.prop.roaming;
    }

    getLanIp() {
        return this.prop.lanIp;
    }
}

module.exports = { PbCellDailyUpdatesFactory };