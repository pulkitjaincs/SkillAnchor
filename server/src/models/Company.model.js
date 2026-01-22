import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    logo: String,
    industry: {
        type: String,
        required: true,
    },
    description: String,
    size: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "200+"],
    },
    website: String,
    gstin: String,
    isVerified: {
        type: Boolean,
        default: false,
    },
    locations: [{
        city: { type: String, required: true },
        state: { type: String, required: true },
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

CompanySchema.index({ name: "text" });
CompanySchema.index({ industry: 1, isVerified: 1 });

const Company = mongoose.model("Company", CompanySchema);
export default Company;
