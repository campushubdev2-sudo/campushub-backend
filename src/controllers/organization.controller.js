// @ts-check
import asyncHandler from "express-async-handler";
import organizationService from "../services/organization.service.js";

/**
 * @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest
 * @typedef {import('express').Response} Response
 */

class OrganizationController {
  /**
   * @param {Response} res
   */
  createOrganization = asyncHandler(async (req, res) => {
    const result = await organizationService.createOrganization(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getOrganizations = asyncHandler(async (req, res) => {
    const result = await organizationService.getAllOrganizations(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: "Organizations retrieved successfully",
      data: result.organizations,
      meta: result.pagination,
    });
  });

  /**
   * @param {Response} res
   */
  getOrganization = asyncHandler(async (req, res) => {
    const result = await organizationService.getOrganization(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: "Organization retrieved successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  updateOrganization = asyncHandler(async (req, res) => {
    const result = await organizationService.updateOrganization(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  deleteOrganization = asyncHandler(async (req, res) => {
    await organizationService.deleteOrganization(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
      data: null,
    });
  });

  /**
   * @param {Response} res
   */
  getStats = asyncHandler(async (req, res) => {
    const result = await organizationService.getGeneralStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: result,
    });
  });
}

export default new OrganizationController();
