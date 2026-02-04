import asyncHandler from "express-async-handler";

import authService from "../services/auth.service.js";
import { NODE_ENV } from "../config/env.js";
import { AppError } from "../middlewares/error.middleware.js";

class AuthController {
  signIn = asyncHandler(async (req, res) => {
    const { token, user } = await authService.signIn(req.body);

    if (NODE_ENV === "development") {
      return res.status(200).json({
        success: true,
        message: "Login successfully!",
        data: {
          token,
          user,
        },
      });
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      data: {
        user,
      },
    });
  });

  signUp = asyncHandler(async (req, res) => {
    const payload = req.body;
    const user = await authService.signUp(payload);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  });

  getProfile = asyncHandler((req, res) => {
    // req.user is set by the authentication middleware
    const user = req.user;

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  });

  logOut = asyncHandler((req, res) => {
    // Clear the token cookie
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  });

  resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  });
}

export default new AuthController();
