const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET /api/analytics/stats
// Returns total users, today's orders, today's revenue, active tokens
router.get("/stats", async (req, res) => {
    try {
        // Total users (exclude admin and canteen roles)
        const { count: totalUsers, error: usersError } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });

        if (usersError) {
            console.error("Analytics users error:", usersError);
        }

        // Today's date boundaries
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Today's orders
        const { data: todayOrders, error: ordersError } = await supabase
            .from("orders")
            .select("id, total_amount, status, token_number")
            .gte("created_at", todayStart.toISOString())
            .lte("created_at", todayEnd.toISOString());

        if (ordersError) {
            console.error("Analytics orders error:", ordersError);
        }

        const orders = todayOrders || [];
        const todayOrderCount = orders.length;
        const todayRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const activeTokens = orders.filter(o => o.status === "Confirmed").length;

        // All-time total revenue
        const { data: allOrders, error: allOrdersError } = await supabase
            .from("orders")
            .select("total_amount");

        let totalRevenue = 0;
        if (!allOrdersError && allOrders) {
            totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        }

        res.json({
            totalUsers: totalUsers || 0,
            todayOrders: todayOrderCount,
            todayRevenue: todayRevenue,
            activeTokens: activeTokens,
            totalRevenue: totalRevenue
        });
    } catch (error) {
        console.error("Analytics stats error:", error);
        res.status(500).json({ message: "Failed to fetch analytics stats" });
    }
});

// GET /api/analytics/order-trends
// Returns per-day order counts for the last 7 days
router.get("/order-trends", async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data: orders, error } = await supabase
            .from("orders")
            .select("created_at, total_amount")
            .gte("created_at", sevenDaysAgo.toISOString())
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Order trends error:", error);
            return res.status(500).json({ message: "Failed to fetch order trends" });
        }

        // Group by date
        const dayMap = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
            dayMap[key] = { orders: 0, revenue: 0 };
        }

        (orders || []).forEach(order => {
            const key = new Date(order.created_at).toISOString().split("T")[0];
            if (dayMap[key]) {
                dayMap[key].orders += 1;
                dayMap[key].revenue += Number(order.total_amount || 0);
            }
        });

        const labels = Object.keys(dayMap).map(d => {
            const date = new Date(d);
            return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
        });

        res.json({
            labels,
            orders: Object.values(dayMap).map(v => v.orders),
            revenue: Object.values(dayMap).map(v => v.revenue)
        });
    } catch (error) {
        console.error("Order trends error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/analytics/category-distribution
// Returns item-level order quantity totals for pie chart
router.get("/category-distribution", async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("items");

        if (error) {
            console.error("Category distribution error:", error);
            return res.status(500).json({ message: "Failed to fetch category data" });
        }

        const itemCounts = {};
        (orders || []).forEach(order => {
            const items = order.items || [];
            items.forEach(item => {
                const name = item.food_name || "Unknown";
                itemCounts[name] = (itemCounts[name] || 0) + Number(item.quantity || 1);
            });
        });

        // Sort by quantity descending, take top 8
        const sorted = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        res.json({
            labels: sorted.map(([name]) => name),
            data: sorted.map(([, count]) => count)
        });
    } catch (error) {
        console.error("Category distribution error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/analytics/peak-hours
// Returns order count grouped by hour of day
router.get("/peak-hours", async (req, res) => {
    try {
        // Fetch last 30 days of orders for peak hour analysis
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: orders, error } = await supabase
            .from("orders")
            .select("created_at")
            .gte("created_at", thirtyDaysAgo.toISOString());

        if (error) {
            console.error("Peak hours error:", error);
            return res.status(500).json({ message: "Failed to fetch peak hours" });
        }

        // Initialize hours 6am to 10pm (typical canteen hours)
        const hourCounts = {};
        for (let h = 6; h <= 22; h++) {
            hourCounts[h] = 0;
        }

        (orders || []).forEach(order => {
            const hour = new Date(order.created_at).getHours();
            if (hourCounts[hour] !== undefined) {
                hourCounts[hour] += 1;
            }
        });

        const labels = Object.keys(hourCounts).map(h => {
            const hour = parseInt(h);
            if (hour === 0) return "12 AM";
            if (hour === 12) return "12 PM";
            return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
        });

        res.json({
            labels,
            data: Object.values(hourCounts)
        });
    } catch (error) {
        console.error("Peak hours error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/analytics/top-items
// Returns top 5 most ordered items with total quantity
router.get("/top-items", async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("items");

        if (error) {
            console.error("Top items error:", error);
            return res.status(500).json({ message: "Failed to fetch top items" });
        }

        const itemTotals = {};
        (orders || []).forEach(order => {
            const items = order.items || [];
            items.forEach(item => {
                const name = item.food_name || "Unknown";
                if (!itemTotals[name]) {
                    itemTotals[name] = { quantity: 0, revenue: 0 };
                }
                itemTotals[name].quantity += Number(item.quantity || 1);
                itemTotals[name].revenue += Number(item.price || 0) * Number(item.quantity || 1);
            });
        });

        const sorted = Object.entries(itemTotals)
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 5);

        res.json({
            labels: sorted.map(([name]) => name),
            quantities: sorted.map(([, data]) => data.quantity),
            revenues: sorted.map(([, data]) => data.revenue)
        });
    } catch (error) {
        console.error("Top items error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
