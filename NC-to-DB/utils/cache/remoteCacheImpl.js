const _isInteger = require('lodash/isInteger');
const {getCacheClient, getSubscriberClient, getPublisherClient} = require('./remoteCacheClient');
const listAdd = (name, data) => getPublisherClient().lpushAsync(name, data);
const brpopAsync = (name, timeout) => getSubscriberClient().brpopAsync(name, timeout);
const publishAsync = (channel, message) => getPublisherClient().publishAsync(channel, message);
const on = (str, callback) => getSubscriberClient().on(str, callback);
const subscribe = (channel) => getSubscriberClient().subscribe(channel);
/**
 * Sets a key value pair in cache.  If the key already exists, then a Null Bulk reply is returned.
 * @param {String} key
 * @param {String} value
 * @param {Integer} timeoutInSeconds
 */
const setIfNotExistsAsync = (key, value, timeoutInSeconds) => {
  if (_isInteger(timeoutInSeconds) && timeoutInSeconds > 0) {
    return getCacheClient().setAsync(key, value, 'EX', timeoutInSeconds, 'NX');
  } else {
    return getCacheClient().setAsync(key, value, 'NX');
  }
};
/**
 * Sets a key value pair in cache.
 * @param {String} key
 * @param {String} value
 * @param {Integer} timeoutInSeconds
 */
const set = (key, value, timeoutInSeconds) => {
  if (_isInteger(timeoutInSeconds) && timeoutInSeconds > 0) {
    return getCacheClient().set(key, value, { EX: timeoutInSeconds });
  } else {
    return getCacheClient().set(key, value);
  }
};
/**
 * Sets a key value pair in cache.
 * @param {String} key
 * @param {String} value
 * @param {Integer} timeoutInSeconds
 */
const setHashmapAsync = (key, value, timeoutInSeconds) => {
  const client = getCacheClient();
  return client.hmsetAsync(key, value)
    .then(() => (_isInteger(timeoutInSeconds) && timeoutInSeconds > 0) ? client.expire(key, timeoutInSeconds) : Promise.resolve());
};
/**
 * Get the value of a key.
 * @param {String} key
 * @returns {String} The string value. If the key does not exist, returns null.
 */
const get = (key) => {
  return getCacheClient().get(key);
};

/**
 * Get the value of a key from Stream Data Type
 * @param {String} key, {Int - Epoch} startTime, {Int - Epoch} endTime
 * @returns {Array of Objects} Returns array of objects. If the key doesn't exist, returns null;
 */
const xRange = (key, startTime, endTime, options, client = null) => {
  try {
    if(!client) {
      client = getCacheClient();
    }
    return client.xRange(key, startTime, endTime, options);
  } catch (err) {
    console.error("XRANGE Error: ", {key, startTime, endTime, options, err});
  }
};

const xRevRange = (key, startTime, endTime, options, client = null) => {
  try {
    if(!client) {
      client = getCacheClient();
    }
    return client.xRevRange(key, startTime, endTime, options);
  } catch (err) {
    console.error("XREVRANGE Error: ", {key, startTime, endTime, options, err});
  }
};

/**
 * Adds data into redis stream
 * @param {String} key, {Int - Epoch} eventId, {Object} payload, {Object} options
 * @returns EventID
 */
const xAdd = (key, eventId, payload, options, client = null) => {
  try {
    if(!client) {
      client = getCacheClient();
    }
    return client.xAdd(key, eventId.toString() || '*', payload, options);
  } catch (err) {
    console.error("XADD Error: ", {key, eventId, payload, isMulti: !client, err});
  }
};

const execMultipleCmds = (fn, options) => {
  const client = getCacheClient().multi();
  fn(client, options);
  return client.exec();
};

/**
 * Get the value of a key.
 * @param {String} key
 * @returns {String} The string value. If the key does not exist, returns false.
 */
 const exists = (key) => {
     console.log("____ checking exists ",key);
     const check = getCacheClient().exists(key);
     console.log("__ ",check);
    return check;
 };
/**
 * Get the value of a key.
 * @param {String} key
 * @returns {Object} The object value. If the key does not exist, returns null.
 */
const getHashmapAsync = (key) => {
  return getCacheClient().hgetallAsync(key);
};
/**
 * Removes a key from cache.
 * @param {String} key
 * @returns {Integer} 1 if the key is removed. 0 if the key did not exist.
 */
const removeAsync = (key) => {
  return getCacheClient().delAsync(key);
};
const flushAllAsync = () => {
  return getCacheClient().flushallAsync('ASYNC');
}
module.exports = {
  brpopAsync,
  flushAllAsync,
  get,
  xRange,
  xRevRange,
  xAdd,
  execMultipleCmds,
  getHashmapAsync,
  listAdd,
  on,
  publishAsync,
  removeAsync,
  set,
  setHashmapAsync,
  setIfNotExistsAsync,
  subscribe,
  exists
};
