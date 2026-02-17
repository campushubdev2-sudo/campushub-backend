import { Router } from "express";
import auditLogController from "../controllers/audit-log.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const auditLogRouter = Router();

auditLogRouter.use(authenticate, authorize("admin", "officer"), createRateLimiter({ limit: 30, windowMs: 60_000 }));

/**
 * DELETE /api/v1/audit-logs/cleanup
 *
 * Deletes old or unnecessary audit log records from the system.
 * This endpoint is used for maintenance and log retention management.
 *
 * Request Body:
 * NO REQUEST BODY
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Audit logs cleaned up successfully",
 *   data: {
 *     deletedCount: number       // Number of audit log records that were deleted
 *   }
 * }
 *
 * Error Responses:
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 * Possible messages include:
 * - Authentication required
 *
 * 403 Forbidden – User role is not allowed to perform this action
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 * Possible messages include:
 * - Forbidden: role "admin" is not allowed
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 * Possible messages include:
 * - Too many requests. Please try again later.
 */
auditLogRouter.delete("/cleanup", auditLogController.cleanup);

/**
 * GET /api/v1/audit-logs
 *
 * Retrieves a list of audit logs with optional filtering, sorting,
 * and field selection. Intended for monitoring and audit review.
 *
 * Request Query Parameters:
 * {
 *   userId: string,     // Optional. Must be a 24-character hexadecimal MongoDB ObjectId.
 *   action: string,     // Optional. Must be one of the supported action types.
 *   sort: string,       // Optional. Sorting criteria (e.g. "-createdAt").
 *   fields: string      // Optional. Comma-separated list of fields to include (e.g. "action,createdAt").
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Audit logs retrieved successfully",
 *   data: [
 *     {
 *       _id: string,            // Audit log ID
 *       userId: {
 *         _id: string,          // User ID
 *         username: string,     // Username of the actor
 *         role: string,         // Role of the user
 *         email: string         // Email of the user
 *       },
 *       action: string,         // Action performed
 *       createdAt: string,      // ISO timestamp of creation
 *       updatedAt: string       // ISO timestamp of last update
 *     }
 *   ]
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid query parameters
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - User ID must be a string.
 * - User ID must be a valid hexadecimal string.
 * - User ID must be exactly 24 characters long.
 * - Action must be a string.
 * - Action is not valid. Please select a supported action type.
 * - Sort parameter must be a string.
 * - Fields parameter must be a string.
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 * Possible messages include:
 * - Authentication required
 *
 * 403 Forbidden – User role is not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 * Possible messages include:
 * - Forbidden: role "user" is not allowed
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 * Possible messages include:
 * - Too many requests. Please try again later.
 */
auditLogRouter.get("/", auditLogController.getAuditLogs);

/**
 * DELETE /api/v1/audit-logs/:id
 *
 * Deletes a specific audit log entry identified by its ID.
 * Intended for administrative cleanup and audit management.
 *
 * Request Parameters:
 * {
 *   id: string,        // Required. Must be a valid 24-character MongoDB ObjectId.
 * }
 *
 * Request Body:
 * NO REQUEST BODY
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Audit log deleted successfully",
 *   data: {
 *     _id: string,           // Audit log ID
 *     userId: string,        // ID of the user who performed the action
 *     action: string,        // Action performed
 *     createdAt: string,     // ISO timestamp when the log was created
 *     updatedAt: string      // ISO timestamp when the log was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid or missing audit log ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Audit log ID must be a valid ObjectId
 * - Audit log ID is required
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 * Possible messages include:
 * - Authentication required
 *
 * 403 Forbidden – User role is not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 * Possible messages include:
 * - Forbidden: role "user" is not allowed
 *
 * 404 Not Found – Audit log not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Audit log not found"
 * }
 * Possible messages include:
 * - Audit log not found
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 * Possible messages include:
 * - Too many requests. Please try again later.
 */
auditLogRouter.delete("/:id", auditLogController.deleteAuditLog);

/**
 * GET /api/v1/audit-logs/:id
 *
 * Retrieves a single audit log entry by its unique identifier.
 *
 * Request Parameters:
 * {
 *   id: string,        // Required. Must be a 24-character hexadecimal MongoDB ObjectId.
 * }
 *
 * Request Body:
 * NO REQUEST BODY
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Audit log fetched successfully",
 *   data: {
 *     _id: string,            // Audit log ID
 *     userId: {
 *       _id: string,          // User ID
 *       username: string,     // Username of the user
 *       role: string,         // Role of the user
 *       email: string,        // Email address
 *       phoneNumber: string,  // Phone number in international format
 *       createdAt: string,    // ISO timestamp when the user was created
 *       updatedAt: string     // ISO timestamp when the user was last updated
 *     },
 *     action: string,         // Action performed
 *     createdAt: string,      // ISO timestamp when the audit log was created
 *     updatedAt: string       // ISO timestamp when the audit log was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid or missing audit log ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Audit log ID must be a valid ObjectId
 * - Audit log ID must be 24 characters
 * - Audit log ID is required
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 * Possible messages include:
 * - Authentication required
 *
 * 403 Forbidden – User role is not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 * Possible messages include:
 * - Forbidden: role "user" is not allowed
 *
 * 404 Not Found – Audit log not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Audit log not found"
 * }
 * Possible messages include:
 * - Audit log not found
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 * Possible messages include:
 * - Too many requests. Please try again later.
 */
auditLogRouter.get("/:id", auditLogController.getById);

export default auditLogRouter;
