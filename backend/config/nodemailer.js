const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify connection on startup (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️  Email transporter not configured:', error.message);
    console.warn('   OTP and reset emails will not be sent until SMTP credentials are set.');
  } else {
    console.log('✅ Email transporter ready');
  }
});

module.exports = transporter;
