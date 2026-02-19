// @ts-check
import Joi from "joi";
import { ACTION_TYPES } from "../constants/action-types.js";

/**
 * @typedef {Object} GetAuditLogsQuery
 * @property {string} [userId] - 24 character hex string (MongoDB ObjectId)
 * @property {string} [action] - One of the supported ACTION_TYPES
 * @property {string} [sort] - Sorting string
 * @property {string} [fields] - Fields selection string
 */

/**
 * @typedef {Object} AuditLogIdParam
 * @property {string} id - 24 character hex string (MongoDB ObjectId)
 */

/** @type {Joi.ObjectSchema<GetAuditLogsQuery>} */
const getAuditLogsSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional().messages({
    "string.base": "User ID must be a string.",
    "string.hex": "User ID must be a valid hexadecimal string.",
    "string.length": "User ID must be exactly 24 characters long.",
  }),
  action: Joi.string()
    .valid(...ACTION_TYPES)
    .optional()
    .messages({
      "string.base": "Action must be a string.",
      "any.only": "Action is not valid. Please select a supported action type.",
    }),
  sort: Joi.string().optional().messages({
    "string.base": "Sort parameter must be a string.",
  }),
  fields: Joi.string().optional().messages({
    "string.base": "Fields parameter must be a string.",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/** @type {Joi.ObjectSchema<AuditLogIdParam>} */
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

/** @type {Joi.ObjectSchema<AuditLogIdParam>} */
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
