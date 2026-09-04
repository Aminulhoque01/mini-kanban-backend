import { Response } from "express";

import {
  createTask,
  deleteTask,
  getBoardTasks,
  getTaskById,
  moveTask,
  updateTask,
} from "./task.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { boardId } = req.params;

    if (typeof boardId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const { title, description, priority, columnId, assigneeId } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (typeof columnId !== "string" || !columnId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Column ID is required",
      });
    }

    const task = await createTask({
      boardId,
      columnId,
      title: title.trim(),
      description,
      priority,
      assigneeId,
      userId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { boardId } = req.params;

    if (typeof boardId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const {
      status,
      priority,
      assigneeId,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];

    const validPriorities = ["LOW", "MEDIUM", "HIGH"];

    if (
      status &&
      (typeof status !== "string" || !validStatuses.includes(status))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (
      priority &&
      (typeof priority !== "string" || !validPriorities.includes(priority))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    const result = await getBoardTasks(boardId, req.user.userId, {
      status: status as "TODO" | "IN_PROGRESS" | "DONE" | undefined,

      priority: priority as "LOW" | "MEDIUM" | "HIGH" | undefined,

      assigneeId: typeof assigneeId === "string" ? assigneeId : undefined,

      page: pageNumber,
      limit: limitNumber,
    });

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { taskId } = req.params;

    if (typeof taskId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await getTaskById(taskId, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: task,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return res.status(404).json({
      success: false,
      message,
    });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { taskId } = req.params;

    if (typeof taskId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const { title, description, priority, status, assigneeId } = req.body;

    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];

    const validPriorities = ["LOW", "MEDIUM", "HIGH"];

    if (priority !== undefined && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim().length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    const task = await updateTask(taskId, req.user.userId, {
      title: title?.trim(),
      description,
      priority,
      status,
      assigneeId,
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { taskId } = req.params;

    if (typeof taskId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    await deleteTask(taskId, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};


export const move = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { taskId } = req.params;
    const { columnId, position } = req.body;

    // Task ID validation
    if (typeof taskId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // Column ID validation
    if (
      typeof columnId !== "string" ||
      !columnId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Column ID is required",
      });
    }

    // Position validation
    if (
      typeof position !== "number" ||
      !Number.isInteger(position) ||
      position < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Position must be a non-negative integer",
      });
    }

    const task = await moveTask({
      taskId,
      userId: req.user.userId,
      columnId,
      position,
    });

    return res.status(200).json({
      success: true,
      message: "Task moved successfully",
      data: task,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to move task",
    });
  }
};