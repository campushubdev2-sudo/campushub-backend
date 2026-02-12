// src/services/school-event.service.js
import { createSchoolEventSchema } from "../validations/school-event.validation.js";
import { getAllSchoolEventsSchema } from "../validations/school-event.validation.js";
import { getSchoolEventByIdSchema } from "../validations/school-event.validation.js";
import { filterEventsSchema } from "../validations/school-event.validation.js";
import { getMonthlyStatsSchema } from "../validations/school-event.validation.js";
import { getRecentEventsSchema } from "../validations/school-event.validation.js";
import { updateEventSchema } from "../validations/school-event.validation.js";
import { deleteSchoolEventSchema } from "../validations/school-event.validation.js";
import { filteredUpdateSchema } from "../validations/school-event.validation.js";
import SchoolEventRepository from "../repositories/school-event.repository.js";
import { AppError } from "../middlewares/error.middleware.js";
import { buildFilterFromQuery } from "../utils/buildFilter.js";
import auditLogRepository from "../repositories/audit-log.repository.js";

class SchoolEventService {
  async createSchoolEvent(actorId, payload) {
    const { error, value } = createSchoolEventSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { title, description, date, venue, organizedBy } = value;

    if (new Date(date) < new Date()) {
      throw new AppError("Event date cannot be in the past", 400);
    }

    const event = await SchoolEventRepository.create({
      title,
      description,
      date,
      venue,
      organizedBy,
    });

    await auditLogRepository.create({
      userId: actorId,
      action: "Create Event",
    });

    return event;
  }

  async getAllEvents(actorId, payload) {
    const { error, value } = getAllSchoolEventsSchema.validate(payload);

    if (error) {
      const message = error.details.map((detail) => detail.message);
      throw new AppError(message, 400);
    }

    const result = SchoolEventRepository.findAll({
      filter: buildFilterFromQuery(value),
      options: value,
    });

    await auditLogRepository.create({
      userId: actorId,
      action: "View Events",
    });

    return result;
  }

  async getSchoolEventById(actorId, payload) {
    const { error, value } = getSchoolEventByIdSchema.validate(payload);

    if (error) {
      const message = error.details.map((d) => d.message);
      throw new AppError(message, 400);
    }

    const { id } = value;

    const event = await SchoolEventRepository.findById(id);

    if (!event) {
      throw new AppError("School event not found", 404);
    }

    await auditLogRepository.create({
      userId: actorId,
      action: "View Event Details",
    });

    return event;
  }

  async filterEventsByDate(actorId, payload) {
    const { error, value } = filterEventsSchema.validate(payload);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { startDate, endDate } = value;

    // Validate date range logic
    if (new Date(endDate) < new Date(startDate)) {
      throw new AppError("End date cannot be earlier than start date", 400);
    }

    const events = await SchoolEventRepository.findByDateRange(
      startDate,
      endDate,
    );

    await auditLogRepository.create({
      userId: actorId,
      action: "Filter Events by Date Range",
    });

    return events;
  }

  async getEventStats(actorId) {
    const stats = await SchoolEventRepository.getEventStats();

    await auditLogRepository.create({
      userId: actorId,
      action: "Event Statistics Overview",
    });

    return stats;
  }

  async getMonthlyEventCount(actorId, payload) {
    const { error, value } = getMonthlyStatsSchema.validate(payload);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { year } = value;
    const monthlyStats = await SchoolEventRepository.getMonthlyEventCount(year);

    // Format to ensure all months are present
    const formattedStats = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyStats.find((stat) => stat.month === i + 1);
      return {
        month: i + 1,
        monthName: new Date(2000, i).toLocaleString("default", {
          month: "long",
        }),
        count: monthData ? monthData.count : 0,
        events: monthData ? monthData.events : [],
      };
    });

    await auditLogRepository.create({
      userId: actorId,
      action: "Monthly Event Statistics",
    });

    return {
      year,
      monthlyStats: formattedStats,
    };
  }

  async getVenueStats(actorId) {
    const venueStats = await SchoolEventRepository.getVenueStats();

    await auditLogRepository.create({
      userId: actorId,
      action: "Event Statistics by Venue",
    });

    return venueStats;
  }

  async getRecentEvents(actorId, payload) {
    const { error, value } = getRecentEventsSchema.validate(payload);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { limit } = value;
    const recentEvents = await SchoolEventRepository.getRecentEvents(limit);

    await auditLogRepository.create({
      userId: actorId,
      action: "View Recent Events",
    });

    return recentEvents;
  }

  async updateEvent(actorId, id, payload, options = {}) {
    const { restrictFields = true, allowPastDates = false } = options;

    if (restrictFields) {
      const allowedUpdates = ["title", "description", "date", "venue"];
      const payloadKeys = Object.keys(payload);

      const invalidFields = payloadKeys.filter(
        (key) => !allowedUpdates.includes(key),
      );

      if (invalidFields.length > 0) {
        throw new AppError(
          `The following fields cannot be updated: ${invalidFields.join(", ")}`,
          400,
        );
      }

      const hasAllowedField = payloadKeys.some((key) =>
        allowedUpdates.includes(key),
      );
      if (!hasAllowedField) {
        throw new AppError(
          "At least one valid field must be provided for update",
          400,
        );
      }
    }

    const { error, value } = restrictFields
      ? filteredUpdateSchema.validate(payload)
      : updateEventSchema.validate(payload);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const existingEvent = await SchoolEventRepository.findById(id);
    if (!existingEvent) {
      throw new AppError("School event not found", 404);
    }

    // Check if date is being updated and validate it's not in the past
    if (value.date && !allowPastDates) {
      const currentDate = new Date();
      const eventDate = new Date(value.date);

      if (eventDate < currentDate) {
        throw new AppError("Cannot update event to a past date", 400);
      }
    }

    const updatedEvent = await SchoolEventRepository.updateById(id, value);

    await auditLogRepository.create({
      userId: actorId,
      action: "Update Event",
    });

    return updatedEvent;
  }

  async deleteSchoolEvent(actorId, id) {
    const { error, value } = deleteSchoolEventSchema.validate({ id });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { id: eventId } = value;

    const existingEvent = await SchoolEventRepository.findById(eventId);
    if (!existingEvent) {
      throw new AppError("School event not found", 404);
    }

    const deletedEvent = await SchoolEventRepository.deleteById(eventId);

    await auditLogRepository.create({
      userId: actorId,
      action: "Delete Event",
    });

    return deletedEvent;
  }
}

export default new SchoolEventService();
