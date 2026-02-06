import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my-profile", protect, getMyProfile);
router.put("/my-profile", protect, updateMyProfile);

export default router;