const config = {
  redis:{
    host: process.env.CACHEHOST,
    port: process.env.CACHEPORT,
  }
};
const redis = require('redis');

let instance = null;
let subscriberInstance = null;
let publisherInstance = null;

class RedisCacheClient {
  constructor(options) {
    this._port = options.port;
    this._host = options.host;
    this._name = options.name;
    this._instance = null;
    this._logDimensions = {
      component: 'redisClient'
    };
    this._logDetails = {
      port: this._port,
      host: this._host
    };
  }

  _retryStrategy(retries, error) {
    console.warn(`redis ${this._name} retrying`);
    if (error.toString().includes('ECONNREFUSED') || error.toString().includes('NR_CLOSED')) {
      const retryInSeconds = 30;
      console.error(`redis is unavailable, attempting to reconnect in ${retryInSeconds} seconds`);
      return retryInSeconds * 1000;
    }
    if (retries > 10) {
      // End reconnecting after a specific timeout and flush all commands with a individual error
      return new Error('Retry count exhausted');
    }
    return Math.max(retries * 50, 1000);
  }

  connect() {
    if (!this._instance) {
      console.log(`redis ${this._name} creating with config`, this._port, this._host);
      this._instance = redis.createClient({
        // legacyMode: true,
        socket: {
          port: this._port,
          host: this._host,
          reconnectStrategy: (retries, error) => {
            return this._retryStrategy(retries, error);
          }
        }
      });
      this._instance.connect();
      this._instance.on('end', () => {
          console.log(`redis ${this._name} connection closed`);
        });
      this._instance.on('error', (err) => {
          console.error(`redis ${this._name} error`, err);
        });
      this._instance.on('connect', () => {
          console.log(`redis ${this._name} connected`);
        });
    }
    return this._instance;
  }
}

// singleton provider - wrapping this in a function allows us to easily mock this out with
// an in memory implementation for testing purposes
const getCacheClient = () => {
  if (!instance) {
    const redisCacheClient = new RedisCacheClient({
      ...config.redis,
      name: 'cacheClient'
    });
    instance = redisCacheClient.connect();
  }
  return instance;
};

const getSubscriberClient = () => {
  if (!subscriberInstance) {
    const redisCacheClient = new RedisCacheClient({
      ...config.redis,
      name: 'subscriberClient'
    });
    subscriberInstance = redisCacheClient.connect();
  }
  return subscriberInstance;
};

const getPublisherClient = () => {
  if (!publisherInstance) {
    const redisCacheClient = new RedisCacheClient({
      ...config.redis,
      name: 'publisherClient'
    });
    publisherInstance = redisCacheClient.connect();
  }
  return publisherInstance;
};


module.exports = {
  getCacheClient,
  getSubscriberClient,
  getPublisherClient
};
