import mongoose, { Document, Types } from "mongoose";

export interface IEmployerProfile extends Document {
    user: Types.ObjectId;
    name: string;
    avatar?: string;
    isAvatarHidden: boolean;
    designation?: string;
    company: Types.ObjectId;
    phone?: string;
    whatsapp?: string;
    isHiringManager: boolean;
}

const EmployerProfileSchema = new mongoose.Schema<IEmployerProfile>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    avatar: String,
    isAvatarHidden: {
        type: Boolean,
        default: false,
    },
    designation: String,
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
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

EmployerProfileSchema.index({ company: 1 });

const EmployerProfile = mongoose.model<IEmployerProfile>("EmployerProfile", EmployerProfileSchema);
export default EmployerProfile;
