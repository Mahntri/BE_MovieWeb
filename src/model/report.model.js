import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    mediaId: { type: String, required: true },
    mediaType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
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