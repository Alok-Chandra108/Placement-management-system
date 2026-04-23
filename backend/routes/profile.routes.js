const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
} = require('../controllers/profile.controller');
const {
  updateProfileValidation,
} = require('../validators/profile.validators');
const { verifyAccessToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All profile routes require authentication + student role
router.use(verifyAccessToken);
router.use(requireRole('student'));

// GET  /api/profile/me — Fetch current student's profile
router.get('/me', getMyProfile);

// PUT  /api/profile/me — Update current student's profile
router.put('/me', updateProfileValidation, updateMyProfile);

module.exports = router;
