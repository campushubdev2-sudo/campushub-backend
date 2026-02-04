// src/middlewares/error.middleware.js

import { NODE_ENV } from "../config/env.js";
/**
 * Global Error Handler Middleware
 * @param {Error} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @return {void}
 */
const errorMiddleware = (err, _req, res, next) => {
  try {
    /** @type {AppError} */
    let error =
      err instanceof AppError
        ? err
        : new AppError(err.message || "Server Error", err.statusCode || 500);

    // Copy status code from original error if it exists
    error.statusCode = error.statusCode || err.statusCode || 500;
    error.status = error.status || err.status || "error";

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
      const message = "Resource not found";
      error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if ("code" in err && err.code === 11000) {
      const message = "Duplicate field value entered";
      error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === "ValidationError" && "errors" in err) {
      const message = Object.values(err.errors ?? {})
        .map((val) => val.message)
        .join(", ");
      error = new AppError(message, 400);
    }

    if (NODE_ENV === "development") {
      console.log("\n======================================================");
      console.error("[src/middlewares/error.middleware.js]: ", err);
      console.log("======================================================");

      res.status(error.statusCode).json({
        success: false,
        status: error.status,
        error: err,
        message: error.message,
        stack: err.stack,
      });
    } else {
      // Production mode
      if (error.isOperational || err.isOperational) {
        res.status(error.statusCode).json({
          success: false,
          status: error.status,
          message: error.message,
        });
      } else {
        // Programming or unknown errors
        console.log("\n======================================================");
        console.error("[src/middlewares/error.middleware.js]: ", err);
        console.log("======================================================");
        res.status(500).json({
          success: false,
          status: "error",
          message: "Something went wrong!",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Custom Application Error Class
 * @extends {Error}
 */
class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Maintains proper stack trace (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export default errorMiddleware;
export { AppError };
