import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = ({ handleSignUp }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
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
      await handleSignUp(formData.username, formData.email, formData.password);
      navigate("/");
    } catch (error) {
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "400px", margin: "var(--space-xl) auto", padding: "var(--space-lg)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>Sign Up</h1>
        
        {error && (
          <div className="notification error" style={{ marginBottom: "var(--space-md)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "var(--space-md)" }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            required
            minLength={3}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
            minLength={6}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-lg)", textAlign: "center" }}>
          <p className="text-muted">Already have an account? <a href="/login" style={{ color: "var(--primary)" }}>Log in</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;