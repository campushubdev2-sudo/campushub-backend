// src/middlewares/auth.middleware.js

import { AppError } from "./error.middleware.js";
import authService from "../services/auth.service.js";

/**
 * Authentication Middleware - Protects routes by verifying JWT tokens
 * @param {import("express").Request} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 */
const authenticate = async (req, _res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    // Verify token using service
    const { userId, username, email, role } = authService.verifyToken(token);

    // Attach user to request object
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
 * @param {...string} allowedRoles
 * @returns {import("express").RequestHandler}
 */
const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    // authenticate() must run first
    if (!req.user?.role) {
      return next(new AppError("Unauthorized: user context missing", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Forbidden: role "${req.user.role}" is not allowed`, 403),
      );
    }

    return next();
  };

export { authenticate, authorize };
