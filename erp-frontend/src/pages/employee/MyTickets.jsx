import EmployeeSectionHeader from "./EmployeeSectionHeader";
import "../../styles/employee.css";

export default function MyTickets() {
  return (
    <div className="employee-page">
      <EmployeeSectionHeader
        title="My Tickets"
        subtitle="Track the status of the tickets you submitted"
      />
      <div className="employee-panel">
        <p>Your recent tickets will appear here with current status and updates.</p>
      </div>
    </div>
  );
}
