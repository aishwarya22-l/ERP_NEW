import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const menuByRole = {
    admin: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Users", path: "/admin/users" },
      { name: "Projects", path: "/admin/projects" },
      { name: "Reports", path: "/admin/reports" },
    ],
    manager: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Team", path: "/manager/team" },
      { name: "Tasks", path: "/manager/tasks" },
    ],
    employee: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "My Tasks", path: "/tasks" },
      { name: "Timesheet", path: "/timesheet" },
    ],
  };

  const menuItems = menuByRole[role] || [];

  return (
    <div className="sidebar">
      <h2 className="logo">ERP</h2>

      <ul>
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "active link" : "link"
              }
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}