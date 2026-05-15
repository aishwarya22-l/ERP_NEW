import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api.js";
import { FiSearch, FiX, FiUser, FiPackage, FiAlertCircle } from "react-icons/fi";

const STATUS_COLOR = {
  available: "#4ade80", assigned: "#fb923c", maintenance: "#f87171", retired: "#94a3b8",
  open: "#60a5fa", in_progress: "#a78bfa", resolved: "#4ade80", closed: "#94a3b8", escalated: "#f87171",
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearch() {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const wrapRef                 = useRef(null);
  const inputRef                = useRef(null);
  const navigate                = useNavigate();
  const debouncedQuery          = useDebounce(query, 260);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults(null); setOpen(false); return; }
    setLoading(true);
    apiRequest(`/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(d => { setResults(d); setOpen(true); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(!!query);
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [query]);

  const hasResults = results && (
    results.employees?.length || results.assets?.length || results.tickets?.length
  );

  const go = (path) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1, maxWidth: 420 }}>
      {/* Input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#f3f4f6", border: "1px solid #e5e7eb",
        borderRadius: 10, padding: "7px 12px",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: open ? "0 0 0 3px rgba(168,85,247,0.15)" : "none",
        borderColor: open ? "rgba(168,85,247,0.5)" : "#e5e7eb",
      }}>
        <FiSearch size={15} style={{ color: "#9ca3af", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results) setOpen(true); }}
          placeholder="Search employees, assets, tickets… (Ctrl+K)"
          style={{
            border: "none", background: "none", outline: "none",
            fontSize: "0.875rem", color: "#374151", width: "100%",
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(null); setOpen(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex" }}>
            <FiX size={14} />
          </button>
        )}
        {loading && (
          <span style={{ width: 14, height: 14, border: "2px solid #e5e7eb", borderTopColor: "#a855f7", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 300,
          maxHeight: 420, overflowY: "auto",
        }}>
          {!hasResults ? (
            <div style={{ padding: "20px 16px", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
              No results for "{query}"
            </div>
          ) : (
            <>
              {/* Employees */}
              {results.employees?.length > 0 && (
                <Section title="Employees" icon={<FiUser size={12} />}>
                  {results.employees.map(e => (
                    <ResultRow
                      key={`emp-${e.id}`}
                      primary={e.name}
                      secondary={`${e.department || "—"}  ·  ${e.email}`}
                      badge={e.role}
                      badgeColor="#6366f1"
                      onClick={() => go(`/admin/users`)}
                    />
                  ))}
                </Section>
              )}

              {/* Assets */}
              {results.assets?.length > 0 && (
                <Section title="Assets" icon={<FiPackage size={12} />}>
                  {results.assets.map(a => (
                    <ResultRow
                      key={`asset-${a.id}`}
                      primary={a.name}
                      secondary={`${a.asset_tag}  ·  ${a.category_name || "No category"}`}
                      badge={a.status}
                      badgeColor={STATUS_COLOR[a.status] || "#94a3b8"}
                      onClick={() => go(`/assets/assets`)}
                    />
                  ))}
                </Section>
              )}

              {/* Tickets */}
              {results.tickets?.length > 0 && (
                <Section title="Tickets" icon={<FiAlertCircle size={12} />}>
                  {results.tickets.map(t => (
                    <ResultRow
                      key={`tkt-${t.id}`}
                      primary={t.title}
                      secondary={`#${t.id}  ·  ${t.priority}`}
                      badge={t.status}
                      badgeColor={STATUS_COLOR[t.status] || "#94a3b8"}
                      onClick={() => go(`/tickets/${t.id}`)}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px 4px", fontSize: "0.7rem", fontWeight: 700,
        color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em",
        borderTop: "1px solid #f3f4f6",
      }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function ResultRow({ primary, secondary, badge, badgeColor, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 14px", cursor: "pointer",
        background: hovered ? "#f9f5ff" : "transparent",
        transition: "background 0.1s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.84rem", fontWeight: 500, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {primary}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }}>
          {secondary}
        </div>
      </div>
      <span style={{
        fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px",
        borderRadius: 99, background: badgeColor + "22", color: badgeColor,
        flexShrink: 0, textTransform: "capitalize",
      }}>
        {badge}
      </span>
    </div>
  );
}
