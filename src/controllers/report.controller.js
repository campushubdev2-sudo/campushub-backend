// @ts-check
import asyncHandler from "express-async-handler";
import reportService from "../services/report.service.js";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { fileURLToPath } from "url";

/**
 * @typedef {{
 *  fieldname: string
 *  originalname: string
 *  encoding: string
 *  mimetype: string
 *  size: number
 *  destination: string
 *  filename: string
 *  path: string
 * }} MulterFile
 */

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest
 * @typedef {AuthenticatedRequest & { files?: MulterFile[] }} ReportRequest
 */

class ReportController {
  /** @param {Response} res*/
  createReport = asyncHandler(async (req, res) => {
    try {
      // Get uploaded files - handle array type explicitly
      const files = req.files && Array.isArray(req.files) ? req.files : [];

      const uploadedFilePaths = files.map((file) => {
        const serverDir = process.cwd();
        const relativePath = path.relative(serverDir, file.path);
        return relativePath.replace(/\\/g, "/");
      });

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

      const result = await reportService.createReport(
        reportsData,
        /** @type {ReportRequest} */ (req).user.id,
      );

      res.status(201).json({
        success: true,
        message: "Report submitted successfully",
        data: result,
      });
    } catch (error) {
      // Clean up uploaded files if there's an error
      if (req.files && Array.isArray(req.files)) {
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

  /** @param {Response} res */
  getAllReports = asyncHandler(async (req, res) => {
    const result = await reportService.getAllReports(
      /** @type {ReportRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      count: result.count,
      data: result.data,
    });
  });

  /** @param {Response} res */
  getReportById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const report = await reportService.getReportById(
      /** @type {ReportRequest} */ (req).user.id,
      id,
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  });

  /** @param {Response} res */
  downloadReportFiles = asyncHandler(async (req, res) => {
    const result = await reportService.downloadFiles(
      /** @type {ReportRequest} */ (req).user.id,
      req.params.id,
    );

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

  /** @param {Response} res */
  updateStatus = asyncHandler(async (req, res) => {
    const payload = {
      id: req.params.id,
      status: req.body.status,
      ...(req.body.message && { message: req.body.message }),
    };

    const result = await reportService.updateReportStatus(
      /** @type {ReportRequest} **/ (req).user.id,
      payload,
    );

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: result,
    });
  });

  /** @param {Response} res */
  deleteReportById = asyncHandler(async (req, res) => {
    const result = await reportService.deleteReportById(
      /** @type {ReportRequest} */ (req).user.id,
      {
        id: req.params.id,
      },
    );

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      data: result,
    });
  });
}

export default new ReportController();
