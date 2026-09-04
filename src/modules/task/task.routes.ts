

import { Router } from "express";

import { create, getTask, getTasks, move, remove, update } from "./task.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const taskRouter = Router();

taskRouter.post(
  "/boards/:boardId/tasks",
  authenticate,
  create
);

taskRouter.get(
  "/boards/:boardId/tasks",
  authenticate,
  getTasks
);

taskRouter.get(
  "/tasks/:taskId",
  authenticate,
  getTask
);

taskRouter.patch(
  "/tasks/:taskId",
  authenticate,
  update
);

taskRouter.delete(
  "/tasks/:taskId",
  authenticate,
  remove
);

taskRouter.patch(
  "/tasks/:taskId/move",
  authenticate,
  move
);

export default taskRouter;