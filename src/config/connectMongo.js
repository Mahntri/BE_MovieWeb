import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectMongo = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URL,
    );
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};

export default connectMongo;


