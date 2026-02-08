import express from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus, withdrawApplication } from "../controllers/application.controller.js";

const router = express.Router();

router.post("/apply/:jobId", protect, requireRole("worker"), applyToJob);
router.get("/my-applications", protect, requireRole("worker"), getMyApplications);
router.get("/job/:jobId", protect, requireRole("employer"), getJobApplicants);
router.patch("/:id/status", protect, requireRole("employer"), updateApplicationStatus);
router.delete("/:id", protect, requireRole("worker"), withdrawApplication);

export default router;
