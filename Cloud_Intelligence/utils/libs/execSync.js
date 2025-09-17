const Redlock = require("redlock");
const redis = require("redis");
const host = process.env.CACHEHOST;
const port = process.env.CACHEPORT;
class RedlockClient {
  constructor() {
    this.instance = null;
  }
  getInstance() {
    if (!this.instance) {
      const client = redis.createClient({
        host: host,
        port: port,
      });
      this.instance = new Redlock([client], {
        retryCount: 100,
        retryDelay: 200,
        driftFactor: 0.01,
        retryJitter: 200,
      });
      this.instance.on("error", (err) => {
        console.error(err);
      });
    }
    return this.instance;
  }
}
const redlockClient = new RedlockClient();
const acquireLock = async (identifier, time, fn) => {
  let lock = null;
  try {
    const client = redlockClient.getInstance();
    lock = await client.lock(identifier, time);
    console.log(`lock acquired: ${identifier}, for ${time}`);
    const result = await fn();
    return result;
  } finally {
    try {
      console.log("releasing lock for:", identifier);
      await lock.unlock();
    } catch (err) {
      if (err.name === "LockError") {
        console.log("Lock error encountered..!");
      } else {
        throw err;
      }
    }
  }
};
module.exports = {
  acquireLock
};
