
import { Router } from "express";

import { create, getColumns } from "./column.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const columnRouter = Router();

columnRouter.post(
  "/boards/:boardId/columns",
  authenticate,
  create
);

columnRouter.get(
  "/boards/:boardId/columns",
  authenticate,
  getColumns
);

export default columnRouter;