import CommentModel from "../model/comment.model.js";
import { UserModel, AdminModel } from "../model/index.js";

const commentController = {
  addComment: async (req, res) => {
    try {
      const { content, mediaId, mediaType } = req.body;
      const { userId, role } = req.user;

      let profile = null;
      let modelType = "User";

      if (role === "ADMIN") {
          profile = await AdminModel.findOne({ accountId: userId });
          modelType = "Admin";
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
        userId: profile._id,
        userModel: modelType,
      });

      await newComment.populate({
          path: "userId",
          select: "fullName avatar accountId"
      });

      res.status(201).send({ message: "Comment added", data: newComment });
    } catch (error) {
      res.status(500).send({ message: "Error adding comment", error: error.message });
    }
  },

  // 2. Lấy danh sách bình luận
  getComments: async (req, res) => {
    try {
      const { mediaType, mediaId } = req.params;
      
      const { sort } = req.query; 
      const sortOrder = sort === 'asc' ? 1 : -1;

      const comments = await CommentModel.find({ mediaType, mediaId })
        .populate({
            path: "userId",
            select: "fullName avatar accountId"
        })
        .sort({ createdAt: sortOrder });

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
            .populate("userId", "fullName avatar")
            .sort({ updatedAt: -1 });
          
          res.status(200).send({ data: comments });
      } catch (error) {
          res.status(500).send({ message: "Error fetching reported comments" });
      }
  },

  // 5. Xóa bình luận
  deleteComment: async (req, res) => {
      try {
          const { commentId } = req.params;
          const { userId, role } = req.user;

          const comment = await CommentModel.findById(commentId);
          if (!comment) return res.status(404).send({ message: "Comment not found" });

          if (role === "ADMIN") {
              await CommentModel.findByIdAndDelete(commentId);
              return res.status(200).send({ message: "Comment deleted by Admin" });
          }

          const userProfile = await UserModel.findOne({ accountId: userId });
          
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