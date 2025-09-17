const moment = require("moment");

class PbClearLogEntriesFactory {
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

    getCreated() {
        return this;
    }

    getCleared() {
        return this;
    }

    toDate() {
        return moment.utc().format();
    }

}


async function getPbClearLogEntriesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbClearLogEntriesFactory(data));
    }
    return factoryArr;
}

module.exports = { getPbClearLogEntriesList };