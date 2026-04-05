const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET /api/announcements
// Returns all active announcements, newest first
router.get("/", async (req, res) => {
    try {
        const { data: announcements, error } = await supabase
            .from("announcements")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch announcements error:", error);
            return res.status(500).json({ message: "Failed to fetch announcements" });
        }

        res.json({ announcements: announcements || [] });
    } catch (error) {
        console.error("Fetch announcements error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/announcements
// Admin creates a new broadcast announcement
router.post("/", async (req, res) => {
    try {
        const { title, message, type, createdBy } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }

        const { data: announcement, error } = await supabase
            .from("announcements")
            .insert([{
                title,
                message,
                type: type || "info",
                created_by: createdBy || "Admin"
            }])
            .select()
            .single();

        if (error) {
            console.error("Create announcement error:", error);
            return res.status(500).json({ message: "Failed to create announcement" });
        }

        res.status(201).json({ announcement });
    } catch (error) {
        console.error("Create announcement error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/announcements/:id
// Admin deletes an announcement
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from("announcements")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Delete announcement error:", error);
            return res.status(500).json({ message: "Failed to delete announcement" });
        }

        res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.error("Delete announcement error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
