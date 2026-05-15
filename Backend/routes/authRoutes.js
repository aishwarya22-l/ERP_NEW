import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser
} from "../controllers/authController.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", isAuth, getCurrentUser);

export default router;
