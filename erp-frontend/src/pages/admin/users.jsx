import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../../styles/users.css";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "../../api/userApi";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); // ✅ FIXED
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ""
  });

  // 🔥 FETCH USERS
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION
    if (!formData.name || !formData.email || !formData.role) {
      alert("All fields required");
      return;
    }

    try {
      if (editId) {
        await updateUser(editId, formData);
      } else {
        await createUser(formData);
      }

      resetForm();
      loadUsers();

    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 🔥 EDIT
  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEditId(user.id); // ✅ FIXED
    setShowForm(true);
  };

  // 🔥 RESET FORM
  const resetForm = () => {
    setFormData({ name: "", email: "", role: "" });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="users-page">

      {/* FLOAT BUTTON */}
      <button className="floating-add" onClick={() => setShowForm(true)}>
        <FaPlus />
      </button>

      {/* TABLE */}
      <div className="table-container glass">

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : users.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.6 }}>
            No users found 🚀
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <FaEdit
                      className="icon edit"
                      onClick={() => handleEdit(user)} // ✅ FIXED
                    />
                    <FaTrash
                      className="icon delete"
                      onClick={() => handleDelete(user.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="modal">
          <form className="glass-card" onSubmit={handleSubmit}>
            <h2>{editId ? "Edit User" : "Add User"}</h2>

            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            {/* ✅ DROPDOWN (better than text input) */}
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>

            <button>{editId ? "Update" : "Add"}</button>

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