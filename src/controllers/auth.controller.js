// @ts-check
import asyncHandler from "express-async-handler";

import authService from "../services/auth.service.js";
import { NODE_ENV } from "../config/env.js";
import { AppError } from "../middlewares/error.middleware.js";
import auditLogRepository from "../repositories/audit-log.repository.js";

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {string} role
 */

class AuthController {
  /** @param {Request} req @param {Response} res */
  signIn = asyncHandler(async (req, res) => {
    const { token, user } = await authService.signIn(req.body);

    if (NODE_ENV === "development") {
      res.status(200).json({
        success: true,
        message: "Login successfully!",
        data: { token, user },
      });
      return;
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      success: true,
      message: "Login successfully!",
      data: { user },
    });
  });

  /** @param {Request} req @param {Response} res */
  signUp = asyncHandler(async (req, res) => {
    const payload = req.body;
    const user = await authService.signUp(payload);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  });

  /** @param {Response} res */
  getProfile = asyncHandler(async (req, res) => {
    // user is set by the authentication middleware
    const { user } = /** @type {Request & {user: AuthUser}} */ (req);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await auditLogRepository.create({
      userId: user.id,
      action: "View Profile",
    });

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  });

  /** @param {Response} res */
  logOut = asyncHandler(async (req, res) => {
    const { user } = /** @type {Request & {user: AuthUser}} */ (req);
    await auditLogRepository.create({
      userId: user.id,
      action: "Logout",
    });

    // Clear the token cookie
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  });

  /** @param {Request} req @param {Response} res */
  resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  });
}

export default new AuthController();
