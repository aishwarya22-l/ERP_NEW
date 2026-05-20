import express from "express";
import db from "../config/db.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAuth, allowRoles("admin", "manager", "employee"), async (req, res) => {
  const q = (req.query.q || "").trim();
  if (q.length < 2) return res.json({ employees: [], assets: [], tickets: [] });

  const like = `%${q}%`;

  try {
    const [[employees], [assets], [tickets]] = await Promise.all([
      db.query(
        `SELECT id, name, email, department, role
         FROM employees
         WHERE name LIKE ? OR email LIKE ? OR department LIKE ?
         LIMIT 6`,
        [like, like, like]
      ),
      db.query(
        `SELECT a.id, a.name, a.asset_tag, a.status, c.name AS category_name
         FROM assets a
         LEFT JOIN categories c ON a.category_id = c.id
         WHERE a.name LIKE ? OR a.asset_tag LIKE ?
         LIMIT 6`,
        [like, like]
      ),
      db.query(
        `SELECT id, title, status, priority, created_at
         FROM tickets
         WHERE title LIKE ? OR description LIKE ?
         LIMIT 6`,
        [like, like]
      ),
    ]);

    res.json({ employees, assets, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
