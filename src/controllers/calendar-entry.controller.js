// @ts-check
import asyncHandler from "express-async-handler";
import calendarEntryService from "../services/calendar-entry.service.js";

/**
 * @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest
 * @typedef {import('express').Response} Response
 */

class CalendarEntryController {
  /**
   * @param {Response} res
   */
  createCalendarEntry = asyncHandler(async (req, res) => {
    const result = await calendarEntryService.createCalendarEntry(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Calendar entry created successfully",
      data: {
        calendarEntry: result.calendarEntry,
        event: result.event,
      },
    });
  });

  /**
   * @param {Response} res
   */
  getAll = asyncHandler(async (req, res) => {
    const result = await calendarEntryService.getCalendarEntries(
      /** @type {AuthenticatedRequest} */ (req).user?.id || null,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: "Calendar entries retrieved successfully",
      data: result.items,
      meta: result.meta,
    });
  });

  /**
   * @param {Response} res
   */
  getCalendarEntryById = asyncHandler(async (req, res) => {
    const result = await calendarEntryService.getCalendarEntryById(
      /** @type {AuthenticatedRequest} */ (req).user?.id || null,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: "Calendar entry retrieved successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  updateCalendarEntry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await calendarEntryService.updateCalendarEntry(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Calendar entry updated successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  deleteCalendarEntry = asyncHandler(async (req, res) => {
    const result = await calendarEntryService.deleteCalendarEntry(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      {
        id: req.params.id,
      },
    );

    res.status(200).json({
      success: true,
      message: "Calendar entry deleted successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getCalendarStats = asyncHandler(async (req, res) => {
    const data = await calendarEntryService.getStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "Calendar statistics retrieved successfully",
      result: data,
    });
  });
}

export default new CalendarEntryController();
