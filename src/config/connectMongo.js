import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let cachedConnection = null;

const connectMongo = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    
    console.log("New MongoDB Connection established");
    
    cachedConnection = conn;
    
    return conn;
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};

export default connectMongo;