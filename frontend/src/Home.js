import React from "react";
import "./Home.css";

function Home({ onGetStarted }) {
    return (
        <div className="home-container">
            {/* Navbar with Brand */}
            <nav className="home-nav">
                <div className="home-brand">
                    <div className="home-logo">
                        <span role="img" aria-label="food">🍽️</span>
                    </div>
                    <h1>CampusBite</h1>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <p className="hero-tagline">/ CAMPUS FOOD SOLUTION</p>
                    <h2 className="hero-title">Pre-order Your Favorite Campus Meals</h2>
                    <p className="hero-description">
                        A web pre-booking system that offers students the convenience of
                        ordering meals in advance, skipping queues, and enjoying fresh
                        food exactly when they want it.
                    </p>
                    <button className="get-started-btn" onClick={onGetStarted}>
                        Get Started
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Home;
