import { Router } from "express";
import auditLogController from "../controllers/audit-log.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

const auditLogRouter = Router();

auditLogRouter.use(
  authenticate,
  authorize("admin"),
  createRateLimiter({
    limit: 30,
    windowMs: 60_000,
  }),
);

auditLogRouter.delete("/cleanup", auditLogController.cleanup);

auditLogRouter.get("/", auditLogController.getAuditLogs);

auditLogRouter.delete("/:id", auditLogController.deleteAuditLog);

auditLogRouter.get("/:id", auditLogController.getById);

export default auditLogRouter;
