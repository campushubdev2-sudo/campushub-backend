import asyncHandler from "express-async-handler";
import eventNotificationService from "../services/event-notification.service.js";

class EventNotificationController {
  createNotification = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.createEventNotification(
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Event notification created successfully",
      data: result,
    });
  });

  createBulkNotifications = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.createBulkEventNotifications(
      req.body,
    );

    res.status(201).json({
      success: true,
      message: `Bulk event notifications created successfully. ${result.notificationsCreated} notifications sent, ${result.skippedDuplicates} duplicates skipped.`,
      data: result,
    });
  });

  getAllEventNotifications = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.getAllEventNotifications(
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

  getEventNotificationById = asyncHandler(async (req, res) => {
    const notificationId = req.params.id;
    const result =
      await eventNotificationService.getEventNotificationById(notificationId);

    res.status(200).json({
      success: true,
      message: "Event notification retrieved successfully",
      data: result,
    });
  });

  updateEventNotification = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.updateEventNotification({
      id: req.params.id,
      updateData: req.body,
    });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Event notification updated successfully",
      data: result,
    });
  });

  deleteEventNotification = asyncHandler(async (req, res) => {
    const result = await eventNotificationService.deleteEventNotification({
      id: req.params.id,
    });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Event notification deleted successfully",
      data: result,
    });
  });
}

export default new EventNotificationController();
