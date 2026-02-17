// @ts-check
import { Router } from "express";

import otpController from "../controllers/otp.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const otpRouter = Router();

/**
 * DELETE /api/v1/otp/cleanup
 *
 * Deletes all expired OTP records from the system.
 * Accessible only to authenticated users with the "admin" role.
 * This endpoint is rate-limited to 60 requests per minute.
 *
 * Request Body:
 * NONE
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Expired OTPs have been successfully deleted",
 *   data: {
 *     deletedCount: number   // Total number of expired OTP records that were removed
 *   }
 * }
 *
 * Error Responses:
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Authentication required
 * - Invalid or expired token
 *
 * 403 Forbidden – User role not permitted
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Forbidden: role "<userRole>" is not allowed
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Too many requests. Please try again later.
 *
 * 500 Internal Server Error – Server failed to clean up OTPs
 * {
 *   success: false,
 *   status: "error",
 *   message: string
 * }
 * Possible messages include:
 * - Failed to delete expired OTPs
 * - Unexpected server error
 */
otpRouter.delete("/cleanup", authenticate, authorize("admin"), createRateLimiter({ limit: 60, windowMs: 60_000 }), otpController.cleanupExpiredOtps);

/**
 * GET /api/v1/otp/stats
 *
 * Retrieves aggregated OTP statistics.
 * Accessible only to authenticated users with the "admin" role.
 * This endpoint is rate-limited to 20 requests per minute.
 *
 * Request Body:
 * NONE
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "OTP statistics retrieved successfully",
 *   data: {
 *     totalOTPs: number,        // Total number of OTP records in the system
 *     activeOTPs: number,       // Number of OTPs that are currently valid (not expired and not verified)
 *     expiredOTPs: number,      // Number of OTPs that have passed their expiration time
 *     verifiedOTPs: number,     // Number of OTPs that have been successfully verified
 *     otpsByEmail: Array<{      // Aggregated OTP counts grouped by email
 *       email: string,          // Email address associated with the OTPs
 *       count: number           // Total OTPs generated for this email
 *     }>
 *   }
 * }
 *
 * Error Responses:
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Authentication required
 * - Invalid or expired token
 *
 * 403 Forbidden – User role not permitted
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Forbidden: role "<userRole>" is not allowed
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Too many requests. Please try again later.
 *
 * 500 Internal Server Error – Failed to retrieve OTP statistics
 * {
 *   success: false,
 *   status: "error",
 *   message: string
 * }
 * Possible messages include:
 * - Failed to retrieve OTP statistics
 * - Unexpected server error
 */
otpRouter.get("/stats", authenticate, authorize("admin"), createRateLimiter({ limit: 20, windowMs: 60_000 }), otpController.getStats);

/**
 * POST /api/v1/otp/send
 *
 * Generates and sends a One-Time Password (OTP) to the provided email address.
 * This endpoint is publicly accessible and rate-limited to 5 requests per 5 minutes per IP.
 *
 * Request Body:
 * {
 *   email: string   // Required. Must be a valid email address format (e.g., user@example.com)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "OTP has been sent to your email address",
 *   data: {
 *     email: string,        // Email address to which the OTP was sent
 *     expiresAt: string     // ISO 8601 timestamp indicating when the OTP will expire
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation error
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Email is required
 * - Please enter a valid email address
 *
 * 404 Not Found – User does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - User with this email does not exist
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Too many requests. Please try again later.
 *
 * 500 Internal Server Error – Failed to send OTP
 * {
 *   success: false,
 *   status: "error",
 *   message: string
 * }
 * Possible messages include:
 * - Failed to send OTP
 * - Unexpected server error
 */
otpRouter.post("/send", createRateLimiter({ limit: 5, windowMs: 5 * 60_000 }), otpController.sendOtp);

/**
 * POST /api/v1/otp/resend
 *
 * Resends a new One-Time Password (OTP) to the provided email address.
 * This endpoint is publicly accessible and rate-limited to 3 requests per 5 minutes per IP.
 *
 * Request Body:
 * {
 *   email: string   // Required. Must be a valid email address format (e.g., user@example.com)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "A new OTP has been sent to your email address",
 *   data: {
 *     email: string,        // Email address to which the OTP was sent
 *     expiresAt: string     // ISO 8601 timestamp indicating when the new OTP will expire
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation error
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Email is required
 * - Please enter a valid email address
 *
 * 404 Not Found – User does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - User with this email does not exist
 *
 * 429 Too Many Requests – OTP still valid
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Current OTP is still valid. Please check your email or wait <remainingTime> minute(s).
 *
 * 500 Internal Server Error – Failed to resend OTP
 * {
 *   success: false,
 *   status: "error",
 *   message: string
 * }
 * Possible messages include:
 * - Failed to resend OTP
 * - Unexpected server error
 */
otpRouter.post("/resend", createRateLimiter({ limit: 3, windowMs: 5 * 60_000 }), otpController.resendOtp);

/**
 * /api/v1/otp/verify
 * BODY
 * {
 *   email: string,               // Required. The user's email address.
 *   otp: string,                 // Required. The OTP code to verify.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "OTP verified successfully",
 *   data: {
 *     email: string,             // The email address used for verification.
 *     verified: boolean,         // Whether the OTP verification was successful (true/false).
 *   }
 * }
 *
 * Error Responses:
 *
 * 429 Too Many Requests – Too many requests. Please try again later.
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many invalid attempts. OTP invalidated."
 * }
 *
 * 400 Bad Request – Invalid input or expired OTP.
 * {
 *   success: false,
 *   status: "error",
 *   message: "<Error Message>"
 * }
 * Possible messages include:
 * - "Please enter a valid email address"
 * - "Email is required"
 * - "Invalid OTP"
 * - "OTP has expired"
 */
otpRouter.post("/verify", createRateLimiter({ limit: 5, windowMs: 5 * 60_000 }), otpController.verifyOtp);

export default otpRouter;
