import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "../../styles/assets.css";

/**
 * Maintenance Management Component
 * Displays assigned assets and allows creating maintenance logs with toggleable form
 */
export default function Maintenance() {
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    asset_id: "",
    issue: "",
    priority: "medium"
  });

  // Fetch assets and maintenance logs
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [assignedAssets, logsData] = await Promise.all([
        apiRequest("/assets/assigned"),
        apiRequest("/maintenance")
      ]);

      setAssets(assignedAssets || []);
      setLogs(logsData || []);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmitMaintenance = async () => {
    // Validation
    if (!form.asset_id || !form.issue.trim()) {
      setError("Please select an asset and describe the issue");
      return;
    }

    if (form.issue.trim().length < 5) {
      setError("Issue description must be at least 5 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Submit maintenance log
      await apiRequest("/maintenance", "POST", {
        asset_id: form.asset_id,
        issue: form.issue,
        priority: form.priority,
        status: "open"
      });

      // Reset form and refresh data
      setForm({ asset_id: "", issue: "", priority: "medium" });
      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to create maintenance log");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form visibility toggle
  const toggleForm = () => {
    setShowForm(!showForm);
    setError(null);
    if (showForm) {
      setForm({ asset_id: "", issue: "", priority: "medium" });
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="assets-page">
      {/* Header Section */}
      <div className="assets-header">
        <h2>Maintenance Management</h2>
        <button 
          className="btn-primary" 
          onClick={toggleForm}
          disabled={loading}
        >
          {showForm ? "Cancel" : "Add Maintenance"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{ 
          padding: "12px 16px", 
          margin: "0 0 16px 0",
          backgroundColor: "#fee",
          color: "#c00",
          borderRadius: "4px",
          border: "1px solid #fcc"
        }}>
          {error}
        </div>
      )}

      {/* Toggle Form Section */}
      {showForm && (
        <div className="form-container" style={{ marginBottom: "24px" }}>
          <h3>Create New Maintenance Request</h3>
          <p style={{ color: "#666", marginBottom: "16px" }}>
            Only assigned assets can be logged for maintenance
          </p>

          {/* Asset Selection */}
          <div className="form-group">
            <label htmlFor="asset-select">Select Asset *</label>
            <select
              id="asset-select"
              value={form.asset_id}
              onChange={(e) => handleInputChange("asset_id", e.target.value)}
              disabled={loading}
              style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            >
              <option value="">-- Select an assigned asset --</option>
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.asset_tag})
                  </option>
                ))
              ) : (
                <option disabled>No assigned assets available</option>
              )}
            </select>
          </div>

          {/* Issue Description */}
          <div className="form-group">
            <label htmlFor="issue-textarea">Issue Description *</label>
            <textarea
              id="issue-textarea"
              value={form.issue}
              onChange={(e) => handleInputChange("issue", e.target.value)}
              placeholder="Describe the maintenance issue in detail..."
              disabled={loading}
              rows="4"
              style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            />
          </div>

          {/* Priority Level */}
          <div className="form-group">
            <label htmlFor="priority-select">Priority Level</label>
            <select
              id="priority-select"
              value={form.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              disabled={loading}
              style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Form Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              onClick={handleSubmitMaintenance}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Creating..." : "Create Maintenance Log"}
            </button>
            <button 
              onClick={toggleForm}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Logs Table */}
      <div className="table-container">
        <h3>Maintenance History</h3>
        {logs.length === 0 ? (
          <p style={{ color: "#999", padding: "20px", textAlign: "center" }}>
            No maintenance logs yet
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Asset Tag</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.asset_name || "Unknown"}</td>
                  <td>{log.asset_tag || "N/A"}</td>
                  <td>{log.issue}</td>
                  <td>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: 
                        log.status === "resolved" ? "#e8f5e9" :
                        log.status === "in_progress" ? "#fff3e0" :
                        "#ffebee",
                      color:
                        log.status === "resolved" ? "#2e7d32" :
                        log.status === "in_progress" ? "#e65100" :
                        "#c62828",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td>{new Date(log.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
