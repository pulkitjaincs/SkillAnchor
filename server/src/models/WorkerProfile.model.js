import mongoose from "mongoose";

const WorkerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    avatar: String,
    dob: Date,
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: String,
    whatsapp: String,
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: String,
    languages: {
        type: [String],
        required: true,
        validate: [arr => arr.length > 0, "At least one language required"],
    },
    skills: {
        type: [String],
        required: true,
        validate: [arr => arr.length > 0, "At least one skill required"],
    },
    workHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkExperience",
    }],
    totalExperienceYears: {
        type: Number,
        default: 0,
    },
    verifiedExperienceYears: {
        type: Number,
        default: 0,
    },
    currentlyEmployed: {
        type: Boolean,
        default: false,
    },
    expectedSalary: {
        min: Number,
        max: Number,
        type: {
            type: String,
            enum: ["monthly", "daily"],
        },
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    documents: {
        aadhaar: {
            number: String,
            verified: { type: Boolean, default: false },
        },
        pan: {
            number: String,
            verified: { type: Boolean, default: false },
        },
        license: {
            number: String,
            verified: { type: Boolean, default: false },
        },
    },
    completionPercent: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

WorkerProfileSchema.index({ city: 1, skills: 1 });
WorkerProfileSchema.index({ user: 1 });

const WorkerProfile = mongoose.model("WorkerProfile", WorkerProfileSchema);
export default WorkerProfile;
