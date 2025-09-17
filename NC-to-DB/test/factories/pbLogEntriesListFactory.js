const moment = require("moment");

class PbLogEntriesFactory {
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

    toDate() {
        return moment.utc().format();
    }

    getLogger() {
        return this.prop.logger;
    }

    getMessage() {
        return this.prop.message;
    }

    getLevelno() {
        return this.prop.levelno;
    }

    getCreated() {
        return this;
    }

    getType() {
        return this.prop.type;
    }

}


async function getPbLogEntriesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbLogEntriesFactory(data));
    }
    return factoryArr;
}

module.exports = { getPbLogEntriesList };