import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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

const User = mongoose.model("User", UserSchema);
export default User;