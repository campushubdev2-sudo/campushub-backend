// @ts-check
import Joi from "joi";

import { emailField, passwordField, phoneNumberField, roleField, usernameField } from "./fields.js";

/**
 * @typedef {Object} SignInBody
 * @property {string} identifier - Username or email
 * @property {string} password
 */

/**
 * @typedef {Object} SignupBody
 * @property {string} username
 * @property {string} email
 * @property {string} [role] - Defaults to "student"
 * @property {string} phoneNumber
 * @property {string} password
 */

/** @type {Joi.ObjectSchema<SignInBody>} */
const signInSchema = Joi.object({
  identifier: Joi.string().trim().required().messages({
    "string.base": "Identifier must be a string",
    "string.empty": "Identifier is required",
    "any.required": "Identifier is required",
  }),
  password: passwordField.min(1).required().messages({
    "any.required": "Password is required",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/** @type {Joi.ObjectSchema<SignupBody>} */
const signupSchema = Joi.object({
  username: usernameField.required().messages({
    "any.required": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 50 characters",
  }),
  email: emailField.required().messages({
    "any.required": "Email is required",
  }),
  role: roleField.default("student"),
  phoneNumber: phoneNumberField.required().messages({
    "any.required": "Phone number is required",
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
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export { signInSchema, signupSchema };
