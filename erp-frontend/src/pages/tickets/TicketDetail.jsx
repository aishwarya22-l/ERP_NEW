import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTicketById, updateTicket } from "../../api/ticketApi";
import "../../styles/tickets.css";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];

export default function TicketDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [ticket,  setTicket]  = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("");
  const [saving,  setSaving]  = useState(false);

  const canWrite = user?.role === "admin" || user?.role === "manager";

  const load = async () => {
    try {
      setLoading(true);
      const res = await getTicketById(id);
      setTicket(res.ticket);
      setHistory(res.history || []);
      setStatus(res.ticket.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusSave = async () => {
    try {
      setSaving(true);
      await updateTicket(id, { status });
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
        Loading ticket…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ padding: 40, color: "#f87171", textAlign: "center" }}>
        Ticket not found.
        <br />
        <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate("/tickets")}>
          ← Back
        </button>
      </div>
    );
  }

  const slaMs  = ticket.sla_due_at ? new Date(ticket.sla_due_at).getTime() - Date.now() : null;
  const slaOk  = slaMs === null || ["resolved","closed"].includes(ticket.status);

  return (
    <div className="ticket-detail">
      <div style={{ marginBottom: 16 }}>
        <button className="btn-secondary" onClick={() => navigate("/tickets")}>← Tickets</button>
      </div>

      {/* Main info */}
      <div className="detail-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ margin: 0, color: "white" }}>
            {ticket.escalated && <span style={{ color: "#f87171", marginRight: 8 }}>⚠</span>}
            {ticket.title}
          </h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className={`badge badge-${ticket.priority}`}>{ticket.priority}</span>
            <span className={`badge badge-${ticket.status}`}>{ticket.status.replace("_"," ")}</span>
          </div>
        </div>

        {ticket.description && (
          <p style={{ color: "rgba(255,255,255,0.65)", marginTop: 14, lineHeight: 1.6 }}>
            {ticket.description}
          </p>
        )}

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
          <div className="detail-row">
            <span className="detail-label">Reporter</span>
            <span className="detail-value">{ticket.reporter_name || "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Assignee</span>
            <span className="detail-value">{ticket.assignee_name || "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Department</span>
            <span className="detail-value">{ticket.department_name || "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Category</span>
            <span className="detail-value">{ticket.category || "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Created</span>
            <span className="detail-value">{new Date(ticket.created_at).toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">SLA Due</span>
            <span className="detail-value" style={{ color: slaOk ? "#4ade80" : (slaMs < 0 ? "#f87171" : slaMs < 7200000 ? "#facc15" : "#4ade80") }}>
              {ticket.sla_due_at ? new Date(ticket.sla_due_at).toLocaleString() : "—"}
              {!slaOk && slaMs < 0 && " (OVERDUE)"}
            </span>
          </div>
          {ticket.resolved_at && (
            <div className="detail-row">
              <span className="detail-label">Resolved</span>
              <span className="detail-value">{new Date(ticket.resolved_at).toLocaleString()}</span>
            </div>
          )}
          {ticket.escalated_at && (
            <div className="detail-row">
              <span className="detail-label">Escalated</span>
              <span className="detail-value" style={{ color: "#f87171" }}>
                {new Date(ticket.escalated_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick status update */}
      {canWrite && (
        <div className="detail-card">
          <h3>Update Status</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)",
                       background: "rgba(255,255,255,0.06)", color: "white", minWidth: 160 }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s} style={{ background: "#1a1030" }}>{s.replace("_"," ")}</option>
              ))}
            </select>
            <button className="btn-primary" disabled={saving || status === ticket.status} onClick={handleStatusSave}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Audit history */}
      <div className="detail-card">
        <h3>History</h3>
        {history.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem" }}>No history yet.</p>
        ) : history.map(h => (
          <div key={h.id} className="history-entry">
            <span className="history-time">{new Date(h.created_at).toLocaleString()}</span>
            <span>
              <span className="history-actor">{h.actor_name || "System"}</span>
              {" "}
              <span className="history-action">
                {h.action === "create" && "created this ticket"}
                {h.action === "update" && (() => {
                  try {
                    const after = JSON.parse(h.after_data || "{}");
                    if (after.status) return `changed status to "${after.status}"`;
                    if (after.assignee_id) return "updated assignee";
                    if (after.priority) return `changed priority to "${after.priority}"`;
                    return "updated ticket";
                  } catch { return "updated ticket"; }
                })()}
                {h.action === "delete" && "deleted this ticket"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
