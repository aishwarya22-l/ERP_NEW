import { useEffect, useState } from "react";
import "../../styles/assets.css";

export default function Assignments() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({
    asset_id: "",
    user_id: "",
    assigned_date: ""
  });

  const fetchData = async () => {
    const [assetsData, employeesData, assignmentsData] = await Promise.all([
      apiRequest("/assets/available"),
      apiRequest("/employees?page=1&pageSize=100"),
      apiRequest("/assignments")
    ]);

    setAssets(assetsData);
    setEmployees(employeesData.data || []);
    setAssignments(assignmentsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addAssignment = async () => {
    if (!form.asset_id || !form.user_id) {
      alert("Please select both asset and assignee.");
      return;
    }

    await apiRequest("/assignments", "POST", form);
    setForm({ asset_id: "", user_id: "", assigned_date: "" });
    alert("Assignment created ✅");
    fetchData();
  };

  return (
    <div className="assets-page">
      <div className="assets-header">
        <h2>Assignments</h2>
      </div>

      <div className="form-container">
        <p>Create an assignment only after adding an asset.</p>

        <select
          value={form.asset_id}
          onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
        >
          <option value="">Select Asset</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} ({asset.asset_tag})
            </option>
          ))}
        </select>

        <select
          value={form.user_id}
          onChange={(e) => setForm({ ...form, user_id: e.target.value })}
        >
          <option value="">Select Assignee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.email}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.assigned_date}
          onChange={(e) => setForm({ ...form, assigned_date: e.target.value })}
          placeholder="Assigned date"
        />

        <button onClick={addAssignment}>Create Assignment</button>
      </div>

      <div className="table-container">
        <h3>Assignment history</h3>
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Assignee</th>
              <th>Assigned Date</th>
              <th>Return Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td>{assignment.asset_name || assignment.asset_id}</td>
                <td>{assignment.assigned_to || assignment.user_id}</td>
                <td>{assignment.assigned_date}</td>
                <td>{assignment.return_date || "-"}</td>
                <td>{assignment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
