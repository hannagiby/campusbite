import React from 'react';
import './Cart.css';

function Cart({ cart, onUpdateQuantity, onRemoveItem, onProceedToPayment, onBack }) {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const foodImages = {
        "Biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=500&auto=format&fit=crop",
        "Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=500&auto=format&fit=crop",
        "Meals": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop",
        "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop",
        "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop",
        "Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=500&auto=format&fit=crop",
        "Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=500&auto=format&fit=crop",
        "Noodles": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=500&auto=format&fit=crop",
        "Porotta": "https://images.unsplash.com/photo-1610196773950-73f139fb2c58?q=80&w=500&auto=format&fit=crop",
        "Chapati": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=500&auto=format&fit=crop",
        "Ghee Rice": "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=500&auto=format&fit=crop"
    };
    const defaultImage = "https://images.unsplash.com/photo-1495195134817-a169d5622329?q=80&w=500&auto=format&fit=crop";

    return (
        <div className="cart-container">
            <div className="cart-header">
                <button className="back-btn" onClick={onBack}>
                    <span>←</span> Back
                </button>
                <h2>Your Food Cart</h2>
                <p>Review your selected items</p>
            </div>

            {cart.length === 0 ? (
                <div className="cart-empty">
                    <p>Your cart is empty.</p>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items-list">
                        {cart.map((item, index) => {
                            const imageUrl = (item.image_url && item.image_url !== "default")
                                ? item.image_url
                                : (foodImages[item.food_name] || defaultImage);

                            return (
                                <div key={index} className="cart-item-card">
                                    <div className="cart-item-image">
                                        <img src={imageUrl} alt={item.food_name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <h3 className="cart-item-title">
                                            {item.food_name}
                                        </h3>
                                        <p className="cart-item-price">₹{item.price}</p>
                                        <div className="cart-item-quantity">
                                            <button className="qty-btn" onClick={() => onUpdateQuantity(index, -1)}>&minus;</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => onUpdateQuantity(index, 1)}>&#43;</button>
                                        </div>
                                    </div>
                                    <div className="cart-item-actions">
                                        <button className="remove-btn" onClick={() => onRemoveItem(index)} title="Remove item">🗑️</button>
                                        <p className="cart-item-total">₹{item.price * item.quantity}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <button className="checkout-btn" onClick={onProceedToPayment}>
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
