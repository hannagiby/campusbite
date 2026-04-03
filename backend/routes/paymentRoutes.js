const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const supabase = require("../supabaseClient");
const router = express.Router();

// Initialize Razorpay instance with test credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// Creates a Razorpay order and returns order details to the frontend
router.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
        });
    }
});

// ─── Token generation is now handled atomically by PostgreSQL function `place_order_atomic` ───

// POST /api/payment/verify-and-complete
// Verifies Razorpay signature, then calls atomic RPC to handle inventory + token + order insertion
router.post("/verify-and-complete", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cart,
            totalAmount,
            user
        } = req.body;

        // 1. Verify Payment Signature
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // 2. Call Atomic RPC Function in Supabase
        console.log("Calling place_order_atomic with:", {
            p_user_name: user?.name,
            p_items_count: cart?.length,
            p_total_amount: totalAmount,
            p_razorpay_order_id: razorpay_order_id
        });

        const { data, error: rpcError } = await supabase.rpc("place_order_atomic", {
            p_user_name: user?.name || "Unknown",
            p_user_username: user?.username || "Unknown",
            p_user_email: user?.email || "Unknown",
            p_items: cart,
            p_total_amount: Number(totalAmount),
            p_razorpay_order_id: razorpay_order_id,
            p_razorpay_payment_id: razorpay_payment_id,
            p_razorpay_signature: razorpay_signature
        });

        if (rpcError) {
            console.error("Supabase RPC Error Details:", rpcError);
            return res.status(500).json({
                success: false,
                message: rpcError.message || "Database transaction failed",
                details: rpcError.hint || rpcError.details
            });
        }

        console.log("RPC Response Data:", data);

        if (!data || data.status === "error") {
            return res.status(400).json({
                success: false,
                message: data?.message || "Order processing failed in database"
            });
        }

        // 3. Return token and receipt details
        res.status(200).json({
            success: true,
            message: "Payment verified and order placed",
            order_id: data.order_id,
            token_number: data.token_number,
            receipt: {
                payment_id: razorpay_payment_id,
                amount: totalAmount,
                items: cart,
                timestamp: data.timestamp
            }
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ success: false, message: "Server error during verification" });
    }
});

// GET /api/payment/orders
// Returns all orders for the staff panel
router.get("/orders", async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch orders error:", error);
            return res.status(500).json({ message: "Failed to fetch orders" });
        }

        res.json({ orders: orders || [] });
    } catch (error) {
        console.error("Fetch orders error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/payment/orders/:id/status
// Update order status (e.g., from 'Confirmed' to 'Completed')
router.put("/orders/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const { data, error } = await supabase
            .from("orders")
            .update({ status: status })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Update order status error:", error);
            return res.status(500).json({ message: "Failed to update order status" });
        }

        res.json({ success: true, order: data });
    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
