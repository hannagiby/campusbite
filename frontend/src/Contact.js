import React from "react";
import "./Contact.css";

function Contact({ onBackToLogin }) {
  return (
    <div className="contact-page">
      <div className="contact-card">
        <div className="brand-header">
          <div className="brand-logo">
            <span role="img" aria-label="food">🍽️</span>
          </div>
          <div className="brand-info">
            <h1>CampusBite</h1>
            <p>Smart Campus Food Prebooking System</p>
          </div>
        </div>

        <h2 className="contact-title">Contact Us</h2>
        
        <div className="contact-content">
          <div className="contact-item">
            <span className="contact-label">Email Support:</span>
            <a href="mailto:itsjcet@gmail.com" className="contact-value">itsjcet@gmail.com</a>
          </div>
          <p className="contact-description">
            For any technical issues or account inquiries, please reach out to our IT support team via email.
          </p>
        </div>

        <button 
          className="back-btn" 
          onClick={onBackToLogin}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default Contact;
