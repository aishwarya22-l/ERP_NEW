import db from "../config/db.js";

// GET current user's notifications (20 most recent, unread first)
export const getNotifications = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [rows] = await db.query(
      `SELECT id, type, title, message, entity_type, entity_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY is_read ASC, created_at DESC
       LIMIT 30`,
      [userId]
    );
    const [[{ unread }]] = await db.query(
      "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    );
    res.json({ notifications: rows, unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// GET unread count only (lightweight poll fallback)
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [[{ unread }]] = await db.query(
      "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    );
    res.json({ unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};

// PUT mark one as read
export const markRead = async (req, res) => {
  try {
    const { id }   = req.params;
    const userId   = req.session.user.id;
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating notification" });
  }
};

// PUT mark all as read
export const markAllRead = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [userId]
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating notifications" });
  }
};
