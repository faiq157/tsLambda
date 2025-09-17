const moment = require("moment");

class PbConfiguredVersionsFactory {
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
    
    getNcVersion() {
        return this.prop.ncVersion;
    }

    getNcScriptVersion() {
        return this.prop.ncScriptVersion;
    }

    getNcRadioVersion() {
        return this.prop.ncRadioVersion;
    }

    getNcStm32Version() {
        return this.prop.ncStm32Version;
    }

    getNcGasGuageVersion() {
        return this.prop.ncGasGuageVersion;
    }

    getAssetScriptVersion() {
        return this.prop.assetScriptVersion;
    }

    getAssetRadioVersion() {
        return this.prop.assetRadioVersion;
    }

    getAssetStm32Version() {
        return this.prop.assetStm32Version;
    }

    getAssetGasGuageVersion(){
        return this.prop.assetGasGuageVersion;
    }
}

module.exports = { PbConfiguredVersionsFactory };
