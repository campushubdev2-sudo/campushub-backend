import asyncHandler from "express-async-handler";
import officerService from "../services/officer.service.js";

class OfficerController {
  createOfficer = asyncHandler(async (req, res) => {
    const officer = await officerService.createOfficer(req.body);

    res.status(201).json({
      success: true,
      message: "Officer created successfully",
      data: officer,
    });
  });

  getOfficers = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficers(req.query);

    res.status(200).json({
      success: true,
      message: "Officers retrieved successfully",
      data: result,
    });
  });

  getOfficerById = asyncHandler(async (req, res) => {
    const officer = await officerService.getOfficerById(req.params);

    res.status(200).json({
      success: true,
      message: "Officer retrieved successfully",
      data: officer,
    });
  });

  updateOfficer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await officerService.updateOfficer(id, req.body);

    res.status(200).json({
      success: true,
      message: "Officer updated successfully",
      data: result,
    });
  });

  deleteOfficer = asyncHandler(async (req, res) => {
    const result = await officerService.deleteOfficerById(req.params);

    res.status(200).json({
      success: true,
      message: "Officer deleted successfully",
      data: result,
    });
  });

  getOfficerStats = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficerStats();

    res.status(200).json({
      success: true,
      message: "Officer statistics retrieved successfully",
      data: result,
    });
  });

  getOfficersByPeriod = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficersByPeriod(req.query);

    res.status(200).json({
      success: true,
      message: `Officer statistics by ${result.period} retrieved successfully`,
      data: result.data,
    });
  });

  getOfficersDetailed = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficersDetailed();

    res.status(200).json({
      success: true,
      message: "Detailed officers information retrieved successfully",
      count: result.length,
      data: result,
    });
  });

  getOfficersNearTermEnd = asyncHandler(async (req, res) => {
    const result = await officerService.getOfficersNearTermEnd(req.query);

    res.status(200).json({
      success: true,
      message: `Officers with term ending within ${result.days} days retrieved successfully`,
      data: result,
    });
  });

  getOrganizationOfficerStats = asyncHandler(async (req, res) => {
    const result = await officerService.getOrganizationOfficerStats(
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
