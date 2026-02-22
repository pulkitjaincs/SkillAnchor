import OTP from "../models/OTP.model.js";
import User from "../models/User.model.js";

/**
 * Generate a 6-digit OTP and store/upsert it for the given conditions.
 * @param {Array} conditions - Array of query conditions (e.g., [{ email }, { phone }])
 * @returns {string} The generated OTP
 */
export const generateAndStoreOTP = async (conditions) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
        { $or: conditions },
        { otp, expiresAt: Date.now() + 10 * 60 * 1000, isUsed: false },
        { upsert: true }
    );
    console.log(`OTP for ${JSON.stringify(conditions)}: ${otp}`);
    return otp;
};

/**
 * Verify and consume an OTP for the given conditions.
 * Throws an error if invalid or expired.
 * @param {Array} conditions - Array of query conditions
 * @param {string} otp - The OTP to verify
 */
export const verifyAndConsumeOTP = async (conditions, otp) => {
    const record = await OTP.findOne({ $or: conditions, otp });
    if (!record || record.expiresAt < Date.now()) {
        const err = new Error("Invalid or expired OTP");
        err.status = 400;
        throw err;
    }
    await OTP.deleteOne({ _id: record._id });
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
