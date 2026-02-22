import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import WorkExperience from "../models/WorkExperience.model.js";
import WorkerProfile from "../models/WorkerProfile.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { applicationEmitter } from "../events/application.events.js";

export const applyToJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { coverNote } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.status !== "active") {
        return res.status(400).json({ error: "This job is no longer accepting applications" });
    }

    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ error: "You have already applied to this job" });

    const application = await Application.create({
        job: jobId,
        applicant: req.user._id,
        coverNote: coverNote || ""
    });
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });
    res.status(201).json(application);
});

export const getMyApplications = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;

    let query = { applicant: req.user._id };
    if (cursor) query._id = { $lt: cursor };

    const applications = await Application.find(query)
        .populate("job", "title company city state salaryMin salaryMax status")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = applications.length > limit;
    if (hasMore) applications.pop();

    res.json({ applications, hasMore });
});

export const getJobApplicants = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized" });
    }

    let query = { job: jobId };
    if (cursor) query._id = { $lt: cursor };

    const applications = await Application.find(query)
        .populate("applicant", "name phone email")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = applications.length > limit;
    if (hasMore) applications.pop();

    res.json({ applications, hasMore });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const application = await Application.findById(id).populate({ path: "job", populate: { path: "company", select: "name _id" } });

    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized" });
    }

    application.status = status;
    application.statusHistory.push({ status, at: new Date() });
    await application.save();

    if (status === "hired") {
        applicationEmitter.emit('hired', { application, employerId: req.user._id });
    }

    res.json(application);
});

export const withdrawApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.applicant.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized" });
    }
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
    await Application.findByIdAndDelete(id);
    res.json({ message: "Application withdrawn successfully" });
});
