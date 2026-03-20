import Application, { IApplication } from "../models/Application.model.js";
import Job, { IJob } from "../models/Job.model.js";
import WorkerProfile from "../models/WorkerProfile.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { applicationEmitter } from "../events/application.events.js";
import { generateReadSignedUrl } from "../config/s3.js";
import { AppError } from "../types/error.js";
import mongoose, { QueryFilter } from "mongoose";

interface PopulatedJob extends Omit<IJob, 'company'> {
    _id: mongoose.Types.ObjectId;
    employer: mongoose.Types.ObjectId;
    company: { _id: mongoose.Types.ObjectId; name: string; logo: string };
}

interface PopulatedApplication extends Omit<IApplication, 'job'> {
    job: PopulatedJob;
}

export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const { coverNote } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const job = await Job.findById(jobId).session(session);
        if (!job) throw new AppError("Job not found", 404);
        if (job.status !== "active") {
            throw new AppError("This job is no longer accepting applications", 400);
        }

        const existing = await Application.findOne({ job: jobId, applicant: req.user._id }).session(session);
        if (existing) throw new AppError("You have already applied to this job", 400);

        const [application] = await Application.create([{
            job: jobId,
            applicant: req.user._id,
            coverNote: coverNote || ""
        }], { session });

        await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } }, { session });

        await session.commitTransaction();
        res.status(201).json(application);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});


export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;

    const query: QueryFilter<IApplication> = { applicant: req.user._id };
    if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const applications = await Application.find(query)
        .populate("job", "title company city state salaryMin salaryMax status")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean() as unknown as (Omit<IApplication, 'job'> & { job: any })[];

    const hasMore = applications.length > limit;
    if (hasMore) applications.pop();

    res.json({ applications, hasMore });
});

export const getJobApplicants = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;

    const job = await Job.findById(jobId);
    if (!job) throw new AppError("Job not found", 404);
    if (job.employer.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized", 403);
    }

    const query: QueryFilter<IApplication> = { job: jobId };
    if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const applications = await Application.find(query)
        .populate("applicant", "name phone email")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean() as unknown as (Omit<IApplication, 'applicant'> & { _id: mongoose.Types.ObjectId; applicant: { _id: mongoose.Types.ObjectId; name: string; phone?: string; email?: string; avatarUrl?: string | null } })[];

    const hasMore = applications.length > limit;
    if (hasMore) applications.pop();

    const applicantIds = applications.map(app => app.applicant?._id).filter(id => id);
    const profiles = await WorkerProfile.find({ user: { $in: applicantIds } }, "user avatar isAvatarHidden").lean();

    const avatarMap: Record<string, string> = {};
    for (const profile of profiles) {
        if (profile.avatar && !profile.isAvatarHidden) {
            if (!profile.avatar.startsWith('http')) {
                avatarMap[profile.user.toString()] = await generateReadSignedUrl(profile.avatar);
            } else {
                avatarMap[profile.user.toString()] = profile.avatar;
            }
        }
    }

    for (const app of applications) {
        if (app.applicant) {
            app.applicant.avatarUrl = avatarMap[app.applicant._id.toString()] || null;
        }
    }

    res.json({ applications, hasMore });
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const application = await Application.findById(id).populate({ path: "job", populate: { path: "company", select: "name _id" } }).lean() as unknown as PopulatedApplication;

    if (!application) throw new AppError("Application not found", 404);
    if (application.job.employer.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized", 403);
    }

    const updatedApplication = await Application.findByIdAndUpdate(
        id,
        {
            status,
            $push: { statusHistory: { status, at: new Date() } }
        },
        { new: true }
    );

    if (status === "hired") {
        applicationEmitter.emit('hired', { application, employerId: req.user._id });
    }

    res.json(updatedApplication);
});

export const withdrawApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const application = await Application.findById(id).session(session);
        if (!application) throw new AppError("Application not found", 404);
        if (application.applicant.toString() !== req.user._id.toString()) {
            throw new AppError("Not authorized", 403);
        }

        await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } }, { session });
        await Application.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        res.json({ message: "Application withdrawn successfully" });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
