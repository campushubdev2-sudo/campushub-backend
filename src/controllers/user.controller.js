import asyncHandler from "express-async-handler";
import userService from "../services/user.service.js";

class UserController {
  createUser = asyncHandler(async (req, res) => {
    const newUser = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "New user has been created",
      data: newUser,
    });
  });

  getUsers = asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query);

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

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  });

  updateUser = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  });

  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  });

  getUserStats = asyncHandler(async (_req, res) => {
    const stats = await userService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: "User statistics retrieved successfully",
      data: stats,
    });
  });
}

export default new UserController();
