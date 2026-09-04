import prisma from "../../lib/prisma";

interface CreateTaskData {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  userId: string;
}

export const createTask = async (data: CreateTaskData) => {
  const {
    boardId,
    columnId,
    title,
    description,
    priority,
    assigneeId,
    userId,
  } = data;

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
    throw new Error(
      "You do not have permission to create tasks on this board"
    );
  }

  // 3. Check column belongs to this board
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      boardId,
    },
  });

  if (!column) {
    throw new Error(
      "Column not found or does not belong to this board"
    );
  }

  // 4. If assignee provided, check assignee belongs to board
  if (assigneeId) {
    const isAssigneeOwner =
      board.ownerId === assigneeId;

    const isAssigneeMember =
      await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId: assigneeId,
          },
        },
      });

    if (!isAssigneeOwner && !isAssigneeMember) {
      throw new Error(
        "Assignee must be a member of this board"
      );
    }
  }

  // 5. Get last task position in this column
  const lastTask = await prisma.task.findFirst({
    where: {
      columnId,
    },
    orderBy: {
      position: "desc",
    },
  });

  const position = lastTask
    ? lastTask.position + 1
    : 0;

  // 6. Create task
  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      boardId,
      columnId,
      assigneeId,
      position,
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


interface MoveTaskData {
  taskId: string;
  userId: string;
  columnId: string;
  position: number;
}

export const moveTask = async (data: MoveTaskData) => {
  const {
    taskId,
    userId,
    columnId: targetColumnId,
    position: requestedPosition,
  } = data;

  // 1. Find task
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // 2. Check board access
  const board = await prisma.board.findUnique({
    where: {
      id: task.boardId,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  const isOwner = board.ownerId === userId;

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
      "You do not have permission to move this task"
    );
  }

  // 3. Check target column belongs to same board
  const targetColumn = await prisma.column.findFirst({
    where: {
      id: targetColumnId,
      boardId: task.boardId,
    },
  });

  if (!targetColumn) {
    throw new Error(
      "Target column not found or does not belong to this board"
    );
  }

  if (requestedPosition < 0) {
    throw new Error("Position cannot be negative");
  }

  // 4. Same column movement
  if (task.columnId === targetColumnId) {
    const tasks = await prisma.task.findMany({
      where: {
        columnId: targetColumnId,
      },
      orderBy: {
        position: "asc",
      },
    });

    const oldIndex = tasks.findIndex(
      (item) => item.id === taskId
    );

    if (oldIndex === -1) {
      throw new Error("Task position not found");
    }

    const newIndex = Math.min(
      requestedPosition,
      tasks.length - 1
    );

    if (oldIndex !== newIndex) {
      const reorderedTasks = [...tasks];

      const [movedTask] = reorderedTasks.splice(
        oldIndex,
        1
      );

      reorderedTasks.splice(
        newIndex,
        0,
        movedTask
      );

      await prisma.$transaction(
        reorderedTasks.map((item, index) =>
          prisma.task.update({
            where: {
              id: item.id,
            },
            data: {
              position: index,
            },
          })
        )
      );
    }

    return prisma.task.findUnique({
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
      },
    });
  }

  // 5. Moving to another column

  // Get source column tasks
  const sourceTasks = await prisma.task.findMany({
    where: {
      columnId: task.columnId,
    },
    orderBy: {
      position: "asc",
    },
  });

  // Get target column tasks
  const targetTasks = await prisma.task.findMany({
    where: {
      columnId: targetColumnId,
    },
    orderBy: {
      position: "asc",
    },
  });

  // Remove task from source column
  const updatedSourceTasks = sourceTasks.filter(
    (item) => item.id !== taskId
  );

  // Target position cannot exceed current list length
  const newTargetPosition = Math.min(
    requestedPosition,
    targetTasks.length
  );

  // Add task at requested position
  const updatedTargetTasks = [...targetTasks];

  updatedTargetTasks.splice(
    newTargetPosition,
    0,
    task
  );

  // 6. Update both columns atomically
  await prisma.$transaction([
    ...updatedSourceTasks.map((item, index) =>
      prisma.task.update({
        where: {
          id: item.id,
        },
        data: {
          position: index,
        },
      })
    ),

    ...updatedTargetTasks.map((item, index) =>
      prisma.task.update({
        where: {
          id: item.id,
        },
        data: {
          columnId: targetColumnId,
          position: index,
        },
      })
    ),
  ]);

  // 7. Return moved task
  return prisma.task.findUnique({
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
    },
  });
};