const express = require("express");
const supabase = require("../supabaseClient");
const router = express.Router();

// POST /api/ratings - Submit a rating for an order
router.post("/", async (req, res) => {
    try {
        const { order_id, user_username, user_name, rating, feedback, food_quality, is_anonymous } = req.body;

        if (!order_id || !user_username || !rating) {
            return res.status(400).json({ message: "order_id, user_username, and rating are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Check if rating already exists for this order
        const { data: existing, error: checkError } = await supabase
            .from("order_ratings")
            .select("id")
            .eq("order_id", order_id)
            .maybeSingle();

        if (checkError) {
            console.error("Check existing rating error:", checkError);
            return res.status(500).json({ message: "Failed to check existing rating" });
        }

        if (existing) {
            return res.status(409).json({ message: "You have already rated this order" });
        }

        // Insert the rating
        const { data, error } = await supabase
            .from("order_ratings")
            .insert([{
                order_id,
                user_username,
                user_name: is_anonymous ? "Anonymous" : (user_name || "Anonymous"),
                rating: Number(rating),
                feedback: feedback || null,
                food_quality: food_quality ? Number(food_quality) : null,
                is_anonymous: !!is_anonymous
            }])
            .select()
            .single();

        if (error) {
            console.error("Insert rating error:", error);
            return res.status(500).json({ message: error.message || "Failed to submit rating" });
        }

        res.status(201).json({ success: true, rating: data });
    } catch (error) {
        console.error("Submit rating error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/ratings/order/:orderId - Get rating for a specific order
router.get("/order/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;

        const { data, error } = await supabase
            .from("order_ratings")
            .select("*")
            .eq("order_id", orderId)
            .maybeSingle();

        if (error) {
            console.error("Fetch rating error:", error);
            return res.status(500).json({ message: "Failed to fetch rating" });
        }

        res.json({ rating: data || null });
    } catch (error) {
        console.error("Fetch rating error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/ratings/user/:username - Get all ratings by a user
router.get("/user/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const { data, error } = await supabase
            .from("order_ratings")
            .select("*")
            .eq("user_username", username)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch user ratings error:", error);
            return res.status(500).json({ message: "Failed to fetch ratings" });
        }

        res.json({ ratings: data || [] });
    } catch (error) {
        console.error("Fetch user ratings error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/ratings - Get all ratings (for admin)
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("order_ratings")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch all ratings error:", error);
            return res.status(500).json({ message: "Failed to fetch ratings" });
        }

        // Calculate average rating
        const totalRatings = data.length;
        const avgRating = totalRatings > 0
            ? (data.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
            : 0;

        const avgFoodQuality = totalRatings > 0
            ? (data.filter(r => r.food_quality).reduce((sum, r) => sum + r.food_quality, 0) / data.filter(r => r.food_quality).length || 0).toFixed(1)
            : 0;

        res.json({
            ratings: data,
            stats: {
                totalRatings,
                avgRating: Number(avgRating),
                avgFoodQuality: Number(avgFoodQuality)
            }
        });
    } catch (error) {
        console.error("Fetch all ratings error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/ratings/:id - Update a rating
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, feedback, food_quality } = req.body;

        const updateData = {};
        if (rating) updateData.rating = Number(rating);
        if (feedback !== undefined) updateData.feedback = feedback;
        if (food_quality) updateData.food_quality = Number(food_quality);

        const { data, error } = await supabase
            .from("order_ratings")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Update rating error:", error);
            return res.status(500).json({ message: "Failed to update rating" });
        }

        res.json({ success: true, rating: data });
    } catch (error) {
        console.error("Update rating error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
