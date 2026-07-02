const Notice = require('../models/Notice.model');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');

// ── Timeframe Constants ────────────────────────────────────────────────────────
const ARCHIVE_AFTER_DAYS = 30;  // Auto-archive active notices after 30 days
const PURGE_AFTER_DAYS   = 60;  // Permanently delete archived notices after 60 days

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 * @access  Private (Admin / HR)
 */
exports.createNotice = async (req, res, next) => {
  try {
    const { title, body, category, attachmentUrl, attachmentName } = req.body;

    const notice = await Notice.create({
      title,
      body,
      category,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      postedBy: req.user.id,
    });

    // Populate postedBy for the response
    await notice.populate('postedBy', 'fullName role');

    return ApiResponse.success(res, 'Notice created successfully', notice, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active (non-archived) notices (with optional filtering & limit)
 * @route   GET /api/notices
 * @access  Private (All logged-in users)
 * @query   category=Urgent|Placement|General, limit=3, page=1
 */
exports.getAllNotices = async (req, res, next) => {
  try {
    const filter = {}; // isActive: true AND isArchived: false applied automatically by pre-find hook

    if (req.query.category && typeof req.query.category === 'string') {
      filter.category = req.query.category;
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escapeRegex(req.query.search), $options: 'i' };
    }

    const limit = parseInt(req.query.limit, 10) || 0;
    const page  = parseInt(req.query.page, 10)  || 1;
    const skip  = limit > 0 ? (page - 1) * limit : 0;

    const query = Notice.find(filter)
      .populate('postedBy', 'fullName role')
      .sort({ createdAt: -1 });

    if (limit > 0) {
      query.skip(skip).limit(limit);
    }

    const [notices, total] = await Promise.all([
      query,
      Notice.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Notices fetched successfully', {
      notices,
      total,
      page,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all archived notices — sorted by archivedAt descending
 * @route   GET /api/notices/archived
 * @access  Private (Admin / HR only)
 */
exports.getArchivedNotices = async (req, res, next) => {
  try {
    const filter = { isActive: { $exists: true }, isArchived: true };

    if (req.query.category && typeof req.query.category === 'string') {
      filter.category = req.query.category;
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escapeRegex(req.query.search), $options: 'i' };
    }

    const limit = parseInt(req.query.limit, 10) || 0;
    const page  = parseInt(req.query.page, 10)  || 1;
    const skip  = limit > 0 ? (page - 1) * limit : 0;

    const query = Notice.find(filter)
      .populate('postedBy', 'fullName role')
      .sort({ archivedAt: -1 });

    if (limit > 0) {
      query.skip(skip).limit(limit);
    }

    const [notices, total] = await Promise.all([
      query,
      Notice.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Archived notices fetched successfully', {
      notices,
      total,
      page,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single notice by ID
 * @route   GET /api/notices/:id
 * @access  Private (All logged-in users)
 */
exports.getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate(
      'postedBy',
      'fullName role'
    );

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    return ApiResponse.success(res, 'Notice fetched successfully', notice);
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Update notice details
 * @route   PUT /api/notices/:id
 * @access  Private (Admin / HR)
 */
exports.updateNotice = async (req, res, next) => {
  try {
    // Whitelist only the fields an admin is allowed to edit.
    // Prevents injection of sensitive fields like isActive, isArchived, postedBy, archivedAt.
    const ALLOWED_NOTICE_FIELDS = ['title', 'body', 'category', 'attachmentUrl', 'attachmentName'];
    const updateData = {};
    ALLOWED_NOTICE_FIELDS.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('postedBy', 'fullName role');

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    return ApiResponse.success(res, 'Notice updated successfully', notice);
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Manually archive a notice (admin action)
 *          Sets isArchived=true, archivedAt=now — immediately hides from students
 * @route   PATCH /api/notices/:id/archive
 * @access  Private (Admin / HR)
 */
exports.archiveNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findOne({
      _id: req.params.id,
      isActive: { $exists: true },
    });

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    if (notice.isArchived) {
      return ApiResponse.error(res, 'Notice is already archived', 400);
    }

    notice.isArchived = true;
    notice.archivedAt = new Date();
    await notice.save();

    return ApiResponse.success(res, 'Notice archived successfully', notice);
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Restore an archived notice back to active
 *          Clears isArchived and archivedAt — notice reappears on student dashboard
 * @route   PATCH /api/notices/:id/restore
 * @access  Private (Admin / HR)
 */
exports.restoreNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findOne({
      _id: req.params.id,
      isActive: { $exists: true },
    });

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    if (!notice.isArchived) {
      return ApiResponse.error(res, 'Notice is not archived', 400);
    }

    notice.isArchived = false;
    notice.archivedAt = null;
    await notice.save();

    return ApiResponse.success(res, 'Notice restored successfully', notice);
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Soft-delete a notice (sets isActive = false)
 * @route   DELETE /api/notices/:id
 * @access  Private (Admin / HR)
 */
exports.deleteNotice = async (req, res, next) => {
  try {
    // Bypass the isActive pre-find hook to find the raw document
    const notice = await Notice.findOne({
      _id: req.params.id,
      isActive: { $exists: true },
    });

    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    notice.isActive = false;
    await notice.save();

    return ApiResponse.success(res, 'Notice deleted successfully');
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};

// ── Read-tracking (per-user) ───────────────────────────────────────────────────

/**
 * @desc    Mark a notice as read for the logged-in user
 * @route   PATCH /api/notices/:id/read
 * @access  Private (All logged-in users)
 */
exports.markNoticeRead = async (req, res, next) => {
  try {
    const noticeId = req.params.id;

    // Validate that the notice exists
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return ApiResponse.error(res, 'Notice not found', 404);
    }

    // $addToSet ensures no duplicates
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { readNotices: noticeId },
    });

    return ApiResponse.success(res, 'Notice marked as read');
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid notice ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Get the list of notice IDs the logged-in user has read
 * @route   GET /api/notices/read
 * @access  Private (All logged-in users)
 */
exports.getReadNotices = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('readNotices');
    return ApiResponse.success(res, 'Read notices fetched', {
      readNotices: user?.readNotices || [],
    });
  } catch (error) {
    next(error);
  }
};

// ── Internal Cron Handlers ─────────────────────────────────────────────────────

/**
 * Auto-archive all active notices older than ARCHIVE_AFTER_DAYS (30 days).
 * Called by the cron service daily at midnight.
 */
exports.runAutoArchive = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ARCHIVE_AFTER_DAYS);

  const result = await Notice.updateMany(
    {
      isArchived: { $ne: true },
      isActive: true,
      createdAt: { $lt: cutoff },
    },
    {
      $set: { isArchived: true, archivedAt: new Date() },
    }
  );

  return result.modifiedCount;
};

/**
 * Permanently hard-delete archived notices older than PURGE_AFTER_DAYS (60 days) from archivedAt.
 * Called by the cron service daily at midnight.
 */
exports.runPurgeArchived = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PURGE_AFTER_DAYS);

  const result = await Notice.deleteMany({
    isActive: { $exists: true },
    isArchived: true,
    archivedAt: { $lt: cutoff },
  });

  return result.deletedCount;
};
