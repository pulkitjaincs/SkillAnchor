import express from "express";
import Job from "../models/Job.model.js"
import Company from "../models/Company.model.js"
const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find({ status: "active" })
            .populate("company", "name logo")
            .sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
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

export default router;
