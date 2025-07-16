import React from "react";
import { useNavigate } from "react-router-dom";

const SettingsPage = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="settings-page" style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
      <h2 style={{ marginBottom: 32 }}>Settings</h2>
      <button className="btn btn-danger" style={{ width: "100%", padding: 12, fontSize: 16 }} onClick={handleLogoutClick}>
        Log Out
      </button>
    </div>
  );
};

export default SettingsPage; 