import { Request, Response } from "express";
import { getMe, loginUser, registerUser } from "./user.service";
import prisma from "../../lib/prisma";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    res.status(400).json({
      success: false,
      message,
    });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    res.status(401).json({
      success: false,
      message,
    });
  }
};


export const getMeController = async (
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

    const user = await getMe(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
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