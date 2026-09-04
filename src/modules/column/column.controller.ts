import { Response } from "express";
 
import { createColumn, deleteColumn, getBoardColumns, reorderColumn, updateColumn } from "./column.service";
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

    const { boardId } = req.params;
    const { name } = req.body;

    if (typeof boardId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Column name is required",
      });
    }

    const column = await createColumn({
      boardId,
      name: name.trim(),
      userId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Column created successfully",
      data: column,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create column",
    });
  }
};


export const getColumns = async (
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

    const columns = await getBoardColumns(
      boardId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Columns fetched successfully",
      data: columns,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch columns",
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

    const { columnId } = req.params;
    const { name } = req.body;

    if (typeof columnId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid column ID",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Column name is required",
      });
    }

    const column = await updateColumn({
      columnId,
      name,
      userId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Column updated successfully",
      data: column,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update column",
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

    const { columnId } = req.params;

    if (typeof columnId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid column ID",
      });
    }

    const result = await deleteColumn({
      columnId,
      userId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Column deleted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete column",
    });
  }
};

export const reorder = async (
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

    const { columnId } = req.params;
    const { position } = req.body;

    if (typeof columnId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid column ID",
      });
    }

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

    const columns = await reorderColumn({
      columnId,
      position,
      userId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Column reordered successfully",
      data: columns,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to reorder column",
    });
  }
};

