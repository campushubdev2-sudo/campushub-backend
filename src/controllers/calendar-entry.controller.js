import asyncHandler from "express-async-handler";
import calendarEntryService from "../services/calendar-entry.service.js";

class CalendarEntryController {
  createCalendarEntry = asyncHandler(async (req, res) => {
    const result = await calendarEntryService.createCalendarEntry(req.body);

    res.status(201).json({
      success: true,
      message: "Calendar entry created successfully",
      data: {
        calendarEntry: result.calendarEntry,
        event: result.event,
      },
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await calendarEntryService.getCalendarEntries(req.query);

    res.status(200).json({
      success: true,
      message: "Calendar entries retrieved successfully",
      data: result.items,
      meta: result.meta,
    });
  });

  updateCalendarEntry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await calendarEntryService.updateCalendarEntry(id, req.body);

    res.status(200).json({
      success: true,
      message: "Calendar entry updated successfully",
      data: result,
    });
  });

  deleteCalendarEntry = asyncHandler(async (req, res) => {
    const result = await calendarEntryService.deleteCalendarEntry({
      id: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Calendar entry deleted successfully",
      data: result,
    });
  });

  getCalendarStats = asyncHandler(async (req, res) => {
    const data = await calendarEntryService.getStats();

    res.status(200).json({
      success: true,
      message: "Calendar statistics retrieved successfully",
      result: data,
    });
  });
}

export default new CalendarEntryController();
