const { getRedisClient } = require('../config/redis');
const { logger } = require('../config/logger');

/**
 * Add a token hash to the blacklist
 * @param {string} tokenHash - SHA256 hash of the token
 * @param {number} expiryTimestamp - Token expiry timestamp (in seconds)
 * @returns {Promise<boolean>} Success status
 */
const addToBlacklist = async (tokenHash, expiryTimestamp) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      logger.error('Token Blacklist: Redis client not available');
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = expiryTimestamp - now;

    // Only add to blacklist if token hasn't already expired
    if (ttl <= 0) {
      logger.warn({ tokenHash: tokenHash.substring(0, 8) }, 'Token already expired, skipping blacklist');
      return true;
    }

    // Store token hash with TTL matching token expiry
    // Key format: blacklist:token:<hash>
    const key = `blacklist:token:${tokenHash}`;
    await redisClient.setEx(key, ttl, '1');

    logger.info({ tokenHash: tokenHash.substring(0, 8), ttl }, 'Added token to blacklist');
    return true;
  } catch (error) {
    logger.error({ err: error, message: error.message, tokenHash: tokenHash.substring(0, 8) }, 'Failed to add token to blacklist');
    return false;
  }
};

/**
 * Check if a token hash is blacklisted
 * @param {string} tokenHash - SHA256 hash of the token
 * @returns {Promise<boolean>} True if blacklisted, false otherwise
 */
const isBlacklisted = async (tokenHash) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      logger.error('Token Blacklist: Redis client not available');
      // Fail closed: if Redis is down, reject tokens to be safe
      return true;
    }

    const key = `blacklist:token:${tokenHash}`;
    const result = await redisClient.exists(key);

    return result === 1;
  } catch (error) {
    logger.error({ err: error, message: error.message, tokenHash: tokenHash.substring(0, 8) }, 'Failed to check token blacklist');
    // Fail closed: if check fails, reject the token
    return true;
  }
};

/**
 * Remove a token from blacklist (for testing/admin purposes)
 * @param {string} tokenHash - SHA256 hash of the token
 * @returns {Promise<boolean>} Success status
 */
const removeFromBlacklist = async (tokenHash) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      logger.error('Token Blacklist: Redis client not available');
      return false;
    }

    const key = `blacklist:token:${tokenHash}`;
    await redisClient.del(key);

    logger.info({ tokenHash: tokenHash.substring(0, 8) }, 'Removed token from blacklist');
    return true;
  } catch (error) {
    logger.error({ err: error, message: error.message, tokenHash: tokenHash.substring(0, 8) }, 'Failed to remove token from blacklist');
    return false;
  }
};

module.exports = {
  addToBlacklist,
  isBlacklisted,
  removeFromBlacklist,
};
