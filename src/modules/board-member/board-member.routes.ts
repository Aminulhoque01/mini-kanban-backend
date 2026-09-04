import { Router } from "express";

import { add, getMembers, remove } from "./board-member.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const boardMemberRouter = Router();

boardMemberRouter.post(
  "/boards/:boardId/members",
  authenticate,
  add
);
boardMemberRouter.get(
  "/boards/:boardId/members",
  authenticate,
  getMembers
);

boardMemberRouter.delete(
  "/boards/:boardId/members/:userId",
  authenticate,
  remove
);

export default boardMemberRouter;