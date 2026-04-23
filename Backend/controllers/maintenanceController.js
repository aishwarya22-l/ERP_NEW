import db from "../config/db.js";

export const getMaintenanceLogs = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.id, m.asset_id, m.issue, m.status, m.created_at,
              a.name AS asset_name, a.asset_tag, a.status AS asset_status
       FROM maintenance_logs m
       LEFT JOIN assets a ON m.asset_id = a.id
       ORDER BY m.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching maintenance logs" });
  }
};

export const createMaintenanceLog = async (req, res) => {
  try {
    const { asset_id, issue, status = "open" } = req.body;

    if (!asset_id || !issue) {
      return res.status(400).json({ message: "Asset and issue are required" });
    }

    const [[asset]] = await db.query("SELECT id, status FROM assets WHERE id = ?", [asset_id]);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status !== "assigned") {
      return res.status(400).json({ message: "Maintenance can only be created after an assignment is completed" });
    }

    await db.query(
      "INSERT INTO maintenance_logs (asset_id, issue, status) VALUES (?, ?, ?)",
      [asset_id, issue, status]
    );

    await db.query("UPDATE assets SET status = 'maintenance' WHERE id = ?", [asset_id]);

    res.json({ message: "Maintenance log created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating maintenance log" });
  }
};
