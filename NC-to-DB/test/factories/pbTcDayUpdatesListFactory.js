const moment = require("moment");

class PbDayUpdatesFactory {

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

    getUpdatesList() {
        return this.prop.updatesList;
    }

    getTcSnapAddr_asU8() {
        return this.prop.tcSnapAddr_asU8;
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


async function getPbTcDayUpdatesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbDayUpdatesFactory(data));
    }
    return factoryArr;
}


module.exports = { getPbTcDayUpdatesList };