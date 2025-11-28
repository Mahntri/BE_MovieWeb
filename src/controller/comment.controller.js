import CommentModel from "../model/comment.model.js";
import { UserModel, AdminModel } from "../model/index.js"; // Import cả AdminModel

const commentController = {
  // 1. Thêm bình luận (Hỗ trợ cả User và Admin)
  addComment: async (req, res) => {
    try {
      const { content, mediaId, mediaType } = req.body;
      const { userId, role } = req.user; // Account ID & Role

      let profile = null;
      let modelType = "User"; // Mặc định là User

      // 👇 KIỂM TRA ROLE ĐỂ TÌM ĐÚNG PROFILE
      if (role === "ADMIN") {
          profile = await AdminModel.findOne({ accountId: userId });
          modelType = "Admin"; // Đánh dấu là Admin để Mongoose biết đường tìm
      } else {
          profile = await UserModel.findOne({ accountId: userId });
          modelType = "User";
      }

      if (!profile) {
        return res.status(404).send({ message: "Profile not found" });
      }

      const newComment = await CommentModel.create({
        content,
        mediaId,
        mediaType,
        userId: profile._id, // Lưu Profile ID
        userModel: modelType, // 👇 QUAN TRỌNG: Lưu loại model để populate động
      });

      // Populate để trả về full info ngay lập tức
      await newComment.populate({
          path: "userId",
          select: "fullName avatar accountId"
      });

      res.status(201).send({ message: "Comment added", data: newComment });
    } catch (error) {
      res.status(500).send({ message: "Error adding comment", error: error.message });
    }
  },

  // 2. Lấy danh sách bình luận (Public)
  getComments: async (req, res) => {
    try {
      const { mediaType, mediaId } = req.params;
      const comments = await CommentModel.find({ mediaType, mediaId })
        .populate({
            path: "userId",
            // Mongoose sẽ tự nhìn vào field 'userModel' để biết nhảy sang bảng User hay Admin
            select: "fullName avatar accountId" 
        })
        .sort({ createdAt: -1 });

      res.status(200).send({ data: comments });
    } catch (error) {
      res.status(500).send({ message: "Error fetching comments" });
    }
  },

  // 3. Báo cáo bình luận
  reportComment: async (req, res) => {
    try {
        const { commentId } = req.params;
        const updated = await CommentModel.findByIdAndUpdate(
            commentId, 
            { isReported: true }, 
            { new: true }
        );
        
        if (!updated) return res.status(404).send({ message: "Comment not found" });

        res.status(200).send({ message: "Comment reported successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error reporting comment", error: error.message });
    }
  },

  // 4. Admin lấy danh sách báo cáo
  getReportedComments: async (req, res) => {
      try {
          const comments = await CommentModel.find({ isReported: true })
            .populate("userId", "fullName avatar") // Populate động vẫn hoạt động ở đây
            .sort({ updatedAt: -1 });
          
          res.status(200).send({ data: comments });
      } catch (error) {
          res.status(500).send({ message: "Error fetching reported comments" });
      }
  },

  // 5. Xóa bình luận (User xóa của mình, Admin xóa tất cả)
  deleteComment: async (req, res) => {
      try {
          const { commentId } = req.params;
          const { userId, role } = req.user; // userId ở đây là ACCOUNT ID

          const comment = await CommentModel.findById(commentId);
          if (!comment) return res.status(404).send({ message: "Comment not found" });

          // TRƯỜNG HỢP 1: ADMIN -> Cho xóa luôn không cần check chủ sở hữu
          if (role === "ADMIN") {
              await CommentModel.findByIdAndDelete(commentId);
              return res.status(200).send({ message: "Comment deleted by Admin" });
          }

          // TRƯỜNG HỢP 2: USER THƯỜNG -> Phải tìm Profile ID trước
          const userProfile = await UserModel.findOne({ accountId: userId });
          
          // So sánh: Profile ID của người đang request VS Profile ID lưu trong comment
          if (userProfile && comment.userId.toString() === userProfile._id.toString()) {
              await CommentModel.findByIdAndDelete(commentId);
              return res.status(200).send({ message: "Comment deleted" });
          }

          return res.status(403).send({ message: "You are not allowed to delete this comment" });

      } catch (error) {
          res.status(500).send({ message: "Error deleting comment" });
      }
  },

  // 6. Bỏ qua báo cáo (Admin only)
  dismissReport: async (req, res) => {
      try {
          const { commentId } = req.params;
          await CommentModel.findByIdAndUpdate(commentId, { isReported: false });
          res.status(200).send({ message: "Report dismissed" });
      } catch (error) {
          res.status(500).send({ message: "Error dismissing report" });
      }
  }
};

export default commentController;