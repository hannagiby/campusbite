import React, { useState, useEffect } from "react";
import "./Menu.css";

const foodImages = {
    "Biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=500&auto=format&fit=crop",
    "Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=500&auto=format&fit=crop",
    "Meals": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop",
    "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop",
    "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop",
    "Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=500&auto=format&fit=crop",
    "Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=500&auto=format&fit=crop",
    "Noodles": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=500&auto=format&fit=crop"
};

const defaultImage = "https://images.unsplash.com/photo-1495195134817-a169d5622329?q=80&w=500&auto=format&fit=crop";

function Menu({ onBack }) {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/menu");
                const data = await res.json();
                if (res.ok) {
                    setMenuItems(data.menuItems);
                } else {
                    setError("Failed to load menu");
                }
            } catch (err) {
                setError("Server error while fetching menu");
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    const handleBook = (item) => {
        alert(`Booking ${item.food_name}. Integration for orders can be added here!`);
    };

    return (
        <section className="menu-section">
            <div className="menu-header">
                <button className="back-btn" onClick={onBack}>
                    <span>←</span> Back to Dashboard
                </button>
                <h2>Today's Menu</h2>
                <p>Freshly prepared food waiting for you!</p>
            </div>

            {loading ? (
                <div className="menu-loading">Loading menu...</div>
            ) : error ? (
                <div className="menu-error">{error}</div>
            ) : menuItems.length === 0 ? (
                <div className="menu-empty">No items available on the menu today.</div>
            ) : (
                <div className="menu-grid">
                    {menuItems.map((item) => (
                        <div key={item.id} className="menu-card">
                            <div className="menu-image">
                                <img
                                    src={(item.image_url && item.image_url !== "default") ? item.image_url : (foodImages[item.food_name] || defaultImage)}
                                    alt={item.food_name}
                                />
                                {item.slots <= 0 && <span className="sold-out-badge">Sold Out</span>}
                            </div>
                            <div className="menu-details">
                                <h3 className="menu-item-name">{item.food_name}</h3>
                                <div className="menu-item-info">
                                    <span className="menu-price">₹{item.price}</span>
                                    <span className="menu-slots">{item.slots} Left</span>
                                </div>
                                <button
                                    className={`menu-book-btn ${item.slots <= 0 ? 'disabled' : ''}`}
                                    disabled={item.slots <= 0}
                                    onClick={() => handleBook(item)}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Menu;
