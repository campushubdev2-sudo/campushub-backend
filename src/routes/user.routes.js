// @ts-check

import { Router } from "express";

import userController from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const userRouter = Router();

userRouter.use(authenticate, createRateLimiter({ limit: 60, windowMs: 60_000 }));

/**
 * POST /api/v1/users
 *
 * Create a new user in the system.
 *
 * Request Body:
 * {
 *   username: string,        // Required. Must be a non-empty string.
 *   email: string,           // Required. Must be a valid email address.
 *   password: string,        // Required. 8-128 characters, must include uppercase, lowercase, number, and special character.
 *   role: string,            // Required. Must be one of: "admin", "adviser", "officer", "student".
 *   phoneNumber: string,     // Required. Must be in E.164 format (e.g., +639123456789).
 * }
 *
 * Success Response (201):
 * {
 *   success: true,
 *   message: "New user has been created",
 *   data: {
 *     _id: string,            // Unique identifier of the user.
 *     username: string,       // Username of the user.
 *     email: string,          // Email address of the user.
 *     role: string,           // Role assigned to the user.
 *     phoneNumber: string,    // Phone number of the user.
 *     createdAt: string,      // Timestamp of creation (ISO 8601 format).
 *     updatedAt: string       // Timestamp of last update (ISO 8601 format).
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation errors
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Username must be a string"
 * - "Username cannot be empty"
 * - "Username is required"
 * - "Please enter a valid email address"
 * - "Email is required"
 * - "Password cannot exceed 128 characters"
 * - "Password is not allowed to be empty"
 * - "Password is required"
 * - "Password must be at least 8 characters"
 * - "Password must include uppercase, lowercase, number and special character"
 * - "Role must be one of: admin, adviser, officer, student"
 * - "Role is required and cannot be empty"
 * - "Phone number must be in E.164 format (e.g., +639123456789)"
 * - "Phone number cannot be empty"
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
 *   message: "Forbidden: role \"student\" is not allowed"
 * }
 *
 * 409 Conflict – Duplicate entries
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Username already exists"
 * - "Email already exists"
 */
userRouter.post("/", authorize("admin"), userController.createUser);

/**
 * GET /api/v1/users/
 *
 * Retrieve a paginated list of users with optional filtering by email, username, role, and phone number.
 * Authentication is required. Users with role "guest" are not allowed to access this endpoint.
 *
 * IMPORTANT (Frontend Note – Query Encoding):
 * All query parameters MUST be properly URL-encoded on the frontend.
 * This is especially required for special characters such as "+" in phone numbers.
 *
 * Example:
 * Raw value:
 *   phoneNumber=+639444444444
 *
 * Encoded value:
 *   phoneNumber=%2B639444444444
 *
 * Example request:
 *   /api/v1/users?phoneNumber=%2B639444444444
 *
 * Most HTTP clients (e.g., Axios, Fetch API, Postman) automatically handle encoding
 * if you pass query parameters as an object instead of manually concatenating strings.
 *
 * Request Query Parameters:
 * {
 *   page: number,          // Optional. Must be an integer ≥ 1. Default: 1.
 *   limit: number,         // Optional. Must be an integer ≥ 1 and ≤ 100. Default: 10.
 *   email: string,         // Optional. Must be a valid email format.
 *   username: string,      // Optional. Must be a string.
 *   role: string,          // Optional. Must be one of: "admin", "student organization", "officer", "student".
 *   phoneNumber: string    // Optional. Must be in valid E.164 format (e.g., +639XXXXXXXXX).
 *                           // MUST be URL-encoded when sent in query string.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Users retrieved successfully",
 *   meta: {
 *     total: number,       // Total number of users matching the filters.
 *     page: number,        // Current page number.
 *     limit: number        // Number of records per page.
 *   },
 *   data: [
 *     {
 *       _id: string,        // Unique user identifier.
 *       username: string,   // User's username.
 *       role: string,       // User role.
 *       email: string,      // User email address.
 *       phoneNumber: string,// User phone number in E.164 format.
 *       createdAt: string,  // ISO 8601 timestamp when the user was created.
 *       updatedAt: string   // ISO 8601 timestamp when the user was last updated.
 *     }
 *   ]
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
 * - Page must be a number
 * - Page must be an integer
 * - Page must be at least 1
 * - Limit must be a number
 * - Limit must be an integer
 * - Limit must be at least 1
 * - Limit cannot exceed 100
 * - Invalid email filter
 * - Username filter must be a string
 * - Role filter must be one of: admin, student organization, officer, student
 * - Phone number filter must be in E.164 format
 *
 * 401 Unauthorized – Authentication Required
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 *
 * 403 Forbidden – Access Denied (Role "guest" not allowed)
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 *
 * 429 Too Many Requests – Rate Limit Exceeded
 * {
 *   success: false,
 *   message: "Too many requests. Please try again later."
 * }
 */
