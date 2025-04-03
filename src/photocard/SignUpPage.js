import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

const SignUpPage = ({ onSignUp }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: null });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });
    try {
      const { success } = await onSignUp(form);
      if (success) {
        navigate("/");
      }
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "400px", margin: "var(--space-xl) auto", padding: "var(--space-lg)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>Sign Up</h1>
        
        {status.error && (
          <div className="notification error" style={{ marginBottom: "var(--space-md)" }}>
            {status.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-md)" }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="form-input"
            required
            minLength={3}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="form-input"
            required
            minLength={6}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={status.loading}
          >
            {status.loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-lg)", textAlign: "center" }}>
          <p className="text-muted">
            Already have an account? {' '}
            <NavLink to="/login" style={{ color: "var(--primary)" }}>Log in</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;