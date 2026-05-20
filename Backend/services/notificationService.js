import db from "../config/db.js";
import { notifyUser } from "../sse.js";

/**
 * Send an in-app notification to a user.
 * Persists to DB (notifications table) and pushes over SSE if connected.
 * Never throws — notification failure must not break the caller.
 *
 * @param {number}      userId
 * @param {string}      type        e.g. 'ticket_update', 'asset_assigned', 'sla_breach'
 * @param {string}      title
 * @param {string}      message
 * @param {string|null} entityType  e.g. 'ticket', 'assignment'
 * @param {number|null} entityId
 */
export const send = async (userId, type, title, message, entityType = null, entityId = null) => {
  if (!userId) return;
  try {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, entityType, entityId]
    );

    // Push SSE event to user if they have an open connection
    notifyUser(userId, "notification", {
      id:          result.insertId,
      type,
      title,
      message,
      entity_type: entityType,
      entity_id:   entityId,
      is_read:     0,
      created_at:  new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[notify] failed for user ${userId}:`, err.message);
  }
};

/**
 * Email-ready stub — replace with nodemailer / SendGrid / SES when needed.
 */
export const sendEmail = async (to, subject, body) => {
  console.log(`[email-stub] To: ${to} | Subject: ${subject} | Body: ${body}`);
};
