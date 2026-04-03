const express = require("express");
const router = express.Router();
const multer = require("multer");
const supabase = require("../supabaseClient");

// Set up multer for handling image uploads (max 5 images)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    }
});

// POST /api/grievances - Submit a new grievance (with optional images)
router.post("/", upload.array("images", 5), async (req, res) => {
    try {
        const { category, details, isAnonymous, user } = req.body;

        // Parse user JSON if it's a string (from FormData)
        let parsedUser = user;
        if (typeof user === "string") {
            try { parsedUser = JSON.parse(user); } catch (e) { parsedUser = {}; }
        }

        // Parse isAnonymous (comes as string from FormData)
        const anonymous = isAnonymous === "true" || isAnonymous === true;

        if (!category || !details) {
            return res.status(400).json({ message: "Category and details are required." });
        }

        if (details.length > 500) {
            return res.status(400).json({ message: "Complaint details must be 500 characters or less." });
        }

        // Upload images to Supabase Storage
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileExt = file.originalname.split(".").pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("grievance_images")
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true,
                    });

                if (uploadError) {
                    console.error("Image upload error:", uploadError);
                    continue; // Skip failed uploads but continue with others
                }

                const { data: { publicUrl } } = supabase.storage
                    .from("grievance_images")
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrl);
            }
        }

        const grievanceData = {
            category,
            details,
            is_anonymous: anonymous,
            submitted_by_name: anonymous ? null : (parsedUser?.name || null),
            submitted_by_username: anonymous ? null : (parsedUser?.username || null),
            submitted_by_email: anonymous ? null : (parsedUser?.email || null),
            submitted_by_role: anonymous ? null : (parsedUser?.role || null),
            status: "Pending",
            image_urls: imageUrls
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
// GET /api/grievances/user/:username - Fetch grievances for a specific user
router.get("/user/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const { data, error } = await supabase
            .from("grievances")
            .select("*")
            .eq("submitted_by_username", username)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase fetch error:", error);
            return res.status(500).json({ message: error.message || "Failed to fetch your grievances." });
        }

        return res.status(200).json({ grievances: data });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});

// GET /api/grievances/unnotified/:username - Fetch resolved grievances that the user hasn't been notified about
router.get("/unnotified/:username", async (req, res) => {
    try {
        const { username } = req.params;
        
        const { data, error } = await supabase
            .from("grievances")
            .select("*")
            .eq("submitted_by_username", username)
            .eq("is_anonymous", false)
            .eq("status", "Resolved")
            .eq("notified", false);

        if (error) {
            console.error("Supabase fetch error:", error);
            return res.status(500).json({ message: error.message || "Failed to fetch notifications." });
        }

        return res.status(200).json({ grievances: data });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});

// POST /api/grievances/mark-notified - Mark grievances as notified
router.post("/mark-notified", async (req, res) => {
    try {
        const { grievanceIds } = req.body;
        
        if (!grievanceIds || !Array.isArray(grievanceIds) || grievanceIds.length === 0) {
            return res.status(400).json({ message: "Invalid or empty grievance IDs array." });
        }

        const { data, error } = await supabase
            .from("grievances")
            .update({ notified: true })
            .in("id", grievanceIds)
            .select();

        if (error) {
            console.error("Supabase update error:", error);
            return res.status(500).json({ message: error.message || "Failed to mark as notified." });
        }

        return res.status(200).json({ message: "Marked as notified successfully!" });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
});

// PATCH /api/grievances/:id/status - Update grievance status (admin)
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminMessage } = req.body;

        const validStatuses = ["Pending", "In Progress", "Resolved"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be: Pending, In Progress, or Resolved." });
        }

        const updateData = { status };
        if (adminMessage !== undefined && adminMessage !== "") {
            updateData.admin_message = adminMessage;
        }

        const { data, error } = await supabase
            .from("grievances")
            .update(updateData)
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
