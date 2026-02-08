import express from "express";
import { getMyProfile, updateMyProfile, uploadMiddleware, uploadAvatar, getProfileByUserId } from "../controllers/profile.controller.js";
import WorkExperience from "../models/WorkExperience.model.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my-profile", protect, getMyProfile);
router.put("/my-profile", protect, updateMyProfile);
router.post("/upload-avatar", protect, uploadMiddleware, uploadAvatar);
router.get("/user/:userId", protect, getProfileByUserId);

router.get("/my-team", protect, requireRole("employer"), async (req, res) => {
    try {
        const team = await WorkExperience.find({
            employer: req.user._id,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null }
            ]
        }).populate("worker", "name phone avatar email");

        res.json(team);
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ message: "Error fetching team" });
    }
});

export default router;