import { useEffect, useState } from "react";
import { getMaintenanceLogs, createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog as deleteMaintenanceLogApi } from "../../api/maintenanceApi.js";
import { getAssets } from "../../api/assetApi.js";
import "../../styles/maintenance.css";

export default function Maintenance() {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const PAGE_SIZE               = 20;
  const [assets, setAssets]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({
    asset_id: "",
    maintenance_type: "",
    issue: "",
    technician: "",
    status: "open",
    priority: "medium",
    maintenance_date: "",
    completion_date: "",
    cost: "",
    notes: ""
  });

  // ================= FETCH DATA =================
  const fetchData = async (p = page) => {
    try {
      setLoading(true);
      const [logsRes, assetsRes] = await Promise.all([
        getMaintenanceLogs(p, PAGE_SIZE),
        getAssets(1, 200)
      ]);
      setLogs(logsRes.data ?? logsRes);
      setTotal(logsRes.total ?? 0);
      setAssets(assetsRes.data ?? []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      alert("Failed to load maintenance logs and assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  // ================= FILTERED LOGS (client-side, current page only) =================
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.technician?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedLogs = filteredLogs;
  const totalPages    = Math.ceil(total / PAGE_SIZE);

  // ================= ADD / UPDATE =================
  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editId) {
        await updateMaintenanceLog(editId, form);
      } else {
        await createMaintenanceLog(form);
      }
      resetForm();
      fetchData(page);
    } catch (err) {
      console.error("Failed to save maintenance log:", err);
      alert("Failed to save maintenance log: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this maintenance log?")) return;
    try {
      await deleteMaintenanceLogApi(id);
      fetchData(page);
    } catch (err) {
      console.error("Failed to delete maintenance log:", err);
      alert("Failed to delete maintenance log: " + err.message);
    }
  };

  // ================= EDIT =================
  const editLog = (log) => {
    setForm({
      asset_id: log.asset_id || "",
      maintenance_type: log.maintenance_type || "",
      issue: log.issue || "",
      technician: log.technician || "",
      status: log.status || "open",
      priority: log.priority || "medium",
      maintenance_date: log.maintenance_date || "",
      completion_date: log.completion_date || "",
      cost: log.cost || "",
      notes: log.notes || ""
    });
    setEditId(log.id);
    setShowModal(true);
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      asset_id: "",
      maintenance_type: "",
      issue: "",
      technician: "",
      status: "open",
      priority: "medium",
      maintenance_date: "",
      completion_date: "",
      cost: "",
      notes: ""
    });
    setEditId(null);
    setShowModal(false);
  };

  // ================= STATUS COLOR =================
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "open": return "status-open";
      case "in_progress": return "status-in_progress";
      case "resolved": return "status-resolved";
      default: return "";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "low": return "priority-low";
      case "medium": return "priority-medium";
      case "high": return "priority-high";
      case "urgent": return "priority-urgent";
      default: return "";
    }
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-header">
        <h2>Maintenance Management</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Maintenance Log
        </button>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by asset name, issue, or technician..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal">
          <div className="glass-card">
            <h3>{editId ? "Edit Maintenance Log" : "Add Maintenance Log"}</h3>

            <select
              value={form.asset_id}
              onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
              required
            >
              <option value="">Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.asset_tag})
                </option>
              ))}
            </select>

            <input
              placeholder="Maintenance Type"
              value={form.maintenance_type}
              onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
            />

            <textarea
              placeholder="Issue Description"
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
              required
              rows="3"
            />

            <input
              placeholder="Technician"
              value={form.technician}
              onChange={(e) => setForm({ ...form, technician: e.target.value })}
            />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <input
              type="date"
              placeholder="Maintenance Date"
              value={form.maintenance_date}
              onChange={(e) => setForm({ ...form, maintenance_date: e.target.value })}
            />

            <input
              type="date"
              placeholder="Completion Date"
              value={form.completion_date}
              onChange={(e) => setForm({ ...form, completion_date: e.target.value })}
            />

            <input
              type="number"
              step="0.01"
              placeholder="Cost"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />

            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="3"
            />

            <div>
              <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : editId ? "Update" : "Save"}
              </button>
              <button className="cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="table-container">
        <h3>Maintenance Logs ({filteredLogs.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Type</th>
              <th>Issue</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Maintenance Date</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.asset_name || "Unknown"}</td>
                <td>{log.maintenance_type || "N/A"}</td>
                <td>{log.issue}</td>
                <td>{log.technician || "N/A"}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(log.status)}`}>
                    {log.status.replace("_", " ")}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${getPriorityBadgeClass(log.priority)}`}>
                    {log.priority}
                  </span>
                </td>
                <td>{log.maintenance_date ? new Date(log.maintenance_date).toLocaleDateString() : "N/A"}</td>
                <td>{log.cost ? `$${parseFloat(log.cost).toFixed(2)}` : "N/A"}</td>
                <td>
                  <button className="action-btn edit-btn" onClick={() => editLog(log)}>
                    Edit
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(log.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <p style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            No maintenance logs found
          </p>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      {total > PAGE_SIZE && (
        <div className="pagination">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            Previous
          </button>
          <span style={{ padding: "0 12px", fontSize: "0.85rem", color: "#6b7280" }}>
            Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}