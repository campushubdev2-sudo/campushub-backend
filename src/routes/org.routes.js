// @ts-check

import { Router } from "express";
import organizationController from "../controllers/organization.controller.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const orgRouter = Router();

orgRouter.use(createRateLimiter({ limit: 60, windowMs: 60_000 }));

/**
 * POST /api/v1/orgs
 *
 * Create a new organization.
 *
 * Request Body:
 * {
 *   orgName: string,        // Required. Must be a non-empty string, max 100 characters.
 *   description: string,    // Optional. Max 2000 characters. Default: "This organization has no description yet."
 *   adviserId: string       // Required. Must be a valid 24-character hexadecimal string corresponding to an existing adviser.
 * }
 *
 * Success Response (201):
 * {
 *   success: true,
 *   message: "Organization created successfully",
 *   data: {
 *     _id: string,           // Unique identifier of the organization (24-char hex string)
 *     orgName: string,       // Name of the organization
 *     description: string,   // Description of the organization
 *     adviser: string,       // Adviser ID associated with the organization
 *     createdAt: string,     // ISO timestamp of creation
 *     updatedAt: string      // ISO timestamp of last update
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
 * - "Organization name must be a string"
 * - "Organization name cannot be empty"
 * - "Organization name cannot exceed 100 characters"
 * - "Organization name is required"
 * - "Description must be a string"
 * - "Description cannot exceed 2000 characters"
 * - "Adviser ID must be a string"
 * - "Adviser ID must be a valid hexadecimal value"
 * - "Adviser ID must be exactly 24 characters long"
 * - "Adviser ID is required"
 * - "Adviser ID cannot be empty"
 *
 * 404 Not Found – Adviser not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "The assigned adviser does not exist"
 * }
 *
 * 409 Conflict – Duplicate organization
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Organization name already exists"
 * }
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
 * 429 Too Many Requests – Rate limiting
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
orgRouter.post("/", authenticate, authorize("admin", "adviser"), organizationController.createOrganization);

/**
 * GET /api/v1/orgs
 *
 * Retrieve a paginated list of organizations with optional filters and field selection.
 *
 * Request Body:
 * NONE
 *
 * Query Parameters:
 * {
 *   page: int,            // Optional. Page number for pagination. Must be >= 1
 *   limit: int,           // Optional. Number of items per page. Min 1, Max 100
 *   sort: string,         // Optional. Field name to sort results by
 *   fields: string,       // Optional. Comma-separated list of fields to include in response
 *   orgName: string,      // Optional. Filter by organization name. Must be text
 *   adviserId: string     // Optional. Filter by adviser ID. Must be a 24-character hexadecimal string
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Organizations retrieved successfully",
 *   data: [
 *     {
 *       _id: string,           // Organization ID (hexadecimal)
 *       orgName: string,       // Name of the organization
 *       description: string,   // Description of the organization
 *       adviser: string,       // Adviser username or ID
 *       createdAt: string,     // ISO date string of creation timestamp
 *       updatedAt: string      // ISO date string of last update
 *     },
 *     ...
 *   ],
 *   meta: {
 *     total: int,             // Total number of organizations matching query
 *     page: int,              // Current page number
 *     limit: int,             // Number of items per page
 *     pages: int              // Total number of pages
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
 * - "Page must be a number"
 * - "Page must be at least 1"
 * - "Limit cannot be less than 1"
 * - "Limit cannot exceed 100"
 * - "Organization name must be text"
 * - "Adviser ID must be a valid hexadecimal string"
 * - "Adviser ID must be exactly 24 characters long"
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Role not allowed
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
orgRouter.get("/", authenticate, authorize("admin", "officer", "adviser"), organizationController.getOrganizations);

/**
 * GET /api/v1/orgs/stats
 *
 * Retrieve aggregated statistics about organizations.
 * Accessible only to authenticated users with admin role.
 *
 * Request Body:
 * NONE
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Statistics retrieved successfully",
 *   data: {
 *     summary: {
 *       totalOrganizations: number,        // Total number of organizations in the system
 *       avgDescriptionLength: number       // Average length of organization descriptions (floating-point value)
 *     },
 *     byAdviser: [
 *       {
 *         managedOrgs: number,             // Total number of organizations managed by the adviser
 *         adviserName: string              // Username or identifier of the adviser
 *       }
 *     ]
 *   }
 * }
 *
 * Error Responses:
 *
 * 401 Unauthorized – Authentication required or invalid token
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Unauthorized
 * - Invalid token
 * - Token expired
 *
 * 403 Forbidden – Insufficient permissions
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - Access denied
 * - Admin role required
 *
 * 500 Internal Server Error – Failed to retrieve statistics
 * {
 *   success: false,
 *   status: "error",
 *   message: string
 * }
 * Possible messages include:
 * - Failed to retrieve organization statistics
 * - Internal server error
 * - Database query failed
 */
