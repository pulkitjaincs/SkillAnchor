import WorkExperience from "../models/WorkExperience.model.js";
import WorkerProfile from "../models/WorkerProfile.model.js";
import Application from "../models/Application.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { AppError } from "../types/error.js";

export const getWorkExperiencesByUser = asyncHandler(async (req: Request, res: Response) => {
    const experiences = await WorkExperience.find({ worker: req.params.userId, isVisible: true })
        .populate("company", "name logo")
        .sort({ startDate: -1 })
        .lean();
    res.json({ success: true, data: { workExperiences: experiences } });
});

export const createWorkExperience = asyncHandler(async (req: Request, res: Response) => {
    const exp = await WorkExperience.create({
        ...req.body,
        worker: req.user._id,
        addedBy: "worker",
        isVerified: false
    });

    await WorkerProfile.findOneAndUpdate(
        { user: req.user._id },
        { $push: { workHistory: exp._id } }
    );

    res.status(201).json({ success: true, data: { workExperience: exp } });
});

export const updateWorkExperience = asyncHandler(async (req: Request, res: Response) => {
    const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
    if (!exp) throw new AppError("Experience not found", 404);
    if (exp.addedBy === 'employer') throw new AppError("Verified experience cannot be edited", 403);

    Object.assign(exp, req.body);
    await exp.save();
    res.json({ success: true, data: { workExperience: exp } });
});

export const deleteWorkExperience = asyncHandler(async (req: Request, res: Response) => {
    const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
    if (!exp) throw new AppError("Work experience not found", 404);
    if (exp.addedBy === 'employer') {
        throw new AppError("Verified experience cannot be deleted", 403);
    }
    await exp.deleteOne();
    res.json({ success: true, data: { message: "Work experience deleted successfully" } });
});

export const endEmployment = asyncHandler(async (req: Request, res: Response) => {
    const exp = await WorkExperience.findOne({
        _id: req.params.id, $or: [{ employer: req.user._id }, { worker: req.user._id, isVerified: true }]
    });
    if (!exp) throw new AppError("Experience not found or you are not authorized", 404);

    exp.endDate = new Date();
    exp.isCurrent = false;
    await exp.save();

    if (exp.linkedApplication) {
        const application = await Application.findById(exp.linkedApplication);
        if (application) {
            application.status = "employment-ended";
            application.statusHistory.push({ status: "employment-ended", at: new Date() });
            await application.save();
        }
    }

    await WorkerProfile.findOneAndUpdate(
        { user: exp.worker },
        { $set: { currentlyEmployed: false } }
    );

    res.json({ success: true, data: { workExperience: exp } });
});

export const toggleVisibility = asyncHandler(async (req: Request, res: Response) => {
    const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
    if (!exp) throw new AppError("Work experience not found", 404);

    exp.isVisible = !exp.isVisible;
    await exp.save();
    res.json({ success: true, data: { workExperience: exp } });
});
