const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Sanitize the filename for security (prevent directory traversal / invalid chars)
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    return {
      folder: `cpms/resumes/${req.user._id}`,
      resource_type: 'raw', // Use 'raw' as it is the most reliable for generic file delivery
      public_id: `${Date.now()}-${sanitizedName}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only pdf files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// 2MB size limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = upload;
