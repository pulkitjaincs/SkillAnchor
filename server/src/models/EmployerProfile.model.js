import mongoose from "mongoose";

const EmployerProfileSchema = new mongoose.Schema({
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
    designation: String,
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    phone: {
        type: String,
    },
    whatsapp: {
        type: String,
    },
    isHiringManager: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

EmployerProfileSchema.index({ user: 1 });
EmployerProfileSchema.index({ company: 1 });

const EmployerProfile = mongoose.model("EmployerProfile", EmployerProfileSchema);
export default EmployerProfile;
