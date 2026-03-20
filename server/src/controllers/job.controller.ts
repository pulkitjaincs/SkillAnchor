import Job, { IJob } from "../models/Job.model.js";
import "../models/Company.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { cacheAside, invalidateCache } from "../utils/cache.js";
import mongoose from "mongoose";
import { AppError } from "../types/error.js";

export const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;
    const searchTerm = req.query.search as string;
    const location = req.query.location as string;
    const category = req.query.category as string;
    const jobType = req.query.jobType as string;

    const isDefaultRequest = !searchTerm && !location && !category && !jobType && !cursor;

    if (isDefaultRequest) {
        const cacheKey = `jobs:list:limit:${limit}`;

        const data = await cacheAside(cacheKey, 60, async () => {
            const jobs = await Job.find({ status: "active" }, {
                title: 1, description: 1, company: 1,
                city: 1, state: 1,
                salaryMin: 1, salaryMax: 1, salaryType: 1,
                jobType: 1, experienceMin: 1, skills: 1,
                createdAt: 1
            })
                .populate("company", "name logo")
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean();

            const hasMore = jobs.length > limit;
            if (hasMore) jobs.pop();
            return { jobs, hasMore };
        });

        return res.status(200).json(data);
    }
    const query: mongoose.FilterQuery<IJob> = { status: "active" };
    let sortOptions: string | { [key: string]: mongoose.SortOrder } | [string, mongoose.SortOrder][] = { _id: -1 };
    const projection: Record<string, string | number | object> = {
        title: 1, description: 1, company: 1,
        city: 1, state: 1,
        salaryMin: 1, salaryMax: 1, salaryType: 1,
        jobType: 1, experienceMin: 1, skills: 1,
        createdAt: 1
    };

    if (searchTerm) {
        query.$text = { $search: searchTerm };
        projection.score = { $meta: "textScore" };
        sortOptions = { score: { $meta: "textScore" }, createdAt: -1 } as any;
    }

    if (location) {
        query.$or = [
            { city: { $regex: location, $options: 'i' } },
            { state: { $regex: location, $options: 'i' } }
        ];
    }

    if (category) query.category = category;
    if (jobType) query.jobType = jobType;
    if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };

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


export const getJobById = asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id)
        .populate("company", "name logo industry")
        .populate("employer", "name")
        .lean();
    if (!job) throw new AppError("Job not found", 404);
    res.json(job);
});

export const getMyJobs = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;

    const query: mongoose.FilterQuery<IJob> = { employer: req.user._id };
    if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const jobs = await Job.find(query,
        { title: 1, company: 1, city: 1, state: 1, status: 1, applicationsCount: 1, salaryMin: 1, salaryMax: 1, salaryType: 1, jobType: 1, createdAt: 1 })
        .populate("company", "name logo")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = jobs.length > limit;
    if (hasMore) jobs.pop();

    res.json({ jobs, hasMore });
});

export const createJob = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, category, subcategory, city, state, locality,
        salaryMin, salaryMax, salaryType, jobType, shift, experienceMin,
        skills, gender, benefits, vacancies } = req.body;

    const job = await Job.create({
        employer: req.user._id, title, description, category, subcategory,
        city, state, locality, salaryMin, salaryMax, salaryType, jobType,
        shift, experienceMin, skills, gender, benefits, vacancies, status: "active"
    });
    await invalidateCache("jobs:list:*");
    res.status(201).json(job);
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);
    if (job.employer.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized", 403);
    }
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await invalidateCache("jobs:list:*");
    res.json(updatedJob);
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError("Job not found", 404);
    if (job.employer.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized", 403);
    }
    await Job.findByIdAndDelete(req.params.id);
    await invalidateCache("jobs:list:*");
    res.json({ message: "Job deleted successfully" });
});