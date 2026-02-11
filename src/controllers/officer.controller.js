// @ts-check
import asyncHandler from "express-async-handler";
import officerService from "../services/officer.service.js";

/**
 * @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest
 * @typedef {import('express').Response} Response
 */

class OfficerController {
  /**
   * @param {Response} res
   */
  createOfficer = asyncHandler(async (req, res) => {
    const officer = await officerService.createOfficer(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Officer created successfully",
      data: officer,
    });
  });

  /**
   * @param {Response} res
   */
  getOfficers = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficers(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: "Officers retrieved successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getOfficerById = asyncHandler(async (req, res) => {
    const officer = await officerService.getOfficerById(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params,
    );

    res.status(200).json({
      success: true,
      message: "Officer retrieved successfully",
      data: officer,
    });
  });

  /**
   * @param {Response} res
   */
  updateOfficer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await officerService.updateOfficer(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Officer updated successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  deleteOfficer = asyncHandler(async (req, res) => {
    const result = await officerService.deleteOfficerById(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params,
    );

    res.status(200).json({
      success: true,
      message: "Officer deleted successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getOfficerStats = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficerStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "Officer statistics retrieved successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getOfficersByPeriod = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficersByPeriod(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: `Officer statistics by ${result.period} retrieved successfully`,
      data: result.data,
    });
  });

  /**
   * @param {Response} res
   */
  getOfficersDetailed = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficersDetailed(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "Detailed officers information retrieved successfully",
      count: result.length,
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getOfficersNearTermEnd = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficersNearTermEnd(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: `Officers with term ending within ${result.days} days retrieved successfully`,
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getOrganizationOfficerStats = asyncHandler(async (req, res) => {
    const result = await officerService.getOrganizationOfficerStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params.orgId,
    );

    res.status(200).json({
      success: true,
      message: "Organization officer statistics retrieved successfully",
      data: result,
    });
  });
}

export default new OfficerController();
