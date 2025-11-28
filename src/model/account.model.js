import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // THÊM EMAIL VÀ OTP
    email: { type: String, required: true, unique: true }, 
    resetPasswordToken: { type: String }, // Lưu OTP
    resetPasswordExpires: { type: Date }, // Lưu thời gian hết hạn
    
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AccountModel = mongoose.model("Account", accountSchema);
export default AccountModel;