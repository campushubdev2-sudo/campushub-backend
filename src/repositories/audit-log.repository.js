import AuditLog from "../models/audit-log.model.js";

class AuditLogRepository {
  /**
   * Create a new audit log entry.
   * @param {Object} payload
   * @param {import("mongoose").Types.ObjectId|string} payload.userId
   * @param {string} payload.action
   * @returns {Promise<Object>}
   */
  async create(payload) {
    const doc = await AuditLog.create(payload);
    return doc.toObject();
  }
}

export default new AuditLogRepository();


