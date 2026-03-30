import Application, { IApplication } from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import WorkerProfile from "../models/WorkerProfile.model.js";
import { generateReadSignedUrl } from "../config/s3.js";
import { AppError } from "../types/error.js";
import mongoose, { QueryFilter } from "mongoose";
import { hiredQueue } from "../queues/hired.queue.js";
import type { PopulatedJob, PopulatedApplication } from "../types/index.js";

export const applyToJob = async (jobId: string, workerId: string, coverNote?: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const job = await Job.findById(jobId).session(session);
        if (!job) throw new AppError("Job not found", 404);
        if (job.status !== "active") {
            throw new AppError("This job is no longer accepting applications", 400);
        }

        const existing = await Application.findOne({ job: jobId, applicant: workerId }).session(session);
        if (existing) throw new AppError("You have already applied to this job", 400);

        const [application] = await Application.create([{
            job: jobId,
            applicant: workerId,
            coverNote: coverNote || ""
        }], { session });

        await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } }, { session });

        await session.commitTransaction();
        return application;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getMyApplications = async (workerId: string, filters: { limit?: number, cursor?: string }) => {
    const { limit = 10, cursor } = filters;
    const query: QueryFilter<IApplication> = { applicant: workerId };
    if (cursor && mongoose.isValidObjectId(cursor)) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const applications = await Application.find(query)
        .populate("job", "title company city state salaryMin salaryMax status")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean() as unknown as (Omit<IApplication, 'job'> & { job: PopulatedJob })[];

    const hasMore = applications.length > limit;
    if (hasMore) applications.pop();
    const nextCursor = hasMore && applications.length > 0 ? applications[applications.length - 1]?._id : null;
    return { applications, hasMore, nextCursor };
};

export const getJobApplicants = async (jobId: string, employerId: string, filters: { limit?: number, cursor?: string }) => {
    const { limit = 10, cursor } = filters;

    const job = await Job.findById(jobId);
    if (!job) return { notFound: true };
    if (job.employer.toString() !== employerId) return { notAuthorized: true };

    const query: QueryFilter<IApplication> = { job: jobId };
    if (cursor && mongoose.isValidObjectId(cursor)) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const applications = await Application.find(query)
        .populate("applicant", "name phone email")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean() as unknown as (Omit<IApplication, 'applicant'> & { _id: mongoose.Types.ObjectId; applicant: { _id: mongoose.Types.ObjectId; name: string; phone?: string; email?: string; avatarUrl?: string | null } })[];

    const hasMore = applications.length > limit;
    if (hasMore) applications.pop();
    const nextCursor = hasMore && applications.length > 0 ? applications[applications.length - 1]?._id : null;

    const applicantIds = applications.map(app => app.applicant?._id).filter(id => id);
    const profiles = await WorkerProfile.find({ user: { $in: applicantIds } }, "user avatar isAvatarHidden").lean();

    const avatarMap: Record<string, string> = {};
    for (const profile of profiles) {
        if (profile.avatar && !profile.isAvatarHidden) {
            avatarMap[profile.user.toString()] = profile.avatar.startsWith('http') 
                ? profile.avatar 
                : await generateReadSignedUrl(profile.avatar);
        }
    }

    for (const app of applications) {
        if (app.applicant) {
            app.applicant.avatarUrl = avatarMap[app.applicant._id.toString()] || null;
        }
    }

    return { data: { applications, hasMore, nextCursor } };
};

export const updateStatus = async (applicationId: string, employerId: string, status: string, requestId?: string) => {
    const application = await Application.findById(applicationId)
        .populate({ path: "job", populate: { path: "company", select: "name _id" } })
        .lean() as unknown as PopulatedApplication;

    if (!application) return { notFound: true };
    if (application.job.employer.toString() !== employerId) return { notAuthorized: true };

    const updatedApplication = await Application.findByIdAndUpdate(
        applicationId,
        {
            status,
            $push: { statusHistory: { status, at: new Date() } }
        },
        { new: true }
    );

    if (status === "hired") {
        await hiredQueue.add(
            'process-hire',
            { applicationId: application._id.toString(), employerId, requestId },
            { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
        );
    }

    return { data: updatedApplication };
};

export const withdraw = async (applicationId: string, workerId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const application = await Application.findById(applicationId).session(session);
        if (!application) return { notFound: true };
        if (application.applicant.toString() !== workerId) return { notAuthorized: true };

        await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } }, { session });
        await Application.findByIdAndDelete(applicationId, { session });

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
