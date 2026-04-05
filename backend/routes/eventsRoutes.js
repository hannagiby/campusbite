const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // adjust if needed based on the file's location vs supabaseClient.js

// GET /api/events
// Fetch upcoming events ordered by date ascending
router.get("/", async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from("events")
            .select("*")
            .eq("is_active", true)
            .gte("event_date", new Date().toISOString().split("T")[0]) // Upcoming only
            .order("event_date", { ascending: true });

        if (error) {
            console.error("Fetch events error:", error);
            return res.status(500).json({ message: "Failed to fetch events" });
        }

        res.json({ events: events || [] });
    } catch (err) {
        console.error("Events get error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/events
// Admin adds a new event
router.post("/", async (req, res) => {
    const { title, description, event_date, type } = req.body;
    
    if (!title || !event_date) {
        return res.status(400).json({ message: "Title and Event Date are required." });
    }

    try {
        const { data, error } = await supabase
            .from("events")
            .insert([
                {
                    title,
                    description: description || "",
                    event_date,
                    type: type || "event",
                    is_active: true
                }
            ])
            .select();

        if (error) {
            console.error("Insert event error:", error);
            return res.status(500).json({ message: "Failed to create event" });
        }

        res.status(201).json({ message: "Event created successfully", event: data[0] });
    } catch (err) {
        console.error("Events post error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/events/:id
// Admin deletes an event
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Delete event error:", error);
            return res.status(500).json({ message: "Failed to delete event" });
        }

        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("Events delete error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
