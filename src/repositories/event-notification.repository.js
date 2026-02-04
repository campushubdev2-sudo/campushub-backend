import EventNotification from "../models/event-notification.model.js";
import mongoose from "mongoose";

class EventNotificationRepository {
  async create(notificationData) {
    return await EventNotification.create(notificationData);
  }

  async count() {
    return await EventNotification.countDocuments();
  }

  async countByStatus(status = null) {
    const query = status ? { status } : {};
    return await EventNotification.countDocuments(query);
  }

  // STATS RELATED FUNCTIONS
  async getOverallStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, read, sent, todayCount, hourlyDistribution] =
      await Promise.all([
        EventNotification.countDocuments(),
        EventNotification.countDocuments({ status: "read" }),
        EventNotification.countDocuments({ status: "sent" }),
        EventNotification.countDocuments({ sentAt: { $gte: today } }),
        EventNotification.aggregate([
          { $match: { sentAt: { $gte: today } } },
          {
            $group: {
              _id: { $hour: "$sentAt" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    return {
      total,
      read,
      sent,
      today: todayCount,
      readRate: total > 0 ? (read / total) * 100 : 0,
      hourlyDistribution,
    };
  }

  async getEventStats(eventId) {
    const stats = await EventNotification.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { eventId, total: 0, read: 0, sent: 0 };

    stats.forEach(({ _id, count }) => {
      result.total += count;
      if (_id === "read") {
        result.read = count;
      }
      if (_id === "sent") {
        result.sent = count;
      }
    });

    result.readRate = result.total > 0 ? (result.read / result.total) * 100 : 0;

    return result;
  }

  async getUserStats(userId) {
    const [data] = await EventNotification.aggregate([
      { $match: { recipientId: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          statusSummary: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          recentActivity: [
            { $sort: { sentAt: -1 } },
            { $limit: 10 },
            {
              $project: {
                eventId: 1,
                status: 1,
                sentAt: 1,
                message: { $substr: ["$message", 0, 50] },
              },
            },
          ],
          dailyTrends: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$sentAt" },
                },
                total: { $sum: 1 },
                read: {
                  $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] },
                },
              },
            },
            { $sort: { _id: -1 } },
            { $limit: 30 },
          ],
        },
      },
    ]);

    const result = {
      userId,
      total: 0,
      read: 0,
      sent: 0,
      recentNotifications: data.recentActivity,
      dailyTrends: data.dailyTrends,
    };

    data.statusSummary.forEach(({ _id, count }) => {
      result.total += count;
      if (_id === "read") {
        result.read = count;
      }
      if (_id === "sent") {
        result.sent = count;
      }
    });

    result.readRate = result.total > 0 ? (result.read / result.total) * 100 : 0;

    return result;
  }

  async getTimeSeriesStats(days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return EventNotification.aggregate([
      { $match: { sentAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$sentAt" },
          },
          total: { $sum: 1 },
          read: {
            $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] },
          },
          sent: {
            $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          total: 1,
          read: 1,
          sent: 1,
          readRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$read", "$total"] }, 100] },
            ],
          },
        },
      },
    ]);
  }

  async getTopEvents(limit = 10) {
    return EventNotification.aggregate([
      {
        $group: {
          _id: "$eventId",
          total: { $sum: 1 },
          read: {
            $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] },
          },
          sent: {
            $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "schoolevents",
          localField: "_id",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          eventId: "$_id",
          eventName: "$event.title",
          total: 1,
          read: 1,
          sent: 1,
          readRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$read", "$total"] }, 100] },
            ],
          },
        },
      },
    ]);
  }

  async getDeliveryPerformance() {
    return EventNotification.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$sentAt" } },
          total: { $sum: 1 },
          readWithinHour: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "read"] },
                    {
                      $lte: [{ $subtract: ["$updatedAt", "$sentAt"] }, 3600000],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          readWithinDay: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "read"] },
                    {
                      $lte: [
                        { $subtract: ["$updatedAt", "$sentAt"] },
                        86400000,
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
      {
        $project: {
          month: "$_id",
          total: 1,
          readWithinHour: 1,
          readWithinDay: 1,
          hourReadRate: {
            $multiply: [{ $divide: ["$readWithinHour", "$total"] }, 100],
          },
          dayReadRate: {
            $multiply: [{ $divide: ["$readWithinDay", "$total"] }, 100],
          },
        },
      },
    ]);
  }

  async createMany(notificationsData) {
    return await EventNotification.insertMany(notificationsData);
  }

  async findById(id) {
    return await EventNotification.findById(id)
      .populate("eventId", "title date venue")
      .populate("recipientId", "username email role");
  }

  async findAllWithFilters(queryParams) {
    const {
      eventId,
      recipientId,
      status,
      sortBy = "sentAt",
      order = "desc",
      fields,
      limit = 10,
      page = 1,
    } = queryParams;

    // Build filter object
    const filter = {};

    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      filter.eventId = eventId;
    }

    if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
      filter.recipientId = recipientId;
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    // Build projection
    const projection = fields
      ? fields.split(",").reduce((acc, field) => {
          acc[field.trim()] = 1;
          return acc;
        }, {})
      : {};

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await EventNotification.find(filter)
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("eventId", "title date venue")
      .populate("recipientId", "username email role");

    const total = await EventNotification.countDocuments(filter);

    return {
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findByRecipient(recipientId) {
    return await EventNotification.find({ recipientId }).lean();
  }

  async findByEvent(eventId) {
    return await EventNotification.find({ eventId }).populate("recipientId");
  }

  async updateById(id, updateData) {
    return await EventNotification.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async findByIdWithEvent(id) {
    return await EventNotification.findById(id).populate(
      "eventId",
      "title date",
    );
  }

  async findByIdWithEventAndRecipient(id) {
    return await EventNotification.findById(id)
      .populate("eventId", "title date venue")
      .populate("recipientId", "username email role");
  }

  async deleteById(id) {
    return await EventNotification.findByIdAndDelete(id);
  }

  async findByEventAndRecipient(eventId, recipientId) {
    return await EventNotification.findOne({ eventId, recipientId });
  }

  async updateStatus(id, status) {
    return await EventNotification.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
  }

  async delete(id) {
    return await EventNotification.findByIdAndDelete(id);
  }

  async updateManyStatus(ids = [], status) {
    if (!ids.length) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    return await EventNotification.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status,
          sentAt: status === "sent" ? new Date() : undefined,
        },
      },
    );
  }
}

export default new EventNotificationRepository();
