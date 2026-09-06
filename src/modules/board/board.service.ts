import prisma from "../../lib/prisma";

interface CreateBoardData {
  name: string;
  ownerId: string;
}

export const createBoard = async (data: CreateBoardData) => {
  const board = await prisma.board.create({
    data: {
      name: data.name,
      ownerId: data.ownerId,
    },
  });

  return board;
};

export const getMyBoards = async (ownerId: string) => {
  const boards = await prisma.board.findMany({
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return boards;
};


export const getBoardById = async (
  boardId: string,
  userId: string
) => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
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

  if (!board) {
    throw new Error("Board not found or you don't have access");
  }

  return board;
};


interface UpdateBoardData {
  name: string;
}

export const updateBoard = async (
  boardId: string,
  ownerId: string,
  data: UpdateBoardData
) => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  const updatedBoard = await prisma.board.update({
    where: {
      id: boardId,
    },
    data: {
      name: data.name,
    },
  });

  return updatedBoard;
};



export const deleteBoard = async (
  boardId: string,
  ownerId: string
) => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  await prisma.board.delete({
    where: {
      id: boardId,
    },
  });

  return board;
};