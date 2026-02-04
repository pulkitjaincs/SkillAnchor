import express from "express";
import Job from "../models/Job.model.js"
import Company from "../models/Company.model.js"
import { protect, requireRole } from "../middleware/auth.middleware.js";


const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const cursor = req.query.cursor;
        const query = { status: "active" };
        if (cursor) {
            query._id = { $lt: cursor };
        }
        const jobs = await Job.find(query)
            .populate("company", "name logo")
            .sort({ createdAt: -1 })
            .limit(limit);
        const hasMore = jobs.length === limit;
        res.status(200).json({ jobs, hasMore });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/my-jobs", protect, requireRole("employer"), async (req, res) => {
    try {
        const jobs = await Job.find({ employer: req.user._id })
            .populate("company", "name logo")
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        console.error("Error fetching my jobs:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("company")
            .populate("employer", "name");
        res.json(job);
    } catch (error) {
        console.error("Error fetching job:", error);
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", protect, requireRole("employer"), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }
        if (job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this job" })
        }
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedJob);
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/", protect, requireRole("employer"), async (req, res) => {
    try {
        const {
            title, description, category, subcategory,
            city, state, locality,
            salaryMin, salaryMax, salaryType,
            jobType, shift, experienceMin,
            skills, gender, benefits, vacancies
        } = req.body;

        const job = await Job.create({
            employer: req.user._id,
            title,
            description,
            category,
            subcategory,
            city,
            state,
            locality,
            salaryMin,
            salaryMax,
            salaryType,
            jobType,
            shift,
            experienceMin,
            skills,
            gender,
            benefits,
            vacancies,
            status: "active"
        });

        res.status(201).json(job);
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ error: error.message });
    }
});



router.delete("/:id", protect, requireRole("employer"), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        if (job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this job" });
        }
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
