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
          PhotoPlace
        </Link>

        {user ? (
          <div />
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
