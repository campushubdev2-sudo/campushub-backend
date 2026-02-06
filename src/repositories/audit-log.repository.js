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

  async findAll({ filter = {}, sort = "-createdAt", fields = "" }) {
    return AuditLog.find(filter)
      .populate("userId", "username email role")
      .sort(sort)
      .select(fields)
      .lean();
  }

  async findById(id, { populate = [] } = {}) {
    return AuditLog.findById(id).populate(populate).lean();
  }

  async deleteById(id) {
    return AuditLog.findByIdAndDelete(id).lean();
  }

  async deleteAll() {
    return AuditLog.deleteMany({});
  }
}

export default new AuditLogRepository();
