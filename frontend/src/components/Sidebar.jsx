import React from "react";

export default function Sidebar({ active, setActive, onLogout, profileName = "Student", profileSub = "Session Mode" }) {
  const items = ["Dashboard", "Request Appointment", "Settings"];

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
              {item === "Request Appointment" && "🗓️"}
              {item === "Settings" && "⚙️"}
            </span>
            <span className="label">{item}</span>
          </li>
        ))}
      </ul>

      {/* Real Data */}
      <div className="profile">
        <div className="avatar">👤</div>
        <div>
          <div className="profileName">{profileName}</div>
          <div className="profileSub">{profileSub}</div>
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