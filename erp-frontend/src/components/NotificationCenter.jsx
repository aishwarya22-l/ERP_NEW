import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markRead, markAllRead } from "../api/notificationApi";

const TYPE_ICON = {
  ticket_update:  "🎫",
  asset_assigned: "📦",
  sla_breach:     "⚠️",
};

const ENTITY_PATH = {
  ticket:     (id) => `/tickets/${id}`,
  assignment: ()   => `/assets/assignments`,
};

export default function NotificationCenter() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [open, setOpen]                 = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]             = useState(0);
  const dropRef                         = useRef(null);
  const esRef                           = useRef(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getNotifications();
      setNotifications(res.notifications || []);
      setUnread(res.unread || 0);
    } catch { /* silently fail — notifications are non-critical */ }
  }, [user]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // SSE connection
  useEffect(() => {
    if (!user) return;
    const es = new EventSource("http://localhost:5000/api/sse", { withCredentials: true });
    esRef.current = es;

    es.addEventListener("notification", (e) => {
      try {
        const notif = JSON.parse(e.data);
        setNotifications(prev => [notif, ...prev].slice(0, 30));
        setUnread(n => n + 1);
      } catch {}
    });

    es.onerror = () => {
      // Browser auto-reconnects; no manual retry needed
    };

    return () => { es.close(); esRef.current = null; };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n) => {
    if (!n.is_read) {
      await markRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
      setUnread(c => Math.max(0, c - 1));
    }
    if (n.entity_type && n.entity_id && ENTITY_PATH[n.entity_type]) {
      navigate(ENTITY_PATH[n.entity_type](n.entity_id));
    }
    setOpen(false);
  };

  const handleMarkAll = async () => {
    await markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnread(0);
  };

  if (!user) return null;

  return (
    <div ref={dropRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "relative", background: "none", border: "none",
          cursor: "pointer", padding: "6px 8px", borderRadius: 8,
          color: open ? "#a855f7" : "#6b7280",
          transition: "color 0.15s",
        }}
        title="Notifications"
        aria-label="Notifications"
      >
        <span style={{ fontSize: "1.25rem" }}>🔔</span>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            background: "#ef4444", color: "white",
            borderRadius: "50%", fontSize: "0.65rem",
            fontWeight: 700, minWidth: 16, height: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px", lineHeight: 1,
          }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 320, maxHeight: 420, overflowY: "auto",
          background: "linear-gradient(135deg, #1a1030, #0f0a20)",
          border: "1px solid rgba(168,85,247,0.3)", borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          zIndex: 200,
        }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
              Notifications {unread > 0 && <span style={{ color: "#a855f7" }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                style={{
                  background: "none", border: "none", color: "#a855f7",
                  cursor: "pointer", fontSize: "0.75rem", padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>
              No notifications yet.
            </div>
          ) : notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                display: "flex", gap: 10, padding: "11px 16px",
                cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: n.is_read ? "transparent" : "rgba(168,85,247,0.07)",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(168,85,247,0.13)"}
              onMouseLeave={e => e.currentTarget.style.background = n.is_read ? "transparent" : "rgba(168,85,247,0.07)"}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>
                {TYPE_ICON[n.type] || "🔔"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: n.is_read ? "rgba(255,255,255,0.6)" : "white",
                  fontWeight: n.is_read ? 400 : 600, fontSize: "0.84rem",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {n.title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.76rem", marginTop: 2 }}>
                  {n.message}
                </div>
                <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", marginTop: 3 }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              {!n.is_read && (
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#a855f7", flexShrink: 0, marginTop: 5,
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
