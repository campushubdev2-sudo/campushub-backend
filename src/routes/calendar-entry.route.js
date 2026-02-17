import { Router } from "express";

import { authorize, authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";
import calendarEntryController from "../controllers/calendar-entry.controller.js";

const calendarEntryRouter = Router();

calendarEntryRouter.use(createRateLimiter({ limit: 60, windowMs: 60_000 }));

/**
 * POST /api/v1/calendar-entries/
 *
 * Create a new calendar entry for a specific event.
 * This endpoint associates an existing event with the calendar and records
 * the user who created the entry.
 *
 * Access Control:
 * - Authentication required
 * - Authorized roles: admin, adviser
 *
 * Request Body:
 * {
 *   eventId: string,     // Required. Must be a valid 24-character hexadecimal MongoDB ObjectId.
 *   createdBy: string   // Required. Must be a valid 24-character hexadecimal MongoDB ObjectId of an existing user.
 * }
 *
 * Success Response (201):
 * {
 *   success: true,
 *   message: "Calendar entry created successfully",
 *   data: {
 *     calendarEntry: {
 *       _id: string,        // Calendar entry unique identifier
 *       eventId: string,    // Referenced event ID
 *       createdBy: string,  // User ID who created the entry
 *       dateAdded: string, // ISO date when the entry was added to the calendar
 *       createdAt: string, // ISO timestamp of creation
 *       updatedAt: string  // ISO timestamp of last update
 *     },
 *     event: {
 *       _id: string,        // Event unique identifier
 *       title: string,     // Event title
 *       description: string, // Event description
 *       date: string,      // Event date (ISO format)
 *       venue: string,     // Event venue
 *       organizedBy: string, // Organizing body
 *       createdAt: string, // ISO timestamp of creation
 *       updatedAt: string  // ISO timestamp of last update
 *     }
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid or missing request fields
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Event ID must be a valid hexadecimal string
 * - Event ID must be exactly 24 characters
 * - Event ID is required
 * - User ID must be a valid hexadecimal string
 * - User ID must be exactly 24 characters
 * - User ID is required
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
 *   status: "error",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Resource does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - User not found
 * - Event not found
 *
 * 409 Conflict – Duplicate calendar entry
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Calendar entry already exists for this event"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
calendarEntryRouter.post("/", authenticate, authorize("admin", "adviser"), calendarEntryController.createCalendarEntry);

/**
 * GET /api/v1/calendar-entries
 *
 * Retrieve a paginated list of calendar entries.
 * Supports filtering by event and creator, sorting, and ordering.
 * Returned entries include populated event and user details when available.
 *
 * Access Control:
 * - Authentication optional
 * - Authorized roles: admin, student, officer, guest
 *
 * Request Query Parameters:
 * {
 *   page: number,        // Optional. Page number for pagination. Must be an integer ≥ 1. Default: 1
 *   limit: number,       // Optional. Number of records per page. Integer between 1 and 100. Default: 10
 *   sortBy: string,      // Optional. Sort field. Allowed values: "createdAt", "dateAdded". Default: "createdAt"
 *   order: string,       // Optional. Sort order. Allowed values: "asc", "desc". Default: "desc"
 *   eventId: string,     // Optional. 24-character hexadecimal Event ID to filter results
 *   createdBy: string    // Optional. 24-character hexadecimal User ID to filter results
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Calendar entries retrieved successfully",
 *   data: [
 *     {
 *       _id: string,          // Calendar entry unique identifier
 *       eventId: {
 *         _id: string,        // Event ID
 *         title: string,     // Event title
 *         description: string, // Event description
 *         date: string,      // Event date (ISO format)
 *         venue: string,     // Event venue
 *         organizedBy: string, // Organizing body
 *         createdAt: string, // ISO timestamp of creation
 *         updatedAt: string  // ISO timestamp of last update
 *       },
 *       createdBy: {
 *         _id: string,        // User ID
 *         username: string,  // Username
 *         role: string,      // User role
 *         email: string      // User email
 *       } | null,             // Null if user reference no longer exists
 *       dateAdded: string,    // ISO date when added to calendar
 *       createdAt: string,    // ISO timestamp of creation
 *       updatedAt: string     // ISO timestamp of last update
 *     }
 *   ],
 *   meta: {
 *     page: number,           // Current page
 *     limit: number,          // Records per page
 *     total: number,          // Total number of records
 *     totalPages: number      // Total number of pages
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
 * - Page must be a number
 * - Page must be a whole number
 * - Page must be at least 1
 * - Limit must be a number
 * - Limit must be a whole number
 * - Limit must be at least 1
 * - Limit cannot exceed 100
 * - Sort field must be a string
 * - Sort field must be either 'createdAt' or 'dateAdded'
 * - Order must be a string
 * - Order must be either 'asc' or 'desc'
 * - Event ID must be a string
 * - Event ID must be a valid hexadecimal string
 * - Event ID must be exactly 24 characters
 * - User ID must be a string
 * - User ID must be a valid hexadecimal string
 * - User ID must be exactly 24 characters
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
 *   status: "error",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
calendarEntryRouter.get("/", optionalAuthenticate, authorize("admin", "student", "officer", "guest", "adviser "), calendarEntryController.getAll);

/**
 * GET /api/v1/calendar-entries/stats
 *
 * Retrieve aggregated calendar entry statistics.
 *
 * Request Body:
 * {
 *   // No request body or path/query parameters
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Calendar statistics retrieved successfully",
 *   result: {
 *     total: number,            // Total number of calendar entries
 *     byUser: [
 *       {
 *         total: number,        // Total calendar entries created by the user
 *         userId: string,       // User identifier (MongoDB ObjectId)
 *         username: string      // Username of the creator
 *       }
 *     ],
 *     byEvent: [
 *       {
 *         total: number,        // Total calendar entries associated with the event
 *         eventId: string,      // Event identifier (MongoDB ObjectId)
 *         title: string         // Event title
 *       }
 *     ],
 *     overTime: [
 *       {
 *         _id: {
 *           year: number,       // Year of aggregation
 *           month: number       // Month of aggregation (1–12)
 *         },
 *         total: number         // Total calendar entries for the given period
 *       }
 *     ]
 *   }
 * }
 *
 * Error Responses:
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "error",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role not permitted
 * {
 *   success: false,
 *   status: "error",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
calendarEntryRouter.get("/stats", authenticate, authorize("admin"), calendarEntryController.getCalendarStats);

/**
 * GET /api/v1/calendar-entries/:id
 *
 * Retrieve a single calendar entry by its unique identifier.
 *
 * Path Parameters:
 * {
 *   id: string,                // Required. MongoDB ObjectId (24-character hexadecimal string)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Calendar entry retrieved successfully",
 *   data: {
 *     _id: string,             // Calendar entry unique identifier (MongoDB ObjectId)
 *     eventId: string,         // Associated event identifier (MongoDB ObjectId)
 *     createdBy: string,       // User ID of the creator (MongoDB ObjectId)
 *     dateAdded: string,       // ISO 8601 timestamp when the entry was added
 *     createdAt: string,       // ISO 8601 timestamp when the entry was created
 *     updatedAt: string,       // ISO 8601 timestamp when the entry was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid or missing calendar entry ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - id is required
 * - id must be a 24-character hex string
 * - id must be a valid hexadecimal string
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "error",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role not permitted
 * {
 *   success: false,
 *   status: "error",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Calendar entry does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Calendar entry not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
calendarEntryRouter.get("/:id", optionalAuthenticate, authorize("admin", "student", "guest", "officer"), calendarEntryController.getCalendarEntryById);

/**
 * PUT /api/v1/calendar-entries/:id
 *
 * Update an existing calendar entry by its unique identifier.
 *
 * Request Body:
 * {
 *   eventId: string,           // Required. MongoDB ObjectId (24-character hexadecimal string)
 *   createdBy: string          // Required. MongoDB ObjectId (24-character hexadecimal string)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Calendar entry retrieved successfully",
 *   data: {
 *     _id: string,             // Calendar entry unique identifier (MongoDB ObjectId)
 *     eventId: string,         // Associated event identifier (MongoDB ObjectId)
 *     createdBy: string,       // User ID of the creator (MongoDB ObjectId)
 *     dateAdded: string,       // ISO 8601 timestamp when the entry was added
 *     createdAt: string,       // ISO 8601 timestamp when the entry was created
 *     updatedAt: string        // ISO 8601 timestamp when the entry was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid or missing request fields
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Event ID must be a valid MongoDB ObjectId
 * - Event ID must be 24 characters
 * - Event ID is required
 * - Creator ID must be a valid MongoDB ObjectId
 * - Creator ID must be 24 characters
 * - Creator ID is required
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "error",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role not permitted
 * {
 *   success: false,
 *   status: "error",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Related resource not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Calendar entry not found
 * - User not found
 * - School event not found
 *
 * 409 Conflict – Duplicate calendar entry
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Event already exists in another calendar entry"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
calendarEntryRouter.put("/:id", authenticate, authorize("admin"), calendarEntryController.updateCalendarEntry);

/**
 * DELETE /api/v1/calendar-entries/:id
 *
 * Delete an existing calendar entry by its unique identifier.
 *
 * Request Body:
 * {
 *   // No request body
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Calendar entry deleted successfully",
 *   data: {
 *     _id: string,             // Deleted calendar entry unique identifier (MongoDB ObjectId)
 *     eventId: string,         // Associated event identifier (MongoDB ObjectId)
 *     createdBy: string,       // User ID of the creator (MongoDB ObjectId)
 *     dateAdded: string,       // ISO 8601 timestamp when the entry was added
 *     createdAt: string,       // ISO 8601 timestamp when the entry was created
 *     updatedAt: string        // ISO 8601 timestamp when the entry was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid or missing calendar entry ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - id is required
 * - id must be a 24-character hex string
 * - id must be a valid hexadecimal string
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "error",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User role not permitted
 * {
 *   success: false,
 *   status: "error",
 *   message: "Forbidden: role \"<userRole>\" is not allowed"
 * }
 *
 * 404 Not Found – Calendar entry does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Calendar entry not found"
 * }
 *
 * 409 Conflict – Deletion conflict
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Event already exists in another calendar entry"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
calendarEntryRouter.delete("/:id", authenticate, authorize("admin"), calendarEntryController.deleteCalendarEntry);

export default calendarEntryRouter;
