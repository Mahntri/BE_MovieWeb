import { Router } from "express";
import adminController from "../controller/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const adminRouter = Router();

adminRouter.get(
  "/accounts",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminController.getAllAccounts
);

adminRouter.delete(
  "/accounts/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminController.deleteAccount
);

export default adminRouter;