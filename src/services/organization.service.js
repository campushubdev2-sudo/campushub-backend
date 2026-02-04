import organizationRepository from "../repositories/organization.repository.js";
import userRepository from "../repositories/user.repository.js";
import {
  createOrganizationSchema,
  getOrganizationsSchema,
  updateOrganizationSchema,
} from "../validations/organization.validation.js";
import { AppError } from "../middlewares/error.middleware.js";
import { mapOrganization } from "../utils/helper.js";
import auditLogRepository from "../repositories/audit-log.repository.js";

class OrganizationService {
  async createOrganization(payload) {
    const { error, value } = createOrganizationSchema.validate(payload);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { orgName, adviserId } = value;

    // Check if organization name already exists
    const existingOrg = await organizationRepository.findByName(orgName);
    if (existingOrg) {
      throw new AppError("Organization name already exists", 400);
    }

    // Check if Adviser (User) exists
    const adviserExists = await userRepository.findById(adviserId);
    if (!adviserExists) {
      throw new AppError("The assigned adviser does not exist", 404);
    }

    const created = await organizationRepository.create(value);
    const organization = await organizationRepository.findById(created._id);

    await auditLogRepository.create({
      userId: req.user.id,
      action: "org.create",
    });

    return mapOrganization(organization);
  }

  async getOrganization(id) {
    const organization = await organizationRepository.findById(id);
    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    await auditLogRepository.create({
      userId: req.user.id,
      action: "org.get",
    });

    return mapOrganization(organization);
  }

  async updateOrganization(id, payload) {
    const { error, value } = updateOrganizationSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const updatedOrg = await organizationRepository.updateById(id, value);
    if (!updatedOrg) {
      throw new AppError("Organization not found", 404);
    }

    await auditLogRepository.create({
      userId: req.user.id,
      action: "org.update",
    });

    return updatedOrg;
  }

  async deleteOrganization(id) {
    const deletedOrg = await organizationRepository.deleteById(id);
    if (!deletedOrg) {
      throw new AppError("Organization not found", 404);
    }

    await auditLogRepository.create({
      userId: req.user.id,
      action: "org.delete",
    });

    return deletedOrg;
  }

  async getAllOrganizations(query) {
    const { error, value } = getOrganizationsSchema.validate(query);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { page, limit, sort, fields, ...filter } = value;
    const skip = (page - 1) * limit;

    const organizations = await organizationRepository.findAll({
      filter,
      sort,
      skip,
      limit,
      fields: fields?.split(",").join(" "),
    });

    const total = await organizationRepository.count(filter);

    await auditLogRepository.create({
      userId: req.user.id,
      action: "org.list",
    });

    return {
      organizations: organizations.map(mapOrganization),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getGeneralStats() {
    const stats = await organizationRepository.getStats();
    const adviserStats = await organizationRepository.getAdviserStats();

    await auditLogRepository.create({
      userId: req.user.id,
      action: "org.stats.overview",
    });

    return {
      summary: stats[0] || { totalOrganizations: 0 },
      byAdviser: adviserStats,
    };
  }
}

export default new OrganizationService();
