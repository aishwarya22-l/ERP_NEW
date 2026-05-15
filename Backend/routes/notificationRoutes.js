import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead
} from "../controllers/notificationController.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/",            isAuth, getNotifications);
router.get("/unread-count",isAuth, getUnreadCount);
router.put("/read-all",    isAuth, markAllRead);
router.put("/:id/read",    isAuth, markRead);

export default router;
