const moment = require("moment");

class PbHourUpdatesFactory {

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

    getTcUpdate() {
        return this;
    }

    getTcSnapAddr_asU8() {
        return this.prop.tcSnapAddr_asU8;
    }

    getUpdatesList() {
        return this.prop.tcUpdate.updatesList;
    }

    getHour() {
        return this.prop.hour;
    }

    getDay() {
        return this;
    }

    getPollsSent() {
        return this.prop.pollsSent;
    }

    getPollsReceived() {
        return this.prop.pollsReceived;
    }

    getLinkQuality() {
        return this.prop.linkQuality;
    }

    getMeshDepth() {
        return this.prop.meshDepth;
    }
}


async function getPbTcHourUpdatesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbHourUpdatesFactory(data));
    }
    return factoryArr;
}


module.exports = { getPbTcHourUpdatesList };