// @ts-check
import { Router } from "express";

import officerController from "../controllers/officer.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const officerRouter = Router();

officerRouter.use(createRateLimiter({ limit: 60, windowMs: 60_000 }));

/**
 * GET /api/v1/officers/meta/positions
 *
 * Retrieve the list of available officer positions.
 *
 * This endpoint returns a predefined list of officer positions that can be
 * used for dropdowns, selection fields, or validation in officer-related forms.
 *
 * Request Body:
 * - None
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Officer positions retrieved successfully",
 *   data: [
 *     {
 *       positionValue: string,   // Internal value of the officer position
 *       positionLabel: string    // Human-readable label of the officer position
 *     }
 *   ]
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
 * - "Authentication required"
 * - "Invalid or expired token"
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: string
 * }
 * Possible messages include:
 * - "Too many requests. Please try again later"
 */
officerRouter.get("/meta/positions", authenticate, officerController.getAllOfficerPositions);

/**
 * POST /api/v1/officers
 *
 * Create a new officer for a specific organization.
 * Only accessible to authenticated users with the "admin" role.
 *
 * Request Body:
 * {
 *   userId: string,        // Required. Must be a 24-character hexadecimal string (MongoDB ObjectId).
 *   orgId: string,         // Required. Must be a 24-character hexadecimal string (MongoDB ObjectId).
 *   position: string,      // Required. Must be a valid officer position, max 50 characters.
 *   startTerm: string,     // Required. Must be a valid ISO 8601 date string.
 *   endTerm: string        // Required. Must be a valid ISO 8601 date string and later than startTerm.
 * }
 *
 * Success Response (201):
 * {
 *   success: true,
 *   message: "Officer created successfully",
 *   data: {
 *     _id: string,         // Unique identifier of the officer (24-character hexadecimal string).
 *     userId: string,      // ID of the associated user (24-character hexadecimal string).
 *     orgId: string,       // ID of the associated organization (24-character hexadecimal string).
 *     position: string,    // Officer position assigned.
 *     startTerm: string,   // Start date of the officer's term (ISO 8601 format).
 *     endTerm: string,     // End date of the officer's term (ISO 8601 format).
 *     createdAt: string,   // Timestamp when the record was created (ISO 8601 format).
 *     updatedAt: string    // Timestamp when the record was last updated (ISO 8601 format).
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid request body parameters
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - The User ID must be a valid hexadecimal string.
 * - The User ID must be exactly 24 characters long.
 * - "userId" is required
 * - "orgId" must be a string
 * - "orgId" must be a valid hexadecimal string
 * - "orgId" must be exactly 24 characters long
 * - "orgId" is required
 * - "position" must be a string
 * - "position" must not exceed 50 characters
 * - "position" must be a valid officer position
 * - "position" is required
 * - "startTerm" must be a valid date
 * - "startTerm" is required
 * - "endTerm" must be a valid date
 * - "endTerm" must be later than "startTerm"
 * - "endTerm" is required
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
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 *
 * 404 Not Found – Related resource not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - User not found
 * - Organization not found
 *
 * 409 Conflict – Duplicate officer assignment
 * {
 *   success: false,
 *   status: "fail",
 *   message: "User is already an officer of this organization"
 * }
 */
officerRouter.post("/", authenticate, authorize("admin"), officerController.createOfficer);

