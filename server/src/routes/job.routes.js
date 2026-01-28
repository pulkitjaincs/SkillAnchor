import express from "express";
import Job from "../models/Job.model.js"
import Company from "../models/Company.model.js"
const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const cursor = req.query.cursor;
        const query = {status: "active"};
        if(cursor){
            query._id = { $lt: cursor };
        }
        const jobs = await Job.find(query)
            .populate("company", "name logo")
            .sort({ createdAt: -1 })
            .limit(limit);
            const hasMore = jobs.length === limit;
        res.status(200).json({jobs, hasMore});
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
