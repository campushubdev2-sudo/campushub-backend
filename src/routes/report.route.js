// src/routes/report.route.js
import { Router } from "express";
import ReportController from "../controllers/report.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadReportFiles } from "../middlewares/upload.middleware.js";
import { handleMulterError } from "../middlewares/upload.middleware.js";
import { parseFormData } from "../middlewares/upload.middleware.js";

const reportRouter = Router();

/**
 * POST /api/v1/reports
 *
 * Submit a new report with uploaded file(s).
 *
 * Request Body (multipart/form-data):
 * {
 *   files: File | File[],      // Required. One or more report files
 *   reportType: string,        // Required. One of: actionPlan, bylaws, financial, proposal
 *   orgId: string              // Required. Organization ID (24-character MongoDB ObjectId)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Report submitted successfully",
 *   data: {
 *     _id: string,             // Report ID
 *     orgId: {
 *       _id: string,           // Organization ID
 *       orgName: string,       // Organization name
 *       description: string    // Organization description
 *     },
 *     submittedBy: {
 *       _id: string,           // User ID
 *       username: string,      // Username
 *       role: string,          // User role (e.g., admin)
 *       email: string          // User email address
 *     },
 *     reportType: string,      // Report type
 *     filePaths: string[],     // Stored file path(s)
 *     status: string,          // Report status (pending)
 *     submittedDate: string,   // ISO 8601 submission timestamp
 *     createdAt: string,       // ISO 8601 timestamp
 *     updatedAt: string        // ISO 8601 timestamp
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
 * - Organization ID must be a valid MongoDB ObjectId
 * - Organization ID must be 24 characters
 * - Organization ID is required
 * - Report type must be one of: actionPlan, bylaws, financial, proposal
 * - Report type is required
 * - File path cannot exceed 255 characters
 * - File path must be a valid URI
 * - At least one file path is required
 * - Status must be one of: pending, approved, rejected
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role not allowed
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
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
reportRouter.post("/", parseFormData, authenticate, authorize("admin", "officer"), uploadReportFiles, handleMulterError, ReportController.createReport);

/**
 * GET /api/v1/reports
 *
 * Retrieve a paginated list of reports with optional filtering and sorting.
 * Accessible to authenticated users with roles: admin, officer, adviser.
 *
 * Request Query Parameters:
 * {
 *   page: number,              // Optional. Page number (must be an integer ≥ 1). Default: 1
 *   limit: number,             // Optional. Number of records per page (1–100). Default: 25
 *   orgId: string,             // Optional. Organization ID (24-character hexadecimal MongoDB ObjectId)
 *   reportType: string,        // Optional. One of: actionPlan, bylaws, financial, proposal
 *   submittedBy: string,       // Optional. User ID of submitter (24-character hexadecimal MongoDB ObjectId)
 *   sortBy: string,            // Optional. Sort field. One of: submittedDate, createdAt, updatedAt
 *                              // Default: "submittedDate"
 *   sortOrder: string          // Optional. Sort direction. Either "asc" or "desc"
 *                              // Default: "desc"
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   count: number,             // Total number of reports matching the query
 *   data: [
 *     {
 *       _id: string,            // Report ID
 *       orgId: {
 *         _id: string,          // Organization ID
 *         orgName: string,      // Organization name
 *         adviserId: string     // Adviser user ID
 *       },
 *       submittedBy: {
 *         _id: string,          // User ID of submitter
 *         username: string,     // Username of submitter
 *         role: string,         // Role of submitter
 *         email: string         // Email of submitter
 *       },
 *       reportType: string,     // Type of report
 *       filePaths: string[],    // Array of uploaded file paths
 *       status: string,         // Current report status (e.g., pending)
 *       submittedDate: string,  // ISO date when report was submitted
 *       createdAt: string,      // ISO date when record was created
 *       updatedAt: string       // ISO date when record was last updated
 *     }
 *   ]
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid query parameters
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Page must be a number.
 * - Page must be a whole number.
 * - Page must be at least 1.
 * - Limit must be a number.
 * - Limit must be a whole number.
 * - Limit must be at least 1.
 * - Limit cannot exceed 100.
 * - Organization ID must be a string.
 * - Organization ID is invalid.
 * - Report type must be one of: actionPlan, bylaws, financial, proposal.
 * - Report type must be a string.
 * - Submitted-by ID must be a string.
 * - Submitted-by ID is invalid.
 * - Sort field must be one of: submittedDate, createdAt, updatedAt.
 * - Sort field must be a string.
 * - Sort order must be either asc or desc.
 * - Sort order must be a string.
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Insufficient permissions
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
reportRouter.get("/", authenticate, authorize("admin", "officer", "adviser"), ReportController.getAllReports);

/**
 * GET /api/v1/reports/:id/download
 *
 * Download report file(s) by report ID.
 * If the report contains a single file, it is downloaded directly.
 * If the report contains multiple files, they are bundled and downloaded as a ZIP archive.
 * Accessible only to authenticated users with the admin role.
 *
 * Request Params:
 * {
 *   id: string,                // Required. Report ID (valid MongoDB ObjectId format)
 * }
 *
 * Success Response (200):
 *
 * The server responds with a file download:
 * - Single file → downloaded as-is (browser save prompt)
 * - Multiple files → downloaded as a ZIP archive (browser save prompt)
 *
 * Response Headers:
 * - Content-Disposition: attachment; filename="<file-name | report-files.zip>"
 * - Content-Type: application/octet-stream | application/zip
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid report ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Invalid report ID format
 * - Report ID is required
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Insufficient permissions
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Report does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Report not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
reportRouter.get("/:id/download", authenticate, authorize("admin"), ReportController.downloadReportFiles);

/**
 * PUT /api/v1/reports/:id
 *
 * Update the status of a report.
 * Only accessible to authenticated users with the admin role.
 *
 * Request Params:
 * {
 *   id: string,                // Required. Report ID (24-character hexadecimal MongoDB ObjectId)
 * }
 *
 * Request Body:
 * {
 *   status: string,            // Required. One of: pending, approved, rejected
 *   message: string            // Optional. Allowed only when status is "approved".
 *                              // Defaults to "Your proposal has been approved."
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Report status updated successfully",
 *   data: {
 *     _id: string,             // Report ID
 *     orgId: string,           // Organization ID
 *     submittedBy: {
 *       _id: string,           // User ID of submitter
 *       username: string,      // Username
 *       role: string,          // User role
 *       email: string,         // User email
 *       phoneNumber: string,   // User phone number
 *       createdAt: string,     // ISO date user record was created
 *       updatedAt: string      // ISO date user record was last updated
 *     },
 *     reportType: string,      // Type of report (e.g., bylaws)
 *     filePaths: string[],     // Uploaded report file paths
 *     status: string,          // Updated report status
 *     submittedDate: string,   // ISO date report was submitted
 *     createdAt: string,       // ISO date report record was created
 *     updatedAt: string        // ISO date report record was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid parameters or request body
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Report ID is required.
 * - Report ID must be a string.
 * - Report ID is invalid.
 * - Status is required.
 * - Status must be a string.
 * - Status must be one of: pending, approved, rejected.
 * - Message must be a string.
 * - Message is only allowed when status is approved.
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Insufficient permissions
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Report does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Report not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
reportRouter.put("/:id", authenticate, authorize("admin"), ReportController.updateStatus);

/**
 * GET /api/v1/reports/:id
 *
 * Retrieve a single report by its unique identifier.
 * Accessible to authenticated users with roles: admin, officer, adviser.
 *
 * Request Params:
 * {
 *   id: string,                // Required. Report ID (valid MongoDB ObjectId)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   data: {
 *     _id: string,             // Report ID
 *     orgId: {
 *       _id: string,           // Organization ID
 *       orgName: string,       // Organization name
 *       description: string    // Organization description
 *     },
 *     submittedBy: {
 *       _id: string,           // User ID of submitter
 *       username: string,      // Username of submitter
 *       role: string,          // User role
 *       email: string          // User email
 *     },
 *     reportType: string,      // Type of report (e.g., bylaws)
 *     filePaths: string[],     // Uploaded report file paths
 *     status: string,          // Current report status
 *     submittedDate: string,   // ISO date when report was submitted
 *     createdAt: string,       // ISO date when record was created
 *     updatedAt: string        // ISO date when record was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid report ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Invalid report id
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Insufficient permissions
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Report does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Report not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
reportRouter.get("/:id", authenticate, authorize("admin", "officer", "adviser"), ReportController.getReportById);

/**
 * DELETE /api/v1/reports/:id
 *
 * Delete a report by its unique identifier.
 * Accessible only to authenticated users with the admin role.
 *
 * Request Params:
 * {
 *   id: string,                // Required. Report ID (24-character hexadecimal MongoDB ObjectId)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Report deleted successfully",
 *   data: {
 *     _id: string,             // Deleted report ID
 *     orgId: string,           // Organization ID
 *     submittedBy: string,     // User ID of the report submitter
 *     reportType: string,      // Type of report
 *     filePaths: string[],     // Paths of uploaded report files
 *     status: string,          // Report status at time of deletion
 *     submittedDate: string,   // ISO date when report was submitted
 *     createdAt: string,       // ISO date when report was created
 *     updatedAt: string        // ISO date when report was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid report ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Report ID is required.
 * - Report ID must be a string.
 * - Report ID is invalid.
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Insufficient permissions
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Report does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Report not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
reportRouter.delete("/:id", authenticate, authorize("admin"), ReportController.deleteReportById);

export default reportRouter;
