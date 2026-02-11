// @ts-check
import asyncHandler from "express-async-handler";
import schoolEventService from "../services/school-event.service.js";

/**
 * @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest
 * @typedef {import('express').Response} Response
 * @typedef {import('express').Request} Request
 */

class SchoolEventController {
  /** @param {Response} res */
  createNewEvent = asyncHandler(async (req, res) => {
    const newEvent = await schoolEventService.createSchoolEvent(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "School event created successfully",
      data: newEvent,
    });
  });

  /** @param {Response} res */
  getAllEvents = asyncHandler(async (req, res) => {
    const result = await schoolEventService.getAllEvents(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: "School events fetched successfully",
      data: result.events,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  /** @param {Response} res */
  getSchoolEventById = asyncHandler(async (req, res) => {
    const result = await schoolEventService.getSchoolEventById(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params,
    );

    res.status(200).json({
      success: true,
      message: "School event retrieved successfully",
      data: result,
    });
  });

  /** @param {Response} res */
  filterEvents = asyncHandler(async (req, res) => {
    const result = await schoolEventService.filterEventsByDate(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      count: result.length,
      data: result,
    });
  });

  /** @param {Response} res */
  getStats = asyncHandler(async (req, res) => {
    const stats = await schoolEventService.getEventStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "Event statistics retrieved successfully",
      data: stats,
    });
  });

  /** @param {Response} res */
  getMonthlyStats = asyncHandler(async (req, res) => {
    const { year } = req.query;

    const result = await schoolEventService.getMonthlyEventCount(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      {
        year,
      },
    );

    res.status(200).json({
      success: true,
      message: "Monthly event statistics retrieved successfully",
      data: result,
    });
  });

  /** @param {Response} res */
  getVenueStats = asyncHandler(async (req, res) => {
    const venueStats = await schoolEventService.getVenueStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "Venue statistics retrieved successfully",
      count: venueStats.length,
      data: venueStats,
    });
  });

  /** @param {Response} res */
  getRecentEvents = asyncHandler(async (req, res) => {
    const { limit } = req.query;

    const result = await schoolEventService.getRecentEvents(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      { limit },
    );

    res.status(200).json({
      success: true,
      message: "Recent events retrieved successfully",
      count: result.length,
      data: result,
    });
  });

  /** @param {Response} res */
  updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await schoolEventService.updateEvent(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      id,
      updateData,
    );

    res.status(200).json({
      success: true,
      message: "School event updated successfully",
      data: result,
    });
  });

  /** @param {Response} res */
  deleteSchoolEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await schoolEventService.deleteSchoolEvent(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      id,
    );

    res.status(200).json({
      success: true,
      message: "School event deleted successfully",
      data: result,
    });
  });
}

export default new SchoolEventController();
