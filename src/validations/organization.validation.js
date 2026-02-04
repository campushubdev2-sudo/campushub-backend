import Joi from "joi";

const createOrganizationSchema = Joi.object({
  orgName: Joi.string().max(100).required().trim(),
  // description: Joi.string().max(2000).allow("", null),
  description: Joi.string()
    .max(2000)
    .trim()
    .empty("")
    .default("This organization has no description yet."),
  adviserId: Joi.string().hex().length(24).required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const getOrganizationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().default("-createdAt"),
  fields: Joi.string(),
  orgName: Joi.string(),
  adviserId: Joi.string().hex().length(24),
}).options({
  abortEarly: false,
  stripUnknown: true, // Strips fields not defined in schema [cite: 2]
});

const updateOrganizationSchema = Joi.object({
  orgName: Joi.string().max(100).trim(),
  description: Joi.string().max(2000),
  adviserId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid Adviser ID format",
    }),
})
  .min(1) // at least one value must be updated
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

export {
  createOrganizationSchema,
  getOrganizationsSchema,
  updateOrganizationSchema,
};
