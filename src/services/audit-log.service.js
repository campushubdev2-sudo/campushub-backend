import auditLogRepository from "../repositories/audit-log.repository.js";
import { getAuditLogsSchema } from "../validations/audit-log.validation.js";
import { getAuditLogByIdSchema } from "../validations/audit-log.validation.js";
import { deleteAuditLogSchema } from "../validations/audit-log.validation.js";
import { AppError } from "../middlewares/error.middleware.js";

class AuditLogService {
  async getAuditLogs(query) {
    const { error, value } = getAuditLogsSchema.validate(query);

    if (error) {
      const message = error.details.map((detail) => detail.message);
      throw new AppError(message, 400);
    }

    const { userId, action, sort, fields } = value;

    const filter = {};
    if (userId) {
      filter.userId = userId;
    }
    if (action) {
      filter.action = action;
    }

    return auditLogRepository.findAll({
      filter,
      sort,
      fields,
    });
  }

  async getAuditLogById(payload) {
    const { error, value } = getAuditLogByIdSchema.validate(payload);

    if (error) {
      const message = error.details.map((detail) => detail.message);
      throw new AppError(message, 400);
    }

    const { id } = value;

    const auditLog = await auditLogRepository.findById(id, {
      populate: ["userId"],
    });

    if (!auditLog) {
      throw new AppError("Audit log not found", 404);
    }

    return auditLog;
  }

  async deleteAuditLog(payload) {
    const { error, value } = deleteAuditLogSchema.validate(payload);

    if (error) {
      const message = error.details.map((d) => d.message);
      throw new AppError(message, 400);
    }

    const { id } = value;

    const existingLog = await auditLogRepository.findById(id);
    if (!existingLog) {
      throw new AppError("Audit log not found", 404);
    }

    const deletedLog = await auditLogRepository.deleteById(id);

    return deletedLog;
  }

  async cleanupAuditLogs() {
    const result = await auditLogRepository.deleteAll();

    return {
      deletedCount: result.deletedCount,
    };
  }
}

export default new AuditLogService();
