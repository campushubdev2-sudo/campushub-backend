// src/repositories/report.repository.js
import Report from "../models/report.model.js";

class ReportRepository {
  async createReport(reportData) {
    return await Report.create(reportData);
  }

  async findReportById(id) {
    return await Report.findById(id)
      .populate("orgId", "orgName description")
      .populate("submittedBy", "username email role");
  }

  async findAll({
    filter = {},
    page = 1,
    limit = 25,
    sort = { submittedDate: -1 },
    populate = [],
  } = {}) {
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const [count, reports] = await Promise.all([
      Report.countDocuments(filter),
      Report.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate(populate)
        .lean(),
    ]);

    return { count, reports };
  }

  async findById(id, { populate = [] } = {}) {
    return Report.findById(id).populate(populate).lean();
  }

  async findByIds(ids) {
    return await Report.find({ _id: { $in: ids } });
  }

  async findByFilePaths(filePaths) {
    return await Report.find({ filePaths: { $in: filePaths } });
  }

  async updateStatusById(reportId, status) {
    return Report.findByIdAndUpdate(reportId, { status }, { new: true });
  }

  async deleteById(reportId) {
    return Report.findByIdAndDelete(reportId);
  }
}

export default new ReportRepository();
