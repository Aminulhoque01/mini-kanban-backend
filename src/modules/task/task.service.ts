import prisma from "../../lib/prisma";

interface CreateTaskData {
  boardId: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  userId: string;
}

export const createTask = async (data: CreateTaskData) => {
  const { boardId, title, description, priority, assigneeId, userId } = data;

  // 1. Check board exists
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  // 2. Check user is owner or member
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
    throw new Error("You do not have permission to create tasks on this board");
  }

  // 3. If assignee provided, check assignee is board member
  if (assigneeId) {
    const isAssigneeOwner = board.ownerId === assigneeId;

    const isAssigneeMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: assigneeId,
        },
      },
    });

    if (!isAssigneeOwner && !isAssigneeMember) {
      throw new Error("Assignee must be a member of this board");
    }
  }

  // 4. Create task
  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      boardId,
      assigneeId,
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
  });

  return task;
};

interface GetTasksFilters {
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  page: number;
  limit: number;
}

export const getBoardTasks = async (
  boardId: string,
  userId: string,
  filters: GetTasksFilters,
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
    throw new Error("You do not have permission to view tasks on this board");
  }

  const skip = (filters.page - 1) * filters.limit;

  const where = {
    boardId,

    ...(filters.status && {
      status: filters.status,
    }),

    ...(filters.priority && {
      priority: filters.priority,
    }),

    ...(filters.assigneeId && {
      assigneeId: filters.assigneeId,
    }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: filters.limit,

      orderBy: {
        createdAt: "desc",
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
    }),

    prisma.task.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / filters.limit);

  return {
    tasks,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages,
    },
  };
};


export const getTaskById = async (
  taskId: string,
  userId: string
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      board: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Check owner
  const isOwner = task.board.ownerId === userId;

  // Check member
  const isMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: task.board.id,
        userId,
      },
    },
  });

  if (!isOwner && !isMember) {
    throw new Error(
      "You do not have permission to view this task"
    );
  }

  return task;
};


interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeId?: string | null;
}

export const updateTask = async (
  taskId: string,
  userId: string,
  data: UpdateTaskData
) => {
  // 1. Find task
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      board: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // 2. Check owner or member
  const isOwner = task.board.ownerId === userId;

  const isMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: task.boardId,
        userId,
      },
    },
  });

  if (!isOwner && !isMember) {
    throw new Error(
      "You do not have permission to update this task"
    );
  }

  // 3. Check assignee if provided
  if (data.assigneeId) {
    const isAssigneeOwner =
      task.board.ownerId === data.assigneeId;

    const isAssigneeMember =
      await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId: task.boardId,
            userId: data.assigneeId,
          },
        },
      });

    if (!isAssigneeOwner && !isAssigneeMember) {
      throw new Error(
        "Assignee must be a member of this board"
      );
    }
  }

  // 4. Update task
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.priority !== undefined && {
        priority: data.priority,
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),

      ...(data.assigneeId !== undefined && {
        assigneeId: data.assigneeId,
      }),
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
  });

  return updatedTask;
};


export const deleteTask = async (
  taskId: string,
  userId: string
) => {
  // 1. Find task
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      board: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // 2. Only board owner can delete
  if (task.board.ownerId !== userId) {
    throw new Error(
      "Only the board owner can delete this task"
    );
  }

  // 3. Delete task
  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return task;
};