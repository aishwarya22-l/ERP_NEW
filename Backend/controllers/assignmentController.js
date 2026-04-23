import db from "../config/db.js";

export const getAssignments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT aa.id, aa.asset_id, aa.user_id, aa.assigned_date, aa.return_date, aa.status,
              a.name AS asset_name, a.asset_tag,
              e.name AS assigned_to
       FROM asset_assignments aa
       LEFT JOIN assets a ON aa.asset_id = a.id
       LEFT JOIN employees e ON aa.user_id = e.id
       ORDER BY aa.assigned_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assignments" });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { asset_id, user_id, assigned_date = null, return_date = null } = req.body;

    if (!asset_id || !user_id) {
      return res.status(400).json({ message: "Asset and assignee are required" });
    }

    const [[asset]] = await db.query("SELECT id, status FROM assets WHERE id = ?", [asset_id]);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status !== "available") {
      return res.status(400).json({ message: "Only available assets can be assigned" });
    }

    await db.query(
      `INSERT INTO asset_assignments (asset_id, user_id, assigned_date, return_date)
       VALUES (?, ?, ?, ?)`,
      [asset_id, user_id, assigned_date || new Date().toISOString().slice(0, 10), return_date]
    );

    await db.query("UPDATE assets SET status = 'assigned' WHERE id = ?", [asset_id]);

    res.json({ message: "Assignment created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating assignment" });
  }
};
