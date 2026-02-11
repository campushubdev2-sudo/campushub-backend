// @ts-check
import asyncHandler from "express-async-handler";
import userService from "../services/user.service.js";

/**
 * @typedef {import('express').Request & { user: { id: string } }} AuthenticatedRequest
 * @typedef {import('express').Response} Response
 * @typedef {import('express').Request} Request
 */

class UserController {
  /** @param {Response} res */
  createUser = asyncHandler(async (req, res) => {
    const newUser = await userService.createUser(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "New user has been created",
      data: newUser,
    });
  });

  /** @param {Response} res */
  getUsers = asyncHandler(async (req, res) => {
    const result = await userService.getUsers(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      meta: {
        total: result.total,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      },
      data: result.data,
    });
  });

  /** @param {Response} res */
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(
      req.params.id,
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  });

  /** @param {Response} res */
  updateUser = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUser(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  });

  /** @param {Response} res */
  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(
      /** @type {AuthenticatedRequest} */ (req).user.id,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  });

  /** @param {Response} res */
  getUserStats = asyncHandler(async (req, res) => {
    const stats = await userService.getDashboardStats(
      /** @type {AuthenticatedRequest} */ (req).user.id,
    );

    res.status(200).json({
      success: true,
      message: "User statistics retrieved successfully",
      data: stats,
    });
  });
}

export default new UserController();
