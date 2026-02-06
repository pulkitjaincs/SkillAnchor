import mongoose from "mongoose";

const WorkExperienceSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
    linkedApplication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    department: String,
    startDate: {
        type: Date,
        required: true,
    },
    endDate: Date,
    isCurrent: {
        type: Boolean,
        default: false,
    },
    salary: {
        amount: Number,
        type: {
            type: String,
            enum: ["monthly", "daily"],
        },
    },
    skills: [String],
    addedBy: {
        type: String,
        enum: ["employer", "worker"],
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verifiedAt: Date,
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        maxlength: 500,
    },
}, { timestamps: true });

WorkExperienceSchema.index({ worker: 1, isVerified: 1 });
WorkExperienceSchema.index({ company: 1 });
WorkExperienceSchema.index({ employer: 1 });

const WorkExperience = mongoose.model("WorkExperience", WorkExperienceSchema);
export default WorkExperience;
