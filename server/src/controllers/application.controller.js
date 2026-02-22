import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import WorkExperience from "../models/WorkExperience.model.js";
import WorkerProfile from "../models/WorkerProfile.model.js";
import asyncHandler from "../utils/asyncHandler.js";

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
    const applications = await Application.find({ applicant: req.user._id })
        .populate("job", "title company city state salaryMin salaryMax status")
        .sort({ appliedAt: -1 })
        .lean();
    res.json(applications);
});

export const getJobApplicants = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Not authorized" });
    }
    const applications = await Application.find({ job: jobId })
        .populate("applicant", "name phone email")
        .sort({ appliedAt: -1 })
        .lean();
    res.json(applications);
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
        const workExp = await WorkExperience.create({
            worker: application.applicant,
            employer: req.user._id,
            linkedApplication: application._id,
            company: application.job.company?._id,
            companyName: application.job.company?.name,
            role: application.job.title,
            startDate: new Date(),
            isCurrent: true,
            addedBy: "employer",
            isVerified: true,
        });

        await WorkerProfile.findOneAndUpdate(
            { user: application.applicant },
            {
                $push: { workHistory: workExp._id },
                $set: { currentlyEmployed: true }
            }
        );
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
