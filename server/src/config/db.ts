import mongoose from "mongoose";
import { env } from "./env.js";

import { logger } from "../utils/logger.js";

if(!env.MONGO_URI){
    throw new Error("MONGO_URI is not defined in environment variables");
}
const connectDB = async()=>{
    try{
        await mongoose.connect(env.MONGO_URI);
        logger.info("MongoDB Connected with SkillAnchorDB");
    }catch(error){
        logger.error(error);
        process.exit(1);
    }
};
export default connectDB;