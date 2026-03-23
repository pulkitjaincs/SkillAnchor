import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as ApplicationService from "../services/application.service.js";
import { AppError } from "../types/error.js";

export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
    const application = await ApplicationService.applyToJob(
        req.params.jobId as string,
        req.user._id.toString(),
        req.body.coverNote
    );
    res.status(201).json(application);
});

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
        limit: parseInt(req.query.limit as string) || 10,
        cursor: req.query.cursor as string | undefined,
    };
    const result = await ApplicationService.getMyApplications(req.user._id.toString(), filters);
    res.json(result);
});

export const getJobApplicants = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
        limit: parseInt(req.query.limit as string) || 10,
        cursor: req.query.cursor as string | undefined,
    };
    const result = await ApplicationService.getJobApplicants(
        req.params.jobId as string,
        req.user._id.toString(),
        filters
    );

    if (result.notFound) throw new AppError("Job not found", 404);
    if (result.notAuthorized) throw new AppError("Not authorized", 403);

    res.json(result.data);
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await ApplicationService.updateStatus(
        req.params.id as string,
        req.user._id.toString(),
        req.body.status
    );

    if (result.notFound) throw new AppError("Application not found", 404);
    if (result.notAuthorized) throw new AppError("Not authorized", 403);

    res.json(result.data);
});

export const withdrawApplication = asyncHandler(async (req: Request, res: Response) => {
    const result = await ApplicationService.withdraw(
        req.params.id as string,
        req.user._id.toString()
    );

    if (result.notFound) throw new AppError("Application not found", 404);
    if (result.notAuthorized) throw new AppError("Not authorized", 403);

    res.json({ message: "Application withdrawn successfully" });
});
