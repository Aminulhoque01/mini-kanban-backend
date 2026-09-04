import { Response } from "express";

import { addMember, getBoardMembers, removeMember } from "./board-member.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const add = async (
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

    const boardId = req.params.boardId as string;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const member = await addMember({
      boardId,
      userId,
      ownerId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: member,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};


export const getMembers = async (
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

    const { boardId } = req.params;

    if (typeof boardId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const members = await getBoardMembers(
      boardId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Board members fetched successfully",
      data: members,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(400).json({
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

    const { boardId, userId } = req.params;

    if (
      typeof boardId !== "string" ||
      typeof userId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID or user ID",
      });
    }

    await removeMember(
      boardId,
      userId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};
