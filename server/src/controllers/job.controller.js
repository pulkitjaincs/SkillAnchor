import Job from "../models/Job.model.js";
import "../models/Company.model.js"; // Required for populate
import asyncHandler from "../utils/asyncHandler.js";

export const getAllJobs = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;
    const searchTerm = req.query.search;

    let query = { status: "active" };
    let sortOptions = { _id: -1 };
    let projection = {
        title: 1, description: 1, company: 1,
        city: 1, state: 1,
        salaryMin: 1, salaryMax: 1, salaryType: 1,
        jobType: 1, experienceMin: 1, skills: 1,
        createdAt: 1
    };
    if (searchTerm) {
        query.$text = { $search: searchTerm };
        projection.score = { $meta: "textScore" };
        sortOptions = { score: { $meta: "textScore" }, createdAt: -1 };
    }

    if (req.query.location) {
        query.$or = [
            { city: { $regex: req.query.location, $options: 'i' } },
            { state: { $regex: req.query.location, $options: 'i' } }
        ];
    }

    if (req.query.category) query.category = req.query.category;
    if (req.query.jobType) query.jobType = req.query.jobType;

    if (cursor) query._id = { $lt: cursor };

    let jobs = await Job.find(query, projection)
        .populate("company", "name logo")
        .sort(sortOptions)
        .limit(limit + 1)
        .lean();

    if (searchTerm && jobs.length === 0) {
        delete query.$text;
        query.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } }
        ];
        jobs = await Job.find(query)
            .populate("company", "name logo")
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
    }

    const hasMore = jobs.length > limit;
    if (hasMore) jobs.pop();
    res.status(200).json({ jobs, hasMore });
});

export const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id)
        .populate("company", "name logo industry")
        .populate("employer", "name")
        .lean();
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
});

export const getMyJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({ employer: req.user._id },
        { title: 1, company: 1, city: 1, state: 1, status: 1, applicationsCount: 1, salaryMin: 1, salaryMax: 1, salaryType: 1, jobType: 1, createdAt: 1 })
        .populate("company", "name logo")
        .sort({ createdAt: -1 })
        .lean();
    res.json(jobs);
});

export const createJob = asyncHandler(async (req, res) => {
    const { title, description, category, subcategory, city, state, locality,
        salaryMin, salaryMax, salaryType, jobType, shift, experienceMin,
        skills, gender, benefits, vacancies } = req.body;

    const job = await Job.create({
        employer: req.user._id, title, description, category, subcategory,
        city, state, locality, salaryMin, salaryMax, salaryType, jobType,
        shift, experienceMin, skills, gender, benefits, vacancies, status: "active"
    });
    res.status(201).json(job);
});

export const updateJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized" });
    }
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
});

export const deleteJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized" });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
});