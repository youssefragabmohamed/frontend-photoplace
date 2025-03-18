import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = ({ setUser }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
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
      const response = await fetch("http://192.168.1.109:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock function for social logins
  const handleSocialLogin = (provider) => {
    alert(`Sign in with ${provider} clicked (implement backend flow)`);
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
      </form>
      <div className="social-login">
        <button onClick={() => handleSocialLogin("Google")} className="google-btn">Sign up with Google</button>
        <button onClick={() => handleSocialLogin("Facebook")} className="facebook-btn">Sign up with Facebook</button>
      </div>
      <p>Already have an account? <a href="/login">Log in</a></p>
    </div>
  );
};

export default SignUpPage;