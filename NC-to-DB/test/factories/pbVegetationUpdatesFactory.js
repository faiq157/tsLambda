const moment = require('moment');

class PbVegetationUpdatsFactory {
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
        return this.prop.timestamp;
    }

    toDate() {
        return moment.utc().format();
    }

    getAssetSnapAddr_asU8() {
        return this.prop.assetSnapAddr_asU8;
        // return '\\x000004';
    }

    getVegetationModeStatus(){
        return this.prop.vegetationModeStatus;
    }

    getTemperatureThreshold(){
        return this.prop.temperatureThreshold;
    }

    getDaysHistoryList() {
        return this.prop.daysHistoryList;
    }

}

module.exports = { PbVegetationUpdatsFactory };