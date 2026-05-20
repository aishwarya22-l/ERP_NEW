import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../../styles/assignments.css";

import {
  getAssignments,
  getUsersByDepartment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from "../../api/assignmentApi";
import { getDepartments } from "../../api/departmentApi";
import { getAvailableAssets } from "../../api/assetApi";

const PAGE_SIZE = 20;

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formData, setFormData] = useState({
    asset_id: "",
    department: "",
    user_id: "",
    assigned_date: new Date().toISOString().slice(0, 10),
    return_date: ""
  });

  // 🔥 LOAD INITIAL DATA
  useEffect(() => {
    loadAssignments(page);
    loadDepartments();
    loadAssets();
  }, []);

  useEffect(() => { loadAssignments(page); }, [page]);

  // 🔥 LOAD ASSIGNMENTS
  const loadAssignments = async (p = 1) => {
    try {
      setLoading(true);
      const res = await getAssignments(p, PAGE_SIZE);
      setAssignments(res.data ?? res);
      setTotal(res.total ?? 0);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOAD DEPARTMENTS
  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Departments fetch error:", err);
    }
  };

  // 🔥 LOAD ASSETS (available only — for dropdown)
  const loadAssets = async () => {
    try {
      const data = await getAvailableAssets();
      setAssets(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      console.error("Assets fetch error:", err);
    }
  };

  // 🔥 LOAD USERS BY DEPARTMENT
  const handleDepartmentChange = async (e) => {
    const dept = e.target.value;
    setFormData({ ...formData, department: dept, user_id: "" });

    if (dept) {
      try {
        setLoadingUsers(true);
        const data = await getUsersByDepartment(dept);
        setUsers(data);
      } catch (err) {
        console.error("Users fetch error:", err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    } else {
      setUsers([]);
    }
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION
    if (!formData.asset_id || !formData.department || !formData.user_id) {
      alert("All fields required");
      return;
    }

    try {
      if (editId) {
        await updateAssignment(editId, {
          ...formData,
          asset_id: parseInt(formData.asset_id),
          user_id: parseInt(formData.user_id)
        });
      } else {
        await createAssignment({
          ...formData,
          asset_id: parseInt(formData.asset_id),
          user_id: parseInt(formData.user_id)
        });
      }

      resetForm();
      loadAssignments(page);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error: " + err.message);
    }
  };

  // 🔥 EDIT
  const handleEdit = (assignment) => {
    setFormData({
      asset_id: assignment.asset_id,
      department: assignment.department,
      user_id: assignment.user_id,
      assigned_date: assignment.assigned_date,
      return_date: assignment.return_date || ""
    });
    setEditId(assignment.id);
    setShowForm(true);
    // Load users for the department
    if (assignment.department) {
      handleDepartmentChange({ target: { value: assignment.department } });
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;

    try {
      await deleteAssignment(id);
      loadAssignments(page);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting assignment");
    }
  };

  // 🔥 RESET FORM
  const resetForm = () => {
    setFormData({
      asset_id: "",
      department: "",
      user_id: "",
      assigned_date: new Date().toISOString().slice(0, 10),
      return_date: ""
    });
    setEditId(null);
    setShowForm(false);
    setUsers([]);
  };

  return (
    <div className="assignments-page">
      {/* FLOAT BUTTON */}
      <button className="floating-add" onClick={() => setShowForm(true)}>
        <FaPlus />
      </button>

      {/* TABLE */}
      <div className="table-container glass">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : assignments.length === 0 ? (
          <p className="loading">No assignments found 🚀</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Assigned To</th>
                <th>Department</th>
                <th>Assigned Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.asset_name || "N/A"}</td>
                  <td>{assignment.assigned_to || "N/A"}</td>
                  <td>{assignment.department || "N/A"}</td>
                  <td>{assignment.assigned_date || "N/A"}</td>
                  <td>{assignment.return_date || "-"}</td>
                  <td>
                    <span
                      className={`status-badge status-${assignment.status}`}
                    >
                      {assignment.status}
                    </span>
                  </td>
                  <td>
                    <FaEdit
                      className="icon edit"
                      onClick={() => handleEdit(assignment)}
                    />
                    <FaTrash
                      className="icon delete"
                      onClick={() => handleDelete(assignment.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16, alignItems: "center" }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #e5e7eb", cursor: page === 1 ? "default" : "pointer" }}>
            ‹ Prev
          </button>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Page {page} of {Math.ceil(total / PAGE_SIZE)} &nbsp;·&nbsp; {total} total
          </span>
          <button disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage(p => p + 1)}
            style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #e5e7eb", cursor: page >= Math.ceil(total / PAGE_SIZE) ? "default" : "pointer" }}>
            Next ›
          </button>
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="modal">
          <form className="glass-card" onSubmit={handleSubmit}>
            <h2>{editId ? "Edit Assignment" : "Add Assignment"}</h2>

            {/* ASSET DROPDOWN */}
            <select
              value={formData.asset_id}
              onChange={(e) =>
                setFormData({ ...formData, asset_id: e.target.value })
              }
              required
            >
              <option value="">Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.asset_tag})
                </option>
              ))}
            </select>

            {/* DEPARTMENT DROPDOWN */}
            <select
              value={formData.department}
              onChange={handleDepartmentChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* USERS LIST - Shows only after department is selected */}
            {formData.department && (
              <>
                <label style={{ marginTop: "12px", color: "#e9d5ff" }}>
                  Select User:
                </label>
                {loadingUsers ? (
                  <p className="loading">Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="no-users">No users in this department</p>
                ) : (
                  <div className="users-list">
                    {users.map((user) => (
                      <label key={user.id}>
                        <input
                          type="radio"
                          name="user_id"
                          value={user.id}
                          checked={formData.user_id === String(user.id)}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              user_id: e.target.value
                            })
                          }
                          required
                        />
                        <span>{user.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* DATE INPUTS */}
            <input
              type="date"
              value={formData.assigned_date}
              onChange={(e) =>
                setFormData({ ...formData, assigned_date: e.target.value })
              }
              required
            />

            <input
              type="date"
              placeholder="Return Date (Optional)"
              value={formData.return_date}
              onChange={(e) =>
                setFormData({ ...formData, return_date: e.target.value })
              }
            />

            <button type="submit">{editId ? "Update" : "Add"}</button>

            <button type="button" className="cancel" onClick={resetForm}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
