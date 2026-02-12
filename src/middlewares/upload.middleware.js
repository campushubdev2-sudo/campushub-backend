// @ts-check

import multer from "multer";
import path from "path";
import fs from "fs";

// Get the server directory (current directory)
const getRootDir = () => process.cwd();

/**
 * File filter function - runs BEFORE destination
 * @param {import("express").Request} _req
 * @param {Express.Multer.File} file
 * @param {import("multer").FileFilterCallback} cb
 * @returns {void}
 */
const fileFilter = (_req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xlsx|xls|ppt|pptx|jpg|jpeg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }

  return cb(
    new Error(
      `File type "${path.extname(file.originalname)}" not allowed. Allowed types: PDF, DOC, DOCX, XLSX, XLS, PPT, PPTX, JPG, JPEG, PNG`,
    ),
  );
};

// Custom multer instance that creates directory only for valid files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Get report type from request body
      const reportType = req.body?.reportType || "unknown";

      // Create path: server/uploads/reports/<reportType>
      const rootDir = getRootDir();
      const uploadDir = path.join(rootDir, "uploads", "reports", reportType);

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    } catch (error) {
      cb(error instanceof Error ? error : new Error(String(error)), "");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "");
    cb(null, `report-${uniqueSuffix}-${path.extname(safeFilename)}`);
  },
});

const createMulterInstance = () => {
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 5 },
    fileFilter,
  });

  return upload.array("files", 5);
};

/**
 * Middleware wrapper that ensures directory exists only for valid files
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
const uploadReportFiles = (req, res, next) => {
  const upload = createMulterInstance();

  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // At this point, all files have passed the filter
    // Now ensure directory exists for valid files
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const reportType = req.body?.reportType || "unknown";
      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "reports",
        reportType,
      );

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }

    return next();
  });
};

/**
 * Error handling middleware for multer
 * @param {Error} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const handleMulterError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 10mb per file",
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
  return next();
};

/**
 * Middleware to parse multipart form data before authentication
 * @param {import('express').Request} _req - Express request object
 * @param {import('express').Response} _res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const parseFormData = (_req, _res, next) => {
  // Multer will handle the parsing
  next();
};

export { uploadReportFiles, parseFormData, handleMulterError };
