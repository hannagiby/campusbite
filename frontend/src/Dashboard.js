import React, { useState, useEffect } from "react";
import Menu from "./Menu";
import "./Dashboard.css";

function Dashboard({ user, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [view, setView] = useState("dashboard"); // "dashboard", "profile", or "menu"

    // Admin staff management state
    const [staffList, setStaffList] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffUsername, setNewStaffUsername] = useState("");
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffPassword, setNewStaffPassword] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [staffLoading, setStaffLoading] = useState(false);
    const [staffError, setStaffError] = useState("");

    // Canteen Staff state
    const [canteenView, setCanteenView] = useState("update_menu"); // "update_menu", "manage_categories", or "view_bookings"
    const [foodName, setFoodName] = useState("");
    const [foodPrice, setFoodPrice] = useState("");
    const [foodSlots, setFoodSlots] = useState("");
    const [menuSaveState, setMenuSaveState] = useState({ loading: false, error: "", success: "" });

    // Categories state
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [categorySaveState, setCategorySaveState] = useState({ loading: false, error: "", success: "" });

    const isAdmin = (user.role || "").toLowerCase() === "admin";
    const isCanteenStaff = (user.role || "").toLowerCase() === "canteen";

    // Fetch resources
    useEffect(() => {
        if (isAdmin) {
            fetchStaff();
        }
        if (isCanteenStaff) {
            fetchCategories();
        }
    }, [isAdmin, isCanteenStaff]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/categories");
            const data = await res.json();
            if (res.ok) {
                if (data.categories && data.categories.length > 0) {
                    setCategories(data.categories);
                } else {
                    // Default dummy categories to fill dropdown initially if it's completely empty
                    setCategories([
                        { id: 1, name: "Biryani" },
                        { id: 2, name: "Meals" },
                        { id: 3, name: "Dosa" },
                        { id: 4, name: "Burger" },
                        { id: 5, name: "Pizza" },
                    ])
                }
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            // Fallback on error
            setCategories([
                { id: 1, name: "Biryani" },
                { id: 2, name: "Meals" },
                { id: 3, name: "Dosa" }
            ]);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName) {
            setCategorySaveState({ loading: false, error: "Category name is required", success: "" });
            return;
        }

        setCategorySaveState({ loading: true, error: "", success: "" });

        let uploadedImageUrl = "";

        try {
            // 1. Upload Image (if selected)
            if (newCategoryImage) {
                const formData = new FormData();
                formData.append("image", newCategoryImage);

                const uploadRes = await fetch("http://localhost:5000/api/upload", {
                    method: "POST",
                    body: formData
                });

                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    throw new Error(uploadData.message || "Failed to upload image");
                }
                uploadedImageUrl = uploadData.imageUrl;
            }

            // 2. Save Category
            const res = await fetch("http://localhost:5000/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCategoryName,
                    imageUrl: uploadedImageUrl
                })
            });

            const data = await res.json();
            if (res.ok) {
                setCategories([...categories, data.category].sort((a, b) => a.name.localeCompare(b.name)));
                setCategorySaveState({ loading: false, error: "", success: "Category added successfully!" });
                setNewCategoryName("");
                setNewCategoryImage(null);
                // clear file input
                const fileInput = document.getElementById('categoryImageInput');
                if (fileInput) fileInput.value = '';

                setTimeout(() => setCategorySaveState({ loading: false, error: "", success: "" }), 3000);
            } else {
                setCategorySaveState({ loading: false, error: data.message || "Failed to save category", success: "" });
            }
        } catch (err) {
            console.error(err);
            setCategorySaveState({ loading: false, error: err.message || "Server error", success: "" });
        }
    };

    const handleSaveMenu = async () => {
        if (!foodName || !foodPrice || !foodSlots) {
            setMenuSaveState({ loading: false, error: "Please fill in all fields", success: "" });
            return;
        }

        // Find the selected category to get its image
        const selectedCat = categories.find(c => c.name === foodName);
        const imageUrl = selectedCat ? selectedCat.image_url : "default";

        setMenuSaveState({ loading: true, error: "", success: "" });
        try {
            const res = await fetch("http://localhost:5000/api/menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    foodName,
                    price: Number(foodPrice),
                    slots: Number(foodSlots),
                    imageUrl
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMenuSaveState({ loading: false, error: "", success: "Menu item saved successfully!" });
                setFoodName("");
                setFoodPrice("");
                setFoodSlots("");
                setTimeout(() => setMenuSaveState({ loading: false, error: "", success: "" }), 3000);
            } else {
                setMenuSaveState({ loading: false, error: data.message || "Failed to save menu item", success: "" });
            }
        } catch (err) {
            setMenuSaveState({ loading: false, error: "Server error", success: "" });
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/users/staff");
            const data = await res.json();
            if (res.ok) {
                setStaffList(data.staff);
            }
        } catch (err) {
            console.error("Failed to fetch staff:", err);
        }
    };

    const handleAddStaff = async () => {
        if (!newStaffName.trim() || !newStaffUsername.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) {
            setStaffError("All fields are required");
            return;
        }
        setStaffLoading(true);
        setStaffError("");
        try {
            const res = await fetch("http://localhost:5000/api/users/add-staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newStaffName.trim(),
                    username: newStaffUsername.trim(),
                    email: newStaffEmail.trim(),
                    password: newStaffPassword.trim()
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStaffList([...staffList, data.staff]);
                setNewStaffName("");
                setNewStaffUsername("");
                setNewStaffEmail("");
                setNewStaffPassword("");
                setShowAddForm(false);
            } else {
                setStaffError(data.message || "Failed to add staff");
            }
        } catch (err) {
            setStaffError("Server error. Please try again.");
        }
        setStaffLoading(false);
    };

    const handleDeleteStaff = async (index) => {
        const staff = staffList[index];
        try {
            const res = await fetch(`http://localhost:5000/api/users/staff/${staff.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setStaffList(staffList.filter((_, i) => i !== index));
            }
        } catch (err) {
            console.error("Failed to delete staff:", err);
        }
    };

    const handleCancelForm = () => {
        setShowAddForm(false);
        setNewStaffName("");
        setNewStaffUsername("");
        setNewStaffEmail("");
        setNewStaffPassword("");
        setStaffError("");
    };

    // Extract department from College ID (e.g., 23cs113 -> Computer Science)
    const getDepartment = (username) => {
        if (!username) return "Unknown";
        if (isAdmin) return "Administration";
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
                            <span role="img" aria-label="user">{isAdmin ? "🛡️" : isCanteenStaff ? "🧑‍🍳" : user.role === "Faculty" ? "👨‍🏫" : "🎓"}</span>
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
                    isAdmin ? (
                        /* ─── Admin Dashboard ─── */
                        <>
                            {/* Welcome Banner */}
                            <section className="admin-welcome-card">
                                <h2>Welcome, Admin!</h2>
                                <p>Manage the canteen operations below.</p>
                            </section>

                            {/* Quick Action Buttons */}
                            <section className="admin-quick-actions">
                                <button className="admin-action-btn manage-staff-btn">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    <span>Manage Staff</span>
                                </button>
                                <button className="admin-action-btn grievance-btn">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    <span>Grievance Management</span>
                                </button>
                                <button className="admin-action-btn upload-btn">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <span>Upload Certificates</span>
                                </button>
                            </section>

                            {/* Manage Staff Table */}
                            <section className="admin-table-section">
                                <h3>Manage Staff</h3>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffList.length === 0 && !showAddForm ? (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: "center", color: "#94a3b8", padding: "32px 16px" }}>
                                                        No staff added yet. Click "+ Add Staff" to get started.
                                                    </td>
                                                </tr>
                                            ) : (
                                                staffList.map((staff, index) => (
                                                    <tr key={index}>
                                                        <td>{staff.name}</td>
                                                        <td>{staff.username}</td>
                                                        <td>{staff.email}</td>
                                                        <td><span className={`role-tag ${staff.role.toLowerCase()}`}>{staff.role}</span></td>
                                                        <td>
                                                            <button className="table-btn edit-btn" onClick={() => handleEditStaff(index)}>✏️ Edit</button>
                                                            <button className="table-btn delete-btn" style={{ marginLeft: "8px" }} onClick={() => handleDeleteStaff(index)}>🗑️ Delete</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Add / Edit Staff Form */}
                                {showAddForm && (
                                    <div className="add-staff-form">
                                        <h4>{editIndex !== null ? "Edit Staff" : "Add New Staff"}</h4>
                                        {staffError && <div className="error-message" style={{ color: "red", marginBottom: "12px", fontSize: "14px" }}>{staffError}</div>}
                                        <div className="form-row">
                                            <input
                                                type="text"
                                                placeholder="Staff Name"
                                                value={newStaffName}
                                                onChange={(e) => setNewStaffName(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Username"
                                                value={newStaffUsername}
                                                onChange={(e) => setNewStaffUsername(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <input
                                                type="email"
                                                placeholder="Staff Email"
                                                value={newStaffEmail}
                                                onChange={(e) => setNewStaffEmail(e.target.value)}
                                            />
                                            {editIndex === null && (
                                                <input
                                                    type="password"
                                                    placeholder="Temporary Password"
                                                    value={newStaffPassword}
                                                    onChange={(e) => setNewStaffPassword(e.target.value)}
                                                />
                                            )}
                                        </div>
                                        <div className="form-actions">
                                            <button className="add-staff-btn" onClick={handleAddStaff} disabled={staffLoading}>
                                                {staffLoading ? "Processing..." : (editIndex !== null ? "Save Changes" : "Add Staff")}
                                            </button>
                                            <button className="cancel-btn" onClick={handleCancelForm} disabled={staffLoading}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {!showAddForm && (
                                    <button className="add-staff-btn" onClick={() => setShowAddForm(true)}>+ Add Staff</button>
                                )}
                            </section>
                        </>
                    ) : isCanteenStaff ? (
                        /* ─── Canteen Staff Dashboard ─── */
                        <>
                            {/* Welcome Section */}
                            <section className="canteen-welcome-card">
                                <h2>Welcome, Canteen Staff!</h2>
                                <p>Manage your food menu below.</p>
                            </section>

                            {/* Action Tabs */}
                            <div className="canteen-tabs">
                                <button
                                    className={`canteen-tab ${canteenView === "update_menu" ? "active-tab-green" : ""}`}
                                    onClick={() => setCanteenView("update_menu")}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Update Menu
                                </button>
                                <button
                                    className={`canteen-tab ${canteenView === "manage_categories" ? "active-tab-blue" : ""}`}
                                    onClick={() => setCanteenView("manage_categories")}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                    Manage Categories
                                </button>
                                <button
                                    className={`canteen-tab ${canteenView === "view_bookings" ? "active-tab-blue" : ""}`}
                                    onClick={() => setCanteenView("view_bookings")}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    View Bookings
                                </button>
                            </div>

                            {/* Canteen Content Area */}
                            <section className="canteen-content-area">
                                {canteenView === "update_menu" ? (
                                    <div className="canteen-form-card">
                                        <h3>Update Menu</h3>
                                        {menuSaveState.error && <div style={{ color: "red", marginBottom: "10px" }}>{menuSaveState.error}</div>}
                                        {menuSaveState.success && <div style={{ color: "green", marginBottom: "10px" }}>{menuSaveState.success}</div>}
                                        <div className="canteen-form-group">
                                            <label>Food Item</label>
                                            <div className="input-with-icon">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                </svg>
                                                <select
                                                    value={foodName}
                                                    onChange={(e) => setFoodName(e.target.value)}
                                                    style={{ width: "100%", padding: "12px 12px 12px 40px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", backgroundColor: "#f8fafc" }}
                                                >
                                                    <option value="">Select Food Item</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="canteen-form-row">
                                            <div className="canteen-form-group">
                                                <label>Price (₹)</label>
                                                <div className="input-with-icon">
                                                    <span className="currency-symbol">₹</span>
                                                    <select
                                                        value={foodPrice}
                                                        onChange={(e) => setFoodPrice(e.target.value)}
                                                        style={{ width: "100%", padding: "12px 12px 12px 40px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", backgroundColor: "#f8fafc", appearance: "none" }}
                                                    >
                                                        <option value="">Select Price</option>
                                                        <option value="10">10</option>
                                                        <option value="20">20</option>
                                                        <option value="30">30</option>
                                                        <option value="40">40</option>
                                                        <option value="50">50</option>
                                                        <option value="60">60</option>
                                                        <option value="80">80</option>
                                                        <option value="100">100</option>
                                                        <option value="120">120</option>
                                                        <option value="150">150</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="canteen-form-group">
                                                <label>Slots Available</label>
                                                <input
                                                    type="number"
                                                    placeholder="50"
                                                    value={foodSlots}
                                                    onChange={(e) => setFoodSlots(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className="canteen-save-btn"
                                            onClick={handleSaveMenu}
                                            disabled={menuSaveState.loading}
                                        >
                                            {menuSaveState.loading ? "Saving..." : "Save Item"}
                                        </button>
                                    </div>
                                ) : canteenView === "manage_categories" ? (
                                    <div className="canteen-form-card">
                                        <h3>Manage Categories</h3>
                                        <p style={{ color: "#64748b", margin: "4px 0 16px 0", fontSize: "14px" }}>Add new food entries to popuate your dropdown.</p>

                                        {categorySaveState.error && <div style={{ color: "red", marginBottom: "10px" }}>{categorySaveState.error}</div>}
                                        {categorySaveState.success && <div style={{ color: "green", marginBottom: "10px" }}>{categorySaveState.success}</div>}

                                        <div className="canteen-form-group">
                                            <label>Category Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Samosa"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                                            />
                                        </div>

                                        <div className="canteen-form-group">
                                            <label>Food Image</label>
                                            <input
                                                id="categoryImageInput"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setNewCategoryImage(e.target.files[0])}
                                                style={{ width: "100%", padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "8px", backgroundColor: "#f8fafc" }}
                                            />
                                        </div>

                                        <button
                                            className="canteen-save-btn"
                                            onClick={handleAddCategory}
                                            disabled={categorySaveState.loading}
                                            style={{ backgroundColor: "#3b82f6" }}
                                        >
                                            {categorySaveState.loading ? "Saving..." : "Add Category"}
                                        </button>

                                        <div style={{ marginTop: "24px" }}>
                                            <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#1e293b" }}>Existing Categories</h4>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                {categories.map((cat) => (
                                                    <span key={cat.id} style={{ padding: "6px 12px", backgroundColor: "#e2e8f0", borderRadius: "20px", fontSize: "12px", color: "#334155" }}>
                                                        {cat.name} {cat.image_url && "(📷)"}
                                                    </span>
                                                ))}
                                                {categories.length === 0 && <span style={{ color: "#94a3b8", fontSize: "13px" }}>No categories created yet.</span>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="canteen-form-card">
                                        <h3>View Bookings</h3>
                                        <p style={{ color: "#64748b", margin: "16px 0" }}>No bookings available to view at the moment.</p>
                                    </div>
                                )}
                            </section>
                        </>
                    ) : (
                        /* ─── Student / Faculty Dashboard ─── */
                        <>
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
                                        <button className="action-btn-green" onClick={() => setView("menu")}>
                                            Book Now <span>→</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </>
                    )
                ) : view === "menu" ? (
                    <Menu onBack={() => setView("dashboard")} />
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
                                    <span role="img" aria-label="user">{isAdmin ? "🛡️" : user.role === "Faculty" ? "👨‍🏫" : "🎓"}</span>
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
