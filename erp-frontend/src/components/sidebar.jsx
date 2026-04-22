import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/sidebar.css";
import { FiLogOut } from "react-icons/fi";
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuByRole = {
    admin: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Users", path: "/admin/users" },
      { name: "Roles", path: "/admin/roles" },
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
    "assests": [
  { name: "Dashboard", path: "/assets/dashboard" },
  { name: "Assets", path: "/assets/assets" },
  { name: "Categories", path: "/assets/categories" },
  { name: "Assignments", path: "/assets/assignments" },
  { name: "Maintenance", path: "/assets/maintenance" },
  { name: "Users", path: "/assets/users" },
],
  };

  const menuItems = menuByRole[role] || [];

  return (
    <div className="sidebar">
      <h2 className="logo">ERP</h2>

      {user && (
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role?.toUpperCase()}</div>
        </div>
      )}

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

        <div className="logout-section" onClick={handleLogout}>
    <FiLogOut className="logout-icon" />
    <span>Logout</span>
  </div>
    </div>
  );
}
