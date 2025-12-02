import { Router } from "express";
import reportController from "../controller/report.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const reportRouter = Router();

// User gửi báo cáo
reportRouter.post("/", authMiddleware.authenticate, reportController.createReport);

// Admin xem danh sách
reportRouter.get("/admin", 
    authMiddleware.authenticate, 
    authMiddleware.isAdmin, 
    reportController.getPendingReports
);

// Admin xác nhận đã sửa
reportRouter.delete("/admin/:id", 
    authMiddleware.authenticate, 
    authMiddleware.isAdmin, 
    reportController.resolveReport
);

export default reportRouter;