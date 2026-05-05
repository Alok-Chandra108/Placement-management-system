const User = require('../models/User.model');
const Drive = require('../models/Drive.model');
const Notice = require('../models/Notice.model');

/**
 * @desc    Get dashboard statistics for admin overview
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeDrives = await Drive.countDocuments({ status: 'open' });
    const pendingNotices = await Notice.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeDrives,
        pendingNotices,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students with pagination, search, and filtering
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, branch } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query object
    const query = { role: 'student' };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { usnNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (branch) {
      query.department = branch;
    }
    
    // Execute query with pagination
    const students = await User.find(query)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};
