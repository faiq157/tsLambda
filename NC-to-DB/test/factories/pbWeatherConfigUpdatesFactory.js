const moment = require("moment");

class PbWeatherConfigUpdatesFactory {
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

    getWhen() {
        return this;
    }

    toDate() {
        return moment.utc().format();
    }

    getWindSpeedThreshold() {
        return this.prop.windSpeedThreshold;
    }

    getWindGustThreshold() {
        return this.prop.windGustThreshold;
    }

    getSnowDepthThreshold() {
        return this.prop.snowDepthThreshold;
    }

    getPanelSnowDepthThreshold() {
        return this.prop.panelSnowDepthThreshold;
    }

    getNcSnapAddr_asU8() {
        return this.prop.ncSnapAddr_asU8;
    }
}


module.exports = { PbWeatherConfigUpdatesFactory };