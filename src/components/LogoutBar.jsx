import React from "react";
import "./LogoutBar.css";

const LogoutBar = ({ user, onLogout }) => (
  <div className="logout-bar">
    <span>Welcome, {user || "User"}!</span>
    <button onClick={onLogout}>Logout</button>
  </div>
);

export default LogoutBar;
