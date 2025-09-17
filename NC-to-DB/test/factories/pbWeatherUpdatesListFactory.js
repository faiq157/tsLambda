const moment = require("moment");

class PbWeatherUpdatesFactory {
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

    getSnapAddr_asU8() {
        return this.prop.ncSnapAddr_asU8;
    }

    getWhen() {
        return this;
    }

    toDate() {
        return moment.utc().format();
    }

    getWindSpeed() {
        return this.prop.windSpeed;
    }

    getWindDirection() {
        return this.prop.windDirection;
    }

    getAverageWindSpeed() {
        return this.prop.averageWindSpeed;
    }

    getPeakWindSpeed() {
        return this.prop.peakWindSpeed;
    }

    getTemperature() {
        return this.prop.temperature;
    }

    getSnowDepth() {
        return this.prop.snowDepth;
    }

    getIncreaseAvgWindReporting() {
        return this.prop.increaseAvgWindReporting;
    }

    getIncreaseWindGustReporting() {
        return this.prop.increaseWindGustReporting;
    }

    getTimestamp() {
        return this.prop.timestamp;
    }

    getDataType() {
        return this.prop.dataType;
    }
}


async function getPbWeatherUpdatesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbWeatherUpdatesFactory(data));
    }
    return factoryArr;
}

module.exports = { getPbWeatherUpdatesList };