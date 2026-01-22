import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
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
        enum: ["pending", "viewed", "shortlisted", "rejected", "hired"],
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

const Application = mongoose.model("Application", ApplicationSchema);
export default Application;
