import WorkerProfile from "../models/WorkerProfile.model.js";
import EmployerProfile from "../models/EmployerProfile.model.js";
import WorkExperience from "../models/WorkExperience.model.js";
import User from "../models/User.model.js";
import { uploadToS3 } from "../config/s3.js";
import asyncHandler from "../utils/asyncHandler.js";
import { assembleProfileResponse } from "../services/profile.service.js";

export const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded or invalid format" });
    }

    const key = `avatars/${req.user._id}-${Date.now()}.jpg`;
    const avatarUrl = await uploadToS3(req.file.buffer, req.file.mimetype, key);

    const ProfileModel = req.user.role === 'employer' ? EmployerProfile : WorkerProfile;
    await ProfileModel.findOneAndUpdate(
        { user: req.user._id },
        { $set: { avatar: avatarUrl } },
        { upsert: true }
    );

    return res.status(200).json({ avatar: avatarUrl });
});

export const getMyTeam = asyncHandler(async (req, res) => {
    const team = await WorkExperience.find({
        employer: req.user._id,
        $or: [
            { endDate: { $exists: false } },
            { endDate: null }
        ]
    }, { worker: 1, role: 1, startDate: 1, company: 1, companyName: 1, isVerified: 1 })
        .populate("worker", "name phone avatar email")
        .lean();

    res.json(team);
});

export const getMyProfile = asyncHandler(async (req, res) => {
    const isEmployer = req.user.role === 'employer';

    if (isEmployer) {
        const profile = await EmployerProfile.findOne({ user: req.user._id })
            .populate({ path: "company", select: "name logo industry" })
            .lean();

        return res.status(200).json(assembleProfileResponse(profile, req.user, 'employer'));
    }

    const profile = await WorkerProfile.findOne({ user: req.user._id })
        .populate({ path: "workHistory", populate: { path: "company", select: "name logo" } })
        .lean();

    return res.status(200).json(assembleProfileResponse(profile, req.user, 'worker'));
});

export const updateMyProfile = asyncHandler(async (req, res) => {
    const isEmployer = req.user.role === 'employer';
    const { name } = req.body;

    const userUpdates = {};
    if (name && name !== req.user.name) userUpdates.name = name;

    if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(req.user._id, { $set: userUpdates });
    }

    if (isEmployer) {
        const { designation, isHiringManager, whatsapp } = req.body;
        const profileFields = { user: req.user._id, name, designation, whatsapp, isHiringManager };

        const profile = await EmployerProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json(profile);
    }

    const { gender, dob, whatsapp, email, city, state, pincode, bio, skills, languages, expectedSalary, documents } = req.body;

    const profileFields = {
        user: req.user._id,
        name, gender, dob, whatsapp, email, city, state, pincode, bio, skills, languages, expectedSalary, documents
    };

    const profile = await WorkerProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(profile);
});

export const getProfileByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const [profile, user] = await Promise.all([
        WorkerProfile.findOne({ user: userId })
            .populate({ path: "workHistory", populate: { path: "company", select: "name logo" } })
            .lean(),
        User.findById(userId).select("-password -__v").lean()
    ]);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(assembleProfileResponse(profile, user, user.role || 'worker'));
});