import Organization from "../models/organization.model.js";

class OrganizationRepository {
  async create(data) {
    return await Organization.create(data);
  }

  async findByName(orgName) {
    return await Organization.findOne({ orgName }).lean();
  }

  async findById(id) {
    return await Organization.findById(id)
      .populate("adviserId", "username")
      .lean();
  }

  async updateById(id, data) {
    return await Organization.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return await Organization.findByIdAndDelete(id);
  }

  async findAll({ filter, sort, skip, limit, fields }) {
    return await Organization.find(filter)
      .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("adviserId", "username")
      .lean();
  }

  async count(filter) {
    return await Organization.countDocuments(filter);
  }

  async getStats() {
    return await Organization.aggregate([
      {
        $group: {
          _id: null,
          totalOrganizations: { $sum: 1 },
          avgDescriptionLength: { $avg: { $strLenCP: "$description" } },
        },
      },
      {
        $project: { _id: 0 },
      },
    ]);
  }

  async getAdviserStats() {
    return await Organization.aggregate([
      {
        $group: {
          _id: "$adviserId",
          managedOrgs: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "adviserDetails",
        },
      },
      { $unwind: "$adviserDetails" },
      {
        $project: {
          _id: 0,
          adviserName: "$adviserDetails.username",
          managedOrgs: 1,
        },
      },
    ]);
  }
}

export default new OrganizationRepository();
