import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Header = ({ user, onLogout }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) return null;

  return (
    <header className="header" style={{
      background: "var(--surface)",
      padding: "var(--space-md)",
      boxShadow: "var(--shadow-sm)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div className="container flex" style={{ 
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Link to="/" className="logo" style={{ 
          textDecoration: "none",
          color: "var(--primary)",
          fontWeight: 600,
          fontSize: "var(--text-xl)"
        }}>
          PhotoMarket
        </Link>

        {user ? (
          <div className="flex" style={{ gap: "var(--space-md)", alignItems: "center" }}>
            <div className="user-info flex" style={{ alignItems: "center", gap: "var(--space-sm)" }}>
              <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: "1.5rem" }} />
              <span style={{ fontWeight: 500 }}>{user.username}</span>
            </div>
            <button 
              onClick={onLogout}
              className="btn btn-outline"
              style={{ padding: "var(--space-xs) var(--space-sm)" }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        ) : (
          <div className="flex" style={{ gap: "var(--space-sm)" }}>
            <Link 
              to="/login" 
              className="btn btn-outline"
              style={{ padding: "var(--space-xs) var(--space-sm)" }}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="btn btn-primary"
              style={{ padding: "var(--space-xs) var(--space-sm)" }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
