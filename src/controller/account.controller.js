import { AccountModel, UserModel, AdminModel } from "../model/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const accountController = {
  // Đăng ký tài khoản mới
  createAccount: async (req, res) => {
    try {
      const { username, password, fullName } = req.body;

      const existAccount = await AccountModel.findOne({ username });
      if (existAccount) {
        throw new Error("Username already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAccount = await AccountModel.create({
        username,
        password: hashedPassword,
        role: "USER",
        isActive: true,
      });

      const newUserProfile = await UserModel.create({
        fullName,
        accountId: newAccount._id,
      });

      res.status(201).send({
        message: "Account and Profile created successfully",
        data: {
          username: newAccount.username,
          role: newAccount.role,
          fullName: newUserProfile.fullName,
        },
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error creating account", error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const account = await AccountModel.findOne({ username });
      if (!account) {
        throw new Error("Invalid username or password");
      }

      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) {
        throw new Error("Invalid username or password");
      }

      const secretKey = process.env.SECRET_KEY || "your_secret_key";
      const payload = {
        userId: account._id,
        username: account.username,
        role: account.role,
      };
      const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });

      let profile = null;
      if (account.role === "ADMIN") {
        profile = await AdminModel.findOne({ accountId: account._id });
      } else {
        profile = await UserModel.findOne({ accountId: account._id });
      }

      const userData = {
        _id: account._id,
        username: account.username,
        role: account.role,
        fullName: profile ? profile.fullName : "",
        avatar: profile ? profile.avatar : "",
      };

      res.status(200).send({ 
        message: "Login successfully", 
        token, 
        user: userData
      });

    } catch (error) {
      res
        .status(500)
        .send({ message: "Error logging in", error: error.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const { userId, role } = req.user;

      const account = await AccountModel.findById(userId).select("-password");

      if (!account) throw new Error("Account not found");

      let profile = null;

      if (role === "ADMIN") {
        profile = await AdminModel.findOne({ accountId: userId });
      } else {
        profile = await UserModel.findOne({ accountId: userId });
      }

      res.status(200).send({
        message: "Profile fetched successfully",
        data: {
          account,
          profile,
        },
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error fetching profile", error: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { userId } = req.user;
      const { currentPassword, newPassword } = req.body;

      const account = await AccountModel.findById(userId);
      if (!account) throw new Error("Account not found");

      const isMatch = await bcrypt.compare(currentPassword, account.password);
      if (!isMatch) return res.status(400).send({ message: "Mật khẩu hiện tại không đúng" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      account.password = hashedPassword;
      await account.save();

      res.status(200).send({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
  
  createAdmin: async (req, res) => {
    try {
      const { username, password, fullName, secretCode } = req.body;

      if (secretCode !== "movie_web_vip") {
        return res.status(403).send({ message: "Sai mã bí mật! Không thể tạo Admin." });
      }

      const existAccount = await AccountModel.findOne({ username });
      if (existAccount) {
        throw new Error("Username already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAccount = await AccountModel.create({
        username,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      });

      const newAdminProfile = await AdminModel.create({
        fullName,
        accountId: newAccount._id,
        department: "Executive Board",
        phone: ""
      });

      res.status(201).send({
        message: "Admin created successfully",
        data: {
          username: newAccount.username,
          role: newAccount.role,
          fullName: newAdminProfile.fullName,
        },
      });
    } catch (error) {
      res.status(500).send({ message: "Error creating admin", error: error.message });
    }
  },
};

export default accountController;