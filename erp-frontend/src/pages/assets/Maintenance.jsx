import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "../../styles/assets.css";

export default function Maintenance() {
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    asset_id: "",
    issue: ""
  });

  const fetchData = async () => {
    const [assignedAssets, logsData] = await Promise.all([
      apiRequest("/assets/assigned"),
      apiRequest("/maintenance")
    ]);

    setAssets(assignedAssets);
    setLogs(logsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addMaintenance = async () => {
    if (!form.asset_id || !form.issue) {
      alert("Please select an assigned asset and describe the issue.");
      return;
    }

    await apiRequest("/maintenance", "POST", form);
    setForm({ asset_id: "", issue: "" });
    alert("Maintenance request created ✅");
    fetchData();
  };

  return (
    <div className="assets-page">
      <div className="assets-header">
        <h2>Maintenance</h2>
      </div>

      <div className="form-container">
        <p>Only assigned assets may enter maintenance after assignment is completed.</p>

        <select
          value={form.asset_id}
          onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
        >
          <option value="">Select Assigned Asset</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} ({asset.asset_tag})
            </option>
          ))}
        </select>

        <textarea
          value={form.issue}
          onChange={(e) => setForm({ ...form, issue: e.target.value })}
          placeholder="Describe the issue"
        />

        <button onClick={addMaintenance}>Create Maintenance Log</button>
      </div>

      <div className="table-container">
        <h3>Maintenance history</h3>
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Logged at</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.asset_name || log.asset_id}</td>
                <td>{log.issue}</td>
                <td>{log.status}</td>
                <td>{new Date(log.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
