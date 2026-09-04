import { Router } from "express";
import { getMeController, login, register } from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);;
userRouter.get("/me", authenticate, getMeController);;

export default userRouter;