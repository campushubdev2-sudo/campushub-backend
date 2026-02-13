// @ts-check
import { Router } from "express";

import otpController from "../controllers/otp.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const otpRouter = Router();

otpRouter.delete("/cleanup", authenticate, authorize("admin"), createRateLimiter({ limit: 60, windowMs: 60_000 }), otpController.cleanupExpiredOtps);

otpRouter.get("/stats", authenticate, authorize("admin"), createRateLimiter({ limit: 20, windowMs: 60_000 }), otpController.getStats);

otpRouter.post("/send", createRateLimiter({ limit: 5, windowMs: 5 * 60_000 }), otpController.sendOtp);

otpRouter.post("/resend", createRateLimiter({ limit: 3, windowMs: 5 * 60_000 }), otpController.resendOtp);

otpRouter.post("/verify", createRateLimiter({ limit: 5, windowMs: 5 * 60_000 }), otpController.verifyOtp);

export default otpRouter;
