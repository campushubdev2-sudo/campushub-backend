import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import userRepository from "../repositories/user.repository.js";
import otpRepository from "../repositories/otp.repository.js";
import auditLogRepository from "../repositories/audit-log.repository.js";
import { signInSchema, signupSchema } from "../validations/auth.validation.js";
import { resetPasswordSchema } from "../validations/otp.validation.js";
import { AppError } from "../middlewares/error.middleware.js";
import { JWT_EXPIRES_IN, JWT_ISSUER, JWT_SECRET } from "../config/env.js";

class AuthService {
  async signIn({ identifier, password }) {
    const { error, value } = signInSchema.validate({ identifier, password });

    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      throw new AppError(message, 400);
    }

    const { identifier: validatedIdentifier, password: validatedPassword } =
      value;

    const user = await userRepository.findByIdentifier(validatedIdentifier);

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(
      validatedPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    user.password = undefined;

    await auditLogRepository.create({
      userId: user._id,
      action: "Sign In",
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async signUp(payload) {
    const { error, value } = signupSchema.validate(payload);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { username, email, password, role, phoneNumber } = value;

    if (await userRepository.findByUsername(username)) {
      throw new AppError("Username already exists", 409);
    }

    if (await userRepository.findByEmail(email)) {
      throw new AppError("Email already exists", 409);
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await userRepository.create({
      username,
      email,
      role,
      phoneNumber,
      password: hashedPassword,
    });

    await auditLogRepository.create({
      userId: user._id,
      action: "Sign Up",
    });

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async hashPassword(plainPassword) {
    const saltRounds = 12;
    return bcrypt.hash(plainPassword, saltRounds);
  }

  generateToken(user) {
    if (!user || !user._id || !user.email) {
      throw new AppError(
        "Valid user object with id and email is required",
        400,
      );
    }

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
    });
  }

  verifyToken(token) {
    try {
      if (!token) {
        throw new AppError("Token is required", 400);
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token expired, Please Login Again", 401);
      } else if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid token", 401);
      } else {
        throw new AppError(`Token verification failed: ${error.message}`, 401);
      }
    }
  }

  async resetPassword(payload) {
    const { error, value } = resetPasswordSchema.validate(payload);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(message, 400);
    }

    const { email, otp, newPassword } = value;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const otpRecord = await otpRepository.findValidOtp({ email, otp });
    if (!otpRecord) {
      throw new AppError("Invalid OTP", 400);
    }

    if (otpRecord.expiresAt < new Date()) {
      await otpRepository.incrementOtpAttempts(otpRecord._id);
      throw new AppError("OTP has expired", 400);
    }

    if (otpRecord.verificationAttempts >= 5) {
      throw new AppError("OTP verification limit exceeded", 429);
    }

    await otpRepository.markOtpVerified(otpRecord._id);

    const hashedPassword = await this.hashPassword(newPassword);

    await userRepository.updateUserPassword(user._id, hashedPassword);

    await otpRepository.deleteOtpsByEmail(email);

    await auditLogRepository.create({
      userId: user._id,
      action: "Reset Password",
    });

    return true;
  }
}

export default new AuthService();
