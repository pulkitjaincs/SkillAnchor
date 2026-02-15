import Job from "../models/Job.model.js";
import "../models/Company.model.js"; // Required for populate

export const getAllJobs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const cursor = req.query.cursor;
        const searchTerm = req.query.search;

        let query = { status: "active" };
        let sortOptions = { createdAt: -1 };
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
            .limit(limit)
            .lean();

        if (searchTerm && jobs.length === 0) {
            delete query.$text;
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { skills: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
                { city: { $regex: searchTerm, $options: 'i' } }
            ];
            jobs = await Job.find(query)
                .populate("company", "name logo")
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        }

        const hasMore = jobs.length === limit;
        res.status(200).json({ jobs, hasMore });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("company")
            .populate("employer", "name")
            .lean();
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ employer: req.user._id })
            .populate("company", "name logo")
            .sort({ createdAt: -1 })
            .lean();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createJob = async (req, res) => {
    try {
        const { title, description, category, subcategory, city, state, locality,
            salaryMin, salaryMax, salaryType, jobType, shift, experienceMin,
            skills, gender, benefits, vacancies } = req.body;

        const job = await Job.create({
            employer: req.user._id, title, description, category, subcategory,
            city, state, locality, salaryMin, salaryMax, salaryType, jobType,
            shift, experienceMin, skills, gender, benefits, vacancies, status: "active"
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.employer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};