// src/middlewares/upload.middleware.js

// the file to save the uploaded files -> inside server/uploads/reports/<reportType>
import multer from "multer";
import path from "path";
import fs from "fs";

// Get the server directory (current directory)
const getRootDir = () => process.cwd();

// File filter function - runs BEFORE destination
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xlsx|xls|ppt|pptx|jpg|jpeg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${path.extname(file.originalname)}" not allowed. Allowed types: PDF, DOC, DOCX, XLSX, XLS, PPT, PPTX, JPG, JPEG, PNG`,
      ),
    );
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Get report type from request body
      const reportType = req.body?.reportType || "general";

      // Create path: server/uploads/reports/<reportType>
      const rootDir = getRootDir();
      const uploadDir = path.join(rootDir, "uploads", "reports", reportType);

      // DON'T create directory here - wait until we know file is valid
      // Directory will be created only when we actually save the file

      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `report-${uniqueSuffix}${path.extname(safeFilename)}`);
  },
});

// Custom multer instance that creates directory only for valid files
const createMulterInstance = () => {
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 5 },
    fileFilter,
  });

  return upload.array("files", 5);
};

// Middleware wrapper that ensures directory exists only for valid files
const uploadReportFiles = (req, res, next) => {
  const upload = createMulterInstance();

  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // At this point, all files have passed the filter
    // Now ensure directory exists for valid files
    if (req.files && req.files.length > 0) {
      const reportType = req.body?.reportType || "general";
      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "reports",
        reportType,
      );

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created directory for valid files: ${uploadDir}`);
      }
    }

    next();
  });
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 10MB per file",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 files per upload",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field. Use "files" as field name',
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }
  next();
};

// Middleware to parse multipart form data before authentication
const parseFormData = (req, res, next) => {
  // Multer will handle the parsing
  next();
};

export { uploadReportFiles, parseFormData, handleMulterError };
