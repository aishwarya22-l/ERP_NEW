import EmployeeSectionHeader from "./EmployeeSectionHeader";
import "../../styles/employee.css";

export default function EmployeeDashboard() {
  return (
    <div className="employee-page">
      <EmployeeSectionHeader
        title="Employee Dashboard"
        subtitle="Your work summary and quick actions"
      />
      <div className="employee-grid">
        <div className="employee-card">
          <h3>Welcome back</h3>
          <p>Check your tickets, view assigned assets, and stay on top of your day.</p>
        </div>
        <div className="employee-card">
          <h3>My Tickets</h3>
          <p>Raise a new ticket or monitor the status of your existing requests.</p>
        </div>
        <div className="employee-card">
          <h3>Assigned Assets</h3>
          <p>See which equipment is assigned to you and its current status.</p>
        </div>
      </div>
    </div>
  );
}
