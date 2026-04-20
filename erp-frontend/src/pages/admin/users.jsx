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
  const [editIndex, setEditIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ""
  });

  // 🔥 FETCH USERS
  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editIndex !== null) {
      await updateUser(users[editIndex].id, formData);
    } else {
      await createUser(formData);
    }

    setFormData({ name: "", email: "", role: "" });
    setEditIndex(null);
    setShowForm(false);
    loadUsers();
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  const handleEdit = (index) => {
    setFormData(users[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  return (
    <div className="users-page">

      <div className="users-header">
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <FaPlus /> Add User
        </button>
      </div>

      <div className="table-container glass">
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
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <FaEdit onClick={() => handleEdit(index)} />
                  <FaTrash onClick={() => handleDelete(user.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal">
          <form className="glass-card" onSubmit={handleSubmit}>
            <h2>{editIndex !== null ? "Edit User" : "Add User"}</h2>

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

            <input
              placeholder="Role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />

            <button>{editIndex !== null ? "Update" : "Add"}</button>
          </form>
        </div>
      )}
    </div>
  );
}