const { createClient } = require('redis');
const { logger } = require('./logger');

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

    if (redisUrl === 'false') {
      logger.info('Redis: Disabled by configuration (REDIS_URL=false)');
      return null;
    }

    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            logger.warn('Redis: Maximum reconnection attempts reached, falling back to in-memory operation');
            return false; // Stop retrying and fall back to in-memory
          }
          return Math.min(retries * 200, 2000);
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.warn({ err: err.message }, 'Redis Client Warning (falling back to memory operations)');
    });

    redisClient.on('connect', () => {
      logger.info('Redis: Connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('Redis: Ready to accept commands');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis: Reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.warn({ message: error.message }, 'Redis: Could not connect on startup - continuing with in-memory fallback');
    redisClient = null;
    return null;
  }
};

/**
 * Get the Redis client instance
 * @returns {RedisClient|null} Redis client or null if not connected
 */
const getRedisClient = () => {
  if (!redisClient || !redisClient.isOpen) {
    logger.warn('Redis: Client not initialized or not connected');
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
    logger.info('Redis: Disconnected');
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
};
