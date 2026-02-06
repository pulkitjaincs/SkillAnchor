import WorkerProfile from "../models/WorkerProfile.model.js";
import WorkExperience from "../models/WorkExperience.model.js";
import User from "../models/User.model.js";

export const getMyProfile = async (req, res) => {
    try {
        const profile = await WorkerProfile.findOne({ user: req.user._id })
            .populate({ path: "workHistory", populate: { path: "company", select: "name logo" } });

        if (!profile) {
            return res.status(200).json({
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                completionPercent: 0,
                documents: {}
            });
        }

        const profileData = profile.toObject();
        if (!profileData.email) profileData.email = req.user.email;
        if (!profileData.phone) profileData.phone = req.user.phone;
        if (!profileData.name) profileData.name = req.user.name;

        return res.status(200).json(profileData);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateMyProfile = async (req, res) => {
    try {
        const { name, gender, dob, phone, whatsapp, email, city, state, pincode, bio, skills, languages, expectedSalary, documents } = req.body;

        if (name && name !== req.user.name) {
            await User.findByIdAndUpdate(req.user._id, { $set: { name } });
        }

        const profileFields = {
            user: req.user._id,
            name, gender, dob, phone, whatsapp, email, city, state, pincode, bio, skills, languages, expectedSalary, documents
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