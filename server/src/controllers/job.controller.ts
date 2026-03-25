import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as JobService from "../services/job.service.js";
import { AppError } from "../types/error.js";

export const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
        limit: parseInt(req.query.limit as string) || 10,
        cursor: req.query.cursor as string | undefined,
        search: req.query.search as string | undefined,
        location: req.query.location as string | undefined,
        category: req.query.category as string | undefined,
        jobType: req.query.jobType as string | undefined,
    };
    const result = await JobService.getJobs(filters);
    res.status(200).json(result);
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
    const job = await JobService.getJobById(req.params.id as string);
    if (!job) throw new AppError("Job not found", 404);
    res.json({ success: true, data: { job } });
});

export const getMyJobs = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
        limit: parseInt(req.query.limit as string) || 10,
        cursor: req.query.cursor as string | undefined,
    };
    const result = await JobService.getMyJobs(req.user._id.toString(), filters);
    res.json(result);
});

export const createJob = asyncHandler(async (req: Request, res: Response) => {
    const job = await JobService.createJob(req.user._id.toString(), req.body);
    res.status(201).json({ success: true, data: { job } });
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.updateJob(req.params.id as string, req.user._id.toString(), req.body);

    if (result.notFound) throw new AppError("Job not found", 404);
    if (result.notAuthorized) throw new AppError("Not authorized", 403);

    res.json({ success: true, data: { job: result.data } });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.deleteJob(req.params.id as string, req.user._id.toString());

    if (result.notFound) throw new AppError("Job not found", 404);
    if (result.notAuthorized) throw new AppError("Not authorized", 403);

    res.json({ success: true, data: { message: "Job deleted successfully" } });
});
