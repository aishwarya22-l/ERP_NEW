import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { logEvent } from "../services/auditService.js";

// GET ALL WITH PAGINATION
export const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const [[{ total }]] = await db.query("SELECT COUNT(*) as total FROM employees");
    const [rows] = await db.query(
      "SELECT id, name, email, role, department, created_at FROM employees LIMIT ? OFFSET ?",
      [pageSize, offset]
    );

    res.json({
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching employees" });
  }
};

// CREATE
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Duplicate email check
    const [[existing]] = await db.query("SELECT id FROM employees WHERE email = ?", [email]);
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO employees (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, department || null]
    );

    logEvent(req.session.user, "employee", result.insertId, "create", null, { name, email, role, department });

    res.json({ message: "Employee added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating employee" });
  }
};

// UPDATE
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, department } = req.body;

    const [[before]] = await db.query(
      "SELECT id, name, email, role, department FROM employees WHERE id = ?", [id]
    );

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE employees SET name=?, email=?, password=?, role=?, department=? WHERE id=?",
        [name, email, hashedPassword, role, department || null, id]
      );
    } else {
      await db.query(
        "UPDATE employees SET name=?, email=?, role=?, department=? WHERE id=?",
        [name, email, role, department || null, id]
      );
    }

    logEvent(req.session.user, "employee", id, "update", before, { name, email, role, department });

    res.json({ message: "Employee updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating employee" });
  }
};

// DELETE
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const [[before]] = await db.query(
      "SELECT id, name, email, role, department FROM employees WHERE id = ?", [id]
    );

    await db.query("DELETE FROM employees WHERE id=?", [id]);

    logEvent(req.session.user, "employee", id, "delete", before, null);

    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting employee" });
  }
};
