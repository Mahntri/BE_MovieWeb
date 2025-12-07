import { Router } from "express";
import commentController from "../controller/comment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const commentRouter = Router();

// Lấy danh sách báo cáo
commentRouter.get("/admin/reported", 
    authMiddleware.authenticate, 
    authMiddleware.isAdmin, 
    commentController.getReportedComments
);

// Xóa comment
commentRouter.delete("/admin/:commentId", 
    authMiddleware.authenticate, 
    authMiddleware.isAdmin, 
    commentController.deleteComment
);

// Bỏ qua báo cáo
commentRouter.put("/admin/:commentId/dismiss", 
    authMiddleware.authenticate, 
    authMiddleware.isAdmin, 
    commentController.dismissReport
);

// Báo cáo bình luận
commentRouter.put("/:commentId/report", authMiddleware.authenticate, commentController.reportComment);

// Xóa comment của mình
commentRouter.delete("/:commentId", authMiddleware.authenticate, commentController.deleteComment);

// Lấy bình luận phim
commentRouter.get("/:mediaType/:mediaId", commentController.getComments);

// Viết bình luận
commentRouter.post("/", authMiddleware.authenticate, commentController.addComment);

export default commentRouter;