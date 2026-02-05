import { AppError } from "../middlewares/error.middleware.js";
import userRepository from "../repositories/user.repository.js";
import authService from "./auth.service.js";
import { createUserSchema } from "../validations/user.validation.js";
import { queryUsersSchema } from "../validations/user.validation.js";
import { updateUserSchema } from "../validations/user.validation.js";
import { userIdParamSchema } from "../validations/user.validation.js";
import auditLogRepository from "../repositories/audit-log.repository.js";

class UserService {
  async createUser(actorId, payload) {
    const { error, value } = createUserSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { username, email, password, role, phoneNumber } = value;

    if (await userRepository.findByUsername(username)) {
      throw new AppError("Username already exists", 409);
    }

    if (await userRepository.findByEmail(email)) {
      throw new AppError("Email already exists", 409);
    }

    const hashedPassword = await authService.hashPassword(password);

    const user = await userRepository.create({
      username,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    delete user.password;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;

    await auditLogRepository.create({
      userId: actorId,
      action: "user.create",
    });

    return user;
  }

  async getUsers(actorId, query) {
    const { error, value } = queryUsersSchema.validate(query);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { page, limit, email, username, role, phoneNumber } = value;
    const filters = {};

    if (email) {
      filters.email = new RegExp(email, "i");
    }
    if (username) {
      filters.username = new RegExp(username, "i");
    }
    if (role) {
      filters.role = role;
    }
    if (phoneNumber) {
      filters.phoneNumber = phoneNumber;
    }

    await auditLogRepository.create({
      userId: actorId,
      action: "user.list",
    });

    return userRepository.findAll({
      page,
      limit,
      filters,
    });
  }

  async getUserById(userId, actorId) {
    const { error } = userIdParamSchema.validate({ id: userId });
    if (error) {
      throw new AppError("Invalid user id", 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await auditLogRepository.create({
      userId: actorId,
      action: "user.detail",
    });


    return user;
  }

  async updateUser(actorId, id, payload) {
    const { error: idError } = userIdParamSchema.validate({ id });
    if (idError) {
      throw new AppError("Invalid user id", 400);
    }

    const { error, value } = updateUserSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    // prevent updating last admin to non-admin
    if (existingUser.role === "admin" && value.role && value.role !== "admin") {
      const adminCount = await userRepository.countByRole("admin");
      if (adminCount === 1) {
        throw new AppError("Cannot update the last admin", 403);
      }
    }
    const updatedUser = await userRepository.updateById(id, value);

    await auditLogRepository.create({
      userId: actorId,
      action: "user.update",
    });

    return updatedUser;
  }

  async deleteUser(actorId, id) {
    const { error } = userIdParamSchema.validate({ id });
    if (error) {
      throw new AppError("Invalid user id", 400);
    }
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role === "admin") {
      const adminCount = await userRepository.countByRole("admin");
      if (adminCount === 1) {
        throw new AppError("Cannot delete the last admin", 403);
      }
    }

    await userRepository.deleteById(id);

    await auditLogRepository.create({
      userId: actorId,
      action: "user.delete",
    });


    return true;
  }

  /**
   * Dashboard
   */
  async getDashboardStats(actorId) {
    const [totalUsers, byRole] = await Promise.all([
      userRepository.getTotalUsers(),
      userRepository.getOverviewStats(),
    ]);

    await auditLogRepository.create({
      userId: actorId, 
      action: "user.stats.overview",
    });

    return {
      totalUsers,
      usersByRole: byRole.reduce((acc, r) => {
        acc[r._id] = r.count;
        return acc;
      }, {}),
    };
  }
}

export default new UserService();
