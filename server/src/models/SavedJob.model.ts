import mongoose, { Document, Types } from "mongoose";

export interface ISavedJob extends Document {
    user: Types.ObjectId;
    job: Types.ObjectId;
    savedAt: Date;
}

const SavedJobSchema = new mongoose.Schema<ISavedJob>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    savedAt: {
        type: Date,
        default: Date.now,
    },
});

SavedJobSchema.index({ user: 1, job: 1 }, { unique: true });
SavedJobSchema.index({ user: 1, savedAt: -1 });

const SavedJob = mongoose.model<ISavedJob>("SavedJob", SavedJobSchema);
export default SavedJob;
