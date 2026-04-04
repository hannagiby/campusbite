import React, { useState } from "react";
import Profile from "./profile";
import Register from "./Register";
import Home from "./Home";
import Contact from "./Contact";
import About from "./About";

function App() {
  const [page, setPage] = useState("home");

  if (page === "home") {
    return <Home onGetStarted={() => setPage("login")} onNavigate={(target) => setPage(target)} />;
  }

  if (page === "register") {
    return <Register onSwitchToLogin={() => setPage("login")} />;
  }

  if (page === "about") {
    return <About onNavigate={(target) => setPage(target)} />;
  }

  if (page === "contact") {
    return <Contact onNavigate={(target) => setPage(target)} />;
  }

  return (
    <Profile 
      onSwitchToRegister={() => setPage("register")} 
      onShowContact={() => setPage("contact")}
    />
  );
}

export default App;
