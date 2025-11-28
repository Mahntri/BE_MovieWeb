import { UserModel, AccountModel } from "../model/index.js";
import bcrypt from "bcrypt";

const userController = {
  toggleFavorite: async (req, res) => {
    try {
      const { userId } = req.user;
      const { movieId } = req.body;

      const user = await UserModel.findOne({ accountId: userId });
      if (!user) {
        throw new Error("User profile not found");
      }

      const index = user.favorites.indexOf(movieId);

      let message = "";
      if (index === -1) {
        user.favorites.push(movieId);
        message = "Added to favorites";
      } else {
        user.favorites.splice(index, 1);
        message = "Removed from favorites";
      }

      await user.save();

      res.status(200).send({
        message,
        data: user.favorites,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error updating favorites", error: error.message });
    }
  },

  getMyFavorites: async (req, res) => {
    try {
      const { userId } = req.user;

      const user = await UserModel.findOne({ accountId: userId });
      if (!user) {
        throw new Error("User profile not found");
      }

      res.status(200).send({
        message: "Favorites fetched",
        data: user.favorites,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error fetching favorites", error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { userId } = req.user;
      const { fullName, password } = req.body;
      const fileData = req.file;

      let updateData = { fullName };
      if (fileData) {
        updateData.avatar = fileData.path;
      }

      const updatedUser = await UserModel.findOneAndUpdate(
        { accountId: userId },
        updateData,
        { new: true }
      );

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
            fullName: updatedUser.fullName,
            avatar: updatedUser.avatar,
            role: account.role
        } 
      });

    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
};

export default userController;