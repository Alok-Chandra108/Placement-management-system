const Notice = require('../models/Notice.model');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const ApiResponse = require('../utils/ApiResponse');
const { logger } = require('../config/logger');
const cloudinary = require('../config/cloudinary');

// Helper: return the correct model based on the authenticated user's role
const getActorModel = (role) => (role === 'admin' ? Admin : User);

// ── Timeframe Constants ────────────────────────────────────────────────────────
const ARCHIVE_AFTER_DAYS = 30;  // Auto-archive active notices after 30 days
const PURGE_AFTER_DAYS = 180;   // Hard-delete archived notices after 180 days

// ────────────────────────────────────────────────────────────────────────────────
//  CREATE / READ / UPDATE / DELETE (Standard CRUD)
// ────────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 * @access  Private (Admin / HR)
 */
exports.createNotice = async (req, res, next) => {
  try {
    const { title, body, category, status } = req.body;
    let { attachmentUrl, attachmentName } = req.body;

    // Override with uploaded file if present
    if (req.file) {
      attachmentUrl = req.file.path;
      attachmentName = req.file.originalname;
    }

    const notice = await Notice.create({
      title,
      body,
      category,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      postedBy: req.user.id,
      postedByModel: req.user.role === 'admin' ? 'Admin' : 'User',
    });

    // Populate postedBy for the response
    await notice.populate('postedBy', 'fullName role');

    return ApiResponse.success(res, 'Notice created successfully', notice, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all notices (with filters & pagination)
 * @route   GET /api/notices
 * @access  Private (All authenticated users)
 */
exports.getNotices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'active',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { status };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      Notice.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('postedBy', 'fullName role'),
      Notice.countDocuments(query),
    ]);

    return ApiResponse.success(res, 'Notices fetched successfully', {
      notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Alias for backward compatibility
exports.getAllNotices = exports.getNotices;

/**
 * @desc    Get a single notice by ID
 * @route   GET /api/notices/:id
 * @access  Private (All authenticated users)
 */
exports.getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('postedBy', 'fullName role');

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    return ApiResponse.success(res, 'Notice fetched successfully', notice);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a notice
 * @route   PUT /api/notices/:id
 * @access  Private (Admin / HR who created it)
 */
exports.updateNotice = async (req, res, next) => {
  try {
    const { title, body, category, status } = req.body;
    let { attachmentUrl, attachmentName } = req.body;

    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    // Check authorization - only creator or admin can update
    if (notice.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return ApiResponse.error(res, 'Not authorized to update this notice', 403);
    }

    // Handle new file upload
    if (req.file) {
      attachmentUrl = req.file.path;
      attachmentName = req.file.originalname;

      // Clean up old file from Cloudinary if it exists
      if (notice.attachmentUrl) {
        try {
          const publicIdMatch = notice.attachmentUrl.match(/\/v\d+\/(.+?)\.\w+$/);
          const oldPublicId = publicIdMatch ? publicIdMatch[1] : null;
          if (oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'image' }); // Cloudinary treats pdf as image by default for deletion
          }
        } catch (err) {
          logger.error('Failed to delete old notice PDF from Cloudinary:', err);
        }
      }
    }

    if (title) notice.title = title;
    if (body) notice.body = body;
    if (category) notice.category = category;
    if (attachmentUrl !== undefined) notice.attachmentUrl = attachmentUrl || null;
    if (attachmentName !== undefined) notice.attachmentName = attachmentName || null;
    if (status) notice.status = status;

    await notice.save();
    await notice.populate('postedBy', 'fullName role');

    return ApiResponse.success(res, 'Notice updated successfully', notice);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notice
 * @route   DELETE /api/notices/:id
 * @access  Private (Admin / HR who created it)
 */
exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    // Check authorization
    if (notice.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return ApiResponse.error(res, 'Not authorized to delete this notice', 403);
    }

    // Clean up file from Cloudinary if it exists
    if (notice.attachmentUrl) {
      try {
        const publicIdMatch = notice.attachmentUrl.match(/\/v\d+\/(.+?)\.\w+$/);
        const publicId = publicIdMatch ? publicIdMatch[1] : null;
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        }
      } catch (err) {
        logger.error('Failed to delete notice PDF from Cloudinary on notice deletion:', err);
      }
    }

    await notice.deleteOne();

    return ApiResponse.success(res, 'Notice deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  ARCHIVE / UNARCHIVE (Soft Delete / Restore)
// ────────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Archive a notice (soft delete)
 * @route   PATCH /api/notices/:id/archive
 * @access  Private (Admin / HR who created it)
 */
exports.archiveNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    if (notice.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return ApiResponse.error(res, 'Not authorized to archive this notice', 403);
    }

    if (notice.status === 'archived') {
      return ApiResponse.error(res, 'Notice is already archived', 400);
    }

    notice.status = 'archived';
    notice.archivedAt = new Date();
    await notice.save();

    logger.info({ event: 'notice_archived', noticeId: notice._id, userId: req.user.id }, 'Notice archived');

    return ApiResponse.success(res, 'Notice archived successfully', notice);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restore an archived notice
 * @route   PATCH /api/notices/:id/restore
 * @access  Private (Admin only)
 */
exports.restoreNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    if (notice.status === 'active') {
      return ApiResponse.error(res, 'Notice is already active', 400);
    }

    notice.status = 'active';
    notice.archivedAt = null;
    await notice.save();

    logger.info({ event: 'notice_restored', noticeId: notice._id, userId: req.user.id }, 'Notice restored');

    return ApiResponse.success(res, 'Notice restored successfully', notice);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all archived notices (Admin only)
 * @route   GET /api/notices/archived
 * @access  Private (Admin only)
 */
exports.getArchivedNotices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      sortBy = 'archivedAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { status: 'archived' };

    if (category) {
      query.category = category;
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      Notice.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('postedBy', 'fullName role'),
      Notice.countDocuments(query),
    ]);

    return ApiResponse.success(res, 'Archived notices fetched successfully', {
      notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notice as read by current user
 * @route   PATCH /api/notices/:id/read
 * @access  Private (All authenticated users)
 */
exports.markNoticeRead = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    // Add user to readBy array if not already present
    if (!notice.readBy.includes(req.user.id)) {
      notice.readBy.push(req.user.id);
      await notice.save();
    }

    return ApiResponse.success(res, 'Notice marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all notices read by current user
 * @route   GET /api/notices/read
 * @access  Private (All authenticated users)
 */
exports.getReadNotices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { readBy: req.user.id, status: 'active' };

    if (category) {
      query.category = category;
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      Notice.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('postedBy', 'fullName role'),
      Notice.countDocuments(query),
    ]);

    return ApiResponse.success(res, 'Read notices fetched successfully', {
      notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get notice statistics (Admin only)
 * @route   GET /api/notices/stats
 * @access  Private (Admin only)
 */
exports.getNoticeStats = async (req, res, next) => {
  try {
    const [activeCount, archivedCount, totalCount] = await Promise.all([
      Notice.countDocuments({ status: 'active' }),
      Notice.countDocuments({ status: 'archived' }),
      Notice.countDocuments({}),
    ]);

    const byCategory = await Notice.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return ApiResponse.success(res, 'Notice statistics fetched successfully', {
      active: activeCount,
      archived: archivedCount,
      total: totalCount,
      byCategory,
    });
  } catch (error) {
    next(error);
  }
};
