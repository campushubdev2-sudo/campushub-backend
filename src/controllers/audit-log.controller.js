// @ts-check
import asyncHandler from "express-async-handler";
import auditLogService from "../services/audit-log.service.js";

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

class AuditLogController {
  /** @param {Request} req @param {Response} res */
  getAuditLogs = asyncHandler(async (req, res) => {
    const result = await auditLogService.getAuditLogs(req.query);

    res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: result,
    });
  });

  /** @param {Request} req @param {Response} res */
  getById = asyncHandler(async (req, res) => {
    const result = await auditLogService.getAuditLogById({
      id: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Audit log fetched successfully",
      data: result,
    });
  });

  /** @param {Request} req @param {Response} res */
  deleteAuditLog = asyncHandler(async (req, res) => {
    const result = await auditLogService.deleteAuditLog({
      id: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Audit log deleted successfully",
      data: result,
    });
  });

  /** @param {Request} req @param {Response} res */
  cleanup = asyncHandler(async (_req, res) => {
    const result = await auditLogService.cleanupAuditLogs();

    res.status(200).json({
      success: true,
      message: "Audit logs cleaned up successfully",
      data: result,
    });
  });
}

export default new AuditLogController();
