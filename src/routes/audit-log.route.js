import { Router } from "express";
import auditLogController from "../controllers/audit-log.controller.js";

const auditLogRouter = Router();

auditLogRouter.get("/", auditLogController.getAuditLogs);

export default auditLogRouter;
