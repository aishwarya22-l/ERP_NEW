import db from "../config/db.js";
import { logEvent } from "../services/auditService.js";

export const getAssets = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
    const offset   = (page - 1) * pageSize;

    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM assets");
    const [rows] = await db.query(
      `SELECT a.*, c.name AS category_name
       FROM assets a
       LEFT JOIN categories c ON a.category_id = c.id
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    res.json({ data: rows, total, page, pageSize });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assets" });
  }
};

export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await db.query(
      `SELECT a.*, c.name AS category_name
       FROM assets a
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      [id]
    );
    if (!row) return res.status(404).json({ message: "Asset not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching asset" });
  }
};

export const createAsset = async (req, res) => {
  try {
    const { name, asset_tag, category_id = null, brand = null, model = null, purchase_date = null, warranty_expiry = null } = req.body;

    if (!name || !asset_tag) {
      return res.status(400).json({ message: "Asset name and tag are required" });
    }

    // Duplicate asset_tag check
    const [[existing]] = await db.query("SELECT id FROM assets WHERE asset_tag = ?", [asset_tag]);
    if (existing) {
      return res.status(409).json({ message: "Asset tag already in use" });
    }

    const [result] = await db.query(
      `INSERT INTO assets (name, asset_tag, category_id, brand, model, purchase_date, warranty_expiry)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, asset_tag, category_id || null, brand, model, purchase_date, warranty_expiry]
    );

    logEvent(req.session.user, "asset", result.insertId, "create", null,
      { name, asset_tag, category_id, brand, model, purchase_date, warranty_expiry });

    res.json({ message: "Asset created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating asset" });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, asset_tag, category_id, brand, model, purchase_date, warranty_expiry, status } = req.body;

    const [[before]] = await db.query("SELECT * FROM assets WHERE id = ?", [id]);
    if (!before) return res.status(404).json({ message: "Asset not found" });

    // Duplicate tag check (exclude current asset)
    if (asset_tag && asset_tag !== before.asset_tag) {
      const [[dup]] = await db.query("SELECT id FROM assets WHERE asset_tag = ? AND id != ?", [asset_tag, id]);
      if (dup) return res.status(409).json({ message: "Asset tag already in use" });
    }

    await db.query(
      `UPDATE assets SET name=?, asset_tag=?, category_id=?, brand=?, model=?, purchase_date=?, warranty_expiry=?, status=? WHERE id=?`,
      [
        name          ?? before.name,
        asset_tag     ?? before.asset_tag,
        category_id   !== undefined ? category_id || null : before.category_id,
        brand         ?? before.brand,
        model         ?? before.model,
        purchase_date ?? before.purchase_date,
        warranty_expiry ?? before.warranty_expiry,
        status        ?? before.status,
        id
      ]
    );

    logEvent(req.session.user, "asset", id, "update", before,
      { name, asset_tag, category_id, brand, model, purchase_date, warranty_expiry, status });

    res.json({ message: "Asset updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating asset" });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const [[before]] = await db.query("SELECT * FROM assets WHERE id = ?", [id]);
    if (!before) return res.status(404).json({ message: "Asset not found" });

    if (before.status === "assigned") {
      return res.status(400).json({ message: "Cannot delete an assigned asset. Return it first." });
    }

    await db.query("DELETE FROM assets WHERE id = ?", [id]);

    logEvent(req.session.user, "asset", id, "delete", before, null);

    res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting asset" });
  }
};

export const getAssetHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [[asset]] = await db.query("SELECT id, name, asset_tag FROM assets WHERE id = ?", [id]);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    const [history] = await db.query(
      `SELECT aa.id, aa.assigned_date, aa.return_date, aa.returned_at, aa.status, aa.notes,
              aa.department,
              e.id   AS employee_id,
              e.name AS employee_name,
              e.email AS employee_email,
              r.name AS returned_by_name
       FROM asset_assignments aa
       LEFT JOIN employees e  ON aa.user_id    = e.id
       LEFT JOIN employees r  ON aa.returned_by = r.id
       WHERE aa.asset_id = ?
       ORDER BY aa.assigned_date DESC`,
      [id]
    );

    res.json({ asset, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching asset history" });
  }
};

export const getAvailableAssets = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, asset_tag, status FROM assets WHERE status = 'available' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching available assets" });
  }
};

export const getAssignedAssets = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, asset_tag, status FROM assets WHERE status = 'assigned' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assigned assets" });
  }
};
