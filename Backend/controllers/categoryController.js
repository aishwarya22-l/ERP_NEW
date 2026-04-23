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
