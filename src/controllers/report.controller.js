// src/controllers/report.controller.js
import asyncHandler from "express-async-handler";
import reportService from "../services/report.service.js";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { fileURLToPath } from "url";

class ReportController {
  createReport = asyncHandler(async (req, res) => {
    try {
      // Get uploaded files
      const uploadedFilePaths = req.files
        ? req.files.map((file) => {
            const serverDir = process.cwd();
            const relativePath = path.relative(serverDir, file.path);
            return relativePath.replace(/\\/g, "/");
          })
        : [];

      // Combine with any file URLs sent in body
      const allFilePaths = [
        ...uploadedFilePaths,
        ...(req.body.filePaths || []),
      ];

      const reportsData = {
        orgId: req.body.orgId,
        reportType: req.body.reportType,
        filePaths: allFilePaths,
      };

      const result = await reportService.createReport(reportsData, req.user.id);

      res.status(201).json({
        success: true,
        message: "Report submitted successfully",
        data: result,
      });
    } catch (error) {
      // Clean up uploaded files if there's an error
      if (req.files) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (unlinkError) {
            console.error("Error cleaning up file:", unlinkError);
          }
        });
      }
      throw error;
    }
  });

  getAllReports = asyncHandler(async (req, res) => {
    const result = await reportService.getAllReports(req.query);

    res.status(200).json({
      success: true,
      count: result.count,
      data: result.data,
    });
  });

  getReportById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const report = await reportService.getReportById(id);

    res.status(200).json({
      success: true,
      data: report,
    });
  });

  downloadReportFiles = asyncHandler(async (req, res) => {
    const result = await reportService.downloadFiles(req.params.id);

    // MULTIPLE FILES → ZIP
    if (result.filePaths.length > 1) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${result.reportType}-reports.zip`,
      );

      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("error", (err) => {
        throw err;
      });

      archive.pipe(res);

      for (const filePath of result.filePaths) {
        archive.file(filePath, {
          name: path.basename(filePath),
        });
      }

      await archive.finalize();
      return;
    }

    // SINGLE FILE → DIRECT DOWNLOAD
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(__dirname, "../../", result.filePaths[0]);
    res.download(filePath);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const result = await reportService.updateReportStatus({
      id: req.params.id,
      status: req.body.status,
    });

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: result,
    });
  });

  deleteReport = asyncHandler(async (req, res) => {
    const result = await reportService.deleteReport({
      id: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      data: result,
    });
  });
}

export default new ReportController();
