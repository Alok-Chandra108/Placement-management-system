const ApiResponse = require('../utils/ApiResponse');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled Error:', err);
  } else {
    // In production, log the basic error info without stack trace for observability
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.originalUrl}:`, err.message);
  }

  // Handle specific Mongoose errors
  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Invalid resource ID: ${err.value}`, 400);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return ApiResponse.error(res, messages.join('. '), 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.error(res, `${field} already exists`, 409);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired. Please log in again.', 401);
  }

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
