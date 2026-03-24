import WorkerProfile, { IWorkerProfile } from "../models/WorkerProfile.model.js";
import EmployerProfile, { IEmployerProfile } from "../models/EmployerProfile.model.js";
import WorkExperience, { IWorkExperience } from "../models/WorkExperience.model.js";
import User, { IUser } from "../models/User.model.js";
import { generateReadSignedUrl, deleteFromS3 } from "../config/s3.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { assembleProfileResponse } from "../services/profile.service.js";
import mongoose, { QueryFilter } from "mongoose";
import { redis } from "../config/redis.js";
import { cacheAside, invalidateCache } from "../utils/cache.js";
import { AppError } from "../types/error.js";
import { logger } from "../utils/logger.js";
import type { SharedProfileFields } from "../types/index.js";


export const updateAvatarUrl = asyncHandler(async (req: Request, res: Response) => {
    const { avatarKey } = req.body;
    const ProfileModel = (req.user.role === 'employer' ? EmployerProfile : WorkerProfile) as mongoose.Model<IWorkerProfile | IEmployerProfile>;

    if (!avatarKey) {
        const existingProfile = await ProfileModel.findOne({ user: req.user._id });
        if (existingProfile && existingProfile.avatar) {
            try {
                await deleteFromS3(existingProfile.avatar);
            } catch (err) {
                logger.error({ err }, "Failed to delete avatar from S3");
            }
        }
        await ProfileModel.findOneAndUpdate(
            { user: req.user._id },
            { $set: { avatar: null } },
            { upsert: true }
        );
        await invalidateCache(`profile:${req.user._id}`);
        return res.status(200).json({ success: true, avatarKey: null, avatarUrl: null });
    }

    const expectedPrefix = `avatars/${req.user._id}-`;
    if (!avatarKey.startsWith(expectedPrefix)) {
        throw new AppError("Invalid avatar key", 400);
    }

    await ProfileModel.findOneAndUpdate(
        { user: req.user._id },
        { $set: { avatar: avatarKey } },
        { upsert: true }
    );
    await invalidateCache(`profile:${req.user._id}`);
    const avatarUrl = await generateReadSignedUrl(avatarKey);
    res.status(200).json({ success: true, avatarKey, avatarUrl });
});

export const getMyTeam = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;

    const query:QueryFilter<IWorkExperience>  = {
        employer: req.user._id,
        $or: [
            { endDate: { $exists: false } },
            { endDate: null }
        ]
    };
    if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const team = await WorkExperience.find(query, { worker: 1, role: 1, startDate: 1, company: 1, companyName: 1, isVerified: 1 })
        .populate("worker", "name phone email")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = team.length > limit;
    if (hasMore) team.pop();

    res.json({ team, hasMore });
});



export const resolveAvatarUrl = async <T extends SharedProfileFields>(profile: T | null, isOwner = false): Promise<(T & { avatarUrl: string | null }) | null> => {
    if (!profile) return null;
    if (profile.isAvatarHidden && !isOwner) {
        return { ...profile, avatarUrl: null, avatar: null };
    }
    if (profile.avatar && !profile.avatar.startsWith('http')) {
        const avatarUrl = await generateReadSignedUrl(profile.avatar);
        return { ...profile, avatarUrl };
    }
    return { ...profile, avatarUrl: profile.avatar || null };
};

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const isEmployer = req.user.role === 'employer';

    if (isEmployer) {
        const profile = await EmployerProfile.findOne({ user: req.user._id })
            .populate({ path: "company", select: "name logo industry" })
            .lean();

        const resolved = await resolveAvatarUrl(profile, true);
        return res.status(200).json({ success: true, data: { profile: assembleProfileResponse(resolved as Record<string, unknown> | null, req.user, 'employer') } });
    }

    const profile = await WorkerProfile.findOne({ user: req.user._id })
        .populate({ path: "workHistory", populate: { path: "company", select: "name logo" } })
        .lean();

    const resolved = await resolveAvatarUrl(profile, true);
    res.status(200).json({ success: true, data: { profile: assembleProfileResponse(resolved as Record<string, unknown> | null, req.user, 'worker') } });
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const isEmployer = req.user.role === 'employer';
    const { name } = req.body;

    const userUpdates: Partial<IUser> = {};
    if (name && name !== req.user.name) userUpdates.name = name;

    if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(req.user._id, { $set: userUpdates });
    }

    if (isEmployer) {
        const { designation, isHiringManager, whatsapp, isAvatarHidden } = req.body;
        const profileFields: Partial<IEmployerProfile> = { designation, whatsapp, isHiringManager };
        if (isAvatarHidden !== undefined) profileFields.isAvatarHidden = isAvatarHidden;

        const profile = await EmployerProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: profileFields, $setOnInsert: { user: req.user._id } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        await invalidateCache(`profile:${req.user._id}`);

        return res.status(200).json(profile);
    }

    const { gender, dob, whatsapp, email, city, state, pincode, bio, skills, languages, expectedSalary, documents, isAvatarHidden } = req.body;

    const profileFields: Partial<IWorkerProfile> = {
        gender, dob, whatsapp, email, city, state, pincode, bio, skills, languages, expectedSalary, documents
    };
    if (isAvatarHidden !== undefined) profileFields.isAvatarHidden = isAvatarHidden;

    const profile = await WorkerProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields, $setOnInsert: { user: req.user._id } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await invalidateCache(`profile:${req.user._id}`);
    res.status(200).json(profile);
});

export const getProfileByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) throw new AppError("User ID required", 400);
    const cacheKey = `profile:${userId}`;

    const data = await cacheAside(cacheKey, 120, async () => {
        const userAggr = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
            { $project: { password: 0, __v: 0 } },
            {
                $lookup: {
                    from: "workerprofiles",
                    localField: "_id",
                    foreignField: "user",
                    as: "profile"
                }
            },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } }
        ]);

        if (!userAggr || userAggr.length === 0) return null;

        type AggregatedUser = IUser & { profile?: IWorkerProfile };
        const user = userAggr[0] as AggregatedUser;
        const profile = user.profile ?? null;
        delete user.profile;

        if (profile && profile.workHistory && profile.workHistory.length > 0) {
            await WorkerProfile.populate(profile, {
                path: "workHistory",
                populate: { path: "company", select: "name logo" }
            });
        }

        return { user, profile, role: user.role };
    });

    if (!data) { throw new AppError("User not found", 404); }

    if (data.role === 'employer') {
        await redis.expire(cacheKey, 300);
    }

    const isOwner = req.user && req.user._id.toString() === userId;
    const resolvedProfile = await resolveAvatarUrl(data.profile, isOwner);
    const role = data.role === 'employer' ? 'employer' : 'worker';
    res.status(200).json({ success: true, data: { profile: assembleProfileResponse(resolvedProfile as Record<string, unknown> | null, data.user, role) } });
});
