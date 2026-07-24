const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { csrfProtection } = require('./middleware/csrf.middleware');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const driveRoutes = require('./routes/drive.routes');
const applicationRoutes = require('./routes/application.routes');
const noticeRoutes = require('./routes/notice.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Trust proxy for rate limiting on hosting platforms (like Render)
app.set('trust proxy', 1);

// Security headers - Production-configured
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    xFrameOptions: {
      action: "deny",
    },
    xContentTypesOptions: true,
    xXssProtection: true,
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        geolocation: ["'none'"],
        microphone: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"],
      },
    },
  })
);

// CORS - Strict production whitelist
const getAllowedOrigins = () => {
  const envOrigins = process.env.FRONTEND_URL;
  
  // In production, require explicit FRONTEND_URL configuration
  if (process.env.NODE_ENV === 'production') {
    if (!envOrigins || envOrigins.trim() === '') {
      console.error('ERROR: FRONTEND_URL must be set in production');
      return []; // Empty array denies all origins in production
    }
    
    return envOrigins
      .split(',')
      .map((url) => url.trim())
      .filter((origin) => {
        // Validate origin format
        try {
          const urlObj = new URL(origin);
          // Only allow HTTPS in production
          if (urlObj.protocol !== 'https:') {
            console.warn(`WARNING: Origin ${origin} rejected - only HTTPS allowed in production`);
            return false;
          }
          // Reject wildcards in production
          if (origin.includes('*')) {
            console.warn(`WARNING: Origin ${origin} rejected - wildcards not allowed`);
            return false;
          }
          return true;
        } catch (e) {
          console.warn(`WARNING: Invalid origin ${origin} - ${e.message}`);
          return false;
        }
      });
  }
  
  // In development, allow localhost
  const devOrigins = envOrigins
    ? envOrigins.split(',').map((url) => url.trim())
    : ['http://localhost:5173'];
  
  return devOrigins.filter((origin) => {
    try {
      const urlObj = new URL(origin);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      console.warn(`Invalid origin ${origin} - ${e.message}`);
      return false;
    }
  });
};

const allowedOrigins = getAllowedOrigins();

console.log(`CORS: Allowing ${allowedOrigins.length} origin(s):`, allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies
    maxAge: 86400, // Cache preflight for 24 hours
  })
);

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  // In production, log admin API requests
  app.use('/api/admin', morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// CSRF protection (after cookie-parser, before routes)
app.use(csrfProtection);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CPMS API is running',
    version: 'v1',
  });
});

const { apiLimiter } = require('./middleware/rateLimiter');

// API Routes
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/drives', driveRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
