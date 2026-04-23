import db from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, description, color, status, created_at FROM categories ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description = "", color = "#000000", status = "active" } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    await db.query(
      "INSERT INTO categories (name, description, color, status) VALUES (?, ?, ?, ?)",
      [name, description, color, status]
    );

    res.json({ message: "Category created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating category" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description = "", color = "#000000", status = "active" } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const [result] = await db.query(
      "UPDATE categories SET name = ?, description = ?, color = ?, status = ? WHERE id = ?",
      [name, description, color, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting category" });
  }
};
