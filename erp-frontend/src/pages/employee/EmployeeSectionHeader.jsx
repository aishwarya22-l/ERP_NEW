export default function EmployeeSectionHeader({ title, subtitle }) {
  return (
    <div className="employee-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
