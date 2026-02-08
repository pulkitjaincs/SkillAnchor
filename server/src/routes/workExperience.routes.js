import express from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import WorkExperience from "../models/WorkExperience.model.js";

const router = express.Router();

router.get("/user/:userId", async (req, res) => {
    try {
        const experiences = await WorkExperience.find({ worker: req.params.userId, isVisible: true })
            .populate("company", "name logo")
            .sort({ startDate: -1 });
        res.json(experiences);
    } catch (error) {
        console.error("Error fetching work experiences: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/", protect, requireRole("worker"), async (req, res) => {
    try {
        const exp = await WorkExperience.create({
            ...req.body,
            worker: req.user._id,
            addedBy: "worker",
            isVerified: false
        });
        res.status(201).json(exp);
    } catch (error) {
        console.error("Error creating work experience: ", error);
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", protect, requireRole("worker"), async (req, res) => {
    try {
        const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
        if (!exp) return res.status(404).json({ message: "Experience not found" });
        if (exp.addedBy === 'employer') return res.status(403).json({ message: "Verified experience cannot be edited" });

        Object.assign(exp, req.body);
        await exp.save();
        res.json(exp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", protect, requireRole("worker"), async (req, res) => {
    try {
        const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
        if (!exp) {
            return res.status(404).json({ message: "Work experience not found" });
        }
        if (exp.worker.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        if (exp.addedBy === 'employer') {
            return res.status(403).json({ message: "Verified experience cannot be deleted" });
        }
        await exp.deleteOne();
        res.json({ message: "Work experience deleted successfully" });
    } catch (error) {
        console.error("Error deleting work experience: ", error);
        res.status(500).json({ error: error.message });
    }
});


router.patch("/:id/end", protect, requireRole("employer"), async (req, res) => {
    try {
        const exp = await WorkExperience.findOne({ _id: req.params.id, employer: req.user._id });
        if (!exp) return res.status(404).json({ message: "Experience not found" });

        exp.endDate = new Date();
        exp.isCurrent = false;
        await exp.save();

        res.json({ message: "Employment ended successfully", exp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;