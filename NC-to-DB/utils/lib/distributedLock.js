const {getInstance} = require('./distributedLockImpl');

// const Redlock = require("redlock");
// const { getCacheClient } = require("../cache/remoteCacheClient");
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

// const acquireLock = async (key, ttlInMilliseconds, fn) => {
//   const lock = await lockProvider.getInstanceWithSingleTry().lock(key, ttlInMilliseconds);

//   try {
//     const result = await fn();
//     return result;
//   } catch (e) {
//     // wrap this in a rejection so that it continues to bubble up the chain
//     return Promise.reject(e);
//   } finally {
//     await lock.unlock();
//   }
// };


const getKey = (name, snap_addr) => {
  if (!name || !snap_addr) {
    console.error("Lock getKey() Error: ", {name, snap_addr});
    throw new Error(`Lock getKey(), name: ${name}, snap_addr: ${snap_addr}`);
  }
  return `locks:${name}:${snap_addr}`
};

const LockKey = Object.freeze({
  ASSET_HIST: 'asset',
  ASSET: 'asset',
  BATTERY: 'asset',
  CHARGER: 'asset',
  RACK: 'asset',
  MOTOR: 'asset',
  PANEL: 'asset',
  RADIO: 'asset',
  ML: 'ml',
  NC:'nc'
});

const LOCK_TIMEOUT = (5*1000);

const acquireLock = async (key, ttlInMilliseconds, fn) => {
  // console.log(`lock '${key}' acquiring with ttl ${ttlInMilliseconds}ms`);
  const done = await getInstance().lock(key, ttlInMilliseconds);
  // console.log(`lock '${key}' acquired with ttl ${ttlInMilliseconds}ms`);

  let result = null;
  let error = null;

  try {
    result = await fn();
  } catch (e) {
    // wrap this in a rejection so that it continues to bubble up the chain
    error = Promise.reject(e);
  }

  // console.log(`lock '${key}' releasing`);
  await done();
  // console.log(`lock '${key}' released`);

  return error || result;
};

const acquireAssetHistLock = async (snap_addr, fn) => {
  return acquireLock(getKey(LockKey.ASSET_HIST, snap_addr), LOCK_TIMEOUT, fn);
};

const acquireBatteryLock = async (snap_addr, fn) => {
  return acquireLock(getKey(LockKey.BATTERY, snap_addr), LOCK_TIMEOUT, fn);
};

const acquireChargerLock = async (snap_addr, fn) => {
  return acquireLock(getKey(LockKey.CHARGER, snap_addr), LOCK_TIMEOUT, fn);
};

const acquireNcLock = async (snap_addr, fn, timeout = null) => {
  return acquireLock(getKey(LockKey.NC, snap_addr), timeout || LOCK_TIMEOUT, fn);
};  

const acquireMotorLock = async (snap_addr, fn) => {
  return acquireLock(getKey(LockKey.MOTOR, snap_addr), LOCK_TIMEOUT, fn);
};

const acquireAssetLock = async (asset_id, fn) => {
  return acquireLock(getKey(LockKey.ASSET, asset_id), LOCK_TIMEOUT, fn);
};

const acquireAssetLastUpdateLock = async (snapAddr, fn) => {
  return acquireLock(getKey(LockKey.ASSET, snapAddr), LOCK_TIMEOUT, fn);
};

const acquireRackLock = async (snapAddr, fn) => {
  return acquireLock(getKey(LockKey.RACK, snapAddr), LOCK_TIMEOUT, fn);
};

const acquirePanelLock = async (snapAddr, fn) => {
  return acquireLock(getKey(LockKey.PANEL, snapAddr), LOCK_TIMEOUT, fn);
};

const acquireRadioLock = async (snap_addr, fn) => {
  return acquireLock(getKey(LockKey.RADIO, snap_addr), LOCK_TIMEOUT, fn);
};

const acquireMLLock = async (snap_addr, fn) => {
  return acquireLock(getKey(LockKey.ML, snap_addr), LOCK_TIMEOUT, fn);
};

module.exports = {
  acquireLock,
  acquireAssetHistLock,
  acquireBatteryLock,
  acquireMotorLock,
  acquireChargerLock,
  acquireNcLock,
  acquireAssetLock,
  acquireRackLock,
  acquireAssetLastUpdateLock,
  acquirePanelLock,
  acquireRadioLock,
  acquireMLLock
};
