// @ts-check
import asyncHandler from "express-async-handler";
import officerService from "../services/officer.service.js";
import { BSBA_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { BSHM_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { JUNIOR_PHILIPPINE_BSA_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { SUPREME_STUDENT_COUNCIL_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { BSCRIM_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { MODERN_YOUNG_EDUCATORS_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { COLLEGE_OF_TEACHER_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { ELEM_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { SSLG_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { YWAV_OFFICER_POSITIONS } from "../constants/officer-positions.js";
import { JPCS_OFFICER_POSITIONS } from "../constants/officer-positions.js";

/**
 * @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest
 * @typedef {import('express').Response} Response
 */

/**
 * @typedef {{ positionValue: string, positionLabel: string }} OfficerPositionDTO
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

  /** @param {Request} _req @param {Response} res */
  getAllOfficerPositions = asyncHandler(async (_req, res) => {
    /** @type {readonly string[]} */
    const ALL_POSITIONS = [
      ...BSBA_OFFICER_POSITIONS,
      ...BSHM_OFFICER_POSITIONS,
      ...JUNIOR_PHILIPPINE_BSA_OFFICER_POSITIONS,
      ...SUPREME_STUDENT_COUNCIL_OFFICER_POSITIONS,
      ...BSCRIM_OFFICER_POSITIONS,
      ...MODERN_YOUNG_EDUCATORS_OFFICER_POSITIONS,
      ...COLLEGE_OF_TEACHER_OFFICER_POSITIONS,
      ...ELEM_OFFICER_POSITIONS,
      ...SSLG_OFFICER_POSITIONS,
      ...YWAV_OFFICER_POSITIONS,
      ...JPCS_OFFICER_POSITIONS,
    ];

    /** @type {OfficerPositionDTO[]} */
    const data = Array.from(new Set(ALL_POSITIONS)).map((position) => ({
      positionValue: position,
      positionLabel: position,
    }));

    res.status(200).json({
      success: true,
      message: "Officer positions retrieved successfully",
      data,
    });
  });
}

export default new OfficerController();
