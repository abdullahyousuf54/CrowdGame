const { createClient } = require('redis');
const config = require('../config');

let redisClient;
let isMock = false;

// Basic in-memory mock Redis for local development without Redis instance
class MockRedisClient {
  constructor() {
    this.store = new Map();
    this.listeners = new Map();
    this.isReady = true;
  }

  async connect() {
    console.log('Mock Redis connected.');
    return this;
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, value, options) {
    this.store.set(key, value);
    if (options && options.EX) {
      setTimeout(() => this.store.delete(key), options.EX * 1000);
    }
    return 'OK';
  }

  async del(key) {
    return this.store.delete(key) ? 1 : 0;
  }

  async publish(channel, message) {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach(callback => callback(message));
    }
    return 1;
  }

  async subscribe(channel, callback) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel).push(callback);
    return Promise.resolve();
  }

  async unsubscribe(channel) {
    this.listeners.delete(channel);
    return Promise.resolve();
  }

  on(event, handler) {
    // console.log(`Mock Redis event listener registered: ${event}`);
    return this;
  }
}

if (config.REDIS_URL) {
  console.log(`Connecting to Redis server at ${config.REDIS_URL}...`);
  redisClient = createClient({ url: config.REDIS_URL });
  
  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });
  
  redisClient.connect().catch(err => {
    console.error('Failed to connect to real Redis. Falling back to Mock Redis...', err);
    redisClient = new MockRedisClient();
    isMock = true;
  });
} else {
  console.log('REDIS_URL not set. Falling back to Mock In-Memory Redis...');
  redisClient = new MockRedisClient();
  isMock = true;
}

module.exports = {
  client: redisClient,
  isMock: () => isMock
};
