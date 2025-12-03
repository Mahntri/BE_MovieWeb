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

  // 5. Quên mật khẩu
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const account = await AccountModel.findOne({ email });
      
      // 👇 LOGIC MỚI: DÙ CÓ HAY KHÔNG CŨNG TRẢ VỀ THÀNH CÔNG
      
      if (account) {
          // TRƯỜNG HỢP 1: Email có thật -> Tạo OTP và gửi mail thật
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          account.resetPasswordToken = otp;
          account.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 phút
          await account.save();

          // Gửi mail (Không dùng await để tránh lộ thời gian xử lý khác biệt giữa có và không có email)
          sendResetEmail(email, otp).catch(err => console.error("Lỗi gửi mail:", err));
      } else {
          // TRƯỜNG HỢP 2: Email ảo -> Không làm gì cả (hoặc log lại để admin biết)
          // Nhưng tuyệt đối KHÔNG báo lỗi cho người dùng
          console.log(`[Security] Có người thử reset pass với email lạ: ${email}`);
      }

      // 👇 LUÔN LUÔN TRẢ VỀ 200 OK
      // Để Frontend chuyển sang màn hình nhập OTP
      res.status(200).send({ 
          message: "Gửi OTP thành công. Vui lòng kiểm tra hộp thư." 
      });

    } catch (error) {
      // Chỉ báo lỗi khi Server sập thực sự
      res.status(500).send({ message: "Lỗi hệ thống, vui lòng thử lại sau." });
    }
  },

  // 6. Đặt lại mật khẩu
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

  // 7. Tạo Admin
  createAdmin: async (req, res) => {
      try {
        const { username, password, fullName, secretCode, email } = req.body;

        if (secretCode !== "movie_web_vip") return res.status(403).send({ message: "Sai mã bí mật!" });

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