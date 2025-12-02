import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    mediaId: { type: String, required: true }, // ID phim
    mediaType: { type: String, required: true }, // 'movie' hoặc 'tv'
    title: { type: String, required: true }, // Tên phim (lưu luôn để Admin dễ nhìn)
    description: { type: String, required: true }, // Mô tả lỗi (ví dụ: "Phim mất tiếng")
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account", // Người báo cáo
      required: true,
    },
    status: { 
        type: String, 
        enum: ["PENDING", "FIXED"], 
        default: "PENDING" 
    },
  },
  { timestamps: true }
);

const ReportModel = mongoose.model("Report", reportSchema);
export default ReportModel;