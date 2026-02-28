import React, { useState } from "react";
import Profile from "./profile";
import Register from "./Register";
import Home from "./Home";

function App() {
  const [page, setPage] = useState("home");

  if (page === "home") {
    return <Home onGetStarted={() => setPage("login")} />;
  }

  if (page === "register") {
    return <Register onSwitchToLogin={() => setPage("login")} />;
  }

  return <Profile onSwitchToRegister={() => setPage("register")} />;
}

export default App;
