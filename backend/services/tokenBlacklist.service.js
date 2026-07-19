const { getRedisClient } = require('../config/redis');

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
      console.error('Token Blacklist: Redis client not available');
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = expiryTimestamp - now;

    // Only add to blacklist if token hasn't already expired
    if (ttl <= 0) {
      console.log('Token Blacklist: Token already expired, skipping blacklist');
      return true;
    }

    // Store token hash with TTL matching token expiry
    // Key format: blacklist:token:<hash>
    const key = `blacklist:token:${tokenHash}`;
    await redisClient.setEx(key, ttl, '1');

    console.log(`Token Blacklist: Added token (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error('Token Blacklist: Failed to add token:', error.message);
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
      console.error('Token Blacklist: Redis client not available');
      // Fail closed: if Redis is down, reject tokens to be safe
      return true;
    }

    const key = `blacklist:token:${tokenHash}`;
    const result = await redisClient.exists(key);
    
    return result === 1;
  } catch (error) {
    console.error('Token Blacklist: Failed to check token:', error.message);
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
      console.error('Token Blacklist: Redis client not available');
      return false;
    }

    const key = `blacklist:token:${tokenHash}`;
    await redisClient.del(key);
    
    console.log('Token Blacklist: Removed token');
    return true;
  } catch (error) {
    console.error('Token Blacklist: Failed to remove token:', error.message);
    return false;
  }
};

module.exports = {
  addToBlacklist,
  isBlacklisted,
  removeFromBlacklist,
};
