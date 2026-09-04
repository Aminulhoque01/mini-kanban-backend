import cors from "cors";
import express from "express";
import userRouter from "./modules/user/user.route";
import boardRouter from "./modules/board/board.routes";

const app = express();

/* -------------------- Middlewares -------------------- */

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use("/api/users", userRouter);
app.use("/api/boards", boardRouter);

/* -------------------- Health Check -------------------- */

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Mini Kanban API is running",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

export default app;