import AuditLogRepository from "../repositories/audit-log.repository.js";
import { getAuditLogsSchema } from "../validations/audit-log.validation.js";
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
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    return AuditLogRepository.findAll({
      filter,
      sort,
      fields,
    });
  }
}

export default new AuditLogService();
