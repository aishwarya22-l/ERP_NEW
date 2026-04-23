import db from "../config/db.js";

// GET ALL
export const getDepartments = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM departments");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching departments" });
  }
};

// GET BY ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM departments WHERE id = ?", [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching department" });
  }
};

// CREATE
export const createDepartment = async (req, res) => {
  try {
    const { name, description, location, manager_id, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }

    await db.query(
      "INSERT INTO departments (name, description, location, manager_id, status) VALUES (?, ?, ?, ?, ?)",
      [name, description || null, location || null, manager_id || null, status || "active"]
    );

    res.json({ message: "Department created successfully" });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Department name already exists" });
    }
    res.status(500).json({ message: "Error creating department" });
  }
};

// UPDATE
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, manager_id, status } = req.body;

    await db.query(
      "UPDATE departments SET name=?, description=?, location=?, manager_id=?, status=? WHERE id=?",
      [name, description || null, location || null, manager_id || null, status || "active", id]
    );

    res.json({ message: "Department updated successfully" });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Department name already exists" });
    }
    res.status(500).json({ message: "Error updating department" });
  }
};

// DELETE
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM departments WHERE id = ?", [id]);

    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting department" });
  }
};