userRouter.get("/", authorize("admin", "adviser", "officer"), userController.getUsers);

/**
 * GET /api/v1/users/:id
 *
 * Retrieve a single user by their unique ID.
 *
 * Request Params:
 * {
 *   id: string        // Required. Valid MongoDB ObjectId (24-character hexadecimal string).
 * }
 *
 * Success Response (200 OK):
 * {
 *   success: true,
 *   message: "User retrieved successfully",
 *   data: {
 *     _id: string,            // Unique user ID (MongoDB ObjectId)
 *     username: string,       // Unique username of the user
 *     role: string,           // User role (e.g., "student", "admin", etc.)
 *     email: string,          // Valid email address
 *     phoneNumber: string,    // User phone number in international format (e.g., +639XXXXXXXXX)
 *     createdAt: string,      // ISO 8601 timestamp of account creation
 *     updatedAt: string       // ISO 8601 timestamp of last update
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
 * - "Invalid user ID format"
 * - "User ID is required"
 *
 * 401 Unauthorized – Authentication Required
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Authentication token is missing"
 * - "Invalid or expired token"
 *
 * 403 Forbidden – Access Denied (Role "guest" not allowed)
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Access denied"
 * - "Insufficient permissions"
 *
 * 404 Not Found – User Not Found
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "User not found"
 *
 * 429 Too Many Requests – Rate Limit Exceeded
 * {
 *   success: false,
 *   message: "Too many requests. Please try again later."
 * }
 */
userRouter.get("/:id", authorize("admin"), userController.getUserById);

/**
 * PUT /api/v1/users/:id
 *
 * Update a user's information by ID. All fields in the body are optional.
 *
 * Request Parameters:
 * {
 *   id: string,               // Required. User ID to update
 * }
 *
 * Request Body:
 * {
 *   username: string,         // Optional. Must be a non-empty string
 *   email: string,            // Optional. Must be a valid email address
 *   role: string,             // Optional. Must be one of: admin, adviser, officer, student
 *   phoneNumber: string       // Optional. Must be in E.164 format (e.g., +639123456789)
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "User updated successfully",
 *   data: {
 *     _id: string,            // User ID
 *     username: string,       // Updated username
 *     role: string,           // Updated role
 *     email: string,          // Updated email
 *     phoneNumber: string,    // Updated phone number
 *     createdAt: string,      // ISO timestamp of creation
 *     updatedAt: string       // ISO timestamp of last update
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation Failed
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Username must be a string"
 * - "Username cannot be empty"
 * - "Please enter a valid email address"
 * - "Role must be one of: admin, adviser, officer, student"
 * - "Phone number must be in E.164 format (e.g., +639123456789)"
 * - "Phone number cannot be empty"
 * - "Please provide at least one field to update."
 *
 * 401 Unauthorized – Authentication Required
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Authentication token is missing"
 * - "Invalid or expired token"
 *
 * 403 Forbidden – Access Denied
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Access denied"
 * - "Insufficient permissions"
 * - "Cannot update the last admin"
 *
 * 404 Not Found – User Not Found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "User not found"
 * }
 */
userRouter.put("/:id", authorize("admin"), userController.updateUser);

/**
 * DELETE /api/v1/users/:id
 *
 * Delete a user by their unique ID.
 *
 * Request Parameters:
 * {
 *   id: string,       // Required. The unique identifier of the user to delete.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "User deleted successfully",
 *   data: null
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid or missing user ID
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Invalid user id"
 * - "User id is required"
 *
 * 401 Unauthorized – Authentication required
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Authentication required"
 * }
 *
 * 403 Forbidden – Action not allowed
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Forbidden: role 'example_not_allowed' is not allowed"
 * - "Cannot delete the last admin"
 *
 * 404 Not Found – User does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: "User not found"
 * }
 */
userRouter.delete("/:id", authorize("admin"), userController.deleteUser);

/**
 * GET /api/v1/users/stats/overview
 *
 * Retrieve an overview of user statistics.
 *
 * Request Body:
 * {}
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "User statistics retrieved successfully",
 *   data: {
 *     totalUsers: number,            // Total number of users in the system
 *     usersByRole: {                 // Count of users grouped by their role
 *       officer: number,             // Number of users with role 'officer'
 *       admin: number,               // Number of users with role 'admin'
 *       adviser: number              // Number of users with role 'adviser'
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
 *   message: string
 * }
 * Possible messages include:
 * - "Authentication required"
 *
 * 403 Forbidden – User not allowed to access this resource
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Forbidden: role not allowed to access statistics"
 *
 * 500 Internal Server Error – Unexpected server error
 * {
 *   success: false,
 *   status: "error",
 *   message: string
 * }
 * Possible messages include:
 * - "Failed to retrieve user statistics"
 */
userRouter.get("/stats/overview", authorize("admin", "officer"), userController.getUserStats);

export default userRouter;
