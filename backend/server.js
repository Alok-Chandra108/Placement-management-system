require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { startNoticeArchiveCron } = require('./services/noticeArchiveCron');

/**
 * Validate required environment variables before starting the server
 * Fails fast with clear error messages if critical config is missing
 */
const validateEnv = () => {
  // Required in ALL environments
  const required = [
    { key: 'MONGO_URI', description: 'MongoDB connection URI' },
    { key: 'JWT_ACCESS_SECRET', description: 'JWT access token secret (min 32 chars)' },
    { key: 'JWT_REFRESH_SECRET', description: 'JWT refresh token secret (min 32 chars)' },
  ];

  // Required ONLY in production
  const requiredInProduction = [
    { key: 'FRONTEND_URL', description: 'Frontend URL for CORS (comma-separated, HTTPS only)' },
    { key: 'CLOUDINARY_CLOUD_NAME', description: 'Cloudinary cloud name for image uploads' },
    { key: 'CLOUDINARY_API_KEY', description: 'Cloudinary API key' },
    { key: 'CLOUDINARY_API_SECRET', description: 'Cloudinary API secret' },
    { key: 'BREVO_API_KEY', description: 'Brevo API key for transactional emails' },
    { key: 'BREVO_SENDER_EMAIL', description: 'Verified sender email for Brevo' },
  ];

  // Optional with defaults
  const optional = [
    { key: 'PORT', default: '5000', description: 'Server port' },
    { key: 'NODE_ENV', default: 'development', description: 'Environment (development/production)' },
    { key: 'REDIS_URL', default: 'redis://localhost:6379', description: 'Redis connection URL' },
    { key: 'JWT_ACCESS_EXPIRY', default: '15m', description: 'JWT access token expiry' },
    { key: 'JWT_REFRESH_EXPIRY', default: '7d', description: 'JWT refresh token expiry' },
    { key: 'ADMIN_EMAIL', default: '11mt25mca082-t@mite.ac.in', description: 'Admin email for seeding (optional)' },
  ];

  const missing = [];
  const warnings = [];

  // Check required variables
  for (const { key, description } of required) {
    if (!process.env[key] || process.env[key].trim() === '') {
      missing.push({ key, description });
    }
  }

  // Check production-only required variables
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    for (const { key, description } of requiredInProduction) {
      if (!process.env[key] || process.env[key].trim() === '') {
        missing.push({ key, description: `${description} (required in production)` });
      }
    }
  }

  // Set defaults for optional variables
  for (const { key, default: defaultValue, description } of optional) {
    if (!process.env[key] || process.env[key].trim() === '') {
      process.env[key] = defaultValue;
      warnings.push({ key, description, default: defaultValue });
    }
  }

  // Validate JWT secret strength
  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length < 32) {
    warnings.push({ key: 'JWT_ACCESS_SECRET', description: 'JWT access secret should be at least 32 characters', note: 'Weak secret - consider generating a stronger one' });
  }
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    warnings.push({ key: 'JWT_REFRESH_SECRET', description: 'JWT refresh secret should be at least 32 characters', note: 'Weak secret - consider generating a stronger one' });
  }

  // Report missing required variables
  if (missing.length > 0) {
    console.error('\n❌  Missing required environment variables:\n');
    for (const { key, description } of missing) {
      console.error(`  - ${key}: ${description}`);
    }
    console.error('\nPlease set these in your .env file or environment.\n');
    process.exit(1);
  }

  // Report optional variables using defaults
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment variables using defaults:\n');
    for (const { key, description, default: defaultValue, note } of warnings) {
      const defaultMsg = defaultValue !== undefined ? ` (default: "${defaultValue}")` : '';
      const noteMsg = note ? ` - ${note}` : '';
      console.warn(`  - ${key}: ${description}${defaultMsg}${noteMsg}`);
    }
    console.warn('');
  }

  // Log configuration summary
  console.log('✅ Environment validation passed');
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Port: ${process.env.PORT}`);
  console.log(`   MongoDB: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
  console.log(`   Redis: ${process.env.REDIS_URL}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || '(not set - will use dev defaults)'}`);
  if (process.env.CLOUDINARY_CLOUD_NAME) console.log(`   Cloudinary: Configured`);
  if (process.env.BREVO_API_KEY) console.log(`   Email (Brevo): Configured`);
  console.log('');
};

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

// Validate environment BEFORE connecting to database
validateEnv();

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
