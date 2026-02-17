// src/validations/user.validation.js
import Joi from "joi";

import { emailField, passwordField, phoneNumberField, roleField, usernameField } from "./fields.js";

const createUserSchema = Joi.object({
  username: usernameField.required().messages({
    "any.required": "Username is required",
  }),
  email: emailField.required().messages({
    "any.required": "Email is required",
  }),
  password: passwordField
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=]).+$/)
    .messages({
      "any.required": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base": "Password must include uppercase, lowercase, number and special character",
    }),
  role: roleField.required().messages({
    "any.required": "Role is required and cannot be empty",
  }),
  phoneNumber: phoneNumberField.required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const queryUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  email: emailField.optional().messages({
    "string.email": "Invalid email filter",
  }),

  username: Joi.string().trim().min(1).optional().messages({
    "string.base": "Username filter must be a string",
  }),

  role: roleField.optional().messages({
    "any.only": "Role filter must be one of: admin, student organization, officer, student",
  }),

  phoneNumber: phoneNumberField.optional().messages({
    "string.pattern.base": "Phone number filter must be in E.164 format",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const userIdParamSchema = Joi.object({
  id: Joi.string().length(24).hex().required().messages({
    "string.length": "Invalid user id",
    "string.hex": "Invalid user id",
    "any.required": "User id is required",
  }),
});

const updateUserSchema = Joi.object({
  username: usernameField.optional(),
  password: passwordField
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=]).+$/)
    .optional()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base": "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.empty": "Password cannot be empty",
    }),
  email: emailField.optional(),
  role: roleField.optional(),
  phoneNumber: phoneNumberField.optional(),
})
  .min(1)
  .messages({ "object.min": "Please provide at least one field to update." })
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

export { createUserSchema, queryUsersSchema, userIdParamSchema, updateUserSchema };
