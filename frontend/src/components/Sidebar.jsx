import React from "react";

export default function Sidebar({ active, setActive, onLogout }) {
  const items = ["Dashboard", "Schedule", "Settings"]; // Courses removed

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
            key={item}
            className={active === item ? "active" : ""}
            onClick={() => setActive(item)}
          >
            <span className="icon">
              {item === "Dashboard" && "🏠"}
              {item === "Schedule" && "🗓️"}
              {item === "Settings" && "⚙️"}
            </span>
            <span className="label">{item}</span>
          </li>
        ))}
      </ul>

      <div className="profile">
        <div className="avatar">👤</div>
        <div>
          <div className="profileName">Student</div>
          <div className="profileSub">Local Mode</div>
        </div>
      </div>

      {/* Pushes logout to the bottom */}
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