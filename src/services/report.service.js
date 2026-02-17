// src/services/report.service.js
import ReportRepository from "../repositories/report.repository.js";
import { createReportSchema } from "../validations/report.validation.js";
import { downloadReportFilesSchema } from "../validations/report.validation.js";
import { updateReportStatusSchema } from "../validations/report.validation.js";
import { deleteReportSchema } from "../validations/report.validation.js";
import { getAllReportsQuerySchema } from "../validations/report.validation.js";
import { AppError } from "../middlewares/error.middleware.js";
import mongoose from "mongoose";
import auditLogRepository from "../repositories/audit-log.repository.js";
import smsService from "./sms.service.js";
import path from "path";
import fs from "fs/promises";

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
      action: "Create Report",
    });

    return await ReportRepository.findReportById(report._id);
  }

  async getAllReports(actorId, query = {}) {
    const { value, error } = getAllReportsQuerySchema.validate(query);
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      throw new AppError(message, 400);
    }

    const { page, limit, orgId, reportType, submittedBy, sortBy, sortOrder } = value;

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

    // Build sort
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const populate = [
      { path: "orgId", select: "orgName adviserId" },
      { path: "submittedBy", select: "username email role" },
    ];

    const { count, reports } = await ReportRepository.findAll({ filter, page, limit, sort, populate });

    await auditLogRepository.create({
      userId: actorId,
      action: "View Reports",
    });

    return { count, data: reports };
  }

  async getReportById(actorId, reportId) {
    if (!reportId || !mongoose.Types.ObjectId.isValid(reportId)) {
      throw new AppError("  ", 400);
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
      action: "View Report Details",
    });

    return report;
  }

  async downloadFiles(actorId, reportId) {
    // Validate report ID
    const { error, value } = downloadReportFilesSchema.validate({
      id: reportId,
    });
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
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
      action: "Download Reports",
    });

    return {
      filePaths,
      reportType: report.reportType,
    };
  }

  async updateReportStatus(actorId, payload) {
    const { error, value } = updateReportStatusSchema.validate(payload);

    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
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
      await smsService.sendSMS({ to, message });
    }

    const updatedReport = await ReportRepository.updateStatusById(id, status);

    await auditLogRepository.create({
      userId: actorId,
      action: "Update Report Status",
    });

    return updatedReport;
  }

  async deleteReportById(actorId, payload) {
    const { error, value } = deleteReportSchema.validate(payload);

    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      throw new AppError(message, 400);
    }

    const { id } = value;

    const report = await ReportRepository.findById(id);
    if (!report) {
      throw new AppError("Report not found", 404);
    }

    if (Array.isArray(report.filePaths)) {
      for (const relativePath of report.filePaths) {
        const absolutePath = path.join(process.cwd(), relativePath);

        try {
          await fs.unlink(absolutePath);
        } catch (error) {
          console.error("Failed to delete file: ", absolutePath);
        }
      }
    }

    await ReportRepository.deleteById(id);

    await auditLogRepository.create({
      userId: actorId,
      action: "Delete Report",
    });

    return report;
  }
}

export default new ReportService();
