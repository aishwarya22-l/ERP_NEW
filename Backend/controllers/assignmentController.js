import db from "../config/db.js";
import { logEvent } from "../services/auditService.js";
import { send as notify } from "../services/notificationService.js";

// GET ALL ASSIGNMENTS
export const getAssignments = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
    const offset   = (page - 1) * pageSize;

    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM asset_assignments");
    const [rows] = await db.query(
      `SELECT aa.id, aa.asset_id, aa.user_id, aa.department, aa.assigned_date, aa.return_date, aa.status,
              a.name AS asset_name, a.asset_tag,
              e.name AS assigned_to
       FROM asset_assignments aa
       LEFT JOIN assets a ON aa.asset_id = a.id
       LEFT JOIN employees e ON aa.user_id = e.id
       ORDER BY aa.assigned_date DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    res.json({ data: rows, total, page, pageSize });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assignments" });
  }
};

// GET USERS BY DEPARTMENT
export const getUsersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const [rows] = await db.query(
      "SELECT id, name, email, department FROM employees WHERE department = ?",
      [department]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// CREATE ASSIGNMENT
export const createAssignment = async (req, res) => {
  try {
    const { asset_id, user_id, department, assigned_date = null, return_date = null } = req.body;

    if (!asset_id || !user_id || !department) {
      return res.status(400).json({ message: "Asset, user, and department are required" });
    }

    const [[asset]] = await db.query("SELECT id, status FROM assets WHERE id = ?", [asset_id]);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status !== "available") {
      return res.status(400).json({ message: "Only available assets can be assigned" });
    }

    const [[user]] = await db.query("SELECT id, name FROM employees WHERE id = ?", [user_id]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const dateAssigned = assigned_date || new Date().toISOString().slice(0, 10);

    const [result] = await db.query(
      `INSERT INTO asset_assignments (asset_id, user_id, department, user, assigned_date, return_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'assigned')`,
      [asset_id, user_id, department, user.name, dateAssigned, return_date]
    );

    await db.query("UPDATE assets SET status = 'assigned' WHERE id = ?", [asset_id]);

    logEvent(req.session.user, "assignment", result.insertId, "create", null,
      { asset_id, user_id, department, assigned_date: dateAssigned, return_date });

    // Notify the assigned employee
    notify(
      user_id,
      "asset_assigned",
      "Asset Assigned to You",
      `Asset has been assigned to you in the ${department} department.`,
      "assignment",
      result.insertId
    );

    res.json({ message: "Assignment created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating assignment" });
  }
};

// UPDATE ASSIGNMENT
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { asset_id, user_id, department, assigned_date, return_date, status } = req.body;

    const [[before]] = await db.query(
      "SELECT id, asset_id, user_id, department, assigned_date, return_date, status FROM asset_assignments WHERE id = ?",
      [id]
    );
    if (!before) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (user_id) {
      const [[user]] = await db.query("SELECT name FROM employees WHERE id = ?", [user_id]);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await db.query(
        `UPDATE asset_assignments SET asset_id=?, user_id=?, department=?, user=?, assigned_date=?, return_date=?, status=? WHERE id=?`,
        [asset_id, user_id, department, user.name, assigned_date, return_date, status, id]
      );
    } else {
      await db.query(
        `UPDATE asset_assignments SET assigned_date=?, return_date=?, status=? WHERE id=?`,
        [assigned_date, return_date, status, id]
      );
    }

    logEvent(req.session.user, "assignment", id, "update", before,
      { asset_id, user_id, department, assigned_date, return_date, status });

    res.json({ message: "Assignment updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating assignment" });
  }
};

// RETURN ASSIGNMENT
export const returnAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const [[assignment]] = await db.query(
      "SELECT id, asset_id, user_id, department, assigned_date, status FROM asset_assignments WHERE id = ?",
      [id]
    );
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    if (assignment.status === "returned") {
      return res.status(400).json({ message: "Assignment already returned" });
    }

    const returnedById = req.session.user?.id ?? null;
    const now = new Date().toISOString().slice(0, 10);

    await db.query(
      `UPDATE asset_assignments
       SET status = 'returned', returned_at = NOW(), returned_by = ?, return_date = ?, notes = COALESCE(?, notes)
       WHERE id = ?`,
      [returnedById, now, notes ?? null, id]
    );

    await db.query("UPDATE assets SET status = 'available' WHERE id = ?", [assignment.asset_id]);

    logEvent(req.session.user, "assignment", id, "update", assignment,
      { status: "returned", returned_at: now, returned_by: returnedById });

    res.json({ message: "Asset returned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error returning assignment" });
  }
};

// DELETE ASSIGNMENT
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const [[before]] = await db.query(
      "SELECT id, asset_id, user_id, department, assigned_date, status FROM asset_assignments WHERE id = ?",
      [id]
    );
    if (!before) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await db.query("DELETE FROM asset_assignments WHERE id = ?", [id]);
    await db.query("UPDATE assets SET status = 'available' WHERE id = ?", [before.asset_id]);

    logEvent(req.session.user, "assignment", id, "delete", before, null);

    res.json({ message: "Assignment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting assignment" });
  }
};
