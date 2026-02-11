// @ts-check
import asyncHandler from "express-async-handler";
import otpService from "../services/otp.service.js";

/**
 * @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest
 * @typedef {import('express').Response} Response
 * @typedef {import('express').Request} Request
 */

class OtpController {
  /**
   * @param {Response} res
   * @param {Request} req
   */
  sendOtp = asyncHandler(async (req, res) => {
    const { email, expiresAt } = await otpService.sendOtp(req.body);

    res.status(200).json({
      success: true,
      message: "OTP has been sent to your email address",
      email,
      expiresAt,
    });
  });

  /**
   * @param {Response} res
   * @param {Request} req
   */
  verifyOtp = asyncHandler(async (req, res) => {
    const { email, verified } = await otpService.verifyOtp(req.body);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        email,
        verified,
      },
    });
  });

  /**
   * @param {Response} res
   * @param {Request} req
   */
  resendOtp = asyncHandler(async (req, res) => {
    const { email, expiresAt } = await otpService.resend(req.body);

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email address",
      email,
      expiresAt,
    });
  });

  /**
   * @param {Response} res
   */
  cleanupExpiredOtps = asyncHandler(async (req, res) => {
    const result = await otpService.cleanupExpiredOtps(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @param {Response} res
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await otpService.getOtpStatistics(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export default new OtpController();
