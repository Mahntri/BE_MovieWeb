import { Router } from "express";
import userController from "../controller/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import uploadCloud from "../config/cloudinary.config.js";

const userRouter = Router();

userRouter.use(authMiddleware.authenticate);

userRouter.get("/favorites", userController.getMyFavorites);
userRouter.post("/favorites", userController.toggleFavorite);

userRouter.put("/update", uploadCloud.single('avatar'), userController.updateProfile);

export default userRouter;