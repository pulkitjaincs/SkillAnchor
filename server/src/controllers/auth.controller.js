import User from "../models/User.model.js";
import OTP from "../models/OTP.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const sendOTP = async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate({ phone }, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }, { upsert: true });
    console.log(`OTP for ${phone}: ${otp}`);
    res.status(200).json({ message: "OTP Sent" });
};

export const verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;
    const record = await OTP.findOne({ phone, otp, isUsed: false });
    if (!record || record.expiresAt < Date.now()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
    }    
    await OTP.deleteOne({_id: record._id});
    let user = await User.findOne({ phone });
    if (!user) {
        user = await User.create({ phone, authType: "phone", role: req.body.role });
    }
    user.isVerified = true;
    await user.save();
    res.json({ token: generateToken(user._id), user });

};

export const register = async (req, res) => {
    const { email, password, role = "employer" } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
        return res.status(400).json({ error: "Email already exists!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        email,
        password: hashedPassword,
        authType: "email",
        role
    });
    res.status(201).json({ token: generateToken(user._id), user });
};

export const login = async (req, res) => {
    const { email, phone, password } = req.body;
    const user = await User.findOne({
        $or: [
            { email: email },
            { phone: phone }
        ]
    });

    if (!user) {
        return res.status(400).json({ error: "Inavlid Credentials" });
    }

    if (!user.password) {
        return res.status(400).json({ error: "Please login with OTP" });
    }

    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
        return res.status(400).json({ error: "Invalid Credentials" });
    }
    
    res.json({ token: generateToken(user._id), user });
};