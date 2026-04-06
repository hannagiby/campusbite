import React, { useState } from "react";
import html2canvas from "html2canvas";
import "./Payment.css";

function Payment({ cart, totalAmount, user, onBackToCart, onBackToDashboard }) {
    const [status, setStatus] = useState("idle"); // "idle", "loading", "success", "failure"
    const [paymentData, setPaymentData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const handlePayNow = async () => {
        setStatus("loading");
        setErrorMessage("");

        try {
            // Step 1: Create order on backend
            const res = await fetch("http://localhost:5000/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: totalAmount }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setStatus("failure");
                setErrorMessage(data.message || "Failed to initiate payment");
                return;
            }

            // Step 2: Open Razorpay Checkout popup
            const options = {
                key: data.key_id,
                amount: data.amount,
                currency: data.currency,
                name: "CampusBite",
                description: "Food Order Payment",
                order_id: data.order_id,
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                theme: {
                    color: "#2563eb",
                },
                handler: async function (response) {
                    // Payment successful on Razorpay side, now verify and complete on our backend
                    try {
                        setStatus("loading"); // keep loading while verifying
                        const verifyRes = await fetch("http://localhost:5000/api/payment/verify-and-complete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                cart,
                                totalAmount,
                                user
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok && verifyData.success) {
                            setPaymentData({
                                token: verifyData.token_number,
                                receipt: verifyData.receipt
                            });
                            setStatus("success");
                        } else {
                            setStatus("failure");
                            setErrorMessage(verifyData.message || "Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        setStatus("failure");
                        setErrorMessage("Server error during payment verification.");
                    }
                },
                modal: {
                    ondismiss: function () {
                        // User closed the popup without paying
                        setStatus("idle");
                    },
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
                setStatus("failure");
                setErrorMessage(response.error.description || "Payment failed at the gateway.");
            });

            rzp.open();
        } catch (error) {
            console.error("Payment error:", error);
            setStatus("failure");
            setErrorMessage("Could not connect to the payment server.");
        }
    };

    const handleDownloadToken = async () => {
        if (!paymentData) return;
        
        const receiptElement = document.getElementById("receipt-card-download");
        if (!receiptElement) return;

        try {
            const canvas = await html2canvas(receiptElement, { scale: 2 });
            const dataUrl = canvas.toDataURL("image/png");
            
            const link = document.createElement("a");
            link.download = `CampusBite_Token_${paymentData.token}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Error generating receipt image:", error);
        }
    };

    // ─── Success Screen (Receipt & Token) ───
    if (status === "success" && paymentData) {
        return (
            <div className="payment-container">
                <div id="receipt-card-download" className="payment-result-card receipt-card" style={{ backgroundColor: '#fff' }}>
                    <div className="receipt-header">
                        <div className="result-icon success">✅</div>
                        <h2 className="success-title">Payment Successful!</h2>
                        <p className="result-message">Your order has been confirmed.</p>
                    </div>

                    {/* Token Number - Huge Display */}
                    <div className="token-display-box">
                        <p className="token-label">YOUR ORDER TOKEN</p>
                        <h1 className="token-number">{paymentData.token}</h1>
                        <p className="token-help">Please show this token at the counter to collect your food.</p>
                    </div>

                    {/* Detailed Receipt */}
                    <div className="receipt-details">
                        <div className="receipt-meta">
                            <div>
                                <span className="meta-label">Payment ID:</span>
                                <span className="meta-value">{paymentData.receipt.payment_id}</span>
                            </div>
                            <div>
                                <span className="meta-label">Date:</span>
                                <span className="meta-value">
                                    {new Date(paymentData.receipt.timestamp).toLocaleString("en-IN", {
                                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                    })}
                                </span>
                            </div>
                        </div>

                        <hr className="receipt-divider" />

                        <div className="receipt-items">
                            {paymentData.receipt.items.map((item, idx) => (
                                <div key={idx} className="receipt-item-row">
                                    <span className="ritem-name">{item.quantity} × {item.food_name}</span>
                                    <span className="ritem-price">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <hr className="receipt-divider" />

                        <div className="receipt-total-row">
                            <span className="rtotal-label">Total Paid</span>
                            <span className="rtotal-amount">₹{paymentData.receipt.amount}</span>
                        </div>
                    </div>

                    <div className="result-actions mt-24" style={{ display: 'flex', gap: '10px' }} data-html2canvas-ignore="true">
                        <button
                            className="result-btn-primary"
                            onClick={handleDownloadToken}
                            style={{ backgroundColor: '#A8E6CF', color: '#1a4331', border: '1px solid #8acfae', boxShadow: '0 2px 4px rgba(168,230,207,0.3)' }}
                        >
                            ⬇ Download Token
                        </button>
                        <button
                            className="result-btn-primary success-btn"
                            onClick={onBackToDashboard}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Failure Screen ───
    if (status === "failure") {
        return (
            <div className="payment-container">
                <div className="payment-result-card">
                    <div className="result-icon failure">❌</div>
                    <h2 className="failure-title">Payment Failed</h2>
                    <p className="result-message error-text">
                        {errorMessage || "Something went wrong with your payment. Please try again."}
                    </p>

                    <div className="result-actions mt-24">
                        <button
                            className="result-btn-primary retry-btn"
                            onClick={() => setStatus("idle")}
                        >
                            Try Again
                        </button>
                        <button
                            className="result-btn-secondary"
                            onClick={onBackToCart}
                        >
                            Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Payment Page (idle / loading) ───
    return (
        <div className="payment-container">
            <div className="payment-header">
                <button className="back-btn" onClick={onBackToCart}>
                    <span>←</span> Back to Cart
                </button>
                <h2>Complete Payment</h2>
                <p>Review your order and pay securely</p>
            </div>

            {/* Test Mode Indicator */}
            <div className="test-mode-badge">
                <span role="img" aria-label="test">🧪</span> Test Mode — No real money will be charged
            </div>

            {/* Order Summary */}
            <div className="payment-summary-card">
                <h3>Order Summary</h3>
                <div className="payment-items-list">
                    {cart.map((item, index) => (
                        <div key={index} className="payment-item-row">
                            <div>
                                <span className="payment-item-name">{item.food_name}</span>
                                <span className="payment-item-qty"> × {item.quantity}</span>
                            </div>
                            <span className="payment-item-price">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>

                <hr className="payment-divider" />

                <div className="payment-total-row">
                    <span className="payment-total-label">Total</span>
                    <span className="payment-total-amount">₹{totalAmount}</span>
                </div>
            </div>

            {/* Pay Now Button */}
            <button
                className="pay-now-btn"
                onClick={handlePayNow}
                disabled={status === "loading"}
            >
                {status === "loading" ? (
                    <>
                        <span className="btn-loader"></span>
                        Processing...
                    </>
                ) : (
                    <>
                        <span className="btn-icon">💳</span>
                        Pay Now — ₹{totalAmount}
                    </>
                )}
            </button>

            <div className="payment-secure-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Secured by Razorpay | 256-bit SSL Encryption
            </div>
        </div>
    );
}

export default Payment;
