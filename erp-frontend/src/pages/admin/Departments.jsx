import { useState, useEffect } from "react";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../api/departmentApi";
import "../../styles/assets.css";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    manager_id: "",
    status: "active"
  });

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const [departmentsData, employeesData] = await Promise.all([
        getDepartments(),
        fetch("http://localhost:5000/api/employees?page=1&pageSize=100").then(r => r.json())
      ]);

      setDepartments(departmentsData);
      setEmployees(employeesData.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      alert("Failed to load departments and employees");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= ADD / UPDATE =================
  const handleSubmit = async () => {
    if (!form.name) {
      return alert("Department name is required");
    }

    try {
      if (editId) {
        await updateDepartment(editId, form);
      } else {
        await createDepartment(form);
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save department:", error);
      alert("Failed to save department: " + error.message);
    }
  };

  // ================= DELETE =================
  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Delete this department?")) return;

    try {
      await deleteDepartment(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete department:", error);
      alert("Failed to delete department: " + error.message);
    }
  };

  // ================= EDIT =================
  const editDepartment = (department) => {
    setForm({
      name: department.name,
      description: department.description || "",
      location: department.location || "",
      manager_id: department.manager_id || "",
      status: department.status || "active"
    });
    setEditId(department.id);
    setShowModal(true);
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      location: "",
      manager_id: "",
      status: "active"
    });
    setEditId(null);
    setShowModal(false);
  };

  return (
    <div className="assets-page">
      <div className="assets-header">
        <h2>Departments</h2>

        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Department
        </button>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal">
          <div className="glass-card">
            <h3>{editId ? "Edit Department" : "Add Department"}</h3>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Department name"
            />

            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
            />

            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
            />

            <select
              value={form.manager_id}
              onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
            >
              <option value="">Select Manager</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.email}
                </option>
              ))}
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              <th>Description</th>
              <th>Location</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>{dept.description || "-"}</td>
                <td>{dept.location || "-"}</td>
                <td>
                  {employees.find(e => e.id === dept.manager_id)?.name || "-"}
                </td>
                <td>
                  <span
                    style={{
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      background: dept.status === "active" ? "green" : "gray"
                    }}
                  >
                    {dept.status}
                  </span>
                </td>

                <td>
                  <button onClick={() => editDepartment(dept)}>Edit</button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id)}
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
