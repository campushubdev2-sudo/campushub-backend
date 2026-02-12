import calendarEntryRepository from "../repositories/calendar-entry.repository.js";
import { createCalendarEntrySchema } from "../validations/calendar-entry.validation.js";
import { getCalendarEntriesSchema } from "../validations/calendar-entry.validation.js";
import { deleteCalendarEntrySchema } from "../validations/calendar-entry.validation.js";
import { updateCalendarEntrySchema } from "../validations/calendar-entry.validation.js";
import { AppError } from "../middlewares/error.middleware.js";
import schoolEventRepository from "../repositories/school-event.repository.js";
import userRepository from "../repositories/user.repository.js";
import auditLogRepository from "../repositories/audit-log.repository.js";

class CalendarEntryService {
  async createCalendarEntry(actorId, payload) {
    const { error, value } = createCalendarEntrySchema.validate(payload);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { eventId, createdBy } = value;

    const user = await userRepository.findById(createdBy);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const event = await schoolEventRepository.findById(eventId);
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const existingEntry = await calendarEntryRepository.findByUserAndEvent(
      createdBy,
      eventId,
    );
    if (existingEntry) {
      throw new AppError("Calendar entry already exists for this event", 409);
    }

    await calendarEntryRepository.create({
      eventId,
      createdBy,
    });
    // Get the populated entry for response
    const populatedEntry = await calendarEntryRepository.findByUserAndEvent(
      createdBy,
      eventId,
    );

    await auditLogRepository.create({
      userId: actorId,
      action: "Create Calendar Entry",
    });

    return {
      calendarEntry: populatedEntry,
      event,
    };
  }

  async getCalendarEntries(actorId, payload) {
    const { error, value } = getCalendarEntriesSchema.validate(payload);

    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      throw new AppError(message, 400);
    }

    const { page, limit, sortBy, order, eventId, createdBy } = value;

    const query = {};
    if (eventId) {
      query.eventId = eventId;
    }
    if (createdBy) {
      query.createdBy = createdBy;
    }

    const [items, total] = await Promise.all([
      calendarEntryRepository.findAll(query, {
        page,
        limit,
        sortBy,
        order: order === "asc" ? 1 : -1,
        populate: [
          { path: "eventId" },
          { path: "createdBy", select: "username role email" },
        ],
      }),
      calendarEntryRepository.count(query),
    ]);

    if (actorId) {
      await auditLogRepository.create({
        userId: actorId,
        action: "View Calendar Entries",
      });
    }

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCalendarEntryById(actorId, id) {
    const entry = await calendarEntryRepository.findById(id);
    if (!entry) {
      throw new AppError("Calendar entry not found", 404);
    }

    if (actorId) {
      await auditLogRepository.create({
        userId: actorId,
        action: "View Calendar Entry Details",
      });
    }

    return entry;
  }

  async updateCalendarEntry(actorId, id, payload) {
    const { error, value } = updateCalendarEntrySchema.validate(payload);

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      throw new AppError(messages.join(", "), 400);
    }

    const { eventId, createdBy } = value;

    const existingCalendarEntry = await calendarEntryRepository.findById(id);
    if (!existingCalendarEntry) {
      throw new AppError("Calendar entry not found", 404);
    }

    const eventExists = await schoolEventRepository.findById(eventId);
    if (!eventExists) {
      throw new AppError("School event not found", 404);
    }

    const userExists = await userRepository.findById(createdBy);
    if (!userExists) {
      throw new AppError("User not found", 404);
    }

    const existingEntryWithEvent =
      await calendarEntryRepository.findByEventId(eventId);
    if (
      existingEntryWithEvent &&
      existingEntryWithEvent._id.toString() !== id
    ) {
      throw new AppError("Event already exists in another calendar entry", 409);
    }

    const updatedCalendarEntry = await calendarEntryRepository.updateById(id, {
      eventId,
      createdBy,
    });

    await auditLogRepository.create({
      userId: actorId,
      action: "Update Calendar Entry",
    });

    return updatedCalendarEntry;
  }

  async deleteCalendarEntry(actorId, payload) {
    const { error, value } = deleteCalendarEntrySchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { id } = value;

    const existingEntry = await calendarEntryRepository.findById(id);
    if (!existingEntry) {
      throw new AppError("Calendar entry not found", 404);
    }

    const deletedEntry = await calendarEntryRepository.deleteById(id);

    await auditLogRepository.create({
      userId: actorId,
      action: "Delete Calendar Entry",
    });

    return deletedEntry;
  }

  async getStats(actorId) {
    await auditLogRepository.create({
      userId: actorId,
      action: "Calendar Statistics Overview",
    });

    return {
      total: await calendarEntryRepository.count(),
      byUser: await calendarEntryRepository.countByUser(),
      byEvent: await calendarEntryRepository.countByEvent(),
      overTime: await calendarEntryRepository.countOverTime(),
    };
  }
}

export default new CalendarEntryService();
