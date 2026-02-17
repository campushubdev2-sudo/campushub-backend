import { Router } from "express";

import authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const authRouter = Router();

/**
 * GET /api/v1/auth/profile
 *
 * Retrieve the profile of the authenticated user.
 *
 * Request Headers:
 * {
 *   Authorization: string,      // Required. Bearer token for authentication.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Profile retrieved successfully",
 *   data: {
 *     user: {
 *       id: string,             // Unique identifier of the user
 *       username: string,       // Username of the user
 *       email: string,          // Email address of the user
 *       role: string            // Role of the user (e.g., "admin")
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
 * 404 Not Found – User does not exist
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "User not found"
 *
 */
authRouter.get("/profile", authenticate, authController.getProfile);

/**
 * POST /api/v1/auth/sign-up
 *
 * Registers a new user in the system.
 *
 * Request Body:
 * {
 *   username: string,        // Required. Must be 3-50 characters.
 *   password: string,        // Required. Must be 8-128 characters, include uppercase, lowercase, number, and special character.
 *   email: string,           // Required. Must be a valid email address.
 *   phoneNumber: string,     // Required. Must be in E.164 format (e.g., +639123456789).
 *   role?: string            // Optional. Must be one of: admin, adviser, officer, student. Default is "student". Client should not set this.
 * }
 *
 * Success Response (201 Created):
 * {
 *   success: true,
 *   message: "User registered successfully",
 *   data: {
 *     id: string,            // User unique identifier
 *     username: string,
 *     email: string,
 *     role: string,          // User role, e.g., "admin"
 *     phoneNumber: string,
 *     createdAt: string,     // ISO 8601 date string
 *     updatedAt: string      // ISO 8601 date string
 *   }
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Validation Errors
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible validation messages include:
 * - Username is required, must be a string, cannot be empty, must be 3-50 characters.
 * - Password is required, must be 8-128 characters, must include uppercase, lowercase, number, and special character.
 * - Email is required, must be a valid email address, cannot be empty.
 * - Role must be one of: admin, adviser, officer, student. Default is "student".
 * - Phone number is required, cannot be empty, must be in E.164 format (e.g., +639123456789).
 *
 * 429 Too Many Requests – Rate Limiting / Duplicate Resource
 * {
 *   success: false,
 *   message: string
 * }
 * Possible messages include:
 * - "Too many requests. Please try again later."
 * - "Username already exists"
 * - "Email already exists"
 */
authRouter.post("/sign-up", createRateLimiter({ limit: 10, windowMs: 60_000 }), authController.signUp);

/**
 * POST /api/v1/auth/sign-in
 *
 * Sign in a user with their identifier and password.
 *
 * Request Body:
 * {
 *   identifier: string,    // Required. Must be a valid string. Examples of validation errors:
 *                          // - "Identifier must be a string"
 *                          // - "Identifier is required"
 *
 *   password: string,      // Required. Maximum 128 characters. Cannot be empty.
 *                          // Validation errors include:
 *                          // - "Password cannot exceed 128 characters"
 *                          // - "Password is not allowed to be empty"
 *                          // - "Password is required"
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Login successfully!",
 *   data: {
 *     user: {
 *       _id: string,        // User ID
 *       username: string,   // Username
 *       role: string,       // User role (e.g., "admin")
 *       email: string,      // Email address
 *       phoneNumber: string,// Phone number
 *       createdAt: string,  // ISO timestamp of creation
 *       updatedAt: string   // ISO timestamp of last update
 *     }
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
 * - "Identifier must be a string"
 * - "Identifier is required"
 * - "Password cannot exceed 128 characters"
 * - "Password is not allowed to be empty"
 * - "Password is required"
 *
 * 401 Unauthorized – Invalid Credentials
 * {
 *   success: false,
 *   status: "error",
 *   message: "Invalid credentials"
 * }
 *
 * 429 Too Many Requests – Rate Limit Exceeded
 * {
 *   success: false,
 *   message: "Too many requests. Please try again later."
 * }
 */
authRouter.post("/sign-in", createRateLimiter({ limit: 10, windowMs: 60_000 }), authController.signIn);

/**
 * POST /api/v1/auth/reset-password
 *
 * Resets a user's password using email and OTP verification.
 *
 * Request Body:
 * {
 *   email: string,           // Required. Must be a valid email address.
 *   otp: string,             // Required. Exactly 6 digits, numbers only.
 *   newPassword: string      // Required. 8-128 characters, must include uppercase, lowercase, number, and special character.
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Password reset successful",
 *   data: {}
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request – Invalid input
 * {
 *   success: false,
 *   status: "fail",
 *   message: string
 * }
 * Possible messages include:
 * - "Please enter a valid email address"
 * - "The OTP must be exactly 6 digits."
 * - "The OTP must only contain numbers."
 * - "OTP cannot be empty."
 * - "OTP is required."
 * - "New password cannot be empty."
 * - "A new password is required."
 * - "Your new password must be at least 8 characters long."
 * - "Your new password cannot exceed 128 characters."
 * - "Password must include uppercase, lowercase, number, and special character"
 *
 * 404 Not Found – User not found
 * {
 *   success: false,
 *   status: "fail",
 *   message: "User not found"
 * }
 *
 * 429 Too Many Requests – OTP verification limit exceeded
 * {
 *   success: false,
 *   message: "Too many requests. Please try again later."
 * }
 */
authRouter.post("/reset-password", createRateLimiter({ limit: 10, windowMs: 60_000 }), authController.resetPassword);

/**
 * POST /api/v1/auth/logout
 *
 * Logs out the currently authenticated user by clearing their JWT cookie.
 *
 * Request Body:
 * None
 *
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Logout successfully"
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
 * 429 Too Many Requests – Rate limit exceeded
 * {
 *   success: false,
 *   status: "fail",
 *   message: "Too many requests. Please try again later."
 * }
 */
authRouter.post("/logout", createRateLimiter({ limit: 5, windowMs: 60_000 }), authenticate, authController.logOut);

export default authRouter;
