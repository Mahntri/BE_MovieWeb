import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    email: { type: String, required: true, unique: true }, 
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AccountModel = mongoose.model("Account", accountSchema);
export default AccountModel;