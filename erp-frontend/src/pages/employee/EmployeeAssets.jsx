import EmployeeSectionHeader from "./EmployeeSectionHeader";
import "../../styles/employee.css";

export default function EmployeeAssets() {
  return (
    <div className="employee-page">
      <EmployeeSectionHeader
        title="My Assets"
        subtitle="Browse the equipment assigned to you"
      />
      <div className="employee-panel">
        <p>Here you can view your assigned assets and check their current status.</p>
      </div>
    </div>
  );
}
