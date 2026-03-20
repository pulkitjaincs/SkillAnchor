import mongoose, { Document, Types } from "mongoose";

export interface IApplicationStatusHistory {
    status: string;
    at: Date;
    note?: string;
}

export interface IApplication extends Document {
    job: Types.ObjectId;
    applicant: Types.ObjectId;
    status: "pending" | "viewed" | "shortlisted" | "rejected" | "hired" | "employment-ended";
    coverNote?: string;
    appliedAt: Date;
    statusHistory: IApplicationStatusHistory[];
    employerNotes?: string;
}

const ApplicationSchema = new mongoose.Schema<IApplication>({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "viewed", "shortlisted", "rejected", "hired", "employment-ended"],
        default: "pending",
    },
    coverNote: {
        type: String,
        maxlength: 500,
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
    statusHistory: [{
        status: String,
        at: { type: Date, default: Date.now },
        note: String,
    }],
    employerNotes: String,
}, { timestamps: true });

ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
ApplicationSchema.index({ applicant: 1, status: 1, appliedAt: -1 });
ApplicationSchema.index({ job: 1, status: 1 });
ApplicationSchema.index({ job: 1, appliedAt: -1 });

const Application = mongoose.model<IApplication>("Application", ApplicationSchema);
export default Application;
