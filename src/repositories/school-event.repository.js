import { AppError } from "../middlewares/error.middleware.js";
import SchoolEvent from "../models/school-event.model.js";

class SchoolEventRepository {
  async create(payload) {
    return await SchoolEvent.create(payload);
  }

  async findAll({ filter, options }) {
    const { page = 1, limit = 10, type = "all" } = options;
    const skip = (page - 1) * limit;
    const now = new Date();

    const dateFilter = filter.date ? { ...filter.date } : {};

    if (type === "upcoming") {
      dateFilter.$gte = dateFilter.$gte
        ? new Date(Math.max(dateFilter.$gte, now))
        : now;
    } else if (type === "past") {
      dateFilter.$lt = dateFilter.$lt
        ? new Date(Math.min(dateFilter.$lt, now))
        : now;
    }

    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    } else {
      delete filter.date;
    }

    let sortOption = { date: 1 };

    if (type === "upcoming") {
      sortOption = { date: 1 };
    } else if (type === "past") {
      sortOption = { date: -1 };
    }

    const [events, total] = await Promise.all([
      SchoolEvent.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      SchoolEvent.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    if (page > totalPages) {
      throw new AppError(
        `Invalid page number. Maximum page is ${totalPages}.`,
        400,
      );
    }

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id) {
    return await SchoolEvent.findById(id).lean();
  }

  async deleteById(id) {
    return await SchoolEvent.findByIdAndDelete(id);
  }

  async updateById(id, updateData) {
    return await SchoolEvent.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();
  }

  async findByDateRange(startDate, endDate) {
    return await SchoolEvent.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: 1 });
  }

  async getEventStats() {
    const stats = await SchoolEvent.aggregate([
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          upcomingEvents: {
            $sum: {
              $cond: [{ $gte: ["$date", new Date()] }, 1, 0],
            },
          },
          pastEvents: {
            $sum: {
              $cond: [{ $lt: ["$date", new Date()] }, 1, 0],
            },
          },
          byAdmin: {
            $sum: {
              $cond: [{ $eq: ["$organizedBy", "admin"] }, 1, 0],
            },
          },
          byDepartment: {
            $sum: {
              $cond: [{ $eq: ["$organizedBy", "department"] }, 1, 0],
            },
          },
          firstEventDate: { $min: "$date" },
          lastEventDate: { $max: "$date" },
        },
      },
      {
        $project: {
          _id: 0,
          totalEvents: 1,
          upcomingEvents: 1,
          pastEvents: 1,
          organizerBreakdown: {
            admin: "$byAdmin",
            department: "$byDepartment",
          },
          dateRange: {
            firstEvent: "$firstEventDate",
            lastEvent: "$lastEventDate",
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalEvents: 0,
        upcomingEvents: 0,
        pastEvents: 0,
        organizerBreakdown: { admin: 0, department: 0 },
        dateRange: { firstEvent: null, lastEvent: null },
      }
    );
  }

  async getMonthlyEventCount(year) {
    return await SchoolEvent.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
          events: {
            $push: {
              title: "$title",
              date: "$date",
              organizedBy: "$organizedBy",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          events: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getVenueStats() {
    return await SchoolEvent.aggregate([
      {
        $group: {
          _id: "$venue",
          eventCount: { $sum: 1 },
          upcomingCount: {
            $sum: {
              $cond: [{ $gte: ["$date", new Date()] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { eventCount: -1 },
      },
      {
        $project: {
          venue: "$_id",
          eventCount: 1,
          upcomingCount: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getRecentEvents(limit = 5) {
    return await SchoolEvent.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title date venue organizedBy");
  }
}

export default new SchoolEventRepository();
