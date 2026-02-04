import asyncHandler from "express-async-handler";
import otpService from "../services/otp.service.js";

class OtpController {
  sendOtp = asyncHandler(async (req, res) => {
    const { email, expiresAt } = await otpService.sendOtp(req.body);

    res.status(200).json({
      success: true,
      message: "OTP has been sent to your email address",
      email,
      expiresAt,
    });
  });

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

  resendOtp = asyncHandler(async (req, res) => {
    const { email, expiresAt } = await otpService.resend(req.body);

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email address",
      email,
      expiresAt,
    });
  });

  cleanupExpiredOtps = asyncHandler(async (req, res) => {
    const result = await otpService.cleanupExpiredOtps();

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await otpService.getOtpStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export default new OtpController();
