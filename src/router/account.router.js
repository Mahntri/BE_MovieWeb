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
  accountController.createAccount // 👈 Phải có hàm này
);

// Đăng nhập
accountRouter.post(
  "/login",
  validationMiddleware(accountValidationSchema.login),
  accountController.login // 👈 Phải có hàm này
);

// Profile
accountRouter.get(
  "/profile",
  authMiddleware.authenticate,
  accountController.getProfile // 👈 Phải có hàm này
);

// Đổi mật khẩu
accountRouter.put(
  "/password", 
  authMiddleware.authenticate, 
  accountController.changePassword // 👈 Phải có hàm này
);

// Quên mật khẩu
accountRouter.post("/verify-otp", accountController.verifyOTP);
accountRouter.post("/forgot-password", accountController.forgotPassword); // 👈 Phải có hàm này
accountRouter.post("/reset-password", accountController.resetPassword);   // 👈 Phải có hàm này

// Tạo Admin
accountRouter.post("/register-admin", accountController.createAdmin);     // 👈 Phải có hàm này

export default accountRouter;