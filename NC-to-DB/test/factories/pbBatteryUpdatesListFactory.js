const moment = require("moment");

class PbBatteryUpdatesFactory {
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

    getVoltage() {
        return this.prop.voltage;
    }

    getCurrent() {
        return this.prop.current;
    }

    getCharged() {
        return this.prop.charged;
    }

    getHealth() {
        return this.prop.health;
    }

    getBattTemp() {
        return this.prop.battTemp;
    }

    getHeaterTemp() {
        return this.prop.heaterTemp;
    }

}

async function getPbBatteryUpdatesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbBatteryUpdatesFactory(data));
    }
    return factoryArr;
}
module.exports = { getPbBatteryUpdatesList };
