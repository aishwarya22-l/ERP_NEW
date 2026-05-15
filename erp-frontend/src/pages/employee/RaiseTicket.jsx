import EmployeeSectionHeader from "./EmployeeSectionHeader";
import "../../styles/employee.css";

export default function RaiseTicket() {
  return (
    <div className="employee-page">
      <EmployeeSectionHeader
        title="Raise a Ticket"
        subtitle="Create a new support request for your issue"
      />
      <div className="employee-panel">
        <p>Use this page to raise a ticket for IT, facilities, or asset support.</p>
      </div>
    </div>
  );
}
