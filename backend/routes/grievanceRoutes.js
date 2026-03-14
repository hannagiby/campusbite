const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// POST /api/grievances - Submit a new grievance
router.post("/", async (req, res) => {
    try {
        const { category, details, isAnonymous, user } = req.body;

        if (!category || !details) {
            return res.status(400).json({ message: "Category and details are required." });
        }

        if (details.length > 500) {
            return res.status(400).json({ message: "Complaint details must be 500 characters or less." });
        }

        const grievanceData = {
            category,
            details,
            is_anonymous: isAnonymous || false,
            submitted_by_name: isAnonymous ? null : (user?.name || null),
            submitted_by_username: isAnonymous ? null : (user?.username || null),
            submitted_by_email: isAnonymous ? null : (user?.email || null),
            submitted_by_role: isAnonymous ? null : (user?.role || null),
            status: "Pending"
        };

        const { data, error } = await supabase
            .from("grievances")
            .insert([grievanceData])
            .select();

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ message: error.message || "Failed to submit grievance." });
        }

        return res.status(201).json({
            message: "Grievance submitted successfully!",
            grievance: data[0]
        });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});

// GET /api/grievances - Fetch all grievances (for admin)
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("grievances")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase fetch error:", error);
            return res.status(500).json({ message: error.message || "Failed to fetch grievances." });
        }

        return res.status(200).json({ grievances: data });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});
// PATCH /api/grievances/:id/status - Update grievance status (admin)
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["Pending", "In Progress", "Resolved"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be: Pending, In Progress, or Resolved." });
        }

        const { data, error } = await supabase
            .from("grievances")
            .update({ status })
            .eq("id", id)
            .select();

        if (error) {
            console.error("Supabase update error:", error);
            return res.status(500).json({ message: error.message || "Failed to update status." });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Grievance not found." });
        }

        return res.status(200).json({
            message: "Status updated successfully!",
            grievance: data[0]
        });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});

module.exports = router;
