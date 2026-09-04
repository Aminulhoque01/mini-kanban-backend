import prisma from "../../lib/prisma";

interface AddMemberData {
  boardId: string;
  userId: string;
  ownerId: string;
}

export const addMember = async (data: AddMemberData) => {
  const { boardId, userId, ownerId } = data;

  // Check board and owner
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId,
    },
  });

  if (!board) {
    throw new Error("Board not found or you are not the owner");
  }

  // Check user exists
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Owner doesn't need to become a member
  if (userId === ownerId) {
    throw new Error("Board owner is already part of this board");
  }

  // Check duplicate member
  const existingMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this board");
  }

  const member = await prisma.boardMember.create({
    data: {
      boardId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return member;
};

export const getBoardMembers = async (
  boardId: string,
  ownerId: string
) => {
  // Check board ownership
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId,
    },
  });

  if (!board) {
    throw new Error("Board not found or you are not the owner");
  }

  const members = await prisma.boardMember.findMany({
    where: {
      boardId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });

  return members;
};


export const removeMember = async (
  boardId: string,
  userId: string,
  ownerId: string
) => {
  // Check board ownership
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId,
    },
  });

  if (!board) {
    throw new Error("Board not found or you are not the owner");
  }

  // Owner cannot be removed
  if (userId === ownerId) {
    throw new Error("Board owner cannot be removed");
  }

  // Check member exists
  const member = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("User is not a member of this board");
  }

  await prisma.boardMember.delete({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  });

  return member;
};