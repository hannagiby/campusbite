const express = require("express");
const router = express.Router();
const multer = require("multer");
const supabase = require("../supabaseClient");

// Set up memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST upload image
router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.file;
        // Generate a unique file name
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage bucket named 'food_images'
        const { data, error } = await supabase.storage
            .from("food_images")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return res.status(500).json({ message: `Failed to upload image to storage: ${error.message}`, errorDetails: error });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("food_images")
            .getPublicUrl(filePath);

        res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: publicUrl
        });
    } catch (error) {
        console.error("Upload exception:", error);
        res.status(500).json({ message: "Server error during upload" });
    }
});

// POST upload certificate
router.post("/certificate", upload.single("certificate"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage bucket named 'certificates'
        const { error } = await supabase.storage
            .from("certificates")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return res.status(500).json({ message: `Failed to upload certificate to storage: ${error.message}`, errorDetails: error });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("certificates")
            .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase
            .from("food_certificates")
            .insert([{ file_name: file.originalname, file_url: publicUrl }]);

        if (dbError) {
             console.error("Supabase DB error:", dbError);
             return res.status(500).json({ message: `Failed to save certificate record: ${dbError.message}`, errorDetails: dbError });
        }

        res.status(200).json({
            message: "Certificate uploaded successfully",
            fileUrl: publicUrl
        });
    } catch (error) {
        console.error("Upload exception:", error);
        res.status(500).json({ message: "Server error during upload" });
    }
});

module.exports = router;
