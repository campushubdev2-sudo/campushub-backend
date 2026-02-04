// src/validations/otp.validation.js

import Joi from "joi";
import { emailField, otpField } from "./fields.js";

const resetPasswordSchema = Joi.object({
  email: emailField.required().messages({
    "any.required": "Email is required",
  }),
  otp: otpField.required(),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "Your new password must be at least 8 characters long.",
    "string.empty": "New password cannot be empty.",
    "any.required": "A new password is required.",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const sendOtpSchema = Joi.object({
  email: emailField.required().messages({
    "any.required": "Email is required",
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const verifyOtpSchema = Joi.object({
  email: emailField.required(),
  otp: otpField.required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export { resetPasswordSchema, sendOtpSchema, verifyOtpSchema };
