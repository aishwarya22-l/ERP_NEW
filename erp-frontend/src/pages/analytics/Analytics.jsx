import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Area, AreaChart,
} from "recharts";
import {
  FiPackage, FiAlertCircle, FiUsers, FiTrendingUp,
  FiBarChart2, FiActivity, FiPieChart, FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import {
  getAssetStatusDistribution,
  getTicketMetrics,
  getEmployeesByDepartment,
  getDepartmentPerformance,
  getCustodyIntelligence,
} from "../../api/analyticsApi.js";
import "../../styles/analytics.css";

const COLORS = ["#7c3aed", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#f97316"];
const GRADIENT_IDS = ["grad0", "grad1", "grad2", "grad3", "grad4", "grad5", "grad6"];

/* ── Custom dark tooltip ──────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="custom-tooltip">
      {label && <div className="custom-tooltip-label">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: i > 0 ? 4 : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color || p.fill, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "rgba(196,181,253,0.75)", flex: 1 }}>{p.name || "Value"}</span>
          <span className="custom-tooltip-value" style={{ fontSize: 14 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Gradient defs for charts ─────────────────────────────── */
function ChartGradients() {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="barPurple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.95} />
          <stop offset="95%" stopColor="#6d28d9" stopOpacity={0.85} />
        </linearGradient>
        <linearGradient id="barIndigo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
          <stop offset="95%" stopColor="#4338ca" stopOpacity={0.8} />
        </linearGradient>
        <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
          <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
        </linearGradient>
        <linearGradient id="barCyan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
          <stop offset="95%" stopColor="#0284c7" stopOpacity={0.8} />
        </linearGradient>
        <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── KPI card ─────────────────────────────────────────────── */
function KpiCard({ icon, label, value, sub, subType = "purple", gradient, delay = 0 }) {
  return (
    <div
      className="analytics-kpi-card"
      style={{ "--kpi-color": gradient, animationDelay: `${delay}s` }}
    >
      <div className="kpi-icon" style={{ background: gradient }}>
        {icon}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className={`kpi-sub kpi-sub--${subType}`}>{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ANALYTICS PAGE
   ══════════════════════════════════════════════════════════ */
export default function Analytics() {
  const [assetDist, setAssetDist]   = useState([]);
  const [ticketData, setTicketData] = useState({ byStatus: [], byPriority: [], monthly: [] });
  const [empByDept, setEmpByDept]   = useState([]);
  const [deptPerf, setDeptPerf]     = useState([]);
  const [custodyData, setCustodyData] = useState({ summary: {}, topRiskAssets: [], byDepartment: [] });
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      getAssetStatusDistribution(),
      getTicketMetrics(),
      getEmployeesByDepartment(),
      getDepartmentPerformance(),
      getCustodyIntelligence(),
    ]).then(([a, t, e, d, c]) => {
      setAssetDist(a);
      setTicketData(t);
      setEmpByDept(e);
      setDeptPerf(d);
      setCustodyData(c);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="analytics-spinner" />
        <p>Loading analytics…</p>
      </div>
    );
  }

  /* ── KPI computations from existing data ── */
  const totalAssets    = assetDist.reduce((a, b) => a + (b.value || 0), 0);
  const totalEmployees = empByDept.reduce((a, b) => a + (b.value || 0), 0);
  const totalTickets   = ticketData.byStatus.reduce((a, b) => a + (b.count || 0), 0);
  const resolvedCount  = ticketData.byStatus.find(s => s.name === "resolved")?.count || 0;
  const resolvedRate   = totalTickets ? Math.round((resolvedCount / totalTickets) * 100) : 0;
  const custodySummary = custodyData.summary || {};

  /* Priority colors for bar chart */
  const PRIORITY_COLORS = { urgent: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981" };

  return (
    <div className="analytics-page">
      <ChartGradients />

      {/* ── Page header ── */}
      <header className="analytics-header" style={{ animationDelay: "0s" }}>
        <div>
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">Real-time performance metrics and operational insights</p>
        </div>
      </header>

      {/* ── KPI Strip ── */}
      <section className="analytics-kpi-strip">
        <KpiCard
          icon={<FiPackage size={17} />}
          label="Total Assets"
          value={totalAssets}
          sub="Across all categories"
          subType="purple"
          gradient="linear-gradient(135deg, #7c3aed, #a855f7)"
          delay={0.05}
        />
        <KpiCard
          icon={<FiUsers size={17} />}
          label="Total Employees"
          value={totalEmployees}
          sub="Active headcount"
          subType="info"
          gradient="linear-gradient(135deg, #0284c7, #38bdf8)"
          delay={0.10}
        />
        <KpiCard
          icon={<FiAlertCircle size={17} />}
          label="Total Tickets"
          value={totalTickets}
          sub={`${resolvedCount} resolved`}
          subType="success"
          gradient="linear-gradient(135deg, #059669, #10b981)"
          delay={0.15}
        />
        <KpiCard
          icon={<FiCheckCircle size={17} />}
          label="Resolution Rate"
          value={`${resolvedRate}%`}
          sub={resolvedRate >= 70 ? "Above target" : "Below target"}
          subType={resolvedRate >= 70 ? "success" : "warning"}
          gradient="linear-gradient(135deg, #d97706, #f59e0b)"
          delay={0.20}
        />
      </section>

      <section className="custody-intel-panel">
        <div className="custody-intel-copy">
          <div className="custody-intel-icon"><FiShield /></div>
          <div>
            <h2>Asset Custody Intelligence</h2>
            <p>Scores assigned assets using department mismatches, stale assignments, maintenance activity, and linked ticket signals.</p>
          </div>
        </div>
        <div className="custody-intel-metrics">
          <div>
            <span>Avg Confidence</span>
            <strong>{custodySummary.averageConfidence ?? 100}%</strong>
          </div>
          <div>
            <span>High Risk</span>
            <strong>{custodySummary.high ?? 0}</strong>
          </div>
          <div>
            <span>Watch</span>
            <strong>{custodySummary.watch ?? 0}</strong>
          </div>
        </div>
      </section>

      {/* ── Charts grid ── */}
      <div className="analytics-grid">

        {/* Asset custody intelligence — full width */}
        {custodyData.byDepartment?.length > 0 && (
          <div className="chart-card chart-card--full" style={{ "--chart-accent": "linear-gradient(90deg, #0f766e, #06b6d4)", animationDelay: "0.08s" }}>
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">Custody Risk by Department</h3>
                <p className="chart-sub">High-risk and watch-list assets from assignment, ticket, and maintenance signals</p>
              </div>
              <div className="chart-badge" style={{ background: "rgba(15,118,110,0.08)", color: "#0f766e", borderColor: "rgba(15,118,110,0.18)" }}>
                <FiShield size={11} /> Intelligence
              </div>
            </div>
            <div className="custody-chart-layout">
              <div className="chart-container chart-container--tall">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={custodyData.byDepartment}
                    margin={{ top: 8, right: 20, left: -12, bottom: 4 }}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: "#9ca3af", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(15,118,110,0.04)" }} />
                    <Legend formatter={(value) => <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{value}</span>} />
                    <Bar dataKey="high" name="High Risk" fill="#ef4444" radius={[4, 4, 1, 1]} />
                    <Bar dataKey="watch" name="Watch" fill="#f59e0b" radius={[4, 4, 1, 1]} />
                    <Bar dataKey="healthy" name="Healthy" fill="#10b981" radius={[4, 4, 1, 1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="custody-risk-list">
                <h4>Review Queue</h4>
                {custodyData.topRiskAssets?.length ? custodyData.topRiskAssets.map((asset) => (
                  <div key={asset.asset_id} className={`custody-risk-item custody-risk-item--${asset.custody_level}`}>
                    <div>
                      <strong>{asset.asset_name}</strong>
                      <span>{asset.assigned_department || "Unassigned"} • {asset.primary_reason}</span>
                    </div>
                    <b>{asset.custody_confidence}%</b>
                  </div>
                )) : (
                  <div className="custody-risk-empty">No custody review needed</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Asset status distribution — Pie */}
        <div className="chart-card" style={{ "--chart-accent": "linear-gradient(90deg, #7c3aed, #a855f7)", animationDelay: "0.1s" }}>
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Asset Status Distribution</h3>
              <p className="chart-sub">Breakdown by current status</p>
            </div>
            <div className="chart-badge"><FiPieChart size={11} /> Assets</div>
          </div>
          {assetDist.length === 0 ? (
            <div className="chart-empty">
              <div className="chart-empty-icon"><FiPackage /></div>
              <span>No asset data available</span>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={3}
                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""}
                    labelLine={false}
                  >
                    {assetDist.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        stroke="rgba(255,255,255,0.6)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {assetDist.length > 0 && (
            <div className="chart-legend">
              {assetDist.map((item, i) => (
                <div key={i} className="chart-legend-item">
                  <div className="chart-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Employees by department — Pie */}
        <div className="chart-card" style={{ "--chart-accent": "linear-gradient(90deg, #6366f1, #06b6d4)", animationDelay: "0.15s" }}>
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Employees by Department</h3>
              <p className="chart-sub">Headcount distribution</p>
            </div>
            <div className="chart-badge" style={{ background: "rgba(99,102,241,0.08)", color: "#4338ca", borderColor: "rgba(99,102,241,0.16)" }}>
              <FiUsers size={11} /> {totalEmployees} Total
            </div>
          </div>
          {empByDept.length === 0 ? (
            <div className="chart-empty">
              <div className="chart-empty-icon"><FiUsers /></div>
              <span>No department data available</span>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={empByDept}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={3}
                    label={({ name, percent }) => percent > 0.07 ? `${(percent * 100).toFixed(0)}%` : ""}
                    labelLine={false}
                  >
                    {empByDept.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        stroke="rgba(255,255,255,0.6)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {empByDept.length > 0 && (
            <div className="chart-legend">
              {empByDept.map((item, i) => (
                <div key={i} className="chart-legend-item">
                  <div className="chart-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tickets by status — Bar */}
        <div className="chart-card" style={{ "--chart-accent": "linear-gradient(90deg, #6366f1, #8b5cf6)", animationDelay: "0.2s" }}>
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Tickets by Status</h3>
              <p className="chart-sub">Current ticket pipeline</p>
            </div>
            <div className="chart-badge" style={{ background: "rgba(99,102,241,0.08)", color: "#4338ca", borderColor: "rgba(99,102,241,0.16)" }}>
              <FiActivity size={11} /> {totalTickets} Total
            </div>
          </div>
          {ticketData.byStatus.length === 0 ? (
            <div className="chart-empty">
              <div className="chart-empty-icon"><FiAlertCircle /></div>
              <span>No ticket data available</span>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ticketData.byStatus}
                  margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                  barSize={36}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11.5, fill: "#9ca3af", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.05)", radius: 6 }} />
                  <Bar dataKey="count" fill="url(#barPurple)" radius={[6, 6, 2, 2]} name="Tickets" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tickets by priority — Bar */}
        <div className="chart-card" style={{ "--chart-accent": "linear-gradient(90deg, #ef4444, #f97316)", animationDelay: "0.25s" }}>
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Tickets by Priority</h3>
              <p className="chart-sub">Urgency distribution</p>
            </div>
            <div className="chart-badge" style={{ background: "rgba(239,68,68,0.08)", color: "#b91c1c", borderColor: "rgba(239,68,68,0.16)" }}>
              <FiAlertCircle size={11} /> Priority
            </div>
          </div>
          {ticketData.byPriority.length === 0 ? (
            <div className="chart-empty">
              <div className="chart-empty-icon"><FiAlertCircle /></div>
              <span>No priority data available</span>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ticketData.byPriority}
                  margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                  barSize={36}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11.5, fill: "#9ca3af", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.05)", radius: 6 }} />
                  <Bar dataKey="count" radius={[6, 6, 2, 2]} name="Tickets">
                    {ticketData.byPriority.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={PRIORITY_COLORS[entry.name] || "#a855f7"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly ticket trend — Area chart (full width) */}
        {ticketData.monthly.length > 0 && (
          <div className="chart-card chart-card--full" style={{ "--chart-accent": "linear-gradient(90deg, #7c3aed, #06b6d4)", animationDelay: "0.3s" }}>
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">Ticket Volume — Last 6 Months</h3>
                <p className="chart-sub">Monthly trend analysis</p>
              </div>
              <div className="chart-badge">
                <FiTrendingUp size={11} /> 6 Months
              </div>
            </div>
            <div className="chart-container chart-container--tall">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={ticketData.monthly}
                  margin={{ top: 8, right: 20, left: -12, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="ticketAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11.5, fill: "#9ca3af", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(124,58,237,0.25)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#ticketAreaFill)"
                    dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }}
                    name="Tickets"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Department performance — grouped Bar (full width) */}
        {deptPerf.length > 0 && (
          <div className="chart-card chart-card--full" style={{ "--chart-accent": "linear-gradient(90deg, #10b981, #06b6d4)", animationDelay: "0.35s" }}>
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">Department Performance</h3>
                <p className="chart-sub">Tickets, resolutions, and assignments per department</p>
              </div>
              <div className="chart-badge" style={{ background: "rgba(16,185,129,0.08)", color: "#065f46", borderColor: "rgba(16,185,129,0.16)" }}>
                <FiBarChart2 size={11} /> Departments
              </div>
            </div>
            <div className="chart-container chart-container--tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deptPerf}
                  margin={{ top: 8, right: 20, left: -12, bottom: 4 }}
                  barSize={18}
                  barCategoryGap="28%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11.5, fill: "#9ca3af", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.04)" }} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{value}</span>
                    )}
                  />
                  <Bar dataKey="tickets"     name="Total Tickets"     fill="url(#barIndigo)" radius={[4, 4, 1, 1]} />
                  <Bar dataKey="resolved"    name="Resolved"          fill="url(#barGreen)"  radius={[4, 4, 1, 1]} />
                  <Bar dataKey="assignments" name="Asset Assignments"  fill="url(#barCyan)"   radius={[4, 4, 1, 1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
