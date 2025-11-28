import { AccountModel, UserModel, AdminModel } from "../model/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendResetEmail } from "../config/mail.config.js";

const accountController = {
  // 1. Đăng ký User
  createAccount: async (req, res) => {
    try {
      const { username, password, fullName, email } = req.body;

      const existAccount = await AccountModel.findOne({ username });
      if (existAccount) throw new Error("Username already exists");
      
      const existEmail = await AccountModel.findOne({ email });
      if (existEmail) throw new Error("Email already exists");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAccount = await AccountModel.create({
        username,
        password: hashedPassword,
        email,
        role: "USER",
        isActive: true,
      });

      await UserModel.create({ fullName, accountId: newAccount._id });

      res.status(201).send({ message: "Account created successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  // 2. Đăng nhập
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const account = await AccountModel.findOne({ username });
      if (!account) throw new Error("Invalid username or password");

      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) throw new Error("Invalid username or password");

      const secretKey = process.env.SECRET_KEY || "your_secret_key";
      const payload = {
        userId: account._id,
        username: account.username,
        role: account.role,
      };
      const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });

      // Lấy profile
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

      res.status(200).send({ message: "Login successfully", token, user: userData });
    } catch (error) {
      res.status(500).send({ message: "Error logging in", error: error.message });
    }
  },

  // 3. Lấy thông tin cá nhân
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

      res.status(200).send({ message: "Profile fetched", data: { account, profile } });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  // 4. Đổi mật khẩu
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

  // 5. Quên mật khẩu (Gửi OTP)
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const account = await AccountModel.findOne({ email });
      if (!account) return res.status(404).send({ message: "Email không tồn tại" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      account.resetPasswordToken = otp;
      account.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
      await account.save();

      await sendResetEmail(email, otp);
      res.status(200).send({ message: "OTP sent" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      const account = await AccountModel.findOne({ 
        email,
        resetPasswordToken: otp,
        resetPasswordExpires: { $gt: Date.now() } // Kiểm tra còn hạn
      });

      if (!account) return res.status(400).send({ message: "Mã OTP không chính xác hoặc đã hết hạn" });

      res.status(200).send({ message: "OTP verified" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  // 6. Đặt lại mật khẩu (Verify OTP)
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const account = await AccountModel.findOne({ 
        email,
        resetPasswordToken: otp,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!account) return res.status(400).send({ message: "OTP sai hoặc hết hạn" });

      const salt = await bcrypt.genSalt(10);
      account.password = await bcrypt.hash(newPassword, salt);
      
      account.resetPasswordToken = undefined;
      account.resetPasswordExpires = undefined;
      await account.save();

      res.status(200).send({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  // 7. Tạo Admin (Hàm bí mật)
  createAdmin: async (req, res) => {
      try {
        // 👇 PHẢI CÓ 'email' Ở ĐÂY
        const { username, password, fullName, secretCode, email } = req.body;

        if (secretCode !== "movie_web_vip") return res.status(403).send({ message: "Sai mã bí mật!" });

        const existAccount = await AccountModel.findOne({ username });
        if (existAccount) throw new Error("Username already exists");
        
        // Kiểm tra email tồn tại chưa
        const existEmail = await AccountModel.findOne({ email });
        if (existEmail) throw new Error("Email already exists");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAccount = await AccountModel.create({
          username,
          password: hashedPassword,
          email, // 👈 QUAN TRỌNG: Lưu email vào DB
          role: "ADMIN",
          isActive: true,
        });

        await AdminModel.create({ 
            fullName, 
            accountId: newAccount._id,
            department: "Executive Board" 
        });

        res.status(201).send({ message: "Admin created successfully" });
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
  }
};

export default accountController;