/**
 * GET /api/v1/officers
 *
 * Retrieve a paginated list of officers with optional filtering, sorting, and ordering.
 *
 * Request Query Parameters (all optional):
 * {
 *   orgId: string,      // Optional. Must be a 24-character hexadecimal MongoDB ObjectId.
 *   userId: string,     // Optional. Must be a 24-character hexadecimal MongoDB ObjectId.
 *   position: string,   // Optional. Maximum of 50 characters.
 *   page: number,       // Optional. Must be a number and at least 1. Default: 1.
 *   limit: number,      // Optional. Must be a number and at least 1. Default: 10.
 *   sortBy: string,     // Optional. Allowed values: "createdAt", "startTerm", "endTerm", "position".
 *   order: string       // Optional. Allowed values: "asc" or "desc". Default: "desc".
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Officers retrieved successfully",
 *   data: {
 *     items: [
 *       {
 *         _id: string,                // Officer ID (MongoDB ObjectId)
 *         userId: {
 *           _id: string,              // User ID (MongoDB ObjectId)
 *           username: string,         // Officer username
 *           role: string,             // User role (e.g., "officer")
 *           email: string             // Officer email address
 *         },
 *         orgId: {
 *           _id: string,              // Organization ID (MongoDB ObjectId)
 *           orgName: string           // Organization name
 *         },
 *         position: string,           // Officer position in the organization
 *         startTerm: string,          // ISO date string (term start date)
 *         endTerm: string,            // ISO date string (term end date)
 *         createdAt: string,          // ISO date string (record creation timestamp)
 *         updatedAt: string           // ISO date string (last update timestamp)
 *       }
 *     ],
 *     meta: {
 *       page: number,                 // Current page number
 *       limit: number,                // Number of records per page
 *       total: number,                // Total number of records
 *       totalPages: number            // Total number of pages
 *     }
 *   }
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
 * - The Organization ID must be a valid hexadecimal string.
 * - The Organization ID must be exactly 24 characters long.
 * - The User ID must be a valid hexadecimal string.
 * - The User ID must be exactly 24 characters long.
 * - Position name cannot exceed 50 characters.
 * - Page must be a number.
 * - Page must be at least 1.
 * - You can only sort by createdAt, startTerm, endTerm, or position.
 * - Order must be either 'asc' or 'desc'.
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "error",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Insufficient permissions
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 */
officerRouter.get("/", authenticate, authorize("admin", "officer", "adviser"), officerController.getOfficers);

