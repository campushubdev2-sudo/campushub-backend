import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { rateLimiterSchema } from "../validations/rate-limit.validation.js";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * @typedef {Object} RateLimitOptions
 * @property {number} limit - Max requests allowed
 * @property {number} windowMs - Time window in milliseconds
 * @property {(req: import("express").Request) => string} [keyGenerator]
 */

/**
 * Default key generator
 * Prefer authenticated user ID, fallback to IP
 */
function defaultKeyGenerator(req) {
  return req.user?.id || ipKeyGenerator(req.ip);
}

/**
 * Default rate-limit exceeded handler
 */
function defaultHandler(_req, res) {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
}

/**
 * Reusable rate limiter factory
 *
 * @param {RateLimitOptions} options
 * @returns {import("express").RequestHandler}
 */
function createRateLimiter(options) {
  // Apply default keyGenerator first
  const optionsWithDefaults = {
    keyGenerator: defaultKeyGenerator,
    ...options,
  };

  const { error, value } = rateLimiterSchema.validate(optionsWithDefaults);

  if (error) {
    const message = error.details.map((detail) => detail.message).join(", ");
    throw new AppError(message, 400);
  }

  const { limit, windowMs, keyGenerator } = value;

  return rateLimit({
    windowMs,
    max: limit,
    keyGenerator,
    handler: defaultHandler,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
}

export { createRateLimiter };
