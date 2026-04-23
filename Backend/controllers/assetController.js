import db from "../config/db.js";

export const getAssets = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, c.name AS category_name
       FROM assets a
       LEFT JOIN categories c ON a.category_id = c.id
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assets" });
  }
};

export const createAsset = async (req, res) => {
  try {
    const { name, asset_tag, category_id = null, brand = null, model = null, purchase_date = null, warranty_expiry = null } = req.body;

    if (!name || !asset_tag) {
      return res.status(400).json({ message: "Asset name and tag are required" });
    }

    await db.query(
      `INSERT INTO assets (name, asset_tag, category_id, brand, model, purchase_date, warranty_expiry)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, asset_tag, category_id || null, brand, model, purchase_date, warranty_expiry]
    );

    res.json({ message: "Asset created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating asset" });
  }
};

export const getAvailableAssets = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, asset_tag, status FROM assets WHERE status = 'available' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching available assets" });
  }
};

export const getAssignedAssets = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, asset_tag, status FROM assets WHERE status = 'assigned' ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assigned assets" });
  }
};
