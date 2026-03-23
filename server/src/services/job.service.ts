import Job, { IJob } from "../models/Job.model.js";
import mongoose, { QueryFilter } from "mongoose";
import { cacheAside, invalidateCache } from "../utils/cache.js";

export interface JobFilters {
    limit?: number;
    cursor?: string;
    search?: string;
    location?: string;
    category?: string;
    jobType?: string;
}

const JOB_LISTING_PROJECTION = {
    title: 1, company: 1, city: 1, state: 1, status: 1,
    applicationsCount: 1, salaryMin: 1, salaryMax: 1,
    salaryType: 1, jobType: 1, createdAt: 1,
    description: 1, experienceMin: 1, skills: 1
};

const ALLOWED_JOB_FIELDS = [
    "title", "description", "category", "subcategory", "city", "state", "locality",
    "salaryMin", "salaryMax", "salaryType", "jobType", "shift", "experienceMin",
    "skills", "gender", "benefits", "vacancies", "status"
];

export const getJobs = async (filters: JobFilters) => {
    const { limit = 10, cursor, search, location, category, jobType } = filters;
    const isDefaultRequest = !search && !location && !category && !jobType && !cursor;

    if (isDefaultRequest) {
        const cacheKey = `jobs:list:limit:${limit}`;
        return cacheAside(cacheKey, 60, async () => {
            const jobs = await Job.find({ status: "active" }, JOB_LISTING_PROJECTION)
                .populate("company", "name logo")
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean();

            const hasMore = jobs.length > limit;
            if (hasMore) jobs.pop();
            return { jobs, hasMore };
        }, "jobs:list");
    }

    const andConditions: QueryFilter<IJob>[] = [{ status: "active" }];
    const projection: Record<string, number | { $meta: "textScore" }> = { ...JOB_LISTING_PROJECTION };
    let sortOptions: Record<string, 1 | -1 | { $meta: "textScore" }> = { _id: -1 };

    if (search) {
        andConditions.push({ $text: { $search: search } });
        projection.score = { $meta: "textScore" };
        sortOptions = { score: { $meta: "textScore" }, createdAt: -1 };
    }

    if (location) {
        andConditions.push({
            $or: [
                { city: { $regex: location, $options: 'i' } },
                { state: { $regex: location, $options: 'i' } }
            ]
        });
    }

    if (category) andConditions.push({ category });
    if (jobType) andConditions.push({ jobType });
    if (cursor) andConditions.push({ _id: { $lt: new mongoose.Types.ObjectId(cursor) } });

    const query = { $and: andConditions };

    const jobs = await Job.find(query, projection)
        .populate("company", "name logo")
        .sort(sortOptions)
        .limit(limit + 1)
        .lean();

    const hasMore = jobs.length > limit;
    if (hasMore) jobs.pop();
    return { jobs, hasMore };
};


export const getJobById = async (id: string) => {
    return await Job.findById(id)
        .populate("company", "name logo industry")
        .populate("employer", "name")
        .lean();
};

export const createJob = async (employerId: string, data: Partial<IJob>) => {
    const filteredData: Record<string, unknown> = { employer: employerId, status: "active" };
    ALLOWED_JOB_FIELDS.forEach(field => {
        if (data[field as keyof IJob] !== undefined) {
            filteredData[field] = data[field as keyof IJob];
        }
    });

    const job = await Job.create(filteredData);
    await invalidateCache("jobs:list");
    return job;
};

export const updateJob = async (jobId: string, employerId: string, data: Partial<IJob>) => {
    const job = await Job.findById(jobId);
    if (!job) return { success: false, notFound: true };
    if (job.employer.toString() !== employerId) return { success: false, notAuthorized: true };

    const updatePayload: Record<string, unknown> = {};
    ALLOWED_JOB_FIELDS.forEach(field => {
        if (data[field as keyof IJob] !== undefined) {
            updatePayload[field] = data[field as keyof IJob];
        }
    });

    const updatedJob = await Job.findByIdAndUpdate(
        jobId,
        { $set: updatePayload },
        { new: true, runValidators: true }
    );
    await invalidateCache("jobs:list");
    return { success: true, data: updatedJob };
};

export const deleteJob = async (jobId: string, employerId: string) => {
    const job = await Job.findById(jobId);
    if (!job) return { success: false, notFound: true };
    if (job.employer.toString() !== employerId) return { success: false, notAuthorized: true };

    await Job.findByIdAndDelete(jobId);
    await invalidateCache("jobs:list");
    return { success: true };
};

export const getMyJobs = async (employerId: string, filters: { limit?: number, cursor?: string }) => {
    const { limit = 10, cursor } = filters;
    const query: QueryFilter<IJob> = { employer: new mongoose.Types.ObjectId(employerId) };
    if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const jobs = await Job.find(query, JOB_LISTING_PROJECTION)
        .populate("company", "name logo")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = jobs.length > limit;
    if (hasMore) jobs.pop();
    return { jobs, hasMore };
};
