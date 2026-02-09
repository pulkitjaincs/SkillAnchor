import WorkExperience from "../models/WorkExperience.model.js";
import WorkerProfile from "../models/WorkerProfile.model.js";
import Application from "../models/Application.model.js";

export const getWorkExperiencesByUser = async (req, res) => {
    try {
        const experiences = await WorkExperience.find({ worker: req.params.userId, isVisible: true })
            .populate("company", "name logo")
            .sort({ startDate: -1 });
        res.json(experiences);
    } catch (error) {
        console.error("Error fetching work experiences:", error);
        res.status(500).json({ error: error.message });
    }
};

export const createWorkExperience = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Error creating work experience:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateWorkExperience = async (req, res) => {
    try {
        const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
        if (!exp) return res.status(404).json({ message: "Experience not found" });
        if (exp.addedBy === 'employer') return res.status(403).json({ message: "Verified experience cannot be edited" });

        Object.assign(exp, req.body);
        await exp.save();
        res.json(exp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteWorkExperience = async (req, res) => {
    try {
        const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
        if (!exp) return res.status(404).json({ message: "Work experience not found" });
        if (exp.worker.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        if (exp.addedBy === 'employer') {
            return res.status(403).json({ message: "Verified experience cannot be deleted" });
        }
        await exp.deleteOne();
        res.json({ message: "Work experience deleted successfully" });
    } catch (error) {
        console.error("Error deleting work experience:", error);
        res.status(500).json({ error: error.message });
    }
};

export const endEmployment = async (req, res) => {
    try {
        const exp = await WorkExperience.findOne({
            _id: req.params.id, $or: [{ employer: req.user._id }, { worker: req.user._id, isVerified: true }]
        });
        if (!exp) return res.status(404).json({ message: "Experience not found or you are not authorized" });

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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleVisibility = async (req, res) => {
    try {
        const exp = await WorkExperience.findOne({ _id: req.params.id, worker: req.user._id });
        if (!exp) return res.status(404).json({ message: "Work experience not found" });

        if (exp.worker.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        exp.isVisible = !exp.isVisible;
        await exp.save();
        res.json({ message: `Experience is now ${exp.isVisible ? "visible" : "hidden"}`, isVisible: exp.isVisible });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
