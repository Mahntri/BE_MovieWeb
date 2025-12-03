import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    mediaId: { type: String, required: true },
    mediaType: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel'
    },
    userModel: {
      type: String,
      required: true,
      enum: ['User', 'Admin'],
      default: 'User'
    },
    isReported: { 
        type: Boolean, 
        default: false 
    },
  },
  { timestamps: true }
);

const CommentModel = mongoose.model("Comment", commentSchema);
export default CommentModel;