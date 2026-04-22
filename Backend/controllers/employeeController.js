import db from "../config/db.js";
import bcrypt from "bcryptjs";

// GET ALL WITH PAGINATION
export const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // Get total count
    const [[{ total }]] = await db.query("SELECT COUNT(*) as total FROM employees");

    // Get paginated data
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM employees LIMIT ? OFFSET ?",
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
    const { name, email, password, role } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO employees (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

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
    const { name, email, password, role } = req.body;

    // If password is provided and not empty, hash it
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE employees SET name=?, email=?, password=?, role=? WHERE id=?",
        [name, email, hashedPassword, role, id]
      );
    } else {
      // Don't update password if not provided
      await db.query(
        "UPDATE employees SET name=?, email=?, role=? WHERE id=?",
        [name, email, role, id]
      );
    }

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

    await db.query("DELETE FROM employees WHERE id=?", [id]);

    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting employee" });
  }
};