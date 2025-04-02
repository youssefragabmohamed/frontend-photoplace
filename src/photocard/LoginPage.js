import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

const LoginPage = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      setUser(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "400px", margin: "var(--space-xl) auto", padding: "var(--space-lg)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>Log In</h1>
        
        {error && (
          <div className="notification error" style={{ marginBottom: "var(--space-md)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-md)" }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="form-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="form-input"
            required
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-lg)", textAlign: "center" }}>
          <p className="text-muted">Don't have an account? <NavLink to="/signup" style={{ color: "var(--primary)" }}>Sign up</NavLink></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;