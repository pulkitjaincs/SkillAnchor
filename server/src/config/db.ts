import mongoose from "mongoose";
import { env } from "./env.js";

if(!env.MONGO_URI){
    throw new Error("MONGO_URI is not defined in environment variables");
}
const connectDB = async()=>{
    try{
        await mongoose.connect(env.MONGO_URI);
        console.log("MongoDB Connected with SkillAnchorDB");
    }catch(error){
        console.log(error);
        process.exit(1);
    }
};
export default connectDB;