import mongoose from "mongoose";
import { error } from "node:console";

const mongoDB = async () => {
    try{
        await mongoose.connect(process.env.DB_URL!)
        console.log("MongoDB connected")
    } catch (error){
        console.error("DB connection error:", error)
        process.exit(1)
    }
}

export default mongoDB