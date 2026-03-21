import mongoose, { Document, Types } from "mongoose";

export interface IJob extends Document {
    employer: Types.ObjectId;
    company?: Types.ObjectId;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    city: string;
    state: string;
    locality?: string;
    salaryMin: number;
    salaryMax?: number;
    salaryType: "monthly" | "daily" | "hourly";
    jobType: "full-time" | "part-time" | "contract";
    shift?: "day" | "night" | "flexible";
    experienceMin: number;
    skills: string[];
    gender: "any" | "male" | "female";
    benefits: string[];
    vacancies: number;
    status: "active" | "paused" | "closed";
    featured: boolean;
    views: number;
    applicationsCount: number;
    expiresAt?: Date;
    // Note: isExpired is a virtual — not present on .lean() results
}

const JobSchema = new mongoose.Schema<IJob>({
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
JobSchema.index({ employer: 1, createdAt: -1 });
JobSchema.index({ company: 1 });
JobSchema.index({
    title: "text",
    description: "text",
    skills: "text",
    category: "text",
    subcategory: "text",
    city: "text",
    state: "text"
});

JobSchema.virtual("isExpired").get(function (this: IJob) {
    return this.expiresAt && this.expiresAt < new Date();
});

const Job = mongoose.model<IJob>("Job", JobSchema);
export default Job;
