import { Response } from "express";
 
import { createBoard, deleteBoard, getBoardById, getMyBoards, updateBoard } from "./board.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const create = async (
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

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Board name is required",
      });
    }

    const board = await createBoard({
      name,
      ownerId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Board created successfully",
      data: board,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(500).json({
      success: false,
      message,
    });
  }
};


export const getBoards = async (
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

    const boards = await getMyBoards(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Boards fetched successfully",
      data: boards,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(500).json({
      success: false,
      message,
    });
  }
};


export const getBoard = async (
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

    const { id } = req.params;

    const board = await getBoardById(
      id as string,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Board fetched successfully",
      data: board,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(404).json({
      success: false,
      message,
    });
  }
};


export const update = async (
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

    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Board name is required",
      });
    }

    const board = await updateBoard(
      id as string,
      req.user.userId,
      { name }
    );

    return res.status(200).json({
      success: true,
      message: "Board updated successfully",
      data: board,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(404).json({
      success: false,
      message,
    });
  }
};


export const remove = async (
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

    const { id } = req.params;

    await deleteBoard(id as string, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Board deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(404).json({
      success: false,
      message,
    });
  }
};