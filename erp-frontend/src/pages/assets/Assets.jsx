import { useEffect, useState } from "react";
import { getAssets, createAsset, updateAsset, deleteAsset as deleteAssetApi, getCategories } from "../../api/assetApi.js";
import "../../styles/assets.css";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    asset_tag: "",
    category_id: "",
    brand: "",
    model: "",
    purchase_date: "",
    warranty_expiry: ""
  });

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const [assetsData, categoriesData] = await Promise.all([
        getAssets(),
        getCategories()
      ]);

      setAssets(assetsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      alert("Failed to load assets and categories");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= ADD / UPDATE =================
  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateAsset(editId, form);
      } else {
        await createAsset(form);
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error("Failed to save asset:", err);
      alert("Failed to save asset: " + err.message);
    }
  };

  // ================= DELETE =================
  const handleDeleteAsset = async (id) => {
    if (!window.confirm("Delete this asset?")) return;

    try {
      await deleteAssetApi(id);
      fetchData();
    } catch (err) {
      console.error("Failed to delete asset:", err);
      alert("Failed to delete asset: " + err.message);
    }
  };

  // ================= EDIT =================
  const editAsset = (asset) => {
    setForm({
      name: asset.name,
      asset_tag: asset.asset_tag,
      category_id: asset.category_id,
      brand: asset.brand || "",
      model: asset.model || "",
      purchase_date: asset.purchase_date || "",
      warranty_expiry: asset.warranty_expiry || ""
    });

    setEditId(asset.id);
    setShowModal(true);
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      name: "",
      asset_tag: "",
      category_id: "",
      brand: "",
      model: "",
      purchase_date: "",
      warranty_expiry: ""
    });
    setEditId(null);
    setShowModal(false);
  };

  // ================= STATUS COLOR =================
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green";
      case "assigned":
        return "orange";
      case "maintenance":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="assets-page">
      <div className="assets-header">
        <h2>Assets</h2>
      </div>

      {/* Add Button */}
      <button className="add-btn" onClick={() => setShowModal(true)}>
        + Add Asset
      </button>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal">
          <div className="glass-card">
            <h3>{editId ? "Edit Asset" : "Add Asset"}</h3>

            <input
              placeholder="Asset Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Asset Tag"
              value={form.asset_tag}
              onChange={(e) =>
                setForm({ ...form, asset_tag: e.target.value })
              }
            />

            <input
              placeholder="Brand"
              value={form.brand}
              onChange={(e) =>
                setForm({ ...form, brand: e.target.value })
              }
            />

            <input
              placeholder="Model"
              value={form.model}
              onChange={(e) =>
                setForm({ ...form, model: e.target.value })
              }
            />

            <input
              type="date"
              value={form.purchase_date}
              onChange={(e) =>
                setForm({ ...form, purchase_date: e.target.value })
              }
            />

            <input
              type="date"
              value={form.warranty_expiry}
              onChange={(e) =>
                setForm({ ...form, warranty_expiry: e.target.value })
              }
            />

            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div style={{ marginTop: "10px" }}>
              <button onClick={handleSubmit}>
                {editId ? "Update" : "Save"}
              </button>

              <button className="cancel" onClick={resetForm} style={{ marginLeft: "10px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Tag</th>
              <th>Status</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.asset_tag}</td>

                <td>
                  <span
                    style={{
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      background: getStatusColor(a.status)
                    }}
                  >
                    {a.status}
                  </span>
                </td>

                <td>{a.category_name}</td>

                <td>
                  <button onClick={() => editAsset(a)}>Edit</button>
                  <button
                    onClick={() => handleDeleteAsset(a.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

