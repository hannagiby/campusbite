require("dotenv").config();
const supabase = require("./supabaseClient");
const bcrypt = require("bcryptjs");

async function seed() {
    console.log("Connecting to Supabase...");

    // Clear existing users (Optional - Be careful!)
    // const { error: deleteError } = await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all

    // Create sample users
    const password = "password123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const users = [
        {
            name: "Admin User",
            username: "23cse01",
            email: "admin@example.com",
            password: hashedPassword,
            role: "Faculty"
        },
        {
            name: "Student User",
            username: "23cs001",
            email: "student@example.com",
            password: hashedPassword,
            role: "Student"
        }
    ];

    for (const userData of users) {
        const { data, error } = await supabase
            .from("users")
            .insert([userData])
            .select();

        if (error) {
            console.error(`Error creating ${userData.username}:`, error.message);
        } else {
            console.log(`Created ${userData.role}: ${userData.username}`);
        }
    }

    console.log("\n--- Seed Complete ---");
}

seed();

