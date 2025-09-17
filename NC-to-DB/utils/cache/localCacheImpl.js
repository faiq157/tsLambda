const _isString = require('lodash/isString');
const _filter = require('lodash/filter');
const _values = require('lodash/values');
let lists = {};
let map = {};
let promises = {};
let subscriptions = {};
let channelMessageHandler = null;
class AtLeastPolicy {
  constructor(config) {
    this._config = config;
  }
  evaluate(history) {
    const objective = {};
    Object.keys(this._config).forEach((key) => {
      const value = this._config[key];
      const occurrences = _filter(history, item => item === key).length;
      objective[key] = occurrences >= value;
    });
    const objectiveMet = _values(objective).reduce((acc, item) => acc && item);
    // console.log(`object met: ${objectiveMet}. history: ${JSON.stringify(history)}`);
    return objectiveMet;
  }
}
class AnyMatchPolicy {
  constructor(config) {
    this._config = config;
  }
  evaluate(history) {
    const objective = {};
    Object.keys(this._config).forEach((key) => {
      const value = this._config[key];
      const occurrences = _filter(history, item => item === key).length;
      objective[key] = occurrences >= value;
    });
    const objectiveMet = _values(objective).reduce((acc, item) => acc || item);
    //console.log(`object met: ${objectiveMet}. history: ${JSON.stringify(history)}`);
    return objectiveMet;
  }
}
const setKey = (key, value) => { 
  map[key] = value;
  if (promises[key]) { 
    const { fns } = promises[key];
    fns.forEach(fn => fn(value));
  }
};
const lpushAsync = (key, value) => {
  if (!_isString(key)) {
    throw new Error("expected string for parameter 'key'");
  }
  if (!_isString(value)) {
    throw new Error("expected string for parameter 'value'");
  }
  lists[key] = lists[key] || [];
  lists[key].unshift(value);
  return Promise.resolve();
};
const brpopAsync = (key) => {
  if (!_isString(key)) {
    throw new Error("expected string for parameter 'key'");
  }
  const list = lists[key];
  return Promise.resolve([
    key,
    list && list.length > 0
      ? list.pop()
      : '--stop-processing--'
  ]);
};
const delAsync = (key) => { 
  delete map[key];
  return Promise.resolve(1);
};
const setAsync = (key, value, ...rest) => {
  if (!_isString(key)) { 
    throw new Error("expected string for parameter 'key'");
  }
  if (!_isString(value)) { 
    throw new Error("expected string for parameter 'value'");
  }
  if (rest.length > 0) {
    if (rest[rest.length - 1] === 'NX') { 
      // only set the value if the key doesn't already exist
      if (map[key]) {         
        // don't do anything, resolve with null
        return Promise.resolve(null);
      }
    } else if (rest[rest.length - 1] === 'XX') {
      // only set the key if it already exists
      if (!map[key]) { 
        // don't do anything, resolve with null
        return Promise.resolve(null);
      }
    }
  } 
  setKey(key, value);
  return Promise.resolve('OK');
};
const hmsetAsync = (key, hashMap) => { 
  // redis stores all values as strings
  const obj = {};
  for (let prop in hashMap) {
    if (hasOwnProperty.call(hashMap, prop)) {
      const val = hashMap[prop];
      obj[prop] = val !== null && val !== undefined ? val.toString() : 'null'; // redis will store this as 'null'
    }
  }
  setKey(key, obj);
  return Promise.resolve('OK');
};
const hgetallAsync = (key) => { 
  return Promise.resolve(map[key]);
}
const resolveOnKeySet = (key, policy) => { 
  const callbacks = {
    resolve: null,
    reject: null
  };
  const promise = new Promise((resolve, reject) => { 
    callbacks.resolve = resolve;
    callbacks.reject = reject;
  });
  const fn = (value) => { 
    const { callHistory } = promises[key];
    callHistory.push(value);
    const payload = {
      value,
      callHistory
    };
    if (policy) {
      const policyMet = policy.evaluate(callHistory);
      if (policyMet) {
        return callbacks.resolve(payload);
      }
    } 
  };
  // allow for multiple clients to resolve on the same key
  promises[key] = promises[key] || {
    fns: [],
    callHistory: []
  }
  promises[key].fns.push(fn);
  // if we already have a value, call the fn
  if (map[key]) { 
    setKey(key, map[key]);
  }
  return promise;
};
const getAsync = (key) => { 
  return Promise.resolve(map[key]);
};
const on = (str, fn) => {
  channelMessageHandler = fn;
};
/**
 * Get the value of a key.
 * @param {String} key 
 * @returns {String} The string value. If the key does not exist, returns false.
 */
 const exists = (key) => { 
  return map[key]
};
const subscribe = (channel) => { 
  subscriptions[channel] = 1;
};
const publishAsync = (channel, message) => {
  const subscription = subscriptions[channel];
  if (subscription && channelMessageHandler) {
    return channelMessageHandler(channel, message);
  }
  return Promise.resolve();
};
const flushallAsync = () => {
  lists = {};
  map = {};
};
const expire = (key) => {
  return map[key] !== undefined? map[key] : false;
};
const instance = {
  brpopAsync,
  flushallAsync,
  getAsync,
  hgetallAsync,
  hmsetAsync,
  lpushAsync,
  on,
  publishAsync,
  delAsync,
  setAsync,
  subscribe,
  expire,
  exists
};
const getCacheClient = () => instance;
module.exports = {
  getCacheClient,
  resolveOnKeySet,
  AtLeastPolicy,
  AnyMatchPolicy
};