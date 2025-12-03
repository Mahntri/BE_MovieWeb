import { Router } from "express";
import accountController from "../controller/account.controller.js";
import validationMiddleware from "../middleware/validation.middleware.js";
import accountValidationSchema from "../validation/account.validation.js";
import authMiddleware from "../middleware/auth.middleware.js";

const accountRouter = Router();

// Đăng ký
accountRouter.post(
  "/register",
  validationMiddleware(accountValidationSchema.register),
  accountController.createAccount
);

// Đăng nhập
accountRouter.post(
  "/login",
  validationMiddleware(accountValidationSchema.login),
  accountController.login
);

// Profile
accountRouter.get(
  "/profile",
  authMiddleware.authenticate,
  accountController.getProfile
);

// Đổi mật khẩu
accountRouter.put(
  "/password", 
  authMiddleware.authenticate, 
  accountController.changePassword
);

// Quên mật khẩu
accountRouter.post("/verify-otp", accountController.verifyOTP);
accountRouter.post("/forgot-password", accountController.forgotPassword);
accountRouter.post("/reset-password", accountController.resetPassword);

// Tạo Admin
accountRouter.post("/register-admin", accountController.createAdmin);

export default accountRouter;