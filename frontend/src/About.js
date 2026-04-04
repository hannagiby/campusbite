import React from "react";
import "./About.css";
/* Reuse Home styles for navbar, background, and footer */
import "./Home.css";

function About({ onNavigate }) {
  return (
    <div className="home-container about-page-wrapper">
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
            <a href="/about" className="active" onClick={(e) => e.preventDefault()}>About</a>
          </li>
          <li>
            <a href="/contact" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("contact"); }}>Contact</a>
          </li>
        </ul>
      </nav>

      {/* Main About Section */}
      <section className="about-main">
        <div className="about-header-section">
          <h2 className="about-main-title">
            Redefining <span className="highlight-palette">Campus Dining</span>
          </h2>
          <p className="about-main-subtitle">
            CampusBite is more than just a food service; it's a mission to make campus life<br />
            easier and more delicious.
          </p>
        </div>

        <div className="about-split-container">
          {/* Left Side: Logo Box */}
          <div className="about-logo-box">
            <div className="about-big-brand">
              <div className="about-big-logo">
                <span role="img" aria-label="food">🍽️</span>
              </div>
              <h2>CampusBite</h2>
            </div>
          </div>

          {/* Right Side: Our Story */}
          <div className="about-story-box">
            <h3>Our Story</h3>
            <p className="story-text">
              CampusBite exists at the intersection of taste and technology. We identified a common struggle at St. Joseph's: the race against time between lectures and the desire for a fresh, warm meal. That's why we created a platform where you can prebook your meals, skip the lines, and truly relax.
            </p>

            <div className="story-divider"></div>

            <div className="campus-home-section">
              <div className="campus-pin">📍</div>
              <div className="campus-home-text">
                <span className="campus-home-title">Our Campus Home</span>
                <span className="campus-home-details">
                  St. Joseph's College of Engineering and Technology,<br />
                  Palai (Autonomous)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section (exact copy from Home.js) */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <span className="footer-logo-icon" role="img" aria-label="food">🍽️</span>
              <span className="footer-brand">CampusBite</span>
            </div>
            <p className="footer-tagline">Fresh. Authentic. Affordable.</p>
          </div>
          <div className="footer-right">
            <h3>Reach Us</h3>
            <p><strong>Phone:</strong> 04822 239 700</p>
            <p>
              <strong>Hours:</strong><br />
              🕒 Mon–Sat: 9 AM – 5 PM<br />
              🕒 Sun: Closed
            </p>
            <p><strong>Address:</strong> St. Joseph’s College of Engineering and Technology, Palai</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 CampusBite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default About;