/**
 * GET /api/v1/officers/stats/overview
 *
 * Retrieves an overview of officer statistics including summary counts,
 * distribution by organization and position, and term duration metrics.
 *
 * Request Body:
 * None
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Officer statistics retrieved successfully",
 *   data: {
 *     summary: {
 *       totalOfficers: number,        // Total number of officers in the system
 *       activeOfficers: number,       // Number of currently active officers
 *       inactiveOfficers: number      // Number of inactive officers
 *     },
 *     distribution: {
 *       byOrganization: [
 *         {
 *           organizationId: string,   // Unique identifier of the organization (ObjectId format)
 *           organizationName: string, // Name of the organization
 *           officerCount: number      // Number of officers in the organization
 *         }
 *       ],
 *       byPosition: [
 *         {
 *           position: string,         // Officer position title (e.g., "President")
 *           count: number             // Number of officers holding this position
 *         }
 *       ]
 *     },
 *     termDuration: {
 *       _id: string | null,           // Aggregation identifier (null if not grouped)
 *       avgDuration: number,          // Average term duration (in months)
 *       minDuration: number,          // Minimum term duration (in months)
 *       maxDuration: number,          // Maximum term duration (in months)
 *       totalOfficers: number         // Total officers included in duration calculation
 *     }
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
 * 403 Forbidden – Role not allowed to access this resource
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 * Possible messages include:
 * - Forbidden: role "${userRole}" is not allowed
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
officerRouter.get("/stats/overview", authenticate, authorize("admin", "officer"), officerController.getOfficerStats);

/**
 * GET /api/v1/officers/stats/period
 *
 * Retrieves officer statistics grouped by a specified time period
 * (month, quarter, or year).
 *
 * Request Query:
 * {
 *   period: string    // Required. Must be one of: "month", "quarter", "year".
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Officer statistics by period retrieved successfully",
 *   data: [
 *     {
 *       _id: {
 *         year: number,        // Year of the aggregated period (e.g., 2026)
 *         month?: number,      // Month number (1–12). Present if period = "month"
 *         quarter?: number     // Quarter number (1–4). Present if period = "quarter"
 *       },
 *       count: number          // Total number of officers for the specified period
 *     }
 *   ]
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid period value
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Period must be one of: month, quarter, year"
 * }
 * Possible messages include:
 * - Period must be one of: month, quarter, year
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
 * 403 Forbidden – Role not allowed to access this resource
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 * Possible messages include:
 * - Forbidden: role "${userRole}" is not allowed
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
officerRouter.get("/stats/period", authenticate, authorize("admin"), officerController.getOfficersByPeriod);

/**
 * GET /api/v1/officers/stats/detailed
 *
 * Retrieve detailed information about officers.
 * Accessible only to authenticated users with the "admin" role.
 *
 * Request Body:
 * {
 *   // No request body
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Detailed officers information retrieved successfully",
 *   count: number,                // Total number of officers returned
 *   data: [
 *     {
 *       _id: string,               // Officer record ID (MongoDB ObjectId)
 *       position: string,          // Officer position/title (e.g., "President")
 *       startTerm: string,         // ISO 8601 date string (term start)
 *       endTerm: string,           // ISO 8601 date string (term end)
 *       username: string,          // Officer username
 *       email: string,             // Officer email address
 *       userRole: string,          // User role (e.g., "officer")
 *       organizationName: string   // Name of the organization
 *     }
 *   ]
 * }
 *
 * Error Responses:
 *
 * 401 Authentication Required – User is not authenticated
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role is not allowed
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
officerRouter.get("/stats/detailed", authenticate, authorize("admin"), officerController.getOfficersDetailed);

/**
 * GET /api/v1/officers/stats/near-term-end
 *
 * Retrieve officers whose terms will end within a specified number of days.
 * Accessible only to authenticated users with the "admin" role.
 *
 * Query Parameters:
 * {
 *   days: number,               // Required. Integer between 1 and 365 (inclusive)
 * }
 *
 * Request Body:
 * {
 *   // No request body
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Officers with term ending within <days> days retrieved successfully",
 *   data: {
 *     days: number,             // Number of days used for the query
 *     count: number,            // Total number of officers found
 *     officers: [
 *       {
 *         _id: string,          // Officer record ID (MongoDB ObjectId)
 *         userId: {
 *           _id: string,        // User ID (MongoDB ObjectId)
 *           username: string,   // Officer username
 *           email: string       // Officer email address
 *         },
 *         orgId: {
 *           _id: string,        // Organization ID (MongoDB ObjectId)
 *           orgName: string     // Organization name
 *         },
 *         position: string,     // Officer position/title
 *         startTerm: string,    // ISO 8601 date string (term start)
 *         endTerm: string,      // ISO 8601 date string (term end)
 *         createdAt: string,    // ISO 8601 date string (record creation)
 *         updatedAt: string     // ISO 8601 date string (last update)
 *       }
 *     ]
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid query parameter "days"
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Days must be a number"
 * - "Days must be at least 1"
 * - "Days cannot exceed 365"
 *
 * 401 Authentication Required – User is not authenticated
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role is not allowed
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
officerRouter.get("/stats/near-term-end", authenticate, authorize("admin"), officerController.getOfficersNearTermEnd);

/**
 * GET /api/v1/officers/stats/organization/:orgId
 *
 * Retrieve officer statistics for a specific organization.
 * Accessible only to authenticated users with the "admin" role.
 *
 * Request Params:
 * {
 *   orgId: string,              // Required. Organization ID (MongoDB ObjectId, 24-char hex)
 * }
 *
 * Request Body:
 * {
 *   // No request body
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Organization officer statistics retrieved successfully",
 *   data: {
 *     organization: {
 *       id: string,             // Organization ID (MongoDB ObjectId)
 *       name: string            // Organization name
 *     },
 *     statistics: {
 *       totalOfficers: number,  // Total number of officers
 *       activeOfficers: number, // Number of active officers
 *       inactiveOfficers: number,// Number of inactive officers
 *       positions: [
 *         {
 *           count: number,      // Number of officers in this position
 *           position: string    // Position title (e.g., "President")
 *         }
 *       ]
 *     }
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid organization ID format
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "ID must be a string"
 * - "ID must be a valid hexadecimal value"
 * - "ID must be a valid ObjectId"
 * - "ID is required"
 *
 * 401 Authentication Required – User is not authenticated
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role is not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Organization does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Organization not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
officerRouter.get("/stats/organization/:orgId", authenticate, authorize("admin"), officerController.getOrganizationOfficerStats);

/**
 * GET /api/v1/officers/:id
 *
 * Retrieve a single officer by ID.
 * Accessible only to authenticated users with the "admin" or "officer" role.
 *
 * Request Params:
 * {
 *   id: string,                 // Required. Officer ID (MongoDB ObjectId, 24-char hex)
 * }
 *
 * Request Body:
 * {
 *   // No request body
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Officer retrieved successfully",
 *   data: {
 *     _id: string,              // Officer record ID (MongoDB ObjectId)
 *     userId: {
 *       _id: string,            // User ID (MongoDB ObjectId)
 *       username: string,       // Officer username
 *       role: string,           // User role (e.g., "officer")
 *       email: string           // Officer email address
 *     },
 *     orgId: {
 *       _id: string,            // Organization ID (MongoDB ObjectId)
 *       orgName: string,        // Organization name
 *       description: string     // Organization description
 *     },
 *     position: string,         // Officer position/title
 *     startTerm: string,        // ISO 8601 date string (term start)
 *     endTerm: string,          // ISO 8601 date string (term end)
 *     createdAt: string,        // ISO 8601 date string (record creation)
 *     updatedAt: string         // ISO 8601 date string (last update)
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid officer ID format
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "ID must be a string"
 * - "ID must be a valid hexadecimal value"
 * - "ID must be a valid ObjectId"
 * - "ID is required"
 *
 * 401 Authentication Required – User is not authenticated
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role is not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Officer or organization does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Organization not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
officerRouter.get("/:id", authenticate, authorize("admin", "officer"), officerController.getOfficerById);

/**
 * PUT /api/v1/officers/:id
 *
 * Update an existing officer record.
 * Accessible only to authenticated users with the "admin" role.
 *
 * Request Params:
 * {
 *   id: string,                   // Required. Officer ID (MongoDB ObjectId, 24-char hex)
 * }
 *
 * Request Body:
 * {
 *   userId: string,               // Optional. User ID (MongoDB ObjectId, 24-char hex)
 *   orgId: string,                // Optional. Organization ID (MongoDB ObjectId, 24-char hex)
 *   position: string,             // Optional. Max 50 characters
 *   startTerm: string,            // Optional. Valid ISO 8601 date string
 *   endTerm: string               // Optional. Valid ISO 8601 date string (must be after startTerm)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Officer updated successfully",
 *   data: {
 *     _id: string,                // Officer record ID (MongoDB ObjectId)
 *     userId: {
 *       _id: string,              // User ID (MongoDB ObjectId)
 *       username: string,         // Officer username
 *       role: string,             // User role
 *       email: string,            // Officer email address
 *       phoneNumber: string,      // Officer phone number
 *       createdAt: string,        // ISO 8601 date string
 *       updatedAt: string         // ISO 8601 date string
 *     },
 *     orgId: {
 *       _id: string,              // Organization ID (MongoDB ObjectId)
 *       orgName: string,          // Organization name
 *       description: string,      // Organization description
 *       adviserId: string,        // Adviser ID (MongoDB ObjectId)
 *       createdAt: string,        // ISO 8601 date string
 *       updatedAt: string         // ISO 8601 date string
 *     },
 *     position: string,           // Officer position/title
 *     startTerm: string,          // ISO 8601 date string (term start)
 *     endTerm: string,            // ISO 8601 date string (term end)
 *     createdAt: string,          // ISO 8601 date string (record creation)
 *     updatedAt: string           // ISO 8601 date string (last update)
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation or business rule error
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "User ID must be a valid ObjectId"
 * - "User ID must be 24 characters long"
 * - "Organization ID must be a valid ObjectId"
 * - "Organization ID must be 24 characters long"
 * - "Position cannot exceed 50 characters"
 * - "Start term must be a valid date"
 * - "End term must be a valid date"
 * - "At least one field must be updated"
 * - "Cannot set start term after it has already begun"
 * - "Cannot shorten end term past the existing date"
 * - "End term must be after start term"
 *
 * 401 Authentication Required – User is not authenticated
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role is not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Related resource does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Organization not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
officerRouter.put("/:id", authenticate, authorize("admin", "adviser"), officerController.updateOfficer);

/**
 * DELETE /api/v1/officers/:id
 *
 * Delete an officer record by ID.
 * Accessible only to authenticated users with the "admin" role.
 *
 * Request Params:
 * {
 *   id: string,                 // Required. Officer ID (MongoDB ObjectId, 24-char hex)
 * }
 *
 * Request Body:
 * {
 *   // No request body
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Officer deleted successfully",
 *   data: {
 *     _id: string,              // Deleted officer record ID (MongoDB ObjectId)
 *     userId: {
 *       _id: string,            // User ID (MongoDB ObjectId)
 *       username: string,       // Officer username
 *       role: string,           // User role (e.g., "officer")
 *       email: string           // Officer email address
 *     },
 *     orgId: {
 *       _id: string,            // Organization ID (MongoDB ObjectId)
 *       orgName: string,        // Organization name
 *       description: string     // Organization description
 *     },
 *     position: string,         // Officer position/title
 *     startTerm: string,        // ISO 8601 date string (term start)
 *     endTerm: string,          // ISO 8601 date string (term end)
 *     createdAt: string,        // ISO 8601 date string (record creation)
 *     updatedAt: string         // ISO 8601 date string (last update)
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid officer ID format
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "ID must be a string"
 * - "ID must be a valid hexadecimal value"
 * - "ID must be a valid ObjectId"
 * - "ID is required"
 *
 * 401 Authentication Required – User is not authenticated
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role is not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Related resource does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Organization not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
officerRouter.delete("/:id", authenticate, authorize("admin", "adviser"), officerController.deleteOfficer);

export default officerRouter;
