import asyncHandler from "express-async-handler";
import auditLogService from "../services/audit-log.service.js";

class AuditLogController {
  getAuditLogs = asyncHandler(async (req, res) => {
    const result = await auditLogService.getAuditLogs(req.query);

    res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: result,
    });
  });
}

export default new AuditLogController();
