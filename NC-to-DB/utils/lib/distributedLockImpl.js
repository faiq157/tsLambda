// const { promisify } = require('util');
const { getCacheClient } = require('../cache/remoteCacheClient');
const redisLock = require("redis-lock");

// let instance = null;
let redLockClient = {};

// singleton provider - wrapping this in a function allows us to eaily mock this out with
// an in memory implementation for testing purposes
// const getInstance = () => {
//   if (!instance) {
//     const client = getCacheClient();
//     const lock = promisify(redisLock(client));

//     instance = {
//       lock
//     };
//   }

//   return instance;
// };

const getInstance = () => {
  if (!redLockClient.lock) {
    const client = getCacheClient();
    redLockClient.lock = redisLock(client);
  }
  return redLockClient;
};

// class RedlockClient {

//   constructor() {
//     this.instance = null;
//   }

//   getInstance() {
//     if (!this.instance) {
//       const client = getCacheClient();
//       this.instance = new Redlock([client], {
//         retryCount: 100,
//         retryDelay: 200,
//         driftFactor: 0.01,
//         retryJitter: 200,
//       });
//       this.instance.on("error", (err) => {
//         console.log(err);
//       });
//     }
//     return this.instance;
//   }
// }

// const redlockClient = new RedlockClient();

module.exports = {
  getInstance,
  // getInstanceWithSingleTry
};
