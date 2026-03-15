import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { generatePreSignedUrl } from "../config/s3.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

const ALLOWED_FOLDERS = ["avatars", "uploads", "resumes", "profiles"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * @route   GET /api/upload/pre-signed-url
 * @desc    Generate a pre-signed URL for S3 upload
 * @access  Private
 */
router.get("/pre-signed-url", protect, asyncHandler(async (req, res) => {
    const { name, type, size, folder = "uploads" } = req.query;

    if (!name || !type || !size) {
        return res.status(400).json({ 
            success: false, 
            error: "File name, type, and size are required" 
        });
    }

    const fileSize = parseInt(size, 10);
    const MAX_SIZE = 0.5 * 1024 * 1024; // 0.5MB

    if (isNaN(fileSize) || fileSize <= 0 || fileSize > MAX_SIZE) {
        return res.status(400).json({
            success: false,
            error: "Invalid file size or exceeds 0.5MB limit"
        });
    }

    // Validate folder against whitelist to prevent path traversal
    if (!ALLOWED_FOLDERS.includes(folder)) {
        return res.status(400).json({
            success: false,
            error: `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(", ")}`
        });
    }

    // Validate MIME type to prevent uploading dangerous file types
    if (!ALLOWED_MIME_TYPES.includes(type)) {
        return res.status(400).json({
            success: false,
            error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
        });
    }

    // Sanitize filename, cap length, and create a unique key
    const fileName = name.replace(/[^a-zA-Z0-9.]/g, "_").substring(0, 100);
    const timestamp = Date.now();
    const key = `${folder}/${req.user._id}-${timestamp}-${fileName}`;

    const data = await generatePreSignedUrl(key, type, fileSize);

    res.status(200).json({
        success: true,
        data
    });
}));

export default router;
