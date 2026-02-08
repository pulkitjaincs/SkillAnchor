import express from "express";
import { getMyProfile, updateMyProfile, uploadMiddleware, uploadAvatar, getProfileByUserId } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my-profile", protect, getMyProfile);
router.put("/my-profile", protect, updateMyProfile);
router.post("/upload-avatar", protect, uploadMiddleware, uploadAvatar);
router.get("/user/:userId", protect, getProfileByUserId);

export default router;