import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

function Register({ onSwitchToLogin }) {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const API = "http://localhost:5000/api/users";

    const showMsg = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(""), 4000);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            showMsg("Please fill in all fields", "error");
            return;
        }

        if (!selectedRole) {
            showMsg("Please select a role", "error");
            return;
        }

        // Validate College ID format
        const studentPattern = /^\d{2}[a-zA-Z]{2}\d{3}$/;   // e.g. 23cs113
        const facultyPattern = /^\d{2}[a-zA-Z]{3}\d{2}$/;   // e.g. 23cse12

        if (selectedRole === "Student" && !studentPattern.test(username)) {
            showMsg("Invalid Student ID. Format: 23cs113 (2 digits + 2 letters + 3 digits)", "error");
            return;
        }
        if (selectedRole === "Faculty" && !facultyPattern.test(username)) {
            showMsg("Invalid Faculty ID. Format: 23cse12 (2 digits + 3 letters + 2 digits)", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMsg("Passwords do not match", "error");
            return;
        }

        if (password.length < 6) {
            showMsg("Password must be at least 6 characters", "error");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${API}/register`, {
                name,
                username,
                email,
                password,
                role: selectedRole,
            });
            showMsg("Account created successfully! Redirecting to login...", "success");
            setTimeout(() => onSwitchToLogin(), 2000);
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed. Please try again.";
            showMsg(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Register Card */}
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

                {/* Register Title */}
                <h2 className="login-title">Create Your Account</h2>

                {/* Status Message */}
                {message && (
                    <div className={`status-message ${messageType}`}>
                        {messageType === "success" ? "✓" : "✕"} {message}
                    </div>
                )}

                {/* Register Form */}
                <form className="login-form" onSubmit={handleRegister}>
                    {/* Full Name */}
                    <div className="input-group">
                        <label htmlFor="reg-name">Full Name</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                id="reg-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                            />
                        </div>
                    </div>
                    {/* College ID */}
                    <div className="input-group">
                        <label htmlFor="reg-username">College ID</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                id="reg-username"
                                type="text"
                                placeholder={selectedRole === "Faculty" ? "e.g. 23cse12" : "e.g. 23cs113"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="input-group">
                        <label htmlFor="reg-email">Email</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="M22 4L12 13 2 4" />
                                </svg>
                            </span>
                            <input
                                id="reg-email"
                                type="email"
                                placeholder={selectedRole === "Faculty" ? "e.g. mayathomas@gmail.com" : "e.g. hannagiby2027@cs.sjcetpalai.ac.in"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="input-group">
                        <label>Select Role</label>
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-option ${selectedRole === "Faculty" ? "role-active" : ""}`}
                                onClick={() => setSelectedRole("Faculty")}
                            >
                                <span className="role-emoji">👨‍🏫</span>
                                <span>Faculty</span>
                            </button>
                            <button
                                type="button"
                                className={`role-option ${selectedRole === "Student" ? "role-active" : ""}`}
                                onClick={() => setSelectedRole("Student")}
                            >
                                <span className="role-emoji">🎓</span>
                                <span>Student</span>
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <label htmlFor="reg-password">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="reg-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="input-group">
                        <label htmlFor="reg-confirm">Confirm Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </span>
                            <input
                                id="reg-confirm"
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {/* Register Button */}
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                {/* Switch to Login */}
                <p className="switch-auth">
                    Already have an account?{" "}
                    <button type="button" className="switch-link" onClick={onSwitchToLogin}>
                        Login here
                    </button>
                </p>

                {/* Footer Help */}
                <p className="footer-help" style={{ marginTop: "12px" }}>
                    Need help? <a href="#support">Contact Campus IT Support</a>
                </p>
            </div>
        </div >
    );
}

export default Register;
