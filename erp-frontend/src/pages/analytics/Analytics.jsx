import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import {
  getAssetStatusDistribution,
  getTicketMetrics,
  getEmployeesByDepartment,
  getDepartmentPerformance,
} from "../../api/analyticsApi.js";

const COLORS = ["#a855f7", "#6366f1", "#22d3ee", "#4ade80", "#facc15", "#f87171", "#fb923c"];

const chartCard = {
  background: "#fff",
  borderRadius: 14,
  padding: "20px 24px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  border: "1px solid #e5e7eb",
};

const sectionTitle = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#1e1b4b",
  marginBottom: 16,
};

export default function Analytics() {
  const [assetDist, setAssetDist]   = useState([]);
  const [ticketData, setTicketData] = useState({ byStatus: [], byPriority: [], monthly: [] });
  const [empByDept, setEmpByDept]   = useState([]);
  const [deptPerf, setDeptPerf]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      getAssetStatusDistribution(),
      getTicketMetrics(),
      getEmployeesByDepartment(),
      getDepartmentPerformance(),
    ]).then(([a, t, e, d]) => {
      setAssetDist(a);
      setTicketData(t);
      setEmpByDept(e);
      setDeptPerf(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: "#6b7280" }}>
        Loading analytics…
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e1b4b", marginBottom: 24 }}>
        Analytics
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>

        {/* Asset status distribution — Pie */}
        <div style={chartCard}>
          <div style={sectionTitle}>Asset Status Distribution</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={assetDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {assetDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Employees by department — Pie */}
        <div style={chartCard}>
          <div style={sectionTitle}>Employees by Department</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={empByDept} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {empByDept.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by status — Bar */}
        <div style={chartCard}>
          <div style={sectionTitle}>Tickets by Status</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ticketData.byStatus} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by priority — Bar */}
        <div style={chartCard}>
          <div style={sectionTitle}>Tickets by Priority</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ticketData.byPriority} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ticketData.byPriority.map((entry, i) => {
                  const c = { urgent: "#ef4444", high: "#f97316", medium: "#facc15", low: "#4ade80" };
                  return <Cell key={i} fill={c[entry.name] || "#a855f7"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly ticket trend — Line (full width) */}
        {ticketData.monthly.length > 0 && (
          <div style={{ ...chartCard, gridColumn: "1 / -1" }}>
            <div style={sectionTitle}>Ticket Volume — Last 6 Months</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ticketData.monthly} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4, fill: "#a855f7" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Department performance — Bar (full width) */}
        {deptPerf.length > 0 && (
          <div style={{ ...chartCard, gridColumn: "1 / -1" }}>
            <div style={sectionTitle}>Department Performance</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptPerf} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tickets"     name="Total Tickets"    fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resolved"    name="Resolved"         fill="#4ade80" radius={[3, 3, 0, 0]} />
                <Bar dataKey="assignments" name="Asset Assignments" fill="#22d3ee" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
