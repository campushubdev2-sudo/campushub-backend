// src/validations/field.js

import Joi from "joi";

const emailField = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } })
  .messages({
    "string.email": "Please enter a valid email address",
  });

const otpField = Joi.string().length(6).pattern(/^\d+$/).required().messages({
  "string.length": "The OTP must be exactly 6 digits.",
  "string.pattern.base": "The OTP must only contain numbers.",
  "string.empty": "OTP cannot be empty.",
  "any.required": "OTP is required.",
});

const passwordField = Joi.string().max(128).messages({
  "string.min": "Password must be at least 8 characters",
  "string.max": "Password cannot exceed 128 characters",
});

const userIdField = Joi.string().hex().length(24).optional().messages({
  "string.hex": "The User ID must be a valid hexadecimal string.",
  "string.length": "The User ID must be exactly 24 characters long.",
});

const phoneNumberField = Joi.string()
  .pattern(/^\+639\d{9}$/)
  .length(13)
  .messages({
    "string.pattern.base":
      "Phone number must be in E.164 format (e.g., +639123456789)",
  });

const roleField = Joi.string()
  .valid("admin", "adviser", "officer", "student")
  .messages({
    "any.only": "Role must be one of: admin, adviser, officer, student",
  });

const usernameField = Joi.string().trim().min(3).max(50).messages({
  "string.base": "Username must be a string",
  "string.empty": "Username cannot be empty",
  "string.min": "Username must be at least 3 characters",
  "string.max": "Username cannot exceed 50 characters",
});

export {
  emailField,
  otpField,
  passwordField,
  phoneNumberField,
  roleField,
  usernameField,
  userIdField,
};
