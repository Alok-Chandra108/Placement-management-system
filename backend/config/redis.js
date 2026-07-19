const { createClient } = require('redis');

let redisClient = null;

/**
 * Initialize and connect to Redis
 * @returns {Promise<RedisClient>} Connected Redis client
 */
const connectRedis = async () => {
  if (redisClient) {
    return redisClient;
  }

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Maximum reconnection attempts reached');
            return new Error('Redis reconnection failed');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, etc.
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis: Connected successfully');
    });

    redisClient.on('ready', () => {
      console.log('Redis: Ready to accept commands');
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis: Reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Redis: Failed to connect:', error.message);
    throw error;
  }
};

/**
 * Get the Redis client instance
 * @returns {RedisClient|null} Redis client or null if not connected
 */
const getRedisClient = () => {
  if (!redisClient || !redisClient.isOpen) {
    console.warn('Redis: Client not initialized or not connected');
    return null;
  }
  return redisClient;
};

/**
 * Close Redis connection
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis: Disconnected');
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
};
