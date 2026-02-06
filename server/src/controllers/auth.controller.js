import User from "../models/User.model.js";
import OTP from "../models/OTP.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const sendOTP = async (req, res) => {
    try {
        const { phone, email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const conditions = [];
        if (email) conditions.push({ email });
        if (phone) conditions.push({ phone });
        if (conditions.length === 0) {
            return res.status(400).json({ error: "Email or Phone required" });
        }
        await OTP.findOneAndUpdate({ $or: conditions }, { otp, expiresAt: Date.now() + 10 * 60 * 1000, isUsed: false }, { upsert: true });
        console.log(`OTP for ${phone ? phone : email}: ${otp}`);
        res.status(200).json({ message: "OTP Sent" });
    } catch (err) {
        console.error("Send OTP Error: ", err);
        res.status(500).json({ error: "Send OTP failed" });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { phone, name, otp, role, email } = req.body;
        const conditions = [];
        if (email) conditions.push({ email });
        if (phone) conditions.push({ phone });
        if (conditions.length === 0) {
            return res.status(400).json({ error: "Email or Phone required" });
        }
        const record = await OTP.findOne({ $or: conditions, otp });
        if (!record || record.expiresAt < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
        await OTP.deleteOne({ _id: record._id });
        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({ phone, name, authType: "phone", role });
        }
        user.isVerified = true;
        await user.save();
        const safeUser = user.toObject();
        delete safeUser.password;
        delete safeUser.__v;
        res.json({ token: generateToken(user._id), user: safeUser });
    } catch (err) {
        console.error("Verify OTP error: ", err);
        res.status(500).json({ error: "Verify OTP failed" });
    }
};

export const register = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: "Email already exists!" });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            email,
            password: hashedPassword,
            authType: "email",
            role,
            name,
            isVerified: true
        });
        const safeUser = user.toObject();
        delete safeUser.password;
        delete safeUser.__v;
        res.status(201).json({ token: generateToken(user._id), user: safeUser });
    } catch (err) {
        console.error("Register error: ", err);
        res.status(500).json({ error: "Register failed" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        const conditions = [];
        if (email) conditions.push({ email });
        if (phone) conditions.push({ phone });

        if (conditions.length === 0) {
            return res.status(400).json({ error: "Email or phone required" });
        }

        const user = await User.findOne({ $or: conditions });


        if (!user) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }

        if (!user.password) {
            return res.status(400).json({ error: "Please login with OTP" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }

        const safeUser = user.toObject();
        delete safeUser.password;
        delete safeUser.__v;
        res.json({ token: generateToken(user._id), user: safeUser });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;
        const conditions = [];
        if (email) { conditions.push({ email }) };
        if (phone) { conditions.push({ phone }) };
        if (conditions.length === 0) {
            return res.status(400).json({ error: "Email or Phone required" });
        }

        const user = await User.findOne({ $or: conditions });
        if (!user) {
            return res.status(400).json({ error: "User not exist" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.findOneAndUpdate({ $or: conditions }, { otp, expiresAt: Date.now() + 10 * 60 * 1000, isUsed: false }, { upsert: true });
        console.log(`OTP for ${phone ? phone : email}: ${otp}`);
        res.status(200).json({ message: "OTP Sent" });
    } catch (err) {
        console.error("Send OTP Error: ", err);
        res.status(500).json({ error: "Send OTP failed" });
    }
}
export const resetPassword = async (req, res) => {
    try {
        const { email, phone, otp, newPassword } = req.body;
        const conditions = [];
        if (email) { conditions.push({ email }) };
        if (phone) { conditions.push({ phone }) };
        if (conditions.length === 0) {
            return res.status(400).json({ error: "Email or Phone required" });
        }
        const record = await OTP.findOne({ $or: conditions, otp });
        if (!record || record.expiresAt < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
        await OTP.deleteOne({ _id: record._id });
        const user = await User.findOne({ $or: conditions });
        if (!user) {
            return res.status(400).json({ error: "User not exist" });
        }
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error: ", error);
        res.status(500).json({ error: "Reset Password failed" });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.json({ message: "Logout successfully" });
    } catch (error) {
        console.error("Logout Error: ", error);
        res.status(500).json({ error: "Logout failed" });
    }
}

