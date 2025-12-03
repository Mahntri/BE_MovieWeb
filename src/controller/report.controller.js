import ReportModel from "../model/report.model.js";

const reportController = {
  // 1. User gửi báo cáo
  createReport: async (req, res) => {
    try {
      const { mediaId, mediaType, title, description } = req.body;
      const { userId } = req.user;

      const newReport = await ReportModel.create({
        mediaId,
        mediaType,
        title,
        description,
        userId,
      });

      res.status(201).send({ message: "Report sent successfully", data: newReport });
    } catch (error) {
      res.status(500).send({ message: "Error sending report", error: error.message });
    }
  },

  // 2. Admin lấy danh sách báo lỗi
  getPendingReports: async (req, res) => {
    try {
      const reports = await ReportModel.find({ status: "PENDING" })
        .populate("userId", "username")
        .sort({ createdAt: -1 });
        
      res.status(200).send({ data: reports });
    } catch (error) {
      res.status(500).send({ message: "Error fetching reports" });
    }
  },

  // 3. Admin xác nhận đã sửa lỗi
  resolveReport: async (req, res) => {
    try {
      const { id } = req.params;
      await ReportModel.findByIdAndDelete(id);
      
      // (Nếu muốn lưu lịch sử): await ReportModel.findByIdAndUpdate(id, { status: "FIXED" });

      res.status(200).send({ message: "Issue resolved" });
    } catch (error) {
      res.status(500).send({ message: "Error resolving issue" });
    }
  }
};

export default reportController;