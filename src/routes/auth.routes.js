import { Router } from "express";

import authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const authRouter = Router();

authRouter.get("/profile", authenticate, authController.getProfile);

authRouter.post("/sign-up", createRateLimiter({ limit: 3, windowMs: 60_000 }), authController.signUp);
authRouter.post("/sign-in", createRateLimiter({ limit: 5, windowMs: 60_000 }), authController.signIn);
authRouter.post("/reset-password", createRateLimiter({ limit: 3, windowMs: 5 * 60_000 }), authController.resetPassword);
authRouter.post("/logout", createRateLimiter({ limit: 10, windowMs: 60_000 }), authController.logOut);

export default authRouter;
