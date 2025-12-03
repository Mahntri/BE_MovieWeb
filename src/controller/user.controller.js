import { UserModel, AccountModel, AdminModel } from "../model/index.js"; // Import đủ 3 model
import bcrypt from "bcrypt";

const userController = {
  // Thêm/Xóa yêu thích
  toggleFavorite: async (req, res) => {
    try {
      const { userId, role } = req.user;
      const { movieId } = req.body;

      let profile = null;
      if (role === "ADMIN") {
        profile = await AdminModel.findOne({ accountId: userId });
      } else {
        profile = await UserModel.findOne({ accountId: userId });
      }

      if (!profile) return res.status(404).send({ message: "Profile not found" });

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
      res.status(200).send({ message, data: profile.favorites });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  // Lấy danh sách yêu thích
  getMyFavorites: async (req, res) => {
    try {
      const { userId, role } = req.user;
      
      let profile = null;
      if (role === "ADMIN") {
        profile = await AdminModel.findOne({ accountId: userId });
      } else {
        profile = await UserModel.findOne({ accountId: userId });
      }

      if (!profile) return res.status(200).send({ data: [] });

      res.status(200).send({ message: "Favorites fetched", data: profile.favorites });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  // CẬP NHẬT PROFILE
  updateProfile: async (req, res) => {
    try {
      const { userId, role } = req.user;
      const { fullName, password } = req.body;
      const fileData = req.file;

      let updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (fileData) updateData.avatar = fileData.path;

      let Model = role === "ADMIN" ? AdminModel : UserModel;

      const updatedProfile = await Model.findOneAndUpdate(
        { accountId: userId },
        updateData,
        { new: true }
      );

      if (!updatedProfile) {
          return res.status(404).send({ message: "Profile not found" });
      }

      // Update mật khẩu
      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await AccountModel.findByIdAndUpdate(userId, { password: hashedPassword });
      }

      const account = await AccountModel.findById(userId);

      res.status(200).send({ 
        message: "Update successfully", 
        data: {
            _id: account._id,
            username: account.username,
            fullName: updatedProfile.fullName,
            avatar: updatedProfile.avatar,
            role: account.role
        } 
      });

    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).send({ message: error.message });
    }
  }
};

export default userController;