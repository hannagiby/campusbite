const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET all menu items
router.get("/", async (req, res) => {
    try {
        const { data: menuItems, error } = await supabase
            .from("menu_items")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch menu error:", error);
            return res.status(500).json({ message: "Failed to fetch menu items" });
        }

        res.json({ menuItems: menuItems || [] });
    } catch (error) {
        console.error("Fetch menu error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST (add or update) a menu item
router.post("/", async (req, res) => {
    try {
        const { foodName, price, slots, imageUrl } = req.body;

        if (!foodName || price === undefined || slots === undefined) {
            return res.status(400).json({ message: "Food Name, Price, and Slots are required" });
        }

        // Check if the item already exists
        const { data: existingItems, error: fetchError } = await supabase
            .from("menu_items")
            .select("id")
            .eq("food_name", foodName);

        if (fetchError) {
            console.error("Check existing menu item error:", fetchError);
            return res.status(500).json({ message: "Database check failed" });
        }

        const existingItem = existingItems && existingItems.length > 0 ? existingItems[0] : null;

        let result;

        if (existingItem) {
            // Update existing item
            const { data, error } = await supabase
                .from("menu_items")
                .update({ price, slots, image_url: imageUrl })
                .eq("id", existingItem.id)
                .select()
                .single();

            result = { data, error };
        } else {
            // Insert new item
            const { data, error } = await supabase
                .from("menu_items")
                .insert([{ food_name: foodName, price, slots, image_url: imageUrl }])
                .select()
                .single();

            result = { data, error };
        }

        const { data: savedItem, error: saveError } = result;

        if (saveError) {
            console.error("Save menu item error:", saveError);
            return res.status(500).json({ message: "Failed to save menu item" });
        }

        res.status(200).json({
            message: "Menu item saved successfully",
            menuItem: savedItem
        });
    } catch (error) {
        console.error("Save menu item exception:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST to book an item
router.post("/book", async (req, res) => {
    try {
        const { foodId, quantity } = req.body;

        if (!foodId || !quantity || quantity < 1) {
            return res.status(400).json({ message: "Invalid booking request" });
        }

        // Fetch the current item to check slots
        const { data: item, error: fetchError } = await supabase
            .from("menu_items")
            .select("*")
            .eq("id", foodId)
            .single();

        if (fetchError || !item) {
            return res.status(404).json({ message: "Food item not found" });
        }

        if (item.slots < quantity) {
            return res.status(400).json({ message: `Only ${item.slots} slots available` });
        }

        // Reduce slots
        const newSlots = item.slots - quantity;

        const { data: updatedItem, error: updateError } = await supabase
            .from("menu_items")
            .update({ slots: newSlots })
            .eq("id", foodId)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ message: "Failed to update slots" });
        }

        // Here you would typically also create an order record for the user

        res.status(200).json({
            message: "Booking successful",
            item: updatedItem
        });

    } catch (error) {
        console.error("Booking exception:", error);
        res.status(500).json({ message: "Server error during booking" });
    }
});

// POST to book a cart of items
router.post("/book-cart", async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Invalid cart data" });
        }

        const errors = [];
        const updatedItems = [];

        for (const cartItem of items) {
            const { data: item, error: fetchError } = await supabase
                .from("menu_items")
                .select("*")
                .eq("id", cartItem.id)
                .single();

            if (fetchError || !item) {
                errors.push(`${cartItem.food_name} not found`);
                continue;
            }

            if (item.slots < cartItem.quantity) {
                errors.push(`Only ${item.slots} slots available for ${item.food_name}`);
                continue;
            }

            const newSlots = item.slots - cartItem.quantity;

            const { data: updatedItem, error: updateError } = await supabase
                .from("menu_items")
                .update({ slots: newSlots })
                .eq("id", item.id)
                .select()
                .single();

            if (updateError) {
                errors.push(`Failed to update ${item.food_name}`);
            } else {
                updatedItems.push(updatedItem);
                console.log(`Booking cart item: ${cartItem.quantity}x ${item.food_name}`);
            }
        }

        if (errors.length > 0 && updatedItems.length === 0) {
            return res.status(400).json({ message: "Checkout failed", details: errors });
        }

        res.status(200).json({
            message: "Cart booking successful",
            items: updatedItems,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("Cart booking exception:", error);
        res.status(500).json({ message: "Server error during cart booking" });
    }
});

module.exports = router;
