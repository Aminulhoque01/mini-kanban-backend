import { Router } from "express";

import { create, getBoard, getBoards, remove, update } from "./board.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const boardRouter = Router();

boardRouter.post("/", authenticate, create);
boardRouter.get("/", authenticate, getBoards);
boardRouter.get("/:id", authenticate, getBoard);
boardRouter.patch("/:id", authenticate, update);
boardRouter.delete("/:id", authenticate, remove);

export default boardRouter;