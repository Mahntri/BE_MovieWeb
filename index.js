import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectMongo from "./src/config/connectMongo.js";
import router from "./src/router/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

connectMongo();

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;