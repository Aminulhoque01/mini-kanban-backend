
import { Router } from "express";

import { create, getColumns, remove, reorder, update } from "./column.controller";
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
columnRouter.patch(
  "/columns/:columnId",
  authenticate,
  update
);
columnRouter.delete(
  "/columns/:columnId",
  authenticate,
  remove
);

columnRouter.patch(
  "/columns/:columnId/reorder",
  authenticate,
  reorder
);

export default columnRouter;