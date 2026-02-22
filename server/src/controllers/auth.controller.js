import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    generateAndStoreOTP,
    verifyAndConsumeOTP,
    buildConditions,
    checkContactUniqueness
} from "../services/auth.service.js";

export const sendOTP = asyncHandler(async (req, res) => {
    const { phone, email } = req.body;
    const conditions = buildConditions({ email, phone });
    await generateAndStoreOTP(conditions);
    res.status(200).json({ message: "OTP Sent" });
});

export const verifyOTP = asyncHandler(async (req, res) => {
    const { phone, name, otp, role, email } = req.body;
    const conditions = buildConditions({ email, phone });
    await verifyAndConsumeOTP(conditions, otp);

    let user = await User.findOne({ phone });
    if (!user) {
        user = await User.create({ phone, name, authType: "phone", role, phoneVerified: true });
    } else {
        user.phoneVerified = true;
        await user.save();
    }

    const safeUser = await User.findById(user._id).select("-password -__v").lean();
    res.json({ token: generateToken(user._id), user: safeUser });
});

export const register = asyncHandler(async (req, res) => {
    const { email, password, role, name } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
        const err = new Error("Email already exists!");
        err.status = 400;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
        email, password: hashedPassword, authType: "email", role, name, emailVerified: true
    });

    const safeUser = await User.findById(user._id).select("-password -__v").lean();
    res.status(201).json({ token: generateToken(user._id), user: safeUser });
});

export const login = asyncHandler(async (req, res) => {
    const { email, phone, password } = req.body;
    const conditions = buildConditions({ email, phone });
    const user = await User.findOne({ $or: conditions });

    if (!user) {
        const err = new Error("Invalid Credentials");
        err.status = 400;
        throw err;
    }
    if (!user.password) {
        const err = new Error("Please login with OTP");
        err.status = 400;
        throw err;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        const err = new Error("Invalid Credentials");
        err.status = 400;
        throw err;
    }

    const safeUser = await User.findById(user._id).select("-password -__v").lean();
    res.json({ token: generateToken(user._id), user: safeUser });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email, phone } = req.body;
    const conditions = buildConditions({ email, phone });

    const user = await User.findOne({ $or: conditions });
    if (!user) {
        const err = new Error("User not exist");
        err.status = 400;
        throw err;
    }

    await generateAndStoreOTP(conditions);
    res.status(200).json({ message: "OTP Sent" });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, phone, otp, newPassword } = req.body;
    const conditions = buildConditions({ email, phone });
    await verifyAndConsumeOTP(conditions, otp);

    const user = await User.findOne({ $or: conditions });
    if (!user) {
        const err = new Error("User not exist");
        err.status = 400;
        throw err;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successfully" });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.password) {
        const err = new Error("You are logged in via OTP. Set a password via Forgot Password flow if needed.");
        err.status = 400;
        throw err;
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
        const err = new Error("Incorrect current password");
        err.status = 400;
        throw err;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password updated successfully" });
});

export const sendUpdateOTP = asyncHandler(async (req, res) => {
    const { email, phone } = req.body;
    const conditions = buildConditions({ email, phone });
    await checkContactUniqueness({ email, phone }, req.user._id);
    await generateAndStoreOTP(conditions);
    res.status(200).json({ message: "OTP Sent" });
});

export const verifyUpdateOTP = asyncHandler(async (req, res) => {
    const { email, phone, otp } = req.body;
    const conditions = buildConditions({ email, phone });
    await verifyAndConsumeOTP(conditions, otp);

    const updates = {};
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updates,
            ...(email ? { emailVerified: true } : {}),
            ...(phone ? { phoneVerified: true } : {})
        },
        { new: true }
    ).select("-password -__v");

    res.json({ message: "Account updated successfully", user });
});
