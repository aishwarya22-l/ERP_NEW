import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../../styles/roles.css";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from "../../api/rolesApi";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: ""
  });

  // 🔥 FETCH ROLES
  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION
    if (!formData.name) {
      alert("Role name is required");
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        description: formData.description || null,
        permissions: formData.permissions ? formData.permissions.split(",").map(p => p.trim()) : []
      };

      if (editId) {
        await updateRole(editId, submitData);
      } else {
        await createRole(submitData);
      }

      resetForm();
      loadRoles();

    } catch (err) {
      console.error("Submit error:", err);
      alert("Error saving role");
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role?")) return;

    try {
      await deleteRole(id);
      loadRoles();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting role");
    }
  };

  // 🔥 EDIT
  const handleEdit = (role) => {
    const permissionsStr = role.permissions 
      ? (Array.isArray(role.permissions) ? role.permissions.join(", ") : JSON.parse(role.permissions).join(", "))
      : "";

    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: permissionsStr
    });
    setEditId(role.id);
    setShowForm(true);
  };

  // 🔥 RESET FORM
  const resetForm = () => {
    setFormData({ name: "", description: "", permissions: "" });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="roles-page">

      {/* FLOAT BUTTON */}
      <button className="floating-add" onClick={() => setShowForm(true)}>
        <FaPlus />
      </button>

      {/* TABLE */}
      <div className="table-container glass">

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : roles.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.6 }}>
            No roles found 🚀
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((role) => {
                const permissions = role.permissions 
                  ? (Array.isArray(role.permissions) ? role.permissions : JSON.parse(role.permissions))
                  : [];
                
                return (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{role.description || "—"}</td>
                    <td>{permissions.length > 0 ? permissions.join(", ") : "—"}</td>
                    <td>
                      <FaEdit
                        className="icon edit"
                        onClick={() => handleEdit(role)}
                      />
                      <FaTrash
                        className="icon delete"
                        onClick={() => handleDelete(role.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="modal">
          <form className="glass-card" onSubmit={handleSubmit}>
            <h2>{editId ? "Edit Role" : "Create New Role"}</h2>

            <input
              placeholder="Role Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
            />

            <textarea
              placeholder="Permissions (comma-separated, e.g., read, write, delete)"
              value={formData.permissions}
              onChange={(e) =>
                setFormData({ ...formData, permissions: e.target.value })
              }
              rows="3"
            />

            <button type="submit">{editId ? "Update" : "Create"}</button>

            <button
              type="button"
              className="cancel"
              onClick={resetForm}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
