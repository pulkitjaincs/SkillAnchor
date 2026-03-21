import mongoose, { Document, Types } from "mongoose";

export interface IWorkerDocuments {
    aadhaar?: {
        number?: string;
        verified: boolean;
    };
    pan?: {
        number?: string;
        verified: boolean;
    };
    license?: {
        number?: string;
        verified: boolean;
    };
}

export interface IWorkerProfile extends Document {
    user: Types.ObjectId;
    name: string;
    avatar?: string;
    isAvatarHidden: boolean;
    dob?: Date;
    gender?: "male" | "female" | "other";
    phone?: string;
    email?: string;
    whatsapp?: string;
    city?: string;
    state?: string;
    pincode?: string;
    languages: string[];
    skills: string[];
    workHistory: Types.ObjectId[];
    totalExperienceYears: number;
    verifiedExperienceYears: number;
    currentlyEmployed: boolean;
    expectedSalary?: {
        min?: number;
        max?: number;
        type?: "monthly" | "daily";
    };
    bio?: string;
    documents?: IWorkerDocuments;
    completionPercent: number;
}

const WorkerProfileSchema = new mongoose.Schema<IWorkerProfile>({
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
    dob: Date,
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    phone: {
        type: String,
    },
    email: String,
    whatsapp: String,
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pincode: String,
    languages: {
        type: [String],
    },
    skills: {
        type: [String],
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

const WorkerProfile = mongoose.model<IWorkerProfile>("WorkerProfile", WorkerProfileSchema);
export default WorkerProfile;
