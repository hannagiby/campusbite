import React, { useState } from "react";
import "./ConfirmOrder.css";

function ConfirmOrder({ item, onCancel, onProceed }) {
    const [quantity, setQuantity] = useState(1);

    if (!item) return null;

    const handleMinus = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handlePlus = () => {
        // Optionally check against item.slots
        if (quantity < item.slots) {
            setQuantity(quantity + 1);
        }
    };

    // Convert generic image_url to default if not present
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

    // We are considering 'price' as tokens for the UI
    const priceTokens = item.price;
    const totalTokens = priceTokens * quantity;

    return (
        <div className="confirm-order-container">
            <div className="confirm-order-header">
                <h2>Confirm Your Order</h2>
                <p>Review your selection and proceed to payment</p>
            </div>

            <div className="confirm-order-card">
                <div className="confirm-order-image-banner">
                    <img src={imageUrl} alt={item.food_name} />
                </div>

                <div className="confirm-order-content">
                    <h3 className="food-title">{item.food_name}</h3>

                    <div className="quantity-section">
                        <span className="quantity-label">Quantity</span>
                        <div className="quantity-controls">
                            <button className="qty-btn" onClick={handleMinus}>&minus;</button>
                            <span className="qty-value">{quantity}</span>
                            <button className="qty-btn" onClick={handlePlus}>&#43;</button>
                        </div>
                    </div>

                    <div className="calculation-box">
                        <div className="calc-row">
                            <span className="calc-label">Price per item:</span>
                            <span className="calc-value">Rs. {priceTokens}</span>
                        </div>
                        <div className="calc-row">
                            <span className="calc-label">Quantity:</span>
                            <span className="calc-value">&times; {quantity}</span>
                        </div>
                        <hr className="calc-divider" />
                        <div className="calc-row total-row">
                            <span className="calc-label-total">Total Amount:</span>
                            <span className="calc-value-total">Rs. {totalTokens}</span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
                        <button className="btn-proceed" onClick={() => onProceed(item, quantity, totalTokens)}>
                            <span className="proceed-icon">💳</span> Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmOrder;
