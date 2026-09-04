

import prisma from "../../lib/prisma";

interface CreateColumnData {
  boardId: string;
  name: string;
  userId: string;
}

export const createColumn = async (data: CreateColumnData) => {
  const { boardId, name, userId } = data;

  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  const isOwner = board.ownerId === userId;

  const isMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  });

  if (!isOwner && !isMember) {
    throw new Error(
      "You do not have permission to create columns on this board"
    );
  }

  const lastColumn = await prisma.column.findFirst({
    where: {
      boardId,
    },
    orderBy: {
      position: "desc",
    },
  });

  const position = lastColumn
    ? lastColumn.position + 1
    : 0;

  const column = await prisma.column.create({
    data: {
      name,
      boardId,
      position,
    },
  });

  return column;
};


export const getBoardColumns = async (
  boardId: string,
  userId: string
) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  const isOwner = board.ownerId === userId;

  const isMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  });

  if (!isOwner && !isMember) {
    throw new Error(
      "You do not have permission to view this board"
    );
  }

  const columns = await prisma.column.findMany({
    where: {
      boardId,
    },
    orderBy: {
      position: "asc",
    },
    include: {
      tasks: {
        orderBy: {
          position: "asc",
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return columns;
};