const moment = require("moment");

class PbWeatherStowUpdatesFactory {
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
        return this.prop.ncSnapAddr_asU8;
    }

    getTcSnapAddr_asU8() {
        return this.prop.tcSnapAddr;
    }

    getWhen() {
        return this;
    }

    toDate() {
        return moment.utc().format();
    }

    getStowType() {
        return this.prop.stowType;
    }

    getValue() {
        return this.prop.stowValue;
    }

    getThreshold() {
        return this.prop.stowThreshold;
    }

}


module.exports = { PbWeatherStowUpdatesFactory };
