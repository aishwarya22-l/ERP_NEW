import db from "../config/db.js";
import { logEvent } from "../services/auditService.js";
import { sendEmail } from "../services/notificationService.js";

export const getMaintenanceLogs = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
    const offset   = (page - 1) * pageSize;

    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM maintenance_logs");
    const [rows] = await db.query(
      `SELECT m.id, m.asset_id, m.issue, m.status, m.priority, m.maintenance_type, m.technician,
              m.maintenance_date, m.completion_date, m.cost, m.notes, m.created_at,
              a.name AS asset_name, a.asset_tag, a.status AS asset_status
       FROM maintenance_logs m
       LEFT JOIN assets a ON m.asset_id = a.id
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    res.json({ data: rows, total, page, pageSize });
  } catch (err) {
    console.error("Error fetching maintenance logs:", err);
    res.status(500).json({ message: "Error fetching maintenance logs" });
  }
};

export const getMaintenanceLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid maintenance log ID" });
    }

    const [[log]] = await db.query(
      `SELECT m.id, m.asset_id, m.issue, m.status, m.priority, m.maintenance_type, m.technician,
              m.maintenance_date, m.completion_date, m.cost, m.notes, m.created_at,
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

export const createMaintenanceLog = async (req, res) => {
  try {
    const {
      asset_id,
      issue,
      status = "open",
      priority = "medium",
      maintenance_type,
      technician,
      maintenance_date,
      completion_date,
      cost,
      notes } = req.body;

    if (!asset_id || !issue) {
      return res.status(400).json({ message: "Asset ID and issue description are required" });
    }

    if (issue.trim().length < 5) {
      return res.status(400).json({ message: "Issue description must be at least 5 characters" });
    }

    if (isNaN(asset_id)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    const [[asset]] = await db.query("SELECT id, name, status FROM assets WHERE id = ?", [asset_id]);

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Employees always raise tickets as 'open'; raised_by is set from session
    const raised_by = req.session.user?.id ?? null;

    const [result] = await db.query(
      `INSERT INTO maintenance_logs
       (asset_id, raised_by, issue, status, priority, maintenance_type, technician, maintenance_date, completion_date, cost, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset_id, raised_by, issue.trim(), status, priority, maintenance_type, technician, maintenance_date, completion_date, cost, notes]
    );

    if (asset.status !== "maintenance") {
      await db.query("UPDATE assets SET status = 'maintenance' WHERE id = ?", [asset_id]);
    }

    logEvent(req.session.user, "maintenance", result.insertId, "create", null,
      { asset_id, raised_by, issue, status, priority, maintenance_type, technician, maintenance_date, completion_date, cost, notes });

    // Notify asset team by email when a ticket is raised
    const assetTeamEmail = process.env.ASSET_TEAM_EMAIL;
    if (assetTeamEmail) {
      await sendEmail(
        assetTeamEmail,
        `New Maintenance Ticket #${result.insertId} — ${priority.toUpperCase()} priority`,
        `A new ticket has been raised.\n\nTicket ID: ${result.insertId}\nAsset: ${asset.name}\nIssue: ${issue.trim()}\nPriority: ${priority}\nRaised by employee ID: ${raised_by}`
      );
    }

    res.status(201).json({
      message: "Maintenance log created successfully",
      id: result.insertId,
      asset_id, raised_by, issue, status, priority, maintenance_type, technician,
      maintenance_date, completion_date, cost, notes
    });
  } catch (err) {
    console.error("Error creating maintenance log:", err);
    res.status(500).json({ message: "Error creating maintenance log" });
  }
};

export const updateMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      issue, status, priority, maintenance_type,
      technician, maintenance_date, completion_date, cost, notes
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid maintenance log ID" });
    }

    const [[log]] = await db.query(
      "SELECT id, asset_id FROM maintenance_logs WHERE id = ?", [id]
    );

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    // Fetch full snapshot for audit diff
    const [[before]] = await db.query(
      "SELECT id, asset_id, issue, status, priority, maintenance_type, technician, maintenance_date, completion_date, cost, notes FROM maintenance_logs WHERE id = ?",
      [id]
    );

    const updates = [];
    const values = [];

    if (issue !== undefined && issue.trim().length >= 5) {
      updates.push("issue = ?");
      values.push(issue.trim());
    }

    if (status !== undefined && ["open", "in_progress", "resolved", "closed", "reopened"].includes(status)) {
      updates.push("status = ?");
      values.push(status);

      if (status === "resolved" || status === "closed") {
        await db.query("UPDATE assets SET status = 'available' WHERE id = ?", [log.asset_id]);
      }
    }

    if (priority !== undefined && ["low", "medium", "high", "urgent"].includes(priority)) {
      updates.push("priority = ?");
      values.push(priority);
    }

    if (maintenance_type !== undefined) { updates.push("maintenance_type = ?"); values.push(maintenance_type); }
    if (technician !== undefined)        { updates.push("technician = ?");       values.push(technician); }
    if (maintenance_date !== undefined)  { updates.push("maintenance_date = ?"); values.push(maintenance_date); }
    if (completion_date !== undefined)   { updates.push("completion_date = ?");  values.push(completion_date); }
    if (cost !== undefined)              { updates.push("cost = ?");             values.push(cost); }
    if (notes !== undefined)             { updates.push("notes = ?");            values.push(notes); }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid updates provided" });
    }

    values.push(id);
    await db.query(`UPDATE maintenance_logs SET ${updates.join(", ")} WHERE id = ?`, values);

    logEvent(req.session.user, "maintenance", id, "update", before,
      { issue, status, priority, maintenance_type, technician, maintenance_date, completion_date, cost, notes });

    res.json({ message: "Maintenance log updated successfully" });
  } catch (err) {
    console.error("Error updating maintenance log:", err);
    res.status(500).json({ message: "Error updating maintenance log" });
  }
};

