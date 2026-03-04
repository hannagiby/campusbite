import React from "react";
import "./OutOfStock.css";

function OutOfStock({ item, onBackToMenu }) {
    if (!item) return null;

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

    const imageUrl = (item.image_url && item.image_url !== "default")
        ? item.image_url
        : (foodImages[item.food_name] || defaultImage);

    return (
        <div className="out-of-stock-container">
            <div className="out-of-stock-card">
                <div className="out-of-stock-banner">
                    <span className="banner-icon">🍰</span> Out of Stock
                </div>

                <div className="out-of-stock-content">
                    <div className="item-illustration">
                        <img src={imageUrl} alt={item.food_name} />
                    </div>

                    <h3 className="out-of-stock-title">
                        Sorry, <strong>{item.food_name}</strong> is currently out of stock.
                    </h3>

                    <div className="out-of-stock-divider"></div>

                    <p className="out-of-stock-message">
                        All tokens for this item are exhausted.
                    </p>
                    <p className="out-of-stock-submessage">
                        Please select another item or check back later.
                    </p>

                    <button className="back-to-menu-btn" onClick={onBackToMenu}>
                        Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OutOfStock;
