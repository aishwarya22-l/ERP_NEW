import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTickets, createTicket, updateTicket, deleteTicket } from "../../api/ticketApi";
import { getDepartments } from "../../api/departmentApi";
import { getEmployees } from "../../api/userApi";
import { getAssets } from "../../api/assetApi";
import "../../styles/tickets.css";

const PRIORITY_LEVELS = ["low", "medium", "high", "urgent"];
const STATUS_OPTIONS  = ["open", "in_progress", "resolved", "closed"];

function slaDisplay(sla_due_at, status) {
  if (["resolved", "closed"].includes(status)) return null;
  const now   = Date.now();
  const due   = new Date(sla_due_at).getTime();
  const diffMs = due - now;
  if (diffMs <= 0) return <span className="sla-breach">OVERDUE</span>;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const cls = h < 2 ? "sla-warn" : "sla-ok";
  return <span className={cls}>{h}h {m}m left</span>;
}

const EMPTY_FORM = {
  title: "", description: "", priority: "medium",
  assignee_id: "", department_id: "", asset_id: "", category: ""
};

export default function Tickets() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [assets, setAssets]           = useState([]);

  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  const isAdmin   = user?.role === "admin";
  const isManager = user?.role === "manager";
  const canEdit   = isAdmin || isManager;
  const canWrite  = true;

  const fetchTickets = useCallback(async () => {
    try {
      const res = await getTickets({
        page,
        pageSize: 15,
        status:   filterStatus   || undefined,
        priority: filterPriority || undefined,
      });
      setTickets(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    }
  }, [page, filterStatus, filterPriority]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    Promise.all([getDepartments(), getEmployees(1, 200), getAssets(1, 200)])
      .then(([deps, emps, assetRes]) => {
        setDepartments(deps);
        setEmployees(emps.data || []);
        setAssets(assetRes.data || []);
      })
      .catch(console.error);
  }, []);

  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(false); };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };

  const openEdit = (t) => {
    setForm({
      title:         t.title,
      description:   t.description  || "",
      priority:      t.priority,
      assignee_id:   t.assignee_id   || "",
      department_id: t.department_id || "",
      asset_id:      t.asset_id      || "",
      category:      t.category      || "",
    });
    setEditId(t.id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Title is required");
    try {
      if (editId) {
        await updateTicket(editId, form);
      } else {
        await createTicket({ ...form, reporter_id: user?.id });
      }
      resetForm();
      fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    try {
      await deleteTicket(id);
      fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="tickets-page">
      <div className="tickets-header">
        <h2>Tickets</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem" }}>
            {total} ticket{total !== 1 ? "s" : ""}
          </span>
          {canWrite && (
            <button className="btn-primary" onClick={openCreate}>+ New Ticket</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="tickets-filters">
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {["open","in_progress","resolved","closed","escalated"].map(s => (
            <option key={s} value={s}>{s.replace("_"," ")}</option>
          ))}
        </select>
        <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="tickets-table-wrap">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Asset</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>SLA</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">No tickets found.</div>
                </td>
              </tr>
            ) : tickets.map(t => (
              <tr key={t.id}>
                <td style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>#{t.id}</td>
                <td>
                  <button
                    style={{ background: "none", border: "none", color: "white", cursor: "pointer",
                             fontWeight: 500, textAlign: "left", padding: 0 }}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                  >
                    {t.title}
                    {t.escalated ? <span style={{ color: "#f87171", marginLeft: 6 }}>⚠</span> : null}
                  </button>
                </td>
                <td style={{ fontSize: "0.82rem" }}>
                  {t.asset_name || <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>}
                </td>
                <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                <td><span className={`badge badge-${t.status}`}>{t.status.replace("_"," ")}</span></td>
                <td>{t.assignee_name || <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>}</td>
                <td>{t.sla_due_at ? slaDisplay(t.sla_due_at, t.status) : "—"}</td>
                <td style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
                <td>
                  {canEdit && (
                    <button className="btn-icon" title="Edit" onClick={() => openEdit(t)}>✏️</button>
                  )}
                  <button className="btn-icon" title="View" onClick={() => navigate(`/tickets/${t.id}`)}>👁</button>
                  {isAdmin && (
                    <button className="btn-icon" title="Delete" onClick={() => handleDelete(t.id)}>🗑</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && resetForm()}>
          <div className="modal-box">
            <h3>{editId ? "Edit Ticket" : "New Ticket"}</h3>

            <input
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {editId && (
              <select value={form.status || ""} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="">— Status —</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            )}
            <select
              value={form.assignee_id}
              onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}
            >
              <option value="">— Assignee (optional) —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select
              value={form.department_id}
              onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
            >
              <option value="">— Department (optional) —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select
              value={form.asset_id}
              onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))}
            >
              <option value="">— Related Asset (optional) —</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name}{a.asset_tag ? ` (${a.asset_tag})` : ""}</option>
              ))}
            </select>
            <input
              placeholder="Category (optional)"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={resetForm}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
