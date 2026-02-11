// @ts-check
import asyncHandler from "express-async-handler";
import eventNotificationService from "../services/event-notification.service.js";

/** @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest */
/** @typedef {import('express').Response} Response */

class EventNotificationController {
  /**
   * @param {Response} res
   */
  createNotification = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.createEventNotification(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Event notification created successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  createBulkNotifications = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.createBulkEventNotifications(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: `Bulk event notifications created successfully. ${result.notificationsCreated} notifications sent, ${result.skippedDuplicates} duplicates skipped.`,
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getAllEventNotifications = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.getAllEventNotifications(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: "Event notifications retrieved successfully",
      data: result.notifications,
      meta: {
        pagination: result.pagination,
      },
    });
  });

  /**
   * @param {Response} res
   */
  getEventNotificationById = asyncHandler(async (req, res) => {
    const notificationId = req.params.id;
    const result = await eventNotificationService.getEventNotificationById(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      notificationId,
    );

    res.status(200).json({
      success: true,
      message: "Event notification retrieved successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  updateEventNotification = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.updateEventNotification(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      {
        id: req.params.id,
        updateData: req.body,
      },
    );

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Event notification updated successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  deleteEventNotification = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.deleteEventNotification(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      {
        id: req.params.id,
      },
    );

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Event notification deleted successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getOverallStats = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.getOverallStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "Overall event notification stats retrieved successfully",
      data: result,
    });
  });

  /**
   * @param {Response} res
   */
  getEventStats = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.getEventStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: "Event notification stats retrieved successfully",
      data: result,
    });
  });
}

export default new EventNotificationController();
