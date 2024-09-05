import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


// Connect to MongoDB
export  const connectDB = async (req,res)=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB)
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}
