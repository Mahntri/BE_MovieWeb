import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = {
  authenticate: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).send({ message: "Unauthorized: Invalid token format" });
      }

      const secretKey = process.env.SECRET_KEY || "your_secret_key";
      
      const decoded = jwt.verify(token, secretKey);
      
      req.user = decoded;
      
      next();
    } catch (error) {
      return res.status(401).send({ message: "Unauthorized: Invalid or expired token" });
    }
  },

  isAdmin: async (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).send({ message: "Access denied. Admins only." });
    }
    next();
  },
};

export default authMiddleware;