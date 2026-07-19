require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { startNoticeArchiveCron } = require('./services/noticeArchiveCron');

const PORT = process.env.PORT || 5000;

// Global process error handlers to prevent silent crashes from background jobs
// (cron tasks, email sends, etc.) that may produce unhandled rejections or exceptions.
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, '\nReason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Exit so the process supervisor (nodemon/pm2/docker) can restart in a clean state
  process.exit(1);
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    // Start scheduled background jobs
    startNoticeArchiveCron();

    app.listen(PORT, () => {
      console.log(`\n Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

