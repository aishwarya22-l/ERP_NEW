import express from "express";
import db from "../config/db.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// GET recent audit events (activity feed)
router.get("/", isAuth, allowRoles("admin", "manager", "employee"), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const [rows] = await db.query(
      `SELECT id, actor_name, actor_role, entity_type, entity_id, action, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching audit logs" });
  }
});

export default router;
