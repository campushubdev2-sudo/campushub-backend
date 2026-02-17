// @ts-check
import { Router } from "express";

import schoolEventController from "../controllers/school-event.controller.js";
import { authenticate, authorize, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const eventRouter = Router();

eventRouter.use(createRateLimiter({ limit: 60, windowMs: 60_000 }));

/**
 * POST /api/v1/school-events
 *
 * Create a new school event.
 *
 * Request Body:
 * {
 *   title: string,          // Required. Must not be empty. Maximum 100 characters.
 *   description: string,    // Required. Maximum 2000 characters.
 *   date: string,           // Required. Must be a valid ISO date format (YYYY-MM-DD). Cannot be in the past.
 *   venue: string,          // Required. Must not be empty.
 *   organizedBy: string     // Required. Must be either "admin" or "department".
 * }
 *
 * Success Response (201):
 * {
 *   success: true,
 *   message: "School event created successfully",
 *   data: {
 *     _id: string,          // Unique identifier of the created event.
 *     title: string,        // Title of the event.
 *     description: string,  // Description of the event.
 *     date: string,         // Event date in ISO 8601 format.
 *     venue: string,        // Event location.
 *     organizedBy: string,  // Organizer role ("admin" or "department").
 *     createdAt: string,    // ISO timestamp when the event was created.
 *     updatedAt: string     // ISO timestamp when the event was last updated.
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation Error
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - The event title cannot be empty.
 * - Keep the title under 100 characters, please.
 * - A title is required for this event.
 * - Description is a bit too long (max 2000 chars).
 * - Please use a valid ISO date format (YYYY-MM-DD).
 * - We need a date for the event.
 * - Don’t forget to tell us where it's happening.
 * - Organizer must be either "admin" or "department".
 * - Please specify who is organizing this.
 * - Event date cannot be in the past.
 *
 * 401 Unauthorized – Authentication Required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Insufficient Permissions
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Rate Limit Exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventRouter.post("/", authenticate, authorize("admin", "adviser"), schoolEventController.createNewEvent);

/**
 * GET /api/v1/school-events
 *
 * Fetches a list of school events with optional filtering, sorting, and pagination.
 *
 * Query Parameters:
 * {
 *   page: number,           // Optional. Must be an integer >= 1. Defaults to 1.
 *   limit: number,          // Optional. Must be an integer >=1 and <=100. Defaults to 10.
 *   title: string,          // Optional. Filter events by title (partial match).
 *   venue: string,          // Optional. Filter events by venue.
 *   organizedBy: string,    // Optional. Either 'admin' or 'department'.
 *   date: string,           // Optional. Filter by exact date. Must be ISO format (YYYY-MM-DD).
 *   type: string,           // Optional. One of 'all', 'upcoming', or 'past'. Defaults to 'all'.
 *   sortBy: string,         // Optional. One of 'date', 'createdAt', or 'title'. Defaults to 'date'.
 *   order: string           // Optional. Either 'asc' or 'desc'. Defaults to 'asc'.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "School events fetched successfully",
 *   data: [
 *     {
 *       _id: string,           // Unique event ID
 *       title: string,         // Event title
 *       description: string,   // Event description
 *       date: string,          // Event date in ISO format
 *       venue: string,         // Event venue
 *       organizedBy: string,   // Who organized the event ('admin' or 'department')
 *       createdAt: string,     // Record creation timestamp in ISO format
 *       updatedAt: string      // Record last update timestamp in ISO format
 *     },
 *     ...
 *   ],
 *   meta: {
 *     total: number,          // Total number of events matching filters
 *     page: number,           // Current page number
 *     limit: number,          // Number of items per page
 *     totalPages: number      // Total number of pages
 *   }
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
 * - Page must be a number.
 * - Page must be an integer.
 * - Page must be at least 1.
 * - Limit must be a number.
 * - Limit must be an integer.
 * - Limit must be at least 1.
 * - Limit cannot exceed 100.
 * - Title must be a string.
 * - Venue must be a string.
 * - OrganizedBy must be either 'admin' or 'department'.
 * - OrganizedBy must be a string.
 * - Date must be a valid date.
 * - Date must be in ISO format (YYYY-MM-DD).
 * - Type must be one of 'all', 'upcoming', or 'past'.
 * - SortBy must be 'date', 'createdAt', or 'title'.
 * - Order must be either 'asc' or 'desc'.
 */
eventRouter.get("/", optionalAuthenticate, authorize("admin", "guest", "adviser", "officer"), schoolEventController.getAllEvents);

/**
 * GET /api/v1/school-events/filter/date-range
 *
 * Retrieve a list of school events filtered by a date range.
 *
 * Query Parameters:
 * {
 *   startDate: string,    // Required. Must be a valid ISO 8601 date (e.g., "2026-03-01").
 *   endDate: string       // Required. Must be a valid ISO 8601 date and cannot be earlier than startDate.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Events retrieved successfully",
 *   count: number,        // Total number of events returned
 *   data: [
 *     {
 *       _id: string,          // Unique identifier of the event
 *       title: string,        // Title of the event
 *       description: string,  // Detailed description of the event
 *       date: string,         // Event date in ISO 8601 format
 *       venue: string,        // Venue/location of the event
 *       organizedBy: string,  // Organizer role or username
 *       createdAt: string,    // ISO timestamp of event creation
 *       updatedAt: string     // ISO timestamp of last update
 *     }
 *   ]
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid or missing query parameters
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Start date must be a valid date"
 * - "Start date is required"
 * - "End date must be a valid date"
 * - "End date is required"
 * - "End date cannot be earlier than start date"
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User does not have permission
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Forbidden: role \"${userRole}\" is not allowed"
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventRouter.get("/filter/date-range", authenticate, authorize("admin", "adviser"), schoolEventController.filterEvents);

/**
 * GET /api/v1/school-events/stats
 *
 * Retrieve aggregated statistics of school events.
 *
 * Request Body:
 * None
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Event statistics retrieved successfully",
 *   data: {
 *     totalEvents: number,           // Total number of events in the system
 *     upcomingEvents: number,        // Number of events with dates in the future
 *     pastEvents: number,            // Number of events with dates in the past
 *     organizerBreakdown: {          // Count of events grouped by organizer role
 *       admin: number,               // Number of events organized by admin
 *       department: number           // Number of events organized by department
 *     },
 *     dateRange: {                   // Date range of all events
 *       firstEvent: string,          // ISO 8601 date of the first event
 *       lastEvent: string            // ISO 8601 date of the last event
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
 *
 * 403 Forbidden – User does not have permission
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Forbidden: role \"${userRole}\" is not allowed"
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventRouter.get("/stats", authenticate, authorize("admin", "officer", "adviser"), schoolEventController.getStats);

/**
 * GET /api/v1/school-events/stats/monthly
 *
 * Retrieve monthly statistics of school events for a given year.
 *
 * Request Body:
 * None
 *
 * Query Parameters:
 * {
 *   year: number,      // Required. Must be a whole number between 2000 and 2100.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Monthly event statistics retrieved successfully",
 *   data: {
 *     year: number,      // The requested year
 *     monthlyStats: [    // Array of statistics for each month
 *       {
 *         month: number,         // Month number (1-12)
 *         monthName: string,     // Full name of the month
 *         count: number,         // Number of events in this month
 *         events: [              // List of events in this month
 *           {
 *             title: string,        // Event title
 *             date: string,         // Event date in ISO 8601 format
 *             organizedBy: string   // Organizer role or username
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid or missing query parameters
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Year must be a number."
 * - "Year must be a whole number."
 * - "Year cannot be earlier than 2000."
 * - "Year cannot be later than 2100."
 * - "Year is a required field."
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User does not have permission
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Forbidden: role \"${userRole}\" is not allowed"
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventRouter.get("/stats/monthly", authenticate, authorize("admin", "adviser"), schoolEventController.getMonthlyStats);

/**
 * GET /api/v1/school-events/stats/venues
 *
 * Retrieve statistics of school events grouped by venue.
 *
 * Request Body:
 * NONE
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Venue statistics retrieved successfully",
 *   count: number,            // Total number of unique venues
 *   data: [
 *     {
 *       eventCount: number,   // Total number of events held at this venue
 *       upcomingCount: number,// Number of upcoming events at this venue
 *       venue: string         // Name of the venue
 *     },
 *     ...
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
 *
 * 403 Forbidden – Role is not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Forbidden: role \"${userRole}\" is not allowed"
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Too many requests. Please try again later."
 */
eventRouter.get("/stats/venues", authenticate, authorize("admin", "adviser"), schoolEventController.getVenueStats);

/**
 * GET /api/v1/school-events/recent
 *
 * Retrieve the most recent school events.
 *
 * Query Parameters:
 * {
 *   limit: number,      // Required. Must be an integer >= 1 and <= maximum allowed. Number of events to retrieve.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Recent events retrieved successfully",
 *   count: number,      // Total number of events returned
 *   data: [
 *     {
 *       _id: string,          // Event unique identifier
 *       title: string,        // Event title
 *       date: string,         // ISO 8601 formatted date of the event
 *       venue: string,        // Venue of the event
 *       organizedBy: string   // User role or admin who organized the event
 *     }
 *   ]
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid query parameter
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "limit must be a number"
 * - "limit must be an integer"
 * - "limit must be at least {#limit}"
 * - "limit must be less than or equal to {#limit}"
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
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Rate limiting
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventRouter.get("/recent", authenticate, authorize("admin"), schoolEventController.getRecentEvents);

/**
 * GET /api/v1/school-events/:id
 *
 * Retrieve a single school event by its unique ID.
 *
 * Path Parameters:
 * {
 *   id: string,       // Required. Must be a 24-character hexadecimal string representing the event ID.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "School event retrieved successfully",
 *   data: {
 *     _id: string,          // Event unique identifier
 *     title: string,        // Event title
 *     description: string,  // Detailed description of the event
 *     date: string,         // ISO 8601 formatted date of the event
 *     venue: string,        // Venue of the event
 *     organizedBy: string,  // User role or admin who organized the event
 *     createdAt: string,    // ISO 8601 date when the event was created
 *     updatedAt: string     // ISO 8601 date when the event was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid Event ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Event ID must be a string"
 * - "Event ID must be a valid hexadecimal value"
 * - "Event ID must be exactly 24 characters long"
 * - "Event ID is required"
 * - "Event ID cannot be empty"
 *
 * 404 Not Found – Event does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "School event not found"
 * }
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
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Rate limiting
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventRouter.get("/:id", authenticate, authorize("admin", "adviser", "officer"), schoolEventController.getSchoolEventById);

/**
 * PUT /api/v1/school-events/:id
 *
 * Update a school event by its unique ID.
 *
 * Path Parameters:
 * {
 *   id: string,       // Required. Must be a 24-character hexadecimal string representing the event ID.
 * }
 *
 * Request Body:
 * {
 *   title: string,          // Optional. Max 100 characters. New title of the event.
 *   description: string,    // Optional. Max 2000 characters. Detailed description of the event.
 *   date: string,           // Optional. ISO 8601 date. Event date cannot be in the past.
 *   venue: string,          // Optional. Max 150 characters. Event venue.
 *   organizedBy: string     // Optional. Must be either "admin" or "department". Organizer of the event.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "School event updated successfully",
 *   data: {
 *     _id: string,          // Event unique identifier
 *     title: string,        // Event title
 *     description: string,  // Detailed description of the event
 *     date: string,         // ISO 8601 formatted date of the event
 *     venue: string,        // Venue of the event
 *     organizedBy: string,  // User role or admin who organized the event
 *     createdAt: string,    // ISO 8601 date when the event was created
 *     updatedAt: string     // ISO 8601 date when the event was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation or update error
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "The following fields cannot be updated: ${invalidFields.join(", ")}"
 * - "Title cannot exceed 100 characters"
 * - "Description cannot exceed 2000 characters"
 * - "Event date must be a valid date"
 * - "Venue cannot exceed 150 characters"
 * - "Organizer must be either 'admin' or 'department'"
 * - "At least one field must be provided for update"
 * - "Cannot update event to a past date"
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 404 Not Found – Event does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "School event not found"
 * }
 *
 * 403 Forbidden – User role not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Rate limiting
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventRouter.put("/:id", authenticate, authorize("admin", "adviser"), schoolEventController.updateEvent);

/**
 * DELETE /api/v1/school-events/:id
 *
 * Delete a school event by its unique ID.
 *
 * Path Parameters:
 * {
 *   id: string,       // Required. Must be a 24-character hexadecimal string representing the event ID.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "School event deleted successfully",
 *   data: {
 *     _id: string,          // Event unique identifier
 *     title: string,        // Event title
 *     description: string,  // Detailed description of the event
 *     date: string,         // ISO 8601 formatted date of the event
 *     venue: string,        // Venue of the event
 *     organizedBy: string,  // User role or admin who organized the event
 *     createdAt: string,    // ISO 8601 date when the event was created
 *     updatedAt: string     // ISO 8601 date when the event was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid Event ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Event ID must be a string"
 * - "Event ID must be a valid hexadecimal value"
 * - "Event ID must be exactly 24 characters long"
 * - "Event ID is required"
 * - "Event ID cannot be empty"
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 404 Not Found – Event does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "School event not found"
 * }
 *
 * 403 Forbidden – User role not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Rate limiting
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventRouter.delete("/:id", authenticate, authorize("admin", "adviser"), schoolEventController.deleteSchoolEvent);

export default eventRouter;
