// src/services/otp.service.js

import crypto from "crypto";
import otpRepository from "../repositories/otp.repository.js";
import auditLogRepository from "../repositories/audit-log.repository.js";
import userRepository from "../repositories/user.repository.js";
import emailService from "./email.service.js";
import { AppError } from "../middlewares/error.middleware.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/otp.validation.js";

class OtpService {
  constructor() {
    this.MAX_VERIFICATION_ATTEMPTS = 5;
  }

  async sendOtp(actorId, payload) {
    const { error, value } = sendOtpSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { email } = value;
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("User with this email does not exist", 404);
    }

    await otpRepository.deleteOtpsByEmail(email);

    // Generate 6-digit OTP
    const otp = this.generateOtp();

    // OTP expiry: 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await otpRepository.create({
      email,
      otp,
      expiresAt,
    });

    await emailService.sendOTPEmail(email, otp);

    await auditLogRepository.create({
      userId: actorId,
      action: "otp.send",
    });

    return {
      email,
      expiresAt,
    };
  }

  async resend(actorId, payload) {
    const { error, value } = sendOtpSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { email } = value;

    const existingOtp = await otpRepository.findLatestUnverifiedByEmail(email);

    if (existingOtp && existingOtp.expiresAt > new Date()) {
      const remainingTime = Math.ceil(
        (existingOtp.expiresAt - Date.now()) / 1000 / 60,
      );
      throw new AppError(
        `Current OTP is still valid. Please check your email or wait ${remainingTime} minute(s).`,
        429,
      );
    }

    await auditLogRepository.create({
      userId: actorId,
      action: "otp.resend",
    });

    return await this.sendOtp({ email });
  }

  async verifyOtp(actorId, payload) {
    const { error, value } = verifyOtpSchema.validate(payload);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { email, otp } = value;
    const otpDoc = await otpRepository.findValidOtp({ email, otp });

    // OTP not found or already verified
    if (!otpDoc) {
      const latestOtp = await otpRepository.findLatestUnverifiedByEmail(email);

      if (!latestOtp) {
        throw new AppError("Invalid OTP", 400);
      }

      const updatedOtp = await otpRepository.incrementOtpAttempts(
        latestOtp._id,
      );

      if (updatedOtp.verificationAttempts >= this.MAX_VERIFICATION_ATTEMPTS) {
        await otpRepository.deleteOtpsByEmail(email);
        throw new AppError("Too many invalid attempts. OTP invalidated.", 429);
      }

      throw new AppError("Invalid OTP", 400);
    }

    // Expiry check
    if (otpDoc.expiresAt < new Date()) {
      await otpRepository.deleteOtpsByEmail(email);
      throw new AppError("OTP has expired", 400);
    }

    // Max attempts check
    if (otpDoc.verificationAttempts >= this.MAX_VERIFICATION_ATTEMPTS) {
      await otpRepository.deleteOtpsByEmail(email);
      throw new AppError("Too many invalid attempts. OTP invalidated.", 429);
    }

    // OTP verified successfully
    await otpRepository.markOtpVerified(otpDoc._id);

    // clean up other OTPs for same email
    await otpRepository.deleteOtpsByEmail(email);

    await auditLogRepository.create({
      userId: actorId,
      action: "otp.verify",
    });

    return {
      email,
      verified: true,
    };
  }

  generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async cleanupExpiredOtps(actorId) {
    const result = await otpRepository.deleteExpiredOtps();

    await auditLogRepository.create({
      userId: actorId,
      action: "otp.cleanup",
    });

    return {
      message: "Expired OTPs have been successfully deleted",
      meta: {
        deletedCount: result.deletedCount || 0,
      },
    };
  }

  async getOtpStatistics(actorId) {
    await auditLogRepository.create({
      userId: actorId,
      action: "otp.stats",
    });

    return otpRepository.getStatistics();
  }
}

export default new OtpService();
