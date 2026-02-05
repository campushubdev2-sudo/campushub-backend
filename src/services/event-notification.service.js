import eventNotificationRepository from "../repositories/event-notification.repository.js";
import { createEventNotificationSchema } from "../validations/event-notification.validation.js";
import { createBulkEventNotificationSchema } from "../validations/event-notification.validation.js";
import { getEventNotificationByIdSchema } from "../validations/event-notification.validation.js";
import { getEventNotificationsSchema } from "../validations/event-notification.validation.js";
import { updateEventNotificationSchema } from "../validations/event-notification.validation.js";
import { eventNotificationIdSchema } from "../validations/event-notification.validation.js";
import { AppError } from "../middlewares/error.middleware.js";
import schoolEventRepository from "../repositories/school-event.repository.js";
import userRepository from "../repositories/user.repository.js";
import smsService from "./sms.service.js";
import auditLogRepository from "../repositories/audit-log.repository.js";

class EventNotificationService {
  async createEventNotification(actorId, payload) {
    const { error, value } = createEventNotificationSchema.validate(payload);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { eventId, recipientId, message, status } = value;

    const eventExists = await schoolEventRepository.findById(eventId);
    if (!eventExists) {
      throw new AppError("Event not found", 404);
    }

    // Validate that recipient exists and get user details
    const recipient = await userRepository.findById(recipientId);
    if (!recipient) {
      throw new AppError("Recipient not found", 404);
    }

    // Create notification record first
    const notification = await eventNotificationRepository.create({
      eventId,
      recipientId,
      message,
      status,
      sentAt: new Date(),
    });

    try {
      await smsService.sendSMS({
        to: recipient.phoneNumber,
        message,
      });

      await eventNotificationRepository.updateStatus(notification._id, "sent");
    } catch (smsError) {
      console.error("Failed to send SMS:", smsError);

      await eventNotificationRepository.updateStatus(
        notification._id,
        "failed",
      );
    }

    await auditLogRepository.create({
      userId: actorId,
      action: "notification.create",
    });

    return {
      id: notification._id,
      eventId: notification.eventId,
      recipientId: notification.recipientId,
      message: notification.message,
      status: notification.status,
      sentAt: notification.sentAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  async createBulkEventNotifications(actorId, payload) {
    const { error, value } =
      createBulkEventNotificationSchema.validate(payload);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { eventId, recipientIds, message, status } = value;

    const eventExists = await schoolEventRepository.findById(eventId);
    if (!eventExists) {
      throw new AppError("Event not found", 404);
    }

    const uniqueRecipientIds = [...new Set(recipientIds)];
    const users = await userRepository.findManyByIds(uniqueRecipientIds);

    if (users.length !== uniqueRecipientIds.length) {
      const foundIds = users.map((user) => user._id.toString());
      const missingIds = uniqueRecipientIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new AppError(
        `Some recipients not found: ${missingIds.join(", ")}`,
        404,
      );
    }

    const notificationsData = uniqueRecipientIds.map((recipientId) => ({
      eventId,
      recipientId,
      message,
      status,
      sentAt: new Date(),
    }));

    const existingNotifications =
      await eventNotificationRepository.findByEvent(eventId);
    const existingRecipientIds = existingNotifications.map((n) =>
      n.recipientId.toString(),
    );

    const newNotificationsData = notificationsData.filter(
      (notification) =>
        !existingRecipientIds.includes(notification.recipientId.toString()),
    );

    if (newNotificationsData.length === 0) {
      throw new AppError(
        "All recipients already have notifications for this event",
        409,
      );
    }

    const createdNotifications =
      await eventNotificationRepository.createMany(newNotificationsData);

    try {
      // Filter users who should receive SMS (those in newNotificationsData)
      const newRecipientUsers = users.filter((user) =>
        newNotificationsData.some(
          (notification) =>
            notification.recipientId.toString() === user._id.toString(),
        ),
      );

      // Send SMS to each recipient
      for (const user of newRecipientUsers) {
        if (user.phoneNumber) {
          await smsService.sendSMS({
            to: user.phoneNumber,
            message,
          });
        }
      }

      // Update notification status or log SMS delivery
      await eventNotificationRepository.updateManyStatus(
        createdNotifications.map((n) => n._id),
        "sent",
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error("Failed to send SMS notifications:", error);
    }

    const sanitizedNotifications = createdNotifications.map((notification) => ({
      id: notification._id,
      eventId: notification.eventId,
      recipientId: notification.recipientId,
      message: notification.message,
      status: notification.status,
      sentAt: notification.sentAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    }));

    await auditLogRepository.create({
      userId: actorId,
      action: "notification.bulk-create",
    });

    return {
      totalRecipients: uniqueRecipientIds.length,
      skippedDuplicates: notificationsData.length - newNotificationsData.length,
      notificationsCreated: sanitizedNotifications.length,
      notifications: sanitizedNotifications,
    };
  }

  async getAllEventNotifications(actorId, queryParams) {
    // Validate query parameters
    const { error, value } = getEventNotificationsSchema.validate(queryParams);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400); // message: string, statusCode: number
    }

    const { eventId, recipientId, status, sortBy, order, fields, limit, page } =
      value;

    // Additional business logic validations
    if (fields) {
      const allowedFields = [
        "eventId",
        "recipientId",
        "message",
        "sentAt",
        "status",
        "createdAt",
        "updatedAt",
      ];
      const requestedFields = fields.split(",").map((f) => f.trim());
      const invalidFields = requestedFields.filter(
        (field) => !allowedFields.includes(field),
      );

      if (invalidFields.length > 0) {
        throw new AppError(
          `Invalid field(s) requested: ${invalidFields.join(", ")}. Allowed fields: ${allowedFields.join(", ")}`,
          400,
        );
      }
    }

    // Call repository method
    const result = await eventNotificationRepository.findAllWithFilters({
      eventId,
      recipientId,
      status,
      sortBy,
      order,
      fields,
      limit,
      page,
    });

    await auditLogRepository.create({
      userId: actorId,
      action: "notification.list",
    });

    // Return sanitized data
    return result;
  }

  async getEventNotificationById(actorId, notificationId) {
    // Validate notification ID
    const { error, value } = getEventNotificationByIdSchema.validate({
      id: notificationId,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400); // message: string, statusCode: number
    }

    const { id } = value;

    // Call repository method to find notification by ID
    const notification = await eventNotificationRepository.findById(id);

    // Additional validation - check if notification exists
    if (!notification) {
      throw new AppError("Event notification not found", 404);
    }

    await auditLogRepository.create({
      userId: actorId,
      action: "notification.detail",
    });

    // Return sanitized data
    return notification;
  }

  async updateEventNotification(actorId, payload) {
    const { error: idError, value: idValue } =
      eventNotificationIdSchema.validate({
        id: payload.id,
      });

    if (idError) {
      const messages = idError.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { error, value } = updateEventNotificationSchema.validate(
      payload.updateData,
    );

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { message, status } = value;

    if (!message && !status) {
      throw new AppError(
        "At least one field (message or status) is required for update",
        400,
      );
    }

    const existingNotification = await eventNotificationRepository.findById(
      idValue.id,
    );
    if (!existingNotification) {
      throw new AppError("Event notification not found", 404);
    }

    const updateData = {};
    if (message) {
      updateData.message = message;
    }
    if (status) {
      updateData.status = status;
    }

    const updatedNotification = await eventNotificationRepository.updateById(
      idValue.id,
      updateData,
    );

    const populatedNotification =
      await eventNotificationRepository.findByIdWithEventAndRecipient(
        updatedNotification._id,
      );

    await auditLogRepository.create({
      userId: actorId,
      action: "notification.update",
    });

    return populatedNotification;
  }

  async deleteEventNotification(actorId, payload) {
    const { error, value } = eventNotificationIdSchema.validate(payload);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { id } = value;

    const existingNotification = await eventNotificationRepository.findById(id);
    if (!existingNotification) {
      throw new AppError("Event notification not found", 404);
    }

    const deletedNotification =
      await eventNotificationRepository.deleteById(id);

    const notificationData = {
      _id: deletedNotification._id,
      eventId: deletedNotification.eventId,
      recipientId: deletedNotification.recipientId,
      message: deletedNotification.message,
      status: deletedNotification.status,
      sentAt: deletedNotification.sentAt,
    };

    await auditLogRepository.create({
      userId: actorId,
      action: "notification.delete",
    });

    return notificationData;
  }

  async getOverallStats(actorId) {
    await auditLogRepository.create({
      userId: actorId,
      action: "notification.stats.overall",
    });

    return await eventNotificationRepository.getOverallStats();
  }

  async getEventStats(actorId, eventId) {
    await auditLogRepository.create({
      userId: actorId,
      action: "notification.stats",
    });

    return await eventNotificationRepository.getEventStats(eventId);
  }
}

export default new EventNotificationService();
