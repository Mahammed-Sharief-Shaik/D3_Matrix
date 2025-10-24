import mongoose from "mongoose"
import Employee from "../models/Employee.js";
export default async function connectDB(DB_URL) {
    try {
        // Use mongoose.connect() with async/await
        await mongoose.connect(DB_URL);

        console.log(`MongoDB Connected successfully! Host: ${mongoose.connection.host}`);
        await Employee.insertOne({
            employeeId : "AP0000",
            password: '2i4uy4vbfl4'
        })
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message); 
    }
}
