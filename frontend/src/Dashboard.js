import React, { useState, useEffect } from "react";
import Menu from "./Menu";
import ConfirmOrder from "./ConfirmOrder";
import OutOfStock from "./OutOfStock";
import Cart from "./Cart";
import Payment from "./Payment";
import "./Dashboard.css";

function Dashboard({ user, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [view, setView] = useState("dashboard"); // "dashboard", "student_dashboard", "certificate", "staff_panel", "profile", "menu", "confirm_order", "out_of_stock", "cart"

    // Grievance state
    const [showGrievanceModal, setShowGrievanceModal] = useState(false);
    const [grievanceCategory, setGrievanceCategory] = useState("");
    const [grievanceDetails, setGrievanceDetails] = useState("");
    const [grievanceAnonymous, setGrievanceAnonymous] = useState(true);
    const [grievanceSubmitState, setGrievanceSubmitState] = useState({ loading: false, error: "", success: "" });
    const [grievanceImages, setGrievanceImages] = useState([]);

    // User Grievances View State
    const [showUserGrievancesModal, setShowUserGrievancesModal] = useState(false);
    const [userGrievances, setUserGrievances] = useState([]);
    const [userGrievanceFilter, setUserGrievanceFilter] = useState("All"); // "All", "Pending", "Resolved"
    const [userGrievanceLoading, setUserGrievanceLoading] = useState(false);
    
    // Grievance Notifications State
    const [notificationToast, setNotificationToast] = useState(null);

    // Admin grievance view state
    const [grievances, setGrievances] = useState([]);
    const [grievanceLoading, setGrievanceLoading] = useState(false);
    const [grievanceError, setGrievanceError] = useState("");
    
    // Admin Resolve Grievance State
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolveGrievanceId, setResolveGrievanceId] = useState(null);
    const [resolveMessage, setResolveMessage] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const [orderCount, setOrderCount] = useState(0);
    const [certificates, setCertificates] = useState([]);
    const [certLoading, setCertLoading] = useState(false);
    const [certError, setCertError] = useState("");
    const [staffPanel, setStaffPanel] = useState([]);
    const [staffPanelLoading, setStaffPanelLoading] = useState(false);
    const [staffPanelError, setStaffPanelError] = useState("");

    // Admin staff management state
    const [adminView, setAdminView] = useState("manage_staff"); // "manage_staff" or "upload_certificate"
    const [staffList, setStaffList] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffUsername, setNewStaffUsername] = useState("");
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffPassword, setNewStaffPassword] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [staffLoading, setStaffLoading] = useState(false);
    const [staffError, setStaffError] = useState("");

    // Upload Certificate State
    const [certificateFile, setCertificateFile] = useState(null);
    const [uploadState, setUploadState] = useState({ loading: false, error: "", success: "" });

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

    // Bookings / Orders state for staff panel
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [menuStock, setMenuStock] = useState([]);

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
        
        // Notifications check for normal users
        if (!isAdmin && !isCanteenStaff && user && user.username) {
            checkGrievanceNotifications();
        }
    }, [isAdmin, isCanteenStaff, user]);

    const checkGrievanceNotifications = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/grievances/unnotified/${user.username}`);
            const data = await res.json();
            
            if (res.ok && data.grievances && data.grievances.length > 0) {
                // Show notification toast for the first one, or a summary
                const count = data.grievances.length;
                setNotificationToast({
                    title: "Grievance Resolved",
                    message: count === 1 
                        ? "Your grievance has been resolved." 
                        : `${count} of your grievances have been resolved.`
                });

                // Auto hide after 5 seconds
                setTimeout(() => {
                    setNotificationToast(null);
                }, 5000);

                // Mark them as notified so they don't appear again
                const grievanceIds = data.grievances.map(g => g.id);
                await fetch("http://localhost:5000/api/grievances/mark-notified", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ grievanceIds })
                });
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    // Poll bookings every 10 seconds when canteen staff is viewing bookings
    useEffect(() => {
        if (isCanteenStaff && canteenView === "view_bookings") {
            fetchBookings();
            fetchMenuStock();
            const interval = setInterval(() => {
                fetchBookings();
                fetchMenuStock();
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [isCanteenStaff, canteenView]);

    const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/payment/orders");
            const data = await res.json();
            if (res.ok) {
                setBookings(data.orders || []);
            }
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        }
        setBookingsLoading(false);
    };

    const handleCompleteOrder = async (orderId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/payment/orders/${orderId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Completed" })
            });
            if (res.ok) {
                fetchBookings(); // Refresh the list
            } else {
                alert("Failed to update order status");
            }
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Error updating order status");
        }
    };

    const fetchMenuStock = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/menu");
            const data = await res.json();
            if (res.ok) {
                setMenuStock(data.menuItems || []);
            }
        } catch (err) {
            console.error("Failed to fetch menu stock:", err);
        }
    };

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

    const handleEditStaff = (index) => {
        const staff = staffList[index];
        setEditIndex(index);
        setNewStaffName(staff.name || "");
        setNewStaffUsername(staff.username || "");
        setNewStaffEmail(staff.email || "");
        setShowAddForm(true);
    };

    const handleUploadCertificate = async () => {
        if (!certificateFile) {
            setUploadState({ loading: false, error: "Please select a file to upload", success: "" });
            return;
        }
        setUploadState({ loading: true, error: "", success: "" });
        const formData = new FormData();
        formData.append("certificate", certificateFile);

        try {
            const res = await fetch("http://localhost:5000/api/upload/certificate", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setUploadState({ loading: false, error: "", success: "Certificate uploaded successfully!" });
                setCertificateFile(null);
                const fileInput = document.getElementById("certificateInput");
                if (fileInput) fileInput.value = "";
                fetchCertificates();
                setTimeout(() => setUploadState({ loading: false, error: "", success: "" }), 3000);
            } else {
                setUploadState({ loading: false, error: data.message || "Upload failed", success: "" });
            }
        } catch (err) {
            setUploadState({ loading: false, error: "Server error during upload", success: "" });
        }
    };

    // Extract department from College ID (e.g., 23cs113 -> Computer Science)
    const getDepartment = (username) => {
        if (!username) return "Unknown";
        if (isAdmin) return "Administration";
        
        // Extract the letters part from the username (e.g., 23cs113 -> cs, 23mca12 -> mca)
        const match = username.match(/[a-zA-Z]+/);
        const deptCode = match ? match[0].toLowerCase() : "";

        const deptMap = {
            cs: "Computer Science",
            cse: "Computer Science",
            me: "Mechanical",
            mec: "Mechanical",
            ec: "Electronics & Communication",
            ecs: "Electronics and Communication",
            ce: "Civil Engineering",
            cev: "Civil",
            ee: "Electrical Engineering",
            eee: "Electrical",
            mc: "Computer Application",
            mca: "Computer Application",
            ad: "Artificial Intelligence and Data Science",
            add: "Artificial Intelligence and Data Science",
            cy: "Cyber Security",
            cys: "Cyber Security",
        };
        return deptMap[deptCode] || "General Department";
    };

    const handleBookItem = (item) => {
        setSelectedItem(item);
        if (item.slots > 0) {
            setView("confirm_order");
        } else {
            setView("out_of_stock");
        }
    };

    const fetchCertificates = async () => {
        setCertLoading(true);
        setCertError("");
        try {
            const res = await fetch("http://localhost:5000/api/upload/certificates");
            const data = await res.json();
            if (res.ok) {
                setCertificates(data.certificates || []);
            } else {
                setCertError(data.message || "Failed to load certificates");
            }
        } catch (err) {
            setCertError("Could not connect to server.");
        }
        setCertLoading(false);
    };

    const fetchStaffPanel = async () => {
        setStaffPanelLoading(true);
        setStaffPanelError("");
        try {
            const res = await fetch("http://localhost:5000/api/users/staff");
            const data = await res.json();
            if (res.ok) {
                setStaffPanel(data.staff || []);
            } else {
                setStaffPanelError(data.message || "Failed to load staff");
            }
        } catch (err) {
            setStaffPanelError("Could not connect to server.");
        }
        setStaffPanelLoading(false);
    };

    // Grievance handlers
    const grievanceCategories = [
        "Food Quality",
        "Hygiene Issue",
        "Service Delay",
        "Billing Issue",
        "Staff Behavior",
        "Facility Maintenance",
        "Other"
    ];

    const handleOpenGrievanceModal = () => {
        setGrievanceCategory("");
        setGrievanceDetails("");
        setGrievanceAnonymous(true);
        setGrievanceSubmitState({ loading: false, error: "", success: "" });
        setGrievanceImages([]);
        setShowGrievanceModal(true);
    };

    const handleCloseGrievanceModal = () => {
        setShowGrievanceModal(false);
    };

    const handleGrievanceImageChange = (e) => {
        const files = Array.from(e.target.files);
        const total = grievanceImages.length + files.length;
        if (total > 5) {
            setGrievanceSubmitState({ loading: false, error: "You can attach a maximum of 5 photos.", success: "" });
            return;
        }
        setGrievanceImages(prev => [...prev, ...files]);
        // Reset file input so the same file can be selected again
        e.target.value = "";
    };

    const handleRemoveGrievanceImage = (index) => {
        setGrievanceImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitGrievance = async () => {
        if (!grievanceCategory) {
            setGrievanceSubmitState({ loading: false, error: "Please select a category.", success: "" });
            return;
        }
        if (!grievanceDetails.trim()) {
            setGrievanceSubmitState({ loading: false, error: "Please describe your complaint.", success: "" });
            return;
        }

        setGrievanceSubmitState({ loading: true, error: "", success: "" });
        try {
            const formData = new FormData();
            formData.append("category", grievanceCategory);
            formData.append("details", grievanceDetails.trim());
            formData.append("isAnonymous", grievanceAnonymous);
            formData.append("user", JSON.stringify({
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }));
            grievanceImages.forEach((file) => {
                formData.append("images", file);
            });

            const res = await fetch("http://localhost:5000/api/grievances", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setGrievanceSubmitState({ loading: false, error: "", success: "Grievance submitted successfully!" });
                setTimeout(() => {
                    setShowGrievanceModal(false);
                }, 1500);
            } else {
                setGrievanceSubmitState({ loading: false, error: data.message || "Failed to submit grievance.", success: "" });
            }
        } catch (err) {
            setGrievanceSubmitState({ loading: false, error: "Server error. Please try again.", success: "" });
        }
    };

    const fetchGrievances = async () => {
        setGrievanceLoading(true);
        setGrievanceError("");
        try {
            const res = await fetch("http://localhost:5000/api/grievances");
            const data = await res.json();
            if (res.ok) {
                setGrievances(data.grievances || []);
            } else {
                setGrievanceError(data.message || "Failed to load grievances.");
            }
        } catch (err) {
            setGrievanceError("Could not connect to server.");
        }
        setGrievanceLoading(false);
    };

    const fetchUserGrievances = async () => {
        if (!user || !user.username) return;
        setUserGrievanceLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/grievances/user/${user.username}`);
            const data = await res.json();
            if (res.ok) {
                setUserGrievances(data.grievances || []);
            }
        } catch (err) {
            console.error("Failed to fetch user grievances");
        }
        setUserGrievanceLoading(false);
    };

    const handleOpenUserGrievances = () => {
        setShowGrievanceModal(false);
        setUserGrievanceFilter("All");
        fetchUserGrievances();
        setShowUserGrievancesModal(true);
    };

    const handleUpdateGrievanceStatus = async (id, newStatus, isAnonymous = true) => {
        if (newStatus === "Resolved" && !isAnonymous) {
            setResolveGrievanceId(id);
            setResolveMessage("");
            setShowResolveModal(true);
            return;
        }
        await processGrievanceUpdate(id, newStatus, "");
    };

    const processGrievanceUpdate = async (id, newStatus, adminMessage) => {
        try {
            const body = { status: newStatus };
            if (adminMessage !== undefined && adminMessage !== "") {
                body.adminMessage = adminMessage;
            }

            const res = await fetch(`http://localhost:5000/api/grievances/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                setGrievances(prev => prev.map(g => g.id === id ? { 
                    ...g, 
                    status: newStatus, 
                    admin_message: adminMessage || g.admin_message 
                } : g));
            } else {
                alert(data.message || "Failed to update status.");
            }
        } catch (err) {
            alert("Server error. Could not update status.");
        }
    };

    const handleConfirmResolve = async () => {
        if (!resolveGrievanceId) return;
        await processGrievanceUpdate(resolveGrievanceId, "Resolved", resolveMessage);
        setShowResolveModal(false);
        setResolveGrievanceId(null);
        setResolveMessage("");
    };

    const handleConfirmOrder = async (item, quantity, totalTokens) => {
        try {
            // Simplified booking logical simulation
            const res = await fetch("http://localhost:5000/api/menu/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    foodId: item.id,
                    quantity: quantity
                })
            });

            if (res.ok) {
                alert(`Successfully booked ${quantity}x ${item.food_name} for ${totalTokens} tokens!`);
                setView("dashboard"); // Return to dashboard
            } else {
                const data = await res.json();
                alert(`Booking failed: ${data.message || "Could not complete order"}`);
            }
        } catch (err) {
            alert("Error connecting to server to place order.");
        }
    };

    const handleUpdateCartQuantity = (index, delta) => {
        const newCart = [...cart];
        const item = newCart[index];
        const newQuantity = item.quantity + delta;
        if (newQuantity > 0 && newQuantity <= item.slots) {
            item.quantity = newQuantity;
            setCart(newCart);
        } else if (newQuantity <= 0) {
            handleRemoveCartItem(index);
        } else if (newQuantity > item.slots) {
            alert(`Only ${item.slots} slots available for ${item.food_name}!`);
        }
    };

    const handleRemoveCartItem = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleCheckoutCart = () => {
        if (cart.length === 0) return;
        setView("payment");
    };

    const handlePaymentSuccess = () => {
        setCart([]);
        setView("dashboard");
    };

    return (
        <div className="dashboard-page">
            {/* Notification Toast */}
            {notificationToast && (
                <div className="notification-toast bounce-in">
                    <div className="toast-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div className="toast-content">
                        <h4>{notificationToast.title}</h4>
                        <p>{notificationToast.message}</p>
                    </div>
                    <button className="toast-close" onClick={() => setNotificationToast(null)}>✕</button>
                </div>
            )}

            {/* Admin Resolve Grievance Modal */}
            {showResolveModal && (
                <div className="grievance-modal-overlay" onClick={() => setShowResolveModal(false)}>
                    <div className="grievance-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="grievance-modal-header">
                            <h2>Resolve Grievance</h2>
                            <button className="grievance-modal-close" onClick={() => setShowResolveModal(false)}>✕</button>
                        </div>
                        <div className="grievance-modal-content" style={{ marginTop: '16px' }}>
                            <div className="canteen-form-group">
                                <label>Admin Message / Reply (Optional)</label>
                                <textarea 
                                    placeholder="e.g. Issue has been fixed. Kitchen cleaned."
                                    value={resolveMessage}
                                    onChange={(e) => setResolveMessage(e.target.value)}
                                    rows="4"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical', marginTop: '8px', fontFamily: 'inherit' }}
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>This message will be visible to the student/faculty.</p>
                            </div>
                            <div className="grievance-modal-actions">
                                <button className="grievance-submit-btn" onClick={handleConfirmResolve}>
                                    Confirm Resolution
                                </button>
                                <button className="grievance-back-btn" onClick={() => setShowResolveModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                <button className={`admin-action-btn manage-staff-btn ${adminView === "manage_staff" ? "active" : ""}`} onClick={() => setAdminView("manage_staff")}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    <span>Manage Staff</span>
                                </button>
                                <button className={`admin-action-btn grievance-btn ${adminView === "view_grievances" ? "active" : ""}`} onClick={() => { setAdminView("view_grievances"); fetchGrievances(); }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    <span>Grievance Management</span>
                                </button>
                                <button className={`admin-action-btn upload-btn ${adminView === "upload_certificate" ? "active" : ""}`} onClick={() => { setAdminView("upload_certificate"); fetchCertificates(); }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <span>Upload Certificates</span>
                                </button>
                            </section>

                            {/* Content based on Admin View */}
                            {adminView === "manage_staff" ? (
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
                            ) : adminView === "upload_certificate" ? (
                                <section className="admin-upload-section" style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
                                    <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#1e293b" }}>Upload Certificate</h3>
                                    <div className="upload-form-card" style={{ maxWidth: "500px", marginBottom: "32px" }}>
                                        <p style={{ color: "#64748b", margin: "4px 0 16px 0", fontSize: "14px" }}>Upload food quality or safety certificates here.</p>
                                        {uploadState.error && <div style={{ color: "red", marginBottom: "10px", fontSize: "14px", padding: "10px", backgroundColor: "#fef2f2", borderRadius: "6px" }}>{uploadState.error}</div>}
                                        {uploadState.success && <div style={{ color: "green", marginBottom: "10px", fontSize: "14px", padding: "10px", backgroundColor: "#f0fdf4", borderRadius: "6px" }}>{uploadState.success}</div>}

                                        <div className="form-group" style={{ marginBottom: "20px" }}>
                                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#334155" }}>Certificate File</label>
                                            <input
                                                id="certificateInput"
                                                type="file"
                                                onChange={(e) => setCertificateFile(e.target.files[0])}
                                                style={{ width: "100%", padding: "12px", border: "1px dashed #cbd5e1", borderRadius: "8px", backgroundColor: "#f8fafc", cursor: "pointer" }}
                                            />
                                        </div>
                                        <button
                                            className="upload-submit-btn"
                                            onClick={handleUploadCertificate}
                                            disabled={uploadState.loading}
                                            style={{ backgroundColor: "#3b82f6", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", cursor: uploadState.loading ? "not-allowed" : "pointer", fontWeight: "600", width: "100%", transition: "background-color 0.2s" }}
                                            onMouseOver={(e) => !uploadState.loading && (e.currentTarget.style.backgroundColor = "#2563eb")}
                                            onMouseOut={(e) => !uploadState.loading && (e.currentTarget.style.backgroundColor = "#3b82f6")}
                                        >
                                            {uploadState.loading ? "Uploading..." : "Upload Certificate"}
                                        </button>
                                    </div>

                                    <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#1e293b", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>Uploaded Certificates</h3>

                                    {certLoading && <div style={{ color: "#64748b" }}>Loading certificates...</div>}
                                    {certError && <div style={{ color: "red" }}>{certError}</div>}

                                    {!certLoading && !certError && certificates.length === 0 && (
                                        <div style={{ color: "#64748b", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
                                            No certificates uploaded yet.
                                        </div>
                                    )}

                                    {!certLoading && !certError && certificates.length > 0 && (
                                        <div className="certificates-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                                            {certificates.map((cert) => (
                                                <div key={cert.id} className="certificate-card" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#fff" }}>
                                                    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "16px" }}>
                                                        <div style={{ backgroundColor: "#eff6ff", padding: "10px", borderRadius: "8px", marginRight: "12px" }}>
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                                <polyline points="10 9 9 9 8 9"></polyline>
                                                            </svg>
                                                        </div>
                                                        <div style={{ overflow: "hidden", flex: 1 }}>
                                                            <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px", color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={cert.file_name}>{cert.file_name}</p>
                                                            <p style={{ margin: "0", fontSize: "12px", color: "#64748b" }}>
                                                                Uploaded: {new Date(cert.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={cert.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ display: "block", textAlign: "center", backgroundColor: "#f1f5f9", color: "#475569", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "500", fontSize: "14px", transition: "all 0.2s", border: "1px solid #e2e8f0" }}
                                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
                                                    >
                                                        Preview
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            ) : adminView === "view_grievances" ? (
                                <section className="admin-table-section">
                                    <h3>Grievance Management</h3>
                                    <p style={{ color: "#64748b", margin: "-12px 0 24px 0", fontSize: "14px" }}>Review complaints submitted by students and faculty.</p>

                                    {grievanceLoading && (
                                        <div className="cert-loading">Loading grievances...</div>
                                    )}

                                    {grievanceError && (
                                        <div className="cert-error">{grievanceError}</div>
                                    )}

                                    {!grievanceLoading && !grievanceError && grievances.length === 0 && (
                                        <div className="cert-empty">
                                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                            </svg>
                                            <p>No grievances submitted yet.</p>
                                        </div>
                                    )}

                                    {!grievanceLoading && !grievanceError && grievances.length > 0 && (
                                        <div className="grievance-list">
                                            {grievances.map((g) => {
                                                const catClass = g.category.toLowerCase().split(' ').join('-');
                                                return (
                                                    <div key={g.id} className="grievance-card">
                                                        <div className="grievance-card-header">
                                                            <span className={`grievance-category-badge gc-${catClass}`}>{g.category}</span>
                                                            <span className={`grievance-status-badge gs-${g.status.toLowerCase()}`}>{g.status}</span>
                                                        </div>
                                                        <p className="grievance-card-details">{g.details}</p>
                                                        {g.image_urls && g.image_urls.length > 0 && (
                                                            <div className="grievance-images-gallery">
                                                                {g.image_urls.map((url, idx) => (
                                                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="grievance-gallery-thumb">
                                                                        <img src={url} alt={`Grievance attachment ${idx + 1}`} />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="grievance-card-footer">
                                                            <div className="grievance-submitter">
                                                                {g.is_anonymous ? (
                                                                    <span className="grievance-anonymous-tag">🔒 Anonymous</span>
                                                                ) : (
                                                                    <span className="grievance-user-tag">👤 {g.submitted_by_name} ({g.submitted_by_role}) — {g.submitted_by_username}</span>
                                                                )}
                                                            </div>
                                                            <span className="grievance-date">
                                                                {new Date(g.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                            </span>
                                                        </div>
                                                        <div className="grievance-card-actions">
                                                            {g.status !== "Resolved" ? (
                                                                <button className="grievance-resolve-btn" onClick={() => handleUpdateGrievanceStatus(g.id, "Resolved", g.is_anonymous)}>
                                                                    ✅ Mark Resolved
                                                                </button>
                                                            ) : (
                                                                <button className="grievance-reopen-btn" onClick={() => handleUpdateGrievanceStatus(g.id, "Pending")}>
                                                                    🔄 Reopen
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            ) : null}
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
                                            {categorySaveState.loading ? "Saving..." : "Add item"}
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
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                            <h3 style={{ margin: 0 }}>Order Tracking</h3>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16a34a", display: "inline-block", animation: "pulse 2s infinite" }}></span>
                                                <span style={{ fontSize: "12px", color: "#64748b" }}>Live • Auto-refreshing</span>
                                                <button onClick={() => { fetchBookings(); fetchMenuStock(); }} style={{ padding: "4px 12px", fontSize: "12px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer" }}>↻ Refresh</button>
                                            </div>
                                        </div>

                                        {/* Summary Row */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                                            <div style={{ background: "linear-gradient(135deg, #dbeafe, #eff6ff)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                                                <p style={{ margin: 0, fontSize: "12px", color: "#3b82f6", fontWeight: 600 }}>TOTAL ORDERS</p>
                                                <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 800, color: "#1e40af" }}>{bookings.length}</p>
                                            </div>
                                            <div style={{ background: "linear-gradient(135deg, #dcfce7, #f0fdf4)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                                                <p style={{ margin: 0, fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>REVENUE</p>
                                                <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 800, color: "#15803d" }}>₹{bookings.reduce((s, o) => s + Number(o.total_amount || 0), 0)}</p>
                                            </div>
                                            <div style={{ background: "linear-gradient(135deg, #fef3c7, #fffbeb)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                                                <p style={{ margin: 0, fontSize: "12px", color: "#d97706", fontWeight: 600 }}>LAST TOKEN</p>
                                                <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 800, color: "#92400e" }}>{bookings.length > 0 ? bookings[0].token_number : "—"}</p>
                                            </div>
                                        </div>

                                        {/* Food Stock Section */}
                                        <div style={{ marginBottom: "24px" }}>
                                            <h4 style={{ margin: "0 0 12px", fontSize: "15px", color: "#1e293b" }}>📦 Food Stock Levels</h4>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                {menuStock.map((item) => (
                                                    <span key={item.id} style={{
                                                        padding: "6px 14px",
                                                        borderRadius: "20px",
                                                        fontSize: "13px",
                                                        fontWeight: 600,
                                                        background: item.slots > 10 ? "#dcfce7" : item.slots > 0 ? "#fef3c7" : "#fee2e2",
                                                        color: item.slots > 10 ? "#166534" : item.slots > 0 ? "#92400e" : "#991b1b",
                                                    }}>
                                                        {item.food_name}: {item.slots} left
                                                    </span>
                                                ))}
                                                {menuStock.length === 0 && <span style={{ color: "#94a3b8", fontSize: "13px" }}>No menu items found.</span>}
                                            </div>
                                        </div>

                                        {/* Orders List */}
                                        <h4 style={{ margin: "0 0 12px", fontSize: "15px", color: "#1e293b" }}>🎫 Recent Orders</h4>
                                        {bookingsLoading && bookings.length === 0 ? (
                                            <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Loading orders...</p>
                                        ) : bookings.length === 0 ? (
                                            <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>No orders placed yet today.</p>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                                                {bookings.map((order) => (
                                                    <div key={order.id} style={{
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "12px",
                                                        padding: "16px",
                                                        background: "#fafafa",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        gap: "16px"
                                                    }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                            <div style={{
                                                                background: "linear-gradient(135deg, #16a34a, #15803d)",
                                                                color: "white",
                                                                borderRadius: "10px",
                                                                padding: "8px 14px",
                                                                fontWeight: 800,
                                                                fontSize: "18px",
                                                                fontFamily: "'Courier New', monospace",
                                                                minWidth: "70px",
                                                                textAlign: "center"
                                                            }}>
                                                                {order.token_number}
                                                            </div>
                                                            <div>
                                                                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{order.user_name}</p>
                                                                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                                                    {(order.items || []).map(i => `${i.quantity}× ${i.food_name}`).join(", ")}
                                                                </p>
                                                                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                                                                    {new Date(order.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                                                            <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#16a34a" }}>₹{order.total_amount}</p>
                                                            <span style={{
                                                                display: "inline-block",
                                                                padding: "2px 8px",
                                                                borderRadius: "6px",
                                                                fontSize: "11px",
                                                                fontWeight: 600,
                                                                background: order.status === "Confirmed" ? "#dcfce7" : order.status === "Completed" ? "#f1f5f9" : "#fef3c7",
                                                                color: order.status === "Confirmed" ? "#166534" : order.status === "Completed" ? "#64748b" : "#92400e"
                                                            }}>{order.status}</span>
                                                            
                                                            {order.status !== "Completed" && (
                                                                <button
                                                                    onClick={() => handleCompleteOrder(order.id)}
                                                                    style={{
                                                                        marginTop: "4px",
                                                                        padding: "4px 10px",
                                                                        fontSize: "11px",
                                                                        background: "#3b82f6",
                                                                        color: "white",
                                                                        border: "none",
                                                                        borderRadius: "6px",
                                                                        cursor: "pointer",
                                                                        fontWeight: 600
                                                                    }}>
                                                                    Mark Completed
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                        <p>View your previous orders, current active tokens, and transaction history.</p>
                                        <button className="action-btn" onClick={() => setView("student_dashboard")}>
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
                ) : view === "student_dashboard" ? (
                    /* ─── Student / Faculty Dashboard Detail View ─── */
                    <>
                        <div className="std-back-row">
                            <button className="back-btn" onClick={() => setView("dashboard")}>
                                <span>←</span> Back to Home
                            </button>
                        </div>
                        <section className="std-dashboard-welcome">
                            <h2>My Order History</h2>
                            <p>Track your tokens and previous meal bookings</p>
                        </section>

                        <section className="std-quick-actions" style={{ marginTop: "30px" }}>
                            <h3 className="std-section-title" style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>Quick Actions</h3>
                            <div className="std-actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
                                <button className="std-action-tile grievance-tile" onClick={handleOpenGrievanceModal} style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: "16px", padding: "20px", color: "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transition: "transform 0.2s" }}>
                                    <div className="std-tile-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                    </div>
                                    <span style={{ fontWeight: "600", fontSize: "15px" }}>Grievances</span>
                                </button>

                                <button className="std-action-tile tokens-tile" onClick={() => { setView("certificate"); fetchCertificates(); }} style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", borderRadius: "16px", padding: "20px", color: "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transition: "transform 0.2s" }}>
                                    <div className="std-tile-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                                            <line x1="3" y1="9" x2="21" y2="9"></line>
                                            <line x1="3" y1="15" x2="21" y2="15"></line>
                                        </svg>
                                    </div>
                                    <span style={{ fontWeight: "600", fontSize: "15px" }}>Certificate</span>
                                </button>

                                <button className="std-action-tile staff-tile" onClick={() => { setView("staff_panel"); fetchStaffPanel(); }} style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", border: "none", borderRadius: "16px", padding: "20px", color: "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transition: "transform 0.2s" }}>
                                    <div className="std-tile-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    </div>
                                    <span style={{ fontWeight: "600", fontSize: "15px" }}>Staff Panel</span>
                                </button>
                            </div>
                        </section>

                        {/* Recent Orders List for Student */}
                        <section className="std-orders-list-section" style={{ marginTop: "20px" }}>
                            {bookingsLoading ? (
                                <p style={{ textAlign: "center", color: "#64748b" }}>Loading your orders...</p>
                            ) : bookings.filter(b => b.user_username === user.username).length === 0 ? (
                                <div className="std-empty-order" style={{ textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "16px", border: "1.5px dashed #e2e8f0" }}>
                                    <p style={{ color: "#94a3b8" }}>You haven't placed any orders yet.</p>
                                    <button className="action-btn-green" onClick={() => setView("menu")} style={{ marginTop: "12px" }}>Browse Menu</button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {bookings
                                        .filter(b => b.user_username === user.username)
                                        .map((order) => (
                                            <div key={order.id} style={{
                                                background: "white",
                                                borderRadius: "16px",
                                                padding: "20px",
                                                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                border: order.status === "Confirmed" ? "1px solid #bbf7d0" : "1px solid #f1f5f9"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <div style={{
                                                        background: order.status === "Confirmed" ? "linear-gradient(135deg, #16a34a, #15803d)" : "#94a3b8",
                                                        color: "white",
                                                        borderRadius: "12px",
                                                        padding: "12px 16px",
                                                        fontWeight: 800,
                                                        fontSize: "20px",
                                                        fontFamily: "'Courier New', monospace",
                                                        textAlign: "center"
                                                    }}>
                                                        {order.token_number}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>
                                                            {(order.items || []).map(i => `${i.quantity}× ${i.food_name}`).join(", ")}
                                                        </h4>
                                                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                                                            {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#16a34a" }}>₹{order.total_amount}</p>
                                                    <span style={{
                                                        display: "inline-block",
                                                        marginTop: "4px",
                                                        padding: "4px 10px",
                                                        borderRadius: "6px",
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        background: order.status === "Confirmed" ? "#dcfce7" : "#f1f5f9",
                                                        color: order.status === "Confirmed" ? "#166534" : "#64748b"
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </section>
                    </>
                ) : view === "staff_panel" ? (
                    /* ─── Staff Panel View ─── */
                    <section className="staff-panel-section">
                        <div className="cert-view-header">
                            <button className="back-btn" onClick={() => setView("dashboard")}>
                                <span>←</span> Back
                            </button>
                            <h2>Canteen Staff</h2>
                            <p>Staff members managing the canteen.</p>
                        </div>

                        {staffPanelLoading && (
                            <div className="cert-loading">Loading staff...</div>
                        )}

                        {staffPanelError && (
                            <div className="cert-error">{staffPanelError}</div>
                        )}

                        {!staffPanelLoading && !staffPanelError && staffPanel.length === 0 && (
                            <div className="cert-empty">
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                </svg>
                                <p>No staff added yet.</p>
                            </div>
                        )}

                        <div className="sp-grid">
                            {staffPanel.map((s) => (
                                <div key={s.id} className="sp-card">
                                    <div className="sp-avatar">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <div className="sp-info">
                                        <p className="sp-name">{s.name}</p>
                                        <p className="sp-email">{s.email}</p>
                                    </div>
                                    <span className="sp-role-badge">Canteen Staff</span>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : view === "certificate" ? (
                    /* ─── Certificate View ─── */
                    <section className="cert-view-section">
                        <div className="cert-view-header">
                            <button className="back-btn" onClick={() => setView("dashboard")}>
                                <span>←</span> Back
                            </button>
                            <h2>Food Certificates</h2>
                            <p>Certificates uploaded by the admin for food quality &amp; safety.</p>
                        </div>

                        {certLoading && (
                            <div className="cert-loading">Loading certificates...</div>
                        )}

                        {certError && (
                            <div className="cert-error">{certError}</div>
                        )}

                        {!certLoading && !certError && certificates.length === 0 && (
                            <div className="cert-empty">
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <p>No certificates uploaded yet.</p>
                            </div>
                        )}

                        <div className="cert-grid">
                            {certificates.map((cert) => {
                                const isPdf = cert.file_url && cert.file_url.toLowerCase().endsWith(".pdf");
                                const uploadDate = cert.uploaded_at
                                    ? new Date(cert.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                                    : "";
                                return (
                                    <div key={cert.id} className="cert-card">
                                        <div className="cert-card-preview">
                                            {isPdf ? (
                                                <div className="cert-pdf-icon">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                                        <polyline points="10 9 9 9 8 9"></polyline>
                                                    </svg>
                                                    <span>PDF</span>
                                                </div>
                                            ) : (
                                                <img src={cert.file_url} alt={cert.file_name} className="cert-image" />
                                            )}
                                        </div>
                                        <div className="cert-card-info">
                                            <p className="cert-card-name">{cert.file_name}</p>
                                            {uploadDate && <p className="cert-card-date">Uploaded: {uploadDate}</p>}
                                            <a
                                                href={cert.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cert-view-btn"
                                            >
                                                View
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : view === "menu" ? (
                    <Menu
                        onBack={() => setView("dashboard")}
                        onBookItem={handleBookItem}
                        cart={cart}
                        setCart={setCart}
                        onProceedToCart={() => setView("cart")}
                    />
                ) : view === "cart" ? (
                    <Cart
                        cart={cart}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemoveItem={handleRemoveCartItem}
                        onProceedToPayment={handleCheckoutCart}
                        onBack={() => setView("menu")}
                    />
                ) : view === "payment" ? (
                    <Payment
                        cart={cart}
                        totalAmount={cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                        user={user}
                        onBackToCart={() => setView("cart")}
                        onBackToDashboard={handlePaymentSuccess}
                    />
                ) : view === "confirm_order" ? (
                    <ConfirmOrder
                        item={selectedItem}
                        onCancel={() => setView("menu")}
                        onProceed={handleConfirmOrder}
                    />
                ) : view === "out_of_stock" ? (
                    <OutOfStock
                        item={selectedItem}
                        onBackToMenu={() => setView("menu")}
                    />
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

            {/* ─── Grievance Submission Modal ─── */}
            {showGrievanceModal && (
                <div className="grievance-modal-overlay" onClick={handleCloseGrievanceModal}>
                    <div className="grievance-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="grievance-modal-header">
                            <h2>Submit Grievance</h2>
                            <button className="grievance-modal-close" onClick={handleCloseGrievanceModal}>✕</button>
                        </div>

                        {grievanceSubmitState.error && (
                            <div className="grievance-error-msg">{grievanceSubmitState.error}</div>
                        )}
                        {grievanceSubmitState.success && (
                            <div className="grievance-success-msg">{grievanceSubmitState.success}</div>
                        )}

                        <div className="grievance-form-group">
                            <label>Issue Category <span className="required-star">*</span></label>
                            <select
                                value={grievanceCategory}
                                onChange={(e) => setGrievanceCategory(e.target.value)}
                                className="grievance-select"
                            >
                                <option value="">Select a category</option>
                                {grievanceCategories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grievance-form-group">
                            <label>Complaint Details <span className="required-star">*</span></label>
                            <textarea
                                className="grievance-textarea"
                                placeholder="Please describe your complaint in detail..."
                                value={grievanceDetails}
                                onChange={(e) => { if (e.target.value.length <= 500) setGrievanceDetails(e.target.value); }}
                                maxLength={500}
                                rows={5}
                            />
                            <span className="grievance-char-count">{grievanceDetails.length}/500 characters</span>
                        </div>

                        <div className="grievance-form-group">
                            <label>Attach Photos <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>(optional, max 5)</span></label>
                            <div className="grievance-photo-upload">
                                <label className="grievance-photo-upload-btn" htmlFor="grievanceImageInput">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    <span>Choose Photos</span>
                                </label>
                                <input
                                    id="grievanceImageInput"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGrievanceImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            {grievanceImages.length > 0 && (
                                <div className="grievance-preview-strip">
                                    {grievanceImages.map((file, idx) => (
                                        <div key={idx} className="grievance-preview-thumb">
                                            <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} />
                                            <button className="grievance-preview-remove" onClick={() => handleRemoveGrievanceImage(idx)} type="button">✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grievance-anonymous-row">
                            <label className="grievance-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={grievanceAnonymous}
                                    onChange={(e) => setGrievanceAnonymous(e.target.checked)}
                                    className="grievance-checkbox"
                                />
                                <span className="grievance-checkbox-custom"></span>
                                <div>
                                    <strong>Submit anonymously (hide my identity)</strong>
                                    <p>Your complaint will be processed without revealing your personal information</p>
                                </div>
                            </label>
                        </div>

                        <div className="grievance-modal-actions">
                            <button
                                className="grievance-submit-btn"
                                onClick={handleSubmitGrievance}
                                disabled={grievanceSubmitState.loading}
                            >
                                {grievanceSubmitState.loading ? "Submitting..." : "Submit Complaint"}
                            </button>
                            <button
                                className="grievance-view-btn"
                                onClick={handleOpenUserGrievances}
                            >
                                View My Grievances
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── My Grievances Modal ─── */}
            {showUserGrievancesModal && (
                <div className="grievance-modal-overlay" onClick={() => setShowUserGrievancesModal(false)}>
                    <div className="grievance-modal my-grievances-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="grievance-modal-header">
                            <h2>My Grievances</h2>
                            <button className="grievance-modal-close" onClick={() => setShowUserGrievancesModal(false)}>✕</button>
                        </div>

                        <div className="grievance-filter-tabs">
                            <button
                                className={`grievance-filter-tab ${userGrievanceFilter === "All" ? "active" : ""}`}
                                onClick={() => setUserGrievanceFilter("All")}
                            >
                                All
                            </button>
                            <button
                                className={`grievance-filter-tab ${userGrievanceFilter === "Pending" ? "active" : ""}`}
                                onClick={() => setUserGrievanceFilter("Pending")}
                            >
                                Pending
                            </button>
                            <button
                                className={`grievance-filter-tab ${userGrievanceFilter === "Resolved" ? "active" : ""}`}
                                onClick={() => setUserGrievanceFilter("Resolved")}
                            >
                                Resolved
                            </button>
                        </div>

                        <div className="user-grievance-list">
                            {userGrievanceLoading ? (
                                <div className="user-grievance-empty">Loading your grievances...</div>
                            ) : (
                                (() => {
                                    const filtered = userGrievances.filter(g =>
                                        userGrievanceFilter === "All" || g.status === userGrievanceFilter
                                    );

                                    if (filtered.length === 0) {
                                        return (
                                            <div className="user-grievance-empty">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                    <circle cx="12" cy="13" r="3"></circle>
                                                    <line x1="12" y1="16" x2="12" y2="20"></line>
                                                </svg>
                                                <p>You have not submitted any grievances yet.</p>
                                            </div>
                                        );
                                    }

                                    return filtered.map(g => {
                                        const catClass = g.category.toLowerCase().split(' ').join('-');
                                        return (
                                            <div key={g.id} className="user-grievance-card">
                                                <div className="ug-card-header">
                                                    <span className={`grievance-category-badge gc-${catClass}`}>{g.category}</span>
                                                    <span className={`grievance-status-badge gs-${g.status.toLowerCase().replace(' ', '-')}`}>{g.status}</span>
                                                </div>
                                                <p className="ug-card-details">{g.details.substring(0, 100)}{g.details.length > 100 ? "..." : ""}</p>
                                                <div className="ug-card-footer">
                                                    <span className="ug-date">
                                                        {new Date(g.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                    {g.image_urls && g.image_urls.length > 0 && (
                                                        <span className="ug-attachment-tag">📎 {g.image_urls.length} Attachment{g.image_urls.length !== 1 && 's'}</span>
                                                    )}
                                                </div>
                                                {g.admin_message && (
                                                    <div className="ug-admin-response">
                                                        <div className="ug-admin-response-title">Admin Response</div>
                                                        <p>{g.admin_message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()
                            )}
                        </div>

                        <div className="grievance-modal-actions mt-4">
                            <button
                                className="grievance-back-btn"
                                onClick={() => {
                                    setShowUserGrievancesModal(false);
                                    setGrievanceCategory("");
                                    setGrievanceDetails("");
                                    setShowGrievanceModal(true);
                                }}
                            >
                                ← Back to Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
