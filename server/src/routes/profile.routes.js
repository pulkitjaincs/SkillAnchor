import express from "express";
import { getMyProfile, updateMyProfile, uploadMiddleware, uploadAvatar } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my-profile", protect, getMyProfile);
router.put("/my-profile", protect, updateMyProfile);
router.post("/upload-avatar", protect, uploadMiddleware, uploadAvatar);

export default router;