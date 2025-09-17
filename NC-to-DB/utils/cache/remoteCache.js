const cacheClient = require('./remoteCacheImpl');
const distributedLock = require("../lib/distributedLock");
const {getEpochTime} = require("../../utils/helpers/functions");
const {redisStreamErrorString} = require("../constants.js");


const getStreamRackAngleKey = (snapAddr) => `stream:${snapAddr}:rack_angle`;
const streamMaxDataDuration = Object.freeze({  // in minutes
  RACK_ANGLE: 60
});
const streamMaxEntries = Object.freeze({
  RACK_ANGLE: 100
});
const errorString = redisStreamErrorString.XADD_ID_EQUAL_OR_SMALLER;


class RemoteCache {

  async get(key) {
    const cacheValue = await cacheClient.get(key);
    if (cacheValue) {
      return cacheValue;
    }
    // If we're racing and multiple requests missed cache,
    return distributedLock.acquireLock(`cacheget-${key}`, 30000, async () => {
      // All racers that lost the race to get the lock will
      // get the value from cache
      const value = await cacheClient.get(key);
      if (value) {
        return value;
      }
    });
  }

  async set(key, value, expirationInSeconds) {
    return cacheClient.set(key, value, expirationInSeconds);
  }

  remove(key) {
    return cacheClient.removeAsync(key);
  }

  clear() {
    return cacheClient.clearAsync();
  }

  exists(key) {
    return cacheClient.exists(key);
  }

  async insertRackHist (params, factory, nomkstream) {
    const key = getStreamRackAngleKey(params.snap_addr);
    try {
      const resp = await this.insertStream(key, streamMaxEntries.RACK_ANGLE, new Date(params.timestamp).getTime(), params, nomkstream);
      if (resp) {
        return resp;
      }
    } catch (error) {
      if (error?.message?.includes(errorString)) {
        console.warn("Warning:", error.message);
        return;
      }
      throw new Error(error);
    }

    const {startTime, endTime} = getEpochTime(params.timestamp, streamMaxDataDuration.RACK_ANGLE);
    const fn = () => factory(params.snap_addr, startTime, endTime);
    return this.getOrCreateStream(key, startTime, endTime, fn, streamMaxEntries.RACK_ANGLE);
  }

  async insertStream (key, maxEntries, eventId, data, nomkstream) {
    const payload = { data: JSON.stringify(data) };
    const options = {
      NOMKSTREAM: nomkstream != null ? nomkstream : true,
      TRIM: {
        strategy: 'MAXLEN', // Trim by length.
        strategyModifier: '~', // Approximate trimming.
        threshold: maxEntries // Retain around 1000 entries.
      }
    };
    const eId = eventId ? eventId + '-*' : '*';
    return cacheClient.xAdd(key, eId, payload, options);
  }

  async insertStreamMulti (key, records, maxEntries) {
    try {
      const options = {
        TRIM: {
          strategy: 'MAXLEN', // Trim by length.
          strategyModifier: '~', // Approximate trimming.
          threshold: maxEntries // Retain around 1000 entries.
        }
      };
      const resp = await cacheClient.execMultipleCmds((client, opt) => {
        for (const item of records) {
          const eventId = item?.timestamp ? new Date(item.timestamp).getTime() : null;
          const eId = eventId ? eventId + '-*' : '*';
          cacheClient.xAdd(key, eId, {data: JSON.stringify(item)}, opt, client);
        }
      }, options);
      return resp;
    } catch(error) {
      console.log("REDIS STREAM INSERT MULTI: ", error);
      const errorMessage = error?.message || '';
      if (errorMessage.includes(errorString)) {
        console.warn("Warning:", error.message);
        return;
      } else if (errorMessage.includes('commands failed, see .replies')) { // if there are errors due to bulk insertion
        /*
         * In case of multiple insertions, the error object looks like this:
         * ERROR:  [MultiErrorReply: 2 commands failed, see .replies and .errorIndexes for more information] {
         *     replies: [
         *       '1711103236000-0',
         *       [ErrorReply: ERR The ID specified in XADD is equal or smaller than the target stream top item],
         *       [ErrorReply: ERR The ID specified in XADD is equal or smaller than the target stream top item]
         *     ],
         *     errorIndexes: [ 1, 2 ]
         *   }
         */
        console.log("REPLIES: ", error.replies);
        for (const i of error.errorIndexes) {
          if (error?.replies[i]?.message.includes(errorString)) {
            console.warn("Multi Insertion Warning:", error?.replies[i]?.message);
          } else {
            console.error(error?.replies[i].message);
          }
        }
        return;
      }
      // If the error doesn't match the expected case, log the original error
      console.error("Error:", error);
      return;
    }
  }

  async getOrCreateStream (key, startTime, endTime, valueFactory, maxEntries) {

    const cacheValue = await this.getStreamData(key, startTime, endTime);
    // If there is no valueFactory, return the result even on a miss
    if (cacheValue || !valueFactory) {
      return cacheValue;
    }

    // If we're racing and multiple requests missed cache,
    // only call the value factory one time.
    return distributedLock.acquireLock(`cacheget-${key}`, 30000, async () => {

      // All racers that lost the race to get the lock will
      // get the value from cache
      const value = await this.getStreamData(key, startTime, endTime);
      if (value) {
        return value;
      }

      const newValue = await valueFactory();
      await this.insertStreamMulti(key, newValue, maxEntries);

      return newValue;
    });
  }

  async getStreamMulti (transactions) {
    const resp = await cacheClient.execMultipleCmds((client) => {
      for (const transaction of transactions) {
        transaction(client);
      }
    });
    let dbFormat = [];
    for (const r of resp) {
      dbFormat.push(this.getDBFormatData(r));
    }
    return {
      cacheFormat: resp,
      dbFormat: dbFormat
    };
  }

  /*
   * startTime {String - EPOCH} OR '-'
   * endTime {String - EPOCH} OR '+'
   * options => {
   *  COUNT: 1
   * }
   */
  getRackHist (snapAddr, startTime, endTime, options, client) {
    const key = getStreamRackAngleKey(snapAddr);
    return this.getStreamData(key, startTime, endTime, options, client);
  }

  /*
   * startTime {String - EPOCH} OR '+'
   * endTime {String - EPOCH} OR '-'
   * options => {
   *  COUNT: 1
   * }
   */
  getRackHistReverseOrder (snapAddr, startTime, endTime, options, client) {
    const key = getStreamRackAngleKey(snapAddr);
    return this.getStreamDataRev(key, startTime, endTime, options, client);
  }

  async getStreamData (key, startTime, endTime, options, client) {
    if (client) {
      return cacheClient.xRange(key, startTime, endTime, options, client);
    }
    const xrangeResp = await cacheClient.xRange(key, startTime, endTime, options);
    return this.getDBFormatData(xrangeResp);
  }

  async getStreamDataRev (key, startTime, endTime, options, client) {
    if (client) {
      return cacheClient.xRevRange(key, startTime, endTime, options, client);
    }
    const xrangeResp = await cacheClient.xRevRange(key, startTime, endTime, options);
    return this.getDBFormatData(xrangeResp);
  }

  getDBFormatData (cacheData) {
    if (!cacheData) {
      return null;
    }
    const formattedData = []
    for (const item of cacheData) {
      const data = item?.message?.data;
      formattedData.push(JSON.parse(data));
    }
    return formattedData.length > 0 ? formattedData : null;
  }

}
module.exports = new RemoteCache();
