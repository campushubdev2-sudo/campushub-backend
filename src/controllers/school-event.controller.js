import asyncHandler from "express-async-handler";
import schoolEventService from "../services/school-event.service.js";

class SchoolEventController {
  createNewEvent = asyncHandler(async (req, res) => {
    const newEvent = await schoolEventService.createSchoolEvent(req.body);

    res.status(201).json({
      success: true,
      message: "School event created successfully",
      data: newEvent,
    });
  });

  getAllEvents = asyncHandler(async (req, res) => {
    const result = await schoolEventService.getAllEvents(req.query);

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

  getSchoolEventById = asyncHandler(async (req, res) => {
    const result = await schoolEventService.getSchoolEventById(req.params);

    res.status(200).json({
      success: true,
      message: "School event retrieved successfully",
      data: result,
    });
  });

  filterEvents = asyncHandler(async (req, res) => {
    const result = await schoolEventService.filterEventsByDate(req.query);

    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      count: result.length,
      data: result,
    });
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await schoolEventService.getEventStats();

    res.status(200).json({
      success: true,
      message: "Event statistics retrieved successfully",
      data: stats,
    });
  });

  getMonthlyStats = asyncHandler(async (req, res) => {
    const { year } = req.query;

    const result = await schoolEventService.getMonthlyEventCount({ year });

    res.status(200).json({
      success: true,
      message: "Monthly event statistics retrieved successfully",
      data: result,
    });
  });

  getVenueStats = asyncHandler(async (req, res) => {
    const venueStats = await schoolEventService.getVenueStats();

    res.status(200).json({
      success: true,
      message: "Venue statistics retrieved successfully",
      count: venueStats.length,
      data: venueStats,
    });
  });

  getRecentEvents = asyncHandler(async (req, res) => {
    const { limit } = req.query;

    const result = await schoolEventService.getRecentEvents({ limit });

    res.status(200).json({
      success: true,
      message: "Recent events retrieved successfully",
      count: result.length,
      data: result,
    });
  });

  updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await schoolEventService.updateEvent(id, updateData);

    res.status(200).json({
      success: true,
      message: "School event updated successfully",
      data: result,
    });
  });

  deleteSchoolEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await schoolEventService.deleteSchoolEvent(id);

    res.status(200).json({
      success: true,
      message: "School event deleted successfully",
      data: result,
    });
  });
}

export default new SchoolEventController();
