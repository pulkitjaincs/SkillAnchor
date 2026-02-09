import express from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { getWorkExperiencesByUser, createWorkExperience, updateWorkExperience, deleteWorkExperience, endEmployment, toggleVisibility } from "../controllers/workExperience.controller.js";

const router = express.Router();

router.get("/user/:userId", getWorkExperiencesByUser);
router.post("/", protect, requireRole("worker"), createWorkExperience);
router.put("/:id", protect, requireRole("worker"), updateWorkExperience);
router.delete("/:id", protect, requireRole("worker"), deleteWorkExperience);
router.patch("/:id/end", protect, endEmployment);
router.patch("/:id/toggle-visibility", protect, requireRole("worker"), toggleVisibility);

export default router;