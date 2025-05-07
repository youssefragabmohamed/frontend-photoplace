import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

const SignUpPage = ({ onSignUp }) => {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "" 
  });
  const [status, setStatus] = useState({ 
    loading: false, 
    error: null,
    success: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    // Basic client-side validation
    if (!form.username || !form.email || !form.password) {
      setStatus({
        loading: false,
        error: "All fields are required",
        success: false
      });
      return;
    }

    if (form.password.length < 6) {
      setStatus({
        loading: false,
        error: "Password must be at least 6 characters",
        success: false
      });
      return;
    }

    try {
      const result = await onSignUp({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      });

      if (result && result.success) {
        setStatus({
          loading: false,
          error: null,
          success: true
        });
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setStatus({ 
        loading: false, 
        error: error.message || "Registration failed. Please try again.",
        success: false
      });
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ 
        maxWidth: "400px", 
        margin: "var(--space-xl) auto", 
        padding: "var(--space-lg)" 
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>
          Sign Up
        </h1>
        
        {status.error && (
          <div className="notification error" style={{ marginBottom: "var(--space-md)" }}>
            {status.error}
          </div>
        )}

        {status.success && (
          <div className="notification success" style={{ marginBottom: "var(--space-md)" }}>
            Account created successfully! Redirecting...
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="grid" 
          style={{ gap: "var(--space-md)" }}
        >
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="form-input"
            required
            minLength={3}
            autoComplete="username"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="form-input"
            required
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            className="form-input"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={status.loading}
          >
            {status.loading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-lg)", textAlign: "center" }}>
          <p className="text-muted">
            Already have an account? {' '}
            <NavLink to="/login" style={{ color: "var(--primary)" }}>
              Log in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;