import React, { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import "./profile.css";

function Profile({ onSwitchToRegister, onShowContact }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const API = "http://localhost:5000/api/users";

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showMessage("Please enter both username and password", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/login`, { params: { username, password } });
      const userData = res.data.user;

      setLoggedInUser(userData);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("campusBiteUser", JSON.stringify(userData));
      } else {
        localStorage.setItem("rememberMe", "false");
        sessionStorage.setItem("campusBiteUser", JSON.stringify(userData));
      }

      showMessage(`Welcome, ${userData.name}! (${userData.role})`, "success");
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed. Please try again.";
      showMessage(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccess = (role) => {
    setSelectedRole(role);
    showMessage(`Selected role: ${role}. Enter your credentials to login.`, "success");
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setUsername("");
    setPassword("");
    setSelectedRole("");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("campusBiteUser");
    sessionStorage.removeItem("campusBiteUser");
    showMessage("Logged out successfully", "success");
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const isRemembered = localStorage.getItem("rememberMe") === "true";
    let storedUser = null;

    if (isRemembered) {
      const localUser = localStorage.getItem("campusBiteUser");
      if (localUser) storedUser = JSON.parse(localUser);
    } else {
      const sessionUser = sessionStorage.getItem("campusBiteUser");
      if (sessionUser) storedUser = JSON.parse(sessionUser);
    }

    if (storedUser) {
      setLoggedInUser(storedUser);
    }
  }, []);

  const handleUpdateUser = (updatedUser) => {
    setLoggedInUser(updatedUser);
    if (localStorage.getItem("rememberMe") === "true") {
      localStorage.setItem("campusBiteUser", JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem("campusBiteUser", JSON.stringify(updatedUser));
    }
  };

  // If logged in, show the personalized dashboard
  if (loggedInUser) {
    return <Dashboard user={loggedInUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
  }

  return (
    <div className="login-page">
      {/* Login Card */}
      <div className="login-card">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-logo">
            <span role="img" aria-label="food">🍽️</span>
          </div>
          <div className="brand-info">
            <h1>CampusBite</h1>
            <p>Smart Campus Food Prebooking System</p>
          </div>
        </div>

        {/* Login Title */}
        <h2 className="login-title">Login to Your Account</h2>

        {/* Status Message */}
        {message && (
          <div className={`status-message ${messageType}`}>
            {messageType === "success" ? "✓" : "✕"} {message}
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* Username */}
          <div className="input-group">
            <label htmlFor="username">College ID</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="username"
                type="text"
                placeholder="e.g. 23cs113"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>


        {/* Footer Links */}
        <p className="switch-auth">
          Don't have an account? <span className="switch-link" onClick={onSwitchToRegister}>Sign up here</span>
        </p>

        <p className="footer-help">
          Need help? <span className="help-link" onClick={onShowContact}>Contact Campus IT Support</span>
        </p>
      </div>
    </div>
  );
}

export default Profile;
