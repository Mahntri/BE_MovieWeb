import { UserModel, AccountModel, AdminModel } from "../model/index.js"; // 👈 Thêm AdminModel
import bcrypt from "bcrypt";

const userController = {
  // 1. THÊM/XÓA YÊU THÍCH (Hỗ trợ cả Admin)
  toggleFavorite: async (req, res) => {
    try {
      const { userId, role } = req.user; // 👈 Lấy thêm role từ token
      const { movieId } = req.body;

      let profile = null;

      // 👇 KIỂM TRA ROLE ĐỂ CHỌN ĐÚNG BẢNG
      if (role === "ADMIN") {
        profile = await AdminModel.findOne({ accountId: userId });
      } else {
        profile = await UserModel.findOne({ accountId: userId });
      }

      if (!profile) {
        throw new Error("Profile not found");
      }

      const index = profile.favorites.indexOf(movieId);

      let message = "";
      if (index === -1) {
        profile.favorites.push(movieId);
        message = "Added to favorites";
      } else {
        profile.favorites.splice(index, 1);
        message = "Removed from favorites";
      }

      await profile.save();

      res.status(200).send({
        message,
        data: profile.favorites,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error updating favorites", error: error.message });
    }
  },

  // 2. LẤY DANH SÁCH YÊU THÍCH (Hỗ trợ cả Admin)
  getMyFavorites: async (req, res) => {
    try {
      const { userId, role } = req.user; // 👈 Lấy thêm role

      let profile = null;

      // 👇 KIỂM TRA ROLE
      if (role === "ADMIN") {
        profile = await AdminModel.findOne({ accountId: userId });
      } else {
        profile = await UserModel.findOne({ accountId: userId });
      }

      if (!profile) {
        // Nếu chưa có profile thì trả về mảng rỗng để không bị lỗi
        return res.status(200).send({ message: "Favorites fetched", data: [] });
      }

      res.status(200).send({
        message: "Favorites fetched",
        data: profile.favorites,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error fetching favorites", error: error.message });
    }
  },

  // 3. CẬP NHẬT PROFILE (Hỗ trợ cả Admin)
  updateProfile: async (req, res) => {
    try {
      const { userId, role } = req.user; // 👈 Lấy role
      const { fullName, password } = req.body;
      const fileData = req.file;

      let updateData = { fullName };
      if (fileData) {
        updateData.avatar = fileData.path;
      }

      // 👇 CHỌN MODEL DỰA TRÊN ROLE
      let Model = role === "ADMIN" ? AdminModel : UserModel;

      const updatedProfile = await Model.findOneAndUpdate(
        { accountId: userId },
        updateData,
        { new: true }
      );

      if (!updatedProfile) {
          throw new Error("Profile not found to update");
      }

      // Cập nhật mật khẩu bên bảng Account (Chung cho cả 2)
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await AccountModel.findByIdAndUpdate(userId, { password: hashedPassword });
      }

      const account = await AccountModel.findById(userId);

      res.status(200).send({ 
        message: "Update successfully", 
        data: {
            username: account.username,
            fullName: updatedProfile.fullName,
            avatar: updatedProfile.avatar,
            role: account.role
        } 
      });

    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
};

export default userController;