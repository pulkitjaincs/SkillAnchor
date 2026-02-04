import express from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";

const router = express.Router();

router.post("/apply/:jobId", protect, requireRole("worker"), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverNote } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        if (job.status !== "active") {
            return res.status(400).json({ message: "This job is no longer accepting applications" });
        }
        const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
        if (existing) {
            return res.status(400).json({ message: "You have already applied to this job" });
        }
        const application = await Application.create({
            job: jobId,
            applicant: req.user._id,
            coverNote: coverNote || ""
        });
        res.status(201).json(application);
    } catch (error) {
        console.log("Error applying to job:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/my-applications", protect, requireRole("worker"), async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate("job", "title company city state salaryMin salaryMax status")
            .sort({ appliedAt: -1 });
        res.json(applications);
    } catch (error) {
        console.log("Error fetching applications: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/job/:jobId", protect, requireRole("employer"), async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        if (job.employer.toString() != req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const applications = await Application.find({ job: jobId })
            .populate("applicant", "name phone email")
            .sort({ appliedAt: -1 });
        res.json(applications);
    } catch (error) {
        console.error("Error fetching applicants");
        res.status(500).json({ error: error.message });
    }
});

router.patch("/:id/status", protect, requireRole("employer"), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const application = await Application.findById(id).populate("job");
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        if (application.job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        application.status = status;
        application.statusHistory.push({ status, at: new Date() });
        await application.save();
        res.json(application);
    } catch (error) {
        console.error("Error updating application: ", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
