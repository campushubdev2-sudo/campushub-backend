import Joi from "joi";

const createCalendarEntrySchema = Joi.object({
  eventId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Event ID must be a valid hexadecimal string",
    "string.length": "Event ID must be exactly 24 characters",
    "any.required": "Event ID is required",
  }),
  createdBy: Joi.string().hex().length(24).required().messages({
    "string.hex": "User ID must be a valid hexadecimal string",
    "string.length": "User ID must be exactly 24 characters",
    "any.required": "User ID is required",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const getCalendarEntriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  sortBy: Joi.string().valid("createdAt", "dateAdded").default("createdAt"),

  order: Joi.string().valid("asc", "desc").default("desc"),

  eventId: Joi.string().hex().length(24).optional(),
  createdBy: Joi.string().hex().length(24).optional(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const updateCalendarEntrySchema = Joi.object({
  eventId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Event ID must be a valid MongoDB ObjectId",
    "string.length": "Event ID must be 24 characters",
    "any.required": "Event ID is required",
  }),
  createdBy: Joi.string().hex().length(24).required().messages({
    "string.hex": "Creator ID must be a valid MongoDB ObjectId",
    "string.length": "Creator ID must be 24 characters",
    "any.required": "Creator ID is required",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const deleteCalendarEntrySchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export {
  createCalendarEntrySchema,
  getCalendarEntriesSchema,
  updateCalendarEntrySchema,
  deleteCalendarEntrySchema,
};
