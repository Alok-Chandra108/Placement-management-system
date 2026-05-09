const Drive = require('../models/Drive.model');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Create a new drive
 * @route   POST /api/drives
 * @access  Private (Admin/HR)
 */
exports.createDrive = async (req, res, next) => {
  try {
    const driveData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const drive = await Drive.create(driveData);

    return ApiResponse.success(res, 'Drive created successfully', drive, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all drives (with optional filtering)
 * @route   GET /api/drives
 * @access  Private (Students, Admin, HR)
 */
exports.getAllDrives = async (req, res, next) => {
  try {
    // Basic filtering based on status
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Limit and sorting (default latest first)
    const limit = parseInt(req.query.limit, 10) || 0; // 0 means no limit
    const drivesQuery = Drive.find(filter).sort({ createdAt: -1 });
    
    if (limit > 0) {
      drivesQuery.limit(limit);
    }

    const drives = await drivesQuery;

    return ApiResponse.success(res, 'Drives fetched successfully', drives);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single drive by ID
 * @route   GET /api/drives/:id
 * @access  Private (Students, Admin, HR)
 */
exports.getDriveById = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);

    if (!drive) {
      return ApiResponse.error(res, 'Drive not found', 404);
    }

    return ApiResponse.success(res, 'Drive details fetched successfully', drive);
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid drive ID format', 400);
    }
    next(error);
  }
};

/**
 * @desc    Update drive details
 * @route   PATCH /api/drives/:id
 * @access  Private (Admin/HR)
 */
exports.updateDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!drive) {
      return ApiResponse.error(res, 'Drive not found', 404);
    }

    return ApiResponse.success(res, 'Drive updated successfully', drive);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a drive
 * @route   DELETE /api/drives/:id
 * @access  Private (Admin/HR)
 */
exports.deleteDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);

    if (!drive) {
      return ApiResponse.error(res, 'Drive not found', 404);
    }

    return ApiResponse.success(res, 'Drive deleted successfully');
  } catch (error) {
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid drive ID format', 400);
    }
    next(error);
  }
};
