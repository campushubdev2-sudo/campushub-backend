import User from "../models/user.model.js";

class UserRepository {
  async findByIdentifier(identifier) {
    return User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");
  }

  findByUsername(username) {
    return User.findOne({ username });
  }

  findById(id) {
    return User.findById(id);
  }

  findByEmail(email) {
    return User.findOne({ email }).select("+password");
  }

  async countByRole(role) {
    return await User.countDocuments({ role });
  }

  async create(data) {
    const user = await User.create(data);
    return user.toObject();
  }

  async updateUserPassword(userId, hashedPassword) {
    return User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        passwordResetExpires: null,
        passwordResetToken: null,
      },
      { new: true },
    );
  }

  updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  deleteById(id) {
    return User.findByIdAndDelete(id);
  }

  /**
   * Paginated + filtered query
   */
  async findAll({ page, limit, filters }) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      User.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filters),
    ]);

    return { data, total };
  }

  /**
   * Dashboard stats
   */
  getOverviewStats() {
    return User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  getTotalUsers() {
    return User.countDocuments();
  }

  async findManyByIds(ids) {
    // Convert string IDs to ObjectId if needed
    return await User.find({
      _id: { $in: ids },
    });
  }
}

export default new UserRepository();
