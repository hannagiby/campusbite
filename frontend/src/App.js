import React, { useState } from "react";
import Profile from "./profile";
import Register from "./Register";
import Home from "./Home";
import Contact from "./Contact";

function App() {
  const [page, setPage] = useState("home");

  if (page === "home") {
    return <Home onGetStarted={() => setPage("login")} />;
  }

  if (page === "register") {
    return <Register onSwitchToLogin={() => setPage("login")} />;
  }

  if (page === "contact") {
    return <Contact onBackToLogin={() => setPage("login")} />;
  }

  return (
    <Profile 
      onSwitchToRegister={() => setPage("register")} 
      onShowContact={() => setPage("contact")}
    />
  );
}

export default App;
