import express from "express";
import { getMyProfile, updateMyProfile, getProfileByUserId, getMyTeam, updateAvatarUrl } from "../controllers/profile.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { validate, updateProfileSchema } from "../middleware/validate.js";

const router = express.Router();

router.get("/my-profile", protect, getMyProfile);
router.put("/my-profile", protect, validate(updateProfileSchema), updateMyProfile);
router.patch("/update-avatar-url", protect, updateAvatarUrl);
router.get("/user/:userId", protect, getProfileByUserId);
router.get("/my-team", protect, requireRole("employer"), getMyTeam);

export default router;