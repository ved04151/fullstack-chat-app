import mongoose from "mongoose";

export const connectDB = async () => {
    try {
      const conn =   await mongoose.connect(process.env.MONGO_CONN);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch(err) {
        console.log("MongoDB connection error: ",err);
    }
}