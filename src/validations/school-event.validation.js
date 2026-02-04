import Joi from "joi";

const createSchoolEventSchema = Joi.object({
  title: Joi.string().max(100).required().messages({
    "string.empty": "The event title cannot be empty.",
    "string.max": "Keep the title under 100 characters, please.",
    "any.required": "A title is required for this event.",
  }),

  description: Joi.string().max(2000).optional().messages({
    "string.max": "Description is a bit too long (max 2000 chars).",
  }),

  date: Joi.date().iso().required().messages({
    "date.format": "Please use a valid ISO date format (YYYY-MM-DD).",
    "any.required": "We need a date for the event.",
  }),

  venue: Joi.string().max(150).required().messages({
    "any.required": "Don’t forget to tell us where it’s happening.",
  }),

  organizedBy: Joi.string().valid("admin", "department").required().messages({
    "any.only": 'Organizer must be either "admin" or "department".',
    "any.required": "Please specify who is organizing this.",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const filteredUpdateSchema = Joi.object({
  title: Joi.string().max(100).trim().messages({
    "string.max": "Title cannot exceed 100 characters",
  }),
  description: Joi.string().max(2000).allow("").messages({
    "string.max": "Description cannot exceed 2000 characters",
  }),
  date: Joi.date().messages({
    "date.base": "Event date must be a valid date",
  }),
  venue: Joi.string().max(150).trim().messages({
    "string.max": "Venue cannot exceed 150 characters",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  })
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

const getAllSchoolEventsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  title: Joi.string().trim().allow(""),
  venue: Joi.string().trim().allow(""),
  organizedBy: Joi.string().valid("admin", "department").allow(""),

  date: Joi.date().iso().allow(null), // ?date=2026-02-15

  type: Joi.string().valid("all", "upcoming", "past").default("all"),

  sortBy: Joi.string().valid("date", "createdAt", "title").default("date"),
  order: Joi.string().valid("asc", "desc").default("asc"),
})
  .unknown(false) // reject any unknown query params
  .options({ stripUnknown: true, abortEarly: false });

const getSchoolEventByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.base": "Event ID must be a string",
    "string.hex": "Event ID must be a valid hexadecimal value",
    "string.length": "Event ID must be exactly 24 characters long",
    "any.required": "Event ID is required",
    "string.empty": "Event ID cannot be empty",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const filterEventsSchema = Joi.object({
  startDate: Joi.date().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),
  endDate: Joi.date().required().min(Joi.ref("startDate")).messages({
    "date.base": "End date must be a valid date",
    "any.required": "End date is required",
    "date.min": "End date cannot be earlier than start date",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const getMonthlyStatsSchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .default(new Date().getFullYear()),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const getRecentEventsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(5),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const updateEventSchema = Joi.object({
  title: Joi.string().max(100).trim().messages({
    "string.max": "Title cannot exceed 100 characters",
  }),
  description: Joi.string().max(2000).allow("").messages({
    "string.max": "Description cannot exceed 2000 characters",
  }),
  date: Joi.date().messages({
    "date.base": "Event date must be a valid date",
  }),
  venue: Joi.string().max(150).trim().messages({
    "string.max": "Venue cannot exceed 150 characters",
  }),
  organizedBy: Joi.string().valid("admin", "department").trim().messages({
    "any.only": "Organizer must be either 'admin' or 'department'",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  })
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

const deleteSchoolEventSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export {
  createSchoolEventSchema,
  getAllSchoolEventsSchema,
  getSchoolEventByIdSchema,
  filterEventsSchema,
  getMonthlyStatsSchema,
  getRecentEventsSchema,
  filteredUpdateSchema,
  updateEventSchema,
  deleteSchoolEventSchema,
};
