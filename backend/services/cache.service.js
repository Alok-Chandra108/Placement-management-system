const redisConfig = require('../config/redis');
const { logger } = require('../config/logger');

const DEFAULT_TTL_SECONDS = 60; // 60 seconds TTL for high-traffic read endpoints

/**
 * Retrieve parsed JSON value from Redis by key.
 * Returns parsed object, or null if cache miss, client not ready, or error.
 *
 * @param {string} key
 * @returns {Promise<any|null>}
 */
const getCache = async (key) => {
  try {
    const redisClient = redisConfig.getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
      return null;
    }

    const data = await redisClient.get(key);
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (err) {
    logger.warn({ err: err.message, key }, 'Redis getCache non-critical error (falling back to database)');
    return null;
  }
};

/**
 * Store a JSON-serializable value in Redis with a TTL.
 *
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds=60]
 * @returns {Promise<boolean>}
 */
const setCache = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  try {
    const redisClient = redisConfig.getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }

    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    logger.warn({ err: err.message, key }, 'Redis setCache non-critical error');
    return false;
  }
};

/**
 * Invalidate one or more exact keys or patterns (e.g. 'drives:*', 'notices:*').
 *
 * @param {...string} keysOrPatterns
 * @returns {Promise<boolean>}
 */
const invalidateCache = async (...keysOrPatterns) => {
  try {
    const redisClient = redisConfig.getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }

    for (const item of keysOrPatterns) {
      if (!item) continue;

      if (item.includes('*')) {
        // Pattern-based flush
        const matchingKeys = await redisClient.keys(item);
        if (matchingKeys && matchingKeys.length > 0) {
          await redisClient.del(matchingKeys);
        }
      } else {
        await redisClient.del(item);
      }
    }
    return true;
  } catch (err) {
    logger.warn({ err: err.message }, 'Redis invalidateCache non-critical error');
    return false;
  }
};

module.exports = {
  getCache,
  setCache,
  invalidateCache,
  DEFAULT_TTL_SECONDS,
};
