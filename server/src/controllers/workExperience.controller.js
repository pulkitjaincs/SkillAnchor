import WorkExperience from "../models/WorkExperience.model.js";
import WorkerProfile from "../models/WorkerProfile.model.js";
import Application from "../models/Application.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getWorkExperiencesByUser = asyncHandler(async (req, res) => {
    const experiences = await WorkExperience.find({ worker: req.params.userId, isVisible: true })
        .populate("company", "name logo")
        .sort({ startDate: -1 })
        .lean();
    res.json(experiences);
});

export const createWorkExperience = asyncHandler(async (req, res) => {
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

    res.status(201).json(exp);
});

export const updateWorkExperience = asyncHandler(async (req, res) => {
    const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
    if (!exp) return res.status(404).json({ error: "Experience not found" });
    if (exp.addedBy === 'employer') return res.status(403).json({ error: "Verified experience cannot be edited" });

    Object.assign(exp, req.body);
    await exp.save();
    res.json(exp);
});

export const deleteWorkExperience = asyncHandler(async (req, res) => {
    const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
    if (!exp) return res.status(404).json({ error: "Work experience not found" });
    if (exp.addedBy === 'employer') {
        return res.status(403).json({ error: "Verified experience cannot be deleted" });
    }
    await exp.deleteOne();
    res.json({ message: "Work experience deleted successfully" });
});

export const endEmployment = asyncHandler(async (req, res) => {
    const exp = await WorkExperience.findOne({
        _id: req.params.id, $or: [{ employer: req.user._id }, { worker: req.user._id, isVerified: true }]
    });
    if (!exp) return res.status(404).json({ error: "Experience not found or you are not authorized" });

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

    res.json({ message: "Employment ended successfully", exp });
});

export const toggleVisibility = asyncHandler(async (req, res) => {
    const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
    if (!exp) return res.status(404).json({ error: "Work experience not found" });

    exp.isVisible = !exp.isVisible;
    await exp.save();
    res.json({ message: `Experience is now ${exp.isVisible ? "visible" : "hidden"}`, isVisible: exp.isVisible });
});
