// @ts-check
import { AppError } from "./error.middleware.js";
import authService from "../services/auth.service.js";

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} JwtPayload
 * @property {string} userId
 * @property {string} username
 * @property {string} email
 * @property {string} role
 */

/**
 * Authentication Middleware - Protects routes by verifying JWT tokens
 * @param {import("express").Request & { user?: AuthUser }} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 */
const authenticate = async (req, _res, next) => {
  try {
    // Extract token from cookies or Authorization header
    let token = req.cookies?.token || null;

    // Check Authorization header if no cookie token
    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }
    }

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    // Verify token using service
    const payload = authService.verifyToken(token);

    // Type assertion for the payload
    const { userId, username, email, role } = /** @type {JwtPayload} */ (
      payload
    );

    /** @type {AuthUser} */
    req.user = {
      id: userId,
      username,
      email,
      role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware - Attaches user info if token exists, but doesn't require it
 * @param {import("express").Request & { user?: AuthUser }} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 */
const optionalAuthenticate = async (req, _res, next) => {
  try {
    // Extract token from cookies or Authorization header
    let token = req.cookies?.token || null;

    // Check Authorization header if no cookie token
    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }
    }

    // If no token, just continue without setting req.user
    if (!token) {
      next();
      return;
    }

    // Verify token using service
    const payload = authService.verifyToken(token);

    // Type assertion for the payload
    const { userId, username, email, role } = /** @type {JwtPayload} */ (
      payload
    );

    /** @type {AuthUser} */
    req.user = {
      id: userId,
      username,
      email,
      role,
    };

    next();
    return;
  } catch {
    // If token verification fails, just continue without user (treat as guest)
    next();
    return;
  }
};

/**
 * Authorization Middleware - Restricts access based on user roles
 * Treats unauthenticated users as having "guest" role
 * @param {...string} allowedRoles
 * @returns {(req: import("express").Request & { user?: AuthUser }, res: import("express").Response, next: import("express").NextFunction) => void}
 */
const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    // If no user, treat as guest
    const userRole = req.user?.role || "guest";

    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError(`Forbidden: role "${userRole}" is not allowed`, 403),
      );
    }

    return next();
  };

export { authenticate, authorize, optionalAuthenticate };
