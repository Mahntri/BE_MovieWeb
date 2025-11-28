import CommentModel from "../model/comment.model.js";
import { UserModel } from "../model/index.js";

const commentController = {
  // 1. Thêm bình luận
  addComment: async (req, res) => {
    try {
      const { content, mediaId, mediaType } = req.body;
      const { userId } = req.user; // Account ID

      const userProfile = await UserModel.findOne({ accountId: userId });
      if (!userProfile) {
        return res.status(404).send({ message: "User profile not found" });
      }

      const newComment = await CommentModel.create({
        content,
        mediaId,
        mediaType,
        userId: userProfile._id, // Lưu Profile ID
      });

      // Populate để trả về full info
      await newComment.populate({
          path: "userId",
          select: "fullName avatar accountId" // Lấy thêm accountId để FE so sánh
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
            select: "fullName avatar accountId" // Quan trọng: Phải lấy accountId
        })
        .sort({ createdAt: -1 });

      res.status(200).send({ data: comments });
    } catch (error) {
      res.status(500).send({ message: "Error fetching comments" });
    }
  },

  // 3. Báo cáo bình luận (Sửa lại cho chắc chắn)
  reportComment: async (req, res) => {
    try {
        const { commentId } = req.params;
        // Cập nhật isReported = true
        const updated = await CommentModel.findByIdAndUpdate(
            commentId, 
            { isReported: true }, 
            { new: true } // Trả về data mới sau khi update
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
            .populate("userId", "fullName avatar")
            .sort({ updatedAt: -1 });
          
          res.status(200).send({ data: comments });
      } catch (error) {
          res.status(500).send({ message: "Error fetching reported comments" });
      }
  },

  // 5. Xóa bình luận (LOGIC MỚI QUAN TRỌNG)
  deleteComment: async (req, res) => {
      try {
          const { commentId } = req.params;
          const { userId, role } = req.user; // userId ở đây là ACCOUNT ID

          const comment = await CommentModel.findById(commentId);
          if (!comment) return res.status(404).send({ message: "Comment not found" });

          // Nếu là ADMIN -> Cho xóa luôn
          if (role === "ADMIN") {
              await CommentModel.findByIdAndDelete(commentId);
              return res.status(200).send({ message: "Comment deleted by Admin" });
          }

          // Nếu là USER -> Phải tìm Profile ID của họ trước
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

  // 6. Bỏ qua báo cáo
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