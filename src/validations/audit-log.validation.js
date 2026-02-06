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

const getAuditLogByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "Audit log ID must be a valid ObjectId",
    "string.length": "Audit log ID must be 24 characters",
    "any.required": "Audit log ID is required",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const deleteAuditLogSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.length": "Audit log ID must be a valid ObjectId",
    "any.required": "Audit log ID is required",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export { getAuditLogsSchema, getAuditLogByIdSchema, deleteAuditLogSchema };
