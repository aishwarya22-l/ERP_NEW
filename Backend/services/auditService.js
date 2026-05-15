import db from "../config/db.js";

/**
 * Records a create/update/delete event in audit_logs.
 * Fire-and-forget safe — never throws, so a failed write never breaks the caller.
 *
 * @param {object|null} actor       - req.session.user (id, name, role) or null
 * @param {string}      entityType  - e.g. 'employee', 'asset', 'ticket'
 * @param {number}      entityId    - primary key of the affected row
 * @param {'create'|'update'|'delete'} action
 * @param {object|null} beforeData  - snapshot before the change (null for creates)
 * @param {object|null} afterData   - snapshot after the change (null for deletes)
 */
export const logEvent = async (actor, entityType, entityId, action, beforeData, afterData) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (actor_id, actor_name, actor_role, entity_type, entity_id, action, before_data, after_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actor?.id   ?? null,
        actor?.name ?? null,
        actor?.role ?? null,
        entityType,
        entityId,
        action,
        beforeData ? JSON.stringify(beforeData) : null,
        afterData  ? JSON.stringify(afterData)  : null,
      ]
    );
  } catch (err) {
    console.error(`[audit] failed to log ${action} on ${entityType}#${entityId}:`, err.message);
  }
};
