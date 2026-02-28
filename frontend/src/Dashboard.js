import React, { useState } from "react";
import "./Dashboard.css";

function Dashboard({ user, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [view, setView] = useState("dashboard"); // "dashboard" or "profile"

    // Extract department from College ID (e.g., 23cs113 -> Computer Science)
    const getDepartment = (username) => {
        if (!username) return "Unknown";
        const deptCode = username.substring(2, 4).toLowerCase();
        const deptMap = {
            cs: "Computer Science",
            me: "Mechanical Engineering",
            ec: "Electronics & Communication",
            ce: "Civil Engineering",
            ee: "Electrical Engineering",
            it: "Information Technology",
        };
        return deptMap[deptCode] || "General Department";
    };

    return (
        <div className="dashboard-page">
            {/* Dashboard Top Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="menu-container">
                        <button
                            className={`menu-btn ${isMenuOpen ? "menu-active" : ""}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                            <span>Menu</span>
                        </button>

                        {/* Menu Dropdown */}
                        {isMenuOpen && (
                            <div className="menu-dropdown">
                                <button className="dropdown-item" onClick={() => { setView("profile"); setIsMenuOpen(false); }}>
                                    <span role="img" aria-label="profile">👤</span> Profile
                                </button>
                                <button className="dropdown-item" onClick={onLogout}>
                                    <span role="img" aria-label="logout">🚪</span> Logout
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="brand-header-mini">
                        <div className="brand-logo-mini">
                            <span role="img" aria-label="food">🍽️</span>
                        </div>
                        <h1 className="brand-name-mini">CampusBite</h1>
                    </div>
                </div>

                <div className="header-right">
                    <button className="header-profile-icon" onClick={() => setView("profile")} title="View Profile">
                        <div className="avatar-circle">
                            <span role="img" aria-label="user">{user.role === "Faculty" ? "👨‍🏫" : "🎓"}</span>
                        </div>
                    </button>

                    <button className="header-logout-btn" onClick={onLogout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                {view === "dashboard" ? (
                    <>
                        {/* Welcome Section */}
                        <section className="welcome-card">
                            <div className="welcome-info">
                                <h2>Welcome back, {user.name}! <span className="wave-emoji">👋</span></h2>
                                <p>Ready to book your next meal?</p>
                                <div className="user-badges">
                                    <span className="badge role-badge">
                                        <span role="img" aria-label="role">{user.role === "Faculty" ? "👨‍🏫" : "🎓"}</span>
                                        {user.role}
                                    </span>
                                    <span className="badge id-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                                            <line x1="7" y1="8" x2="17" y2="8"></line>
                                            <line x1="7" y1="12" x2="17" y2="12"></line>
                                            <line x1="7" y1="16" x2="12" y2="16"></line>
                                        </svg>
                                        {user.username.toUpperCase()}
                                    </span>
                                    <span className="badge dept-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                            <line x1="8" y1="21" x2="16" y2="21"></line>
                                            <line x1="12" y1="17" x2="12" y2="21"></line>
                                        </svg>
                                        {getDepartment(user.username)}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Action Cards Section */}
                        <section className="actions-grid">
                            <div className="action-card green-combo">
                                <div className="action-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                </div>
                                <div className="action-info">
                                    <h3>Dashboard</h3>
                                    <p>Access your complete dashboard to book meals, view orders, and manage your bookings</p>
                                    <button className="action-btn">
                                        Go to Dashboard <span>→</span>
                                    </button>
                                </div>
                            </div>

                            <div className="action-card white-green-combo">
                                <div className="action-icon-green">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                                    </svg>
                                </div>
                                <div className="action-info-dark">
                                    <h3>Quick Book</h3>
                                    <p>Skip the wait and book your favorite meals instantly with just a few clicks</p>
                                    <button className="action-btn-green">
                                        Book Now <span>→</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="profile-section">
                        <div className="profile-card">
                            <div className="profile-header">
                                <button className="back-btn" onClick={() => setView("dashboard")}>
                                    <span>←</span> Back to Dashboard
                                </button>
                                <h2>User Profile</h2>
                            </div>
                            <div className="profile-content">
                                <div className="profile-avatar-large">
                                    <span role="img" aria-label="user">{user.role === "Faculty" ? "👨‍🏫" : "🎓"}</span>
                                </div>
                                <div className="profile-details">
                                    <div className="detail-item">
                                        <label>Full Name</label>
                                        <p>{user.name}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>College ID</label>
                                        <p>{user.username.toUpperCase()}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email Address</label>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Role</label>
                                        <p>{user.role}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Department</label>
                                        <p>{getDepartment(user.username)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
