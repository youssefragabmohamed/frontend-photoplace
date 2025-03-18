import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="App-header">
      <div className="logo">
        <h1>My Photo Marketplace</h1>
      </div>
      <div className="dropdown">
        <button className="dropbtn">Menu</button>
        <div className="dropdown-content">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          {user ? (
            <>
              <Link to={`/profile/${user.userId}`}>Profile</Link>
              <Link to="/upload">Upload Photo</Link>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
      {user && (
        <div className="user-info">
          <span>Welcome, {user.username}</span>
        </div>
      )}
    </header>
  );
};

export default Header;