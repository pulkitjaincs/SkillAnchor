import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 5 * 60 * 1000), 
    },
    attempts: {
        type: Number,
        default: 0,
    },
});

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({email: 1}, {sparse: true});
OTPSchema.index({phone: 1}, {sparse: true});
const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
