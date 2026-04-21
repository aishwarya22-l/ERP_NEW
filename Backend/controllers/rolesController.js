import db from "../config/db.js";

// GET ALL
export const getRoles = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM roles");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching roles" });
  }
};

// GET BY ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM roles WHERE id = ?", [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching role" });
  }
};

// CREATE
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const permissionsJSON = permissions ? JSON.stringify(permissions) : null;

    await db.query(
      "INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)",
      [name, description || null, permissionsJSON]
    );

    res.json({ message: "Role created successfully" });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Role name already exists" });
    }
    res.status(500).json({ message: "Error creating role" });
  }
};

// UPDATE
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const permissionsJSON = permissions ? JSON.stringify(permissions) : null;

    await db.query(
      "UPDATE roles SET name=?, description=?, permissions=? WHERE id=?",
      [name, description || null, permissionsJSON, id]
    );

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Role name already exists" });
    }
    res.status(500).json({ message: "Error updating role" });
  }
};

// DELETE
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM roles WHERE id=?", [id]);

    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting role" });
  }
};
