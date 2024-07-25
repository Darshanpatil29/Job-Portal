import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    const uri = `${process.env.MONGODB_URL}/${DB_NAME}`;
    try {
        const connectionInstance = await mongoose.connect(uri);
        console.log(`\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
};

export default connectDB;
