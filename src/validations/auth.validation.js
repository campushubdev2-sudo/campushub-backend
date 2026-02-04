// src/validations/auth.validation.js
import Joi from "joi";

import {
  emailField,
  passwordField,
  phoneNumberField,
  roleField,
} from "./fields.js";

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

const signupSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
  }),
  email: emailField.required().messages({
    "any.required": "Email is required",
  }),
  role: roleField.default("student"),
  phoneNumber: phoneNumberField.required(),
  password: passwordField.required().messages({
    "any.required": "Password is required",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export { signInSchema, signupSchema };
