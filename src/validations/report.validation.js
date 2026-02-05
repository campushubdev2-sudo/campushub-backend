// src/validations/report.validation.js
import Joi from "joi";

const createReportSchema = Joi.object({
  orgId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Organization ID must be a valid MongoDB ObjectId",
    "string.length": "Organization ID must be 24 characters",
    "any.required": "Organization ID is required",
  }),
  reportType: Joi.string()
    .valid("actionPlan", "bylaws", "financial", "proposal")
    .required()
    .messages({
      "any.only":
        "Report type must be one of: actionPlan, bylaws, financial, proposal",
      "any.required": "Report type is required",
    }),
  filePaths: Joi.array()
    .items(
      Joi.string().max(255).messages({
        "string.max": "File path cannot exceed 255 characters",
        "string.uri": "File path must be a valid URI",
      }),
    )
    .min(1)
    .messages({
      "array.min": "At least one file path is required",
    }),
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .default("pending")
    .messages({
      "any.only": "Status must be one of: pending, approved, rejected",
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

// Validation for download report files by ID
const downloadReportFilesSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid report ID format",
      "any.required": "Report ID is required",
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const updateReportStatusSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  status: Joi.string().valid("pending", "approved", "rejected").required(),
  // message: Joi.string()
  //   .trim()
  //   .default("Your report has been approved.")
  //   .optional(),
  message: Joi.when("status", {
    is: "approved",
    then: Joi.string().trim().default("Your report has been approved."),
    otherwise: Joi.forbidden(),
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const deleteReportSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export {
  createReportSchema,
  downloadReportFilesSchema,
  updateReportStatusSchema,
  deleteReportSchema,
};
