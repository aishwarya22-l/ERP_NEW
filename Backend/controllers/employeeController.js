import db from "../config/db.js";

// GET ALL
export const getEmployees = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employees");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching employees" });
  }
};

// CREATE
export const createEmployee = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    await db.query(
      "INSERT INTO employees (name, email, role) VALUES (?, ?, ?)",
      [name, email, role]
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
    const { name, email, role } = req.body;

    await db.query(
      "UPDATE employees SET name=?, email=?, role=? WHERE id=?",
      [name, email, role, id]
    );

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