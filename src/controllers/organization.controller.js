import asyncHandler from "express-async-handler";
import organizationService from "../services/organization.service.js";

class OrganizationController {
  createOrganization = asyncHandler(async (req, res) => {
    const result = await organizationService.createOrganization(
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: result,
    });
  });

  getOrganizations = asyncHandler(async (req, res) => {
    const result = await organizationService.getAllOrganizations(
      req.user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: "Organizations retrieved successfully",
      data: result.organizations,
      meta: result.pagination,
    });
  });

  getOrganization = asyncHandler(async (req, res) => {
    const result = await organizationService.getOrganization(
      req.user.id,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: "Organization retrieved successfully",
      data: result,
    });
  });

  updateOrganization = asyncHandler(async (req, res) => {
    const result = await organizationService.updateOrganization(
      req.user.id,
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: result,
    });
  });

  deleteOrganization = asyncHandler(async (req, res) => {
    await organizationService.deleteOrganization(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
      data: null,
    });
  });

  getStats = asyncHandler(async (req, res) => {
    const result = await organizationService.getGeneralStats(req.user.id);

    res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: result,
    });
  });
}

export default new OrganizationController();
