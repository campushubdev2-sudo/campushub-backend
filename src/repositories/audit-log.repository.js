// @ts-check
import AuditLog from "../models/audit-log.model.js";

class AuditLogRepository {
  /**
   * @param {{ userId?: import("mongoose").Types.ObjectId, action: string}} payload
   * @returns {Promise<Record<string, any>>}
   */
  async create(payload) {
    const doc = await AuditLog.create(payload);
    return doc.toObject();
  }

  /**
   * @param {{ filter?: Record<string, any>, sort?: string, fields?: string }} options
   * @returns {Promise<Array<Record<string, any>>>}
   */
  async findAll({ filter = {}, sort = "-createdAt", fields = "" }) {
    return AuditLog.find(filter)
      .populate("userId", "username email role")
      .sort(sort)
      .select(fields)
      .lean();
  }

  /**
   * @param {string | import("mongoose").Types.ObjectId} id
   * @param {{ populate?: Array<string | import("mongoose").PopulateOptions> }} [options]
   * @returns {Promise<Record<string, any> | null>}
   */
  async findById(id, { populate = [] } = {}) {
    return AuditLog.findById(id).populate(populate).lean();
  }

  /**
   * @param {string | import("mongoose").Types.ObjectId} id
   * @returns {Promise<Record<string, any> | null>}
   */
  async deleteById(id) {
    return AuditLog.findByIdAndDelete(id).lean();
  }

  /**
   * @returns {Promise<import("mongoose").DeleteResult>}
   */
  async deleteAll() {
    return AuditLog.deleteMany({});
  }
}

export default new AuditLogRepository();
