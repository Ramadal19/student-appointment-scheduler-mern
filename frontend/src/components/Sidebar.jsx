import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ active, setActive, onLogout }) {
  const navigate = useNavigate();

  const items = [
    { label: "Dashboard", icon: "🏠", path: "/dashboard-v2" },
    { label: "Schedule", icon: "🗓️", path: "/schedule" },
    { label: "Settings", icon: "⚙️", path: "/settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandIcon">🎓</div>
        <div>
          <div className="brandTitle">Portal</div>
          <div className="brandSub">Student</div>
        </div>
      </div>

      <div className="navTitle">Navigation</div>

      <ul className="menu">
        {items.map((item) => (
          <li
            key={item.label}
            className={active === item.label ? "active" : ""}
            onClick={() => {
              setActive(item.label);
              navigate(item.path);
            }}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="profile">
        <div className="avatar">👤</div>
        <div>
          <div className="profileName">Student</div>
          <div className="profileSub">Session Mode</div>
        </div>
      </div>

      <div className="sidebarBottom">
        <div className="logoutRow">
          <button className="logoutBtn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}