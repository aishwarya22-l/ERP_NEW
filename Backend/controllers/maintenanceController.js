import db from "../config/db.js";

/**
 * Get all maintenance logs with associated asset information
 * Ordered by most recent first
 */
export const getMaintenanceLogs = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.id, m.asset_id, m.issue, m.status, m.priority, m.created_at,
              a.name AS asset_name, a.asset_tag, a.status AS asset_status
       FROM maintenance_logs m
       LEFT JOIN assets a ON m.asset_id = a.id
       ORDER BY m.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching maintenance logs:", err);
    res.status(500).json({ message: "Error fetching maintenance logs" });
  }
};

/**
 * Get a specific maintenance log by ID
 */
export const getMaintenanceLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid maintenance log ID" });
    }

    const [[log]] = await db.query(
      `SELECT m.id, m.asset_id, m.issue, m.status, m.priority, m.created_at,
              a.name AS asset_name, a.asset_tag, a.status AS asset_status
       FROM maintenance_logs m
       LEFT JOIN assets a ON m.asset_id = a.id
       WHERE m.id = ?`,
      [id]
    );

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    res.json(log);
  } catch (err) {
    console.error("Error fetching maintenance log:", err);
    res.status(500).json({ message: "Error fetching maintenance log" });
  }
};

/**
 * Create a new maintenance log
 * Validates that asset exists and is assigned
 * Updates asset status to 'maintenance'
 */
export const createMaintenanceLog = async (req, res) => {
  try {
    const { asset_id, issue, status = "open", priority = "medium" } = req.body;

    // Validation
    if (!asset_id || !issue) {
      return res.status(400).json({ message: "Asset ID and issue description are required" });
    }

    if (issue.trim().length < 5) {
      return res.status(400).json({ message: "Issue description must be at least 5 characters" });
    }

    if (!isNaN(asset_id) === false) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    // Check if asset exists
    const [[asset]] = await db.query(
      "SELECT id, status FROM assets WHERE id = ?",
      [asset_id]
    );

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Verify asset is in assignable state
    if (asset.status !== "assigned" && asset.status !== "maintenance") {
      return res.status(400).json({
        message: "Maintenance can only be created for assigned assets or assets already in maintenance"
      });
    }

    // Insert maintenance log
    const [result] = await db.query(
      "INSERT INTO maintenance_logs (asset_id, issue, status, priority) VALUES (?, ?, ?, ?)",
      [asset_id, issue.trim(), status, priority]
    );

    // Update asset status to maintenance if not already
    if (asset.status !== "maintenance") {
      await db.query("UPDATE assets SET status = 'maintenance' WHERE id = ?", [asset_id]);
    }

    res.status(201).json({
      message: "Maintenance log created successfully",
      id: result.insertId,
      asset_id,
      issue,
      status,
      priority
    });
  } catch (err) {
    console.error("Error creating maintenance log:", err);
    res.status(500).json({ message: "Error creating maintenance log" });
  }
};

/**
 * Update an existing maintenance log
 * Can update status, issue description, and priority
 */
export const updateMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { issue, status, priority } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid maintenance log ID" });
    }

    // Check if log exists
    const [[log]] = await db.query(
      "SELECT id, asset_id FROM maintenance_logs WHERE id = ?",
      [id]
    );

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (issue !== undefined && issue.trim().length >= 5) {
      updates.push("issue = ?");
      values.push(issue.trim());
    }

    if (status !== undefined && ["open", "in_progress", "resolved"].includes(status)) {
      updates.push("status = ?");
      values.push(status);

      // Update asset status when maintenance is resolved
      if (status === "resolved") {
        await db.query("UPDATE assets SET status = 'available' WHERE id = ?", [log.asset_id]);
      }
    }

    if (priority !== undefined && ["low", "medium", "high", "urgent"].includes(priority)) {
      updates.push("priority = ?");
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid updates provided" });
    }

    values.push(id);
    const query = `UPDATE maintenance_logs SET ${updates.join(", ")} WHERE id = ?`;

    await db.query(query, values);

    res.json({ message: "Maintenance log updated successfully" });
  } catch (err) {
    console.error("Error updating maintenance log:", err);
    res.status(500).json({ message: "Error updating maintenance log" });
  }
};

/**
 * Delete a maintenance log
 */
export const deleteMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid maintenance log ID" });
    }

    const [[log]] = await db.query(
      "SELECT id FROM maintenance_logs WHERE id = ?",
      [id]
    );

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    await db.query("DELETE FROM maintenance_logs WHERE id = ?", [id]);

    res.json({ message: "Maintenance log deleted successfully" });
  } catch (err) {
    console.error("Error deleting maintenance log:", err);
    res.status(500).json({ message: "Error deleting maintenance log" });
  }
};

/**
 * Get maintenance logs filtered by status
 */
export const getMaintenanceLogsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["open", "in_progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }

    const [rows] = await db.query(
      `SELECT m.id, m.asset_id, m.issue, m.status, m.priority, m.created_at,
              a.name AS asset_name, a.asset_tag
       FROM maintenance_logs m
       LEFT JOIN assets a ON m.asset_id = a.id
       WHERE m.status = ?
       ORDER BY m.created_at DESC`,
      [status]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching maintenance logs by status:", err);
    res.status(500).json({ message: "Error fetching maintenance logs" });
  }
};

/**
 * Get maintenance logs for a specific asset
 */
export const getMaintenanceLogsByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    if (!assetId || isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    // Verify asset exists
    const [[asset]] = await db.query(
      "SELECT id FROM assets WHERE id = ?",
      [assetId]
    );

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const [rows] = await db.query(
      `SELECT m.id, m.asset_id, m.issue, m.status, m.priority, m.created_at,
              a.name AS asset_name, a.asset_tag
       FROM maintenance_logs m
       LEFT JOIN assets a ON m.asset_id = a.id
       WHERE m.asset_id = ?
       ORDER BY m.created_at DESC`,
      [assetId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching maintenance logs by asset:", err);
    res.status(500).json({ message: "Error fetching maintenance logs" });
  }
};
