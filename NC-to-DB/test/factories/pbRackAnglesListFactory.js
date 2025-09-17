const moment = require('moment');

class PbRackAnglesFactory {
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

    getTcSnapAddr_asU8() {
        return this.prop.tcSnapAddr_asU8;
        // return '\\x000004';
    }

    getAnglesList() {
        return this.prop.anglesList;
    }

}

async function getPbRackAnglesList(obj) {
    let factoryArr = [];
    for (let data of obj) {
        factoryArr.push(new PbRackAnglesFactory(data));
    }
    return factoryArr;
}

module.exports = { getPbRackAnglesList };