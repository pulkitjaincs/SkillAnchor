import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    subcategory: String,
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    locality: String,
    salaryMin: {
        type: Number,
        required: true,
    },
    salaryMax: Number,
    salaryType: {
        type: String,
        enum: ["monthly", "daily", "hourly"],
        required: true,
    },
    jobType: {
        type: String,
        enum: ["full-time", "part-time", "contract"],
        required: true,
    },
    shift: {
        type: String,
        enum: ["day", "night", "flexible"],
    },
    experienceMin: {
        type: Number,
        default: 0,
    },
    skills: [String],
    gender: {
        type: String,
        enum: ["any", "male", "female"],
        default: "any",
    },
    benefits: [String],
    vacancies: {
        type: Number,
        default: 1,
    },
    status: {
        type: String,
        enum: ["active", "paused", "closed"],
        default: "active",
    },
    featured: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0,
    },
    applicationsCount: {
        type: Number,
        default: 0,
    },
    expiresAt: Date,
}, { timestamps: true });

JobSchema.index({ status: 1, category: 1, city: 1 });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ employer: 1, status: 1 });
JobSchema.index({ company: 1 });
JobSchema.index({ title: "text", description: "text" });

JobSchema.virtual("isExpired").get(function () {
    return this.expiresAt && this.expiresAt < new Date();
});

const Job = mongoose.model("Job", JobSchema);
export default Job;
