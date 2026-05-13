import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/sidebar.css";
import {
  FiHome, FiUsers, FiShield, FiBriefcase,
  FiPackage, FiTag, FiClipboard, FiTool,
  FiCheckSquare, FiClock, FiBarChart2,
  FiLogOut, FiChevronRight,
  FiGrid, FiUser
} from "react-icons/fi";

const ICON_MAP = {
  Dashboard:    <FiHome />,
  Users:        <FiUsers />,
  Roles:        <FiShield />,
  Departments:  <FiBriefcase />,
  Projects:     <FiGrid />,
  Reports:      <FiBarChart2 />,
  Team:         <FiUsers />,
  Tasks:        <FiCheckSquare />,
  "My Tasks":   <FiCheckSquare />,
  Timesheet:    <FiClock />,
  Assets:       <FiPackage />,
  Categories:   <FiTag />,
  Assignments:  <FiClipboard />,
  Maintenance:  <FiTool />,
};

const MENU_BY_ROLE = {
  admin: [
    { name: "Dashboard",   path: "/admin",             section: "Overview" },
    { name: "Users",       path: "/admin/users",       section: "Management" },
    { name: "Roles",       path: "/admin/roles",       section: "Management" },
    { name: "Departments", path: "/admin/departments", section: "Management" },
    { name: "Reports",     path: "/admin/reports",     section: "Analytics" },
  ],
  manager: [
    { name: "Dashboard",   path: "/dashboard",         section: "Overview" },
    { name: "Team",        path: "/manager/team",      section: "Management" },
    { name: "Tasks",       path: "/manager/tasks",     section: "Management" },
    { name: "Reports",     path: "/manager/reports",   section: "Analytics" },
  ],
  employee: [
    { name: "Dashboard",   path: "/dashboard",         section: "Overview" },
    { name: "My Tasks",    path: "/tasks",             section: "Work" },
    { name: "Timesheet",   path: "/timesheet",         section: "Work" },
  ],
  assests: [
    { name: "Dashboard",   path: "/assets",            section: "Overview" },
    { name: "Assets",      path: "/assets/assets",     section: "Inventory" },
    { name: "Categories",  path: "/assets/categories", section: "Inventory" },
    { name: "Assignments", path: "/assets/assignments",section: "Operations" },
    { name: "Maintenance", path: "/assets/maintenance",section: "Operations" },
  ],
};

function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  return <div className="sb-avatar">{initials}</div>;
}

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const allItems = MENU_BY_ROLE[role] || [];

  const sections = allItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className="sidebar">
      <div className="sb-glow sb-glow-1" aria-hidden="true" />
      <div className="sb-glow sb-glow-2" aria-hidden="true" />

      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon">E</div>
        <div className="sb-logo-text">
          <span className="sb-logo-title">ERP Suite</span>
          <span className="sb-logo-sub">Enterprise Platform</span>
        </div>
      </div>

      <div className="sb-divider" />

      {/* User card */}
      {user && (
        <div className="sb-user-card">
          <Avatar name={user.name} />
          <div className="sb-user-info">
            <span className="sb-user-name">{user.name || "User"}</span>
            <span className="sb-user-role">{role?.toUpperCase()}</span>
          </div>
          <span className="live-dot" style={{ marginLeft: "auto", flexShrink: 0 }} />
        </div>
      )}

      {/* Navigation */}
      <nav className="sb-nav">
        {Object.entries(sections).map(([section, items], sIdx) => (
          <div key={section} className="sb-section" style={{ animationDelay: `${sIdx * 0.06}s` }}>
            <div className="sb-section-label">{section}</div>
            {items.map((item, idx) => {
              const isActive =
                location.pathname === item.path ||
                (item.path.length > 1 && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  onClick={onNavigate}
                  className={`sb-link ${isActive ? "sb-link--active" : ""}`}
                  style={{ animationDelay: `${sIdx * 0.06 + idx * 0.04}s` }}
                >
                  <span className="sb-link-icon">
                    {ICON_MAP[item.name] || <FiUser />}
                  </span>
                  <span className="sb-link-label">{item.name}</span>
                  {isActive && (
                    <FiChevronRight size={14} className="sb-link-arrow" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sb-bottom">
        <div className="sb-divider" />
        <button className="sb-logout" onClick={handleLogout}>
          <FiLogOut />
          <span>Sign Out</span>
        </button>
        <p className="sb-version">v1.0 · ERP Suite</p>
      </div>
    </div>
  );
}
