import crypto from "crypto";
import { redis } from "../config/redis.js";
import mongoose, { QueryFilter } from "mongoose";
import User, { IUser } from "../models/User.model.js";
import { sendEmailOTP } from "../utils/email.js";
import { AppError } from "../types/error.js";
import type { OtpCondition } from "../types/index.js";

export const generateAndStoreOTP = async (conditions: OtpCondition[]): Promise<string> => {
    const otp = crypto.randomInt(100000, 1000000).toString();

    const identifier = Object.values(conditions[0]!)[0];
    const key = `otp:${identifier}`;
    await redis.setex(key, 600, JSON.stringify({ otp, attempts: 0 }));
    const emailCondition = conditions.find(c => c.email);
    if (emailCondition && emailCondition.email) {
        await sendEmailOTP(emailCondition.email, `Hello! \n\nYour OTP for SkillAnchor is ${otp}. \nIt will expire in 10 minutes. \nDo not share with anyone else`);
    }
    return otp;
};

export const verifyAndConsumeOTP = async (conditions: OtpCondition[], otp: string): Promise<void> => {
    const identifier = Object.values(conditions[0]!)[0];
    const key = `otp:${identifier}`;

    const data = await redis.get(key);
    if (!data) {
        throw new AppError("Invalid or expired OTP", 400);
    }

    const { otp: storedOtp, attempts } = JSON.parse(data);

    if (storedOtp !== otp) {
        const newAttempts = attempts + 1;

        if (newAttempts >= 5) {
            await redis.del(key);
            throw new AppError("Too many failed attempts. Please request a new OTP.", 429);
        }

        const ttl = await redis.ttl(key);

        if (ttl > 0) {
            await redis.setex(key, ttl, JSON.stringify({ otp: storedOtp, attempts: newAttempts }));
        }

        throw new AppError("Invalid OTP", 400);
    }

    await redis.del(key);
};

export const buildConditions = (params: { email?: string; phone?: string }): OtpCondition[] => {
    const conditions: OtpCondition[] = [];
    if (params.email) conditions.push({ email: params.email });
    if (params.phone) conditions.push({ phone: params.phone });
    if (conditions.length === 0) {
        throw new AppError("Email or Phone required", 400);
    }
    return conditions;
};

export const checkContactUniqueness = async (params: { email?: string; phone?: string }, excludeUserId?: string): Promise<void> => {
    if (params.email) {
        const query: QueryFilter<IUser> = { email: params.email };
        if (excludeUserId) query._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
        const exists = await User.findOne(query);
        if (exists) {
            throw new AppError("Email already in use", 400);
        }
    }
    if (params.phone) {
        const query: QueryFilter<IUser> = { phone: params.phone };
        if (excludeUserId) query._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
        const exists = await User.findOne(query);
        if (exists) {
            throw new AppError("Phone number already in use", 400);
        }
    }
};
