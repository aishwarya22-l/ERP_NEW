# Real-Time Ticket Notification System — Design Spec
Date: 2026-05-21

## Summary
Wire up the existing but dormant notification infrastructure so that when an employee raises a maintenance ticket, all assets-role users receive an instant in-app notification with sound via SSE. No new tables, routes, or services are needed.

## Current State
The following are already built and working:
- `Backend/sse.js` — SSE connection manager with `notifyUser` and `broadcast`
- `Backend/routes/sseRoutes.js` — `/api/sse` endpoint, auth-gated, heartbeat enabled
- `Backend/services/notificationService.js` — `send(userId, type, title, message, entityType, entityId)` writes to DB and fires SSE in one call
- `Backend/migrations/004_notifications.sql` — `notifications` table exists
- `Backend/controllers/notificationController.js` — CRUD for notifications
- `erp-frontend/src/components/NotificationCenter.jsx` — bell icon, dropdown, SSE listener, read/unread, empty state — already in AppLayout topbar

## What Is Missing (the gap)
`createMaintenanceLog` in `Backend/controllers/maintenanceController.js` never calls `notificationService.send()`, so no notification is ever created or pushed when a ticket is raised.

Additionally, `NotificationCenter.jsx` does not:
- Play a sound on new SSE events
- Recognise `new_ticket` as a notification type (icon)
- Handle `maintenance` as an entity type for navigation

## Architecture
```
Employee submits RaiseTicket form
  → POST /api/maintenance
  → createMaintenanceLog (maintenanceController.js)
      INSERT maintenance_logs ✓ (existing)
      Query employees WHERE role = 'assets'
      For each assets user:
        notificationService.send()  ← NEW
          INSERT notifications row
          notifyUser() → SSE push
  → Assets-role users' NotificationCenter receives 'notification' SSE event
      Prepend notification to list
      Increment badge counter
      Play notification sound  ← NEW
```

## Changes Required

### 1. `Backend/controllers/maintenanceController.js`
In `createMaintenanceLog`, after the successful INSERT and before the `res.status(201).json(...)` response:

```js
import { send } from "../services/notificationService.js";

// After result = await db.query(INSERT...)
const [assetUsers] = await db.query(
  "SELECT id FROM employees WHERE role = 'assets'"
);
const employeeName = req.session.user?.name ?? `Employee #${raised_by}`;
for (const u of assetUsers) {
  send(
    u.id,
    "new_ticket",
    `New Ticket #${result.insertId} — ${priority.toUpperCase()}`,
    `${employeeName} reported an issue with ${asset.name}: ${issue.trim()}`,
    "maintenance",
    result.insertId
  );
}
```

`send()` is fire-and-forget (never throws), so this is safe to add without try/catch.

### 2. `erp-frontend/src/components/NotificationCenter.jsx`

**Add `new_ticket` to `TYPE_ICON`:**
```js
const TYPE_ICON = {
  new_ticket:     "🎫",
  ticket_update:  "🎫",
  asset_assigned: "📦",
  sla_breach:     "⚠️",
};
```

**Add `maintenance` to `ENTITY_PATH`:**
```js
const ENTITY_PATH = {
  ticket:      (id) => `/tickets/${id}`,
  assignment:  ()   => `/assets/assignments`,
  maintenance: ()   => `/assets/maintenance`,
};
```

**Add notification sound on SSE event:**
Use the Web Audio API to generate a short, subtle tone (no audio file dependency):
```js
function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}
```
Call `playNotifSound()` inside the SSE `notification` event handler.

**Add slide-in animation for new notifications:**
CSS keyframe `notif-slide-in` applied to the first item in the list when unread.

## Recipient Scope
Only users with `role = 'assets'` in the `employees` table receive notifications. Admin and employee roles are excluded.

## Navigation Target
Clicking a `maintenance` notification routes to `/assets/maintenance` (the maintenance log list page), which is the correct admin-facing view for maintenance tickets.

## Non-Goals
- No changes to the notifications schema or migrations
- No changes to any other ticket flow (Tickets.jsx, ticketController.js)
- No changes to employee-facing views
- No email changes (email stub remains as-is)
