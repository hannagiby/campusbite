require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
const menuRoutes = require("./routes/menuRoutes");
app.use("/api/menu", menuRoutes);
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);
const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);
const grievanceRoutes = require("./routes/grievanceRoutes");
app.use("/api/grievances", grievanceRoutes);
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);
const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);
const announcementsRoutes = require("./routes/announcementsRoutes");
app.use("/api/announcements", announcementsRoutes);
const eventsRoutes = require("./routes/eventsRoutes");
app.use("/api/events", eventsRoutes);
const ratingRoutes = require("./routes/ratingRoutes");
app.use("/api/ratings", ratingRoutes);

// Start server directly
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
