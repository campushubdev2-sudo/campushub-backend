import CalendarEntry from "../models/calendar-entry.model.js";

class CalendarEntryRepository {
  async create(payload) {
    return await CalendarEntry.create(payload);
  }

  async findByUserAndEvent(userId, eventId) {
    return await CalendarEntry.findOne({
      createdBy: userId,
      eventId,
    }).lean();
  }

  async findByUser(userId) {
    return await CalendarEntry.find({ createdBy: userId })
      .populate("eventId")
      .lean();
  }

  async findById(id) {
    return await CalendarEntry.findById(id).lean();
  }

  async findByEventId(eventId) {
    return await CalendarEntry.findOne({ eventId });
  }

  async updateById(id, updateData) {
    return await CalendarEntry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("eventId")
      .populate("createdBy")
      .lean();
  }

  async deleteById(id) {
    return await CalendarEntry.findByIdAndDelete(id);
  }

  async findAll(query, options) {
    const { page, limit, sortBy, order, populate } = options;

    const skip = (page - 1) * limit;

    return CalendarEntry.find(query)
      .populate(populate)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);
  }

  async count(query) {
    return CalendarEntry.countDocuments(query);
  }

  countByUser() {
    return CalendarEntry.aggregate([
      { $group: { _id: "$createdBy", total: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          username: "$user.username",
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  countByEvent() {
    return CalendarEntry.aggregate([
      { $group: { _id: "$eventId", total: { $sum: 1 } } },
      {
        $lookup: {
          from: "schoolevents",
          localField: "_id",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $project: {
          _id: 0,
          eventId: "$event._id",
          title: "$event.title",
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  countOverTime() {
    return CalendarEntry.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  }
}

export default new CalendarEntryRepository();
