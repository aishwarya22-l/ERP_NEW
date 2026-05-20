import db from "../config/db.js";

const SLA_HOURS = {
  urgent: 4,
  high:   8,
  medium: 24,
  low:    72,
};

export const computeDueAt = (priority) => {
  const hours = SLA_HOURS[priority] ?? 24;
  const due = new Date();
  due.setHours(due.getHours() + hours);
  return due;
};

/**
 * Lazily check for SLA breaches and mark tickets as escalated.
 * Called on each GET /api/tickets so no cron is needed.
 */
export const checkEscalations = async () => {
  try {
    await db.query(`
      UPDATE tickets
      SET escalated    = 1,
          escalated_at = NOW(),
          status       = 'escalated'
      WHERE sla_due_at < NOW()
        AND escalated  = 0
        AND status NOT IN ('resolved', 'closed', 'escalated')
    `);
  } catch (err) {
    console.error("[sla] escalation check failed:", err.message);
  }
};
