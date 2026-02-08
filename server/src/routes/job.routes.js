import express from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { getAllJobs, getJobById, getMyJobs, createJob, updateJob, deleteJob } from "../controllers/job.controller.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/my-jobs", protect, requireRole("employer"), getMyJobs);
router.get("/:id", getJobById);
router.post("/", protect, requireRole("employer"), createJob);
router.put("/:id", protect, requireRole("employer"), updateJob);
router.delete("/:id", protect, requireRole("employer"), deleteJob);

export default router;