export const deleteMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid maintenance log ID" });
    }

    const [[before]] = await db.query(
      "SELECT id, asset_id, issue, status, priority FROM maintenance_logs WHERE id = ?", [id]
    );

    if (!before) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    await db.query("DELETE FROM maintenance_logs WHERE id = ?", [id]);

    logEvent(req.session.user, "maintenance", id, "delete", before, null);

    res.json({ message: "Maintenance log deleted successfully" });
  } catch (err) {
    console.error("Error deleting maintenance log:", err);
    res.status(500).json({ message: "Error deleting maintenance log" });
  }
};

export const getMaintenanceLogsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["open", "in_progress", "resolved", "closed", "reopened"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }

    const [rows] = await db.query(
      `SELECT m.id, m.asset_id, m.issue, m.status, m.priority, m.maintenance_type, m.technician,
              m.maintenance_date, m.completion_date, m.cost, m.notes, m.created_at,
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

export const getMaintenanceLogsByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    if (!assetId || isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    const [[asset]] = await db.query("SELECT id FROM assets WHERE id = ?", [assetId]);

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

export const getMyTickets = async (req, res) => {
  try {
    const employeeId = req.session.user?.id;
    if (!employeeId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const [rows] = await db.query(
      `SELECT m.id, m.asset_id, m.raised_by, m.issue, m.status, m.priority,
              m.maintenance_type, m.technician, m.maintenance_date,
              m.completion_date, m.notes, m.created_at,
              a.name AS asset_name, a.asset_tag
       FROM maintenance_logs m
       LEFT JOIN assets a ON m.asset_id = a.id
       WHERE m.raised_by = ?
       ORDER BY m.created_at DESC`,
      [employeeId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching employee tickets:", err);
    res.status(500).json({ message: "Error fetching your tickets" });
  }
};

export const reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.session.user?.id;

    if (!employeeId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const [[log]] = await db.query(
      "SELECT id, raised_by, status FROM maintenance_logs WHERE id = ?",
      [id]
    );

    if (!log) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (Number(log.raised_by) !== Number(employeeId)) {
      return res.status(403).json({ message: "You can only reopen tickets you raised" });
    }

    if (log.status !== "closed") {
      return res.status(400).json({ message: "Only closed tickets can be reopened" });
    }

    await db.query("UPDATE maintenance_logs SET status = 'reopened' WHERE id = ?", [id]);

    logEvent(req.session.user, "maintenance", id, "reopen",
      { status: "closed" }, { status: "reopened" });

    res.json({ message: "Ticket reopened successfully" });
  } catch (err) {
    console.error("Error reopening ticket:", err);
    res.status(500).json({ message: "Error reopening ticket" });
  }
};
