import mongoose from "mongoose";

const SavedJobSchema = new mongoose.Schema({
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

const SavedJob = mongoose.model("SavedJob", SavedJobSchema);
export default SavedJob;
