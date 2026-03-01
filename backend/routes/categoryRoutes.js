const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET all categories
router.get("/", async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from("food_categories")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            console.error("Fetch categories error:", error);
            return res.status(500).json({ message: "Failed to fetch categories" });
        }

        res.json({ categories: categories || [] });
    } catch (error) {
        console.error("Fetch categories error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST a new category
router.post("/", async (req, res) => {
    try {
        const { name, imageUrl } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Insert new category
        const { data, error } = await supabase
            .from("food_categories")
            .insert([{ name, image_url: imageUrl }])
            .select()
            .single();

        if (error) {
            console.error("Save category error:", error);
            // Handle unique constraint violation (code 23505 in Postgres)
            if (error.code === '23505') {
                return res.status(400).json({ message: "Category already exists" });
            }
            return res.status(500).json({ message: `Failed to save category: ${error.message}`, errorDetails: error });
        }

        res.status(201).json({
            message: "Category added successfully",
            category: data
        });
    } catch (error) {
        console.error("Save category exception:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
