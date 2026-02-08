import WorkerProfile from "../models/WorkerProfile.model.js";
import EmployerProfile from "../models/EmployerProfile.model.js";
import WorkExperience from "../models/WorkExperience.model.js";
import User from "../models/User.model.js";
import { uploadToS3 } from "../config/s3.js";

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded or invalid format" });
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
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Avatar upload failed" });
    }
};

export const getMyTeam = async (req, res) => {
    try {
        const team = await WorkExperience.find({
            employer: req.user._id,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null }
            ]
        }).populate("worker", "name phone avatar email");

        res.json(team);
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ message: "Error fetching team" });
    }
};


export const getMyProfile = async (req, res) => {
    try {
        const isEmployer = req.user.role === 'employer';

        if (isEmployer) {
            const profile = await EmployerProfile.findOne({ user: req.user._id })
                .populate({ path: "company", select: "name logo industry" });

            if (!profile) {
                return res.status(200).json({
                    name: req.user.name,
                    email: req.user.email,
                    phone: req.user.phone,
                    role: 'employer',
                    emailVerified: req.user.emailVerified,
                    phoneVerified: req.user.phoneVerified
                });
            }

            const profileData = profile.toObject();
            profileData.role = 'employer';
            profileData.email = req.user.email;
            profileData.phone = req.user.phone;
            profileData.emailVerified = req.user.emailVerified;
            profileData.phoneVerified = req.user.phoneVerified;
            if (!profileData.name) profileData.name = req.user.name;

            return res.status(200).json(profileData);
        }

        const profile = await WorkerProfile.findOne({ user: req.user._id })
            .populate({ path: "workHistory", populate: { path: "company", select: "name logo" } });

        if (!profile) {
            return res.status(200).json({
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                completionPercent: 0,
                documents: {},
                role: 'worker',
                emailVerified: req.user.emailVerified,
                phoneVerified: req.user.phoneVerified
            });
        }

        const profileData = profile.toObject();
        profileData.role = 'worker';
        profileData.email = req.user.email;
        profileData.phone = req.user.phone;
        profileData.emailVerified = req.user.emailVerified;
        profileData.phoneVerified = req.user.phoneVerified;
        if (!profileData.name) profileData.name = req.user.name;

        return res.status(200).json(profileData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateMyProfile = async (req, res) => {
    try {
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

            let profile = await EmployerProfile.findOneAndUpdate(
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

        let profile = await WorkerProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email or Phone already exists" });
        }
        return res.status(500).json({ message: "Failed to update profile" });
    }
};
export const getProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await WorkerProfile.findOne({ user: userId })
            .populate({ path: "workHistory", populate: { path: "company", select: "name logo" } });
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!profile) {
            return res.status(200).json({
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified
            });
        }

        const profileData = profile.toObject();
        profileData.role = user.role;
        profileData.email = user.email;
        profileData.phone = user.phone;
        profileData.emailVerified = user.emailVerified;
        profileData.phoneVerified = user.phoneVerified;
        if (!profileData.name) profileData.name = user.name;
        return res.status(200).json(profileData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to get profile" });
    }
}