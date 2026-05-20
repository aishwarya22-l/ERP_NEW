import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

const ACTION_COLOR = { create: "#4ade80", update: "#facc15", delete: "#f87171" };
const ACTION_VERB  = { create: "created", update: "updated", delete: "deleted" };

export default function ActivityFeed({ limit = 10 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/audit-logs?limit=${limit}`)
      .then(data => setEvents(Array.isArray(data) ? data : data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", padding: "12px 0" }}>
        Loading activity…
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", padding: "12px 0" }}>
        No recent activity.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {events.map((e, i) => (
        <div
          key={e.id || i}
          style={{
            display: "flex", gap: 10, padding: "9px 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Dot */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: ACTION_COLOR[e.action] || "#94a3b8",
            }} />
            {i < events.length - 1 && (
              <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.07)", marginTop: 4 }} />
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <div style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.8)" }}>
              <span style={{ color: "#a855f7", fontWeight: 600 }}>{e.actor_name || "System"}</span>
              {" "}
              <span style={{ color: ACTION_COLOR[e.action] || "#94a3b8" }}>
                {ACTION_VERB[e.action] || e.action}
              </span>
              {" "}
              <span style={{ color: "rgba(255,255,255,0.6)" }}>
                {e.entity_type} #{e.entity_id}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", marginTop: 2 }}>
              {new Date(e.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
