import mongoose, { Document, Types } from "mongoose";

export interface IUser extends Document {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    authType: "phone" | "email";
    role: "worker" | "employer" | "admin";
    emailVerified: boolean;
    phoneVerified: boolean;
    profile?: Types.ObjectId;
}

const UserSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
    },
    password: {
        type: String,
    },
    authType: {
        type: String,
        enum: ["phone", "email"],
        required: true,
    },
    role: {
        type: String,
        enum: ["worker", "employer", "admin"],
        required: true,
        default: "worker",
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    phoneVerified: {
        type: Boolean,
        default: false,
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "role",
    },
}, { timestamps: true });

const User = mongoose.model<IUser>("User", UserSchema);
export default User;