import { Router } from "express";
import accountController from "../controller/account.controller.js";
import validationMiddleware from "../middleware/validation.middleware.js";
import accountValidationSchema from "../validation/account.validation.js";
import authMiddleware from "../middleware/auth.middleware.js";

const accountRouter = Router();

accountRouter.post(
  "/register",
  validationMiddleware(accountValidationSchema.register),
  accountController.createAccount
);

accountRouter.post(
  "/login",
  validationMiddleware(accountValidationSchema.login),
  accountController.login
);

accountRouter.get(
  "/profile",
  authMiddleware.authenticate,
  accountController.getProfile
);

accountRouter.put(
  "/password", 
  authMiddleware.authenticate, 
  accountController.changePassword
);

accountRouter.post("/register-admin", accountController.createAdmin);

export default accountRouter;