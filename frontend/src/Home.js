import React from "react";
import "./Home.css";
import FoodCard from "./FoodCard";

function Home({ onGetStarted, onNavigate }) {
    const defaultFoodItems = [
        {
            image: "./chicken_biryani_local.png",
            tag: "BESTSELLER",
            title: "Chicken Biryani",
            description: "Authentic dum biryani with succulent chicken and aromatic basmati rice.",
            price: "120"
        },
        {
            image: "./club_sandwich_local.png",
            tag: "ENERGY",
            title: "Club Sandwich",
            description: "Triple-decker delight with fresh veggies, premium cheese, and grilled fillings.",
            price: "60"
        },
        {
            image: "./fish_fry_local.png",
            tag: "SEASONAL",
            title: "Fish Fry",
            description: "Crispy, golden-brown fish fillets marinated in traditional spicy herbs.",
            price: "80"
        }
    ];

    const [foodItems, setFoodItems] = React.useState(defaultFoodItems);

    React.useEffect(() => {
        const fetchDailyMenu = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/menu");
                const data = await res.json();
                if (res.ok && data.menuItems && data.menuItems.length > 0) {
                    const mappedItems = data.menuItems.map(item => ({
                        image: (item.image_url && item.image_url !== "default")
                            ? item.image_url
                            : defaultFoodItems[0].image, // Reusing existing local asset as fallback
                        tag: "TODAY'S SPECIAL",
                        title: item.food_name,
                        description: `Freshly prepared for today. Remaining slots: ${item.slots}. Order now!`,
                        price: item.price
                    }));
                    setFoodItems(mappedItems);
                }
            } catch (err) {
                console.error("Failed to load backend menu, using static defaults.", err);
            }
        };
        fetchDailyMenu();
    }, []);

    return (
        <div className="home-container">
            {/* Navbar excellence */}
            <nav className="home-nav">
                <div className="home-brand">
                    <div className="home-logo">
                        <span role="img" aria-label="food">🍽️</span>
                    </div>
                    <h1>CampusBite</h1>
                </div>
                <ul className="home-nav-links">
                    <li><a href="/" className="active" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("home"); }}>Home</a></li>
                    <li><a href="/about" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("about"); }}>About</a></li>
                    <li><a href="/contact" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("contact"); }}>Contact</a></li>
                </ul>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container-inner">
                    <div className="hero-left">
                        <span className="promo-badge">BEST CAMPUS EATS</span>
                        <h2 className="promo-title">
                            Brunch Time – <br />
                            <span className="highlight-text">Fresh and Delicious</span>
                        </h2>
                        <p className="hero-description">
                            Experience the best of campus dining. Fresh, healthy, and affordable meals pre-booked and ready just for you at St. Joseph's.
                        </p>
                        <div className="hero-btns">
                            <button className="get-started-btn-dark" onClick={onGetStarted}>
                                Get Started
                            </button>
                            <button className="explore-menu-btn" onClick={() => {
                                document.querySelector('.favourites-section').scrollIntoView({ behavior: 'smooth' });
                            }}>
                                Explore Menu
                            </button>
                        </div>
                    </div>
                    <div className="hero-right">
                        <div className="hero-image-blob">
                            <img src="./hero_brunch_bowl_local.png" alt="Healthy Brunch Bowl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Campus Favourites Section */}
            <section className="favourites-section">
                <div className="section-header">
                    <h2 className="section-title">Campus Favourites</h2>
                    <p className="section-subtitle">Specially curated lunch options just for you.</p>
                </div>
                <div className="food-grid">
                    {foodItems.map((item, index) => (
                        <FoodCard
                            key={index}
                            image={item.image}
                            tag={item.tag}
                            title={item.title}
                            description={item.description}
                            price={item.price}
                        />
                    ))}
                </div>
            </section>

            {/* Footer Section */}
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

export default Home;
