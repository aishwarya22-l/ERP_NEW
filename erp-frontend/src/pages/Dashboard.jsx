import { useEffect, useState } from "react";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard-stats")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="admin-dashboard">

      {/* ALERT PANEL */}
      <div className="alert-panel">
        <h3>⚠ Alerts</h3>
        <p>{data.pending} tasks pending</p>
        <p>{data.overdue || 2} overdue tasks</p>
      </div>

      {/* LIVE ACTIVITY */}
      <div className="activity-panel">
        <h3>📡 Live Activity</h3>
        <ul>
          <li>John completed Task A</li>
          <li>New task assigned to Sarah</li>
          <li>Manager updated deadline</li>
        </ul>
      </div>

      {/* PERFORMANCE GRID */}
      <div className="performance-grid">
        <div className="perf-card">
          <h4>Task Health</h4>
          <p>{data.completed}/{data.totalTasks}</p>
        </div>

        <div className="perf-card">
          <h4>Completion %</h4>
          <p>
            {Math.round((data.completed / data.totalTasks) * 100)}%
          </p>
        </div>

        <div className="perf-card">
          <h4>Total Hours</h4>
          <p>{data.hours}</p>
        </div>
      </div>

      {/* TEAM STATUS */}
      <div className="team-table">
        <h3>👥 Team Status</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Tasks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>5</td>
              <td className="good">On Track</td>
            </tr>
            <tr>
              <td>Sarah</td>
              <td>8</td>
              <td className="warn">Overloaded</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PRIORITY TASKS */}
      <div className="priority-tasks">
        <h3>🔥 Priority Queue</h3>
        <ul>
          <li>Fix production bug</li>
          <li>Client delivery task</li>
          <li>Database optimization</li>
        </ul>
      </div>

    </div>
  );
}