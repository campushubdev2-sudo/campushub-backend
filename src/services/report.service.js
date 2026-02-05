// src/services/report.service.js
import ReportRepository from "../repositories/report.repository.js";
import { createReportSchema } from "../validations/report.validation.js";
import { downloadReportFilesSchema } from "../validations/report.validation.js";
import { updateReportStatusSchema } from "../validations/report.validation.js";
import { deleteReportSchema } from "../validations/report.validation.js";
import { AppError } from "../middlewares/error.middleware.js";
import mongoose from "mongoose";
import auditLogRepository from "../repositories/audit-log.repository.js";
import smsService from "./sms.service.js";

class ReportService {
  async createReport(payload, userId) {
    const { error, value } = createReportSchema.validate(payload);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { orgId, reportType, filePaths } = value;

    const reportData = {
      orgId,
      reportType,
      filePaths,
      submittedBy: userId,
    };

    const report = await ReportRepository.createReport(reportData);

    await auditLogRepository.create({
      userId,
      action: "report.create",
    });

    return await ReportRepository.findReportById(report._id);
  }

  async getAllReports(actorId, query = {}) {
    const {
      page = 1,
      limit = 25,
      orgId,
      reportType,
      submittedBy,
      sortBy = "submittedDate",
      sortOrder = "desc",
    } = query;

    // Build filter
    const filter = {};
    if (orgId) {
      filter.orgId = orgId;
    }
    if (reportType) {
      filter.reportType = reportType;
    }
    if (submittedBy) {
      filter.submittedBy = submittedBy;
    }

    // Validate numeric params
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (Number.isNaN(parsedPage) || parsedPage < 1) {
      throw new AppError("Invalid page parameter", 400);
    }
    if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
      throw new AppError("Invalid limit parameter", 400);
    }

    // Build sort
    const order = sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: order };

    // Populate org and submitter basic fields
    const populate = [
      { path: "orgId", select: "orgName adviserId" },
      { path: "submittedBy", select: "username email role" },
    ];

    const { count, reports } = await ReportRepository.findAll({
      filter,
      page: parsedPage,
      limit: parsedLimit,
      sort,
      populate,
    });

    await auditLogRepository.create({
      userId: actorId,
      action: "report.list",
    });

    return { count, data: reports };
  }

  async getReportById(actorId, reportId) {
    if (!reportId || !mongoose.Types.ObjectId.isValid(reportId)) {
      throw new AppError("Invalid report id", 400);
    }

    const populate = [
      { path: "orgId", select: "orgName description" },
      { path: "submittedBy", select: "username email role" },
    ];

    const report = await ReportRepository.findById(reportId, { populate });

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    await auditLogRepository.create({
      userId: actorId,
      action: "report.detail",
    });

    return report;
  }

  async downloadFiles(actorId, reportId) {
    // Validate report ID
    const { error, value } = downloadReportFilesSchema.validate({
      id: reportId,
    });
    if (error) {
      const message = error.details.map((detail) => detail.message);
      throw new AppError(message, 400);
    }

    const { id } = value;

    const report = await ReportRepository.findById(id);

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    // Get file paths from the report

    const filePaths = report.filePaths || [];

    await auditLogRepository.create({
      userId: actorId,
      action: "report.download(s)",
    });

    return {
      filePaths,
      reportType: report.reportType,
    };
  }

  async updateReportStatus(actorId, payload) {
    const { error, value } = updateReportStatusSchema.validate(payload);

    if (error) {
      const message = error.details.map((d) => d.message);
      throw new AppError(message, 400);
    }

    const { id, status, message } = value;

    const report = await ReportRepository.findById(id, {
      populate: "submittedBy",
    });
    if (!report) {
      throw new AppError("Report not found", 404);
    }

    if (report.status === status) {
      return report;
    }

    // pending -> approved
    const to = report.submittedBy?.phoneNumber;

    if (!to) {
      throw new AppError("User phone number not found", 400);
    }

    if (report.status === "pending" && status === "approved") {
      // TODO: do something when pending is approved
      await smsService.sendSMS({ to, message }); // auto-generated or user defined?
    }

    const updatedReport = await ReportRepository.updateStatusById(id, status);

    await auditLogRepository.create({
      userId: actorId,
      action: "report.update-status",
    });

    return updatedReport;
  }

  async deleteReportById(actorId, payload) {
    const { error, value } = deleteReportSchema.validate(payload);

    if (error) {
      const message = error.details.map((d) => d.message);
      throw new AppError(message, 400);
    }

    const { id } = value;

    const report = await ReportRepository.findById(id);
    if (!report) {
      throw new AppError("Report not found", 404);
    }

    await ReportRepository.deleteById(id);

    await auditLogRepository.create({
      userId: actorId,
      action: "report.delete",
    });

    return report;
  }
}

export default new ReportService();
