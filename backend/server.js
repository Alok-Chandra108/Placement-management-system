require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startNoticeArchiveCron } = require('./services/noticeArchiveCron');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

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

