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
      logger.info('Redis: Disabled by configuration');
      return null;
    }

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis: Maximum reconnection attempts reached');
            return new Error('Redis reconnection failed');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, etc.
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis Client Error');
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
    logger.error({ err: error, message: error.message }, 'Redis: Failed to connect');
    throw error;
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
