import { Router } from "express";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import eventNotificationController from "../controllers/event-notification.controller.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const eventNotificationRouter = Router();

eventNotificationRouter.use(createRateLimiter({ limit: 60, windowMs: 60_000 }));

/**
 * GET /api/v1/event-notifications/stats/overall
 *
 * Retrieve overall statistics for event notifications.
 *
 * Request Body:
 * {
 *   // No request body or parameters
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Overall event notification stats retrieved successfully",
 *   data: {
 *     total: number,               // Total number of event notifications
 *     read: number,                // Total number of read notifications
 *     sent: number,                // Total number of sent notifications
 *     today: number,               // Total notifications created today
 *     readRate: number,            // Percentage of read notifications (0–100)
 *     hourlyDistribution: array    // Per-hour notification distribution data
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
eventNotificationRouter.get("/stats/overall", authenticate, authorize("admin"), eventNotificationController.getOverallStats);

/**
 * GET /api/v1/event-notifications/stats/event/:id
 *
 * Retrieve notification statistics for a specific event.
 * Accessible only to authenticated users with the "admin" role.
 *
 * Path Parameters:
 * {
 *   id: string,                // Required. MongoDB ObjectId (24-character hex string) of the event
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Event notification stats retrieved successfully",
 *   data: {
 *     eventId: string,         // Event MongoDB ObjectId
 *     total: number,           // Total number of notifications for the event
 *     read: number,            // Number of notifications marked as read
 *     sent: number,            // Number of notifications sent
 *     readRate: number         // Read rate percentage (0–100)
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid event ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Event ID must be a valid MongoDB ObjectId
 * - Event ID must be 24 characters long
 * - Event ID is required
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
 * 404 Not Found – Event does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Event not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventNotificationRouter.get("/stats/event/:id", authenticate, authorize("admin"), eventNotificationController.getEventStats);

/**
 * POST /api/v1/event-notifications
 *
 * Create a new event notification for a specific recipient.
 * Accessible only to authenticated users with the "admin" role.
 *
 * Request Body:
 * {
 *   eventId: string,           // Required. MongoDB ObjectId (24-character hex string)
 *   recipientId: string,       // Required. MongoDB ObjectId (24-character hex string)
 *   message: string,           // Required. Max 2000 characters
 *   status: string             // Optional. Either "sent" or "failed". Defaults to "sent"
 * }
 *
 * Success Response (201):
 * {
 *   success: true,
 *   message: "Event notification created successfully",
 *   data: {
 *     id: string,              // Notification MongoDB ObjectId
 *     eventId: string,         // Event MongoDB ObjectId
 *     recipientId: string,     // Recipient MongoDB ObjectId
 *     message: string,         // Notification message content
 *     status: string,          // Current notification status
 *     sentAt: string,          // ISO 8601 timestamp when notification was sent
 *     createdAt: string,       // ISO 8601 timestamp when record was created
 *     updatedAt: string        // ISO 8601 timestamp when record was last updated
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid request body
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Event ID must be a valid MongoDB ObjectId
 * - Event ID must be 24 characters
 * - Event ID is required
 * - Recipient ID must be a valid MongoDB ObjectId
 * - Recipient ID must be 24 characters
 * - Recipient ID is required
 * - Message cannot exceed 2000 characters
 * - Message is required
 * - Status must be either 'sent' or 'failed'
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
eventNotificationRouter.post("/", authenticate, authorize("admin"), eventNotificationController.createNotification);

/**
 * POST /api/v1/event-notifications/bulk
 *
 * Create multiple event notifications in a single request for multiple recipients.
 * Duplicate notifications for the same event and recipient are automatically skipped.
 * Accessible only to authenticated users with the "admin" role.
 *
 * Request Body:
 * {
 *   eventId: string,            // Required. MongoDB ObjectId (24-character hex string)
 *   recipientIds: string[],     // Required. Array of MongoDB ObjectIds (min: 1). Duplicates are auto-removed
 *   message: string,            // Required. Notification message (max 2000 characters)
 *   status: string              // Optional. Either "sent" or "read". Defaults to "sent"
 * }
 *
 * Success Response (201):
 * {
 *   success: true,
 *   message: string,            // Summary message including counts of sent and skipped notifications
 *   data: {
 *     totalRecipients: number,  // Total unique recipient IDs provided
 *     skippedDuplicates: number,// Number of recipients skipped due to existing notifications
 *     notificationsCreated: number, // Number of notifications successfully created
 *     notifications: [
 *       {
 *         id: string,            // Notification MongoDB ObjectId
 *         eventId: string,       // Event MongoDB ObjectId
 *         recipientId: string,   // Recipient MongoDB ObjectId
 *         message: string,       // Notification message content
 *         status: string,        // Notification status ("sent" or "read")
 *         sentAt: string,        // ISO 8601 timestamp when notification was sent
 *         createdAt: string,     // ISO 8601 timestamp when record was created
 *         updatedAt: string      // ISO 8601 timestamp when record was last updated
 *       }
 *     ]
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Validation Error – Invalid request payload
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Event ID must be a valid MongoDB ObjectId
 * - Event ID must be 24 characters
 * - Event ID is required
 * - Recipient IDs must be an array
 * - At least one recipient ID is required
 * - Recipient IDs are required
 * - Each recipient ID must be a valid MongoDB ObjectId
 * - Each recipient ID must be 24 characters
 * - Message cannot exceed 2000 characters
 * - Message is required
 * - Status must be either 'sent' or 'read'
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
 * 404 Not Found – Missing resources
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Event not found
 * - Some recipients not found: <recipientId1>, <recipientId2>, ...
 *
 * 409 Conflict – Duplicate notifications
 * {
 *   success: false,
 *   status: "fail",
 *   message: "All recipients already have notifications for this event"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventNotificationRouter.post("/bulk", authenticate, authorize("admin"), eventNotificationController.createBulkNotifications);

/**
 * GET /api/v1/event-notifications
 *
 * Retrieve a list of event notifications with optional filtering, sorting, field selection,
 * and pagination. Accessible to authenticated users with roles: admin, officer, or adviser.
 *
 * Request Query Parameters (Optional):
 * {
 *   eventId: string,        // Optional. MongoDB ObjectId (24-character hex string)
 *   recipientId: string,    // Optional. MongoDB ObjectId (24-character hex string)
 *   status: string,         // Optional. Either "sent" or "read"
 *   sortBy: string,         // Optional. One of: "sentAt", "createdAt", "updatedAt", "status". Default: "sentAt"
 *   order: string,          // Optional. Either "asc" or "desc". Default: "desc"
 *   fields: string,         // Optional. Comma-separated fields to include in response
 *   limit: number,          // Optional. Integer (1–100). Default: 10
 *   page: number            // Optional. Integer (>=1). Default: 1
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Event notifications retrieved successfully",
 *   data: [
 *     {
 *       _id: string,        // Notification MongoDB ObjectId
 *       eventId: {
 *         _id: string,      // Event MongoDB ObjectId
 *         title: string,    // Event title
 *         date: string,     // Event date (ISO 8601)
 *         venue: string     // Event venue
 *       },
 *       recipientId: {
 *         _id: string,      // User MongoDB ObjectId
 *         username: string, // Username of the recipient
 *         role: string,     // User role
 *         email: string     // User email address
 *       },
 *       message: string,    // Notification message content
 *       sentAt: string,     // ISO 8601 timestamp when notification was sent
 *       status: string,     // Notification status ("sent" or "read")
 *       createdAt: string,  // ISO 8601 timestamp when record was created
 *       updatedAt: string   // ISO 8601 timestamp when record was last updated
 *     }
 *   ],
 *   meta: {
 *     pagination: {
 *       total: number,      // Total number of records
 *       page: number,       // Current page
 *       limit: number,      // Records per page
 *       pages: number       // Total number of pages
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
 * - Event ID must be a valid hex string
 * - Event ID must be 24 characters long
 * - Recipient ID must be a valid hex string
 * - Recipient ID must be 24 characters long
 * - Status must be either "sent" or "read"
 * - sortBy must be one of: sentAt, createdAt, updatedAt, status
 * - order must be either "asc" or "desc"
 * - Fields must be a string
 * - Limit must be a number
 * - Limit must be an integer
 * - Limit must be at least 1
 * - Limit cannot exceed 100
 * - Page must be a number
 * - Page must be an integer
 * - Page must be at least 1
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
eventNotificationRouter.get("/", authenticate, authorize("admin", "officer", "adviser"), eventNotificationController.getAllEventNotifications);

/**
 * GET /api/v1/event-notifications/:id
 *
 * Retrieve a single event notification by its ID.
 *
 * Request Params:
 * {
 *   id: string,                // Required. Notification ID (MongoDB ObjectId, 24-character hex string)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Event notification retrieved successfully",
 *   data: {
 *     _id: string,             // Notification ID
 *     eventId: {
 *       _id: string,           // Event ID
 *       title: string,         // Event title
 *       date: string,          // ISO 8601 date string
 *       venue: string          // Event venue
 *     },
 *     recipientId: {
 *       _id: string,           // User ID
 *       username: string,      // Recipient username
 *       role: string,          // User role (e.g., admin)
 *       email: string          // Recipient email address
 *     },
 *     message: string,         // Notification message content
 *     sentAt: string,          // ISO 8601 timestamp when notification was sent
 *     status: string,          // Notification status (e.g., "sent")
 *     createdAt: string,       // ISO 8601 timestamp
 *     updatedAt: string        // ISO 8601 timestamp
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid notification ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Notification ID must be a valid hex string
 * - Notification ID must be 24 characters long
 * - Notification ID is required
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
 * 404 Not Found – Event notification not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Event notification not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventNotificationRouter.get("/:id", authenticate, authorize("admin", "officer", "adviser"), eventNotificationController.getEventNotificationById);

/**
 * PUT /api/v1/event-notifications/:id
 *
 * Update an existing event notification by its ID.
 *
 * Request Params:
 * {
 *   id: string,                // Required. Notification ID (MongoDB ObjectId, valid format)
 * }
 *
 * Request Body:
 * {
 *   message: string,           // Optional. Updated notification message (max 2000 characters)
 *   status: string             // Optional. Notification status ("sent" or "read")
 * }
 * Note:
 * - At least one field (message or status) is required for update.
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Event notification updated successfully",
 *   data: {
 *     _id: string,             // Notification ID
 *     eventId: {
 *       _id: string,           // Event ID
 *       title: string,         // Event title
 *       date: string,          // ISO 8601 date string
 *       venue: string          // Event venue
 *     },
 *     recipientId: {
 *       _id: string,           // User ID
 *       username: string,      // Recipient username
 *       role: string,          // User role
 *       email: string          // Recipient email address
 *     },
 *     message: string,         // Updated notification message
 *     sentAt: string,          // ISO 8601 timestamp when notification was sent
 *     status: string,          // Notification status ("sent" or "read")
 *     createdAt: string,       // ISO 8601 timestamp
 *     updatedAt: string        // ISO 8601 timestamp of last update
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
 * - Invalid notification ID format
 * - Notification ID is required
 * - Message cannot exceed 2000 characters
 * - Status must be either 'sent' or 'read'
 * - At least one field (message or status) is required for update
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
 * 404 Not Found – Event notification not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Event notification not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventNotificationRouter.put("/:id", authenticate, authorize("admin", "adviser"), eventNotificationController.updateEventNotification);

/**
 * DELETE /api/v1/event-notifications/:id
 *
 * Delete an existing event notification by its ID.
 *
 * Request Params:
 * {
 *   id: string,                // Required. Notification ID (valid MongoDB ObjectId format)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Event notification deleted successfully",
 *   data: {
 *     _id: string,             // Deleted notification ID
 *     eventId: string,         // Related event ID
 *     recipientId: string,     // Recipient user ID
 *     message: string,         // Notification message content
 *     status: string,          // Notification status (e.g., "sent")
 *     sentAt: string           // ISO 8601 timestamp when notification was sent
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid notification ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Invalid notification ID format
 * - Notification ID is required
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
 * 404 Not Found – Event notification not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Event notification not found"
 * }
 *
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "error",
 *   message: "Too many requests. Please try again later."
 * }
 */
eventNotificationRouter.delete("/:id", authenticate, authorize("admin", "adviser"), eventNotificationController.deleteEventNotification);

export default eventNotificationRouter;
