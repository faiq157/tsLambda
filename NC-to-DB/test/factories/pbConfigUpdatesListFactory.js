const moment = require("moment");

class PbConfigUpdatesFactory {
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
        return this.prop.tcSnapAddr;
    }

    getWhen() {
        return this;
    }

    toDate() {
        return moment.utc().format();
    }

    getModelDevice() {
        return this.prop.modelDevice;
    }

    getLocationLat() {
        return this.prop.locationLat;
    }

    getLocationLng() {
        return this.prop.locationLng;
    }

    getLocationText() {
        return this.prop.locationText;
    }

    getHardwareRev() {
        return this.prop.hardwareRev;
    }

    getFirmwareRev() {
        return this.prop.firmwareRev;
    }
}

async function getPbConfigUpdatesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbConfigUpdatesFactory(data));
    }
    return factoryArr;
}
module.exports = { getPbConfigUpdatesList };
