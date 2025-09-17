const AsyncLock = require('async-lock');

const asyncLock = new AsyncLock({ timeout: 30000 });

const lock = (key, timeout) => {
  return new Promise((resolve, reject) => {
    asyncLock.acquire(key, done => {
      const unlock = () => {
        done();
        return Promise.resolve();
      }

      resolve(unlock);
    }, err => {
      if (err) {
        reject(err);
      }
    }, { timeout });
  });
};

const oldLock = (key, timeout) => {
  return new Promise((res, rej) => {
    asyncLock.acquire(key, done => {
      res(() => {
        done();
        return Promise.resolve();
      });
    }, err => {
      if (err) {
        rej(err);
      }
    }, { timeout });
  });
};

const getInstanceNew = () => ({
  lock
});

const getInstance = () => ({
  lock: oldLock
});

module.exports = {
  getInstance,
  getInstanceNew
};
