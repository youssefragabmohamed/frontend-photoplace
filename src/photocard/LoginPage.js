import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      const response = await fetch("http://192.168.1.109:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("user", JSON.stringify(data.user)); // Save user data to localStorage
      setUser(data.user); // Update user state in your app
      navigate("/"); // Redirect to the home page
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Sign in with ${provider} clicked (implement backend flow)`);
  };

  return (
    <div className="auth-container">
      <h2>Log In</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <div className="social-login">
        <button onClick={() => handleSocialLogin("Google")} className="google-btn">
          Log in with Google
        </button>
        <button onClick={() => handleSocialLogin("Facebook")} className="facebook-btn">
          Log in with Facebook
        </button>
      </div>
      <p>Don't have an account? <a href="/signup">Sign up</a></p>
    </div>
  );
};

export default LoginPage;