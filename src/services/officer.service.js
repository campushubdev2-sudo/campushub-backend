import officerRepository from "../repositories/officer.repository.js";
import {
  createOfficerSchema,
  getOfficersSchema,
  getOfficerByIdSchema,
  updateOfficerSchema,
  deleteOfficerSchema,
  getOfficersNearTermEndSchema,
  getOfficersStatsByPeriodSchema,
} from "../validations/officer.validation.js";
import { AppError } from "../middlewares/error.middleware.js";
import userRepository from "../repositories/user.repository.js";
import organizationRepository from "../repositories/organization.repository.js";

class OfficerService {
  async createOfficer(payload) {
    const { error, value } = createOfficerSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message);
      throw new AppError(message, 400);
    }

    const { userId, orgId, position, startTerm, endTerm } = value;

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const organization = await organizationRepository.findById(orgId);
    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    const existingOfficer = await officerRepository.findByUserAndOrg(
      userId,
      orgId,
    );

    if (existingOfficer) {
      throw new AppError(
        "User is already an officer of this organization",
        409,
      );
    }

    const officer = await officerRepository.create({
      userId,
      orgId,
      position,
      startTerm,
      endTerm,
    });

    return officer;
  }

  async deleteOfficerById(payload) {
    const { error, value } = deleteOfficerSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { id } = value;

    const officerExists = await officerRepository.checkOfficerExists(id);
    if (!officerExists) {
      throw new AppError("Officer not found", 404);
    }

    const officer = await officerRepository.findById(id);

    const deletedOfficer = await officerRepository.deleteOfficerById(id);

    if (!deletedOfficer) {
      throw new AppError("Failed to delete officer", 500);
    }
    return officer;
  }

  async getOfficers(query) {
    const { error, value } = getOfficersSchema.validate(query);
    if (error) {
      const message = error.details.map((d) => d.message);
      throw new AppError(message, 400);
    }

    const { orgId, userId, position, page, limit, sortBy, order } = value;

    const filter = {};
    if (orgId) {
      filter.orgId = orgId;
    }
    if (userId) {
      filter.userId = userId;
    }
    if (position) {
      filter.position = position;
    }

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;

    const { items, total } = await officerRepository.findAll({
      filter,
      sort,
      skip,
      limit,
    });

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

  async getOfficerById(params) {
    const { error, value } = getOfficerByIdSchema.validate(params);
    if (error) {
      const message = error.details.map((detail) => detail.message);
      throw new AppError(message, 400);
    }

    const { id } = value;

    const officer = await officerRepository.findById(id);
    if (!officer) {
      throw new AppError("Officer not found", 404);
    }

    return officer;
  }

  async updateOfficer(id, payload) {
    const { error, value } = updateOfficerSchema.validate(payload);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const existingOfficer = await officerRepository.findById(id);
    if (!existingOfficer) {
      throw new AppError("Officer not found", 404);
    }

    if (value.userId && value.userId !== existingOfficer.userId.toString()) {
      throw new AppError("User ID cannot be updated", 400);
    }

    if (value.orgId && value.orgId !== existingOfficer.orgId.toString()) {
      throw new AppError("Organization ID cannot be updated", 400);
    }

    if (value.startTerm && value.startTerm > existingOfficer.startTerm) {
      throw new AppError(
        "Cannot set start term after it has already begun",
        400,
      );
    }

    if (value.endTerm && value.endTerm < existingOfficer.endTerm) {
      throw new AppError("Cannot shorten end term past the existing date", 400);
    }

    const startTermToCompare = value.startTerm || existingOfficer.startTerm;
    if (value.endTerm && value.endTerm <= startTermToCompare) {
      throw new AppError("End term must be after start term", 400);
    }

    const updatedOfficer = await officerRepository.updateById(id, value);
    return updatedOfficer;
  }

  async getOfficerStats() {
    const [
      totalOfficers,
      activeOfficers,
      inactiveOfficers,
      byOrganization,
      byPosition,
      termStats,
    ] = await Promise.all([
      officerRepository.getTotalOfficersCount(),
      officerRepository.getActiveOfficersCount(),
      officerRepository.getInactiveOfficersCount(),
      officerRepository.getOfficersCountByOrganization(),
      officerRepository.getOfficersByPosition(),
      officerRepository.getTermDurationStats(),
    ]);

    return {
      summary: {
        totalOfficers,
        activeOfficers,
        inactiveOfficers,
      },
      distribution: {
        byOrganization,
        byPosition,
      },
      termDuration: termStats[0] || {},
    };
  }

  async getOfficersByPeriod(payload) {
    const { error, value } = getOfficersStatsByPeriodSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { period } = value;
    const result = await officerRepository.getOfficersByTimePeriod(period);

    return {
      period,
      data: result,
    };
  }

  async getOfficersDetailed() {
    return await officerRepository.getOfficersWithUserDetails();
  }

  async getOfficersNearTermEnd(payload) {
    const { error, value } = getOfficersNearTermEndSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { days } = value;
    const result = await officerRepository.getOfficersNearTermEnd(days);

    return {
      days,
      count: result.length,
      officers: result,
    };
  }

  async getOrganizationOfficerStats(orgId) {
    // Validate orgId
    if (!orgId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("Invalid organization ID format", 400);
    }

    const result = await officerRepository.getOrganizationOfficerStats(orgId);
    if (!result) {
      throw new AppError("Organization not found", 404);
    }

    return {
      organization: {
        id: orgId,
        name: result.organization.orgName,
      },
      statistics: result.statistics,
    };
  }
}

export default new OfficerService();
