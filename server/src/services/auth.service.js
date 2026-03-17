import crypto from "crypto";
import { redis } from "../config/redis.js";
import User from "../models/User.model.js";

/**
 * Generate a 6-digit OTP and store/upsert it for the given conditions.
 * @param {Array} conditions - Array of query conditions (e.g., [{ email }, { phone }])
 * @returns {string} The generated OTP
 */
export const generateAndStoreOTP = async (conditions) => {
    const otp = crypto.randomInt(100000, 1000000).toString();

    const identifier = Object.values(conditions[0])[0];
    const key = `otp:${identifier}`;
    await redis.setex(key, 600, JSON.stringify({ otp, attempts: 0 }));
    return otp;
};

/**
 * Verify and consume an OTP for the given conditions.
 * Throws an error if invalid or expired.
 * @param {Array} conditions - Array of query conditions
 * @param {string} otp - The OTP to verify
 */
export const verifyAndConsumeOTP = async (conditions, otp) => {
    const identifier = Object.values(conditions[0])[0];
    const key = `otp:${identifier}`;

    const data = await redis.get(key);
    if (!data) {
        const err = new Error("Invalid or expired OTP");
        err.status = 400;
        throw err;
    }

    const { otp: storedOtp, attempts } = JSON.parse(data);

    if (storedOtp !== otp) {
        const newAttempts = attempts + 1;

        if (newAttempts >= 5) {
            await redis.del(key);
            const err = new Error("Too many failed attempts. Please request a new OTP.");
            err.status = 429;
            throw err;
        }

        const ttl = await redis.ttl(key);

        if (ttl > 0) {
            await redis.setex(key, ttl, JSON.stringify({ otp: storedOtp, attempts: newAttempts }));
        }

        const err = new Error("Invalid OTP");
        err.status = 400;
        throw err;
    }


    await redis.del(key);
};


/**
 * Build query conditions from email/phone, throwing if neither provided.
 * @param {{ email?: string, phone?: string }} params
 * @returns {Array} conditions array
 */
export const buildConditions = (params) => {
    const conditions = [];
    if (params.email) conditions.push({ email: params.email });
    if (params.phone) conditions.push({ phone: params.phone });
    if (conditions.length === 0) {
        const err = new Error("Email or Phone required");
        err.status = 400;
        throw err;
    }
    return conditions;
};

/**
 * Check if an email or phone is already taken by another user.
 * @param {{ email?: string, phone?: string }} params
 * @param {string} excludeUserId - User ID to exclude from the check
 */
export const checkContactUniqueness = async (params, excludeUserId) => {
    if (params.email) {
        const exists = await User.findOne({ email: params.email, _id: { $ne: excludeUserId } });
        if (exists) {
            const err = new Error("Email already in use");
            err.status = 400;
            throw err;
        }
    }
    if (params.phone) {
        const exists = await User.findOne({ phone: params.phone, _id: { $ne: excludeUserId } });
        if (exists) {
            const err = new Error("Phone number already in use");
            err.status = 400;
            throw err;
        }
    }
};
