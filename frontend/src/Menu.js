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

function Menu({ onBack, onBookItem, cart = [], setCart = () => { }, onProceedToCart }) {
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

    const handleAddToCart = (item) => {
        // Validate slots before adding
        if (item.slots <= 0) {
            alert(`${item.food_name} is currently sold out!`);
            return;
        }

        const existingItemIndex = cart.findIndex(c => c.id === item.id);
        if (existingItemIndex > -1) {
            // If it exists, but increasing it would exceed slots, abort
            if (cart[existingItemIndex].quantity >= item.slots) {
                alert(`Cannot add more ${item.food_name}, only ${item.slots} slots left!`);
                return;
            }
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const handleBook = (item) => {
        // We now just use handleAddToCart directly
        handleAddToCart(item);
    };

    const handleDragStart = (e, item) => {
        e.dataTransfer.setData("application/json", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const itemData = e.dataTransfer.getData("application/json");
        if (itemData) {
            const item = JSON.parse(itemData);
            handleAddToCart(item);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    return (
        <section className="menu-container-split">
            <div className="menu-section-main">
                <div className="menu-header">
                    <button className="back-btn" onClick={onBack}>
                        <span>←</span> Back to Dashboard
                    </button>
                    <h2>Today's Menu</h2>
                    <p>Freshly prepared food waiting for you! (Drag items to cart)</p>
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
                            <div
                                key={item.id}
                                className={`menu-card ${item.slots <= 0 ? 'sold-out' : ''}`}
                                draggable={item.slots > 0}
                                onDragStart={(e) => handleDragStart(e, item)}
                            >
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
                                        Add to Cart Quick
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Dropzone Sidebar */}
            <div className="menu-cart-sidebar" onDragOver={handleDragOver} onDrop={handleDrop}>
                <div className="sidebar-header">
                    <h3>Drop Items Here</h3>
                    <p>Drag food to add to cart</p>
                </div>

                <div className="sidebar-cart-list">
                    {cart.length === 0 ? (
                        <div className="sidebar-empty">
                            <span className="sidebar-icon">🛒</span>
                            <p>Drag your favorite meals and curries here.</p>
                        </div>
                    ) : (
                        cart.map((c, i) => (
                            <div key={i} className="sidebar-cart-item">
                                <div className="sidebar-item-info">
                                    <span className="sidebar-item-qty">{c.quantity}x</span>
                                    <span className="sidebar-item-name">{c.food_name}</span>
                                </div>
                                <span className="sidebar-item-price">₹{c.price * c.quantity}</span>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="sidebar-footer">
                        <div className="sidebar-total">
                            <span>Total</span>
                            <span>₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                        </div>
                        <button className="sidebar-checkout-btn" onClick={onProceedToCart}>
                            View Cart & Checkout
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Menu;
