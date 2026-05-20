import db from "../config/db.js";
import { logEvent } from "../services/auditService.js";
import { computeDueAt, checkEscalations } from "../services/slaService.js";
import { send as notify } from "../services/notificationService.js";

// GET ALL (paginated, filterable)
export const getTickets = async (req, res) => {
  try {
    await checkEscalations();

    const page     = parseInt(req.query.page)     || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset   = (page - 1) * pageSize;

    const { status, priority, assignee_id } = req.query;

    const conditions = [];
    const params     = [];

    if (status)      { conditions.push("t.status = ?");      params.push(status); }
    if (priority)    { conditions.push("t.priority = ?");    params.push(priority); }
    if (assignee_id) { conditions.push("t.assignee_id = ?"); params.push(assignee_id); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM tickets t ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT t.*,
              r.name   AS reporter_name,
              a.name   AS assignee_name,
              d.name   AS department_name,
              ast.name AS asset_name
       FROM tickets t
       LEFT JOIN employees   r   ON t.reporter_id   = r.id
       LEFT JOIN employees   a   ON t.assignee_id   = a.id
       LEFT JOIN departments d   ON t.department_id = d.id
       LEFT JOIN assets      ast ON t.asset_id      = ast.id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({ data: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tickets" });
  }
};

// GET BY ID (with audit history)
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[ticket]] = await db.query(
      `SELECT t.*,
              r.name   AS reporter_name,
              a.name   AS assignee_name,
              d.name   AS department_name,
              ast.name AS asset_name
       FROM tickets t
       LEFT JOIN employees   r   ON t.reporter_id   = r.id
       LEFT JOIN employees   a   ON t.assignee_id   = a.id
       LEFT JOIN departments d   ON t.department_id = d.id
       LEFT JOIN assets      ast ON t.asset_id      = ast.id
       WHERE t.id = ?`,
      [id]
    );

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const [history] = await db.query(
      `SELECT id, actor_name, actor_role, action, before_data, after_data, created_at
       FROM audit_logs
       WHERE entity_type = 'ticket' AND entity_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({ ticket, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching ticket" });
  }
};

// CREATE
export const createTicket = async (req, res) => {
  try {
    const {
      title, description, reporter_id, assignee_id,
      department_id, asset_id, category, priority = "medium"
    } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const sla_due_at = computeDueAt(priority);

    const [result] = await db.query(
      `INSERT INTO tickets
       (title, description, reporter_id, assignee_id, department_id, asset_id, category, priority, sla_due_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, reporter_id || null, assignee_id || null,
       department_id || null, asset_id || null, category || null, priority, sla_due_at]
    );

    logEvent(req.session.user, "ticket", result.insertId, "create", null,
      { title, priority, assignee_id, department_id, asset_id, sla_due_at });

    res.status(201).json({ message: "Ticket created", id: result.insertId, sla_due_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating ticket" });
  }
};

// UPDATE
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, assignee_id, department_id,
      category, priority, status
    } = req.body;

    const [[before]] = await db.query("SELECT * FROM tickets WHERE id = ?", [id]);
    if (!before) return res.status(404).json({ message: "Ticket not found" });

    const resolved_at = status === "resolved" && before.status !== "resolved"
      ? new Date()
      : before.resolved_at;

    // Recompute SLA if priority changed
    const sla_due_at = priority && priority !== before.priority
      ? computeDueAt(priority)
      : before.sla_due_at;

    await db.query(
      `UPDATE tickets
       SET title         = ?,
           description   = ?,
           assignee_id   = ?,
           department_id = ?,
           category      = ?,
           priority      = ?,
           status        = ?,
           sla_due_at    = ?,
           resolved_at   = ?
       WHERE id = ?`,
      [
        title          ?? before.title,
        description    ?? before.description,
        assignee_id    !== undefined ? assignee_id    || null : before.assignee_id,
        department_id  !== undefined ? department_id  || null : before.department_id,
        category       ?? before.category,
        priority       ?? before.priority,
        status         ?? before.status,
        sla_due_at,
        resolved_at,
        id
      ]
    );

    logEvent(req.session.user, "ticket", id, "update", before,
      { title, status, priority, assignee_id, department_id });

    // Notify reporter and assignee on status change
    if (status && status !== before.status) {
      const actor = req.session.user?.name || "Someone";
      const msg   = `Ticket "${before.title}" status changed to ${status}`;
      if (before.reporter_id) notify(before.reporter_id, "ticket_update", "Ticket Updated", msg, "ticket", id);
      if (before.assignee_id && before.assignee_id !== before.reporter_id) {
        notify(before.assignee_id, "ticket_update", "Ticket Updated", msg, "ticket", id);
      }
    }

    res.json({ message: "Ticket updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating ticket" });
  }
};

// DELETE (admin only — enforced in route)
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const [[before]] = await db.query("SELECT * FROM tickets WHERE id = ?", [id]);
    if (!before) return res.status(404).json({ message: "Ticket not found" });

    await db.query("DELETE FROM tickets WHERE id = ?", [id]);

    logEvent(req.session.user, "ticket", id, "delete", before, null);

    res.json({ message: "Ticket deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting ticket" });
  }
};
