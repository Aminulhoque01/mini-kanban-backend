

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


interface UpdateColumnData {
  columnId: string;
  name: string;
  userId: string;
}

export const updateColumn = async (
  data: UpdateColumnData
) => {
  const {
    columnId,
    name,
    userId,
  } = data;

  // 1. Find column
  const column = await prisma.column.findUnique({
    where: {
      id: columnId,
    },
  });

  if (!column) {
    throw new Error("Column not found");
  }

  // 2. Find board
  const board = await prisma.board.findUnique({
    where: {
      id: column.boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  // 3. Check owner/member access
  const isOwner = board.ownerId === userId;

  const isMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: column.boardId,
        userId,
      },
    },
  });

  if (!isOwner && !isMember) {
    throw new Error(
      "You do not have permission to update this column"
    );
  }

  // 4. Update column
  const updatedColumn = await prisma.column.update({
    where: {
      id: columnId,
    },
    data: {
      name: name.trim(),
    },
  });

  return updatedColumn;
};


interface DeleteColumnData {
  columnId: string;
  userId: string;
}

export const deleteColumn = async (
  data: DeleteColumnData
) => {
  const { columnId, userId } = data;

  // 1. Find column
  const column = await prisma.column.findUnique({
    where: {
      id: columnId,
    },
  });

  if (!column) {
    throw new Error("Column not found");
  }

  // 2. Find board
  const board = await prisma.board.findUnique({
    where: {
      id: column.boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  // 3. Check owner/member access
  const isOwner = board.ownerId === userId;

  const isMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: column.boardId,
        userId,
      },
    },
  });

  if (!isOwner && !isMember) {
    throw new Error(
      "You do not have permission to delete this column"
    );
  }

  // 4. Check if column contains tasks
  const taskCount = await prisma.task.count({
    where: {
      columnId,
    },
  });

  if (taskCount > 0) {
    throw new Error(
      "Cannot delete a column that contains tasks. Move or delete the tasks first."
    );
  }

  // 5. Delete column
  await prisma.column.delete({
    where: {
      id: columnId,
    },
  });

  // 6. Reorder remaining columns
  const remainingColumns = await prisma.column.findMany({
    where: {
      boardId: column.boardId,
    },
    orderBy: {
      position: "asc",
    },
  });

  await prisma.$transaction(
    remainingColumns.map((item, index) =>
      prisma.column.update({
        where: {
          id: item.id,
        },
        data: {
          position: index,
        },
      })
    )
  );

  return {
    id: columnId,
  };
};


interface ReorderColumnData {
  columnId: string;
  position: number;
  userId: string;
}

export const reorderColumn = async (
  data: ReorderColumnData
) => {
  const {
    columnId,
    position: requestedPosition,
    userId,
  } = data;

  // 1. Find column
  const column = await prisma.column.findUnique({
    where: {
      id: columnId,
    },
  });

  if (!column) {
    throw new Error("Column not found");
  }

  // 2. Check board
  const board = await prisma.board.findUnique({
    where: {
      id: column.boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  // 3. Check access
  const isOwner = board.ownerId === userId;

  const isMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: column.boardId,
        userId,
      },
    },
  });

  if (!isOwner && !isMember) {
    throw new Error(
      "You do not have permission to reorder columns"
    );
  }

  if (requestedPosition < 0) {
    throw new Error("Position cannot be negative");
  }

  // 4. Get all columns
  const columns = await prisma.column.findMany({
    where: {
      boardId: column.boardId,
    },
    orderBy: {
      position: "asc",
    },
  });

  const oldIndex = columns.findIndex(
    (item) => item.id === columnId
  );

  if (oldIndex === -1) {
    throw new Error("Column position not found");
  }

  // Position cannot exceed last index
  const newIndex = Math.min(
    requestedPosition,
    columns.length - 1
  );

  // Nothing to change
  if (oldIndex === newIndex) {
    return columns;
  }

  // 5. Reorder
  const reorderedColumns = [...columns];

  const [movedColumn] = reorderedColumns.splice(
    oldIndex,
    1
  );

  reorderedColumns.splice(
    newIndex,
    0,
    movedColumn
  );

  // 6. Update positions atomically
  await prisma.$transaction(
    reorderedColumns.map((item, index) =>
      prisma.column.update({
        where: {
          id: item.id,
        },
        data: {
          position: index,
        },
      })
    )
  );

  // 7. Return updated columns
  return prisma.column.findMany({
    where: {
      boardId: column.boardId,
    },
    orderBy: {
      position: "asc",
    },
  });
};