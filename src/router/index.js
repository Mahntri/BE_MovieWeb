import { Router } from "express";
import accountRouter from "./account.router.js";
import adminRouter from "./admin.router.js";
import userRouter from "./user.router.js";
import authMiddleware from "../middleware/auth.middleware.js";
import commentRouter from "./comment.router.js";
import reportRouter from "./report.router.js";

const router = Router();

router.use("/auth", accountRouter);

router.use(
  "/admin",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminRouter
);

router.use(
  "/user",
  authMiddleware.authenticate,
  userRouter
);

router.use("/comments", commentRouter);

router.use("/reports", reportRouter);

export default router;