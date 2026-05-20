import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  logoutUser
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getCurrentUser,
  logoutUser);
router.post("/logout", logoutUser);

export default router;