orgRouter.get("/stats", authenticate, authorize("admin"), organizationController.getStats);

/**
 * GET /api/v1/orgs/:id
 *
 * Retrieve a specific organization by its ID
 *
 * Path Parameters:
 * {
 *   id: string              // Required. Must be a valid 24-character hexadecimal MongoDB ObjectId
 * }
 *
 * Request Headers:
 * {
 *   Authorization: string   // Required. Bearer token for authentication
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Organization retrieved successfully",
 *   data: {
 *     _id: string,          // Unique organization identifier (MongoDB ObjectId)
 *     orgName: string,      // Name of the organization
 *     description: string,  // Detailed description of the organization's purpose and activities
 *     adviser: string,      // Adviser identifier or username
 *     createdAt: string,    // ISO 8601 timestamp of organization creation
 *     updatedAt: string     // ISO 8601 timestamp of last update
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
 * - Organization ID must be a string
 * - Organization ID must be a valid hexadecimal value
 * - Organization ID must be exactly 24 characters long
 * - Organization ID is required
 * - Organization ID cannot be empty
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
 *   message: string
 * }
 * Possible messages include:
 * - Forbidden: role "user" is not allowed
 * - Forbidden: role "guest" is not allowed
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
 *   message: "Too many requests. Please try again later"
 * }
 */
orgRouter.get("/:id", authenticate, authorize("admin", "officer", "adviser"), organizationController.getOrganization);

/**
 * PUT /api/v1/orgs/:id
 *
 * Update organization details by providing the organization's name, description, and adviser ID.
 *
 * Request Body:
 * {
 *   orgName: string,       // Required. Organization name (Max: 100 characters)
 *   description: string,   // Required. Organization description (Max: 2000 characters)
 *   adviserId: string     // Required. Adviser ID (Must be a 24-character hexadecimal string)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Organization updated successfully",
 *   data: {
 *     _id: string,          // Organization ID
 *     orgName: string,      // Organization name
 *     description: string,  // Organization description
 *     adviserId: string,   // Adviser ID
 *     createdAt: string,   // Organization creation timestamp
 *     updatedAt: string    // Organization update timestamp
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation errors in the request body
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Organization name must be a string"
 * - "Organization name cannot be more than 100 characters"
 * - "Organization name cannot be empty"
 * - "Description must be a string"
 * - "Description cannot be more than 2000 characters"
 * - "Invalid Adviser ID format. It should be a 24-character hexadecimal string"
 * - "At least one field must be provided for update"
 *
 * 404 Not Found – Organization not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Organization not found"
 * }
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User does not have the required role
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Too many requests. Please try again later
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later"
 * }
 */
orgRouter.put("/:id", authenticate, authorize("admin"), organizationController.updateOrganization);

/**
 * DELETE /api/v1/orgs/:id
 *
 * Delete an organization by its ID.
 *
 * Request Body:
 * {
 *   // No request body is required for this endpoint
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Organization deleted successfully",
 *   data: null
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation errors in the provided Organization ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Organization ID must be a string"
 * - "Organization ID must be a valid hexadecimal value"
 * - "Organization ID must be exactly 24 characters long"
 * - "Organization ID is required"
 * - "Organization ID cannot be empty"
 *
 * 404 Not Found – Organization not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Organization not found"
 * }
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – User does not have the required role
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Forbidden: role \"${userRole}\" is not allowed"
 * }
 *
 * 429 Too Many Requests – Too many requests. Please try again later
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later"
 * }
 */
orgRouter.delete("/:id", authenticate, authorize("admin"), organizationController.deleteOrganization);

export default orgRouter;
