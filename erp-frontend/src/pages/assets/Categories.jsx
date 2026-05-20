import { useState, useEffect } from "react";
import { getCategories, createCategory , updateCategory, deleteCategory } from "../../api/assetApi.js";
import "../../styles/assets.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#7c3aed",
    status: "active"
  });

  const fetchData = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCategory = async () => {
    if (!form.name) {
      return alert("Category name is required");
    }

    try {
      if (editId) {
        await updateCategory(editId, form);
      } else {
        await createCategory(form);
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category: " + error.message);
    }
  };

  // ================= DELETE =================
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await deleteCategory(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category: " + error.message);
    }
  };

  // ================= EDIT =================
  const editCategory = (category) => {
    setForm({
      name: category.name,
      description: category.description || "",
      color: category.color || "#7c3aed",
      status: category.status || "active"
    });
    setEditId(category.id);
    setShowModal(true);
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      color: "#7c3aed",
      status: "active"
    });
    setEditId(null);
    setShowModal(false);
  };

  return (
    <div className="assets-page">
      <div className="assets-header">
        <h2>Categories</h2>

        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Category
        </button>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal">
          <div className="glass-card">
            <h3>{editId ? "Edit Category" : "Add Category"}</h3>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
            />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Color
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm({ ...form, color: e.target.value })
                  }
                  style={{
                    width: "48px",
                    height: "48px",
                    padding: 0,
                    border: "none",
                    background: "none"
                  }}
                />
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                style={{ flex: "1 1 180px" }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ marginTop: "10px" }}>
              <button onClick={addCategory}>
                {editId ? "Update" : "Save"}
              </button>
              <button className="cancel" onClick={resetForm} style={{ marginLeft: "10px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Color</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || "-"}</td>

                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: category.color,
                      border: "1px solid rgba(255,255,255,0.2)"
                    }}
                  />
                </td>

                <td>{category.status}</td>

                <td>
                  <button onClick={() => editCategory(category)}>Edit</button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
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