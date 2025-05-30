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
    <div className="auth-container">
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Join PhotoMarket today</p>
      </div>

      {status.error && (
        <div className="notification error">
          {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button 
          type="submit"
          disabled={status.loading}
        >
          {status.loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <NavLink to="/login">Sign in</NavLink></p>
      </div>
    </div>
  );
};

export default SignUpPage;