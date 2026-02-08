import express from "express";
import { getMyProfile, updateMyProfile, uploadAvatar, getProfileByUserId, getMyTeam } from "../controllers/profile.controller.js";
import { uploadAvatar as uploadMiddleware } from "../middleware/upload.middleware.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my-profile", protect, getMyProfile);
router.put("/my-profile", protect, updateMyProfile);
router.post("/upload-avatar", protect, uploadMiddleware, uploadAvatar);
router.get("/user/:userId", protect, getProfileByUserId);
router.get("/my-team", protect, requireRole("employer"), getMyTeam);

export default router;