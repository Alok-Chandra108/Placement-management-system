const jwt = require('jsonwebtoken');

/**
 * Generate an access token
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role
 * @returns {string} JWT access token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

/**
 * Generate a refresh token
 * @param {string} userId - User's MongoDB _id
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key to use for verification
 * @returns {object} Decoded token payload
 */
const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
