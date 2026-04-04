import React from "react";
import "./Contact.css";
/* Also import Home.css to reuse the navbar and background styling */
import "./Home.css";

function Contact({ onNavigate }) {
  return (
    <div className="home-container contact-page-wrapper">
      {/* Navbar reusing the Home navigation style */}
      <nav className="home-nav">
        <div className="home-brand">
          <div className="home-logo">
            <span role="img" aria-label="food">🍽️</span>
          </div>
          <h1>CampusBite</h1>
        </div>
        <ul className="home-nav-links">
          <li>
            <a href="/" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("home"); }}>Home</a>
          </li>
          <li>
            <a href="/about" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("about"); }}>About</a>
          </li>
          <li>
            <a href="/contact" className="active" onClick={(e) => e.preventDefault()}>Contact</a>
          </li>
        </ul>
      </nav>

      {/* Main Contact Section */}
      <section className="contact-main">
        <div className="contact-header-section">
          <h2 className="contact-main-title">
            Get in <span className="highlight-touch">Touch</span>
          </h2>
          <p className="contact-main-subtitle">
            Questions? Suggestions? We'd love to hear from you.
          </p>
        </div>

        <div className="contact-split-container">
          {/* Left Side: Contact Details */}
          <div className="contact-details-box">
            <h3>Contact Details</h3>

            <div className="contact-info-row">
              <div className="contact-icon bg-red">📞</div>
              <div className="contact-info-text">
                <span className="contact-info-label">Phone</span>
                <span className="contact-info-value">04822 239 700</span>
              </div>
            </div>

            <div className="contact-info-row">
              <div className="contact-icon bg-orange">⏰</div>
              <div className="contact-info-text">
                <span className="contact-info-label">Hours</span>
                <span className="contact-info-value">
                  🕒 Mon–Sat: 9 AM – 5 PM<br />
                  🕒 Sun: Closed
                </span>
              </div>
            </div>

            <div className="contact-info-row">
              <div className="contact-icon bg-purple">✉️</div>
              <div className="contact-info-text">
                <span className="contact-info-label">Email Support</span>
                <span className="contact-info-value">itsjcet@gmail.com</span>
              </div>
            </div>

            <div className="contact-info-row">
              <div className="contact-icon bg-blue">📍</div>
              <div className="contact-info-text">
                <span className="contact-info-label">Address</span>
                <span className="contact-info-value">St. Joseph’s College of Engineering and Technology, Palai</span>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="contact-social-section">
              <h4 className="social-heading">Connect With Us</h4>
              <div className="social-links-container">
                <a href="https://instagram.com/CampusBite_Official" className="social-btn instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://facebook.com/CampusBiteOfficial" className="social-btn facebook" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="https://linkedin.com/company/campusbite" className="social-btn linkedin" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://twitter.com/CampusBite_HQ" className="social-btn twitter" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
              </div>
              <p className="social-handle">@CampusBite_Official</p>
            </div>
          </div>

          {/* Right Side: Map Embedded Box */}
          <div className="contact-map-box">
            <h3>Our Location</h3>
            <div className="map-wrapper">
              <iframe
                src="https://maps.google.com/maps?q=St.%20Joseph's%20College%20of%20Engineering%20and%20Technology,%20Palai&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location">
              </iframe>
            </div>
            <a href="https://maps.app.goo.gl/6MGMNEvntxApYafd9?g_st=aw" target="_blank" rel="noopener noreferrer" className="map-btn">
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
