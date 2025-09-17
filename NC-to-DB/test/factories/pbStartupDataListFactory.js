const moment = require("moment");

class PbStartupDataFactory {
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

    getFwVersion() {
        return this.prop.fwVersion;
    }

    getNccbUptime() {
        return this.prop.nccbUptime;
    }

    getLinuxUptime() {
        return this.prop.linuxUptime;
    }

    getApplicationUptime() {
        return this.prop.applicationUptime;
    }
}

async function getPbStartupDataList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbStartupDataFactory(data));
    }
    return factoryArr;
}
module.exports = { getPbStartupDataList };
