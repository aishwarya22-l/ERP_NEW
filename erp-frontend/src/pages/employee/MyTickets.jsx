import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiPlusCircle, FiClock, FiUser, FiTool, FiAlertCircle } from "react-icons/fi";
import EmployeeSectionHeader from "./EmployeeSectionHeader";
import { getMyTickets, reopenTicket } from "../../api/maintenanceApi";
import "../../styles/employee.css";

const STATUS_LABEL = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
  reopened:    "Reopened",
};

function StatusBadge({ status }) {
  return (
    <span className={`mt-badge mt-badge--${status}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`mt-badge mt-badge--priority-${priority}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
}

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reopenError, setReopenError] = useState(null);
  const [reopening, setReopening] = useState(null);

  const fetchTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load tickets.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Poll every 30 seconds for status updates from the Asset Team
  useEffect(() => {
    const timer = setInterval(() => fetchTickets(true), 30_000);
    return () => clearInterval(timer);
  }, [fetchTickets]);

  const handleReopen = async (ticketId) => {
    setReopening(ticketId);
    setReopenError(null);
    try {
      await reopenTicket(ticketId);
      await fetchTickets(true);
    } catch (err) {
      setReopenError(err.message || "Failed to reopen ticket.");
    } finally {
      setReopening(null);
    }
  };

  const formatDate = iso => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div className="employee-page">
      <EmployeeSectionHeader
        title="My Tickets"
        subtitle="Track the status of tickets you have raised"
      />

      <div className="mt-toolbar">
        <button
          className="rt-btn rt-btn--ghost"
          onClick={() => fetchTickets()}
          disabled={loading}
          title="Refresh"
        >
          <FiRefreshCw size={14} className={loading ? "mt-spin" : ""} />
          Refresh
        </button>
        <button
          className="rt-btn rt-btn--primary"
          onClick={() => navigate("/employee/raise-ticket")}
        >
          <FiPlusCircle size={14} />
          Raise New Ticket
        </button>
      </div>

      {(error || reopenError) && (
        <div className="rt-alert rt-alert--error">
          <FiAlertCircle size={16} />
          <span>{error || reopenError}</span>
        </div>
      )}

      {loading && (
        <div className="employee-panel">
          <p>Loading your tickets…</p>
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="employee-panel mt-empty">
          <p>You have not raised any tickets yet.</p>
          <button
            className="rt-btn rt-btn--primary"
            onClick={() => navigate("/employee/raise-ticket")}
          >
            <FiPlusCircle size={14} />
            Raise Your First Ticket
          </button>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="mt-card-list">
          {tickets.map(ticket => (
            <div key={ticket.id} className="mt-ticket-card">
              <div className="mt-ticket-card__header">
                <span className="mt-ticket-id">#{ticket.id}</span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div className="mt-ticket-card__body">
                <div className="mt-field">
                  <span className="mt-field__label"><FiTool size={12} /> Asset</span>
                  <span className="mt-field__value">
                    {ticket.asset_name || "—"}
                    {ticket.asset_tag && <span className="mt-asset-tag">{ticket.asset_tag}</span>}
                  </span>
                </div>

                <div className="mt-field mt-field--full">
                  <span className="mt-field__label">Issue</span>
                  <span className="mt-field__value mt-field__value--issue">{ticket.issue}</span>
                </div>

                {ticket.maintenance_type && (
                  <div className="mt-field">
                    <span className="mt-field__label">Type</span>
                    <span className="mt-field__value">{ticket.maintenance_type}</span>
                  </div>
                )}

                <div className="mt-field">
                  <span className="mt-field__label"><FiUser size={12} /> Technician</span>
                  <span className="mt-field__value">{ticket.technician || <span className="mt-unassigned">Unassigned</span>}</span>
                </div>

                <div className="mt-field">
                  <span className="mt-field__label"><FiClock size={12} /> Raised</span>
                  <span className="mt-field__value">{formatDate(ticket.created_at)}</span>
                </div>

                {ticket.completion_date && (
                  <div className="mt-field">
                    <span className="mt-field__label">Resolved On</span>
                    <span className="mt-field__value">{formatDate(ticket.completion_date)}</span>
                  </div>
                )}

                {ticket.notes && (
                  <div className="mt-field mt-field--full">
                    <span className="mt-field__label">Resolution Notes</span>
                    <span className="mt-field__value mt-field__value--notes">{ticket.notes}</span>
                  </div>
                )}
              </div>

              {ticket.status === "closed" && (
                <div className="mt-ticket-card__footer">
                  <button
                    className="rt-btn rt-btn--reopen"
                    onClick={() => handleReopen(ticket.id)}
                    disabled={reopening === ticket.id}
                  >
                    <FiRefreshCw size={13} />
                    {reopening === ticket.id ? "Reopening…" : "Reopen Ticket"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
