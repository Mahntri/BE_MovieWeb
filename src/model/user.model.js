import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    avatar: { 
        type: String, 
        default: "https://animevietsub.show/statics/images/user-image.png"
    },
    favorites: [
      {
        type: String,
      },
    ],
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;