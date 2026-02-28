const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const bcrypt = require("bcryptjs");

// LOGIN (username & password passed as query params)
router.get("/login", async (req, res) => {
  try {
    const { username, password } = req.query;

    // Check if user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Success
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, username, password, email, role } = req.body;

    // Validate College ID format based on role
    const studentPattern = /^\d{2}[a-zA-Z]{2}\d{3}$/;   // e.g. 23cs113
    const facultyPattern = /^\d{2}[a-zA-Z]{3}\d{2}$/;   // e.g. 23cse12

    if (role === "Student" && !studentPattern.test(username)) {
      return res.status(400).json({ message: "Invalid Student ID. Format: 23cs113 (2 digits + 2 letters + 3 digits)" });
    }
    if (role === "Faculty" && !facultyPattern.test(username)) {
      return res.status(400).json({ message: "Invalid Faculty ID. Format: 23cse12 (2 digits + 3 letters + 2 digits)" });
    }

    // Check if college ID or email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: "College ID or Email already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        { name, username, password: hashedPassword, email, role }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({ message: "Failed to register user" });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

