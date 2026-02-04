// @ts-check

import { Router } from "express";

import userController from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const userRouter = Router();

userRouter.use(
  authenticate,
  authorize("admin"),
  createRateLimiter({
    limit: 60,
    windowMs: 60_000,
  }),
);

userRouter.post("/", userController.createUser);
userRouter.get("/", userController.getUsers);
userRouter.get("/:id", userController.getUserById);
userRouter.put("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);
userRouter.get("/stats/overview", userController.getUserStats);

export default userRouter;
