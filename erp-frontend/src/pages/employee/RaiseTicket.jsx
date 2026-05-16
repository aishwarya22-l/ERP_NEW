import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiCheckCircle, FiSend } from "react-icons/fi";
import EmployeeSectionHeader from "./EmployeeSectionHeader";
import { createMaintenanceLog } from "../../api/maintenanceApi";
import { getAssets, getAssignedAssets } from "../../api/assetApi";
import "../../styles/employee.css";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const MAINTENANCE_TYPES = ["Hardware", "Software", "Network", "Electrical", "Plumbing", "HVAC", "Other"];

export default function RaiseTicket() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    asset_id: "",
    issue: "",
    priority: "medium",
    maintenance_type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch available + assigned assets; fall back to full list if the endpoint fails
    Promise.allSettled([getAssets(1, 200), getAssignedAssets()])
      .then(([allRes]) => {
        const all = allRes.status === "fulfilled" ? (allRes.value.data || []) : [];
        setAssets(all.filter(a => a.status === "available" || a.status === "assigned"));
      })
      .catch(() => setAssets([]));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.asset_id) return setError("Please select an asset.");
    if (!form.issue.trim() || form.issue.trim().length < 5)
      return setError("Issue description must be at least 5 characters.");

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await createMaintenanceLog({
        asset_id: Number(form.asset_id),
        issue: form.issue.trim(),
        priority: form.priority,
        maintenance_type: form.maintenance_type || null,
      });
      setSuccess(`Ticket #${res.id} submitted successfully. The Asset Team will review it shortly.`);
      setForm({ asset_id: "", issue: "", priority: "medium", maintenance_type: "" });
    } catch (err) {
      setError(err.message || "Failed to raise ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="employee-page">
      <EmployeeSectionHeader
        title="Raise a Ticket"
        subtitle="Report an asset issue and notify the Asset Team"
      />

      <div className="employee-panel">
        {success && (
          <div className="rt-alert rt-alert--success">
            <FiCheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="rt-alert rt-alert--error">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="rt-form" onSubmit={handleSubmit} noValidate>
          <div className="rt-form__row">
            <label className="rt-label" htmlFor="asset_id">Asset <span className="rt-required">*</span></label>
            <select
              id="asset_id"
              name="asset_id"
              className="rt-select"
              value={form.asset_id}
              onChange={handleChange}
              required
            >
              <option value="">— Select an asset —</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.asset_tag ? `(${a.asset_tag})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="rt-form__row">
            <label className="rt-label" htmlFor="maintenance_type">Issue Type</label>
            <select
              id="maintenance_type"
              name="maintenance_type"
              className="rt-select"
              value={form.maintenance_type}
              onChange={handleChange}
            >
              <option value="">— Select type —</option>
              {MAINTENANCE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="rt-form__row">
            <label className="rt-label" htmlFor="priority">Priority <span className="rt-required">*</span></label>
            <div className="rt-priority-group">
              {PRIORITIES.map(p => (
                <label key={p} className={`rt-priority-option rt-priority-option--${p} ${form.priority === p ? "rt-priority-option--active" : ""}`}>
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={form.priority === p}
                    onChange={handleChange}
                  />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="rt-form__row">
            <label className="rt-label" htmlFor="issue">Issue Description <span className="rt-required">*</span></label>
            <textarea
              id="issue"
              name="issue"
              className="rt-textarea"
              rows={4}
              placeholder="Describe the problem in detail…"
              value={form.issue}
              onChange={handleChange}
              required
            />
            <span className="rt-hint">{form.issue.length} characters (min 5)</span>
          </div>

          <div className="rt-form__actions">
            <button
              type="button"
              className="rt-btn rt-btn--ghost"
              onClick={() => navigate("/employee/tickets")}
            >
              View My Tickets
            </button>
            <button
              type="submit"
              className="rt-btn rt-btn--primary"
              disabled={submitting}
            >
              <FiSend size={14} />
              {submitting ? "Submitting…" : "Raise Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
