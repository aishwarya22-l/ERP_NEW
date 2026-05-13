import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiPackage, FiUsers, FiAlertCircle, FiTool,
  FiTrendingUp, FiActivity, FiClock, FiCheckCircle,
  FiArrowUpRight, FiArrowDownRight, FiMoreHorizontal,
  FiRefreshCw, FiBell, FiCalendar
} from "react-icons/fi";
import "../styles/dashboard.css";

/* ── Animated ring hook (drives SVG stroke-dasharray) ────── */
function useRingFill(target, total = 314) {
  const [dash, setDash] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDash(target));
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return dash;
}

/* ── Animated counter hook ───────────────────────────────── */
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* ── KPI stat card ───────────────────────────────────────── */
function StatCard({ icon, label, value, trend, trendLabel, gradient, delay = 0 }) {
  const animated = useCountUp(typeof value === "number" ? value : 0);
  return (
    <div
      className="stat-card animate-fade-up"
      style={{ animationDelay: `${delay}s`, "--card-gradient": gradient }}
    >
      <div className="stat-card__header">
        <div className="stat-card__icon" style={{ background: gradient }}>
          {icon}
        </div>
        <button className="stat-card__more"><FiMoreHorizontal /></button>
      </div>

      <div className="stat-card__value">
        {typeof value === "number" ? animated.toLocaleString() : value}
        {typeof value === "string" && value.endsWith("%") && ""}
      </div>

      <div className="stat-card__label">{label}</div>

      {trend !== undefined && (
        <div className={`stat-card__trend ${trend >= 0 ? "up" : "down"}`}>
          {trend >= 0
            ? <FiArrowUpRight size={13} />
            : <FiArrowDownRight size={13} />}
          <span>{Math.abs(trend)}%</span>
          <span className="trend-label">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

/* ── Progress bar row ────────────────────────────────────── */
function ProgressRow({ label, value, max, color, icon }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="progress-row">
      <div className="progress-row__meta">
        <span className="progress-row__icon" style={{ color }}>{icon}</span>
        <span className="progress-row__label">{label}</span>
        <span className="progress-row__pct" style={{ color }}>{pct}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ "--target-width": `${pct}%`, background: color }}
        />
      </div>
      <div className="progress-row__counts">
        <span>{value} / {max}</span>
      </div>
    </div>
  );
}

/* ── Activity item ───────────────────────────────────────── */
function ActivityItem({ icon, text, time, status, delay = 0 }) {
  return (
    <div className="activity-item animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className={`activity-dot activity-dot--${status}`} />
      <div className="activity-body">
        <span className="activity-icon">{icon}</span>
        <div className="activity-text-wrap">
          <p className="activity-text">{text}</p>
          <span className="activity-time">{time}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Team member row ─────────────────────────────────────── */
function TeamRow({ initials, name, tasks, status, dept, delay = 0 }) {
  const statusMap = {
    "On Track":   "success",
    "Overloaded": "warning",
    "At Risk":    "danger",
    "Idle":       "info",
  };
  const color = statusMap[status] || "info";
  return (
    <tr className="team-row animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <td>
        <div className="team-member">
          <div className="team-avatar">{initials}</div>
          <div>
            <p className="team-name">{name}</p>
            <p className="team-dept">{dept}</p>
          </div>
        </div>
      </td>
      <td>
        <span className="task-badge">{tasks}</span>
      </td>
      <td>
        <span className={`status-chip status-chip--${color}`}>{status}</span>
      </td>
    </tr>
  );
}

/* ── Mini chart bar ──────────────────────────────────────── */
function MiniBar({ height, label, active }) {
  return (
    <div className="mini-bar-wrap">
      <div
        className={`mini-bar ${active ? "mini-bar--active" : ""}`}
        style={{ height: `${height}%` }}
      />
      <span className="mini-bar-label">{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  /* Live clock */
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Fetch stats — falls back gracefully if backend is down */
  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard-stats", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => {
        setData({
          totalAssets: 248, activeUsers: 54, pendingTasks: 17,
          maintenance: 8, completed: 189, totalTasks: 220,
          hours: 1340, pending: 17, overdue: 4
        });
        setLoading(false);
      });
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (d) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  const formatDate = (d) =>
    d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const completionPct = data.totalTasks
    ? Math.round((data.completed / data.totalTasks) * 100)
    : 0;
  const ringDash = useRingFill(completionPct * 3.14);

  return (
    <div className="dashboard">

      {/* ── Page header ── */}
      <header className="dash-header animate-fade-up">
        <div className="dash-greeting">
          <h1 className="dash-title">
            {greeting()}, <span className="gradient-text">{user?.name?.split(" ")[0] || "User"}</span> 👋
          </h1>
          <p className="dash-subtitle">Here's what's happening across your workspace today.</p>
        </div>
        <div className="dash-header-right">
          <div className="dash-clock">
            <FiClock size={14} />
            <span>{formatTime(time)}</span>
          </div>
          <div className="dash-date">
            <FiCalendar size={14} />
            <span>{formatDate(time)}</span>
          </div>
          <button className="dash-refresh-btn" onClick={() => setLoading(true)}>
            <FiRefreshCw size={15} />
          </button>
          <button className="dash-notify-btn">
            <FiBell size={16} />
            {data.overdue > 0 && <span className="notify-badge">{data.overdue}</span>}
          </button>
        </div>
      </header>

      {/* ── KPI Stat Cards ── */}
      <section className="dash-stats">
        <StatCard
          icon={<FiPackage size={20} />}
          label="Total Assets"
          value={data.totalAssets || 248}
          trend={12}
          trendLabel="vs last month"
          gradient="linear-gradient(135deg, #7c3aed, #a855f7)"
          delay={0.05}
        />
        <StatCard
          icon={<FiUsers size={20} />}
          label="Active Users"
          value={data.activeUsers || 54}
          trend={5}
          trendLabel="this week"
          gradient="linear-gradient(135deg, #0284c7, #38bdf8)"
          delay={0.10}
        />
        <StatCard
          icon={<FiAlertCircle size={20} />}
          label="Pending Tasks"
          value={data.pending || 17}
          trend={-8}
          trendLabel="vs yesterday"
          gradient="linear-gradient(135deg, #d97706, #f59e0b)"
          delay={0.15}
        />
        <StatCard
          icon={<FiTool size={20} />}
          label="Maintenance"
          value={data.maintenance || 8}
          trend={-3}
          trendLabel="this month"
          gradient="linear-gradient(135deg, #dc2626, #ef4444)"
          delay={0.20}
        />
      </section>

      {/* ── Middle section: Performance + Activity ── */}
      <section className="dash-middle">

        {/* ── Performance card ── */}
        <div className="dash-card animate-fade-up stagger-3">
          <div className="card-header">
            <div>
              <h3 className="card-title">Performance Overview</h3>
              <p className="card-sub">Task & resource utilization</p>
            </div>
            <div className="card-badge card-badge--purple">
              <FiTrendingUp size={13} /> This Month
            </div>
          </div>

          {/* Completion ring */}
          <div className="completion-ring-wrap">
            <div className="completion-ring" style={{ "--pct": completionPct }}>
              <svg viewBox="0 0 120 120" className="ring-svg">
                <circle className="ring-track" cx="60" cy="60" r="50" />
                <circle
                  className="ring-fill"
                  cx="60" cy="60" r="50"
                  strokeDasharray={`${ringDash} 314`}
                />
              </svg>
              <div className="ring-label">
                <span className="ring-pct gradient-text">{completionPct}%</span>
                <span className="ring-sub">Complete</span>
              </div>
            </div>
            <div className="ring-stats">
              <div className="ring-stat">
                <FiCheckCircle size={16} style={{ color: "var(--success)" }} />
                <div>
                  <p className="ring-stat-val">{data.completed}</p>
                  <p className="ring-stat-label">Completed</p>
                </div>
              </div>
              <div className="ring-stat">
                <FiClock size={16} style={{ color: "var(--warning)" }} />
                <div>
                  <p className="ring-stat-val">{data.totalTasks - data.completed}</p>
                  <p className="ring-stat-label">Remaining</p>
                </div>
              </div>
              <div className="ring-stat">
                <FiAlertCircle size={16} style={{ color: "var(--danger)" }} />
                <div>
                  <p className="ring-stat-val">{data.overdue || 4}</p>
                  <p className="ring-stat-label">Overdue</p>
                </div>
              </div>
            </div>
          </div>

          <div className="progress-list">
            <ProgressRow label="Assets Active"    value={210} max={248} color="#8b5cf6" icon={<FiPackage size={13} />} />
            <ProgressRow label="Users Online"     value={39}  max={54}  color="#38bdf8" icon={<FiUsers size={13} />} />
            <ProgressRow label="Tasks Resolved"   value={data.completed} max={data.totalTasks} color="#10b981" icon={<FiCheckCircle size={13} />} />
            <ProgressRow label="SLA Compliance"   value={92}  max={100} color="#f59e0b" icon={<FiActivity size={13} />} />
          </div>
        </div>

        {/* ── Activity feed ── */}
        <div className="dash-card animate-fade-up stagger-4">
          <div className="card-header">
            <div>
              <h3 className="card-title">Live Activity</h3>
              <p className="card-sub">Real-time workspace events</p>
            </div>
            <span className="live-indicator">
              <span className="live-dot" />
              Live
            </span>
          </div>

          <div className="activity-list">
            <ActivityItem icon={<FiCheckCircle />} text="Sarah completed Task #42 — Database Migration" time="2 min ago" status="success" delay={0.05} />
            <ActivityItem icon={<FiPackage />} text="Asset #LP-204 assigned to John (Engineering)" time="11 min ago" status="info" delay={0.10} />
            <ActivityItem icon={<FiAlertCircle />} text="Maintenance request opened for Server Rack B" time="28 min ago" status="warning" delay={0.15} />
            <ActivityItem icon={<FiUsers />} text="New user registered: Alex Martinez (Manager)" time="1 hr ago" status="info" delay={0.20} />
            <ActivityItem icon={<FiTool />} text="Routine maintenance completed on Printer #08" time="2 hr ago" status="success" delay={0.25} />
            <ActivityItem icon={<FiAlertCircle />} text="Task deadline overdue: Client Delivery Plan" time="3 hr ago" status="danger" delay={0.30} />
            <ActivityItem icon={<FiCheckCircle />} text="Department 'DevOps' created by Admin" time="5 hr ago" status="success" delay={0.35} />
          </div>
        </div>

      </section>

      {/* ── Bottom section: Weekly chart + Team ── */}
      <section className="dash-bottom">

        {/* ── Mini chart ── */}
        <div className="dash-card dash-card--chart animate-fade-up stagger-5">
          <div className="card-header">
            <div>
              <h3 className="card-title">Weekly Tasks</h3>
              <p className="card-sub">Task volume over the past 7 days</p>
            </div>
            <div className="card-badge card-badge--blue">
              <FiActivity size={13} /> 7 Days
            </div>
          </div>

          <div className="mini-chart">
            <MiniBar height={45} label="Mon" />
            <MiniBar height={72} label="Tue" />
            <MiniBar height={58} label="Wed" />
            <MiniBar height={88} label="Thu" active />
            <MiniBar height={63} label="Fri" />
            <MiniBar height={32} label="Sat" />
            <MiniBar height={20} label="Sun" />
          </div>

          <div className="chart-summary">
            <div className="chart-sum-item">
              <span className="chart-sum-dot" style={{ background: "var(--purple-500)" }} />
              <span>Avg: 54 tasks/day</span>
            </div>
            <div className="chart-sum-item">
              <FiTrendingUp size={13} style={{ color: "var(--success)" }} />
              <span style={{ color: "var(--success)" }}>+18% vs last week</span>
            </div>
          </div>
        </div>

        {/* ── Team status table ── */}
        <div className="dash-card dash-card--team animate-fade-up stagger-6">
          <div className="card-header">
            <div>
              <h3 className="card-title">Team Status</h3>
              <p className="card-sub">Current workload distribution</p>
            </div>
            <div className="card-badge card-badge--purple">
              <FiUsers size={13} /> {6} Members
            </div>
          </div>

          <div className="team-table-wrap">
            <table className="team-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Tasks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <TeamRow initials="JD" name="John Doe"     tasks={5}  status="On Track"  dept="Engineering" delay={0.05} />
                <TeamRow initials="SM" name="Sarah Miller" tasks={11} status="Overloaded" dept="DevOps"      delay={0.10} />
                <TeamRow initials="AL" name="Alex Lee"     tasks={3}  status="On Track"  dept="Design"      delay={0.15} />
                <TeamRow initials="PR" name="Priya R."     tasks={7}  status="At Risk"   dept="QA"          delay={0.20} />
                <TeamRow initials="TK" name="Tom Kim"      tasks={1}  status="Idle"      dept="HR"          delay={0.25} />
                <TeamRow initials="MG" name="Maya G."      tasks={6}  status="On Track"  dept="Finance"     delay={0.30} />
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* ── Alert strip ── */}
      {(data.overdue > 0 || data.pending > 10) && (
        <section className="dash-alerts animate-fade-up">
          <div className="alert-strip alert-strip--warning">
            <FiAlertCircle size={16} />
            <span>
              <strong>{data.overdue || 4} overdue tasks</strong> and{" "}
              <strong>{data.pending} pending items</strong> require your attention.
            </span>
          </div>
        </section>
      )}

    </div>
  );
}
