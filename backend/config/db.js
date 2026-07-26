const mongoose = require('mongoose');
const { logger } = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info({ host: conn.connection.host }, 'MongoDB Connected');
  } catch (error) {
    logger.error({ err: error, message: error.message }, 'MongoDB Connection Error');
    process.exit(1);
  }
};

module.exports = connectDB;
