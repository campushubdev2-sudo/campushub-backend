import Joi from "joi";
import { ACTION_TYPES } from "../constants/action-types.js";

const getAuditLogsSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  action: Joi.string()
    .valid(...ACTION_TYPES)
    .optional(),
  sort: Joi.string().optional(), // e.g. -createdAt
  fields: Joi.string().optional(), // e.g. action,createdAt
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export { getAuditLogsSchema };
