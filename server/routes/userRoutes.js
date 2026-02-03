import express from "express";
import {
  signup,
  login,
  checkAuth,
  updateProfile,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRoutes = express.Router();

userRoutes.post("/signup", signup);
userRoutes.post("/login", login);
userRoutes.get("/check", protectRoute, checkAuth);
userRoutes.put("/update-profile", protectRoute, updateProfile);

export default userRoutes;
